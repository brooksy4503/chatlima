"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BranchPagerProps = {
  index: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
  className?: string;
};

export function BranchPager({
  index,
  total,
  onPrevious,
  onNext,
  disabled = false,
  className,
}: BranchPagerProps) {
  if (total <= 1) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border border-border/60 bg-muted/40 px-1 py-0.5 text-xs text-muted-foreground",
        className
      )}
      aria-label={`Version ${index} of ${total}`}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onPrevious}
        disabled={disabled || index <= 1}
        aria-label="Previous version"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>
      <span className="min-w-[2.5rem] text-center tabular-nums">
        {index} / {total}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onNext}
        disabled={disabled || index >= total}
        aria-label="Next version"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
