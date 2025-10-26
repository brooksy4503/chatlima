import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { favoriteModels } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Schema for validating favorite model requests
const favoriteModelSchema = z.object({
    modelId: z.string().min(1, 'Model ID is required'),
});

// Helper to create error responses
function createErrorResponse(message: string, status = 500): NextResponse {
    return NextResponse.json({ error: message }, { status });
}

// GET /api/favorites/models - Get user's favorite models
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user?.id) {
            return createErrorResponse('Unauthorized', 401);
        }

        const userFavorites = await db
            .select({ modelId: favoriteModels.modelId, createdAt: favoriteModels.createdAt })
            .from(favoriteModels)
            .where(eq(favoriteModels.userId, session.user.id))
            .orderBy(favoriteModels.createdAt);

        return NextResponse.json({
            favorites: userFavorites.map(f => f.modelId),
            count: userFavorites.length,
            lastUpdated: new Date(),
        });

    } catch (error) {
        console.error('Error fetching favorite models:', error);
        return createErrorResponse('Failed to fetch favorite models');
    }
}

// POST /api/favorites/models - Add a model to favorites
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user?.id) {
            return createErrorResponse('Unauthorized', 401);
        }

        const body = await request.json();
        const validatedData = favoriteModelSchema.parse(body);

        // Check if model is already favorited
        const existingFavorite = await db
            .select()
            .from(favoriteModels)
            .where(and(
                eq(favoriteModels.userId, session.user.id),
                eq(favoriteModels.modelId, validatedData.modelId)
            ))
            .limit(1);

        if (existingFavorite.length > 0) {
            return createErrorResponse('Model is already in favorites', 409);
        }

        // Add to favorites
        await db.insert(favoriteModels).values({
            userId: session.user.id,
            modelId: validatedData.modelId,
        });

        return NextResponse.json({
            success: true,
            message: 'Model added to favorites',
            modelId: validatedData.modelId,
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return createErrorResponse(`Invalid request: ${error.issues[0]?.message}`, 400);
        }

        console.error('Error adding favorite model:', error);
        return createErrorResponse('Failed to add model to favorites');
    }
} 