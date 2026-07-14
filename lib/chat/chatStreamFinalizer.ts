import { after } from 'next/server';
import type { UIMessage, LanguageModelResponseMetadata } from 'ai';
import { saveChat, saveMessages, convertToDBMessagesWithParents } from '@/lib/chat-store';
import { db } from '@/lib/db';
import { messages as messagesTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import {
  buildAssistantMessageForPersistence,
  countPersistableDisplayParts,
  getLatestAssistantMessage,
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
  resolveStreamTokenUsage,
  type TokenUsageSnapshot,
  computeTokensPerSecond,
  estimateTimeToFirstTokenMs,
} from '@/lib/chat/streamTokenUsage';
import { logDiagnostic } from '@/lib/utils/performantLogging';
import { isOpenRouterFreeModel } from '@/lib/utils/creditCostCalculator';
import { buildModelSnapshot } from '@/lib/chat/modelSnapshot';

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

/** Persist client-side history (excluding in-flight assistant placeholder) before streaming. */
export async function persistClientMessagesAtRequestStart(params: {
  chatId: string;
  clientMessages: UIMessage[];
  selectedModel?: string;
  modelDisplayName?: string | null;
}): Promise<void> {
  const { chatId, clientMessages, selectedModel, modelDisplayName } = params;
  const trailingAssistant = clientMessages[clientMessages.length - 1];
  const historyMessages =
    trailingAssistant?.role === 'assistant'
      ? clientMessages.slice(0, -1)
      : clientMessages;

  if (historyMessages.length === 0) {
    return;
  }

  const modelSnapshot = selectedModel
    ? buildModelSnapshot({ selectedModel, modelDisplayName })
    : null;

  const stampedHistory = historyMessages.map((msg) => {
    if (!modelSnapshot) return msg;
    if (msg.role === 'user' || msg.role === 'assistant') {
      return {
        ...msg,
        modelId: modelSnapshot.modelId,
        modelProvider: modelSnapshot.modelProvider,
        modelDisplayName: modelSnapshot.modelDisplayName,
      };
    }
    return msg;
  });

  const dbMessages = convertToDBMessagesWithParents(stampedHistory, chatId);
  const explicitLeafId =
    trailingAssistant?.role === 'assistant' ? trailingAssistant.id : undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await saveMessages({ messages: dbMessages as any, activeLeafMessageId: explicitLeafId });
  console.log(
    `[Chat ${chatId}][requestStart] Saved ${dbMessages.length} client message(s) before stream.`
  );
}

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

  const modelSnapshot = buildModelSnapshot({
    selectedModel,
    modelDisplayName: modelValidation.modelInfo?.name,
  });

  const state = {
    tokenUsageData: null as TokenUsageSnapshot | null,
    messagesSavedSuccessfully: false,
    savedAssistantPartCount: 0,
    finalAssistantMessageId: nanoid(),
    uiResponseMessage: null as UIMessage | null,
    streamFinishEvent: null as Record<string, unknown> | null,
    streamFinishResponse: null as OpenRouterStreamResponse | null,
    /** Resolved once per stream for persist + billing (includes OR generation fallback). */
    webSearchInvocationCount: null as number | null,
  };

  let persistInFlight: Promise<void> = Promise.resolve();
  let timeToFirstTokenMs: number | null = null;
  let streamingStartTime: Date | null = null;
  let tokensPerSecond: number | null = null;

  const resolveWebSearchInvocationCount = async (opts?: {
    enableOpenRouterFallback?: boolean;
  }): Promise<number> => {
    if (state.webSearchInvocationCount !== null) {
      return state.webSearchInvocationCount;
    }

    const event = state.streamFinishEvent;
    const response = state.streamFinishResponse;
    if (!event) {
      return 0;
    }

    const isUsingOwnApiKeys = hasProviderByokForModel(selectedModel, apiKeys);
    const count = await ChatWebSearchService.resolveWebSearchInvocationCountWithFallback({
      steps: event.steps as Parameters<
        typeof ChatWebSearchService.resolveWebSearchInvocationCountWithFallback
      >[0]['steps'],
      toolCalls: event.toolCalls as Parameters<
        typeof ChatWebSearchService.resolveWebSearchInvocationCountWithFallback
      >[0]['toolCalls'],
      parts: state.uiResponseMessage?.parts,
      usage: event.usage as Parameters<
        typeof ChatWebSearchService.resolveWebSearchInvocationCountWithFallback
      >[0]['usage'],
      response,
      apiKeyOverride: apiKeys?.OPENROUTER_API_KEY,
      enableOpenRouterFallback:
        opts?.enableOpenRouterFallback === true &&
        plan.webSearchConfig.enabled &&
        plan.webSearchConfig.useAgenticServerTools &&
        !isUsingOwnApiKeys,
    });

    state.webSearchInvocationCount = count;
    return count;
  };

  const persistAssistantMessages = async (
    source: 'ui' | 'stream',
    responseMessage?: UIMessage
  ) => {
    const runPersist = async () => {
      const uiMsg = responseMessage ?? state.uiResponseMessage;
      const event = state.streamFinishEvent;
      const response = state.streamFinishResponse;

      const imageUrlsFromStreamPreview = event
        ? extractGeneratedImageUrlsFromStreamEvent(event, response)
        : [];
      const canPersistFromStreamImages =
        plan.imageGenerationConfig.enabled && imageUrlsFromStreamPreview.length > 0;

      if (
        !uiMsg?.parts?.length &&
        !(event?.text as string | undefined) &&
        !canPersistFromStreamImages
      ) {
        console.warn(
          `[Chat ${chatId}][${source === 'ui' ? 'uiOnFinish' : 'onFinish'}] Skipping persist: no UI parts, stream text, or image URLs yet`
        );
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
          ? await resolveWebSearchInvocationCount({ enableOpenRouterFallback: true })
          : 0;
        const webSearchWasUsed = event
          ? ChatWebSearchService.messageUsedWebSearch({
              invocationCount: webSearchInvocationCount,
              parts: uiMsg?.parts ?? state.uiResponseMessage?.parts,
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
        }).map((msg) => {
          if (msg.role === 'user' || msg.role === 'assistant') {
            return {
              ...msg,
              modelId: modelSnapshot.modelId,
              modelProvider: modelSnapshot.modelProvider,
              modelDisplayName: modelSnapshot.modelDisplayName,
            };
          }
          return msg;
        });

        const processedAssistant = getLatestAssistantMessage(processedMessages);
        if (processedAssistant && source === 'ui') {
          state.uiResponseMessage = processedAssistant;
        }

        const logTag = source === 'ui' ? 'uiOnFinish' : 'onFinish';

        console.log(`[Chat ${chatId}][${logTag}] Persisting assistant parts:`, {
          partTypes: processedAssistant?.parts?.map((p) => p.type) ?? [],
          partCount: processedAssistant?.parts?.length ?? 0,
        });

        const dbMessages = (
          convertToDBMessagesWithParents(processedMessages as UIMessage[], chatId) as Array<{
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

        const savedAssistant = getLatestAssistantMessage(dbMessages);
        state.finalAssistantMessageId =
          savedAssistant?.id ||
          (response?.messages
            ?.filter((m) => m.role === 'assistant')
            .pop()?.id as string) ||
          state.finalAssistantMessageId;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await saveMessages({
          messages: dbMessages as any,
        });
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

    const isFreeModel = isOpenRouterFreeModel(selectedModel);
    const shouldDeductCredits =
      !authenticatedUser.isAnonymous &&
      !isUsingOwnApiKeys &&
      !isFreeModel &&
      actualCredits !== null &&
      actualCredits > 0;

    let additionalCost = 0;
    if (shouldDeductCredits) {
      const webSearchInvocationCount = await resolveWebSearchInvocationCount({
        enableOpenRouterFallback: true,
      });
      additionalCost =
        ChatWebSearchService.computeWebSearchCreditCost({
          webSearchEnabled: plan.webSearchConfig.enabled,
          useAgenticServerTools: plan.webSearchConfig.useAgenticServerTools,
          isUsingOwnApiKeys,
          shouldDeductCredits,
          invocationCount: webSearchInvocationCount,
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
      state.tokenUsageData = resolveStreamTokenUsage({
        event: event as Parameters<typeof resolveStreamTokenUsage>[0]['event'],
        response: response as Parameters<typeof resolveStreamTokenUsage>[0]['response'],
        modelMessagesFinal: plan.modelMessagesFinal,
        effectiveSystemInstruction: plan.effectiveSystemInstruction,
        requestId,
      });
    }

    await ChatTokenTrackingService.processTokenTracking(
      {
        userId: authenticatedUser.userId,
        chatId,
        messageId: state.finalAssistantMessageId,
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
      state.tokenUsageData,
      response,
      requestStartTime,
      timeToFirstTokenMs ?? undefined,
      streamingStartTime ?? undefined
    );
  };

  const finalizeAfterStream = async () => {
    if (!state.streamFinishEvent || !state.streamFinishResponse) {
      return;
    }

    // UI onFinish usually follows with tool/image parts; wait like main branch (do not
    // race streamFinishGate — it resolves on streamText onFinish and skips this wait).
    for (let i = 0; i < UI_FINISH_WAIT_MS / UI_FINISH_POLL_MS && !state.uiResponseMessage; i++) {
      await new Promise((resolve) => setTimeout(resolve, UI_FINISH_POLL_MS));
    }

    if (state.messagesSavedSuccessfully) {
      if (state.uiResponseMessage) {
        await persistAssistantMessages('stream', state.uiResponseMessage);
      }
      return;
    }

    await persistAssistantMessages('stream', state.uiResponseMessage ?? undefined);
  };

  return {
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

      // streamText onFinish often arrives after UI onFinish for image/tool flows.
      for (
        let i = 0;
        i < UI_FINISH_WAIT_MS / UI_FINISH_POLL_MS && !state.streamFinishEvent;
        i++
      ) {
        await new Promise((resolve) => setTimeout(resolve, UI_FINISH_POLL_MS));
      }

      await persistAssistantMessages('ui', responseMessage);
    },
    handleStreamTextFinish(event: Record<string, unknown>, response: OpenRouterStreamResponse) {
      state.streamFinishEvent = event;
      state.streamFinishResponse = response;

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

      state.finalAssistantMessageId =
        (response.messages?.filter((m) => m.role === 'assistant').pop()?.id as string) ||
        state.finalAssistantMessageId;

      timeToFirstTokenMs = estimateTimeToFirstTokenMs({
        timeToFirstTokenMs,
        eventDurationMs: event.durationMs as number | undefined,
        requestStartTime,
      });

      state.tokenUsageData = resolveStreamTokenUsage({
        event: event as Parameters<typeof resolveStreamTokenUsage>[0]['event'],
        response: response as Parameters<typeof resolveStreamTokenUsage>[0]['response'],
        modelMessagesFinal: plan.modelMessagesFinal,
        effectiveSystemInstruction: plan.effectiveSystemInstruction,
        requestId,
      });

      tokensPerSecond = computeTokensPerSecond({
        timeToFirstTokenMs,
        outputTokens: state.tokenUsageData.outputTokens,
        requestStartTime,
      });

      after(async () => {
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
      });
    },
  };
}
