import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { mcpOauthTokens } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { AuthService } from '@/lib/services/authService';

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const serverUrl = searchParams.get('serverUrl');
    if (!serverUrl) return new Response(JSON.stringify({ error: 'Missing serverUrl' }), { status: 400 });

    const auth = await AuthService.getFullSession(req as unknown as Request);
    if (!auth.session || !auth.userId || auth.isAnonymous) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await db.delete(mcpOauthTokens).where(and(eq(mcpOauthTokens.userId, auth.userId), eq(mcpOauthTokens.serverUrl, serverUrl)));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
}


