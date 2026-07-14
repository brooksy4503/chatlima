import { nanoid } from 'nanoid';
import { getCachedCreditsByExternalId } from '@/lib/services/creditCache';
import {
  logDiagnostic as originalLogDiagnostic,
  logRequestBoundary,
} from '@/lib/utils/performantLogging';
import { abortChatGeneration } from '@/lib/chat-stop-registry';
import { ChatAuthenticationService, ChatAuthenticationError } from '@/lib/services/chatAuthenticationService';
import { CreditValidationError } from '@/lib/services/chatCreditValidationService';
import { parseChatRequestBody } from '@/lib/chat/chatRequest';
import { createErrorResponse } from '@/lib/chat/createErrorResponse';
import { runChatPreflight } from '@/lib/chat/chatPreflight';
import { executeChatStream } from '@/lib/chat/executeChatStream';

export { createErrorResponse } from '@/lib/chat/createErrorResponse';

const logDiagnostic = originalLogDiagnostic;

export const maxDuration = 300;

export async function POST(req: Request) {
  const requestId = nanoid();
  const requestStartTime = Date.now();

  const getCachedCreditsByExternal = getCachedCreditsByExternalId;

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
      const streamKey = typeof body?.streamKey === 'string' ? body.streamKey : undefined;

      if (!stopChatId) {
        return createErrorResponse(
          'INVALID_REQUEST',
          'chatId is required to stop generation.',
          400
        );
      }

      const stopped = abortChatGeneration(authenticatedUser.userId, stopChatId, streamKey);
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

    return executeChatStream({
      req,
      body: chatBody,
      preflight: preflightResult.context,
      options: {
        requestId,
        requestStartTime,
        getRemainingCreditsByExternalId: getCachedCreditsByExternal,
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
