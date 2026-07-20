import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { WebFetchService, WebFetchError } from '@/lib/services/webFetchService';

/**
 * Proxy route for MCP OAuth endpoints to avoid CORS issues
 *
 * This route proxies requests to MCP server OAuth endpoints:
 * - /.well-known/oauth-authorization-server
 * - /.well-known/oauth-protected-resource
 * - /api/auth/mcp/register
 *
 * Usage:
 * GET /api/mcp/oauth/proxy?url=https://api.supermemory.ai/.well-known/oauth-authorization-server
 * POST /api/mcp/oauth/proxy?url=https://api.supermemory.ai/api/auth/mcp/register
 *
 * Security: this route is an SSRF sink (it fetches an attacker-influenced URL
 * and returns the body). To prevent abuse it (1) requires an authenticated
 * session, (2) runs the target URL through the same WebFetchService SSRF
 * guard used by the web_fetch tool (blocks localhost, private IPv4 ranges,
 * cloud-metadata 169.254.0.0/16, CGN 100.64.0.0/10, IPv6 ULA/link-local, and
 * resolves DNS to block records pointing at private IPs), (3) only allows
 * exact-match OAuth-metadata/register pathnames (the old substring match on
 * `/.well-known/oauth` was bypassable with e.g.
 * `/.well-known/oauth-anything`), and (4) disables auto-redirect following and
 * re-validates each redirect hop (capped at 3) so a public URL cannot redirect
 * into a private host.
 */

const OAUTH_METADATA_PATHS = new Set([
    '/.well-known/oauth-authorization-server',
    '/.well-known/oauth-protected-resource',
]);
const MCP_REGISTER_PATH = '/api/auth/mcp/register';
const MAX_REDIRECT_HOPS = 3;

function buildProxyHeaders(): Record<string, string> {
    return {
        'Accept': 'application/json',
        'User-Agent': 'ChatLima-MCP-Client/1.0',
    };
}

async function parseProxyResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        try {
            return await response.json();
        } catch {
            return { error: 'Failed to parse JSON response' };
        }
    }

    const text = await response.text();
    try {
        // Try to parse as JSON even if content-type doesn't say so
        return JSON.parse(text);
    } catch {
        return { content: text };
    }
}

/**
 * Validates and normalizes the target URL through the WebFetchService SSRF
 * guard, then returns the parsed URL for pathname checks. Throws WebFetchError
 * on any violation (bad scheme, embedded credentials, private/blocked host).
 */
async function validateTargetUrl(targetUrl: string): Promise<URL> {
    const normalized = WebFetchService.validateAndNormalizeUrl(targetUrl);
    await WebFetchService.assertPublicUrl(normalized);
    return new URL(normalized);
}

/**
 * Fetches the target with manual redirect handling. Each redirect hop is
 * re-validated through validateTargetUrl so a redirect into a private host is
 * rejected (403) rather than followed. Mirrors the redirect-safety pattern in
 * WebFetchService.fetchSingleUrl.
 */
async function fetchWithManualRedirects(
    url: URL,
    init: RequestInit,
): Promise<Response> {
    let currentUrl = url;
    for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop++) {
        const response = await fetch(currentUrl, {
            ...init,
            redirect: 'manual',
        });

        if (
            response.status >= 300 &&
            response.status < 400 &&
            hop < MAX_REDIRECT_HOPS
        ) {
            const location = response.headers.get('location');
            if (!location) {
                return response;
            }
            // Re-validate the redirect target before following it. If it points
            // at a private/blocked host, validateTargetUrl throws WebFetchError
            // which the caller maps to a 403.
            const nextUrl = await validateTargetUrl(
                new URL(location, currentUrl.toString()).toString(),
            );
            currentUrl = nextUrl;
            continue;
        }

        return response;
    }

    // Exceeded MAX_REDIRECT_HOPS.
    throw new WebFetchError(
        'WEB_FETCH_TOO_MANY_REDIRECTS',
        `Too many redirects (>${MAX_REDIRECT_HOPS}).`,
        400,
    );
}

export async function GET(request: NextRequest) {
    try {
        // Require an authenticated session. The proxy fetches arbitrary URLs
        // server-side and returns the body; it must not be an open SSRF.
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const targetUrl = searchParams.get('url');

        if (!targetUrl) {
            return NextResponse.json(
                { error: 'Missing url parameter' },
                { status: 400 },
            );
        }

        // Validate the URL through the SSRF guard (scheme, embedded creds,
        // private/blocked hosts, DNS resolution). Throws WebFetchError.
        let url: URL;
        try {
            url = await validateTargetUrl(targetUrl);
        } catch (error) {
            if (error instanceof WebFetchError) {
                return NextResponse.json(
                    { error: 'URL not allowed' },
                    { status: error.status || 403 },
                );
            }
            throw error;
        }

        // Tightened pathname gate: exact-match only. The previous substring
        // match on `/.well-known/oauth` was bypassable with paths like
        // `/.well-known/oauth-anything`.
        const isOAuthMetadata = OAUTH_METADATA_PATHS.has(url.pathname);
        const isMcpRegister = url.pathname === MCP_REGISTER_PATH;

        if (!isOAuthMetadata && !isMcpRegister) {
            return NextResponse.json(
                { error: 'Invalid endpoint. Only OAuth endpoints are allowed.' },
                { status: 400 },
            );
        }

        // Forward the request with manual redirect handling.
        const response = await fetchWithManualRedirects(url, {
            method: 'GET',
            headers: buildProxyHeaders(),
        });

        const responseData = await parseProxyResponse(response);

        return NextResponse.json(
            response.ok ? responseData : { error: responseData.error || responseData.content || 'Request failed' },
            {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    } catch (error) {
        console.error('[MCP OAuth Proxy] GET error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Proxy request failed' },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Require an authenticated session.
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const targetUrl = searchParams.get('url');

        if (!targetUrl) {
            return NextResponse.json(
                { error: 'Missing url parameter' },
                { status: 400 },
            );
        }

        // Validate the URL through the SSRF guard.
        let url: URL;
        try {
            url = await validateTargetUrl(targetUrl);
        } catch (error) {
            if (error instanceof WebFetchError) {
                return NextResponse.json(
                    { error: 'URL not allowed' },
                    { status: error.status || 403 },
                );
            }
            throw error;
        }

        // POST allows the registration endpoint only (matches prior intent).
        if (url.pathname !== MCP_REGISTER_PATH) {
            return NextResponse.json(
                { error: 'Invalid endpoint. Only OAuth registration endpoints are allowed.' },
                { status: 400 },
            );
        }

        // Get the request body
        const body = await request.json().catch(() => ({}));

        // Forward the request with manual redirect handling.
        const response = await fetchWithManualRedirects(url, {
            method: 'POST',
            headers: {
                ...buildProxyHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const responseData = await parseProxyResponse(response);

        return NextResponse.json(
            response.ok ? responseData : { error: responseData.error || responseData.content || 'Request failed' },
            {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    } catch (error) {
        console.error('[MCP OAuth Proxy] POST error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Proxy request failed' },
            { status: 500 },
        );
    }
}
