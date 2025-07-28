import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { favoriteModels } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Helper to create error responses
function createErrorResponse(message: string, status = 500): NextResponse {
    return NextResponse.json({ error: message }, { status });
}

// DELETE /api/favorites/models/[modelId] - Remove a model from favorites
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ modelId: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user?.id) {
            return createErrorResponse('Unauthorized', 401);
        }

        const { modelId } = await params;

        if (!modelId) {
            return createErrorResponse('Model ID is required', 400);
        }

        // Remove from favorites
        const result = await db
            .delete(favoriteModels)
            .where(and(
                eq(favoriteModels.userId, session.user.id),
                eq(favoriteModels.modelId, modelId)
            ));

        return NextResponse.json({
            success: true,
            message: 'Model removed from favorites',
            modelId,
        });

    } catch (error) {
        console.error('Error removing favorite model:', error);
        return createErrorResponse('Failed to remove model from favorites');
    }
} 