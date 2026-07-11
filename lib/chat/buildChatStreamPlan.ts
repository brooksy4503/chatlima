import {
  stepCountIs,
  type LanguageModel,
  type UIMessage,
} from 'ai';
import {
  getLanguageModelWithKeys,
  createOpenRouterClientWithKey,
  usesTagBasedReasoningExtraction,
  wrapWithTagBasedReasoning,
} from '@/ai/providers';
import { getModelDefaults } from '@/lib/parameter-validation';
import { cleanToolsForGoogleModels, isGoogleModel } from '@/lib/google-model-tools';
import { getUIMessageText, userMessageRequestsImageCreation } from '@/lib/message-utils';
import { resolveOpenRouterWebSearchRouteSetup } from '@/lib/services/openRouterWebSearchRouteSetup';
import { ChatWebSearchService } from '@/lib/services/chatWebSearchService';
import { ChatImageGenerationService } from '@/lib/services/chatImageGenerationService';
import {
  buildProjectContext,
  formatProjectContextForSystemPrompt,
} from '@/lib/services/projectContext';
import { buildBaseChatTools, buildWebFetchPolicy } from '@/lib/chat/chatTools';
import { buildDefaultSystemInstruction } from '@/lib/chat/systemInstruction';
import { modelShouldDisableLogprobs } from '@/lib/chat/reasoningModels';
import { prepareMessagesForModel } from '@/lib/chat/prepareMessagesForModel';
import { isOpenRouterMetaRouterModel } from '@/lib/chat/openRouterMetaRouterModels';
import { createErrorResponse } from '@/lib/chat/createErrorResponse';
import { getMissingApiKeyForModel } from '@/lib/services/accessGateService';
import type { ChatPreflightContext } from '@/lib/chat/chatPreflight';
import type { ChatRequestBody } from '@/lib/chat/chatRequest';
import type { MCPServerResult } from '@/lib/services/chatMCPServerService';

export interface ChatStreamPlan {
  chatId: string;
  modelInstance: LanguageModel;
  effectiveWebSearchEnabled: boolean;
  webSearchConfig: ChatPreflightContext['webSearchConfig'];
  imageGenerationConfig: ChatPreflightContext['imageGenerationConfig'];
  modelMessagesFinal: UIMessage[];
  formattedMessages: ReturnType<
    typeof import('@/lib/openrouter-utils').convertToOpenRouterFormat
  >;
  toolsToUse: Record<string, unknown>;
  effectiveSystemInstruction: string;
  effectiveTemperature: number;
  effectiveMaxTokens: number;
  shouldForceImageGenerationTool: boolean;
  useMultiStepStreaming: boolean;
  modelOptions: Record<string, unknown>;
  openrouterUserId: string;
  projectFileUrlByPath: Map<string, string>;
}

export type BuildChatStreamPlanResult =
  | { ok: true; plan: ChatStreamPlan }
  | { ok: false; response: Response };

