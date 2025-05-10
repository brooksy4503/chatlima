"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { defaultModel, type modelID, MODELS } from "@/ai/providers";

interface ModelContextType {
  selectedModel: modelID;
  setSelectedModel: (model: modelID) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModelState] = useState<modelID>(defaultModel); // Always initialize with defaultModel

  useEffect(() => {
    // This effect runs only on the client, after hydration
    if (typeof window !== 'undefined') {
      try {
        const storedModel = localStorage.getItem('selected_ai_model');
        if (storedModel && (MODELS as ReadonlyArray<string>).includes(storedModel)) {
          setSelectedModelState(storedModel as modelID);
        } else {
          // If no valid model in localStorage, ensure defaultModel is set (or the first from MODELS)
          // This also handles the case where defaultModel might have been updated
          let initialClientModel = defaultModel;
          if (!MODELS.includes(defaultModel) && MODELS.length > 0) {
            initialClientModel = MODELS[0];
          }
          // No need to set if it's already defaultModel, but this ensures consistency
          // and sets localStorage if it was missing or invalid
          if (MODELS.includes(initialClientModel)) {
             setSelectedModelState(initialClientModel); // This will trigger the second useEffect below
          }
        }
      } catch (error) {
        console.error("Error reading selected model from localStorage during effect", error);
        // Fallback logic in case of error during localStorage read
        let fallbackClientModel = defaultModel;
        if (!MODELS.includes(defaultModel) && MODELS.length > 0) {
          fallbackClientModel = MODELS[0];
        }
         if (MODELS.includes(fallbackClientModel)) {
           setSelectedModelState(fallbackClientModel);
         }
      }
    }
  }, []); // Empty dependency array ensures this runs once on mount

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