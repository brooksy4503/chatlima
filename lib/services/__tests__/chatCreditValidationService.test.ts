import { ChatCreditValidationService, CreditValidationContext, CreditValidationResult } from '../chatCreditValidationService';

// Mock dependencies
jest.mock('@/lib/services/creditCache', () => ({
    createRequestCreditCache: jest.fn(),
    hasEnoughCreditsWithCache: jest.fn()
}));

jest.mock('@/lib/tokenCounter', () => ({
    hasEnoughCredits: jest.fn(),
    WEB_SEARCH_COST: 10
}));

jest.mock('@/lib/models/fetch-models', () => ({
    getModelDetails: jest.fn()
}));

jest.mock('@/lib/utils/performantLogging', () => ({
    logDiagnostic: jest.fn()
}));

jest.mock('@/lib/utils/creditCostCalculator', () => ({
    calculateCreditCostPerMessage: jest.fn()
}));

import { createRequestCreditCache, hasEnoughCreditsWithCache } from '@/lib/services/creditCache';
import { hasEnoughCredits, WEB_SEARCH_COST } from '@/lib/tokenCounter';
import { getModelDetails } from '@/lib/models/fetch-models';
import { logDiagnostic } from '@/lib/utils/performantLogging';
import { calculateCreditCostPerMessage } from '@/lib/utils/creditCostCalculator';

// Mock createErrorResponse function
const mockCreateErrorResponse = jest.fn();
jest.mock('@/app/api/chat/route', () => ({
    createErrorResponse: mockCreateErrorResponse
}), { virtual: true });

