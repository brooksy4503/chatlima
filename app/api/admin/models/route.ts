import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Admin API endpoint for fetching available models
 * 
 * GET /api/admin/models - List all available models
 */

export async function GET(req: NextRequest) {
    try {
        // Get the authenticated session
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const userResult = await db
            .select()
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (userResult.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const user = userResult[0];
        const isAdmin = user.role === "admin" || user.isAdmin === true;

        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        // Define available models (this could be fetched from a models table in the future)
        const availableModels = [
            { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
            { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic' },
            { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic' },
            { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic' },
            { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google' },
            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
            { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'groq' },
            { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'groq' },
            { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', provider: 'groq' },
            { id: 'grok-beta', name: 'Grok Beta', provider: 'xai' },
        ];

        return NextResponse.json({
            success: true,
            data: availableModels
        });

    } catch (error) {
        console.error('Error fetching models:', error);
        return NextResponse.json(
            { error: 'Failed to fetch models' },
            { status: 500 }
        );
    }
}
