import { nanoid } from 'nanoid';
import type { UIMessage } from 'ai';
import { streamText, type LanguageModel } from 'ai';
import { createRequestCreditCache } from '@/lib/services/creditCache';
import { ChatAuthenticationService } from '@/lib/services/chatAuthenticationService';
import { ChatCreditValidationService, CreditValidationError } from '@/lib/services/chatCreditValidationService';
import { ChatDatabaseService } from '@/lib/services/chatDatabaseService';
import { hasProviderByokForModel } from '@/lib/services/accessGateService';
import { DailyMessageUsageService } from '@/lib/services/dailyMessageUsageService';
import { getAccessPolicyFlags } from '@/lib/config/access-policy';
import { calculateCreditCostPerMessage } from '@/lib/utils/creditCostCalculator';
import { getModelDetails } from '@/lib/models/fetch-models';
import { saveMessages, convertToDBMessages, saveChat } from '@/lib/chat-store';
import { runChatPreflight } from '@/lib/chat/chatPreflight';
import { buildChatStreamPlan } from '@/lib/chat/buildChatStreamPlan';
import { buildModelHistory, type CompareUIMessage } from '@/lib/chat/compareHistory';
import {
  encodeCompareEvent,
  parseCompareRequestBody,
  type CompareStreamEvent,
} from '@/lib/chat/compareRequest';
import { type ChatRequestBody } from '@/lib/chat/chatRequest';
import { MIN_COMPARE_MODELS, MAX_COMPARE_MODELS } from '@/lib/compare/comparePolicy';
import { registerChatAbortController } from '@/lib/chat-stop-registry';
import { ChatMCPServerService } from '@/lib/services/chatMCPServerService';
import { createErrorResponse } from '@/lib/chat/createErrorResponse';

function buildCompareChatBody(
  base: ReturnType<typeof parseCompareRequestBody>,
  selectedModel: string,
  messages: UIMessage[]
): ChatRequestBody {
  return {
    messages,
    chatId: base.chatId,
    selectedModel,
    mcpServers: [],
    webSearch: { enabled: false, contextSize: 'medium' },
    imageGeneration: { enabled: false },
    apiKeys: base.apiKeys,
    attachments: [],
  };
}

function errorAssistant(
  id: string,
  modelId: string,
  turnId: string,
  text: string,
  latencyMs?: number
): CompareUIMessage {
  return {
    id,
    role: 'assistant',
    parts: [{ type: 'text', text }],
    modelId,
    modelProvider: modelId.split('/')[0] ?? null,
    modelDisplayName: modelId,
    comparisonTurnId: turnId,
    ...(latencyMs != null ? { latencyMs } : {}),
  };
}

