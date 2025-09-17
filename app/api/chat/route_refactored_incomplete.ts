import { model, type modelID, getLanguageModelWithKeys, createOpenRouterClientWithKey } from "@/ai/providers";
import { getModelDetails } from "@/lib/models/fetch-models";
import { type ModelInfo } from "@/lib/types/models";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { getApiKey } from "@/ai/providers";
import { streamText, generateText, type UIMessage, type LanguageModelResponseMetadata, type Message } from "ai";
import { validatePresetParameters, getModelDefaults, sanitizeSystemInstruction } from "@/lib/parameter-validation";
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
import { logDiagnostic as originalLogDiagnostic, logChunk, logPerformanceMetrics, logError, logRequestBoundary } from '@/lib/utils/performantLogging';
import type { ImageUIPart } from '@/lib/types';

// Import our new services
import { AuthService } from '@/lib/services/authService';
import { CreditService } from '@/lib/services/creditService';
import { UsageLimitsService } from '@/lib/services/usageLimitsService';
import { MessageProcessingService } from '@/lib/services/messageProcessingService';
import { MCPService } from '@/lib/services/mcpService';
import { WebSearchService } from '@/lib/services/webSearchService';
import { ErrorHandlerService } from '@/lib/services/errorHandlerService';

const logDiagnostic = originalLogDiagnostic;

export const maxDuration = 300;

// Interfaces
interface KeyValuePair {
    key: string;
    value: string;
}

interface MCPServerConfig {
    type: 'sse' | 'stdio' | 'streamable-http';
    url?: string;
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
    type: 'url_citation';
    url_citation: UrlCitation;
}

interface OpenRouterResponse extends LanguageModelResponseMetadata {
    citations?: Annotation[];
}

// Helper to extract input tokens from event (AI SDK format)
const extractInputTokensFromEvent = (event: any): number => {
    if (!event) return 0;

    // Handle different event structures
    if (event.usage?.inputTokens) {
        return event.usage.inputTokens;
    }

    if (event.usage?.promptTokens) {
        return event.usage.promptTokens;
    }

    if (event.usage?.totalTokens && event.usage?.completionTokens) {
        return event.usage.totalTokens - event.usage.completionTokens;
    }

    return 0;
};

export async function POST(req: Request) {
    const requestId = nanoid();

    // Create request-scoped caches for performance optimization
    const { getRemainingCreditsByExternalId: getCachedCreditsByExternal, getRemainingCredits: getCachedCredits, cache: creditCache } = createRequestCreditCache();
    const requestStartTime = Date.now();

    // Enhanced timing tracking variables
    const firstTokenTime: number | null = null;
    const streamingStartTime: Date | null = null;
    const timeToFirstTokenMs: number | null = null;
    const tokensPerSecond: number | null = null;

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
            selectedModel: modelID;
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
            chatId,
            selectedModel,
            messageCount: messages.length,
            attachmentCount: attachments.length,
            webSearchEnabled: webSearch.enabled,
            mcpServerCount: initialMcpServers.length
        });

        // Get model details
        const selectedModelInfo = await getModelDetails(selectedModel);
        logDiagnostic('MODEL_DETAILS', `Model details retrieved`, {
            requestId,
            selectedModel,
            modelInfo: selectedModelInfo
        });

        // Early authentication check for performance
        const earlyAuth = await AuthService.getEarlySession(req);
        const earlyIsUsingOwnApiKeys = CreditService.checkIfUsingOwnApiKeys(selectedModel, apiKeys);

        // Process messages with attachments
        const messageResult = await MessageProcessingService.processMessagesWithAttachments(
            messages,
            attachments,
            selectedModelInfo,
            selectedModel
        );

        // Get full authentication details
        const auth = await AuthService.getFullSession(req);
        const { userId, isAnonymous, polarCustomerId, openRouterUserId } = auth;

        // Check credits
        const creditResult = await CreditService.checkCredits({
            selectedModel,
            apiKeys,
            estimatedTokens: 30, // Conservative estimation for initial check
            userId,
            isAnonymous,
            polarCustomerId,
            modelInfo: selectedModelInfo || undefined
        });

        // Check usage limits
        const usageCheck = await UsageLimitsService.shouldBlockUser(userId);
        if (usageCheck.shouldBlock) {
            return ErrorHandlerService.createUsageLimitError(usageCheck.reason!);
        }

        // Validate web search
        const webSearchResult = WebSearchService.validateWebSearch(
            webSearch,
            creditResult.hasCredits,
            creditResult.isUsingOwnApiKeys,
            isAnonymous,
            selectedModel,
            WebSearchService.modelSupportsWebSearch(selectedModel)
        );

        // Initialize MCP servers
        const mcpResult = await MCPService.initializeMCPServers(initialMcpServers, req.signal);

        // Continue with the rest of the implementation...
        // This is a simplified version - the full implementation would continue here

        return new Response("Refactored route - implementation in progress", { status: 200 });

    } catch (error) {
        ErrorHandlerService.logError(error, 'POST');
        return ErrorHandlerService.createErrorFromException(error);
    }
}
