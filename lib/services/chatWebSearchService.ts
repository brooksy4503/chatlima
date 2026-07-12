import type { OpenRouterProvider } from '@openrouter/ai-sdk-provider';
import type { UIMessage } from 'ai';
import type { ModelInfo } from '@/lib/types/models';
import { isWebSearchToolPart } from '@/lib/message-utils';
import { OpenRouterCostTracker } from '@/lib/services/openrouterCostTracker';
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

type ToolCallLike = {
    toolName?: string;
    name?: string;
    tool?: string;
    toolCallId?: string;
    type?: string;
    function?: { name?: string };
};

type StepLike = {
    toolCalls?: ToolCallLike[];
    staticToolCalls?: ToolCallLike[];
    dynamicToolCalls?: ToolCallLike[];
    content?: Array<{ type?: string; toolName?: string; name?: string }>;
    response?: { id?: string };
    usage?: UsageLike | null;
};

type ServerToolUseLike = {
    web_search_requests?: number;
};

type UsageLike = {
    raw?: {
        // OpenRouter agentic streams use server_tool_use_details; keep server_tool_use for older shapes.
        server_tool_use_details?: ServerToolUseLike;
        server_tool_use?: ServerToolUseLike;
    };
    server_tool_use_details?: ServerToolUseLike;
    server_tool_use?: ServerToolUseLike;
};

type OpenRouterGenerationLike = {
    usage_web?: number | null;
    num_search_results?: number | null;
    web_search_engine?: string | null;
    server_tool_use_details?: ServerToolUseLike;
    server_tool_use?: ServerToolUseLike;
};

