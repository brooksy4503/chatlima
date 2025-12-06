"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useModels } from "@/hooks/use-models";
import { useAuth } from "@/lib/context/auth-context";
import { ModelInfo } from "@/lib/types/models";
import { MODEL_MIGRATIONS } from "@/lib/models/client-constants";
import { useFavorites } from "@/hooks/useFavorites";

// Legacy compatibility - keep the same interface
interface ModelContextType {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  // Extended interface for new features
  isLoading?: boolean;
  isRefreshing?: boolean;
  error?: Error | null;
  availableModels?: ModelInfo[];
  refresh?: () => Promise<void>;
  // Favorites functionality
  favorites?: string[];
  toggleFavorite?: (modelId: string) => Promise<boolean>;
  isFavorite?: (modelId: string) => boolean;
  favoriteCount?: number;
  // User API keys for BYOK functionality
  userApiKeys?: Record<string, string>;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

// Migration utilities
function findMigration(oldModelId: string) {
  return MODEL_MIGRATIONS.find(m => m.oldId === oldModelId);
}

function notifyUserOfMigration(migration: any) {
  console.info(`Model migrated: ${migration.oldId} → ${migration.newId} (${migration.reason})`);
  // Could show a toast notification here in the future
}

function notifyUserOfInvalidModel(modelId: string) {
  console.warn(`Invalid model "${modelId}" replaced with default model`);
  // Could show a toast notification here in the future
}

// Fallback models when dynamic loading fails
const FALLBACK_MODELS = [
  "openrouter/google/gemini-2.5-flash",
  "openrouter/anthropic/claude-3.5-sonnet", 
  "openrouter/openai/gpt-5-nano",
];

export function ModelProvider({ children }: { children: ReactNode }) {
  // Get user API keys from localStorage
  const [userApiKeys, setUserApiKeys] = useState<Record<string, string>>({});
  const [previousKeysHash, setPreviousKeysHash] = useState<string>('');
  const [keysLoaded, setKeysLoaded] = useState(false);

  // Load API keys from localStorage
  useEffect(() => {
    const loadApiKeys = () => {
      if (typeof window === 'undefined') return {};
      
      const apiKeys: Record<string, string> = {};
      const keyNames = [
        'OPENAI_API_KEY',
        'ANTHROPIC_API_KEY', 
        'GROQ_API_KEY',
        'XAI_API_KEY',
        'OPENROUTER_API_KEY',
        'REQUESTY_API_KEY'
      ];
      
      keyNames.forEach(keyName => {
        const value = localStorage.getItem(keyName);
        if (value && value.trim()) {
          apiKeys[keyName] = value.trim();
        }
      });
      
      return apiKeys;
    };
    
    // Load initially
    const initialKeys = loadApiKeys();
    setUserApiKeys(initialKeys);
    setPreviousKeysHash(JSON.stringify(initialKeys));
    setKeysLoaded(true);
    
    // Listen for storage changes (when API keys are saved in another tab or by API Key Manager)
    const handleStorageChange = () => {
      const newKeys = loadApiKeys();
      setUserApiKeys(newKeys);
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event when keys are saved in same window
    window.addEventListener('apiKeysChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('apiKeysChanged', handleStorageChange);
    };
  }, []);
  
  // Dynamic models from the API - pass user API keys
  // Wait for keys to load before enabling the fetcher
  const { models, isLoading, isValidating, error, refresh, forceRefresh } = useModels({ 
    userApiKeys: Object.keys(userApiKeys).length > 0 ? userApiKeys : undefined,
    enabled: keysLoaded  // Only start fetching after keys are loaded
  });
  const { isAnonymous } = useAuth();
  
  // Trigger model refresh when API keys actually change (not on initial load)
  useEffect(() => {
    const currentKeysHash = JSON.stringify(userApiKeys);
    
    // Only refresh if keys actually changed AND we have keys AND this isn't the initial load
    if (previousKeysHash && currentKeysHash !== previousKeysHash && Object.keys(userApiKeys).length > 0) {
      console.log('API keys changed, refreshing models...');
      if (forceRefresh) {
        forceRefresh().catch(err => console.error('Failed to refresh models after API key change:', err));
      }
    }
    
    setPreviousKeysHash(currentKeysHash);
  }, [userApiKeys, previousKeysHash, forceRefresh]);
  
  // Favorites functionality
  const { 
    favorites, 
    toggleFavorite, 
    isFavorite, 
    favoriteCount,
    isLoading: favoritesLoading 
  } = useFavorites();
  
  // Selected model state
  const [selectedModel, setSelectedModelState] = useState<string>(
    FALLBACK_MODELS[0] // Start with a safe default
  );
  
  // Initialization state
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Manual refresh state for better UX
  const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
  
  // Effect to handle model initialization and migration
  useEffect(() => {
    if (isLoading || isInitialized) return;
    
    // Wait until we have models loaded or failed to load
    if (models.length === 0 && !error) return;
    
    const availableModelIds = models.map(m => m.id);
    
    // Get stored model from localStorage
    let storedModel: string | null = null;
    try {
      if (typeof window !== 'undefined') {
        storedModel = localStorage.getItem('selected_ai_model');
      }
    } catch (error) {
      console.error("Error reading selected model from localStorage:", error);
    }
    
    let finalModel = FALLBACK_MODELS[0]; // Safe default
    
    if (storedModel && availableModelIds.includes(storedModel)) {
      // Stored model is valid and available
      finalModel = storedModel;
    } else if (storedModel) {
      // Try migration
      const migration = findMigration(storedModel);
      if (migration?.automaticMigration && availableModelIds.includes(migration.newId)) {
        finalModel = migration.newId;
        notifyUserOfMigration(migration);
      } else {
        // Find best fallback from available models
        const availableFallback = FALLBACK_MODELS.find(id => availableModelIds.includes(id));
        if (availableFallback) {
          finalModel = availableFallback;
        } else if (availableModelIds.length > 0) {
          // Use first available model as last resort
          finalModel = availableModelIds[0];
        }
        
        if (storedModel !== finalModel) {
          notifyUserOfInvalidModel(storedModel);
        }
      }
    } else {
      // No stored model - pick best available fallback
      const availableFallback = FALLBACK_MODELS.find(id => availableModelIds.includes(id));
      if (availableFallback) {
        finalModel = availableFallback;
      } else if (availableModelIds.length > 0) {
        // Use first available model as last resort
        finalModel = availableModelIds[0];
      }
    }
    
    setSelectedModelState(finalModel);
    setIsInitialized(true);
  }, [models, isLoading, error, isInitialized]);
  
  // Effect to persist selected model to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('selected_ai_model', selectedModel);
      }
    } catch (error) {
      console.error("Error saving selected model to localStorage:", error);
    }
  }, [selectedModel, isInitialized]);
  
  // Enhanced setSelectedModel with validation
  const setSelectedModel = (model: string) => {
    const availableModelIds = models.map(m => m.id);
    
    if (availableModelIds.includes(model)) {
      setSelectedModelState(model);
    } else {
      console.warn(`Attempted to set invalid model: ${model}`);
      
      // Try to find a migration
      const migration = findMigration(model);
      if (migration?.automaticMigration && availableModelIds.includes(migration.newId)) {
        setSelectedModelState(migration.newId);
        notifyUserOfMigration(migration);
      } else {
        // Don't change the model if invalid - just warn
        console.warn(`Model "${model}" is not available. Keeping current model: ${selectedModel}`);
      }
    }
  };
  
  // Refresh function for the context - use forceRefresh to bypass cache
  const contextRefresh = async () => {
    if (forceRefresh) {
      try {
        setIsManuallyRefreshing(true);
        await forceRefresh();
      } catch (error) {
        console.error('Error during model refresh:', error);
      } finally {
        setIsManuallyRefreshing(false);
      }
    }
  };
  
  // Enhance models with favorite status
  // Users with API keys should see models from those providers, even if anonymous
  const hasAnyApiKeys = Object.keys(userApiKeys).length > 0;
  const visibleModels = (isAnonymous && !hasAnyApiKeys)
    ? models.filter(m => m.id.startsWith('openrouter/') && m.id.endsWith(':free'))
    : models;

  // Ensure selected model is valid for anonymous users (without API keys)
  useEffect(() => {
    if (!isInitialized) return;
    if (!isAnonymous || hasAnyApiKeys) return; // Users with API keys can use any model
    if (!selectedModel.startsWith('openrouter/') || !selectedModel.endsWith(':free')) {
      const fallback = visibleModels[0]?.id || FALLBACK_MODELS.find(id => id.endsWith(':free')) || selectedModel;
      setSelectedModelState(fallback);
    }
  }, [isAnonymous, hasAnyApiKeys, isInitialized, selectedModel, visibleModels]);

  const modelsWithFavorites = visibleModels.map(model => ({
    ...model,
    isFavorite: favorites.includes(model.id),
  }));

  const contextValue = {
    selectedModel,
    setSelectedModel,
    isLoading: isLoading || favoritesLoading,
    isRefreshing: isValidating || isManuallyRefreshing,
    error,
    availableModels: modelsWithFavorites,
    refresh: contextRefresh,
    favorites,
    toggleFavorite,
    isFavorite,
    favoriteCount,
    userApiKeys, // Expose user API keys so components can check BYOK status
  };
  


  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
} 