import { modelID } from '@/ai/providers';

/**
 * Base API response structure
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?: {
        [key: string]: any;
    };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    offset?: number;
}

/**
 * Date range parameters
 */
export interface DateRangeParams {
    startDate?: string;
    endDate?: string;
}

/**
 * Filter parameters for usage data
 */
export interface UsageFilterParams extends DateRangeParams {
    provider?: string;
    modelId?: modelID;
    currency?: string;
}

/**
 * Token usage data structure
 */
export interface TokenUsageData {
    id: string;
    userId: string;
    chatId: string;
    messageId: string;
    modelId: modelID;
    provider: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCost: number;
    actualCost?: number;
    currency: string;
    processingTimeMs?: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    errorMessage?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Daily token usage aggregation
 */
export interface DailyTokenUsageData {
    date: Date;
    provider: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCost: number;
    actualCost: number;
    requestCount: number;
}

/**
 * Token usage statistics
 */
export interface TokenUsageStats {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    totalEstimatedCost: number;
    totalActualCost: number;
    requestCount: number;
    breakdownByProvider: Array<{
        provider: string;
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        estimatedCost: number;
        actualCost: number;
        requestCount: number;
    }>;
}

/**
 * Cost breakdown structure
 */
export interface CostBreakdown {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    inputCost: number;
    outputCost: number;
    subtotal: number;
    discountAmount: number;
    totalCost: number;
    currency: string;
    volumeDiscountApplied?: boolean;
    discountPercentage?: number;
}

/**
 * Aggregated cost data
 */
export interface AggregatedCostData {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    totalInputCost: number;
    totalOutputCost: number;
    totalSubtotal: number;
    totalDiscount: number;
    totalCost: number;
    currency: string;
    requestCount: number;
    averageCostPerRequest: number;
    averageCostPerToken: number;
    breakdownByProvider: {
        [provider: string]: CostBreakdown;
    };
    breakdownByModel: {
        [modelId: string]: CostBreakdown;
    };
    breakdownByDay: {
        [date: string]: CostBreakdown;
    };
}

/**
 * Usage summary statistics
 */
export interface UsageSummaryStats {
    totalTokens: number;
    totalCost: number;
    currency: string;
    requestCount: number;
    averageTokensPerRequest: number;
    averageCostPerRequest: number;
    topProviders: Array<{
        provider: string;
        tokenCount: number;
        cost: number;
        percentage: number;
    }>;
    topModels: Array<{
        modelId: modelID;
        tokenCount: number;
        cost: number;
        percentage: number;
    }>;
    dailyTrends: Array<{
        date: string;
        tokens: number;
        cost: number;
    }>;
    period: {
        startDate: Date;
        endDate: Date;
        days: number;
    };
}

/**
 * Model pricing information
 */
export interface ModelPricingInfo {
    id: string;
    modelId: modelID;
    provider: string;
    inputTokenPrice: number;
    outputTokenPrice: number;
    currency: string;
    effectiveFrom: Date;
    effectiveTo?: Date;
    isActive: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Model pricing list response
 */
export interface ModelPricingList {
    models: ModelPricingInfo[];
    total: number;
}

/**
 * Usage limit configuration
 */
export interface UsageLimitConfig {
    id: string;
    userId?: string; // null for global limits
    monthlyTokenLimit?: number;
    monthlyCostLimit?: number;
    dailyTokenLimit?: number;
    dailyCostLimit?: number;
    requestRateLimit?: number; // requests per minute
    currency: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Usage limit status
 */
export interface UsageLimitStatus {
    monthlyTokens: {
        used: number;
        limit: number;
        remaining: number;
        percentage: number;
    };
    monthlyCost: {
        used: number;
        limit: number;
        remaining: number;
        percentage: number;
    };
    dailyTokens: {
        used: number;
        limit: number;
        remaining: number;
        percentage: number;
    };
    dailyCost: {
        used: number;
        limit: number;
        remaining: number;
        percentage: number;
    };
    isApproachingAnyLimit: boolean;
    isOverAnyLimit: boolean;
    currency: string;
}

/**
 * Export format options
 */
export type ExportFormat = 'json' | 'csv';

/**
 * Export data parameters
 */
export interface ExportParams extends UsageFilterParams, PaginationParams {
    format: ExportFormat;
    includeCostData?: boolean;
    includeMetadata?: boolean;
}

/**
 * Export response
 */
export interface ExportResponse {
    downloadUrl: string;
    filename: string;
    format: ExportFormat;
    recordCount: number;
    generatedAt: Date;
    expiresAt: Date;
}

/**
 * API route handlers with common functionality
 */
export interface ApiRouteHandler {
    handleRequest: (req: Request, context?: any) => Promise<Response>;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Maximum requests per window
    keyGenerator?: (req: Request) => string; // Custom key generator
    skipSuccessfulRequests?: boolean; // Don't count successful requests
    skipFailedRequests?: boolean; // Don't count failed requests
}

/**
 * Validation error details
 */
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

/**
 * Authentication context
 */
export interface AuthContext {
    userId: string;
    isAuthenticated: boolean;
    isAdmin?: boolean;
    isAnonymous?: boolean;
    hasSubscription?: boolean;
}