'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type modelID } from '@/ai/providers';
import { PresetTemplate } from '@/lib/preset-templates';
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem } from '@/lib/browser-storage';

// Types
export interface Preset {
  id: string;
  userId: string;
  name: string;
  modelId: modelID;
  systemInstruction: string;
  temperature: number;
  maxTokens: number;
  webSearchEnabled: boolean;
  webSearchContextSize: 'low' | 'medium' | 'high';
  apiKeyPreferences: Record<string, { useCustomKey: boolean; keyName?: string }>;
  isDefault: boolean;
  shareId?: string | null;
  visibility: 'private' | 'shared';
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePresetData {
  name: string;
  modelId: modelID;
  systemInstruction: string;
  temperature: number;
  maxTokens: number;
  webSearchEnabled?: boolean;
  webSearchContextSize?: 'low' | 'medium' | 'high';
  apiKeyPreferences?: Record<string, { useCustomKey: boolean; keyName?: string }>;
  isDefault?: boolean;
}

export type UpdatePresetData = Partial<CreatePresetData>;

interface PresetContextType {
  // State
  presets: Preset[];
  activePreset: Preset | null;
  defaultPreset: Preset | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadPresets: () => Promise<void>;
  setActivePreset: (preset: Preset | null) => void;
  createPreset: (data: CreatePresetData) => Promise<Preset>;
  createPresetFromTemplate: (template: PresetTemplate) => Promise<Preset>;
  updatePreset: (id: string, data: UpdatePresetData) => Promise<Preset>;
  deletePreset: (id: string) => Promise<void>;
  sharePreset: (id: string) => Promise<string>;
  unsharePreset: (id: string) => Promise<void>;
  setDefaultPreset: (id: string) => Promise<void>;
  unsetDefaultPreset: (id: string) => Promise<void>;
  importSharedPreset: (shareId: string) => Promise<Preset>;
  refreshPresets: () => Promise<void>;
}

const PresetContext = createContext<PresetContextType | undefined>(undefined);

export function usePresets() {
  const context = useContext(PresetContext);
  if (!context) {
    throw new Error('usePresets must be used within a PresetProvider');
  }
  return context;
}

interface PresetProviderProps {
  children: React.ReactNode;
}

export function PresetProvider({ children }: PresetProviderProps) {
  // State
  const [presets, setPresets] = useState<Preset[]>([]);
  const [activePreset, setActivePresetState] = useState<Preset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const defaultPreset = presets.find(preset => preset.isDefault) || null;

  // API helpers
  const apiCall = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  };

  // Load presets from API
  const loadPresets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiCall('/api/presets');
      setPresets(data);
      
