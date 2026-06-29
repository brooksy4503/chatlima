import { getSubscriptionTypeByExternalId } from '@/lib/polar';
import { getAccessPolicyFlags } from '@/lib/config/access-policy';
import { canUserChat, hasProviderByokForModel } from '@/lib/services/accessGateService';
import { ChatAuthenticationService } from '@/lib/services/chatAuthenticationService';
import { ChatCreditValidationService } from '@/lib/services/chatCreditValidationService';
import { ChatModelValidationService } from '@/lib/services/chatModelValidationService';
import { ChatWebSearchService } from '@/lib/services/chatWebSearchService';
import { ChatImageGenerationService } from '@/lib/services/chatImageGenerationService';
import { DailyMessageUsageService } from '@/lib/services/dailyMessageUsageService';
import { resolveAllowedImageModel } from '@/lib/constants/image-generation-models';
import { createErrorResponse } from '@/lib/chat/createErrorResponse';
import type { ChatRequestBody } from '@/lib/chat/chatRequest';
import type { ModelValidationResult } from '@/lib/services/chatModelValidationService';
import type { AuthenticatedUser } from '@/lib/services/chatAuthenticationService';
import type { CreditValidationResult } from '@/lib/services/chatCreditValidationService';
import type { WebSearchResult } from '@/lib/services/chatWebSearchService';
import type { AccessPolicyFlags } from '@/lib/config/access-policy';

export interface ChatPreflightContext {
  authenticatedUser: AuthenticatedUser;
  modelValidation: ModelValidationResult;
  accessPolicyFlags: AccessPolicyFlags;
  isUsingOwnApiKeys: boolean;
  creditValidation: CreditValidationResult;
  webSearchConfig: WebSearchResult;
  imageGenerationConfig: ReturnType<
    typeof ChatImageGenerationService.validateAndConfigureImageGeneration
  >;
  resolvedImageGenerationModel: string;
}

export type ChatPreflightResult =
  | { ok: true; context: ChatPreflightContext }
  | { ok: false; response: Response };

function buildCreditContext(
  body: ChatRequestBody,
  authenticatedUser: AuthenticatedUser,
  isUsingOwnApiKeys: boolean,
  hasCredits?: boolean
) {
  return {
    userId: authenticatedUser.userId,
    isAnonymous: authenticatedUser.isAnonymous,
    polarCustomerId: authenticatedUser.polarCustomerId,
    selectedModel: body.selectedModel,
    isUsingOwnApiKeys,
    isFreeModel: body.selectedModel.endsWith(':free'),
    webSearchEnabled: body.webSearch.enabled,
    estimatedTokens: 30,
    ...(hasCredits !== undefined ? { hasCredits } : {}),
  };
}

export interface ChatPreflightOptions {
  skipDailyIncrement?: boolean;
}

