"use client";

import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import {
  ChatUsageChip,
  type ChatUsageChipProps,
} from "./token-metrics/ChatUsageChip";

export type AssistantActionBarProps = {
  copyText?: string;
  chatUsage?: ChatUsageChipProps | null;
  modelDisplayName?: string | null;
  className?: string;
};

/**
 * Thin Grok-style row under an assistant message: copy on the left,
 * optional model label + usage pill on the right.
 */
export function AssistantActionBar({
  copyText,
  chatUsage,
  modelDisplayName,
  className,
}: AssistantActionBarProps) {
  const showCopy = copyText !== undefined;
  const showModel = Boolean(modelDisplayName);
  if (!showCopy && !chatUsage && !showModel) return null;

  return (
    <div
      className={cn(
        "mt-2 flex items-center gap-1 min-h-7",
        className
      )}
    >
      {showCopy ? (
        <CopyButton text={copyText} iconOnly className="opacity-100" />
      ) : null}
      <div className="ml-auto flex items-center gap-2 shrink-0">
        {showModel ? (
          <span className="text-[11px] text-muted-foreground truncate max-w-[10rem] sm:max-w-[14rem]">
            {modelDisplayName}
          </span>
        ) : null}
        {chatUsage ? <ChatUsageChip {...chatUsage} /> : null}
      </div>
    </div>
  );
}
