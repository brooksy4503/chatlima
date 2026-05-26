import type { OpenRouterProvider } from '@openrouter/ai-sdk-provider';
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
    supportsToolCalling: boolean;
    useAgenticServerTools: boolean;
    /** Minimum reserved cost (one search). Final billing uses actual invocation count. */
    additionalCost: number;
}

export interface OpenRouterServerToolsConfig {
    contextSize: 'low' | 'medium' | 'high';
    maxResults?: number;
    maxTotalResults?: number;
}

type ToolCallLike = { toolName?: string; toolCallId?: string };

export class ChatWebSearchService {
    static readonly DEFAULT_MAX_TOTAL_RESULTS = 10;

    /**
     * Validates and configures web search functionality
     */
    static validateAndConfigureWebSearch(
        context: WebSearchContext,
        options?: { agenticWebToolsEnabled?: boolean }
    ): WebSearchResult {
        const {
            webSearch,
            selectedModel,
            isUsingOwnApiKeys,
            isAnonymous,
            actualCredits,
            modelInfo
        } = context;

        const agenticWebToolsEnabled = options?.agenticWebToolsEnabled ?? false;
        const requestId = `websearch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        logDiagnostic('WEB_SEARCH_VALIDATION_START', 'Starting web search validation', {
            requestId,
            enabled: webSearch.enabled,
            selectedModel,
            isUsingOwnApiKeys,
            isAnonymous,
            actualCredits,
            agenticWebToolsEnabled,
        });

        const canUseWebSearch = this.determineWebSearchPermission({
            webSearch,
            isUsingOwnApiKeys,
            isAnonymous,
            actualCredits,
            requestId
        });

        const modelSupportsWebSearch = this.checkModelWebSearchSupport(modelInfo, selectedModel, requestId);
        const supportsToolCalling = this.supportsToolCalling(modelInfo);
        const useAgenticServerTools = agenticWebToolsEnabled && supportsToolCalling;

        const finalEnabled = webSearch.enabled && canUseWebSearch && modelSupportsWebSearch
            && (useAgenticServerTools || !agenticWebToolsEnabled);

        const additionalCost = finalEnabled && !isUsingOwnApiKeys ? WEB_SEARCH_COST : 0;

        logDiagnostic('WEB_SEARCH_VALIDATION_COMPLETE', 'Web search validation completed', {
            requestId,
            requested: webSearch.enabled,
            canUse: canUseWebSearch,
            modelSupports: modelSupportsWebSearch,
            supportsToolCalling,
            useAgenticServerTools,
            finalEnabled,
            additionalCost
        });

        return {
            enabled: finalEnabled,
            contextSize: webSearch.contextSize,
            canUseWebSearch,
            modelSupportsWebSearch,
            supportsToolCalling,
            useAgenticServerTools,
            additionalCost
        };
    }

    /**
     * Whether the model can invoke OpenRouter server tools (required for agentic web search).
     */
    static supportsToolCalling(modelInfo: ModelInfo | null): boolean {
        if (modelInfo?.supportsToolCalling === true) {
            return true;
        }

        if (modelInfo?.capabilities?.includes('Tools')) {
            return true;
        }

        // OpenRouter models with web search enabled historically support tools in ChatLima
        return modelInfo?.supportsWebSearch === true;
    }

    /**
     * Build OpenRouter server-side web search tool(s) for streamText tools map.
     */
    static buildOpenRouterServerTools(
        openrouterClient: OpenRouterProvider,
        config: OpenRouterServerToolsConfig
    ): Record<string, ReturnType<OpenRouterProvider['tools']['webSearch']>> {
        const maxResults = config.maxResults ?? 5;

        return {
            web_search: openrouterClient.tools.webSearch({
                maxResults,
                engine: 'auto',
                searchPrompt: `Use web search when current information is needed. Prefer ${config.contextSize} context depth.`,
            }),
        };
    }

    /**
     * Count web_search tool invocations across multi-step generations.
     */
    static countWebSearchInvocations(steps: Array<{ toolCalls?: ToolCallLike[] }> | undefined): number {
        if (!steps?.length) {
            return 0;
        }

        let count = 0;
        for (const step of steps) {
            for (const call of step.toolCalls ?? []) {
                const name = call.toolName ?? '';
                if (name === 'web_search' || name === 'openrouter.web_search') {
                    count++;
                }
            }
        }
        return count;
    }

    /**
     * Legacy plugin options — used when OPENROUTER_AGENTIC_WEB_TOOLS_ENABLED=false.
     */
    static createWebSearchOptions(result: WebSearchResult): {
        web_search_options?: { search_context_size: 'low' | 'medium' | 'high' };
    } {
        if (!result.enabled || result.useAgenticServerTools) {
            return {};
        }

        return {
            web_search_options: {
                search_context_size: result.contextSize
            }
        };
    }

    /**
     * Legacy :online model suffix — used when agentic server tools are disabled.
     */
    static getWebSearchModelId(selectedModel: string, result: WebSearchResult): string {
        if (!result.enabled || result.useAgenticServerTools) {
            return selectedModel;
        }

        if (selectedModel.startsWith('openrouter/') && result.modelSupportsWebSearch) {
            const baseModel = selectedModel.replace('openrouter/', '');
            return `openrouter/${baseModel}:online`;
        }

        return selectedModel;
    }

    static computeWebSearchCreditCost(params: {
        webSearchEnabled: boolean;
        useAgenticServerTools: boolean;
        isUsingOwnApiKeys: boolean;
        shouldDeductCredits: boolean;
        steps?: Array<{ toolCalls?: ToolCallLike[] }>;
        hasCitationAnnotations?: boolean;
    }): number {
        const {
            webSearchEnabled,
            useAgenticServerTools,
            isUsingOwnApiKeys,
            shouldDeductCredits,
            steps,
            hasCitationAnnotations,
        } = params;

        if (!webSearchEnabled || isUsingOwnApiKeys || !shouldDeductCredits) {
            return 0;
        }

        if (useAgenticServerTools) {
            const invocations = this.countWebSearchInvocations(steps);
            return invocations * WEB_SEARCH_COST;
        }

        // Legacy plugin path: flat fee when web search was enabled for the request
        return WEB_SEARCH_COST;
    }

    private static determineWebSearchPermission(context: {
        webSearch: WebSearchOptions;
        isUsingOwnApiKeys: boolean;
        isAnonymous: boolean;
        actualCredits: number | null;
        requestId: string;
    }): boolean {
        const { webSearch, isUsingOwnApiKeys, isAnonymous, actualCredits, requestId } = context;

        if (isUsingOwnApiKeys && webSearch.enabled) {
            logDiagnostic('WEB_SEARCH_PERMISSION', 'Allowed for user with own API keys', { requestId });
            return true;
        }

        if (isAnonymous) {
            logDiagnostic('WEB_SEARCH_PERMISSION', 'Blocked for anonymous user', { requestId });
            return false;
        }

        if (actualCredits !== null && actualCredits >= WEB_SEARCH_COST) {
            logDiagnostic('WEB_SEARCH_PERMISSION', 'Allowed for user with sufficient credits', {
                requestId,
                actualCredits,
                cost: WEB_SEARCH_COST
            });
            return webSearch.enabled;
        }

        if (actualCredits !== null && actualCredits < WEB_SEARCH_COST) {
            logDiagnostic('WEB_SEARCH_PERMISSION', 'Blocked due to insufficient credits', {
                requestId,
                actualCredits,
                required: WEB_SEARCH_COST
            });
        }

        return false;
    }

    private static checkModelWebSearchSupport(
        modelInfo: ModelInfo | null,
        selectedModel: string,
        requestId: string
    ): boolean {
        if (!selectedModel.startsWith('openrouter/')) {
            logDiagnostic('WEB_SEARCH_MODEL_SUPPORT', 'Web search not supported - not an OpenRouter model', {
                requestId,
                selectedModel
            });
            return false;
        }

        if (modelInfo?.supportsWebSearch === true) {
            logDiagnostic('WEB_SEARCH_MODEL_SUPPORT', 'Web search supported by model', {
                requestId,
                selectedModel,
                modelId: modelInfo.id
            });
            return true;
        }

        logDiagnostic('WEB_SEARCH_MODEL_SUPPORT', 'Web search not supported by model', {
            requestId,
            selectedModel,
            supportsWebSearch: modelInfo?.supportsWebSearch
        });
        return false;
    }

    static validateWebSearchRequest(context: WebSearchContext): void {
        const { webSearch, isAnonymous, actualCredits, isUsingOwnApiKeys } = context;

        if (webSearch.enabled && isAnonymous) {
            throw new Error('Web Search is only available to signed-in users with credits. Please sign in and purchase credits to use this feature.');
        }

        if (webSearch.enabled && !isUsingOwnApiKeys && actualCredits !== null && actualCredits < WEB_SEARCH_COST) {
            throw new Error(`You need at least ${WEB_SEARCH_COST} credits to use Web Search. Your balance is ${actualCredits}.`);
        }
    }
}
