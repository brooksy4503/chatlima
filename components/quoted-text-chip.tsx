"use client";

import { AlignLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuotedTextChipProps {
  text: string;
  onClear: () => void;
}

function truncateText(text: string, maxLength = 120): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function QuotedTextChip({ text, onClear }: QuotedTextChipProps) {
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2">
      <div className="flex items-start gap-2">
        <AlignLeft className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="min-w-0 flex-1 text-sm text-muted-foreground line-clamp-2">
          {truncateText(text)}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={onClear}
          aria-label="Remove quoted text"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
