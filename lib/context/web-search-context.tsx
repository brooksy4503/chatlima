"use client";

import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
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

  // Prevent hydration mismatch by ensuring we only use localStorage values after mounting
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use default values during SSR and initial render to prevent hydration mismatch
  const effectiveSettings = isMounted ? webSearchSettings : {
    enabled: false,
    contextSize: 'medium' as const
  };

  const setWebSearchEnabled = (enabled: boolean | ((prevState: boolean) => boolean)) => {
    setWebSearchSettings(prev => ({ ...prev, enabled: typeof enabled === 'function' ? enabled(prev.enabled) : enabled }));
  };

  const setWebSearchContextSize = (size: 'low' | 'medium' | 'high' | ((prevState: 'low' | 'medium' | 'high') => 'low' | 'medium' | 'high')) => {
    setWebSearchSettings(prev => ({ ...prev, contextSize: typeof size === 'function' ? size(prev.contextSize) : size }));
  };

  return (
    <WebSearchContext.Provider value={{ 
      webSearchEnabled: effectiveSettings.enabled, 
      setWebSearchEnabled, 
      webSearchContextSize: effectiveSettings.contextSize, 
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