import { streamText, stepCountIs, type LanguageModel, type ToolSet } from 'ai';
import { generateTitle } from '@/app/actions';
import { nanoid } from 'nanoid';
import { startBackgroundStreamConsumption } from '@/lib/chat-stream-consumption';
import { registerChatAbortController } from '@/lib/chat-stop-registry';
import { ChatMCPServerService } from '@/lib/services/chatMCPServerService';
import { ChatDatabaseService } from '@/lib/services/chatDatabaseService';
import type { ChatRequestBody } from '@/lib/chat/chatRequest';
import type { ChatPreflightContext } from '@/lib/chat/chatPreflight';
import { buildChatStreamPlan } from '@/lib/chat/buildChatStreamPlan';
import {
  createChatStreamFinalizer,
  persistClientMessagesAtRequestStart,
  type OpenRouterStreamResponse,
} from '@/lib/chat/chatStreamFinalizer';
import { logChunk, logDiagnostic } from '@/lib/utils/performantLogging';
import { resolveChatOperation } from '@/lib/chat/resolveChatOperation';
import { createErrorResponse } from '@/lib/chat/createErrorResponse';

export interface ExecuteChatStreamOptions {
  requestId: string;
  requestStartTime: number;
  streamKey?: string;
  skipClientPersist?: boolean;
  getRemainingCreditsByExternalId: (userId: string) => Promise<number | null>;
}

export interface ExecuteChatStreamParams {
  req: Request;
  body: ChatRequestBody;
  preflight: ChatPreflightContext;
  options: ExecuteChatStreamOptions;
}

export async function executeChatStream(params: ExecuteChatStreamParams): Promise<Response> {
  const { req, body: chatBody, preflight, options } = params;
  const {
    requestId,
    requestStartTime,
    streamKey,
    skipClientPersist = false,
    getRemainingCreditsByExternalId,
  } = options;

  const mcpResult = await ChatMCPServerService.initializeMCPServers({
    mcpServers: chatBody.mcpServers,
    selectedModel: chatBody.selectedModel,
  });

  const resolvedOperation = await resolveChatOperation({
    body: chatBody,
    userId: preflight.authenticatedUser.userId,
  });

  if (resolvedOperation.kind === 'error') {
    return createErrorResponse(
      resolvedOperation.code,
      resolvedOperation.message,
      resolvedOperation.status
    );
  }

  const effectiveBody: ChatRequestBody = {
    ...chatBody,
    messages: resolvedOperation.messages,
  };
  const activeLeafMessageId = resolvedOperation.activeLeafMessageId;

  if (mcpResult.cleanup) {
    req.signal.addEventListener('abort', async () => {
      await mcpResult.cleanup?.();
    });
  }

  const chatId = effectiveBody.chatId || nanoid();
  const streamAbortController = new AbortController();
  registerChatAbortController(
    preflight.authenticatedUser.userId,
    chatId,
    streamAbortController,
    streamKey
  );

  const isNewChat =
    !effectiveBody.chatId ||
    !(await ChatDatabaseService.checkChatExists({
      chatId,
      userId: preflight.authenticatedUser.userId,
    }));

  if (isNewChat) {
    await ChatDatabaseService.createChatIfNotExists({
      id: chatId,
      userId: preflight.authenticatedUser.userId,
      selectedModel: effectiveBody.selectedModel,
      apiKeys: effectiveBody.apiKeys,
      isAnonymous: preflight.authenticatedUser.isAnonymous,
      messages: [],
    });
  }

  const titleGenerationPromise =
    isNewChat && effectiveBody.messages.some((m) => m.role === 'user')
      ? generateTitle(
          effectiveBody.messages,
          effectiveBody.selectedModel,
          effectiveBody.apiKeys,
          preflight.authenticatedUser.userId,
          preflight.authenticatedUser.isAnonymous
        ).then((title) => title ?? 'New Chat')
      : undefined;

  const planResult = await buildChatStreamPlan({
    body: effectiveBody,
    preflight,
    chatId,
    mcpResult,
  });
  if (!planResult.ok) {
    return planResult.response;
  }
  const plan = planResult.plan;

  if (!skipClientPersist) {
    try {
      await persistClientMessagesAtRequestStart({
        chatId,
        clientMessages: effectiveBody.messages,
        selectedModel: effectiveBody.selectedModel,
        modelDisplayName: preflight.modelValidation.modelInfo?.name,
      });
    } catch (earlyPersistError) {
      console.error(
        `[Chat ${chatId}][requestStart] Failed to persist client messages:`,
        earlyPersistError
      );
    }
  }

  const finalizer = createChatStreamFinalizer({
    chatId,
    requestId,
    requestStartTime,
    clientMessages: effectiveBody.messages,
    authenticatedUser: preflight.authenticatedUser,
    selectedModel: effectiveBody.selectedModel,
    apiKeys: effectiveBody.apiKeys,
    isAnonymous: preflight.authenticatedUser.isAnonymous,
    plan,
    modelValidation: preflight.modelValidation,
    titleGenerationPromise,
    getRemainingCreditsByExternalId,
    activeLeafMessageId,
  });

  const openrouterUser = plan.openrouterUserId;

  const streamPayload = {
    model: plan.modelInstance as LanguageModel,
    abortSignal: streamAbortController.signal,
    system: plan.effectiveSystemInstruction,
    temperature: plan.effectiveTemperature,
    maxOutputTokens: plan.effectiveMaxTokens,
    messages: plan.formattedMessages,
    ...(plan.useMultiStepStreaming
      ? {
          tools: plan.toolsToUse as ToolSet,
          ...(plan.shouldForceImageGenerationTool
            ? {
                prepareStep: async ({ stepNumber }: { stepNumber: number }) => {
                  if (stepNumber === 0) {
                    return {
                      toolChoice: {
                        type: 'tool' as const,
                        toolName: 'image_generation' as const,
                      },
                    };
                  }
                  return {};
                },
              }
            : {}),
          stopWhen: stepCountIs(20),
        }
      : {}),
    user: openrouterUser,
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 2048,
        },
      },
      anthropic: {
        thinking: {
          type: 'enabled' as const,
          budgetTokens: 12000,
        },
      },
      openrouter: {
        ...plan.modelOptions,
        user: openrouterUser,
        extraBody: {
          user: openrouterUser,
        },
      },
    },
    onError: (error: unknown) => {
      console.error(
        `[streamText.onError][Chat ${chatId}] Error during LLM stream:`,
        JSON.stringify(error, null, 2)
      );
    },
    onChunk: (event: { chunk?: { type?: string } }) => {
      finalizer.recordFirstToken();
      const { timeToFirstTokenMs } = finalizer.getTimingMetrics();
      const firstTokenTime =
        timeToFirstTokenMs !== null ? requestStartTime + timeToFirstTokenMs : null;
      logChunk(chatId, event.chunk ?? event, firstTokenTime, requestId);
    },
    async onFinish(event: Record<string, unknown>) {
      const response = event.response as OpenRouterStreamResponse | undefined;
      if (!response) {
        return;
      }
      await finalizer.processStreamFinish(event, response);
    },
  };

  logDiagnostic('STREAM_START', 'Starting chat stream', {
    requestId,
    chatId,
    selectedModel: chatBody.selectedModel,
    streamKey,
  });

  const result = streamText(streamPayload);
  startBackgroundStreamConsumption(result, chatId);

  return result.toUIMessageStreamResponse({
    originalMessages: chatBody.messages,
    sendReasoning: true,
    onFinish: async ({ responseMessage }) => {
      try {
        await finalizer.handleUiStreamFinish(responseMessage);
      } catch (err) {
        console.error(`[Chat ${chatId}][uiOnFinish] Unhandled error:`, err);
      }
    },
    onError: (error: unknown) => formatStreamError(chatId, error),
  });
}

