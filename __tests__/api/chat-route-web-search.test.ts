/**
 * @jest-environment node
 */

const mockStreamText = jest.fn();
const mockGetLanguageModelWithKeys = jest.fn(() => ({ modelId: 'base-model' }));
const mockCreateOpenRouterClient = jest.fn();
const mockBuildOpenRouterServerTools = jest.fn(() => ({ web_search: { type: 'provider-tool' } }));

const createMockOpenRouterClient = () =>
    Object.assign(jest.fn(() => ({ modelId: 'legacy-online-model' })), {
        tools: {
            webSearch: jest.fn(() => ({ type: 'provider-tool', name: 'web_search' })),
        },
    });

jest.mock('ai', () => {
    const actual = jest.requireActual('ai');
    return {
        ...actual,
        streamText: (...args: unknown[]) => mockStreamText(...args),
    };
});

jest.mock('@/ai/providers', () => ({
    getLanguageModelWithKeys: (...args: unknown[]) => mockGetLanguageModelWithKeys(...args),
    createOpenRouterClientWithKey: (...args: unknown[]) => mockCreateOpenRouterClient(...args),
    usesTagBasedReasoningExtraction: jest.fn(() => false),
    wrapWithTagBasedReasoning: jest.fn((model: unknown) => model),
    model: {},
}));

jest.mock('@/lib/services/chatAuthenticationService', () => {
    const actual = jest.requireActual('@/lib/services/chatAuthenticationService');
    return {
        ...actual,
        ChatAuthenticationService: {
            authenticateUser: jest.fn().mockResolvedValue({
                userId: 'user-1',
                isAnonymous: false,
                polarCustomerId: 'polar-1',
            }),
        },
    };
});

jest.mock('@/lib/services/chatModelValidationService', () => ({
    ChatModelValidationService: {
        validateAndConfigureModel: jest.fn().mockResolvedValue({
            modelInfo: {
                id: 'openrouter/openai/gpt-4',
                provider: 'openai',
                name: 'GPT-4',
                premium: false,
                vision: false,
                supportsWebSearch: true,
                supportsToolCalling: true,
                capabilities: ['text', 'Tools'],
                status: 'available',
                lastChecked: new Date(),
            },
            temperature: 0.7,
            maxTokens: 1024,
            systemInstruction: undefined,
        }),
    },
}));

jest.mock('@/lib/services/chatMessageProcessingService', () => ({
    ChatMessageProcessingService: {
        processMessagesWithAttachments: jest.fn().mockResolvedValue({
            messages: [{ id: 'm1', role: 'user', parts: [{ type: 'text', text: 'Latest news?' }] }],
        }),
        addModelSpecificInstructions: jest.fn((messages: unknown[]) => messages),
    },
}));

jest.mock('@/lib/services/chatCreditValidationService', () => {
    const actual = jest.requireActual('@/lib/services/chatCreditValidationService');
    return {
        ...actual,
        ChatCreditValidationService: {
            validateCredits: jest.fn().mockResolvedValue({
                hasCredits: true,
                actualCredits: 100,
            }),
            validateFreeModelAccess: jest.fn().mockResolvedValue(undefined),
            validatePremiumModelAccess: jest.fn().mockResolvedValue(undefined),
        },
    };
});

jest.mock('@/lib/services/webFetchService', () => ({
    WebFetchService: {
        getDefaultPolicy: jest.fn(() => ({
            enabled: false,
            defaultMaxChars: 30000,
            defaultTimeoutMs: 12000,
            maxResponseBytes: 5000000,
            maxRedirects: 5,
            siteModeEnabled: false,
            siteModeMaxPages: 20,
            siteModeDepth: 2,
        })),
        fetchPage: jest.fn(),
    },
    WebFetchError: class WebFetchError extends Error {},
}));

jest.mock('@/lib/services/chatMCPServerService', () => ({
    ChatMCPServerService: {
        initializeMCPServers: jest.fn().mockResolvedValue({ tools: {}, cleanup: undefined }),
    },
}));

