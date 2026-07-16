"use client";

import { useMemo } from "react";
import {
  buildChatDisplayMessages,
  type ChatDisplayMessagesInput,
} from "@/lib/chat/buildChatDisplayMessages";

/**
 * Derives compare-aware display messages from loaded chat graph data.
 * Single entry point for hydrating `useChatSession` and compare timeline state.
 */
export function useChatDisplayMessages(
  chatData: ChatDisplayMessagesInput | null | undefined
) {
  return useMemo(() => buildChatDisplayMessages(chatData), [chatData]);
}
