import { NextRequest, NextResponse } from 'next/server';

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
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const targetUrl = searchParams.get('url');

        if (!targetUrl) {
            return NextResponse.json(
                { error: 'Missing url parameter' },
                { status: 400 }
            );
        }

        // Validate that the URL is for an OAuth endpoint
        const url = new URL(targetUrl);
        const isOAuthEndpoint =
            url.pathname.includes('/.well-known/oauth') ||
            url.pathname.includes('/api/auth/mcp/');

        if (!isOAuthEndpoint) {
            return NextResponse.json(
                { error: 'Invalid endpoint. Only OAuth endpoints are allowed.' },
                { status: 400 }
            );
        }

        // Forward the request to the target URL
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'ChatLima-MCP-Client/1.0',
            },
        });

        // Try to parse as JSON, fallback to text
        let responseData: any;
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            try {
                responseData = await response.json();
            } catch {
                responseData = { error: 'Failed to parse JSON response' };
            }
        } else {
            const text = await response.text();
            try {
                // Try to parse as JSON even if content-type doesn't say so
                responseData = JSON.parse(text);
            } catch {
                responseData = { content: text };
            }
        }

        return NextResponse.json(
            response.ok ? responseData : { error: responseData.error || responseData.content || 'Request failed' },
            {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    } catch (error) {
        console.error('[MCP OAuth Proxy] GET error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Proxy request failed' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const targetUrl = searchParams.get('url');

        if (!targetUrl) {
            return NextResponse.json(
                { error: 'Missing url parameter' },
                { status: 400 }
            );
        }

        // Validate that the URL is for an OAuth registration endpoint
        const url = new URL(targetUrl);
        if (!url.pathname.includes('/api/auth/mcp/register')) {
            return NextResponse.json(
                { error: 'Invalid endpoint. Only OAuth registration endpoints are allowed.' },
                { status: 400 }
            );
        }

        // Get the request body
        const body = await request.json().catch(() => ({}));

        // Forward the request to the target URL
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'ChatLima-MCP-Client/1.0',
            },
            body: JSON.stringify(body),
        });

        // Try to parse as JSON, fallback to text
        let responseData: any;
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            try {
                responseData = await response.json();
            } catch {
                responseData = { error: 'Failed to parse JSON response' };
            }
        } else {
            const text = await response.text();
            try {
                // Try to parse as JSON even if content-type doesn't say so
                responseData = JSON.parse(text);
            } catch {
                responseData = { content: text };
            }
        }

        return NextResponse.json(
            response.ok ? responseData : { error: responseData.error || responseData.content || 'Request failed' },
            {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    } catch (error) {
        console.error('[MCP OAuth Proxy] POST error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Proxy request failed' },
            { status: 500 }
        );
    }
}
