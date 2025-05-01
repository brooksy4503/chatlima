"use client";

import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { STORAGE_KEYS } from '@/lib/constants';

type WebSearchContextType = {
  webSearchEnabled: boolean;
  setWebSearchEnabled: Dispatch<SetStateAction<boolean>>;
  webSearchContextSize: 'low' | 'medium' | 'high';
  setWebSearchContextSize: Dispatch<SetStateAction<'low' | 'medium' | 'high'>>;
};

const WebSearchContext = createContext<WebSearchContextType | undefined>(undefined);

interface WebSearchProviderProps {
  children: ReactNode;
}

export const WebSearchProvider: React.FC<WebSearchProviderProps> = ({ children }) => {
  const [webSearchSettings, setWebSearchSettings] = useLocalStorage<{
    enabled: boolean;
    contextSize: 'low' | 'medium' | 'high';
  }>(STORAGE_KEYS.WEB_SEARCH, {
    enabled: false,
    contextSize: 'medium'
  });

  const setWebSearchEnabled = (enabled: boolean | ((prevState: boolean) => boolean)) => {
    setWebSearchSettings(prev => ({ ...prev, enabled: typeof enabled === 'function' ? enabled(prev.enabled) : enabled }));
  };

  const setWebSearchContextSize = (size: 'low' | 'medium' | 'high' | ((prevState: 'low' | 'medium' | 'high') => 'low' | 'medium' | 'high')) => {
    setWebSearchSettings(prev => ({ ...prev, contextSize: typeof size === 'function' ? size(prev.contextSize) : size }));
  };

  return (
    <WebSearchContext.Provider value={{ 
      webSearchEnabled: webSearchSettings.enabled, 
      setWebSearchEnabled, 
      webSearchContextSize: webSearchSettings.contextSize, 
      setWebSearchContextSize 
    }}>
      {children}
    </WebSearchContext.Provider>
  );
};

export const useWebSearch = (): WebSearchContextType => {
  const context = useContext(WebSearchContext);
  if (context === undefined) {
    throw new Error('useWebSearch must be used within a WebSearchProvider');
  }
  return context;
}; 