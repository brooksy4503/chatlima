import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface FavoritesResponse {
    favorites: string[];
    count: number;
    lastUpdated: string;
}

interface FavoriteOperationResponse {
    success: boolean;
    message: string;
    modelId: string;
}

export function useFavorites() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user's favorites
    const fetchFavorites = useCallback(async () => {
        if (!user?.id) {
            setFavorites([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/favorites/models', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setFavorites([]);
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data: FavoritesResponse = await response.json();
            setFavorites(data.favorites || []);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            setError(error instanceof Error ? error.message : 'Failed to load favorites');
            setFavorites([]);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    // Initial load
    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    // Add model to favorites
    const addFavorite = useCallback(async (modelId: string): Promise<boolean> => {
        if (!user?.id) {
            setError('Must be logged in to add favorites');
            return false;
        }

        if (favorites.includes(modelId)) {
            return true; // Already favorited
        }

        // Optimistic update
        setFavorites(prev => [...prev, modelId]);
        setError(null);

        try {
            const response = await fetch('/api/favorites/models', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ modelId }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data: FavoriteOperationResponse = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error adding favorite:', error);

            // Rollback optimistic update
            setFavorites(prev => prev.filter(id => id !== modelId));
            setError(error instanceof Error ? error.message : 'Failed to add favorite');
            return false;
        }
    }, [user?.id, favorites]);

    // Remove model from favorites
    const removeFavorite = useCallback(async (modelId: string): Promise<boolean> => {
        if (!user?.id) {
            setError('Must be logged in to remove favorites');
            return false;
        }

        if (!favorites.includes(modelId)) {
            return true; // Not favorited anyway
        }

        // Optimistic update
        const originalFavorites = favorites;
        setFavorites(prev => prev.filter(id => id !== modelId));
        setError(null);

        try {
            const response = await fetch(`/api/favorites/models/${encodeURIComponent(modelId)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data: FavoriteOperationResponse = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error removing favorite:', error);

            // Rollback optimistic update
            setFavorites(originalFavorites);
            setError(error instanceof Error ? error.message : 'Failed to remove favorite');
            return false;
        }
    }, [user?.id, favorites]);

    // Toggle favorite status
    const toggleFavorite = useCallback(async (modelId: string): Promise<boolean> => {
        const isFavorite = favorites.includes(modelId);
        return isFavorite ? removeFavorite(modelId) : addFavorite(modelId);
    }, [favorites, addFavorite, removeFavorite]);

    // Check if model is favorited
    const isFavorite = useCallback((modelId: string): boolean => {
        return favorites.includes(modelId);
    }, [favorites]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        favorites,
        isLoading,
        error,
        fetchFavorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        clearError,
        favoriteCount: favorites.length,
    };
} 