jest.mock('@/lib/services/chatDatabaseService', () => ({
    ChatDatabaseService: {
        checkChatExists: jest.fn().mockResolvedValue(false),
        createChatIfNotExists: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock('@/lib/services/projectContext', () => ({
    buildProjectContext: jest.fn().mockResolvedValue(null),
    formatProjectContextForSystemPrompt: jest.fn(() => ''),
}));

jest.mock('@/lib/chat-stream-consumption', () => ({
    startBackgroundStreamConsumption: jest.fn(),
}));

jest.mock('@/lib/chat-stop-registry', () => ({
    registerChatAbortController: jest.fn(),
    abortChatGeneration: jest.fn(),
}));

jest.mock('@/lib/polar', () => ({
    getSubscriptionTypeByExternalId: jest.fn().mockResolvedValue('monthly'),
    getRemainingCredits: jest.fn(),
    getRemainingCreditsByExternalId: jest.fn(),
}));

jest.mock('@/lib/services/dailyMessageUsageService', () => ({
    DailyMessageUsageService: {
        checkDailyLimit: jest.fn(),
        incrementDailyUsage: jest.fn(),
    },
}));

jest.mock('@/lib/openrouter-utils', () => ({
    convertToOpenRouterFormat: jest.fn((messages: unknown[]) => messages),
}));

jest.mock('@/lib/services/chatWebSearchService', () => {
    const actual = jest.requireActual('@/lib/services/chatWebSearchService');
    actual.ChatWebSearchService.buildOpenRouterServerTools = (...args: unknown[]) =>
        mockBuildOpenRouterServerTools(...args);
    return actual;
});

jest.mock('@/lib/auth', () => ({
    auth: {
        api: {
            getSession: jest.fn(),
        },
    },
}));

jest.mock('@/lib/db', () => ({
    db: {},
}));

jest.mock('@/lib/chat-store', () => ({
    saveChat: jest.fn(),
    saveMessages: jest.fn(),
    convertToDBMessages: jest.fn(() => []),
}));

jest.mock('@/lib/tokenCounter', () => ({
    trackTokenUsage: jest.fn(),
    hasEnoughCredits: jest.fn(),
    WEB_SEARCH_COST: 25,
}));

jest.mock('@/lib/tokenTracking', () => ({
    TokenTrackingService: {},
}));

jest.mock('@/lib/services/costCalculation', () => ({
    CostCalculationService: {},
}));

jest.mock('@/lib/services/simpleCostEstimation', () => ({
    SimpleCostEstimationService: {},
}));

jest.mock('@/lib/services/directTokenTracking', () => ({
    DirectTokenTrackingService: {
        processTokenUsage: jest.fn(),
    },
}));

jest.mock('@/lib/services/creditCache', () => ({
    createRequestCreditCache: jest.fn(() => ({
        getRemainingCreditsByExternalId: jest.fn(),
        getRemainingCredits: jest.fn(),
        cache: {},
    })),
    hasEnoughCreditsWithCache: jest.fn(),
}));

jest.mock('@/lib/services/usageLimits', () => ({
    UsageLimitsService: {},
}));

jest.mock('@/lib/services/optimizedUsageLimits', () => ({
    OptimizedUsageLimitsService: {},
}));

jest.mock('@/lib/services/chatTokenTrackingService', () => ({
    ChatTokenTrackingService: {},
}));

jest.mock('@/lib/file-reader', () => ({
    parseFile: jest.fn(),
}));

jest.mock('@/lib/file-upload', () => ({
    fetchFileContent: jest.fn(),
}));

import { POST } from '@/app/api/chat/route';

describe('/api/chat POST web search integration', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = {
            ...originalEnv,
            OPENROUTER_API_KEY: 'sk-or-test',
            OPENROUTER_AGENTIC_WEB_TOOLS_ENABLED: 'true',
            BILLING_ENFORCED: 'false',
        };

        mockCreateOpenRouterClient.mockImplementation(createMockOpenRouterClient);
        mockStreamText.mockReturnValue({
            consumeStream: jest.fn(),
            toUIMessageStreamResponse: jest.fn(() => new Response('stream')),
        });
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    const createRequest = (body: Record<string, unknown>) =>
        new Request('http://localhost/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

    it('registers agentic web_search server tools in streamText payload', async () => {
        const response = await POST(createRequest({
            messages: [{ id: 'm1', role: 'user', parts: [{ type: 'text', text: 'Latest news?' }] }],
            selectedModel: 'openrouter/openai/gpt-4',
            webSearch: { enabled: true, contextSize: 'medium' },
            apiKeys: { OPENROUTER_API_KEY: 'sk-or-test' },
        }));

        if (response.status !== 200) {
            throw new Error(`Unexpected ${response.status}: ${await response.text()}`);
        }
        expect(mockBuildOpenRouterServerTools).toHaveBeenCalled();
        expect(mockStreamText).toHaveBeenCalledWith(
            expect.objectContaining({
                tools: expect.objectContaining({
                    web_search: expect.anything(),
                }),
            })
        );
    });

    it('uses legacy web_search_options when agentic tools are disabled by policy', async () => {
        process.env.OPENROUTER_AGENTIC_WEB_TOOLS_ENABLED = 'false';

        const response = await POST(createRequest({
            messages: [{ id: 'm1', role: 'user', parts: [{ type: 'text', text: 'Latest news?' }] }],
            selectedModel: 'openrouter/openai/gpt-4',
            webSearch: { enabled: true, contextSize: 'high' },
            apiKeys: { OPENROUTER_API_KEY: 'sk-or-test' },
        }));

        expect(response.status).toBe(200);
        expect(mockBuildOpenRouterServerTools).not.toHaveBeenCalled();
        expect(mockStreamText).toHaveBeenCalledWith(
            expect.objectContaining({
                providerOptions: expect.objectContaining({
                    openrouter: expect.objectContaining({
                        web_search_options: { search_context_size: 'high' },
                    }),
                }),
            })
        );
        expect(mockStreamText.mock.calls[0][0].tools?.web_search).toBeUndefined();
    });
});
