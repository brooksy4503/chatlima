import { ChatTokenTrackingService, TokenTrackingContext } from '../chatTokenTrackingService';

// Mock dependencies
jest.mock('@/lib/services/directTokenTracking', () => ({
    DirectTokenTrackingService: {
        processTokenUsage: jest.fn()
    }
}));

jest.mock('@/lib/utils/performantLogging', () => ({
    logDiagnostic: jest.fn()
}));

import { DirectTokenTrackingService } from '@/lib/services/directTokenTracking';
import { logDiagnostic } from '@/lib/utils/performantLogging';

describe('ChatTokenTrackingService', () => {
    const mockDirectTokenTrackingService = DirectTokenTrackingService as jest.Mocked<typeof DirectTokenTrackingService>;
    const mockProcessTokenUsage = mockDirectTokenTrackingService.processTokenUsage as jest.MockedFunction<typeof DirectTokenTrackingService.processTokenUsage>;
    const mockLogDiagnostic = logDiagnostic as jest.MockedFunction<typeof logDiagnostic>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const createMockContext = (overrides: Partial<TokenTrackingContext> = {}): TokenTrackingContext => ({
        userId: 'user123',
        chatId: 'chat456',
        messageId: 'msg789',
        selectedModel: 'openai/gpt-4',
        provider: 'openai',
        polarCustomerId: 'polar123',
        isAnonymous: false,
        isUsingOwnApiKeys: false,
        shouldDeductCredits: true,
        webSearchEnabled: false,
        webSearchCost: 10,
        apiKeys: { 'OPENROUTER_API_KEY': 'sk-test' },
        ...overrides
    });

    const createMockResponse = (overrides: any = {}) => ({
        messages: [],
        annotations: [],
        body: {},
        usage: {
            promptTokens: 100,
            completionTokens: 50,
            totalTokens: 150,
            inputTokens: 100,
            outputTokens: 50,
            prompt_tokens: 100,
            completion_tokens: 50
        },
        ...overrides
    });

    describe('processTokenTracking', () => {
        it('should process token tracking successfully', async () => {
            const context = createMockContext();
            const response = createMockResponse();
            const event = { usage: { promptTokens: 100, completionTokens: 50 } };
            const requestStartTime = Date.now() - 1000;
            const timeToFirstTokenMs = 500;

            mockProcessTokenUsage.mockResolvedValue(undefined);

            const result = await ChatTokenTrackingService.processTokenTracking(
                context,
                response,
                event,
                requestStartTime,
                timeToFirstTokenMs
            );

            expect(result).toEqual({
                inputTokens: 100,
                outputTokens: 50,
                totalTokens: 150,
                estimatedCost: 0,
                actualCost: undefined,
                processingTimeMs: expect.any(Number),
                timeToFirstTokenMs: 500,
                tokensPerSecond: expect.any(Number),
                streamingStartTime: undefined
            });

            expect(mockProcessTokenUsage).toHaveBeenCalledWith({
                userId: 'user123',
                chatId: 'chat456',
                messageId: 'msg789',
                modelId: 'openai/gpt-4',
                provider: 'openai',
                inputTokens: 100,
                outputTokens: 50,
                generationId: undefined,
                openRouterResponse: response,
                providerResponse: response,
                apiKeyOverride: 'sk-test',
                processingTimeMs: expect.any(Number),
                timeToFirstTokenMs: 500,
                tokensPerSecond: expect.any(Number),
                streamingStartTime: undefined,
                polarCustomerId: 'polar123',
                completionTokens: 50,
                isAnonymous: false,
                shouldDeductCredits: true,
                additionalCost: 0
            });

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'TOKEN_TRACKING_PROCESS_START',
                'Starting token tracking process',
                expect.objectContaining({
                    requestId: expect.any(String),
                    userId: 'user123',
                    chatId: 'chat456'
                })
            );
        });

        it('should handle web search additional cost', async () => {
            const context = createMockContext({
                webSearchEnabled: true,
                webSearchCost: 10
            });
            const response = createMockResponse();
            const event = { usage: { promptTokens: 100, completionTokens: 50 } };
            const requestStartTime = Date.now() - 1000;

            mockProcessTokenUsage.mockResolvedValue(undefined);

            await ChatTokenTrackingService.processTokenTracking(
                context,
                response,
                event,
                requestStartTime
            );

            expect(mockProcessTokenUsage).toHaveBeenCalledWith(
                expect.objectContaining({
                    additionalCost: 10
                })
            );
        });

        it('should skip additional cost for users with own API keys', async () => {
            const context = createMockContext({
                isUsingOwnApiKeys: true,
                webSearchEnabled: true,
                webSearchCost: 10
            });
            const response = createMockResponse();
            const event = { usage: { promptTokens: 100, completionTokens: 50 } };
            const requestStartTime = Date.now() - 1000;

            mockProcessTokenUsage.mockResolvedValue(undefined);

            await ChatTokenTrackingService.processTokenTracking(
                context,
                response,
                event,
                requestStartTime
            );

            expect(mockProcessTokenUsage).toHaveBeenCalledWith(
                expect.objectContaining({
                    additionalCost: 0
                })
            );
        });

        it('should handle missing usage data from event', async () => {
            const context = createMockContext();
            const response = createMockResponse({
                usage: undefined
            });
            const event = {};
            const requestStartTime = Date.now() - 1000;

            mockProcessTokenUsage.mockResolvedValue(undefined);

            const result = await ChatTokenTrackingService.processTokenTracking(
                context,
                response,
                event,
                requestStartTime
            );

            expect(result.inputTokens).toBe(0);
            expect(result.outputTokens).toBe(1); // Minimum fallback
        });

        it('should handle token extraction errors gracefully', async () => {
            const context = createMockContext();
            const response = createMockResponse();
            const event = { usage: { promptTokens: 100, completionTokens: 50 } };
            const requestStartTime = Date.now() - 1000;

            mockProcessTokenUsage.mockRejectedValue(new Error('Tracking failed'));

            await expect(ChatTokenTrackingService.processTokenTracking(
                context,
                response,
                event,
                requestStartTime
            )).rejects.toThrow('Tracking failed');

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'TOKEN_TRACKING_PROCESS_ERROR',
                'Error in token tracking process',
                expect.objectContaining({
                    requestId: expect.any(String),
                    userId: 'user123',
                    error: 'Tracking failed'
                })
            );
        });

        it('should calculate tokens per second correctly', async () => {
            const context = createMockContext();
            const response = createMockResponse();
            const event = { usage: { promptTokens: 100, completionTokens: 50 } };
            const requestStartTime = Date.now() - 2000; // 2 seconds
            const timeToFirstTokenMs = 500;

            mockProcessTokenUsage.mockResolvedValue(undefined);

            const result = await ChatTokenTrackingService.processTokenTracking(
                context,
                response,
                event,
                requestStartTime,
                timeToFirstTokenMs
            );

            // 50 tokens over 1.5 seconds (2s - 0.5s) = ~33.33 tokens/second
            expect(result.tokensPerSecond).toBeCloseTo(50 / 1.5, 1);
        });

        it('should handle OpenRouter provider generation ID', async () => {
            const context = createMockContext({ provider: 'openrouter' });
            const response = createMockResponse({ id: 'gen123' });
            const event = { usage: { promptTokens: 100, completionTokens: 50 } };
            const requestStartTime = Date.now() - 1000;

            mockProcessTokenUsage.mockResolvedValue(undefined);

            await ChatTokenTrackingService.processTokenTracking(
                context,
                response,
                event,
                requestStartTime
            );

            expect(mockProcessTokenUsage).toHaveBeenCalledWith(
                expect.objectContaining({
                    generationId: 'gen123'
                })
            );
        });
    });

    describe('processStoppedStreamTokenTracking', () => {
        it('should process token tracking for stopped streams', async () => {
            const context = createMockContext();
            const currentText = 'This is a test response with some content';
            const requestStartTime = Date.now() - 1000;
            const timeToFirstTokenMs = 300;

            mockProcessTokenUsage.mockResolvedValue(undefined);

            const result = await ChatTokenTrackingService.processStoppedStreamTokenTracking(
                context,
                currentText,
                requestStartTime,
                timeToFirstTokenMs
            );

            // ~4 characters per token estimation
            const expectedOutputTokens = Math.ceil(currentText.length / 4);

            expect(result).toEqual({
                inputTokens: 0,
                outputTokens: expectedOutputTokens,
                totalTokens: expectedOutputTokens,
                estimatedCost: 0,
                processingTimeMs: expect.any(Number),
                timeToFirstTokenMs: 300,
                tokensPerSecond: expect.any(Number),
                streamingStartTime: undefined
            });

            expect(mockProcessTokenUsage).toHaveBeenCalledWith({
                userId: 'user123',
                chatId: 'chat456',
                modelId: 'openai/gpt-4',
                provider: 'openai',
                inputTokens: 0,
                outputTokens: expectedOutputTokens,
                providerResponse: null,
                processingTimeMs: expect.any(Number),
                timeToFirstTokenMs: 300,
                tokensPerSecond: expect.any(Number),
                streamingStartTime: undefined,
                polarCustomerId: 'polar123',
                completionTokens: expectedOutputTokens,
                isAnonymous: false,
                shouldDeductCredits: true,
                additionalCost: 0
            });
        });

        it('should handle empty text gracefully', async () => {
            const context = createMockContext();
            const currentText = '';
            const requestStartTime = Date.now() - 1000;

            mockProcessTokenUsage.mockResolvedValue(undefined);

            const result = await ChatTokenTrackingService.processStoppedStreamTokenTracking(
                context,
                currentText,
                requestStartTime
            );

            expect(result.outputTokens).toBe(0); // Empty text = 0 tokens
            expect(result.totalTokens).toBe(0);
        });

        it('should handle web search cost for stopped streams', async () => {
            const context = createMockContext({
                webSearchEnabled: true,
                webSearchCost: 10
            });
            const currentText = 'Test response';
            const requestStartTime = Date.now() - 1000;

            mockProcessTokenUsage.mockResolvedValue(undefined);

            await ChatTokenTrackingService.processStoppedStreamTokenTracking(
                context,
                currentText,
                requestStartTime
            );

            expect(mockProcessTokenUsage).toHaveBeenCalledWith(
                expect.objectContaining({
                    additionalCost: 10
                })
            );
        });
    });

    describe('extractTokenUsage', () => {
        it('should extract tokens from event usage', () => {
            const response = createMockResponse();
            const event = {
                usage: {
                    promptTokens: 100,
                    completionTokens: 50
                }
            };

            const result = (ChatTokenTrackingService as any).extractTokenUsage(response, event, 'test123');

            expect(result).toEqual({
                inputTokens: 100,
                outputTokens: 50,
                totalTokens: 150
            });
        });

        it('should extract tokens from response usage when event missing', () => {
            const response = createMockResponse();
            const event = {};

            const result = (ChatTokenTrackingService as any).extractTokenUsage(response, event, 'test123');

            expect(result).toEqual({
                inputTokens: 100,
                outputTokens: 50,
                totalTokens: 150
            });
        });

        it('should handle snake_case token fields', () => {
            const response = createMockResponse({
                usage: {
                    prompt_tokens: 200,
                    completion_tokens: 75
                }
            });
            const event = {};

            const result = (ChatTokenTrackingService as any).extractTokenUsage(response, event, 'test123');

            expect(result).toEqual({
                inputTokens: 200,
                outputTokens: 75,
                totalTokens: 275
            });
        });

        it('should estimate output tokens when not provided', () => {
            const response = createMockResponse({
                messages: [{
                    role: 'assistant',
                    content: 'This is a test response with 30 characters'
                }],
                usage: {
                    promptTokens: 100,
                    completionTokens: 0, // No output tokens provided
                    totalTokens: 100,
                    inputTokens: 100,
                    outputTokens: 0,
                    prompt_tokens: 100,
                    completion_tokens: 0
                }
            });
            const event = {};

            const result = (ChatTokenTrackingService as any).extractTokenUsage(response, event, 'test123');

            expect(result.inputTokens).toBe(100);
            expect(result.outputTokens).toBe(11); // ~44/4 rounded up
            expect(result.totalTokens).toBe(111);
        });
    });

    describe('extractInputTokensFromEvent', () => {
        it('should extract input tokens from event.usage', () => {
            const event = {
                usage: {
                    promptTokens: 150
                }
            };

            const result = (ChatTokenTrackingService as any).extractInputTokensFromEvent(event);

            expect(result).toBe(150);
        });

        it('should try multiple token field variations', () => {
            const testCases = [
                { event: { usage: { inputTokens: 200 } }, expected: 200 },
                { event: { usage: { prompt_tokens: 250 } }, expected: 250 },
                { event: { usage: { input_tokens: 300 } }, expected: 300 },
                { event: { promptTokens: 350 }, expected: 350 }
            ];

            testCases.forEach(({ event, expected }) => {
                const result = (ChatTokenTrackingService as any).extractInputTokensFromEvent(event);
                expect(result).toBe(expected);
            });
        });

        it('should return 0 for invalid or missing values', () => {
            const testCases = [
                {},
                { usage: {} },
                { usage: { promptTokens: null } },
                { usage: { promptTokens: 0 } },
                { usage: { promptTokens: -1 } }
            ];

            testCases.forEach(event => {
                const result = (ChatTokenTrackingService as any).extractInputTokensFromEvent(event);
                expect(result).toBe(0);
            });
        });
    });

    describe('estimateOutputTokens', () => {
        it('should estimate tokens from response messages', () => {
            const response = {
                messages: [{
                    role: 'assistant',
                    content: 'This is a 20 character response'
                }]
            };

            const result = (ChatTokenTrackingService as any).estimateOutputTokens(response, {});

            expect(result).toBe(8); // ~20/4 rounded up
        });

        it('should handle structured content arrays', () => {
            const response = {
                messages: [{
                    role: 'assistant',
                    content: [
                        { type: 'text', text: 'First part' },
                        { type: 'text', text: 'Second part' }
                    ]
                }]
            };

            const result = (ChatTokenTrackingService as any).estimateOutputTokens(response, {});

            expect(result).toBe(6); // ~('First partSecond part'.length)/4 rounded up
        });

        it('should fall back to event text', () => {
            const response = { messages: [] };
            const event = { text: 'Fallback text content' };

            const result = (ChatTokenTrackingService as any).estimateOutputTokens(response, event);

            expect(result).toBe(6); // ~20/4 rounded up
        });

        it('should return minimum fallback for empty content', () => {
            const response = { messages: [] };
            const event = {};

            const result = (ChatTokenTrackingService as any).estimateOutputTokens(response, event);

            expect(result).toBe(1);
        });
    });

    describe('extractGenerationId', () => {
        it('should extract generation ID for OpenRouter provider', () => {
            const response = { id: 'gen123' };

            const result = (ChatTokenTrackingService as any).extractGenerationId(response, 'openrouter');

            expect(result).toBe('gen123');
        });

        it('should try alternative ID fields', () => {
            const testCases = [
                { response: { generation_id: 'gen456' }, expected: 'gen456' },
                { response: { generationId: 'gen789' }, expected: 'gen789' }
            ];

            testCases.forEach(({ response, expected }) => {
                const result = (ChatTokenTrackingService as any).extractGenerationId(response, 'openrouter');
                expect(result).toBe(expected);
            });
        });

        it('should return undefined for non-OpenRouter providers', () => {
            const response = { id: 'gen123' };

            const result = (ChatTokenTrackingService as any).extractGenerationId(response, 'openai');

            expect(result).toBeUndefined();
        });
    });
});