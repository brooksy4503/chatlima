import type { LanguageModel } from 'ai';
import type { OpenRouterProvider } from '@openrouter/ai-sdk-provider';
import type { ModelInfo } from '@/lib/types/models';
import { ChatWebSearchService, type WebSearchResult } from '@/lib/services/chatWebSearchService';

const LEGACY_LOGPROBS_OFF_MODELS = new Set([
    'openrouter/deepseek/deepseek-r1',
    'openrouter/deepseek/deepseek-r1-0528',
    'openrouter/x-ai/grok-3-beta',
    'openrouter/x-ai/grok-3-mini-beta',
    'openrouter/x-ai/grok-3-mini-beta-reasoning-high',
    'openrouter/qwen/qwq-32b',
]);

export interface OpenRouterWebSearchRouteSetupInput {
    selectedModel: string;
    webSearchConfig: WebSearchResult;
    modelInfo: ModelInfo | null;
    apiKeys: Record<string, string>;
    openrouterUserId: string;
    getLanguageModelWithKeys: (
        selectedModel: string,
        apiKeys: Record<string, string>,
        openrouterUserId: string
    ) => LanguageModel;
    createOpenRouterClientWithKey: (
        apiKey: string | undefined,
        openrouterUserId: string
    ) => OpenRouterProvider | null;
    usesTagBasedReasoningExtraction: (selectedModel: string) => boolean;
    wrapWithTagBasedReasoning: (model: LanguageModel) => LanguageModel;
}

export interface OpenRouterWebSearchRouteSetupResult {
    modelInstance: LanguageModel;
    effectiveWebSearchEnabled: boolean;
    openRouterServerTools: Record<string, unknown>;
    modelOptions: Record<string, unknown>;
}

/**
 * Resolves OpenRouter model instance, server tools, and legacy plugin options for web search.
 * Extracted from the chat route for testability.
 */
export function resolveOpenRouterWebSearchRouteSetup(
    input: OpenRouterWebSearchRouteSetupInput
): OpenRouterWebSearchRouteSetupResult {
    const {
        selectedModel,
        webSearchConfig,
        modelInfo,
        apiKeys,
        openrouterUserId,
        getLanguageModelWithKeys,
        createOpenRouterClientWithKey,
        usesTagBasedReasoningExtraction,
        wrapWithTagBasedReasoning,
    } = input;

    let effectiveWebSearchEnabled = webSearchConfig.enabled;
    let openRouterServerTools: Record<string, unknown> = {};
    let modelInstance: LanguageModel;

    const openrouterClient = selectedModel.startsWith('openrouter/')
        ? createOpenRouterClientWithKey(apiKeys?.OPENROUTER_API_KEY, openrouterUserId)
        : null;

    if (webSearchConfig.enabled && selectedModel.startsWith('openrouter/')) {
        if (modelInfo?.supportsWebSearch === true) {
            if (webSearchConfig.useAgenticServerTools && openrouterClient) {
                modelInstance = getLanguageModelWithKeys(selectedModel, apiKeys, openrouterUserId);
                openRouterServerTools = ChatWebSearchService.buildOpenRouterServerTools(openrouterClient, {
                    contextSize: webSearchConfig.contextSize,
                    maxTotalResults: ChatWebSearchService.DEFAULT_MAX_TOTAL_RESULTS,
                });
            } else if (!webSearchConfig.useAgenticServerTools && openrouterClient) {
                const legacyModelId = ChatWebSearchService.getWebSearchModelId(selectedModel, webSearchConfig)
                    .replace('openrouter/', '');
                const legacyBaseModel = LEGACY_LOGPROBS_OFF_MODELS.has(selectedModel)
                    ? openrouterClient(legacyModelId, { logprobs: false })
                    : openrouterClient(legacyModelId);
                modelInstance = usesTagBasedReasoningExtraction(selectedModel)
                    ? wrapWithTagBasedReasoning(legacyBaseModel as LanguageModel)
                    : (legacyBaseModel as LanguageModel);
            } else {
                effectiveWebSearchEnabled = false;
                modelInstance = getLanguageModelWithKeys(selectedModel, apiKeys, openrouterUserId);
            }
        } else {
            effectiveWebSearchEnabled = false;
            modelInstance = getLanguageModelWithKeys(selectedModel, apiKeys, openrouterUserId);
        }
    } else {
        effectiveWebSearchEnabled = false;
        modelInstance = getLanguageModelWithKeys(selectedModel, apiKeys, openrouterUserId);
    }

    const modelOptions: Record<string, unknown> = {};
    if (effectiveWebSearchEnabled && !webSearchConfig.useAgenticServerTools) {
        Object.assign(modelOptions, ChatWebSearchService.createWebSearchOptions(webSearchConfig));
    }

    return {
        modelInstance,
        effectiveWebSearchEnabled,
        openRouterServerTools,
        modelOptions,
    };
}
