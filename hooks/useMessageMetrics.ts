"use client";

import { useMemo } from "react";
import type { ChatTokenData } from "@/hooks/useChatTokenMetrics";

export type MessageMetricsMap = Record<
  string,
  {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    estimatedCost?: number;
    currency?: string;
    modelId?: string;
    modelDisplayName?: string;
    timeToFirstToken?: number;
    tokensPerSecond?: number;
    totalDuration?: number;
  }
>;

export function useMessageMetrics(
  chatTokenData: ChatTokenData | null | undefined,
  messages: Array<{
    id: string;
    role?: string;
    modelDisplayName?: string | null;
    modelId?: string | null;
  }>
): MessageMetricsMap {
  return useMemo(() => {
    const map: MessageMetricsMap = {};

    for (const breakdown of chatTokenData?.breakdownByMessage ?? []) {
      if (!breakdown.messageId) continue;
      map[breakdown.messageId] = {
        inputTokens: breakdown.inputTokens,
        outputTokens: breakdown.outputTokens,
        totalTokens: breakdown.totalTokens,
        estimatedCost: breakdown.estimatedCost,
        modelId: breakdown.modelId,
        modelDisplayName: breakdown.modelDisplayName ?? breakdown.modelId,
        timeToFirstToken: breakdown.timeToFirstTokenMs,
        tokensPerSecond: breakdown.tokensPerSecond,
        totalDuration: breakdown.processingTimeMs,
      };
    }

    for (const message of messages) {
      if (message.role === "assistant" && !map[message.id]) {
        map[message.id] = {
          modelId: message.modelId ?? undefined,
          modelDisplayName: message.modelDisplayName ?? undefined,
        };
      }
    }

    return map;
  }, [chatTokenData, messages]);
}
