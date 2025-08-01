import { NextRequest } from 'next/server';
import { ChatSharingService } from '@/lib/services/chat-sharing';

// Helper to create error responses
const createErrorResponse = (message: string, status: number) => {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
};

// GET /api/chats/shared/[shareId] - Retrieve shared chat by shareId
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ shareId: string }> }
) {
    try {
        const { shareId } = await params;

        // Validate share ID format
        if (!shareId || shareId.length < 20) {
            return createErrorResponse('Invalid share ID', 400);
        }

        // Get shared chat snapshot
        const snapshot = await ChatSharingService.getSharedChat(shareId);

        if (!snapshot) {
            return createErrorResponse('Shared chat not found or no longer available', 404);
        }

        return new Response(JSON.stringify(snapshot), {
            headers: {
                'Content-Type': 'application/json',
                // Add cache headers for public content
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
            }
        });
    } catch (error) {
        console.error('Error fetching shared chat:', error);
        return createErrorResponse('Internal server error', 500);
    }
}