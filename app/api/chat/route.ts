import { streamText, stepCountIs, type LanguageModel, type ToolSet } from 'ai';
import { generateTitle } from '@/app/actions';
import { nanoid } from 'nanoid';
import { createRequestCreditCache } from '@/lib/services/creditCache';
import {
  logDiagnostic as originalLogDiagnostic,
  logChunk,
  logRequestBoundary,
} from '@/lib/utils/performantLogging';
import { startBackgroundStreamConsumption } from '@/lib/chat-stream-consumption';
import { registerChatAbortController, abortChatGeneration } from '@/lib/chat-stop-registry';
import { ChatAuthenticationService, ChatAuthenticationError } from '@/lib/services/chatAuthenticationService';
import { CreditValidationError } from '@/lib/services/chatCreditValidationService';
import { ChatMCPServerService } from '@/lib/services/chatMCPServerService';
import { ChatDatabaseService } from '@/lib/services/chatDatabaseService';
import { parseChatRequestBody } from '@/lib/chat/chatRequest';
import { createErrorResponse } from '@/lib/chat/createErrorResponse';
import { runChatPreflight } from '@/lib/chat/chatPreflight';
import { buildChatStreamPlan } from '@/lib/chat/buildChatStreamPlan';
import {
  createChatStreamFinalizer,
  persistClientMessagesAtRequestStart,
} from '@/lib/chat/chatStreamFinalizer';
import type { OpenRouterStreamResponse } from '@/lib/chat/chatStreamFinalizer';

export { createErrorResponse } from '@/lib/chat/createErrorResponse';

const logDiagnostic = originalLogDiagnostic;

export const maxDuration = 300;

export async function POST(req: Request) {
  const requestId = nanoid();
  const requestStartTime = Date.now();

  const { getRemainingCreditsByExternalId: getCachedCreditsByExternal } =
    createRequestCreditCache();

  logRequestBoundary('START', requestId, {
    url: req.url,
    method: req.method,
    startTime: requestStartTime,
  });

  try {
    const body = await req.json();

    if (body?.action === 'stop') {
      const authenticatedUser = await ChatAuthenticationService.authenticateUser(req);
      const stopChatId = typeof body?.chatId === 'string' ? body.chatId : '';

      if (!stopChatId) {
        return createErrorResponse(
          'INVALID_REQUEST',
          'chatId is required to stop generation.',
          400
        );
      }

      const stopped = abortChatGeneration(authenticatedUser.userId, stopChatId);
      return Response.json({ ok: true, stopped, chatId: stopChatId });
    }

    const chatBody = parseChatRequestBody(body);

    logDiagnostic('REQUEST_PARSED', 'Request body parsed', {
      requestId,
      messagesCount: chatBody.messages.length,
      chatId: chatBody.chatId,
      selectedModel: chatBody.selectedModel,
      attachmentsCount: chatBody.attachments.length,
      webSearchEnabled: chatBody.webSearch.enabled,
      imageGenerationEnabled: chatBody.imageGeneration.enabled,
      hasTemperature: chatBody.temperature !== undefined,
      hasMaxTokens: chatBody.maxTokens !== undefined,
      hasSystemInstruction: chatBody.systemInstruction !== undefined,
    });

    const preflightResult = await runChatPreflight(req, chatBody);
    if (!preflightResult.ok) {
      return preflightResult.response;
    }
    const preflight = preflightResult.context;

    const mcpResult = await ChatMCPServerService.initializeMCPServers({
      mcpServers: chatBody.mcpServers,
      selectedModel: chatBody.selectedModel,
    });

    if (mcpResult.cleanup) {
      req.signal.addEventListener('abort', async () => {
        await mcpResult.cleanup?.();
      });
    }

    const chatId = chatBody.chatId || nanoid();
    const streamAbortController = new AbortController();
    registerChatAbortController(
      preflight.authenticatedUser.userId,
      chatId,
      streamAbortController
    );

    const isNewChat =
      !chatBody.chatId ||
      !(await ChatDatabaseService.checkChatExists({
        chatId,
        userId: preflight.authenticatedUser.userId,
      }));

    if (isNewChat) {
      await ChatDatabaseService.createChatIfNotExists({
        id: chatId,
        userId: preflight.authenticatedUser.userId,
        selectedModel: chatBody.selectedModel,
        apiKeys: chatBody.apiKeys,
        isAnonymous: preflight.authenticatedUser.isAnonymous,
        messages: [],
      });
    }

    const titleGenerationPromise =
      isNewChat && chatBody.messages.some((m) => m.role === 'user')
        ? generateTitle(
            chatBody.messages,
            chatBody.selectedModel,
            chatBody.apiKeys,
            preflight.authenticatedUser.userId,
            preflight.authenticatedUser.isAnonymous
          ).then((title) => title ?? 'New Chat')
        : undefined;

    const planResult = await buildChatStreamPlan({
      body: chatBody,
      preflight,
      chatId,
      mcpResult,
    });
    if (!planResult.ok) {
      return planResult.response;
    }
    const plan = planResult.plan;

    try {
      await persistClientMessagesAtRequestStart({
        chatId,
        clientMessages: chatBody.messages,
      });
    } catch (earlyPersistError) {
      console.error(
        `[Chat ${chatId}][requestStart] Failed to persist client messages:`,
        earlyPersistError
      );
    }

    const finalizer = createChatStreamFinalizer({
      chatId,
      requestId,
      requestStartTime,
      clientMessages: chatBody.messages,
      authenticatedUser: preflight.authenticatedUser,
      selectedModel: chatBody.selectedModel,
      apiKeys: chatBody.apiKeys,
      isAnonymous: preflight.authenticatedUser.isAnonymous,
      plan,
      modelValidation: preflight.modelValidation,
      titleGenerationPromise,
      getRemainingCreditsByExternalId: getCachedCreditsByExternal,
    });

    const { authenticatedUser } = preflight;
    const openrouterUser = plan.openrouterUserId;

    const streamPayload = {
      model: plan.modelInstance as LanguageModel,
      abortSignal: streamAbortController.signal,
      system: plan.effectiveSystemInstruction,
      temperature: plan.effectiveTemperature,
      maxOutputTokens: plan.effectiveMaxTokens,
      messages: plan.formattedMessages,
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

    console.log(
      `[Chat ${chatId}] Using model: ${chatBody.selectedModel}, effectiveWebSearchEnabled: ${plan.webSearchConfig.enabled}`
    );
    console.log(`[Chat ${chatId}] OpenRouter user tracking: ${openrouterUser}`);

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
      onError: (error: unknown) => {
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

        console.error(`[API Error][Chat ${chatId}] Final error response:`, {
          errorCode,
          errorMessage,
          errorDetails,
        });

        return JSON.stringify({
          error: { code: errorCode, message: errorMessage, details: errorDetails },
        });
      },
    });
  } catch (error: unknown) {
    console.error(
      `[API Route Error][Chat ${requestId}] Error in chat route:`,
      JSON.stringify(error, null, 2)
    );

    if (error instanceof Response) {
      return error;
    }

    if (error instanceof ChatAuthenticationError) {
      return createErrorResponse(error.code, error.message, error.status);
    }

    if (error instanceof CreditValidationError) {
      return new Response(
        JSON.stringify({
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        }),
        { status: error.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An internal error occurred',
          details: message,
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
