import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { mcpOauthSessions, mcpOauthTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const state = searchParams.get('state');
        const code = searchParams.get('code');

        if (!state || !code) {
            return new Response('Missing state or code', { status: 400 });
        }

        const session = await db.query.mcpOauthSessions.findFirst({
            where: eq(mcpOauthSessions.state, state)
        });
        if (!session) {
            return new Response('Invalid state', { status: 400 });
        }

        // Exchange code for tokens
        if (!session.tokenEndpoint || !session.clientId) {
            return new Response('OAuth session missing endpoints', { status: 400 });
        }

        const body = new URLSearchParams();
        body.set('grant_type', 'authorization_code');
        body.set('code', code);
        body.set('redirect_uri', `${new URL(req.url).origin}/api/mcp/oauth/callback`);
        body.set('client_id', session.clientId);
        if (session.clientSecret) body.set('client_secret', session.clientSecret);
        body.set('code_verifier', session.codeVerifier);
        body.set('resource', session.resource);

        const resp = await fetch(session.tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString()
        });

        if (!resp.ok) {
            const errText = await resp.text();
            return new Response(`Token exchange failed: ${resp.status} ${errText}`, { status: 400 });
        }
        const tokenJson = await resp.json();

        const accessToken = tokenJson.access_token as string;
        const refreshToken = tokenJson.refresh_token as (string | undefined);
        const tokenType = (tokenJson.token_type as string | undefined) || 'Bearer';
        const scope = tokenJson.scope as (string | undefined);
        const expiresIn = tokenJson.expires_in as (number | undefined);
        const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

        // Upsert token per user+server
        const existing = await db.query.mcpOauthTokens.findFirst({
            where: (fields, { and, eq }) => and(eq(fields.userId, session.userId), eq(fields.serverUrl, session.serverUrl))
        });

        if (existing) {
            await db.update(mcpOauthTokens)
                .set({
                    accessToken,
                    refreshToken: refreshToken || existing.refreshToken,
                    tokenType,
                    scope: scope || existing.scope,
                    expiresAt,
                    tokenEndpoint: session.tokenEndpoint,
                    clientId: session.clientId,
                    clientSecret: session.clientSecret || null,
                    resource: session.resource,
                    updatedAt: new Date(),
                })
                .where(eq(mcpOauthTokens.id, (existing as any).id));
        } else {
            await db.insert(mcpOauthTokens).values({
                userId: session.userId,
                serverUrl: session.serverUrl,
                resource: session.resource,
                accessToken,
                refreshToken: refreshToken || null,
                tokenType,
                scope: scope || null,
                expiresAt,
                tokenEndpoint: session.tokenEndpoint,
                clientId: session.clientId,
                clientSecret: session.clientSecret || null,
            }).execute();
        }

        // Render a minimal page that tells the user to close the window
        return new Response(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>MCP Authorized</title></head>
<body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 24px;">
  <h1>Connected</h1>
  <p>You can close this window and return to ChatLima.</p>
  <script>window.close && window.close();</script>
</body></html>`, { status: 200, headers: { 'Content-Type': 'text/html' } });
    } catch (err) {
        console.error('[MCP OAuth] callback error', err);
        return new Response('Internal error', { status: 500 });
    }
}


