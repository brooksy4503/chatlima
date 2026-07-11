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
  className?: string;
};

/**
 * Thin Grok-style row under an assistant message: copy on the left,
 * optional chat-usage pill on the right.
 */
export function AssistantActionBar({
  copyText,
  chatUsage,
  className,
}: AssistantActionBarProps) {
  const showCopy = copyText !== undefined;
  if (!showCopy && !chatUsage) return null;

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
      {chatUsage ? (
        <div className="ml-auto shrink-0">
          <ChatUsageChip {...chatUsage} />
        </div>
      ) : null}
    </div>
  );
}
