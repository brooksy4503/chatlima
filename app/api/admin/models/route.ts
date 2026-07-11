import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/lib/middleware/auth';

/**
 * GET /api/admin/models - List all available models
 */
export async function GET(req: NextRequest) {
    try {
        const adminResult = await AuthMiddleware.requireAdmin(req);
        if (adminResult.response) {
            return adminResult.response;
        }

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
