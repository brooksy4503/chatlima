/**
 * Utility to intercept fetch calls and proxy OAuth-related requests through Next.js API routes
 * to avoid CORS issues when the MCP SDK makes direct browser requests to OAuth endpoints.
 */

const PROXY_BASE_URL = '/api/mcp/oauth/proxy';

/**
 * Check if a URL is an OAuth-related endpoint that should be proxied
 */
function isOAuthEndpoint(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return (
            urlObj.pathname.includes('/.well-known/oauth') ||
            urlObj.pathname.includes('/api/auth/mcp/')
        );
    } catch {
        return false;
    }
}

/**
 * Create a proxied fetch function that routes OAuth requests through our API proxy
 */
export function createProxiedFetch(originalFetch: typeof fetch): typeof fetch {
    return async function proxiedFetch(
        input: RequestInfo | URL,
        init?: RequestInit
    ): Promise<Response> {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

        // Only proxy OAuth-related endpoints
        if (!isOAuthEndpoint(url)) {
            return originalFetch(input, init);
        }

        console.log(`[MCP OAuth Proxy] Intercepting request to: ${url}`);

        try {
            // Route through our proxy API
            const proxyUrl = new URL(PROXY_BASE_URL, window.location.origin);
            proxyUrl.searchParams.set('url', url);

            const method = init?.method || 'GET';
            const proxyInit: RequestInit = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...init?.headers,
                },
            };

            // For POST requests, forward the body
            if (method === 'POST' && init?.body) {
                proxyInit.body = init.body;
            }

            const response = await originalFetch(proxyUrl.toString(), proxyInit);

            // If the proxy request failed, try direct request as fallback
            if (!response.ok) {
                console.warn(`[MCP OAuth Proxy] Proxy request failed (${response.status}), trying direct request as fallback`);
                try {
                    return await originalFetch(input, init);
                } catch (fallbackError) {
                    // If direct request also fails, return the proxy error response
                    console.error(`[MCP OAuth Proxy] Direct request also failed:`, fallbackError);
                    return response;
                }
            }

            // Return the proxied response directly
            // The SDK will call .json() or .text() on it, which will work since it's a real Response
            return response;
        } catch (error) {
            console.error(`[MCP OAuth Proxy] Proxy error:`, error);
            // Fallback to direct request on error
            return originalFetch(input, init);
        }
    };
}

/**
 * Install the fetch interceptor for OAuth requests
 * Returns a cleanup function to restore the original fetch
 */
export function installOAuthFetchInterceptor(): () => void {
    if (typeof window === 'undefined') {
        return () => { }; // No-op on server
    }

    const originalFetch = window.fetch;
    const proxiedFetch = createProxiedFetch(originalFetch);

    // Replace window.fetch with our proxied version
    window.fetch = proxiedFetch as typeof fetch;

    console.log('[MCP OAuth Proxy] Fetch interceptor installed');

    // Return cleanup function
    return () => {
        window.fetch = originalFetch;
        console.log('[MCP OAuth Proxy] Fetch interceptor removed');
    };
}
