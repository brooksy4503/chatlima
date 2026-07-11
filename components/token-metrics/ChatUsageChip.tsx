"use client";

import { cn } from "@/lib/utils";
import { Coins } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ChatUsageChipProps = {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCreditsConsumed: number;
  messageCount: number;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
};

function formatNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

export function ChatUsageChip({
  totalInputTokens,
  totalOutputTokens,
  totalTokens,
  totalCreditsConsumed,
  messageCount,
  error,
  onRefresh,
  className,
}: ChatUsageChipProps) {
  if (error) {
    return (
      <div className={cn("text-xs text-red-500 shrink-0", className)}>
        Usage unavailable
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="ml-2 underline text-muted-foreground hover:text-foreground"
          >
            Retry
          </button>
        ) : null}
      </div>
    );
  }

  const summary = [
    formatNumber(totalTokens),
    totalCreditsConsumed > 0 ? `${totalCreditsConsumed} cr` : null,
    `${messageCount} msgs`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-2.5 text-xs text-muted-foreground",
            "hover:bg-muted/70 hover:text-foreground transition-colors",
            className
          )}
          aria-label="Chat usage"
        >
          <Coins className="h-3 w-3 shrink-0 opacity-70" />
          <span className="whitespace-nowrap">{summary}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-auto min-w-[11rem] p-3 text-xs text-muted-foreground space-y-1"
      >
        <div>
          In {formatNumber(totalInputTokens)} → Out{" "}
          {formatNumber(totalOutputTokens)}
        </div>
        {totalCreditsConsumed > 0 ? (
          <div>Credits this chat: {totalCreditsConsumed}</div>
        ) : null}
        <div>Messages: {messageCount}</div>
      </PopoverContent>
    </Popover>
  );
}
