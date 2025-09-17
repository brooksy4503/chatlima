import { WEB_SEARCH_COST } from '@/lib/tokenCounter';

export interface WebSearchOptions {
    enabled: boolean;
    contextSize: 'low' | 'medium' | 'high';
}

export interface WebSearchConfig {
    enabled: boolean;
    contextSize: 'low' | 'medium' | 'high';
    modelSupportsWebSearch: boolean;
    serverSideEnabled: boolean;
}

export interface WebSearchValidationResult {
    shouldEnable: boolean;
    reason?: string;
    config: WebSearchConfig;
}

export class WebSearchService {
    /**
     * Validate and configure web search based on user permissions and model capabilities
     */
    static validateWebSearch(
        webSearch: WebSearchOptions,
        hasCredits: boolean,
        isUsingOwnApiKeys: boolean,
        isAnonymous: boolean,
        selectedModel: string,
        modelSupportsWebSearch: boolean
    ): WebSearchValidationResult {
        let serverSideWebSearchEnabled = false;
        let reason: string | undefined;

        // Check Web Search credit requirement - ensure user has enough credits for web search (skip if using own API keys)
        // SECURITY FIX: Don't trust client's webSearch.enabled, determine server-side
        if (hasCredits && !isAnonymous && !isUsingOwnApiKeys) {
            // User has sufficient credits, allow them to use web search if requested
            serverSideWebSearchEnabled = webSearch.enabled;
        } else if (isUsingOwnApiKeys && webSearch.enabled) {
            // Users with own API keys can use web search if they requested it
            serverSideWebSearchEnabled = webSearch.enabled;
        } else if (webSearch.enabled) {
            // User requested web search but doesn't have credits or is anonymous
            reason = "Web search requires credits or your own API keys";
        }

        // Check if web search was requested but not allowed
        if (webSearch.enabled && !serverSideWebSearchEnabled) {
            reason = reason || "Web search not available with current account status";
        }

        // Use server-determined web search status instead of client's request
        const config: WebSearchConfig = {
            enabled: serverSideWebSearchEnabled,
            contextSize: webSearch.contextSize,
            modelSupportsWebSearch,
            serverSideEnabled: serverSideWebSearchEnabled
        };

        return {
            shouldEnable: serverSideWebSearchEnabled,
            reason,
            config
        };
    }

    /**
     * Check if model supports web search
     */
    static modelSupportsWebSearch(selectedModel: string): boolean {
        // Check if the selected model supports web search
        const isOpenRouterModel = selectedModel.includes('/');
        const hasWebSearchSupport = selectedModel.includes(':online') ||
            selectedModel.includes('gpt-4o') ||
            selectedModel.includes('claude-3.5-sonnet') ||
            selectedModel.includes('claude-3.5-haiku');

        return isOpenRouterModel && hasWebSearchSupport;
    }

    /**
     * Get web search cost
     */
    static getWebSearchCost(): number {
        return WEB_SEARCH_COST;
    }

    /**
     * Determine if web search should be enabled for the model
     */
    static shouldEnableWebSearchForModel(
        selectedModel: string,
        webSearchEnabled: boolean
    ): { enabled: boolean; reason?: string } {
        const modelSupportsWebSearch = this.modelSupportsWebSearch(selectedModel);

        if (webSearchEnabled && modelSupportsWebSearch) {
            // Model supports web search, use :online variant
            return { enabled: true };
        } else if (webSearchEnabled && !modelSupportsWebSearch) {
            // Model does not support web search, or flag is not explicitly true
            return {
                enabled: false,
                reason: `Model ${selectedModel} does not support web search`
            };
        } else {
            // Web search not enabled in request or model is not an OpenRouter model
            console.log(`[Web Search] Requested but ${selectedModel} is not an OpenRouter model or web search support unknown. Disabling web search for this call.`);
            return { enabled: false };
        }
    }

    /**
     * Get context size multiplier for cost calculation
     */
    static getContextSizeMultiplier(contextSize: 'low' | 'medium' | 'high'): number {
        switch (contextSize) {
            case 'low':
                return 1.0;
            case 'medium':
                return 1.5;
            case 'high':
                return 2.0;
            default:
                return 1.0;
        }
    }

    /**
     * Calculate web search cost based on context size
     */
    static calculateWebSearchCost(contextSize: 'low' | 'medium' | 'high'): number {
        const baseCost = this.getWebSearchCost();
        const multiplier = this.getContextSizeMultiplier(contextSize);
        return baseCost * multiplier;
    }
}
