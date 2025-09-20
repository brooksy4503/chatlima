import { ChatWebSearchService, WebSearchContext } from '../chatWebSearchService';

// Mock dependencies
jest.mock('@/lib/models/fetch-models', () => ({
    getModelDetails: jest.fn()
}));

jest.mock('@/lib/tokenCounter', () => ({
    WEB_SEARCH_COST: 10
}));

jest.mock('@/lib/utils/performantLogging', () => ({
    logDiagnostic: jest.fn()
}));

import { getModelDetails } from '@/lib/models/fetch-models';
import { WEB_SEARCH_COST } from '@/lib/tokenCounter';
import { logDiagnostic } from '@/lib/utils/performantLogging';

describe('ChatWebSearchService', () => {
    const mockGetModelDetails = getModelDetails as jest.MockedFunction<typeof getModelDetails>;
    const mockLogDiagnostic = logDiagnostic as jest.MockedFunction<typeof logDiagnostic>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const createMockContext = (overrides: Partial<WebSearchContext> = {}): WebSearchContext => ({
        webSearch: {
            enabled: true,
            contextSize: 'medium'
        },
        selectedModel: 'openai/gpt-4',
        isUsingOwnApiKeys: false,
        isAnonymous: false,
        actualCredits: 50,
        modelInfo: {
            id: 'openai/gpt-4',
            provider: 'openai',
            name: 'GPT-4',
            premium: false,
            vision: true,
            supportsWebSearch: true,
            capabilities: ['text', 'vision'],
            status: 'available',
            lastChecked: new Date()
        },
        ...overrides
    });

    describe('validateAndConfigureWebSearch', () => {
        it('should configure web search successfully when all conditions met', () => {
            const context = createMockContext();

            const result = ChatWebSearchService.validateAndConfigureWebSearch(context);

            expect(result).toEqual({
                enabled: true,
                contextSize: 'medium',
                canUseWebSearch: true,
                modelSupportsWebSearch: true,
                additionalCost: WEB_SEARCH_COST
            });

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'WEB_SEARCH_VALIDATION_START',
                'Starting web search validation',
                expect.objectContaining({
                    enabled: true,
                    selectedModel: 'openai/gpt-4',
                    isUsingOwnApiKeys: false,
                    isAnonymous: false,
                    actualCredits: 50
                })
            );

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'WEB_SEARCH_VALIDATION_COMPLETE',
                'Web search validation completed',
                expect.objectContaining({
                    requested: true,
                    canUse: true,
                    modelSupports: true,
                    finalEnabled: true,
                    additionalCost: WEB_SEARCH_COST
                })
            );
        });

        it('should disable web search when not requested', () => {
            const context = createMockContext({
                webSearch: { enabled: false, contextSize: 'medium' }
            });

            const result = ChatWebSearchService.validateAndConfigureWebSearch(context);

            expect(result).toEqual({
                enabled: false,
                contextSize: 'medium',
                canUseWebSearch: true,
                modelSupportsWebSearch: true,
                additionalCost: 0
            });
        });

        it('should allow web search for users with own API keys', () => {
            const context = createMockContext({
                isUsingOwnApiKeys: true,
                actualCredits: 0
            });

            const result = ChatWebSearchService.validateAndConfigureWebSearch(context);

            expect(result).toEqual({
                enabled: true,
                contextSize: 'medium',
                canUseWebSearch: true,
                modelSupportsWebSearch: true,
                additionalCost: 0
            });
        });

        it('should block web search for anonymous users', () => {
            const context = createMockContext({
                isAnonymous: true,
                actualCredits: 100
            });

            const result = ChatWebSearchService.validateAndConfigureWebSearch(context);

            expect(result).toEqual({
                enabled: false,
                contextSize: 'medium',
                canUseWebSearch: false,
                modelSupportsWebSearch: true,
                additionalCost: 0
            });

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'WEB_SEARCH_PERMISSION',
                'Blocked for anonymous user',
                expect.any(Object)
            );
        });

        it('should block web search for users with insufficient credits', () => {
            const context = createMockContext({
                actualCredits: 5
            });

            const result = ChatWebSearchService.validateAndConfigureWebSearch(context);

            expect(result).toEqual({
                enabled: false,
                contextSize: 'medium',
                canUseWebSearch: false,
                modelSupportsWebSearch: true,
                additionalCost: 0
            });

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'WEB_SEARCH_PERMISSION',
                'Blocked due to insufficient credits',
                expect.objectContaining({
                    actualCredits: 5,
                    required: WEB_SEARCH_COST
                })
            );
        });

        it('should block web search for non-OpenRouter models', () => {
            const context = createMockContext({
                selectedModel: 'anthropic/claude-3',
                modelInfo: {
                    id: 'anthropic/claude-3',
                    provider: 'anthropic',
                    name: 'Claude 3',
                    premium: false,
                    vision: true,
                    supportsWebSearch: false,
                    capabilities: ['text'],
                    status: 'available',
                    lastChecked: new Date()
                }
            });

            const result = ChatWebSearchService.validateAndConfigureWebSearch(context);

            expect(result).toEqual({
                enabled: false,
                contextSize: 'medium',
                canUseWebSearch: true,
                modelSupportsWebSearch: false,
                additionalCost: 0
            });

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'WEB_SEARCH_MODEL_SUPPORT',
                'Web search not supported - not an OpenRouter model',
                expect.objectContaining({ selectedModel: 'anthropic/claude-3' })
            );
        });

        it('should handle model that does not support web search', () => {
            const context = createMockContext({
                modelInfo: {
                    id: 'openai/gpt-4',
                    provider: 'openai',
                    name: 'GPT-4',
                    premium: false,
                    vision: true,
                    supportsWebSearch: false,
                    capabilities: ['text'],
                    status: 'available',
                    lastChecked: new Date()
                }
            });

            const result = ChatWebSearchService.validateAndConfigureWebSearch(context);

            expect(result).toEqual({
                enabled: false,
                contextSize: 'medium',
                canUseWebSearch: true,
                modelSupportsWebSearch: false,
                additionalCost: 0
            });

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'WEB_SEARCH_MODEL_SUPPORT',
                'Web search not supported by model',
                expect.objectContaining({
                    selectedModel: 'openai/gpt-4',
                    supportsWebSearch: false
                })
            );
        });

        it('should handle null model info', () => {
            const context = createMockContext({
                modelInfo: null
            });

            const result = ChatWebSearchService.validateAndConfigureWebSearch(context);

            expect(result).toEqual({
                enabled: false,
                contextSize: 'medium',
                canUseWebSearch: true,
                modelSupportsWebSearch: false,
                additionalCost: 0
            });
        });
    });

    describe('createWebSearchOptions', () => {
        it('should create web search options when enabled', () => {
            const result = {
                enabled: true,
                contextSize: 'high' as const,
                canUseWebSearch: true,
                modelSupportsWebSearch: true,
                additionalCost: WEB_SEARCH_COST
            };

            const options = ChatWebSearchService.createWebSearchOptions(result);

            expect(options).toEqual({
                web_search_options: {
                    search_context_size: 'high'
                }
            });
        });

        it('should return empty object when disabled', () => {
            const result = {
                enabled: false,
                contextSize: 'medium' as const,
                canUseWebSearch: true,
                modelSupportsWebSearch: true,
                additionalCost: 0
            };

            const options = ChatWebSearchService.createWebSearchOptions(result);

            expect(options).toEqual({});
        });
    });

    describe('getWebSearchModelId', () => {
        it('should return original model ID when web search disabled', () => {
            const result = {
                enabled: false,
                contextSize: 'medium' as const,
                canUseWebSearch: true,
                modelSupportsWebSearch: true,
                additionalCost: 0
            };

            const modelId = ChatWebSearchService.getWebSearchModelId('openai/gpt-4', result);

            expect(modelId).toBe('openai/gpt-4');
        });

        it('should return web search variant for OpenRouter models', () => {
            const result = {
                enabled: true,
                contextSize: 'medium' as const,
                canUseWebSearch: true,
                modelSupportsWebSearch: true,
                additionalCost: WEB_SEARCH_COST
            };

            const modelId = ChatWebSearchService.getWebSearchModelId('openrouter/anthropic/claude-3', result);

            expect(modelId).toBe('openrouter/anthropic/claude-3:online');
        });

        it('should return original model ID for non-OpenRouter models', () => {
            const result = {
                enabled: true,
                contextSize: 'medium' as const,
                canUseWebSearch: true,
                modelSupportsWebSearch: true,
                additionalCost: WEB_SEARCH_COST
            };

            const modelId = ChatWebSearchService.getWebSearchModelId('anthropic/claude-3', result);

            expect(modelId).toBe('anthropic/claude-3');
        });
    });

    describe('validateWebSearchRequest', () => {
        it('should not throw when web search not requested', () => {
            const context = createMockContext({
                webSearch: { enabled: false, contextSize: 'medium' }
            });

            expect(() => {
                ChatWebSearchService.validateWebSearchRequest(context);
            }).not.toThrow();
        });

        it('should throw error for anonymous users requesting web search', () => {
            const context = createMockContext({
                isAnonymous: true,
                webSearch: { enabled: true, contextSize: 'medium' }
            });

            expect(() => {
                ChatWebSearchService.validateWebSearchRequest(context);
            }).toThrow('Web Search is only available to signed-in users with credits. Please sign in and purchase credits to use this feature.');
        });

        it('should throw error for users with insufficient credits', () => {
            const context = createMockContext({
                actualCredits: 5,
                webSearch: { enabled: true, contextSize: 'medium' }
            });

            expect(() => {
                ChatWebSearchService.validateWebSearchRequest(context);
            }).toThrow(`You need at least ${WEB_SEARCH_COST} credits to use Web Search. Your balance is 5.`);
        });

        it('should not throw for users with own API keys', () => {
            const context = createMockContext({
                isUsingOwnApiKeys: true,
                actualCredits: 0,
                webSearch: { enabled: true, contextSize: 'medium' }
            });

            expect(() => {
                ChatWebSearchService.validateWebSearchRequest(context);
            }).not.toThrow();
        });

        it('should not throw for users with sufficient credits', () => {
            const context = createMockContext({
                actualCredits: 15,
                webSearch: { enabled: true, contextSize: 'medium' }
            });

            expect(() => {
                ChatWebSearchService.validateWebSearchRequest(context);
            }).not.toThrow();
        });
    });
});