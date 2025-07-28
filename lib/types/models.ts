// Enhanced model system types

export interface ModelInfo {
    id: string;            // unique (provider/model-id)
    provider: string;      // "OpenRouter" | "Requesty" | …
    name: string;          // human label
    description?: string;
    capabilities: string[];// normalised tags (code, reasoning…)
    premium: boolean;
    vision: boolean;
    contextMax?: number;
    apiVersion?: string;   // if available

    // Status and health tracking
    status: 'available' | 'limited' | 'deprecated' | 'unavailable';
    lastChecked: Date;
    errorMessage?: string;
    providerHealth?: 'healthy' | 'degraded' | 'down';

    // Enhanced metadata
    pricing?: {
        input?: number;      // per token
        output?: number;     // per token
        currency?: string;
    };
    rateLimit?: {
        requestsPerMinute?: number;
        tokensPerMinute?: number;
    };

    // Favorites support
    isFavorite?: boolean;    // Whether this model is favorited by the current user

    // Legacy compatibility fields for existing features
    enabled?: boolean;
    supportsWebSearch?: boolean;
    temperatureRange?: { min: number; max: number; default: number };
    maxTokensRange?: { min: number; max: number; default: number };
    supportsTemperature?: boolean;
    supportsMaxTokens?: boolean;
    supportsSystemInstruction?: boolean;
    maxSystemInstructionLength?: number;
}

export interface ProviderInfo {
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    lastChecked: Date;
    modelCount: number;
    error?: string;
    hasEnvironmentKey: boolean;
    supportsUserKeys: boolean;
}

export interface RawProviderModel {
    // Generic structure - each provider will have different fields
    id: string;
    name?: string;
    description?: string;
    [key: string]: any; // Allow additional provider-specific fields
}

export interface ModelsResponse {
    models: ModelInfo[];
    metadata: {
        lastUpdated: Date;
        providers: Record<string, ProviderInfo>;
        totalModels: number;
        cacheHit: boolean;
        userProvidedKeys?: string[]; // Which providers used user keys
    };
}

export interface ProviderConfig {
    name: string;
    envKey: string;
    endpoint: string;
    parse: (data: any) => ModelInfo[];
    healthCheck?: string;           // Endpoint for provider health
    rateLimit?: {                  // Rate limiting config
        requestsPerMinute: number;
        burstLimit: number;
    };
    retryConfig?: {                // Retry strategy
        maxRetries: number;
        backoffMs: number;
    };
}

export interface CacheConfig {
    modelListTTL: number;      // 10 minutes
    modelDetailsTTL: number;   // 1 hour  
    providerHealthTTL: number; // 30 seconds
    forceRefreshKey: string;   // Admin override
}

export interface ModelMigration {
    oldId: string;
    newId: string;
    reason: 'renamed' | 'moved' | 'deprecated';
    automaticMigration: boolean;
}

export interface CachedProviderData {
    models: ModelInfo[];
    provider: ProviderInfo;
    timestamp: Date;
    expiresAt: Date;
}

export interface ProviderFetchResult {
    success: boolean;
    models: ModelInfo[];
    provider: ProviderInfo;
    error?: Error;
}

export interface ApiKeyContext {
    environment: Record<string, string>; // Environment variables
    user?: Record<string, string>;       // User-provided keys
} 