describe('ChatCreditValidationService', () => {
    const mockCreateRequestCreditCache = createRequestCreditCache as jest.MockedFunction<typeof createRequestCreditCache>;
    const mockHasEnoughCreditsWithCache = hasEnoughCreditsWithCache as jest.MockedFunction<typeof hasEnoughCreditsWithCache>;
    const mockHasEnoughCredits = hasEnoughCredits as jest.MockedFunction<typeof hasEnoughCredits>;
    const mockGetModelDetails = getModelDetails as jest.MockedFunction<typeof getModelDetails>;
    const mockLogDiagnostic = logDiagnostic as jest.MockedFunction<typeof logDiagnostic>;
    const mockCalculateCreditCostPerMessage = calculateCreditCostPerMessage as jest.MockedFunction<typeof calculateCreditCostPerMessage>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const createMockCreditCache = () => ({
        getRemainingCreditsByExternalId: jest.fn(),
        getRemainingCredits: jest.fn(),
        cache: {
            cache: new Map(),
            getRemainingCreditsByExternalId: jest.fn(),
            getRemainingCredits: jest.fn(),
            clear: jest.fn(),
            set: jest.fn(),
            get: jest.fn(),
            has: jest.fn(),
            size: 0,
            hasExternalId: jest.fn(),
            hasPolarId: jest.fn(),
            getStats: jest.fn()
        }
    } as any);

    const createMockContext = (overrides: Partial<CreditValidationContext> = {}): CreditValidationContext => ({
        userId: 'user123',
        isAnonymous: false,
        polarCustomerId: 'polar456',
        selectedModel: 'openai/gpt-4',
        isUsingOwnApiKeys: false,
        isFreeModel: false,
        webSearchEnabled: false,
        estimatedTokens: 100,
        ...overrides
    });

    describe('validateCredits', () => {
        it('should validate credits successfully for user with own API keys', async () => {
            const context = createMockContext({ isUsingOwnApiKeys: true });
            const mockCache = createMockCreditCache();
            mockCreateRequestCreditCache.mockReturnValue(mockCache);

            const result = await ChatCreditValidationService.validateCredits(context);

            expect(result).toEqual({
                hasCredits: true,
                actualCredits: null,
                canUseWebSearch: false,
                creditCache: mockCache.cache
            });

            expect(mockCreateRequestCreditCache).toHaveBeenCalled();
            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'CREDIT_CHECK_SKIP',
                'User is using own API keys, skipping credit checks',
                expect.objectContaining({ requestId: expect.any(String), userId: 'user123' })
            );
        });

        it('should validate credits successfully for free model', async () => {
            const context = createMockContext({ isFreeModel: true });
            const mockCache = createMockCreditCache();
            mockCreateRequestCreditCache.mockReturnValue(mockCache);

            const result = await ChatCreditValidationService.validateCredits(context);

            expect(result.hasCredits).toBe(false); // Should not set to true for free model
            expect(mockGetModelDetails).not.toHaveBeenCalled();
        });

        it('should validate credits for paid model with sufficient credits', async () => {
            const context = createMockContext();
            const mockCache = createMockCreditCache();
            const mockModelInfo = {
                id: 'openai/gpt-4',
                provider: 'openai',
                name: 'GPT-4',
                premium: false,
                vision: false,
                capabilities: [],
                status: 'active',
                lastChecked: new Date()
            } as any;

            mockCreateRequestCreditCache.mockReturnValue(mockCache);
            mockGetModelDetails.mockResolvedValue(mockModelInfo);
            mockHasEnoughCreditsWithCache.mockResolvedValue(true);
            mockCache.getRemainingCreditsByExternalId.mockResolvedValue(50);

            const result = await ChatCreditValidationService.validateCredits(context);

            expect(result).toEqual({
                hasCredits: true,
                actualCredits: 50,
                canUseWebSearch: false,
                creditCache: mockCache.cache
            });

            expect(mockHasEnoughCreditsWithCache).toHaveBeenCalledWith(
                'polar456',
                'user123',
                100,
                false,
                mockModelInfo,
                mockCache.cache
            );
        });

        it('should handle credit check failure and fall back to legacy method', async () => {
            const context = createMockContext();
            const mockCache = createMockCreditCache();
            const mockModelInfo = {
                id: 'openai/gpt-4',
                provider: 'openai',
                name: 'GPT-4',
                premium: false,
                vision: false,
                capabilities: [],
                status: 'active',
                lastChecked: new Date()
            } as any;

            mockCreateRequestCreditCache.mockReturnValue(mockCache);
            mockGetModelDetails.mockResolvedValue(mockModelInfo);
            mockHasEnoughCreditsWithCache.mockResolvedValue(false);
            mockCache.getRemainingCreditsByExternalId.mockRejectedValue(new Error('Cache error'));
            mockCache.getRemainingCredits.mockResolvedValue(25);

            const result = await ChatCreditValidationService.validateCredits(context);

            expect(result.hasCredits).toBe(false);
            expect(result.actualCredits).toBe(25);
            expect(mockCache.getRemainingCredits).toHaveBeenCalledWith('polar456');
        });

        it('should block users with negative credits', async () => {
            const context = createMockContext();
            const mockCache = createMockCreditCache();
            const mockModelInfo = {
                id: 'openai/gpt-4',
                provider: 'openai',
                name: 'GPT-4',
                premium: false,
                vision: false,
                capabilities: [],
                status: 'active',
                lastChecked: new Date()
            } as any;

            mockCreateRequestCreditCache.mockReturnValue(mockCache);
            mockGetModelDetails.mockResolvedValue(mockModelInfo);
            mockHasEnoughCreditsWithCache.mockResolvedValue(true);
            mockCache.getRemainingCreditsByExternalId.mockResolvedValue(-5);
            mockCreateErrorResponse.mockReturnValue(new Response('Negative credits', { status: 402 }));

            await expect(ChatCreditValidationService.validateCredits(context))
                .rejects.toThrow();

            expect(mockCreateErrorResponse).toHaveBeenCalledWith(
                "INSUFFICIENT_CREDITS",
                `Your account has a negative credit balance (-5). Please purchase more credits to continue.`,
                402,
                `User has -5 credits`
            );
        });

        it('should allow web search for users with own API keys', async () => {
            const context = createMockContext({
                isUsingOwnApiKeys: true,
                webSearchEnabled: true
            });
            const mockCache = createMockCreditCache();
            mockCreateRequestCreditCache.mockReturnValue(mockCache);

            const result = await ChatCreditValidationService.validateCredits(context);

            expect(result.canUseWebSearch).toBe(true);
        });

        it('should allow web search for users with sufficient credits', async () => {
            const context = createMockContext({
                webSearchEnabled: true
            });
            const mockCache = createMockCreditCache();
            const mockModelInfo = {
                id: 'openai/gpt-4',
                provider: 'openai',
                name: 'GPT-4',
                premium: false,
                vision: false,
                capabilities: [],
                status: 'active',
                lastChecked: new Date()
            } as any;

            mockCreateRequestCreditCache.mockReturnValue(mockCache);
            mockGetModelDetails.mockResolvedValue(mockModelInfo);
            mockHasEnoughCreditsWithCache.mockResolvedValue(true);
            mockCache.getRemainingCreditsByExternalId.mockResolvedValue(15);

            const result = await ChatCreditValidationService.validateCredits(context);

            expect(result.canUseWebSearch).toBe(true);
        });

        it('should block web search for anonymous users', async () => {
            const context = createMockContext({
                isAnonymous: true,
                webSearchEnabled: true
            });
            const mockCache = createMockCreditCache();
            mockCreateRequestCreditCache.mockReturnValue(mockCache);
            mockCreateErrorResponse.mockReturnValue(new Response('Web search blocked', { status: 403 }));

            await expect(ChatCreditValidationService.validateCredits(context))
                .rejects.toThrow();

            expect(mockCreateErrorResponse).toHaveBeenCalledWith(
                "FEATURE_RESTRICTED",
                "Web Search is only available to signed-in users with credits. Please sign in and purchase credits to use this feature.",
                403,
                "Anonymous users cannot use Web Search"
            );
        });

        it('should block web search for users with insufficient credits', async () => {
            const context = createMockContext({
                webSearchEnabled: true
            });
            const mockCache = createMockCreditCache();
            const mockModelInfo = {
                id: 'openai/gpt-4',
                provider: 'openai',
                name: 'GPT-4',
                premium: false,
                vision: false,
                capabilities: [],
                status: 'active',
                lastChecked: new Date()
            } as any;

            mockCreateRequestCreditCache.mockReturnValue(mockCache);
            mockGetModelDetails.mockResolvedValue(mockModelInfo);
            mockHasEnoughCreditsWithCache.mockResolvedValue(true);
            mockCache.getRemainingCreditsByExternalId.mockResolvedValue(5);
            mockCreateErrorResponse.mockReturnValue(new Response('Insufficient credits', { status: 402 }));

            await expect(ChatCreditValidationService.validateCredits(context))
                .rejects.toThrow();

            expect(mockCreateErrorResponse).toHaveBeenCalledWith(
                "INSUFFICIENT_CREDITS",
                `You need at least ${WEB_SEARCH_COST} credits to use Web Search. Your balance is 5.`,
                402,
                `User attempted to bypass Web Search payment with 5 credits`
            );
        });

        it('should handle model details fetch error', async () => {
            const context = createMockContext();
            const mockCache = createMockCreditCache();

            mockCreateRequestCreditCache.mockReturnValue(mockCache);
            mockGetModelDetails.mockRejectedValue(new Error('Model not found'));

            const result = await ChatCreditValidationService.validateCredits(context);

            expect(result.hasCredits).toBe(false);
            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'CREDIT_CHECK_ERROR',
                'Error checking credits',
                expect.objectContaining({
                    requestId: expect.any(String),
                    userId: 'user123',
                    error: 'Model not found'
                })
            );
        });
    });

    describe('validateFreeModelAccess', () => {
        it('should allow access for users with credits', () => {
            const context = createMockContext({ hasCredits: true });

            expect(() => {
                ChatCreditValidationService.validateFreeModelAccess(context);
            }).not.toThrow();
        });

        it('should allow access for users using own API keys', () => {
            const context = createMockContext({
                isUsingOwnApiKeys: true,
                hasCredits: false
            });

            expect(() => {
                ChatCreditValidationService.validateFreeModelAccess(context);
            }).not.toThrow();
        });

        it('should block access for anonymous users without credits', () => {
            const context = createMockContext({
                isAnonymous: true,
                hasCredits: false,
                isUsingOwnApiKeys: false
            });
            mockCreateErrorResponse.mockReturnValue(new Response('Access denied', { status: 403 }));

            expect(() => {
                ChatCreditValidationService.validateFreeModelAccess(context);
            }).toThrow();

            expect(mockCreateErrorResponse).toHaveBeenCalledWith(
                'FREE_MODEL_ONLY',
                'Anonymous users can only use free models. Please sign in and purchase credits to access other models.',
                403,
                'Free-model-only enforcement for anonymous user'
            );
        });

        it('should block access for non-anonymous users without credits', () => {
            const context = createMockContext({
                isAnonymous: false,
                hasCredits: false,
                isUsingOwnApiKeys: false
            });
            mockCreateErrorResponse.mockReturnValue(new Response('Access denied', { status: 403 }));

            expect(() => {
                ChatCreditValidationService.validateFreeModelAccess(context);
            }).toThrow();

            expect(mockCreateErrorResponse).toHaveBeenCalledWith(
                'FREE_MODEL_ONLY',
                'Users without credits can only use free models. Please purchase credits to access other models.',
                403,
                'Free-model-only enforcement for non-credit user'
            );
        });
    });

    describe('validatePremiumModelAccess', () => {
        beforeEach(() => {
            mockGetModelDetails.mockResolvedValue({
                id: 'openai/gpt-4',
                provider: 'openai',
                name: 'GPT-4',
                premium: true,
                vision: false,
                capabilities: [],
                status: 'active',
                lastChecked: new Date()
            } as any);
        });

        it('should allow access for users with credits', async () => {
            const context = createMockContext({ hasCredits: true });

            await expect(ChatCreditValidationService.validatePremiumModelAccess(context))
                .resolves.toBeUndefined();
        });

        it('should allow access for users using own API keys', async () => {
            const context = createMockContext({
                isUsingOwnApiKeys: true,
                hasCredits: false
            });

            await expect(ChatCreditValidationService.validatePremiumModelAccess(context))
                .resolves.toBeUndefined();
        });

        it('should block access for anonymous users without credits', async () => {
            const context = createMockContext({
                isAnonymous: true,
                hasCredits: false,
                isUsingOwnApiKeys: false
            });
            mockCreateErrorResponse.mockReturnValue(new Response('Access denied', { status: 403 }));

            await expect(ChatCreditValidationService.validatePremiumModelAccess(context))
                .rejects.toThrow();

            expect(mockCreateErrorResponse).toHaveBeenCalledWith(
                "PREMIUM_MODEL_RESTRICTED",
                "Anonymous users cannot access premium models. Please sign in and purchase credits to use GPT-4.",
                403,
                "Premium model access denied for anonymous user"
            );
        });

        it('should block access for non-anonymous users without credits', async () => {
            const context = createMockContext({
                isAnonymous: false,
                hasCredits: false,
                isUsingOwnApiKeys: false
            });
            mockCreateErrorResponse.mockReturnValue(new Response('Access denied', { status: 403 }));

            await expect(ChatCreditValidationService.validatePremiumModelAccess(context))
                .rejects.toThrow();

            expect(mockCreateErrorResponse).toHaveBeenCalledWith(
                "PREMIUM_MODEL_RESTRICTED",
                "Users without credits cannot access premium models. Please purchase credits to use GPT-4.",
                403,
                "Premium model access denied for non-credit user"
            );
        });

        it('should handle model details fetch error', async () => {
            const context = createMockContext({ hasCredits: false });
            mockGetModelDetails.mockRejectedValue(new Error('Model fetch failed'));

            await expect(ChatCreditValidationService.validatePremiumModelAccess(context))
                .rejects.toThrow('Model fetch failed');
        });
    });

    describe('Tiered Credit Costs', () => {
        beforeEach(() => {
            mockCalculateCreditCostPerMessage.mockReset();
        });

        it('should validate credits for free model (1 credit)', async () => {
            const context = createMockContext({ isFreeModel: false });
            const mockCache = createMockCreditCache();
            const mockModelInfo = {
                id: 'openrouter/meta-llama/llama-3.2-3b-instruct:free',
                provider: 'OpenRouter',
                name: 'Llama 3.2 3B Free',
                premium: false,
                pricing: { input: 0, output: 0 }
            } as any;

            mockCreateRequestCreditCache.mockReturnValue(mockCache);
            mockGetModelDetails.mockResolvedValue(mockModelInfo);
            mockCalculateCreditCostPerMessage.mockReturnValue(1);
            mockHasEnoughCreditsWithCache.mockResolvedValue(true);
            mockCache.getRemainingCreditsByExternalId.mockResolvedValue(10);

            const result = await ChatCreditValidationService.validateCredits(context);

            expect(mockCalculateCreditCostPerMessage).toHaveBeenCalledWith(mockModelInfo);
            expect(mockHasEnoughCreditsWithCache).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                expect.any(Number),
                false,
                mockModelInfo,
                expect.any(Object)
            );
            expect(result.hasCredits).toBe(true);
        });

        it('should validate credits for standard premium model (2 credits)', async () => {
            const context = createMockContext();
            const mockCache = createMockCreditCache();
            const mockModelInfo = {
                id: 'openrouter/anthropic/claude-3-haiku',
                provider: 'OpenRouter',
                name: 'Claude 3 Haiku',
                premium: true,
                pricing: { input: 0.0000025, output: 0.0000125 } // $2.50/$12.50 per million
            } as any;

            mockCreateRequestCreditCache.mockReturnValue(mockCache);
            mockGetModelDetails.mockResolvedValue(mockModelInfo);
            mockCalculateCreditCostPerMessage.mockReturnValue(2);
            mockHasEnoughCreditsWithCache.mockResolvedValue(true);
            mockCache.getRemainingCreditsByExternalId.mockResolvedValue(5);

            const result = await ChatCreditValidationService.validateCredits(context);

            expect(mockCalculateCreditCostPerMessage).toHaveBeenCalledWith(mockModelInfo);
            expect(result.hasCredits).toBe(true);
        });

        it('should validate credits for high premium model (5 credits)', async () => {
            const context = createMockContext();
            const mockCache = createMockCreditCache();
            const mockModelInfo = {
                id: 'openrouter/anthropic/claude-3-opus',
                provider: 'OpenRouter',
                name: 'Claude 3 Opus',
                premium: true,
                pricing: { input: 0.000015, output: 0.000075 } // $15/$75 per million
            } as any;

            mockCreateRequestCreditCache.mockReturnValue(mockCache);
            mockGetModelDetails.mockResolvedValue(mockModelInfo);
            mockCalculateCreditCostPerMessage.mockReturnValue(5);
            mockHasEnoughCreditsWithCache.mockResolvedValue(true);
            mockCache.getRemainingCreditsByExternalId.mockResolvedValue(10);

            const result = await ChatCreditValidationService.validateCredits(context);

            expect(mockCalculateCreditCostPerMessage).toHaveBeenCalledWith(mockModelInfo);
            expect(result.hasCredits).toBe(true);
        });

        it('should validate credits for ultra premium model (30 credits)', async () => {
            const context = createMockContext();
            const mockCache = createMockCreditCache();
            const mockModelInfo = {
                id: 'openrouter/openai/o1-pro',
                provider: 'OpenRouter',
                name: 'O1 Pro',
                premium: true,
                pricing: { input: 0.00015, output: 0.0006 } // $150/$600 per million
            } as any;

            mockCreateRequestCreditCache.mockReturnValue(mockCache);
            mockGetModelDetails.mockResolvedValue(mockModelInfo);
            mockCalculateCreditCostPerMessage.mockReturnValue(30);
            mockHasEnoughCreditsWithCache.mockResolvedValue(true);
            mockCache.getRemainingCreditsByExternalId.mockResolvedValue(50);

            const result = await ChatCreditValidationService.validateCredits(context);

            expect(mockCalculateCreditCostPerMessage).toHaveBeenCalledWith(mockModelInfo);
            expect(result.hasCredits).toBe(true);
        });

        it('should block access when user has insufficient credits for premium model', async () => {
            const context = createMockContext();
            const mockCache = createMockCreditCache();
            const mockModelInfo = {
                id: 'openrouter/openai/o1-pro',
                provider: 'OpenRouter',
                name: 'O1 Pro',
                premium: true,
                pricing: { input: 0.00015, output: 0.0006 }
            } as any;

            mockCreateRequestCreditCache.mockReturnValue(mockCache);
            mockGetModelDetails.mockResolvedValue(mockModelInfo);
            mockCalculateCreditCostPerMessage.mockReturnValue(30);
            mockHasEnoughCreditsWithCache.mockResolvedValue(false);
            mockCache.getRemainingCreditsByExternalId.mockResolvedValue(10); // Only 10 credits, needs 30

            const result = await ChatCreditValidationService.validateCredits(context);

            expect(mockCalculateCreditCostPerMessage).toHaveBeenCalledWith(mockModelInfo);
            expect(result.hasCredits).toBe(false);
        });

        it('should include credit cost in premium model access error message', async () => {
            const context = createMockContext({ hasCredits: false });
            const mockModelInfo = {
                id: 'openrouter/openai/o1-pro',
                provider: 'OpenRouter',
                name: 'O1 Pro',
                premium: true,
                pricing: { input: 0.00015, output: 0.0006 }
            } as any;

            mockGetModelDetails.mockResolvedValue(mockModelInfo);
            mockCalculateCreditCostPerMessage.mockReturnValue(30);

            await expect(ChatCreditValidationService.validatePremiumModelAccess(context))
                .rejects.toThrow();

            expect(mockCalculateCreditCostPerMessage).toHaveBeenCalledWith(mockModelInfo);
        });
    });
});