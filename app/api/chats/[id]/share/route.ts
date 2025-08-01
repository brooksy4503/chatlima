import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { ChatSharingService } from '@/lib/services/chat-sharing';

// Helper to create error responses
const createErrorResponse = (message: string, status: number) => {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
};

// Helper function to get the correct base URL
const getBaseUrl = (req: NextRequest) => {
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:3000';
    }
    return process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com';
};

// POST /api/chats/[id]/share - Create or retrieve shareable link
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) {
            return createErrorResponse('Authentication required', 401);
        }

        const userId = session.user.id;
        const { id: chatId } = await params;
        const baseUrl = getBaseUrl(req);

        // Create or get existing share
        const result = await ChatSharingService.createShare(chatId, userId, baseUrl);

        return new Response(JSON.stringify(result), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error creating chat share:', error);

        if (error instanceof Error && error.message === 'Chat not found or access denied') {
            return createErrorResponse('Chat not found or access denied', 404);
        }

        return createErrorResponse('Internal server error', 500);
    }
}

// DELETE /api/chats/[id]/share - Revoke share link
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) {
            return createErrorResponse('Authentication required', 401);
        }

        const userId = session.user.id;
        const { id: chatId } = await params;

        // Revoke the share
        await ChatSharingService.revokeShare(chatId, userId);

        return new Response(JSON.stringify({ revoked: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error revoking chat share:', error);
        return createErrorResponse('Internal server error', 500);
    }
}