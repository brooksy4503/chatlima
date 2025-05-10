"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { defaultModel, type modelID, MODELS } from "@/ai/providers";

interface ModelContextType {
  selectedModel: modelID;
  setSelectedModel: (model: modelID) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModelState] = useState<modelID>(() => {
    if (typeof window === 'undefined') {
      return defaultModel; // Fallback for SSR or environments without window
    }
    try {
      const storedModel = localStorage.getItem('selected_ai_model');
      if (storedModel && (MODELS as ReadonlyArray<string>).includes(storedModel)) {
        return storedModel as modelID;
      }
      // If stored model is invalid or not present, check if defaultModel is valid
      if (MODELS.includes(defaultModel)) {
        return defaultModel;
      }
      // If defaultModel is also not in MODELS (e.g. filtered out), use the first available model
      if (MODELS.length > 0) {
        return MODELS[0];
      }
      // As a last resort, return defaultModel even if not in MODELS (should ideally not happen)
      return defaultModel; 
    } catch (error) {
      console.error("Error reading selected model from localStorage during init", error);
      // Fallback logic in case of error
      if (MODELS.includes(defaultModel)) {
        return defaultModel;
      }
      if (MODELS.length > 0) {
        return MODELS[0];
      }
      return defaultModel;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (MODELS.includes(selectedModel)) {
          localStorage.setItem('selected_ai_model', selectedModel);
        }
      } catch (error) {
        console.error("Error saving selected model to localStorage", error);
      }
    }
  }, [selectedModel]);

  const setSelectedModel = (model: modelID) => {
    if (MODELS.includes(model) && model !== selectedModel) {
      setSelectedModelState(model);
    } else if (!MODELS.includes(model)) {
      console.warn(`Attempted to set invalid model: ${model}`);
      // Optionally, set to default or do nothing
      // setSelectedModelState(defaultModel); 
    }
  };

  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel }}>
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