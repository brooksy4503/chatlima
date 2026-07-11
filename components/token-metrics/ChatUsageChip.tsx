"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, Coins, ChevronDown, ChevronUp } from "lucide-react";

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
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
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
  const [expanded, setExpanded] = useState(false);

  if (error) {
    return (
      <div className={cn("text-xs text-red-500 px-1 shrink-0", className)}>
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

  const collapsedParts = [
    <span key="tokens" className="inline-flex items-center gap-1">
      <Coins className="h-3 w-3" />
      {formatNumber(totalTokens)}
    </span>,
  ];

  if (totalCreditsConsumed > 0) {
    collapsedParts.push(
      <span key="credits">{totalCreditsConsumed} cr</span>
    );
  }

  collapsedParts.push(
    <span key="msgs" className="inline-flex items-center gap-1">
      <BarChart3 className="h-3 w-3" />
      {messageCount} msgs
    </span>
  );

  return (
    <div className={cn("relative shrink-0", className)}>
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted/70 transition-colors"
        aria-expanded={expanded}
        aria-label="Chat usage"
      >
        <span className="inline-flex items-center gap-2">{collapsedParts}</span>
        {expanded ? (
          <ChevronUp className="h-3 w-3 shrink-0" />
        ) : (
          <ChevronDown className="h-3 w-3 shrink-0" />
        )}
      </button>

      {expanded ? (
        <div className="absolute bottom-full left-0 mb-2 z-20 min-w-[11rem] rounded-lg border border-border/60 bg-popover px-3 py-2 text-xs text-muted-foreground space-y-1">
          <div>
            In {formatNumber(totalInputTokens)} → Out {formatNumber(totalOutputTokens)}
          </div>
          {totalCreditsConsumed > 0 ? (
            <div>Credits this chat: {totalCreditsConsumed}</div>
          ) : null}
          <div>Messages: {messageCount}</div>
        </div>
      ) : null}
    </div>
  );
}
