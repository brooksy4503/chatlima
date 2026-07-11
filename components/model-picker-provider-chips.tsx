"use client";

import { cn } from "@/lib/utils";
import type { ProviderWithKeyStatus } from "@/lib/models/filter-picker-models";
import type { ProviderFilter } from "@/lib/models/filter-picker-models";

interface ModelPickerProviderChipsProps {
  providers: ProviderWithKeyStatus[];
  selectedProvider: ProviderFilter;
  byokOnly: boolean;
  showByokChip: boolean;
  onProviderChange: (provider: ProviderFilter) => void;
  onByokChange: (byokOnly: boolean) => void;
}

function ProviderChip({
  label,
  active,
  hasKey,
  onClick,
}: {
  label: string;
  active: boolean;
  hasKey?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
        active
          ? "border-primary bg-background text-foreground shadow-sm"
          : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-background/60 hover:text-foreground"
      )}
    >
      {label}
      {hasKey ? (
        <span className="rounded bg-primary/15 px-1 text-[9px] font-semibold uppercase tracking-wide text-primary">
          Key
        </span>
      ) : null}
    </button>
  );
}

export function ModelPickerProviderChips({
  providers,
  selectedProvider,
  byokOnly,
  showByokChip,
  onProviderChange,
  onByokChange,
}: ModelPickerProviderChipsProps) {
  if (providers.length === 0) {
    return null;
  }

  return (
    <div
      role="listbox"
      aria-label="Filter models by provider"
      className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ProviderChip
        label="All"
        active={selectedProvider === "all"}
        onClick={() => onProviderChange("all")}
      />
      {providers.map((provider) => (
        <ProviderChip
          key={provider.name}
          label={provider.name}
          active={selectedProvider === provider.name}
          hasKey={provider.hasKey}
          onClick={() => onProviderChange(provider.name)}
        />
      ))}
      {showByokChip ? (
        <ProviderChip
          label="BYOK"
          active={byokOnly}
          onClick={() => onByokChange(!byokOnly)}
        />
      ) : null}
    </div>
  );
}