export async function runChatPreflight(
  req: Request,
  body: ChatRequestBody,
  options: ChatPreflightOptions = {}
): Promise<ChatPreflightResult> {
  const authenticatedUser = await ChatAuthenticationService.authenticateUser(req);

  const modelValidation = await ChatModelValidationService.validateAndConfigureModel({
    selectedModel: body.selectedModel,
    temperature: body.temperature,
    maxTokens: body.maxTokens,
    systemInstruction: body.systemInstruction,
  });

  const accessPolicyFlags = getAccessPolicyFlags();
  let hasPaidSubscription = false;

  if (!authenticatedUser.isAnonymous) {
    try {
      const subscriptionType = await getSubscriptionTypeByExternalId(
        authenticatedUser.userId
      );
      hasPaidSubscription =
        subscriptionType === 'monthly' || subscriptionType === 'yearly';
    } catch (error) {
      console.warn(
        '[AccessGate] Failed to resolve subscription type, treating as unsubscribed:',
        error
      );
    }
  }

  const gateResult = canUserChat({
    isAnonymous: authenticatedUser.isAnonymous,
    hasPaidSubscription,
    selectedModel: body.selectedModel,
    apiKeys: body.apiKeys,
    flags: accessPolicyFlags,
  });

  if (!gateResult.allowed) {
    console.warn('[AccessGate] Chat request blocked', {
      reason: gateResult.reason,
      userId: authenticatedUser.userId,
      isAnonymous: authenticatedUser.isAnonymous,
      selectedModel: body.selectedModel,
    });
    return {
      ok: false,
      response: createErrorResponse(
        gateResult.reason,
        gateResult.reason === 'PAYWALL_BYOK_REQUIRED'
          ? "Paid subscription required, or add a BYOK API key for this model's provider."
          : 'Paid subscription required to chat.',
        402
      ),
    };
  }

  const isUsingOwnApiKeys = hasProviderByokForModel(
    body.selectedModel,
    body.apiKeys
  );

  const creditValidation = await ChatCreditValidationService.validateCredits(
    buildCreditContext(body, authenticatedUser, isUsingOwnApiKeys)
  );

  if (
    !options.skipDailyIncrement &&
    !accessPolicyFlags.billingEnforced &&
    !creditValidation.hasCredits
  ) {
    const limitCheck = await DailyMessageUsageService.checkDailyLimit(
      authenticatedUser.userId
    );

    if (limitCheck.hasReachedLimit) {
      console.log(`[Chat] Daily message limit reached:`, {
        userId: authenticatedUser.userId,
        isAnonymous: authenticatedUser.isAnonymous,
        messageCount: limitCheck.messageCount,
        limit: limitCheck.limit,
        remaining: limitCheck.remaining,
      });
      return {
        ok: false,
        response: createErrorResponse(
          'MESSAGE_LIMIT_REACHED',
          'Message limit reached',
          429,
          JSON.stringify({
            limit: limitCheck.limit,
            remaining: limitCheck.remaining,
            messageCount: limitCheck.messageCount,
          })
        ),
      };
    }

    try {
      const incrementResult = await DailyMessageUsageService.incrementDailyUsage(
        authenticatedUser.userId,
        authenticatedUser.isAnonymous
      );
      console.log(`[Chat] Incremented daily message usage:`, {
        userId: authenticatedUser.userId,
        isAnonymous: authenticatedUser.isAnonymous,
        newCount: incrementResult.newCount,
        date: incrementResult.date,
        remaining: limitCheck.remaining - 1,
      });
    } catch (error) {
      console.error(`[Chat] Failed to increment daily usage:`, error);
    }
  } else {
    console.log(
      `[Chat] Skipping daily usage increment - user has credits (${creditValidation.actualCredits})`
    );
  }

  const creditCtxWithHasCredits = buildCreditContext(
    body,
    authenticatedUser,
    isUsingOwnApiKeys,
    creditValidation.hasCredits
  );

  await ChatCreditValidationService.validateFreeModelAccess(creditCtxWithHasCredits);
  await ChatCreditValidationService.validatePremiumModelAccess(creditCtxWithHasCredits);

  const webSearchConfig = ChatWebSearchService.validateAndConfigureWebSearch(
    {
      webSearch: body.webSearch,
      selectedModel: body.selectedModel,
      isUsingOwnApiKeys,
      isAnonymous: authenticatedUser.isAnonymous,
      actualCredits: creditValidation.actualCredits,
      modelInfo: modelValidation.modelInfo,
    },
    {
      agenticWebToolsEnabled: accessPolicyFlags.openrouterAgenticWebToolsEnabled,
    }
  );

  const resolvedImageGenerationModel = resolveAllowedImageModel(
    body.imageGeneration.model
  );

  const imageGenPayload = {
    enabled: body.imageGeneration.enabled,
    quality: body.imageGeneration.quality ?? ('medium' as const),
    aspectRatio: body.imageGeneration.aspectRatio ?? '1:1',
    outputFormat: body.imageGeneration.outputFormat ?? ('png' as const),
    model: resolvedImageGenerationModel,
  };

  const imageGenerationConfig =
    ChatImageGenerationService.validateAndConfigureImageGeneration({
      imageGeneration: imageGenPayload,
      selectedModel: body.selectedModel,
      isUsingOwnApiKeys,
      isAnonymous: authenticatedUser.isAnonymous,
      actualCredits: creditValidation.actualCredits,
      modelInfo: modelValidation.modelInfo,
    });

  try {
    ChatImageGenerationService.validateImageGenerationRequest({
      imageGeneration: imageGenPayload,
      selectedModel: body.selectedModel,
      isUsingOwnApiKeys,
      isAnonymous: authenticatedUser.isAnonymous,
      actualCredits: creditValidation.actualCredits,
      modelInfo: modelValidation.modelInfo,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Image generation is not available.';
    return {
      ok: false,
      response: createErrorResponse('FEATURE_RESTRICTED', message, 403),
    };
  }

  return {
    ok: true,
    context: {
      authenticatedUser,
      modelValidation,
      accessPolicyFlags,
      isUsingOwnApiKeys,
      creditValidation,
      webSearchConfig,
      imageGenerationConfig,
      resolvedImageGenerationModel,
    },
  };
}
