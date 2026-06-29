"use client";

import { GitCompare, X } from "lucide-react";
import { useCompare } from "@/lib/context/compare-context";
import { useModel } from "@/lib/context/model-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CompareModeBar() {
  const { compareModeEnabled, compareModels, removeCompareModel, estimatedCreditCost, canAddMoreModels } =
    useCompare();
  const { availableModels = [] } = useModel();

  if (!compareModeEnabled) {
    return null;
  }

  const getName = (modelId: string) =>
    availableModels.find((m) => m.id === modelId)?.name ?? modelId.split("/").pop() ?? modelId;

  return (
    <div className="mx-auto max-w-lg sm:max-w-3xl px-2 pb-2">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <GitCompare className="h-3.5 w-3.5" />
          Comparing
        </span>
        {compareModels.map((modelId) => (
          <span
            key={modelId}
            className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium"
          >
            {getName(modelId)}
            <button
              type="button"
              aria-label={`Remove ${getName(modelId)}`}
              onClick={() => removeCompareModel(modelId)}
              className="rounded-full hover:bg-primary/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {canAddMoreModels && (
          <span className="text-xs text-muted-foreground">Add models below</span>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          ~{estimatedCreditCost} credits per message
        </span>
      </div>
    </div>
  );
}

export function CompareModeToggle({ className }: { className?: string }) {
  const { compareModeEnabled, toggleCompareMode } = useCompare();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggleCompareMode}
      className={cn(
        "h-9 w-9 rounded-full border transition-colors",
        compareModeEnabled
          ? "border-primary bg-primary text-primary-foreground shadow"
          : "border-border bg-background text-muted-foreground hover:bg-accent",
        className
      )}
      aria-label={compareModeEnabled ? "Disable model comparison" : "Enable model comparison"}
      title="Compare models"
    >
      <GitCompare className="h-4 w-4" />
    </Button>
  );
}
