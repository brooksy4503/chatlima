import { db } from '@/lib/db';
import { favoriteModels } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export class FavoritesService {
    /**
     * Get all favorite model IDs for a user
     */
    static async getUserFavorites(userId: string): Promise<string[]> {
        try {
            const userFavorites = await db
                .select({ modelId: favoriteModels.modelId })
                .from(favoriteModels)
                .where(eq(favoriteModels.userId, userId))
                .orderBy(favoriteModels.createdAt);

            return userFavorites.map(f => f.modelId);
        } catch (error) {
            console.error('Error fetching user favorites:', error);
            throw new Error('Failed to fetch user favorites');
        }
    }

    /**
     * Add a model to user's favorites
     */
    static async addFavorite(userId: string, modelId: string): Promise<void> {
        try {
            // Check if already favorited
            const existing = await this.isFavorite(userId, modelId);
            if (existing) {
                return; // Already favorited, no-op
            }

            await db.insert(favoriteModels).values({
                userId,
                modelId,
            });
        } catch (error) {
            console.error('Error adding favorite:', error);
            throw new Error('Failed to add model to favorites');
        }
    }

    /**
     * Remove a model from user's favorites
     */
    static async removeFavorite(userId: string, modelId: string): Promise<void> {
        try {
            await db
                .delete(favoriteModels)
                .where(and(
                    eq(favoriteModels.userId, userId),
                    eq(favoriteModels.modelId, modelId)
                ));
        } catch (error) {
            console.error('Error removing favorite:', error);
            throw new Error('Failed to remove model from favorites');
        }
    }

    /**
     * Check if a model is favorited by a user
     */
    static async isFavorite(userId: string, modelId: string): Promise<boolean> {
        try {
            const result = await db
                .select()
                .from(favoriteModels)
                .where(and(
                    eq(favoriteModels.userId, userId),
                    eq(favoriteModels.modelId, modelId)
                ))
                .limit(1);

            return result.length > 0;
        } catch (error) {
            console.error('Error checking favorite status:', error);
            return false; // Fail silently for favorite status checks
        }
    }

    /**
 * Get favorite count for a user
 */
    static async getFavoriteCount(userId: string): Promise<number> {
        try {
            const result = await db
                .select({ count: sql<number>`count(*)` })
                .from(favoriteModels)
                .where(eq(favoriteModels.userId, userId));

            return result[0]?.count || 0;
        } catch (error) {
            console.error('Error getting favorite count:', error);
            return 0;
        }
    }

    /**
     * Batch check if multiple models are favorited by a user
     */
    static async areFavorites(userId: string, modelIds: string[]): Promise<Record<string, boolean>> {
        try {
            if (modelIds.length === 0) {
                return {};
            }

            const favorites = await db
                .select({ modelId: favoriteModels.modelId })
                .from(favoriteModels)
                .where(eq(favoriteModels.userId, userId));

            const favoriteSet = new Set(favorites.map(f => f.modelId));

            return modelIds.reduce((acc, modelId) => {
                acc[modelId] = favoriteSet.has(modelId);
                return acc;
            }, {} as Record<string, boolean>);
        } catch (error) {
            console.error('Error batch checking favorites:', error);
            // Return all false on error
            return modelIds.reduce((acc, modelId) => {
                acc[modelId] = false;
                return acc;
            }, {} as Record<string, boolean>);
        }
    }
} 