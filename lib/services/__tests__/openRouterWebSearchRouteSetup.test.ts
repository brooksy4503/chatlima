import type { LanguageModel } from 'ai';
import type { OpenRouterProvider } from '@openrouter/ai-sdk-provider';
import { resolveOpenRouterWebSearchRouteSetup } from '../openRouterWebSearchRouteSetup';
import { ChatWebSearchService } from '../chatWebSearchService';
import type { WebSearchResult } from '../chatWebSearchService';
import type { ModelInfo } from '@/lib/types/models';

describe('resolveOpenRouterWebSearchRouteSetup', () => {
    const baseModel = { modelId: 'base-model' } as LanguageModel;
    const legacyModel = { modelId: 'legacy-online-model' } as LanguageModel;
    const wrappedLegacyModel = { modelId: 'wrapped-legacy-model' } as LanguageModel;

    const webSearchTool = { type: 'provider-tool', name: 'web_search' };

    const mockOpenRouterClient = Object.assign(
        jest.fn(() => legacyModel),
        {
            tools: {
                webSearch: jest.fn(() => webSearchTool),
            },
        }
    ) as unknown as OpenRouterProvider;

    const mockOpenRouterClientFactory = jest.fn(() => mockOpenRouterClient);
    const mockGetLanguageModelWithKeys = jest.fn(() => baseModel);
    const mockUsesTagBasedReasoningExtraction = jest.fn(() => false);
    const mockWrapWithTagBasedReasoning = jest.fn((model: LanguageModel) => wrappedLegacyModel);

    const modelInfo: ModelInfo = {
        id: 'openrouter/openai/gpt-4',
        provider: 'openai',
        name: 'GPT-4',
        premium: false,
        vision: true,
        supportsWebSearch: true,
        supportsToolCalling: true,
        capabilities: ['text', 'Tools'],
        status: 'available',
        lastChecked: new Date(),
    };

    const createWebSearchConfig = (overrides: Partial<WebSearchResult> = {}): WebSearchResult => ({
        enabled: true,
        contextSize: 'medium',
        canUseWebSearch: true,
        modelSupportsWebSearch: true,
        supportsToolCalling: true,
        useAgenticServerTools: true,
        additionalCost: 25,
        ...overrides,
    });

    const runSetup = (overrides: Partial<Parameters<typeof resolveOpenRouterWebSearchRouteSetup>[0]> = {}) =>
        resolveOpenRouterWebSearchRouteSetup({
            selectedModel: 'openrouter/openai/gpt-4',
            webSearchConfig: createWebSearchConfig(),
            modelInfo,
            apiKeys: { OPENROUTER_API_KEY: 'sk-or-test' },
            openrouterUserId: 'chatlima_user_test',
            getLanguageModelWithKeys: mockGetLanguageModelWithKeys,
            createOpenRouterClientWithKey: mockOpenRouterClientFactory,
            usesTagBasedReasoningExtraction: mockUsesTagBasedReasoningExtraction,
            wrapWithTagBasedReasoning: mockWrapWithTagBasedReasoning,
            ...overrides,
        });

    beforeEach(() => {
        jest.clearAllMocks();
        mockOpenRouterClientFactory.mockReturnValue(mockOpenRouterClient);
        (mockOpenRouterClient as unknown as jest.Mock).mockReturnValue(legacyModel);
    });

    it('uses agentic server tools for supported OpenRouter models', () => {
        const buildSpy = jest.spyOn(ChatWebSearchService, 'buildOpenRouterServerTools');

        const result = runSetup();

        expect(mockGetLanguageModelWithKeys).toHaveBeenCalledWith(
            'openrouter/openai/gpt-4',
            { OPENROUTER_API_KEY: 'sk-or-test' },
            'chatlima_user_test'
        );
        expect(buildSpy).toHaveBeenCalledWith(mockOpenRouterClient, {
            contextSize: 'medium',
            maxTotalResults: ChatWebSearchService.DEFAULT_MAX_TOTAL_RESULTS,
        });
        expect(result.modelInstance).toBe(baseModel);
        expect(result.effectiveWebSearchEnabled).toBe(true);
        expect(result.openRouterServerTools).toEqual({ web_search: webSearchTool });
        expect(result.modelOptions).toEqual({});
    });

    it('uses legacy :online model path when agentic tools are disabled', () => {
        const result = runSetup({
            webSearchConfig: createWebSearchConfig({ useAgenticServerTools: false }),
        });

        expect(mockOpenRouterClient).toHaveBeenCalledWith('openai/gpt-4:online');
        expect(result.modelInstance).toBe(legacyModel);
        expect(result.effectiveWebSearchEnabled).toBe(true);
        expect(result.openRouterServerTools).toEqual({});
        expect(result.modelOptions).toEqual({
            web_search_options: { search_context_size: 'medium' },
        });
    });

    it('wraps legacy models that use tag-based reasoning extraction', () => {
        mockUsesTagBasedReasoningExtraction.mockReturnValue(true);

        const result = runSetup({
            selectedModel: 'openrouter/deepseek/deepseek-r1',
            webSearchConfig: createWebSearchConfig({ useAgenticServerTools: false }),
        });

        expect(mockOpenRouterClient).toHaveBeenCalledWith(
            'deepseek/deepseek-r1:online',
            { logprobs: false }
        );
        expect(mockWrapWithTagBasedReasoning).toHaveBeenCalledWith(legacyModel);
        expect(result.modelInstance).toBe(wrappedLegacyModel);
    });

    it('falls back to standard model when web search is unsupported by model metadata', () => {
        const result = runSetup({
            modelInfo: { ...modelInfo, supportsWebSearch: false },
        });

        expect(result.modelInstance).toBe(baseModel);
        expect(result.effectiveWebSearchEnabled).toBe(false);
        expect(result.openRouterServerTools).toEqual({});
        expect(result.modelOptions).toEqual({});
    });

    it('falls back to standard model for non-OpenRouter selections', () => {
        const result = runSetup({
            selectedModel: 'anthropic/claude-3-haiku',
        });

        expect(mockOpenRouterClientFactory).not.toHaveBeenCalled();
        expect(result.modelInstance).toBe(baseModel);
        expect(result.effectiveWebSearchEnabled).toBe(false);
        expect(result.openRouterServerTools).toEqual({});
    });

    it('falls back when agentic tools are requested but OpenRouter client is unavailable', () => {
        mockOpenRouterClientFactory.mockReturnValue(null);

        const result = runSetup();

        expect(result.modelInstance).toBe(baseModel);
        expect(result.effectiveWebSearchEnabled).toBe(false);
        expect(result.openRouterServerTools).toEqual({});
    });
});
