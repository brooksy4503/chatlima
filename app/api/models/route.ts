import { NextRequest, NextResponse } from 'next/server';
import { fetchAllModels, getEnvironmentApiKeys, clearProviderCache, getCacheStats } from '@/lib/models/fetch-models';
import { ApiKeyContext } from '@/lib/types/models';
import { headers } from 'next/headers';

// Helper to extract user API keys from request
function extractUserApiKeys(request: NextRequest): Record<string, string> {
    const userKeys: Record<string, string> = {};

    try {
        // Try to get API keys from headers (for authenticated requests)
        const authHeader = request.headers.get('x-api-keys');
        if (authHeader) {
            const parsed = JSON.parse(authHeader);
            if (typeof parsed === 'object' && parsed !== null) {
                Object.assign(userKeys, parsed);
            }
        }

        // Alternative: get from URL params (less secure, for testing)
        const url = new URL(request.url);
        const providedKeys = url.searchParams.get('api_keys');
        if (providedKeys) {
            const parsed = JSON.parse(providedKeys);
            if (typeof parsed === 'object' && parsed !== null) {
                Object.assign(userKeys, parsed);
            }
        }
    } catch (error) {
        console.warn('Failed to parse user API keys:', error);
    }

    return userKeys;
}

// Helper to validate request and return error response
function createErrorResponse(message: string, status = 500): NextResponse {
    return NextResponse.json(
        {
            error: message,
            models: [],
            metadata: {
                lastUpdated: new Date(),
                providers: {},
                totalModels: 0,
                cacheHit: false,
            }
        },
        { status }
    );
}

// GET /api/models - Fetch dynamic models
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const forceRefresh = url.searchParams.get('force') === 'true';
        const stats = url.searchParams.get('stats') === 'true';

        // If stats requested, return cache statistics
        if (stats) {
            return NextResponse.json({
                cache: getCacheStats(),
                timestamp: new Date(),
            });
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
            // Get environment API keys (server-side only)
            const environmentKeys = getEnvironmentApiKeys();

            // Extract user-provided API keys
            const userKeys = extractUserApiKeys(request);

            // Create API key context
            const apiKeyContext: ApiKeyContext = {
                environment: environmentKeys,
                user: Object.keys(userKeys).length > 0 ? userKeys : undefined,
            };

            // Fetch models from all providers
            const response = await fetchAllModels(
                apiKeyContext,
                forceRefresh,
                controller.signal
            );

            clearTimeout(timeoutId);

            // Set cache headers
            const headers = new Headers();
            headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
            headers.set('Content-Type', 'application/json');

            // Add CORS headers for development
            if (process.env.NODE_ENV === 'development') {
                headers.set('Access-Control-Allow-Origin', '*');
                headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-keys');
            }

            return NextResponse.json(response, { headers });

        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error && error.name === 'AbortError') {
                return createErrorResponse('Request timeout', 408);
            }

            throw error; // Re-throw for general error handling below
        }

    } catch (error) {
        console.error('Error fetching models:', error);

        const errorMessage = error instanceof Error
            ? error.message
            : 'Unknown error occurred while fetching models';

        return createErrorResponse(errorMessage);
    }
}

// POST /api/models/refresh - Force refresh all provider caches
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { provider } = body;

        // Clear cache for specific provider or all providers
        clearProviderCache(provider);

        return NextResponse.json({
            success: true,
            message: provider
                ? `Cache cleared for provider: ${provider}`
                : 'All provider caches cleared',
            timestamp: new Date(),
        });

    } catch (error) {
        console.error('Error clearing cache:', error);
        return createErrorResponse('Failed to clear cache');
    }
}

// OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-keys');

    return new NextResponse(null, { status: 200, headers });
} 