export async function buildChatStreamPlan(params: {
  body: ChatRequestBody;
  preflight: ChatPreflightContext;
  chatId: string;
  mcpResult: MCPServerResult;
}): Promise<BuildChatStreamPlanResult> {
  const { body, preflight, chatId, mcpResult } = params;
  const {
    authenticatedUser,
    modelValidation,
    accessPolicyFlags,
    webSearchConfig,
    imageGenerationConfig,
  } = preflight;
  const { selectedModel, messages, apiKeys, temperature, maxTokens, systemInstruction } =
    body;
  const selectedModelInfo = modelValidation.modelInfo;

  const { modelMessagesFinal, formattedMessages } = await prepareMessagesForModel({
    messages,
    attachments: body.attachments,
    selectedModel,
    modelInfo: selectedModelInfo,
  });

  const projectFileUrlByPath = new Map<string, string>();
  let projectContextAppendix: string | undefined;

  try {
    const projectContext = await buildProjectContext({
      chatId,
      userId: authenticatedUser.userId,
    });
    if (projectContext) {
      for (const file of projectContext.files) {
        if (file.filepath && file.url) {
          projectFileUrlByPath.set(file.filepath, file.url);
        }
      }
      projectContextAppendix = formatProjectContextForSystemPrompt(projectContext);
    }
  } catch (projectContextError) {
    console.warn(`[Chat ${chatId}] Failed to build project context:`, projectContextError);
  }

  const webFetchPolicy = buildWebFetchPolicy(accessPolicyFlags);

  let effectiveWebSearchEnabled = webSearchConfig.enabled;
  const openrouterUserId = authenticatedUser.isAnonymous
    ? `chatlima_anon_${authenticatedUser.userId}`
    : `chatlima_user_${authenticatedUser.userId}`;

  const missingApiKey = getMissingApiKeyForModel(selectedModel, apiKeys);
  if (missingApiKey) {
    console.error(
      `[Chat ${chatId}] ${missingApiKey} is missing for model ${selectedModel}`
    );
    return {
      ok: false,
      response: createErrorResponse(
        'MISSING_API_KEY',
        `An API key is required for this model. Please configure ${missingApiKey} in Settings.`,
        400
      ),
    };
  }

  const webSearchSetup = resolveOpenRouterWebSearchRouteSetup({
    selectedModel,
    webSearchConfig,
    modelInfo: selectedModelInfo,
    apiKeys,
    openrouterUserId,
    getLanguageModelWithKeys,
    createOpenRouterClientWithKey,
    usesTagBasedReasoningExtraction,
    wrapWithTagBasedReasoning,
  });

  effectiveWebSearchEnabled = webSearchSetup.effectiveWebSearchEnabled;
  const modelOptions = { ...webSearchSetup.modelOptions };

  if (modelShouldDisableLogprobs(selectedModel)) {
    modelOptions.logprobs = false;
  }

  const isMetaRouterModel = isOpenRouterMetaRouterModel(selectedModel);

  const baseTools = isMetaRouterModel
    ? {}
    : buildBaseChatTools({
        mcpTools: mcpResult.tools as Record<string, unknown>,
        messages,
        projectFileUrlByPath,
        accessPolicyFlags,
      });

  const allTools = isMetaRouterModel
    ? {}
    : {
        ...baseTools,
        ...webSearchSetup.openRouterServerTools,
        ...ChatImageGenerationService.buildOpenRouterServerTools(
          imageGenerationConfig,
          apiKeys?.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
        ),
      };

  const toolsToUse =
    isGoogleModel(selectedModel) && Object.keys(allTools).length > 0
      ? cleanToolsForGoogleModels(
          allTools as Parameters<typeof cleanToolsForGoogleModels>[0]
        )
      : allTools;

  if (isMetaRouterModel) {
    effectiveWebSearchEnabled = false;
    console.log(
      `[OpenRouter Meta-Router] Disabling client tools and web search for ${selectedModel} (model manages its own server tools)`
    );
  }

  const lastUserMessageText = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return getUIMessageText(messages[i]);
      }
    }
    return '';
  })();

  const userRequestedImageCreation =
    imageGenerationConfig.enabled &&
    userMessageRequestsImageCreation(lastUserMessageText);

  const shouldForceImageGenerationTool =
    !isMetaRouterModel &&
    userRequestedImageCreation &&
    ChatImageGenerationService.modelSupportsForcedToolChoice(selectedModel);

  const useMultiStepStreaming = Object.keys(toolsToUse).length > 0;

  const modelDefaults = getModelDefaults(selectedModelInfo);
  const effectiveTemperature =
    temperature !== undefined ? temperature : modelDefaults.temperature;
  const effectiveMaxTokens =
    maxTokens !== undefined ? maxTokens : modelDefaults.maxTokens;

  const effectiveSystemInstruction = buildDefaultSystemInstruction({
    systemInstruction,
    webFetchEnabled: webFetchPolicy.enabled,
    webSearchUseAgenticServerTools: webSearchConfig.useAgenticServerTools,
    effectiveWebSearchEnabled,
    imageGenerationEnabled: imageGenerationConfig.enabled,
    projectContextAppendix,
  });

  if (webSearchConfig.enabled) {
    console.log(
      `[Web Search] ENABLED (${webSearchConfig.useAgenticServerTools ? 'agentic server tools' : 'legacy :online plugin'}) with context size: ${webSearchConfig.contextSize}`
    );
  } else {
    console.log('[Web Search] DISABLED');
  }

  if (imageGenerationConfig.enabled) {
    console.log(
      `[Image Generation] ENABLED (model: ${imageGenerationConfig.model}, quality: ${imageGenerationConfig.quality}, aspect: ${imageGenerationConfig.aspectRatio})`
    );
  } else if (body.imageGeneration.enabled) {
    console.log(`[Image Generation] Requested but not available for ${selectedModel}`);
  } else {
    console.log('[Image Generation] DISABLED');
  }

  return {
    ok: true,
    plan: {
      chatId,
      modelInstance: webSearchSetup.modelInstance as LanguageModel,
      effectiveWebSearchEnabled,
      webSearchConfig,
      imageGenerationConfig,
      modelMessagesFinal,
      formattedMessages,
      toolsToUse,
      effectiveSystemInstruction,
      effectiveTemperature,
      effectiveMaxTokens,
      shouldForceImageGenerationTool,
      useMultiStepStreaming,
      modelOptions,
      openrouterUserId,
      projectFileUrlByPath,
    },
  };
}
