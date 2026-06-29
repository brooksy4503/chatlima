"use client";

import { useMemo } from "react";
import { Message } from "@/components/message";
import { ComparisonTurnGroup } from "./ComparisonTurnGroup";
import { CompareModeBar } from "./CompareModeBar";
import { groupMessagesByComparisonTurn, isComparisonTurn, type CompareUIMessage } from "@/lib/chat/compareHistory";
import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom";

interface CompareTimelineProps {
  messages: CompareUIMessage[];
  isLoading: boolean;
  status: "error" | "submitted" | "streaming" | "ready";
  compareModeEnabled: boolean;
  compareModels?: string[];
  isCompareStreaming?: boolean;
  onPromoteModel?: (modelId: string, comparisonTurnId: string) => void;
  webSearchEnabled?: boolean;
  imageGenerationEnabled?: boolean;
}

export function CompareTimeline({
  messages,
  isLoading,
  status,
  compareModeEnabled,
  compareModels = [],
  isCompareStreaming = false,
  onPromoteModel,
  webSearchEnabled = false,
  imageGenerationEnabled = false,
}: CompareTimelineProps) {
  const groups = useMemo(() => groupMessagesByComparisonTurn(messages), [messages]);

  const scrollTrigger = isCompareStreaming ? `${messages.length}:compare` : messages.length;
  const [containerRef, endRef] = useScrollToBottom(scrollTrigger);

  const comparisonGroups = groups.filter((g) => isComparisonTurn(g.turnId));
  const latestComparisonTurnId = comparisonGroups[comparisonGroups.length - 1]?.turnId ?? null;

  const nonCompareMessages = groups.filter((g) => !isComparisonTurn(g.turnId));

  return (
    <div className="flex h-full min-h-0 flex-col">
      {compareModeEnabled && <CompareModeBar />}
      <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar" ref={containerRef}>
        <div className="mx-auto max-w-lg py-4 sm:max-w-3xl">
          {nonCompareMessages.map((group, gi) =>
            group.messages.map((m, i) => (
              <Message
                key={m.id}
                isLatestMessage={false}
                isLoading={isLoading}
                message={m}
                status={status}
                webSearchEnabled={webSearchEnabled}
                imageGenerationEnabled={imageGenerationEnabled}
              />
            ))
          )}

          {comparisonGroups.map((group, index) => {
            const isLatest = group.turnId === latestComparisonTurnId;
            const streamingModelIds =
              isLatest && isCompareStreaming ? new Set(compareModels) : undefined;
            return (
              <ComparisonTurnGroup
                key={group.turnId ?? index}
                turnId={group.turnId!}
                messages={group.messages}
                isLatestTurn={isLatest}
                defaultExpanded={isLatest}
                streamingModelIds={streamingModelIds}
                onPromote={
                  onPromoteModel && group.turnId
                    ? (modelId) => onPromoteModel(modelId, group.turnId!)
                    : undefined
                }
              />
            );
          })}

          <div className="h-1" ref={endRef} />
        </div>
      </div>
    </div>
  );
}
