import { getModelDetails } from '@/lib/models/fetch-models';
import type { ModelInfo } from '@/lib/types/models';
import { WEB_SEARCH_COST } from '@/lib/tokenCounter';
import { logDiagnostic } from '@/lib/utils/performantLogging';

interface WebSearchOptions {
    enabled: boolean;
    contextSize: 'low' | 'medium' | 'high';
}

export interface WebSearchContext {
    webSearch: WebSearchOptions;
    selectedModel: string;
    isUsingOwnApiKeys: boolean;
    isAnonymous: boolean;
    actualCredits: number | null;
    modelInfo: ModelInfo | null;
}

export interface WebSearchResult {
    enabled: boolean;
    contextSize: 'low' | 'medium' | 'high';
    canUseWebSearch: boolean;
    modelSupportsWebSearch: boolean;
    additionalCost: number;
}

export class ChatWebSearchService {
    /**
     * Validates and configures web search functionality
     */
    static validateAndConfigureWebSearch(context: WebSearchContext): WebSearchResult {
        const {
            webSearch,
            selectedModel,
            isUsingOwnApiKeys,
            isAnonymous,
            actualCredits,
            modelInfo
        } = context;

        const requestId = `websearch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        logDiagnostic('WEB_SEARCH_VALIDATION_START', 'Starting web search validation', {
            requestId,
            enabled: webSearch.enabled,
            selectedModel,
            isUsingOwnApiKeys,
            isAnonymous,
            actualCredits
        });

        // Determine server-side web search permission
        const canUseWebSearch = this.determineWebSearchPermission({
            webSearch,
            isUsingOwnApiKeys,
            isAnonymous,
            actualCredits,
            requestId
        });

        // Check if model supports web search
        const modelSupportsWebSearch = this.checkModelWebSearchSupport(modelInfo, selectedModel, requestId);

        // Determine final web search status
        const finalEnabled = webSearch.enabled && canUseWebSearch && modelSupportsWebSearch;

        // Calculate additional cost
        const additionalCost = finalEnabled && !isUsingOwnApiKeys ? WEB_SEARCH_COST : 0;

        logDiagnostic('WEB_SEARCH_VALIDATION_COMPLETE', 'Web search validation completed', {
            requestId,
            requested: webSearch.enabled,
            canUse: canUseWebSearch,
            modelSupports: modelSupportsWebSearch,
            finalEnabled,
            additionalCost
        });

        return {
            enabled: finalEnabled,
            contextSize: webSearch.contextSize,
            canUseWebSearch,
            modelSupportsWebSearch,
            additionalCost
        };
    }

    /**
     * Determines if user has permission to use web search
     */
    private static determineWebSearchPermission(context: {
        webSearch: WebSearchOptions;
        isUsingOwnApiKeys: boolean;
        isAnonymous: boolean;
        actualCredits: number | null;
        requestId: string;
    }): boolean {
        const { webSearch, isUsingOwnApiKeys, isAnonymous, actualCredits, requestId } = context;

        // Users with own API keys can use web search if requested
        if (isUsingOwnApiKeys && webSearch.enabled) {
            logDiagnostic('WEB_SEARCH_PERMISSION', 'Allowed for user with own API keys', { requestId });
            return true;
        }

        // Anonymous users cannot use web search
        if (isAnonymous) {
            logDiagnostic('WEB_SEARCH_PERMISSION', 'Blocked for anonymous user', { requestId });
            return false;
        }

        // Check if user has sufficient credits
        if (actualCredits !== null && actualCredits >= WEB_SEARCH_COST) {
            logDiagnostic('WEB_SEARCH_PERMISSION', 'Allowed for user with sufficient credits', {
                requestId,
                actualCredits,
                cost: WEB_SEARCH_COST
            });
            return webSearch.enabled;
        }

        // User doesn't have enough credits
        if (actualCredits !== null && actualCredits < WEB_SEARCH_COST) {
            logDiagnostic('WEB_SEARCH_PERMISSION', 'Blocked due to insufficient credits', {
                requestId,
                actualCredits,
                required: WEB_SEARCH_COST
            });
        }

        return false;
    }

    /**
     * Checks if the selected model supports web search
     */
    private static checkModelWebSearchSupport(
        modelInfo: ModelInfo | null,
        selectedModel: string,
        requestId: string
    ): boolean {
        // Only OpenRouter models support web search
        if (!selectedModel.startsWith("openrouter/")) {
            logDiagnostic('WEB_SEARCH_MODEL_SUPPORT', 'Web search not supported - not an OpenRouter model', {
                requestId,
                selectedModel
            });
            return false;
        }

        // Check model info for web search support
        if (modelInfo?.supportsWebSearch === true) {
            logDiagnostic('WEB_SEARCH_MODEL_SUPPORT', 'Web search supported by model', {
                requestId,
                selectedModel,
                modelId: modelInfo.id
            });
            return true;
        }

        // Model does not explicitly support web search
        logDiagnostic('WEB_SEARCH_MODEL_SUPPORT', 'Web search not supported by model', {
            requestId,
            selectedModel,
            supportsWebSearch: modelInfo?.supportsWebSearch
        });
        return false;
    }

    /**
     * Creates web search options for model configuration
     */
    static createWebSearchOptions(result: WebSearchResult): { web_search_options?: { search_context_size: 'low' | 'medium' | 'high' } } {
        if (!result.enabled) {
            return {};
        }

        return {
            web_search_options: {
                search_context_size: result.contextSize
            }
        };
    }

    /**
     * Gets the appropriate model ID for web search (with :online suffix)
     */
    static getWebSearchModelId(selectedModel: string, result: WebSearchResult): string {
        if (!result.enabled) {
            return selectedModel;
        }

        // For OpenRouter models that support web search, use :online variant
        if (selectedModel.startsWith("openrouter/") && result.modelSupportsWebSearch) {
            const baseModel = selectedModel.replace("openrouter/", "");
            return `openrouter/${baseModel}:online`;
        }

        return selectedModel;
    }

    /**
     * Validates web search request against security constraints
     */
    static validateWebSearchRequest(context: WebSearchContext): void {
        const { webSearch, isAnonymous, actualCredits, isUsingOwnApiKeys } = context;

        // Block anonymous users from attempting web search
        if (webSearch.enabled && isAnonymous) {
            throw new Error("Web Search is only available to signed-in users with credits. Please sign in and purchase credits to use this feature.");
        }

        // Block users with insufficient credits
        if (webSearch.enabled && !isUsingOwnApiKeys && actualCredits !== null && actualCredits < WEB_SEARCH_COST) {
            throw new Error(`You need at least ${WEB_SEARCH_COST} credits to use Web Search. Your balance is ${actualCredits}.`);
        }
    }
}