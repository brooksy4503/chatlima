import type { UIMessage, LanguageModelResponseMetadata } from 'ai';
import { saveChat, saveMessages, convertToDBMessages } from '@/lib/chat-store';
import { db } from '@/lib/db';
import { messages as messagesTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import {
  buildAssistantMessageForPersistence,
  countPersistableDisplayParts,
  createStreamFinishGate,
  processMessagesForPersistence,
} from '@/lib/chat-message-persistence';
import {
  extractGeneratedImageUrlsFromStreamEvent,
} from '@/lib/message-utils';
import { ChatWebSearchService } from '@/lib/services/chatWebSearchService';
import { ChatImageGenerationService } from '@/lib/services/chatImageGenerationService';
import { ChatTokenTrackingService } from '@/lib/services/chatTokenTrackingService';
import { WEB_SEARCH_COST } from '@/lib/tokenCounter';
import { hasProviderByokForModel } from '@/lib/services/accessGateService';
import type { AuthenticatedUser } from '@/lib/services/chatAuthenticationService';
import type { ModelValidationResult } from '@/lib/services/chatModelValidationService';
import type { WebSearchResult } from '@/lib/services/chatWebSearchService';
import type { ChatStreamPlan } from '@/lib/chat/buildChatStreamPlan';
import {
  computeStreamTokenUsage,
  computeTokensPerSecond,
  estimateTimeToFirstTokenMs,
} from '@/lib/chat/streamTokenUsage';
import { logDiagnostic } from '@/lib/utils/performantLogging';

export interface OpenRouterStreamResponse extends LanguageModelResponseMetadata {
  readonly messages: Array<
    UIMessage | { role: string; content?: string | unknown[]; parts?: unknown[]; id?: string }
  >;
  annotations?: Array<{ type: string; url_citation: unknown }>;
  body?: unknown;
}

export interface ChatStreamFinalizerParams {
  chatId: string;
  requestId: string;
  requestStartTime: number;
  clientMessages: UIMessage[];
  authenticatedUser: AuthenticatedUser;
  selectedModel: string;
  apiKeys: Record<string, string>;
  isAnonymous: boolean;
  plan: ChatStreamPlan;
  modelValidation: ModelValidationResult;
  titleGenerationPromise?: Promise<string>;
  getRemainingCreditsByExternalId: (userId: string) => Promise<number | null>;
}

const UI_FINISH_WAIT_MS = 6000;
const UI_FINISH_POLL_MS = 200;

export function createChatStreamFinalizer(params: ChatStreamFinalizerParams) {
  const {
    chatId,
    requestId,
    requestStartTime,
    clientMessages,
    authenticatedUser,
    selectedModel,
    apiKeys,
    plan,
    modelValidation,
    titleGenerationPromise,
    getRemainingCreditsByExternalId,
  } = params;

  const streamFinishGate = createStreamFinishGate();

  const state = {
    tokenUsageData: null as { inputTokens: number; outputTokens: number } | null,
    messagesSavedSuccessfully: false,
    savedAssistantPartCount: 0,
    finalAssistantMessageId: nanoid(),
    uiResponseMessage: null as UIMessage | null,
    streamFinishEvent: null as Record<string, unknown> | null,
    streamFinishResponse: null as OpenRouterStreamResponse | null,
    uiFinishResolved: false,
  };

  let persistInFlight: Promise<void> = Promise.resolve();
  let timeToFirstTokenMs: number | null = null;
  let streamingStartTime: Date | null = null;
  let tokensPerSecond: number | null = null;

  const persistAssistantMessages = async (
    source: 'ui' | 'stream',
    responseMessage?: UIMessage
  ) => {
    const runPersist = async () => {
      const uiMsg = responseMessage ?? state.uiResponseMessage;
      const event = state.streamFinishEvent;
      const response = state.streamFinishResponse;

      if (!uiMsg?.parts?.length && !(event?.text as string | undefined)) {
        return;
      }

      try {
        const trailingAssistant = clientMessages[clientMessages.length - 1];
        const historyMessages =
          trailingAssistant?.role === 'assistant'
            ? clientMessages.slice(0, -1)
            : clientMessages;

        const responseAssistantId = response?.messages
          ?.filter((m) => m.role === 'assistant')
          .pop()?.id as string | undefined;

        const assistantMessage = buildAssistantMessageForPersistence({
          clientMessages,
          uiResponseMessage: uiMsg ?? null,
          streamText: (event?.text as string) || '',
          reasoningText: event?.reasoningText as string | undefined,
          responseAssistantId,
        });

        if (state.messagesSavedSuccessfully) {
          const newCount = countPersistableDisplayParts(assistantMessage.parts);
          if (newCount <= state.savedAssistantPartCount) {
            return;
          }
        }

        const webSearchInvocationCount = event
          ? ChatWebSearchService.resolveWebSearchInvocationCount({
              steps: event.steps as Parameters<
                typeof ChatWebSearchService.resolveWebSearchInvocationCount
              >[0]['steps'],
              usage: event.usage as Parameters<
                typeof ChatWebSearchService.resolveWebSearchInvocationCount
              >[0]['usage'],
            })
          : 0;
        const webSearchWasUsed = event
          ? ChatWebSearchService.messageUsedWebSearch({
              steps: event.steps as Parameters<
                typeof ChatWebSearchService.messageUsedWebSearch
              >[0]['steps'],
              usage: event.usage as Parameters<
                typeof ChatWebSearchService.messageUsedWebSearch
              >[0]['usage'],
              hasCitationAnnotations: (response?.annotations?.length || 0) > 0,
            })
          : false;

        const imageUrlsFromStream = extractGeneratedImageUrlsFromStreamEvent(
          event,
          response
        );
        const imageGenerationWasUsed =
          plan.imageGenerationConfig.enabled &&
          (ChatImageGenerationService.countImageGenerationInvocations(
            event?.steps as Parameters<
              typeof ChatImageGenerationService.countImageGenerationInvocations
            >[0]
          ) > 0 ||
            imageUrlsFromStream.length > 0);

        const processedMessages = processMessagesForPersistence({
          historyMessages,
          assistantMessage,
          annotations: response?.annotations as Parameters<
            typeof processMessagesForPersistence
          >[0]['annotations'],
          webSearch: {
            useAgenticServerTools: plan.webSearchConfig.useAgenticServerTools,
            enabled: plan.effectiveWebSearchEnabled,
            wasUsed: webSearchWasUsed,
            invocationCount: webSearchInvocationCount,
          },
          imageGeneration: plan.imageGenerationConfig.enabled
            ? {
                enabled: true,
                wasUsed: imageGenerationWasUsed,
                imageUrls: imageUrlsFromStream,
              }
            : undefined,
        });

        const processedAssistant = processedMessages.find((m) => m.role === 'assistant');
        if (processedAssistant && source === 'ui') {
          state.uiResponseMessage = processedAssistant;
        }

        const logTag = source === 'ui' ? 'uiOnFinish' : 'onFinish';

        const dbMessages = (
          convertToDBMessages(processedMessages as UIMessage[], chatId) as Array<{
            id?: string;
            role: string;
            [key: string]: unknown;
          }>
        ).map((msg) => ({
          ...msg,
          hasWebSearch:
            plan.effectiveWebSearchEnabled &&
            msg.role === 'assistant' &&
            (plan.webSearchConfig.useAgenticServerTools
              ? webSearchWasUsed
              : (response?.annotations?.length || 0) > 0),
          webSearchContextSize: plan.webSearchConfig.enabled
            ? plan.webSearchConfig.contextSize
            : undefined,
        }));

        const savedAssistant = dbMessages.find((msg) => msg.role === 'assistant');
        state.finalAssistantMessageId =
          savedAssistant?.id ||
          (response?.messages
            ?.filter((m) => m.role === 'assistant')
            .pop()?.id as string) ||
          state.finalAssistantMessageId;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await saveMessages({ messages: dbMessages as any });
        state.messagesSavedSuccessfully = true;
        state.savedAssistantPartCount = countPersistableDisplayParts(
          processedAssistant?.parts ?? assistantMessage.parts
        );
        console.log(`[Chat ${chatId}][${logTag}] Successfully saved messages.`);

        await saveChat({
          id: chatId,
          userId: authenticatedUser.userId,
          messages: processedMessages as Parameters<typeof saveChat>[0]['messages'],
          selectedModel,
          apiKeys,
          isAnonymous: authenticatedUser.isAnonymous,
          titleGenerationPromise,
        });
      } catch (persistError) {
        const logTag = source === 'ui' ? 'uiOnFinish' : 'onFinish';
        console.error(`[Chat ${chatId}][${logTag}] Failed to persist messages:`, persistError);
      }
    };

    persistInFlight = persistInFlight.then(runPersist, runPersist);
    await persistInFlight;
  };

  const waitForUiFinish = (): Promise<void> => {
    if (state.uiFinishResolved) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const deadline = Date.now() + UI_FINISH_WAIT_MS;
      const tick = () => {
        if (state.uiFinishResolved || state.uiResponseMessage) {
          resolve();
          return;
        }
        if (Date.now() >= deadline) {
          resolve();
          return;
        }
        setTimeout(tick, UI_FINISH_POLL_MS);
      };
      tick();
    });
  };

  const trackTokenUsage = async (
    event: Record<string, unknown>,
    response: OpenRouterStreamResponse
  ) => {
    const isUsingOwnApiKeys = hasProviderByokForModel(selectedModel, apiKeys);
    let actualCredits: number | null = null;

    if (!authenticatedUser.isAnonymous && authenticatedUser.userId) {
      try {
        actualCredits = await getRemainingCreditsByExternalId(authenticatedUser.userId);
      } catch (error) {
        logDiagnostic('TOKEN_TRACKING_WARNING', 'Error getting credits in stream finish', {
          requestId,
          userId: authenticatedUser.userId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const isFreeModel = selectedModel.endsWith(':free');
    const shouldDeductCredits =
      !authenticatedUser.isAnonymous &&
      !isUsingOwnApiKeys &&
      !isFreeModel &&
      actualCredits !== null &&
      actualCredits > 0;

    let additionalCost = 0;
    if (shouldDeductCredits) {
      additionalCost =
        ChatWebSearchService.computeWebSearchCreditCost({
          webSearchEnabled: plan.webSearchConfig.enabled,
          useAgenticServerTools: plan.webSearchConfig.useAgenticServerTools,
          isUsingOwnApiKeys,
          shouldDeductCredits,
          steps: event.steps as Parameters<
            typeof ChatWebSearchService.computeWebSearchCreditCost
          >[0]['steps'],
          usage: event.usage as Parameters<
            typeof ChatWebSearchService.computeWebSearchCreditCost
          >[0]['usage'],
          hasCitationAnnotations: (response.annotations?.length || 0) > 0,
        }) +
        ChatImageGenerationService.computeImageGenerationCreditCost({
          imageGenerationEnabled: plan.imageGenerationConfig.enabled,
          isUsingOwnApiKeys,
          shouldDeductCredits,
          model: plan.imageGenerationConfig.model,
          steps: event.steps as Parameters<
            typeof ChatImageGenerationService.computeImageGenerationCreditCost
          >[0]['steps'],
        });
    }

    if (!state.tokenUsageData) {
      state.tokenUsageData = computeStreamTokenUsage({
        event: event as Parameters<typeof computeStreamTokenUsage>[0]['event'],
        response: response as Parameters<typeof computeStreamTokenUsage>[0]['response'],
        modelMessagesFinal: plan.modelMessagesFinal,
        effectiveSystemInstruction: plan.effectiveSystemInstruction,
        requestId,
      });
    }

    await ChatTokenTrackingService.processTokenTracking(
      {
        userId: authenticatedUser.userId,
        chatId,
        messageId: undefined,
        selectedModel,
        provider: selectedModel.split('/')[0],
        polarCustomerId: authenticatedUser.polarCustomerId,
        isAnonymous: authenticatedUser.isAnonymous,
        isUsingOwnApiKeys,
        shouldDeductCredits,
        webSearchEnabled: plan.webSearchConfig.enabled,
        webSearchCost: WEB_SEARCH_COST,
        additionalCost,
        apiKeys,
        modelInfo: modelValidation.modelInfo ?? undefined,
      },
      response,
      event,
      requestStartTime,
      timeToFirstTokenMs ?? undefined,
      streamingStartTime ?? undefined
    );
  };

  const finalizeAfterStream = async () => {
    if (!state.streamFinishEvent || !state.streamFinishResponse) {
      return;
    }

    await Promise.race([
      waitForUiFinish(),
      streamFinishGate.readyPromise.then(() => undefined),
    ]);

    if (state.messagesSavedSuccessfully) {
      if (state.uiResponseMessage) {
        await persistAssistantMessages('stream', state.uiResponseMessage);
      }
      return;
    }

    await persistAssistantMessages('stream', state.uiResponseMessage ?? undefined);
  };

  return {
    streamFinishGate,
    recordFirstToken() {
      if (timeToFirstTokenMs === null) {
        const now = Date.now();
        timeToFirstTokenMs = now - requestStartTime;
        if (streamingStartTime === null) {
          streamingStartTime = new Date();
        }
      }
    },
    getTimingMetrics: () => ({
      timeToFirstTokenMs,
      streamingStartTime,
      tokensPerSecond,
    }),
    async handleUiStreamFinish(responseMessage: UIMessage) {
      state.uiResponseMessage = responseMessage;
      state.uiFinishResolved = true;
      await persistAssistantMessages('ui', responseMessage);
    },
    handleStreamTextFinish(event: Record<string, unknown>, response: OpenRouterStreamResponse) {
      state.streamFinishEvent = event;
      state.streamFinishResponse = response;
      streamFinishGate.notify(event, response);

      state.finalAssistantMessageId =
        (response.messages?.filter((m) => m.role === 'assistant').pop()?.id as string) ||
        state.finalAssistantMessageId;
    },
    async processStreamFinish(event: Record<string, unknown>, response: OpenRouterStreamResponse) {
      if (!response?.messages) {
        console.error(`[Chat ${chatId}][onFinish] Invalid response structure:`, response);
        return;
      }

      state.streamFinishEvent = event;
      state.streamFinishResponse = response;
      streamFinishGate.notify(event, response);

      state.finalAssistantMessageId =
        (response.messages?.filter((m) => m.role === 'assistant').pop()?.id as string) ||
        state.finalAssistantMessageId;

      timeToFirstTokenMs = estimateTimeToFirstTokenMs({
        timeToFirstTokenMs,
        eventDurationMs: event.durationMs as number | undefined,
        requestStartTime,
      });

      state.tokenUsageData = computeStreamTokenUsage({
        event: event as Parameters<typeof computeStreamTokenUsage>[0]['event'],
        response: response as Parameters<typeof computeStreamTokenUsage>[0]['response'],
        modelMessagesFinal: plan.modelMessagesFinal,
        effectiveSystemInstruction: plan.effectiveSystemInstruction,
        requestId,
      });

      tokensPerSecond = computeTokensPerSecond({
        timeToFirstTokenMs,
        outputTokens: state.tokenUsageData.outputTokens,
        requestStartTime,
      });

      void (async () => {
        try {
          await finalizeAfterStream();
        } catch (persistError) {
          console.error(`[Chat ${chatId}][onFinish] Failed stream persistence:`, persistError);
        }
        try {
          await trackTokenUsage(event, response);
        } catch (tokenError) {
          console.error(`[Chat ${chatId}][onFinish] Failed token tracking:`, tokenError);
        }
      })();
    },
  };
}
