import { NextRequest } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { db } from '@/lib/db';
import { mcpOauthSessions } from '@/lib/db/schema';
import { AuthService } from '@/lib/services/authService';

function base64urlEncode(buffer: Buffer): string {
    return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function generatePKCE() {
    const verifier = base64urlEncode(randomBytes(32));
    const challenge = base64urlEncode(createHash('sha256').update(verifier).digest());
    return { verifier, challenge };
}

function toCanonicalResource(serverUrl: string): string {
    try {
        const u = new URL(serverUrl);
        // Use origin + path if path seems MCP endpoint; otherwise origin
        const canonical = u.origin; // conservative default per spec guidance
        return canonical;
    } catch {
        return serverUrl;
    }
}

function parseWwwAuthenticate(header: string | null): string | null {
    if (!header) return null;
    // Look for resource_metadata="..." or resource_metadata=...
    const match = header.match(/resource_metadata\s*=\s*"([^"]+)"/i) || header.match(/resource_metadata\s*=\s*([^,\s]+)/i);
    return match ? match[1] : null;
}

async function discoverResourceMetadataUrl(serverUrl: string): Promise<string | null> {
    try {
        const resp = await fetch(serverUrl, {
            method: 'GET',
            headers: {
                'MCP-Protocol-Version': '2025-06-18'
            }
        });
        if (resp.status === 401) {
            const www = resp.headers.get('www-authenticate');
            const urlFromHeader = parseWwwAuthenticate(www);
            if (urlFromHeader) return urlFromHeader;
        }
        // Fallback: conventional well-known location on same origin
        const u = new URL(serverUrl);
        return `${u.origin}/.well-known/oauth-protected-resource`;
    } catch {
        try {
            const u = new URL(serverUrl);
            return `${u.origin}/.well-known/oauth-protected-resource`;
        } catch {
            return null;
        }
    }
}

function buildAuthorizationServerMetadataUrl(authorizationServer: string): string {
    try {
        const asUrl = new URL(authorizationServer);
        // If path already looks like a well-known metadata path, use as-is
        if (asUrl.pathname.includes('/.well-known/oauth-authorization-server')) {
            return asUrl.toString();
        }
        return `${asUrl.origin}/.well-known/oauth-authorization-server`;
    } catch {
        return authorizationServer;
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams, origin } = new URL(req.url);
        const serverUrl = searchParams.get('serverUrl');
        const scope = searchParams.get('scope') || undefined;
        const resourceOverride = searchParams.get('resource') || undefined;

        if (!serverUrl) {
            return new Response(JSON.stringify({ error: 'Missing serverUrl' }), { status: 400 });
        }

        const auth = await AuthService.getFullSession(req as unknown as Request);
        if (!auth.session || !auth.userId || auth.isAnonymous) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const resource = resourceOverride || toCanonicalResource(serverUrl);

        // 1) Discover resource metadata
        const resourceMetadataUrl = await discoverResourceMetadataUrl(serverUrl);
        if (!resourceMetadataUrl) {
            return new Response(JSON.stringify({ error: 'Failed to determine resource metadata URL' }), { status: 400 });
        }

        const rsMetaResp = await fetch(resourceMetadataUrl, { method: 'GET' });
        if (!rsMetaResp.ok) {
            return new Response(JSON.stringify({ error: `Failed to fetch resource metadata (${rsMetaResp.status})` }), { status: 400 });
        }
        const rsMeta = await rsMetaResp.json();
        const authorizationServers: string[] = Array.isArray(rsMeta.authorization_servers) ? rsMeta.authorization_servers : [];
        if (!authorizationServers.length) {
            return new Response(JSON.stringify({ error: 'No authorization servers advertised' }), { status: 400 });
        }
        const authorizationServer = authorizationServers[0];

        // 2) Fetch authorization server metadata
        const asMetaUrl = buildAuthorizationServerMetadataUrl(authorizationServer);
        const asMetaResp = await fetch(asMetaUrl, { method: 'GET' });
        if (!asMetaResp.ok) {
            return new Response(JSON.stringify({ error: `Failed to fetch authorization server metadata (${asMetaResp.status})` }), { status: 400 });
        }
        const asMeta = await asMetaResp.json();
        const authorizationEndpoint: string | undefined = asMeta.authorization_endpoint;
        const tokenEndpoint: string | undefined = asMeta.token_endpoint;
        const registrationEndpoint: string | undefined = asMeta.registration_endpoint;
        if (!authorizationEndpoint || !tokenEndpoint) {
            return new Response(JSON.stringify({ error: 'Authorization server metadata missing endpoints' }), { status: 400 });
        }

        // 3) Optional Dynamic Client Registration
        let clientId: string | undefined;
        let clientSecret: string | undefined;
        const redirectUri = `${origin}/api/mcp/oauth/callback`;
        if (registrationEndpoint) {
            try {
                const regResp = await fetch(registrationEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        client_name: 'ChatLima',
                        redirect_uris: [redirectUri],
                        token_endpoint_auth_method: 'none',
                        application_type: 'web'
                    })
                });
                if (regResp.ok) {
                    const reg = await regResp.json();
                    clientId = reg.client_id;
                    clientSecret = reg.client_secret || undefined;
                }
            } catch {
                // Ignore registration failures; some servers require manual client IDs
            }
        }
        if (!clientId) {
            // As a fallback, try using a public client identifier
            clientId = 'chatlima-public';
        }

        // 4) Create PKCE + state and persist session
        const { verifier, challenge } = generatePKCE();
        const state = base64urlEncode(randomBytes(16));
        await db.insert(mcpOauthSessions).values({
            userId: auth.userId,
            serverUrl,
            resource,
            state,
            codeVerifier: verifier,
            resourceMetadataUrl,
            authorizationServer,
            authorizationEndpoint,
            tokenEndpoint,
            registrationEndpoint,
            clientId,
            clientSecret,
            scope
        }).execute();

        // 5) Build authorization URL
        const authUrl = new URL(authorizationEndpoint);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('code_challenge', challenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('resource', resource);
        if (scope) authUrl.searchParams.set('scope', scope);

        return Response.redirect(authUrl.toString(), 302);
    } catch (err) {
        console.error('[MCP OAuth] start error', err);
        return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
    }
}


