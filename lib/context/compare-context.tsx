"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { MAX_COMPARE_MODELS, MIN_COMPARE_MODELS } from "@/lib/compare/comparePolicy";
import { useModel } from "@/lib/context/model-context";
import { calculateCreditCostPerMessage } from "@/lib/utils/creditCostCalculator";

type CompareContextType = {
  compareModeEnabled: boolean;
  setCompareModeEnabled: (enabled: boolean) => void;
  toggleCompareMode: () => void;
  compareModels: string[];
  addCompareModel: (modelId: string) => void;
  removeCompareModel: (modelId: string) => void;
  setCompareModels: (models: string[]) => void;
  estimatedCreditCost: number;
  canAddMoreModels: boolean;
};

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const { selectedModel, availableModels = [] } = useModel();
  const [compareModeEnabled, setCompareModeEnabledState] = useLocalStorage<boolean>(
    STORAGE_KEYS.COMPARE_MODE,
    false
  );
  const [storedCompareModels, setStoredCompareModels] = useLocalStorage<string[]>(
    STORAGE_KEYS.COMPARE_MODELS,
    []
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const compareModels = isMounted ? storedCompareModels : [];

  const setCompareModeEnabled = useCallback(
    (enabled: boolean) => {
      setCompareModeEnabledState(enabled);
      if (enabled && compareModels.length < MIN_COMPARE_MODELS) {
        const defaults = [selectedModel];
        const fallback = availableModels.find((m) => m.id !== selectedModel);
        if (fallback) {
          defaults.push(fallback.id);
        }
        setStoredCompareModels(defaults.slice(0, MAX_COMPARE_MODELS));
      }
    },
    [compareModels.length, selectedModel, availableModels, setCompareModeEnabledState, setStoredCompareModels]
  );

  const toggleCompareMode = useCallback(() => {
    setCompareModeEnabled(!compareModeEnabled);
  }, [compareModeEnabled, setCompareModeEnabled]);

  const addCompareModel = useCallback(
    (modelId: string) => {
      setStoredCompareModels((prev) => {
        if (prev.includes(modelId) || prev.length >= MAX_COMPARE_MODELS) {
          return prev;
        }
        return [...prev, modelId];
      });
    },
    [setStoredCompareModels]
  );

  const removeCompareModel = useCallback(
    (modelId: string) => {
      setStoredCompareModels((prev) => prev.filter((id) => id !== modelId));
    },
    [setStoredCompareModels]
  );

  const estimatedCreditCost = useMemo(() => {
    return compareModels.reduce((sum, modelId) => {
      const info = availableModels.find((m) => m.id === modelId) ?? null;
      return sum + calculateCreditCostPerMessage(info);
    }, 0);
  }, [compareModels, availableModels]);

  const value = useMemo(
    () => ({
      compareModeEnabled: isMounted ? compareModeEnabled : false,
      setCompareModeEnabled,
      toggleCompareMode,
      compareModels,
      addCompareModel,
      removeCompareModel,
      setCompareModels: setStoredCompareModels,
      estimatedCreditCost,
      canAddMoreModels: compareModels.length < MAX_COMPARE_MODELS,
    }),
    [
      isMounted,
      compareModeEnabled,
      setCompareModeEnabled,
      toggleCompareMode,
      compareModels,
      addCompareModel,
      removeCompareModel,
      setStoredCompareModels,
      estimatedCreditCost,
    ]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextType {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
}
