"use client";

import { Markdown } from "@/components/markdown";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SpinnerIcon } from "@/components/icons";
import type { CompareUIMessage } from "@/lib/chat/compareHistory";
import { getUIMessageText } from "@/lib/message-utils";

interface CompareResponseCardProps {
  message: CompareUIMessage;
  isStreaming?: boolean;
  onPromote?: () => void;
  isPromoted?: boolean;
}

export function CompareResponseCard({
  message,
  isStreaming = false,
  onPromote,
  isPromoted = false,
}: CompareResponseCardProps) {
  const text = getUIMessageText(message);
  const displayName = message.modelDisplayName ?? message.modelId ?? "Model";
  const latency = message.latencyMs;

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3 shadow-sm",
        isPromoted && "border-primary border-2"
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-foreground truncate">{displayName}</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {isStreaming ? (
            <span className="inline-flex items-center gap-1">
              <SpinnerIcon />
              streaming…
            </span>
          ) : latency != null ? (
            `${(latency / 1000).toFixed(1)}s`
          ) : null}
        </span>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
        {text ? <Markdown>{text}</Markdown> : isStreaming ? null : (
          <span className="text-muted-foreground italic">No response</span>
        )}
      </div>
      {!isStreaming && text && (
        <div className="mt-3 flex flex-wrap gap-2">
          {onPromote && (
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={onPromote}>
              {isPromoted ? "Primary model" : "Continue with this"}
            </Button>
          )}
          <CopyButton text={text} />
        </div>
      )}
    </div>
  );
}
