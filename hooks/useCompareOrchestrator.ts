"use client";

import { useCallback, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { useCompare } from "@/lib/context/compare-context";
import { canSubmitCompare } from "@/lib/compare/comparePolicy";
import type { CompareStreamEvent } from "@/lib/chat/compareRequest";
import type { CompareUIMessage } from "@/lib/chat/compareHistory";
import { getUIMessageText } from "@/lib/message-utils";

type CompareStatus = "idle" | "streaming" | "error";

interface UseCompareOrchestratorParams {
  chatId: string;
  messages: CompareUIMessage[];
  setMessages: React.Dispatch<React.SetStateAction<CompareUIMessage[]>>;
  getApiKeys: () => Record<string, string>;
  canUseModelAtCreditCost: (required: number) => boolean;
}

export function useCompareOrchestrator({
  chatId,
  messages,
  setMessages,
  getApiKeys,
  canUseModelAtCreditCost,
}: UseCompareOrchestratorParams) {
  const { compareModels, estimatedCreditCost, setCompareModeEnabled } = useCompare();
  const [status, setStatus] = useState<CompareStatus>("idle");
  const abortRef = useRef<AbortController | null>(null);

  const isCompareLoading = status === "streaming";

  const stop = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus("idle");

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop", chatId }),
      });
    } catch {
      // ignore stop errors
    }
  }, [chatId]);

  const submit = useCallback(
    async (text: string, compareModelsOverride?: string[]) => {
      const activeCompareModels = compareModelsOverride ?? compareModels;
      const gate = canSubmitCompare({
        input: text,
        compareModels: activeCompareModels,
        hasEnoughCredits: canUseModelAtCreditCost,
        estimatedCreditCost,
      });

      if (!gate.allowed) {
        toast.error(gate.reason);
        return false;
      }

      const comparisonTurnId = nanoid();
      const userMessageId = nanoid();

      const userMessage: CompareUIMessage = {
        id: userMessageId,
        role: "user",
        parts: [{ type: "text", text }],
        comparisonTurnId,
      };

      const placeholders: CompareUIMessage[] = activeCompareModels.map((modelId) => ({
        id: nanoid(),
        role: "assistant",
        parts: [{ type: "text", text: "" }],
        modelId,
        modelProvider: modelId.split("/")[0] ?? null,
        modelDisplayName: modelId,
        comparisonTurnId,
      }));

      const nextMessages = [...messages, userMessage, ...placeholders];
      setMessages(nextMessages);
      setStatus("streaming");

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            chatId,
            messages: nextMessages,
            compareModels: activeCompareModels,
            comparisonTurnId,
            userMessageId,
            apiKeys: getApiKeys(),
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err?.error?.message ?? "Compare request failed");
        }

        if (!response.body) {
          throw new Error("No response stream");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const applyEvent = (event: CompareStreamEvent) => {
          if (event.type === "model-start") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.modelId === event.modelId &&
                msg.comparisonTurnId === comparisonTurnId &&
                msg.role === "assistant"
                  ? { ...msg, id: event.messageId, parts: [{ type: "text", text: "" }] }
                  : msg
              )
            );
          }

          if (event.type === "text-delta") {
            setMessages((prev) =>
              prev.map((msg) => {
                if (
                  msg.comparisonTurnId !== comparisonTurnId ||
                  msg.role !== "assistant" ||
                  msg.modelId !== event.modelId
                ) {
                  return msg;
                }
                return {
                  ...msg,
                  parts: [{ type: "text", text: getUIMessageText(msg) + event.delta }],
                };
              })
            );
          }

          if (event.type === "model-finish") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.modelId === event.modelId &&
                msg.comparisonTurnId === comparisonTurnId &&
                msg.role === "assistant"
                  ? { ...msg, id: event.messageId, latencyMs: event.latencyMs }
                  : msg
              )
            );
          }

          if (event.type === "model-error") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.modelId === event.modelId &&
                msg.comparisonTurnId === comparisonTurnId &&
                msg.role === "assistant"
                  ? {
                      ...msg,
                      id: event.messageId,
                      parts: [{ type: "text", text: `Error: ${event.error}` }],
                    }
                  : msg
              )
            );
          }

          if (event.type === "error") {
            toast.error(event.message);
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const event = JSON.parse(line) as CompareStreamEvent;
              applyEvent(event);
            } catch {
              console.warn("[Compare] Failed to parse stream line:", line);
            }
          }
        }

        setStatus("idle");
        return true;
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          setStatus("idle");
          return false;
        }
        console.error("[Compare] Submit error:", error);
        toast.error(error instanceof Error ? error.message : "Compare failed");
        setStatus("error");
        setMessages(messages);
        return false;
      } finally {
        abortRef.current = null;
      }
    },
    [
      compareModels,
      estimatedCreditCost,
      canUseModelAtCreditCost,
      chatId,
      messages,
      setMessages,
      getApiKeys,
    ]
  );

  const promoteModel = useCallback(
    (modelId: string, comparisonTurnId: string) => {
      setCompareModeEnabled(false);
      setMessages((prev) => {
        const kept = prev.filter(
          (msg) =>
            msg.comparisonTurnId !== comparisonTurnId ||
            msg.role === "user" ||
            (msg.role === "assistant" && msg.modelId === modelId)
        );
        return kept;
      });
    },
    [setCompareModeEnabled, setMessages]
  );

  return {
    submit,
    stop,
    promoteModel,
    isCompareLoading,
  };
}
