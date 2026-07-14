"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import type { UIMessage } from "ai";
import {
  buildMessageGraph,
  buildPathToLeaf,
  getSiblingVersionInfo,
  inferParentChainFromLinearOrder,
  mergeGraphMessages,
  resolveDeepestLeafId,
} from "@/lib/chat/conversationTree";
import type { CompareUIMessage } from "@/lib/chat/compareHistory";
import {
  buildEditResubmitMessages,
  buildRegenerateMessages,
} from "@/lib/chat/branchOperations";

type UseConversationBranchesParams = {
  chatId: string | undefined;
  messages: CompareUIMessage[];
  allMessages: CompareUIMessage[];
  activeLeafMessageId: string | null;
  setMessages: (messages: CompareUIMessage[]) => void;
  isStreaming: boolean;
  onForkNavigate?: (newChatId: string) => void;
};

export function useConversationBranches({
  chatId,
  messages,
  allMessages,
  activeLeafMessageId,
  setMessages,
  isStreaming,
  onForkNavigate,
}: UseConversationBranchesParams) {
  const queryClient = useQueryClient();

  const graph = useMemo(() => {
    const merged =
      allMessages.length > 0
        ? mergeGraphMessages(allMessages, messages)
        : inferParentChainFromLinearOrder(messages);
    return buildMessageGraph(merged);
  }, [allMessages, messages]);

  const getVersionInfo = (messageId: string) => {
    if (isStreaming) return null;
    return getSiblingVersionInfo(messageId, graph);
  };

  const selectSibling = async (messageId: string, direction: -1 | 1) => {
    const versionInfo = getSiblingVersionInfo(messageId, graph);
    if (!versionInfo || !chatId) return;

    const nextIndex = versionInfo.index - 1 + direction;
    if (nextIndex < 0 || nextIndex >= versionInfo.total) return;

    const targetSibling = versionInfo.siblings[nextIndex];
    // User siblings are not leaves — descend to that branch's assistant reply.
    const leafId =
      resolveDeepestLeafId(targetSibling.id, graph) ?? targetSibling.id;
    const pathFromLeaf = buildPathToLeaf(leafId, graph);

    try {
      const response = await fetch(`/api/chats/${chatId}/active-leaf`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leafMessageId: leafId }),
      });

      if (!response.ok) {
        throw new Error("Failed to switch branch");
      }

      const data = await response.json();
      setMessages(data.activePathMessages ?? pathFromLeaf);
      queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
    } catch (error) {
      console.error("Branch switch failed:", error);
      setMessages(pathFromLeaf as CompareUIMessage[]);
    }
  };

  const regenerate = (assistantMessageId: string) => {
    if (isStreaming) return null;

    const attemptId = nanoid();
    const rebuilt = buildRegenerateMessages({
      activePath: messages,
      assistantMessageId,
      attemptId,
    });
    if (!rebuilt) return null;

    setMessages(rebuilt.messages as CompareUIMessage[]);
    return {
      operation: {
        type: "regenerate" as const,
        assistantMessageId,
        attemptId,
      },
      messages: rebuilt.messages as UIMessage[],
    };
  };

  const editResubmit = (userMessageId: string, content: string) => {
    if (isStreaming) return null;

    const attemptId = nanoid();
    const rebuilt = buildEditResubmitMessages({
      activePath: messages,
      userMessageId,
      content,
      attemptId,
    });
    if (!rebuilt) return null;

    setMessages(rebuilt.messages as CompareUIMessage[]);
    return {
      operation: {
        type: "edit-resubmit" as const,
        userMessageId,
        content,
        attemptId,
      },
      messages: rebuilt.messages as UIMessage[],
    };
  };

  const forkChat = async (forkThroughMessageId: string) => {
    if (!chatId) return;

    try {
      const response = await fetch(`/api/chats/${chatId}/fork`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forkThroughMessageId }),
      });

      if (!response.ok) {
        throw new Error("Failed to fork chat");
      }

      const data = await response.json();
      if (data.newChatId) {
        onForkNavigate?.(data.newChatId);
      }
    } catch (error) {
      console.error("Fork failed:", error);
    }
  };

  return {
    activeLeafMessageId,
    getVersionInfo,
    selectSibling,
    regenerate,
    editResubmit,
    forkChat,
  };
}