async function validateCompareCredits(
  req: Request,
  body: ReturnType<typeof parseCompareRequestBody>
): Promise<{ ok: true } | { ok: false; response: Response }> {
  let totalCost = 0;
  for (const modelId of body.compareModels) {
    const modelInfo = await getModelDetails(modelId);
    totalCost += calculateCreditCostPerMessage(modelInfo ?? null);
  }

  const chatBody = buildCompareChatBody(body, body.compareModels[0], body.messages);
  const preflight = await runChatPreflight(req, chatBody, { skipDailyIncrement: true });
  if (!preflight.ok) {
    return preflight;
  }

  const { authenticatedUser, creditValidation, isUsingOwnApiKeys } = preflight.context;

  if (!creditValidation.hasCredits && !isUsingOwnApiKeys) {
    const accessPolicyFlags = getAccessPolicyFlags();
    if (!accessPolicyFlags.billingEnforced) {
      const limitCheck = await DailyMessageUsageService.checkDailyLimit(authenticatedUser.userId);
      if (limitCheck.hasReachedLimit) {
        return {
          ok: false,
          response: createErrorResponse('MESSAGE_LIMIT_REACHED', 'Message limit reached', 429),
        };
      }
      try {
        await DailyMessageUsageService.incrementDailyUsage(
          authenticatedUser.userId,
          authenticatedUser.isAnonymous
        );
      } catch (error) {
        console.error('[Compare] Failed to increment daily usage:', error);
      }
    }
  }

  for (const modelId of body.compareModels) {
    const isUsingOwn = hasProviderByokForModel(modelId, body.apiKeys);
    try {
      await ChatCreditValidationService.validateCredits({
        userId: authenticatedUser.userId,
        isAnonymous: authenticatedUser.isAnonymous,
        polarCustomerId: authenticatedUser.polarCustomerId,
        selectedModel: modelId as ChatRequestBody['selectedModel'],
        isUsingOwnApiKeys: isUsingOwn,
        isFreeModel: modelId.endsWith(':free'),
        webSearchEnabled: false,
        estimatedTokens: 30,
      });
    } catch (error) {
      if (error instanceof CreditValidationError) {
        return {
          ok: false,
          response: new Response(
            JSON.stringify({ error: { code: error.code, message: error.message } }),
            { status: error.status, headers: { 'Content-Type': 'application/json' } }
          ),
        };
      }
      throw error;
    }
  }

  if (creditValidation.hasCredits && creditValidation.actualCredits !== null) {
    if (creditValidation.actualCredits < totalCost) {
      return {
        ok: false,
        response: createErrorResponse(
          'INSUFFICIENT_CREDITS',
          `Compare requires ~${totalCost} credits (${body.compareModels.length} models).`,
          402
        ),
      };
    }
  }

  return { ok: true };
}

