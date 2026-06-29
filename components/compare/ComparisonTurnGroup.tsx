"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CompareResponseCard } from "./CompareResponseCard";
import type { CompareUIMessage } from "@/lib/chat/compareHistory";
import { getUIMessageText } from "@/lib/message-utils";
import { cn } from "@/lib/utils";

interface ComparisonTurnGroupProps {
  turnId: string;
  messages: CompareUIMessage[];
  defaultExpanded?: boolean;
  isLatestTurn?: boolean;
  streamingModelIds?: Set<string>;
  onPromote?: (modelId: string) => void;
}

export function ComparisonTurnGroup({
  turnId,
  messages,
  defaultExpanded = false,
  isLatestTurn = false,
  streamingModelIds,
  onPromote,
}: ComparisonTurnGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded || isLatestTurn);

  const userMsg = messages.find((m) => m.role === "user");
  const assistants = messages.filter((m) => m.role === "assistant");
  const userText = userMsg ? getUIMessageText(userMsg) : "";

  if (!userMsg) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      {!isLatestTurn && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-left text-sm hover:bg-muted/50"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
          <span className="truncate font-medium">{userText.slice(0, 80)}{userText.length > 80 ? "…" : ""}</span>
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">{assistants.length} responses</span>
        </button>
      )}

      {(expanded || isLatestTurn) && (
        <>
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground">
              {userText}
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            {assistants.length} model response{assistants.length === 1 ? "" : "s"}
          </p>
          <div className="space-y-2">
            {assistants.map((msg) => (
              <CompareResponseCard
                key={msg.id}
                message={msg}
                isStreaming={streamingModelIds?.has(msg.modelId ?? "") ?? false}
                onPromote={
                  msg.modelId && onPromote ? () => onPromote(msg.modelId!) : undefined
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