export function formatStreamError(chatId: string, error: unknown): string {
  const err = error as {
    name?: string;
    message?: string;
    stack?: string;
    responseBody?: string;
    code?: string | number;
    cause?: unknown;
    value?: { error?: { message?: string } };
  };

  console.error(`[API Error][Chat ${chatId}] Error in stream processing:`, {
    error: err,
    message: err?.message,
    stack: err?.stack,
    responseBody: err?.responseBody,
    name: err?.name,
    cause: err?.cause,
  });

  if (err?.name === 'AI_TypeValidationError') {
    let errorMessage =
      'The AI provider returned an unexpected response format. Please try again.';
    if (err?.value?.error?.message) {
      errorMessage = `API Error: ${err.value.error.message}`;
    }
    return JSON.stringify({
      error: {
        code: 'PROVIDER_ERROR',
        message: errorMessage,
        details: 'Type validation error',
      },
    });
  }

  let errorCode = 'STREAM_ERROR';
  let errorMessage = 'An error occurred while processing your request.';
  const errorDetails: Record<string, unknown> = {};

  if (err?.message) {
    errorDetails.rawMessage = err.message;
  }
  if (err?.cause) {
    errorDetails.cause = err.cause;
  }

  if (err && typeof err.responseBody === 'string') {
    try {
      const parsedBody = JSON.parse(err.responseBody);
      errorDetails.responseBody = parsedBody;
      if (parsedBody.error && typeof parsedBody.error.message === 'string') {
        errorMessage = parsedBody.error.message;
        if (parsedBody.error.code) {
          errorCode = String(parsedBody.error.code);
        }
      }
    } catch {
      console.warn(`[API Error][Chat ${chatId}] Failed to parse error.responseBody`);
      errorDetails.responseBody = err.responseBody;
    }
  }

  if (err?.code) {
    errorCode = String(err.code);
  }
  if (err?.message && !errorDetails.responseBody) {
    errorMessage = err.message;
  }

  return JSON.stringify({
    error: { code: errorCode, message: errorMessage, details: errorDetails },
  });
}
