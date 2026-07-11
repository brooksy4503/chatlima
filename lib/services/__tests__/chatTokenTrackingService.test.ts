import { ChatTokenTrackingService, TokenTrackingContext } from '../chatTokenTrackingService';
import type { TokenUsageSnapshot } from '@/lib/chat/streamTokenUsage';

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

    const createMockSnapshot = (overrides: Partial<TokenUsageSnapshot> = {}): TokenUsageSnapshot => ({
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
        source: 'ai_sdk',
        ...overrides,
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
            const tokenUsage = createMockSnapshot();
            const requestStartTime = Date.now() - 1000;
            const timeToFirstTokenMs = 500;

            mockProcessTokenUsage.mockResolvedValue(undefined);

            const result = await ChatTokenTrackingService.processTokenTracking(
                context,
                tokenUsage,
                response,
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
                usageSource: 'ai_sdk',
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
                    chatId: 'chat456',
                    usageSource: 'ai_sdk',
                })
            );
        });

        it('should handle web search additional cost', async () => {
            const context = createMockContext({
                webSearchEnabled: true,
                webSearchCost: 10
            });
            const response = createMockResponse();
            const requestStartTime = Date.now() - 1000;

            mockProcessTokenUsage.mockResolvedValue(undefined);

            await ChatTokenTrackingService.processTokenTracking(
                context,
                createMockSnapshot(),
                response,
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
            const requestStartTime = Date.now() - 1000;

            mockProcessTokenUsage.mockResolvedValue(undefined);

            await ChatTokenTrackingService.processTokenTracking(
                context,
                createMockSnapshot(),
                response,
                requestStartTime
            );

            expect(mockProcessTokenUsage).toHaveBeenCalledWith(
                expect.objectContaining({
                    additionalCost: 0
                })
            );
        });

        it('should persist usageSource from the snapshot', async () => {
            const context = createMockContext();
            const response = createMockResponse();
            const requestStartTime = Date.now() - 1000;

            mockProcessTokenUsage.mockResolvedValue(undefined);

            await ChatTokenTrackingService.processTokenTracking(
                context,
                createMockSnapshot({ source: 'estimated' }),
                response,
                requestStartTime
            );

            expect(mockProcessTokenUsage).toHaveBeenCalledWith(
                expect.objectContaining({
                    usageSource: 'estimated',
                })
            );
        });

        it('should handle token tracking errors gracefully', async () => {
            const context = createMockContext();
            const response = createMockResponse();
            const requestStartTime = Date.now() - 1000;

            mockProcessTokenUsage.mockRejectedValue(new Error('Tracking failed'));

            await expect(ChatTokenTrackingService.processTokenTracking(
                context,
                createMockSnapshot(),
                response,
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
            const requestStartTime = Date.now() - 2000;
            const timeToFirstTokenMs = 500;

            mockProcessTokenUsage.mockResolvedValue(undefined);

            const result = await ChatTokenTrackingService.processTokenTracking(
                context,
                createMockSnapshot(),
                response,
                requestStartTime,
                timeToFirstTokenMs
            );

            expect(result.tokensPerSecond).toBeCloseTo(50 / 1.5, 1);
        });

        it('should handle OpenRouter provider generation ID', async () => {
            const context = createMockContext({ provider: 'openrouter' });
            const response = createMockResponse({ id: 'gen123' });
            const requestStartTime = Date.now() - 1000;

            mockProcessTokenUsage.mockResolvedValue(undefined);

            await ChatTokenTrackingService.processTokenTracking(
                context,
                createMockSnapshot(),
                response,
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
                usageSource: 'estimated',
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

            expect(result.outputTokens).toBe(0);
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
