import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { mcpOauthTokens } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { AuthService } from '@/lib/services/authService';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const serverUrl = searchParams.get('serverUrl');
    if (!serverUrl) return new Response(JSON.stringify({ error: 'Missing serverUrl' }), { status: 400 });

    const auth = await AuthService.getFullSession(req as unknown as Request);
    if (!auth.session || !auth.userId || auth.isAnonymous) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const token = await db.query.mcpOauthTokens.findFirst({
        where: and(eq(mcpOauthTokens.userId, auth.userId), eq(mcpOauthTokens.serverUrl, serverUrl))
    });
    if (!token) {
        return new Response(JSON.stringify({ connected: false }), { status: 200 });
    }

    const expiresAtMs = token.expiresAt ? new Date(token.expiresAt as any).getTime() : undefined;
    const now = Date.now();
    const expiresIn = expiresAtMs ? Math.max(0, Math.floor((expiresAtMs - now) / 1000)) : null;
    return new Response(JSON.stringify({ connected: true, expiresIn }), { status: 200 });
}


