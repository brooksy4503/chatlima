"use client";

import { useEffect, useRef, useState } from "react";
import type { UIMessage } from "ai";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUIMessageText } from "@/lib/message-utils";

export type ChatTokenUsageState = {
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
  currency?: string;
  timeToFirstToken?: number;
  tokensPerSecond?: number;
  totalDuration?: number;
};

export type ChatTokenData = {
  totalInputTokens?: number;
  totalOutputTokens?: number;
  totalTokens?: number;
  totalEstimatedCost?: number;
  totalActualCost?: number;
  totalCreditsConsumed?: number;
  messageCount?: number;
  currency?: string;
  avgTimeToFirstToken?: number;
  avgTokensPerSecond?: number;
  avgTotalDuration?: number;
};

type UseChatTokenMetricsParams = {
  activeChatId: string | null;
  userId: string | null;
  messages: UIMessage[];
  status: "error" | "submitted" | "streaming" | "ready";
  timeToFirstToken: number | null;
  tokensPerSecond: number | null;
  totalDuration: number | null;
};

export function useChatTokenMetrics({
  activeChatId,
  userId,
  messages,
  status,
  timeToFirstToken,
  tokensPerSecond,
  totalDuration,
}: UseChatTokenMetricsParams) {
  const queryClient = useQueryClient();
  const tokenUsageRefetchKeyRef = useRef("");

  useEffect(() => {
    tokenUsageRefetchKeyRef.current = "";
  }, [activeChatId]);

  const [chatTokenUsage, setChatTokenUsage] = useState<ChatTokenUsageState>({});

  const {
    data: chatTokenData,
    error: tokenDataError,
    refetch: refetchTokenData,
  } = useQuery<ChatTokenData | null>({
    queryKey: ["chat-token-usage", activeChatId],
    queryFn: async ({ queryKey }) => {
      const [, chatIdFromKey] = queryKey;
      if (!chatIdFromKey || !userId) return null;

      const response = await fetch(`/api/token-usage?chatId=${chatIdFromKey}`);
      if (!response.ok) {
        throw new Error("Failed to load token usage data");
      }

      const data = await response.json();
      return data.data as ChatTokenData;
    },
    enabled: !!activeChatId && !!userId,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (status === "streaming" && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        const outputContentLength = getUIMessageText(lastMessage).length;
        let inputContentLength = 0;

        if (messages.length > 1) {
          inputContentLength = getUIMessageText(messages[messages.length - 2]).length;
        }

        const estimatedOutputTokens = Math.floor(outputContentLength / 4);
        const estimatedInputTokens = Math.floor(inputContentLength / 4);

        setChatTokenUsage({
          inputTokens: estimatedInputTokens,
          outputTokens: estimatedOutputTokens,
          timeToFirstToken: timeToFirstToken || undefined,
          tokensPerSecond: tokensPerSecond || undefined,
          totalDuration: totalDuration || undefined,
        });
      }
    } else if (status === "ready") {
      if (chatTokenData) {
        const inputTokens = chatTokenData.totalInputTokens || 0;
        const outputTokens = chatTokenData.totalOutputTokens || 0;

        setChatTokenUsage({
          inputTokens,
          outputTokens,
          timeToFirstToken:
            chatTokenData.avgTimeToFirstToken || timeToFirstToken || undefined,
          tokensPerSecond:
            chatTokenData.avgTokensPerSecond || tokensPerSecond || undefined,
          totalDuration:
            chatTokenData.avgTotalDuration || totalDuration || undefined,
        });
      }

      const totalTokens =
        chatTokenData?.totalTokens ||
        (chatTokenData?.totalInputTokens || 0) +
          (chatTokenData?.totalOutputTokens || 0);
      const completedTurnKey = `${activeChatId ?? "new"}:${messages.length}`;

      if (totalTokens > 0 || tokenUsageRefetchKeyRef.current === completedTurnKey) {
        return;
      }

      tokenUsageRefetchKeyRef.current = completedTurnKey;
      const refetchDelays = [300, 1200, 2500, 5000, 8000];
      const refetchTimers = refetchDelays.map((refetchDelay) =>
        window.setTimeout(() => {
          refetchTokenData();
          if (userId) {
            queryClient.invalidateQueries({ queryKey: ["user-token-usage", userId] });
          }
        }, refetchDelay)
      );
      return () => refetchTimers.forEach((timer) => window.clearTimeout(timer));
    }
  }, [
    activeChatId,
    messages,
    status,
    chatTokenData,
    refetchTokenData,
    userId,
    queryClient,
    timeToFirstToken,
    tokensPerSecond,
    totalDuration,
  ]);

  const totalInputTokens =
    chatTokenData?.totalInputTokens || chatTokenUsage?.inputTokens || 0;
  const totalOutputTokens =
    chatTokenData?.totalOutputTokens || chatTokenUsage?.outputTokens || 0;
  const totalTokens =
    chatTokenData?.totalTokens || totalInputTokens + totalOutputTokens || 0;
  const totalCreditsConsumed = chatTokenData?.totalCreditsConsumed || 0;
  const messageCount = chatTokenData?.messageCount ?? messages.length;

  return {
    chatTokenData,
    chatTokenUsage,
    totalInputTokens,
    totalOutputTokens,
    totalTokens,
    totalCreditsConsumed,
    messageCount,
    tokenDataError,
    refetchTokenData,
  };
}
