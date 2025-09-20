import { streamText, generateText, type UIMessage, type LanguageModelResponseMetadata, type Message } from "ai";
import { appendResponseMessages } from 'ai';
import { saveChat, saveMessages, convertToDBMessages } from '@/lib/chat-store';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { trackTokenUsage, hasEnoughCredits, WEB_SEARCH_COST } from '@/lib/tokenCounter';
import { TokenTrackingService } from '@/lib/tokenTracking';
import { CostCalculationService } from '@/lib/services/costCalculation';
import { SimpleCostEstimationService } from '@/lib/services/simpleCostEstimation';
import { DirectTokenTrackingService } from '@/lib/services/directTokenTracking';
import { getRemainingCredits, getRemainingCreditsByExternalId } from '@/lib/polar';
import { createRequestCreditCache, hasEnoughCreditsWithCache } from '@/lib/services/creditCache';
import { auth } from '@/lib/auth';
import { logDiagnostic as originalLogDiagnostic, logChunk, logPerformanceMetrics, logError, logRequestBoundary } from '@/lib/utils/performantLogging';
import { DailyMessageUsageService } from '@/lib/services/dailyMessageUsageService';
import { UsageLimitsService } from '@/lib/services/usageLimits';
import { OptimizedUsageLimitsService } from '@/lib/services/optimizedUsageLimits';
import type { ImageUIPart } from '@/lib/types';
import { convertToOpenRouterFormat } from '@/lib/openrouter-utils';

import { experimental_createMCPClient as createMCPClient, MCPTransport } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { spawn } from "child_process";

// Import our new services
import { ChatAuthenticationService, type AuthenticatedUser } from '@/lib/services/chatAuthenticationService';
import { ChatCreditValidationService, type CreditValidationContext, type CreditValidationResult } from '@/lib/services/chatCreditValidationService';
import { ChatMessageProcessingService, type MessageProcessingContext } from '@/lib/services/chatMessageProcessingService';
import { ChatModelValidationService, type ModelValidationContext, type ModelValidationResult } from '@/lib/services/chatModelValidationService';
import { ChatMCPServerService, type MCPServerContext, type MCPServerResult } from '@/lib/services/chatMCPServerService';
import { ChatWebSearchService, type WebSearchContext, type WebSearchResult } from '@/lib/services/chatWebSearchService';
import { ChatTokenTrackingService, type TokenTrackingContext, type TokenTrackingResult } from '@/lib/services/chatTokenTrackingService';
import { ChatDatabaseService, type ChatCreationContext, type MessageSavingContext } from '@/lib/services/chatDatabaseService';

// Use optimized logging - only logs in development and uses efficient patterns
const logDiagnostic = originalLogDiagnostic;

// Allow streaming responses up to 300 seconds on Hobby plan
export const maxDuration = 300;

// Helper function to check if user is using their own API keys for the selected model
function checkIfUsingOwnApiKeys(selectedModel: string, apiKeys: Record<string, string> = {}): boolean {
    // Map model providers to their API key names
    const providerKeyMap: Record<string, string> = {
        'openai': 'OPENAI_API_KEY',
        'anthropic': 'ANTHROPIC_API_KEY',
        'groq': 'GROQ_API_KEY',
        'xai': 'XAI_API_KEY',
        'openrouter': 'OPENROUTER_API_KEY',
        'requesty': 'REQUESTY_API_KEY'
    };

    // Extract provider from model ID
    const provider = selectedModel.split('/')[0];
    const requiredApiKey = providerKeyMap[provider];

    if (!requiredApiKey) {
        return false; // Unknown provider
    }

    // Check if user has provided their own API key for this provider
    const hasApiKey = Boolean(apiKeys[requiredApiKey] && apiKeys[requiredApiKey].trim().length > 0);

    return hasApiKey;
}

interface KeyValuePair {
    key: string;
    value: string;
}

interface MCPServerConfig {
    url: string;
    type: 'sse' | 'stdio' | 'streamable-http';
    command?: string;
    args?: string[];
    env?: KeyValuePair[];
    headers?: KeyValuePair[];
}

interface WebSearchOptions {
    enabled: boolean;
    contextSize: 'low' | 'medium' | 'high';
}

interface UrlCitation {
    url: string;
    title: string;
    content?: string;
    start_index: number;
    end_index: number;
}

interface Annotation {
    type: string;
    url_citation: UrlCitation;
}

interface OpenRouterResponse extends LanguageModelResponseMetadata {
    readonly messages: Message[];
    annotations?: Annotation[];
    body?: unknown;
}

// Helper to create standardized error responses
const createErrorResponse = (
    code: string,
    message: string,
    status: number,
    details?: string
) => {
    return new Response(
        JSON.stringify({ error: { code, message, details } }),
        { status, headers: { "Content-Type": "application/json" } }
    );
};

