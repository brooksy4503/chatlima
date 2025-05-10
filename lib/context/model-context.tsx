"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { defaultModel, type modelID, MODELS } from "@/ai/providers";

interface ModelContextType {
  selectedModel: modelID;
  setSelectedModel: (model: modelID) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModelState] = useState<modelID>(defaultModel);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        const storedModel = localStorage.getItem('selected_ai_model');
        if (storedModel && (MODELS as ReadonlyArray<string>).includes(storedModel)) {
          setSelectedModelState(storedModel as modelID);
        } else if (!MODELS.includes(defaultModel)) {
          // Fallback if defaultModel itself is not in MODELS (should not happen with good config)
          if (MODELS.length > 0) {
            setSelectedModelState(MODELS[0]); // Fallback to the first available model
          }
        } else {
          // Set to default if stored is invalid or not present
           setSelectedModelState(defaultModel);
        }
      } catch (error) {
        console.error("Error reading selected model from localStorage", error);
        setSelectedModelState(MODELS.length > 0 ? MODELS[0] : defaultModel); // Robust fallback
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      try {
        if (MODELS.includes(selectedModel)) {
          localStorage.setItem('selected_ai_model', selectedModel);
        }
      } catch (error) {
        console.error("Error saving selected model to localStorage", error);
      }
    }
  }, [selectedModel, isMounted]);

  const setSelectedModel = (model: modelID) => {
    if (MODELS.includes(model)) {
      setSelectedModelState(model);
    } else {
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