      // Set active preset to default if no active preset is set
      if (!activePreset && data.length > 0) {
        const defaultPresetFromAPI = data.find((preset: Preset) => preset.isDefault);
        if (defaultPresetFromAPI) {
          setActivePresetState(defaultPresetFromAPI);
        }
      }
    } catch (error) {
      console.error('Failed to load presets:', error);
      setError(error instanceof Error ? error.message : 'Failed to load presets');
    } finally {
      setLoading(false);
    }
  }, [activePreset]);

  // Set active preset
  const setActivePreset = useCallback((preset: Preset | null) => {
    setActivePresetState(preset);
    // Store in localStorage for persistence across sessions
    if (preset) {
      setLocalStorageItem('activePresetId', preset.id);
    } else {
      removeLocalStorageItem('activePresetId');
    }
  }, []);

  // Create new preset
  const createPreset = useCallback(async (data: CreatePresetData): Promise<Preset> => {
    try {
      setError(null);
      
      const newPreset = await apiCall('/api/presets', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Update local state
      setPresets(prev => [newPreset, ...prev]);
      
      // If this is set as default, update other presets
      if (newPreset.isDefault) {
        setPresets(prev => prev.map(preset => 
          preset.id === newPreset.id ? preset : { ...preset, isDefault: false }
        ));
      }

      return newPreset;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create preset';
      setError(errorMessage);
      throw error;
    }
  }, []);

  // Create preset from template
  const createPresetFromTemplate = useCallback(async (template: PresetTemplate): Promise<Preset> => {
    return createPreset(template.preset);
  }, [createPreset]);

  // Update preset
  const updatePreset = useCallback(async (id: string, data: UpdatePresetData): Promise<Preset> => {
    try {
      setError(null);
      
      const updatedPreset = await apiCall(`/api/presets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      // Update local state
      setPresets(prev => prev.map(preset => 
        preset.id === id ? updatedPreset : preset
      ));

      // Update active preset if it's the one being updated
      if (activePreset?.id === id) {
        setActivePresetState(updatedPreset);
      }

      // If this is set as default, update other presets
      if (updatedPreset.isDefault) {
        setPresets(prev => prev.map(preset => 
          preset.id === updatedPreset.id ? preset : { ...preset, isDefault: false }
        ));
      }

      return updatedPreset;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update preset';
      setError(errorMessage);
      throw error;
    }
  }, [activePreset]);

  // Delete preset
  const deletePreset = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      
      await apiCall(`/api/presets/${id}`, {
        method: 'DELETE',
      });

      // Update local state
      setPresets(prev => prev.filter(preset => preset.id !== id));
      
      // Clear active preset if it's the one being deleted
      if (activePreset?.id === id) {
        setActivePresetState(null);
        removeLocalStorageItem('activePresetId');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete preset';
      setError(errorMessage);
      throw error;
    }
  }, [activePreset]);

  // Share preset
  const sharePreset = useCallback(async (id: string): Promise<string> => {
    try {
      setError(null);
      
      const response = await apiCall(`/api/presets/${id}/share`, {
        method: 'POST',
      });

      // Update local state with share info
      setPresets(prev => prev.map(preset => 
        preset.id === id 
          ? { ...preset, shareId: response.shareId, visibility: 'shared' }
          : preset
      ));

      return response.shareUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share preset';
      setError(errorMessage);
      throw error;
    }
  }, []);

  // Unshare preset
  const unsharePreset = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      
      await apiCall(`/api/presets/${id}/share`, {
        method: 'DELETE',
      });

      // Update local state
      setPresets(prev => prev.map(preset => 
        preset.id === id 
          ? { ...preset, shareId: null, visibility: 'private' }
          : preset
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unshare preset';
      setError(errorMessage);
      throw error;
    }
  }, []);

  // Set default preset
  const setDefaultPreset = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      
      await apiCall(`/api/presets/${id}/set-default`, {
        method: 'POST',
      });

      // Update local state - unset all defaults and set this one
      setPresets(prev => prev.map(preset => ({
        ...preset,
        isDefault: preset.id === id
      })));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set default preset';
      setError(errorMessage);
      throw error;
    }
  }, []);

  // Unset default preset
  const unsetDefaultPreset = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      
      await apiCall(`/api/presets/${id}/set-default`, {
        method: 'DELETE',
      });

      // Update local state
      setPresets(prev => prev.map(preset => 
        preset.id === id ? { ...preset, isDefault: false } : preset
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unset default preset';
      setError(errorMessage);
      throw error;
    }
  }, []);

  // Import shared preset
  const importSharedPreset = useCallback(async (shareId: string): Promise<Preset> => {
    try {
      setError(null);
      
      // First, get the shared preset data
      const sharedPreset = await apiCall(`/api/presets/shared/${shareId}`);
      
      // Create a new preset based on the shared one
      const importData: CreatePresetData = {
        name: `${sharedPreset.name} (Imported)`,
        modelId: sharedPreset.modelId,
        systemInstruction: sharedPreset.systemInstruction,
        temperature: sharedPreset.temperature,
        maxTokens: sharedPreset.maxTokens,
        webSearchEnabled: sharedPreset.webSearchEnabled,
        webSearchContextSize: sharedPreset.webSearchContextSize,
        apiKeyPreferences: {},
        isDefault: false,
      };

      return createPreset(importData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import shared preset';
      setError(errorMessage);
      throw error;
    }
  }, [createPreset]);

  // Refresh presets (alias for loadPresets)
  const refreshPresets = useCallback(async () => {
    await loadPresets();
  }, [loadPresets]);

  // Load presets on mount
  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  // Restore active preset from localStorage on mount
  useEffect(() => {
    const storedActivePresetId = getLocalStorageItem('activePresetId');
    if (storedActivePresetId && presets.length > 0 && !activePreset) {
      const storedPreset = presets.find(preset => preset.id === storedActivePresetId);
      if (storedPreset) {
        setActivePresetState(storedPreset);
      }
    }
  }, [presets, activePreset]);

  const value: PresetContextType = {
    // State
    presets,
    activePreset,
    defaultPreset,
    loading,
    error,

    // Actions
    loadPresets,
    setActivePreset,
    createPreset,
    createPresetFromTemplate,
    updatePreset,
    deletePreset,
    sharePreset,
    unsharePreset,
    setDefaultPreset,
    unsetDefaultPreset,
    importSharedPreset,
    refreshPresets,
  };

  return (
    <PresetContext.Provider value={value}>
      {children}
    </PresetContext.Provider>
  );
}