export type ResolveWebSearchInvocationCountParams = {
    steps?: StepLike[];
    toolCalls?: ToolCallLike[];
    parts?: UIMessage['parts'];
    usage?: UsageLike | null;
    openRouterGenerations?: Array<OpenRouterGenerationLike | null | undefined>;
};

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

    /** Whether a streamed / persisted tool name represents web search. */
    static isWebSearchToolName(toolName: string): boolean {
        return (
            toolName === 'web_search' ||
            toolName === 'web_search_exa' ||
            toolName === 'openrouter.web_search' ||
            toolName === 'openrouter:web_search' ||
            toolName.endsWith('.web_search') ||
            toolName.endsWith(':web_search')
        );
    }

    /** Normalize tool-call name across AI SDK / provider shapes. */
    static getToolCallName(call: ToolCallLike | null | undefined): string {
        if (!call) {
            return '';
        }

        return (
            call.toolName ||
            call.name ||
            call.tool ||
            call.function?.name ||
            ''
        );
    }

    /**
     * OpenRouter native server search reports usage here when tool-call stream events are absent.
     */
    static getServerToolWebSearchRequests(usage: UsageLike | null | undefined): number {
        // ponytail: OpenRouter agentic usage.raw.server_tool_use_details (not server_tool_use)
        const candidates = [
            usage?.raw?.server_tool_use_details?.web_search_requests,
            usage?.raw?.server_tool_use?.web_search_requests,
            usage?.server_tool_use_details?.web_search_requests,
            usage?.server_tool_use?.web_search_requests,
        ];
        for (const value of candidates) {
            if (typeof value === 'number' && value > 0) {
                return value;
            }
        }
        return 0;
    }

    static countWebSearchToolCalls(toolCalls: ToolCallLike[] | undefined): number {
        if (!toolCalls?.length) {
            return 0;
        }

        let count = 0;
        for (const call of toolCalls) {
            if (this.isWebSearchToolName(this.getToolCallName(call))) {
                count++;
            }
        }
        return count;
    }

    /** Count unique web_search calls on a single step (avoids double-counting aliases). */
    static countWebSearchInvocationsOnStep(step: StepLike): number {
        const seen = new Set<string>();
        let fromCalls = 0;

        const consider = (calls: ToolCallLike[] | undefined) => {
            for (const call of calls ?? []) {
                const name = this.getToolCallName(call);
                if (!this.isWebSearchToolName(name)) {
                    continue;
                }
                const key = call.toolCallId || name;
                if (seen.has(key)) {
                    continue;
                }
                seen.add(key);
                fromCalls++;
            }
        };

        consider(step.toolCalls);
        consider(step.staticToolCalls);
        consider(step.dynamicToolCalls);

        for (const part of step.content ?? []) {
            if (part.type !== 'tool-call' && part.type !== 'tool-result') {
                continue;
            }
            const name = this.getToolCallName(part);
            if (!this.isWebSearchToolName(name)) {
                continue;
            }
            const key = name;
            if (seen.has(key)) {
                continue;
            }
            seen.add(key);
            fromCalls++;
        }

        return Math.max(fromCalls, this.getServerToolWebSearchRequests(step.usage));
    }

    /**
     * Count web_search tool invocations across multi-step generations.
     */
    static countWebSearchInvocations(steps: StepLike[] | undefined): number {
        if (!steps?.length) {
            return 0;
        }

        let count = 0;
        for (const step of steps) {
            count += this.countWebSearchInvocationsOnStep(step);
        }
        return count;
    }

    /** Count web_search tool parts on a UI message (stream or persisted). */
    static countWebSearchMessageParts(parts: UIMessage['parts'] | undefined): number {
        if (!parts?.length) {
            return 0;
        }

        return parts.filter((part) => isWebSearchToolPart(part)).length;
    }

    /**
     * OpenRouter generation payload signals that web search was billed/used.
     * When invocation count is unknown, treat any positive web usage as ≥1 search.
     */
    static countWebSearchFromOpenRouterGeneration(
        generation: OpenRouterGenerationLike | null | undefined
    ): number {
        if (!generation) {
            return 0;
        }

        const fromServer = this.getServerToolWebSearchRequests(generation);
        if (fromServer > 0) {
            return fromServer;
        }

        const usageWeb = generation.usage_web;
        if (typeof usageWeb === 'number' && usageWeb > 0) {
            return 1;
        }

        if (typeof generation.web_search_engine === 'string' && generation.web_search_engine.length > 0) {
            return 1;
        }

        if (
            typeof generation.num_search_results === 'number' &&
            generation.num_search_results > 0
        ) {
            return 1;
        }

        return 0;
    }

    static collectOpenRouterGenerationIds(params: {
        response?: {
            id?: string;
            generation_id?: string;
            generationId?: string;
            body?: { id?: string; generation_id?: string; generationId?: string } | null;
        } | null;
        steps?: StepLike[];
    }): string[] {
        const ids: string[] = [];
        const add = (id: unknown) => {
            if (typeof id === 'string' && id.length > 0 && !ids.includes(id)) {
                // OpenRouter generation ids are `gen-...`; ignore unrelated ids.
                if (id.startsWith('gen-') || id.startsWith('gen')) {
                    ids.push(id);
                }
            }
        };

        for (const step of params.steps ?? []) {
            add(step.response?.id);
            const body = (step.response as { body?: { id?: string } } | undefined)?.body;
            add(body?.id);
        }

        add(params.response?.id);
        add(params.response?.generation_id);
        add(params.response?.generationId);
        add(params.response?.body?.id);
        add(params.response?.body?.generation_id);
        add(params.response?.body?.generationId);

        return ids;
    }

    /**
     * Resolve how many web searches ran from stream tool calls, UI parts,
     * server_tool_use metadata, and/or OpenRouter generation payloads.
     */
    static resolveWebSearchInvocationCount(
        params: ResolveWebSearchInvocationCountParams
    ): number {
        const fromSteps = this.countWebSearchInvocations(params.steps);
        const fromFlat = this.countWebSearchToolCalls(params.toolCalls);
        const fromParts = this.countWebSearchMessageParts(params.parts);
        const fromServer = this.getServerToolWebSearchRequests(params.usage);
        let fromGenerations = 0;
        for (const generation of params.openRouterGenerations ?? []) {
            fromGenerations = Math.max(
                fromGenerations,
                this.countWebSearchFromOpenRouterGeneration(generation)
            );
        }

        return Math.max(fromSteps, fromFlat, fromParts, fromServer, fromGenerations);
    }

    /**
     * When stream metadata misses provider-executed searches, fetch OpenRouter
     * generation records (usage_web / num_search_results) as a billing backstop.
     */
    static async resolveWebSearchInvocationCountWithFallback(params: {
        steps?: StepLike[];
        toolCalls?: ToolCallLike[];
        parts?: UIMessage['parts'];
        usage?: UsageLike | null;
        response?: { id?: string; generation_id?: string; generationId?: string } | null;
        apiKeyOverride?: string;
        enableOpenRouterFallback: boolean;
    }): Promise<number> {
        const syncCount = this.resolveWebSearchInvocationCount({
            steps: params.steps,
            toolCalls: params.toolCalls,
            parts: params.parts,
            usage: params.usage,
        });

        if (syncCount > 0 || !params.enableOpenRouterFallback) {
            return syncCount;
        }

        const generationIds = this.collectOpenRouterGenerationIds({
            response: params.response,
            steps: params.steps,
        });

        if (generationIds.length === 0) {
            return 0;
        }

        // Prefer the newest ids (final multi-step generation usually carries usage_web).
        const idsToFetch = generationIds.slice(-3);
        const generations: OpenRouterGenerationLike[] = [];

        for (const generationId of idsToFetch) {
            try {
                const result = await OpenRouterCostTracker.fetchActualCost(
                    generationId,
                    params.apiKeyOverride
                );
                if (result.generationData && typeof result.generationData === 'object') {
                    generations.push(result.generationData as OpenRouterGenerationLike);
                }
            } catch (error) {
                logDiagnostic('WEB_SEARCH_OR_FALLBACK_ERROR', 'Failed fetching OR generation for web billing', {
                    generationId,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }

        return this.resolveWebSearchInvocationCount({
            steps: params.steps,
            toolCalls: params.toolCalls,
            parts: params.parts,
            usage: params.usage,
            openRouterGenerations: generations,
        });
    }

    /** Whether a response actually used web search (for hasWebSearch flag and synthetic tool UI). */
    static messageUsedWebSearch(params: {
        steps?: StepLike[];
        toolCalls?: ToolCallLike[];
        parts?: UIMessage['parts'];
        usage?: UsageLike | null;
        openRouterGenerations?: Array<OpenRouterGenerationLike | null | undefined>;
        hasCitationAnnotations?: boolean;
        invocationCount?: number;
    }): boolean {
        const invocations =
            params.invocationCount ??
            this.resolveWebSearchInvocationCount({
                steps: params.steps,
                toolCalls: params.toolCalls,
                parts: params.parts,
                usage: params.usage,
                openRouterGenerations: params.openRouterGenerations,
            });

        if (invocations > 0) {
            return true;
        }

        return params.hasCitationAnnotations === true;
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
        steps?: StepLike[];
        toolCalls?: ToolCallLike[];
        parts?: UIMessage['parts'];
        usage?: UsageLike | null;
        openRouterGenerations?: Array<OpenRouterGenerationLike | null | undefined>;
        invocationCount?: number;
        hasCitationAnnotations?: boolean;
    }): number {
        const {
            webSearchEnabled,
            useAgenticServerTools,
            isUsingOwnApiKeys,
            shouldDeductCredits,
        } = params;

        if (!webSearchEnabled || isUsingOwnApiKeys || !shouldDeductCredits) {
            return 0;
        }

        if (useAgenticServerTools) {
            const invocations =
                params.invocationCount ??
                this.resolveWebSearchInvocationCount({
                    steps: params.steps,
                    toolCalls: params.toolCalls,
                    parts: params.parts,
                    usage: params.usage,
                    openRouterGenerations: params.openRouterGenerations,
                });
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