export async function POST(req: Request) {
    const requestId = nanoid();
    const requestStartTime = Date.now();

    logRequestBoundary('START', requestId, {
        url: req.url,
        method: req.method,
        startTime: requestStartTime
    });

    try {
        // Parse request body
        const {
            messages,
            chatId,
            selectedModel,
            mcpServers: initialMcpServers = [],
            webSearch = { enabled: false, contextSize: 'medium' },
            apiKeys = {},
            attachments = [],
            temperature,
            maxTokens,
            systemInstruction
        }: {
            messages: UIMessage[];
            chatId?: string;
            selectedModel: string;
            mcpServers?: MCPServerConfig[];
            webSearch?: WebSearchOptions;
            apiKeys?: Record<string, string>;
            attachments?: Array<{
                name: string;
                contentType: string;
                url: string;
            }>;
            temperature?: number;
            maxTokens?: number;
            systemInstruction?: string;
        } = await req.json();

        logDiagnostic('REQUEST_PARSED', `Request body parsed`, {
            requestId,
            messagesCount: messages.length,
            chatId,
            selectedModel,
            attachmentsCount: attachments.length,
            webSearchEnabled: webSearch.enabled,
            hasTemperature: temperature !== undefined,
            hasMaxTokens: maxTokens !== undefined,
            hasSystemInstruction: systemInstruction !== undefined
        });

        // 1. Authenticate user
        const authenticatedUser = await ChatAuthenticationService.authenticateUser(req);

        // 2. Validate model and get configuration
        const modelValidation = await ChatModelValidationService.validateAndConfigureModel({
            selectedModel,
            temperature,
            maxTokens,
            systemInstruction
        });

        // 3. Process messages with attachments
        const processedMessages = await ChatMessageProcessingService.processMessagesWithAttachments({
            messages,
            attachments,
            modelInfo: modelValidation.modelInfo
        });

        // 4. Add model-specific instructions
        const modelMessages = ChatMessageProcessingService.addModelSpecificInstructions(
            processedMessages.messages,
            selectedModel
        );

        // 5. Validate credits and permissions
        const creditValidation = await ChatCreditValidationService.validateCredits({
            userId: authenticatedUser.userId,
            isAnonymous: authenticatedUser.isAnonymous,
            polarCustomerId: authenticatedUser.polarCustomerId,
            selectedModel,
            isUsingOwnApiKeys: checkIfUsingOwnApiKeys(selectedModel, apiKeys),
            isFreeModel: selectedModel.endsWith(':free'),
            webSearchEnabled: webSearch.enabled,
            estimatedTokens: 30 // Basic estimate
        });

        // 6. Validate free model and premium model access
        await ChatCreditValidationService.validateFreeModelAccess({
            userId: authenticatedUser.userId,
            isAnonymous: authenticatedUser.isAnonymous,
            polarCustomerId: authenticatedUser.polarCustomerId,
            selectedModel,
            isUsingOwnApiKeys: checkIfUsingOwnApiKeys(selectedModel, apiKeys),
            isFreeModel: selectedModel.endsWith(':free'),
            webSearchEnabled: webSearch.enabled,
            estimatedTokens: 30,
            hasCredits: creditValidation.hasCredits
        });

        await ChatCreditValidationService.validatePremiumModelAccess({
            userId: authenticatedUser.userId,
            isAnonymous: authenticatedUser.isAnonymous,
            polarCustomerId: authenticatedUser.polarCustomerId,
            selectedModel,
            isUsingOwnApiKeys: checkIfUsingOwnApiKeys(selectedModel, apiKeys),
            isFreeModel: selectedModel.endsWith(':free'),
            webSearchEnabled: webSearch.enabled,
            estimatedTokens: 30,
            hasCredits: creditValidation.hasCredits
        });

        // 7. Configure web search
        const webSearchConfig = ChatWebSearchService.validateAndConfigureWebSearch({
            webSearch,
            selectedModel,
            isUsingOwnApiKeys: checkIfUsingOwnApiKeys(selectedModel, apiKeys),
            isAnonymous: authenticatedUser.isAnonymous,
            actualCredits: creditValidation.actualCredits,
            modelInfo: modelValidation.modelInfo
        });

        // 8. Initialize MCP servers
        const mcpResult = await ChatMCPServerService.initializeMCPServers({
            mcpServers: initialMcpServers,
            selectedModel
        });

        // 9. Prepare chat ID
        const id = chatId || nanoid();
        const isNewChat = !chatId || !(await ChatDatabaseService.checkChatExists({
            chatId: id,
            userId: authenticatedUser.userId
        }));

        // 10. Pre-emptively create chat if new
        if (isNewChat) {
            await ChatDatabaseService.createChatIfNotExists({
                id,
                userId: authenticatedUser.userId,
                selectedModel,
                apiKeys,
                isAnonymous: authenticatedUser.isAnonymous,
                messages: []
            });
        }

        // At this point, all services are initialized and configured
        // The next steps would be:
        // - Set up the language model with web search options
        // - Configure streaming with MCP tools
        // - Handle the actual chat completion
        // - Process token tracking
        // - Save results to database

        return new Response(JSON.stringify({
            message: "Refactored route - services integrated successfully",
            chatId: id,
            services: {
                authentication: "completed",
                modelValidation: "completed",
                messageProcessing: "completed",
                creditValidation: "completed",
                webSearch: webSearchConfig.enabled ? "configured" : "disabled",
                mcpServers: mcpResult.mcpClients.length > 0 ? "initialized" : "none",
                database: isNewChat ? "chat_created" : "chat_exists"
            }
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error(`[API Route Error][Chat ${requestId}] Error in refactored route:`, JSON.stringify(error, null, 2));

        if (error instanceof Response) {
            return error; // Already a proper error response
        }

        return new Response(
            JSON.stringify({
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An internal error occurred",
                    details: error.message
                }
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}