export async function handleCompareRequest(req: Request): Promise<Response> {
  const body = parseCompareRequestBody(await req.json());

  if (!body.chatId || !body.comparisonTurnId) {
    return createErrorResponse('INVALID_REQUEST', 'chatId and comparisonTurnId are required.', 400);
  }

  if (body.compareModels.length < MIN_COMPARE_MODELS || body.compareModels.length > MAX_COMPARE_MODELS) {
    return createErrorResponse(
      'INVALID_REQUEST',
      `Select ${MIN_COMPARE_MODELS}–${MAX_COMPARE_MODELS} models to compare.`,
      400
    );
  }

  const creditCheck = await validateCompareCredits(req, body);
  if (!creditCheck.ok) {
    return creditCheck.response;
  }

  const authenticatedUser = await ChatAuthenticationService.authenticateUser(req);
  const { getRemainingCreditsByExternalId } = createRequestCreditCache();

  const chatExists = await ChatDatabaseService.checkChatExists({
    chatId: body.chatId,
    userId: authenticatedUser.userId,
  });

  if (!chatExists) {
    await ChatDatabaseService.createChatIfNotExists({
      id: body.chatId,
      userId: authenticatedUser.userId,
      selectedModel: body.compareModels[0],
      apiKeys: body.apiKeys,
      isAnonymous: authenticatedUser.isAnonymous,
      messages: [],
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: CompareStreamEvent) => {
        controller.enqueue(encoder.encode(encodeCompareEvent(event)));
      };

      try {
        const historyMessages = body.messages.filter(
          (m) => (m as CompareUIMessage).comparisonTurnId !== body.comparisonTurnId
        );

        const userMsg = body.messages.find((m) => m.id === body.userMessageId && m.role === 'user');
        if (!userMsg) {
          emit({ type: 'error', message: 'User message not found', code: 'INVALID_REQUEST' });
          controller.close();
          return;
        }

        const assistantResults: CompareUIMessage[] = [];

        for (let index = 0; index < body.compareModels.length; index++) {
          const modelId = body.compareModels[index];
          const assistantMessageId = nanoid();
          const modelStart = Date.now();

          emit({ type: 'model-start', modelId, index, messageId: assistantMessageId });

          const streamAbortController = new AbortController();
          registerChatAbortController(
            authenticatedUser.userId,
            body.chatId,
            streamAbortController,
            modelId
          );

          const messagesForHistory = body.messages.filter(
            (m) =>
              (m as CompareUIMessage).comparisonTurnId !== body.comparisonTurnId ||
              m.role === 'user'
          ) as CompareUIMessage[];

          const modelHistory = buildModelHistory(
            messagesForHistory,
            modelId,
            body.comparisonTurnId
          );

          const chatBody = buildCompareChatBody(body, modelId, modelHistory);
          const preflightResult = await runChatPreflight(req, chatBody, { skipDailyIncrement: true });

          if (!preflightResult.ok) {
            emit({
              type: 'model-error',
              modelId,
              messageId: assistantMessageId,
              error: 'Model validation failed',
            });
            assistantResults.push(
              errorAssistant(assistantMessageId, modelId, body.comparisonTurnId, 'Error: Model validation failed')
            );
            continue;
          }

          const mcpResult = await ChatMCPServerService.initializeMCPServers({
            mcpServers: [],
            selectedModel: modelId,
          });

          const planResult = await buildChatStreamPlan({
            body: chatBody,
            preflight: preflightResult.context,
            chatId: body.chatId,
            mcpResult,
          });

          if (!planResult.ok) {
            emit({
              type: 'model-error',
              modelId,
              messageId: assistantMessageId,
              error: 'Failed to build model plan',
            });
            assistantResults.push(
              errorAssistant(assistantMessageId, modelId, body.comparisonTurnId, 'Error: Failed to build model plan')
            );
            continue;
          }

          const plan = planResult.plan;
          const openrouterUser = plan.openrouterUserId;

          let text = '';
          try {
            const result = streamText({
              model: plan.modelInstance as LanguageModel,
              abortSignal: streamAbortController.signal,
              system: plan.effectiveSystemInstruction,
              temperature: plan.effectiveTemperature,
              maxOutputTokens: plan.effectiveMaxTokens,
              messages: plan.formattedMessages,
              providerOptions: {
                openrouter: {
                  ...plan.modelOptions,
                  user: openrouterUser,
                  extraBody: { user: openrouterUser },
                },
              },
            });

            for await (const delta of result.textStream) {
              text += delta;
              emit({ type: 'text-delta', modelId, delta });
            }

            const usage = await result.usage;
            const latencyMs = Date.now() - modelStart;
            const provider = modelId.split('/')[0] ?? null;

            assistantResults.push({
              id: assistantMessageId,
              role: 'assistant',
              parts: [{ type: 'text', text }],
              modelId,
              modelProvider: provider,
              modelDisplayName: modelId,
              comparisonTurnId: body.comparisonTurnId,
              latencyMs,
            });

            emit({
              type: 'model-finish',
              modelId,
              messageId: assistantMessageId,
              latencyMs,
              inputTokens: usage?.inputTokens ?? 0,
              outputTokens: usage?.outputTokens ?? 0,
            });

            await getRemainingCreditsByExternalId(authenticatedUser.userId);
          } catch (streamError) {
            const message =
              streamError instanceof Error ? streamError.message : 'Stream failed';
            emit({ type: 'model-error', modelId, messageId: assistantMessageId, error: message });
            assistantResults.push(
              errorAssistant(
                assistantMessageId,
                modelId,
                body.comparisonTurnId,
                `Error: ${message}`,
                Date.now() - modelStart
              )
            );
          }
        }

        const userWithMeta: CompareUIMessage = {
          ...userMsg,
          comparisonTurnId: body.comparisonTurnId,
        };

        const allMessages = [
          ...historyMessages,
          userWithMeta,
          ...assistantResults,
        ] as CompareUIMessage[];

        const dbMessages = convertToDBMessages(allMessages, body.chatId);
        await saveMessages({ messages: dbMessages });

        await saveChat({
          id: body.chatId,
          userId: authenticatedUser.userId,
          messages: allMessages,
          selectedModel: body.compareModels[0],
          apiKeys: body.apiKeys,
          isAnonymous: authenticatedUser.isAnonymous,
        });

        emit({ type: 'turn-complete', comparisonTurnId: body.comparisonTurnId });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Compare failed';
        emit({ type: 'error', message, code: 'INTERNAL_ERROR' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
    },
  });
}
