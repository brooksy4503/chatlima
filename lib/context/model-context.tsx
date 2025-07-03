"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { defaultModel, type modelID, type ModelOrPresetID, MODELS, ALL_MODELS_AND_PRESETS } from "@/ai/providers";

interface ModelContextType {
  selectedModel: ModelOrPresetID;
  setSelectedModel: (model: ModelOrPresetID) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModelState] = useState<ModelOrPresetID>(defaultModel); // Always initialize with defaultModel

  useEffect(() => {
    // This effect runs only on the client, after hydration
    if (typeof window !== 'undefined') {
      try {
        const storedModel = localStorage.getItem('selected_ai_model');
        if (storedModel && (ALL_MODELS_AND_PRESETS as ReadonlyArray<string>).includes(storedModel)) {
          setSelectedModelState(storedModel as ModelOrPresetID);
        } else {
          // If no valid model in localStorage, ensure defaultModel is set (or the first from ALL_MODELS_AND_PRESETS)
          // This also handles the case where defaultModel might have been updated
          let initialClientModel: ModelOrPresetID = defaultModel;
          if (!ALL_MODELS_AND_PRESETS.includes(defaultModel) && ALL_MODELS_AND_PRESETS.length > 0) {
            initialClientModel = ALL_MODELS_AND_PRESETS[0] as ModelOrPresetID;
          }
          // No need to set if it's already defaultModel, but this ensures consistency
          // and sets localStorage if it was missing or invalid
          if (ALL_MODELS_AND_PRESETS.includes(initialClientModel)) {
             setSelectedModelState(initialClientModel); // This will trigger the second useEffect below
          }
        }
      } catch (error) {
        console.error("Error reading selected model from localStorage during effect", error);
        // Fallback logic in case of error during localStorage read
        let fallbackClientModel: ModelOrPresetID = defaultModel;
        if (!ALL_MODELS_AND_PRESETS.includes(defaultModel) && ALL_MODELS_AND_PRESETS.length > 0) {
          fallbackClientModel = ALL_MODELS_AND_PRESETS[0] as ModelOrPresetID;
        }
         if (ALL_MODELS_AND_PRESETS.includes(fallbackClientModel)) {
           setSelectedModelState(fallbackClientModel);
         }
      }
    }
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (ALL_MODELS_AND_PRESETS.includes(selectedModel)) {
          localStorage.setItem('selected_ai_model', selectedModel);
        }
      } catch (error) {
        console.error("Error saving selected model to localStorage", error);
      }
    }
  }, [selectedModel]);

  const setSelectedModel = (model: ModelOrPresetID) => {
    if (ALL_MODELS_AND_PRESETS.includes(model) && model !== selectedModel) {
      setSelectedModelState(model);
    } else if (!ALL_MODELS_AND_PRESETS.includes(model)) {
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