"use client";

import { useState } from "react";
import { useCompare } from "@/lib/context/compare-context";
import { useModel } from "@/lib/context/model-context";
import { getModelDisplayName } from "@/lib/compare/modelDisplayName";
import { ModelPicker } from "@/components/model-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Plus, X } from "lucide-react";

interface CompareModelPickerProps {
  disabled?: boolean;
}

export function CompareModelPicker({ disabled = false }: CompareModelPickerProps) {
  const { compareModels, addCompareModel, removeCompareModel, canAddMoreModels } = useCompare();
  const { availableModels = [], selectedModel, setSelectedModel } = useModel();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const getName = (modelId: string) => getModelDisplayName(modelId, availableModels);

  const filtered = availableModels.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
      {compareModels.map((id) => (
        <span
          key={id}
          className="inline-flex max-w-[10rem] items-center gap-1 truncate rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium sm:max-w-[12rem]"
        >
          <span className="truncate">{getName(id)}</span>
          <button
            type="button"
            aria-label={`Remove ${getName(id)}`}
            disabled={disabled}
            onClick={() => removeCompareModel(id)}
            className="shrink-0 rounded-full hover:bg-primary/20 disabled:opacity-50"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      {canAddMoreModels && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="h-8 rounded-full px-3 text-xs"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add model
              <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-2" align="start">
            <Input
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2 h-8 text-xs"
            />
            <div className="max-h-48 overflow-y-auto">
              {filtered.slice(0, 30).map((model) => {
                const selected = compareModels.includes(model.id);
                return (
                  <button
                    key={model.id}
                    type="button"
                    disabled={selected}
                    onClick={() => {
                      addCompareModel(model.id);
                      if (compareModels.length === 0) {
                        setSelectedModel(model.id);
                      }
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent",
                      selected && "opacity-50"
                    )}
                  >
                    <span className="truncate">{model.name}</span>
                    {selected && <Check className="h-3 w-3 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {compareModels.length < 2 && (
        <div className="min-w-0 flex-1">
          <ModelPicker
            selectedModel={selectedModel}
            setSelectedModel={(id) => {
              setSelectedModel(id);
              if (!compareModels.includes(id)) {
                addCompareModel(id);
              }
            }}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
