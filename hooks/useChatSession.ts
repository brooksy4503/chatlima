"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { adoptDbMessages } from "@/lib/chat/adoptDbMessages";
import type { ChatOperation } from "@/lib/chat/chatRequest";
import { handleChatTransportError, type ChatAccessGateReason } from "@/lib/chat/chatTransportErrors";
import { getUIMessageText } from "@/lib/message-utils";

type ChatBodyRef = {
  selectedModel: string;
  mcpServers: unknown[];
  chatId: string;
  webSearch: { enabled: boolean; contextSize: string };
  imageGeneration: {
    enabled: boolean;
    quality?: string;
    aspectRatio?: string;
    outputFormat?: string;
    model?: string;
  };
  apiKeys: Record<string, string>;
  attachments: unknown[];
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
};

export type UseChatSessionParams = {
  chatId: string | undefined;
  generatedChatId: string;
  initialMessages: UIMessage[];
  isLoadingChat: boolean;
  isCompareLoadingRef: MutableRefObject<boolean>;
  activeLeafMessageId?: string | null;
  activePresetModelId?: string;
  selectedModel: string;
  mcpServersForApi: unknown[];
  webSearchEnabled: boolean;
  webSearchContextSize: string;
  imageGenerationEnabled: boolean;
  imageGenerationQuality?: string;
  imageGenerationAspectRatio?: string;
  imageGenerationOutputFormat?: string;
  imageGenerationModel?: string;
  getClientApiKeys: () => Record<string, string>;
  activePreset?: {
    modelId?: string;
    webSearchEnabled?: boolean;
    webSearchContextSize?: string;
    temperature?: number;
    maxTokens?: number;
    systemInstruction?: string;
  } | null;
  shouldSubmitCompare: () => boolean;
  refreshMessageUsage: () => void;
  queryClient: QueryClient;
  router: AppRouterInstance;
  clearFiles: () => void;
  setHideImagesInUI: (value: boolean) => void;
  setInput: (value: string) => void;
  openAccessGateDialog: (reason: ChatAccessGateReason, modelId: string) => void;
  regenerateSessionId?: () => void;
};

export function useChatSession({
  chatId,
  generatedChatId,
  initialMessages,
  isLoadingChat,
  isCompareLoadingRef,
  activeLeafMessageId,
  activePresetModelId,
  selectedModel,
  mcpServersForApi,
  webSearchEnabled,
  webSearchContextSize,
  imageGenerationEnabled,
  imageGenerationQuality,
  imageGenerationAspectRatio,
  imageGenerationOutputFormat,
  imageGenerationModel,
  getClientApiKeys,
  activePreset,
  shouldSubmitCompare,
  refreshMessageUsage,
  queryClient,
  router,
  clearFiles,
  setHideImagesInUI,
  setInput,
  openAccessGateDialog,
  regenerateSessionId,
}: UseChatSessionParams) {
  const activeChatId = chatId || generatedChatId;
  const lastSubmittedDraftRef = useRef<string | null>(null);
  const pendingOperationRef = useRef<ChatOperation>({ type: "continue" });
  const loadedChatIdRef = useRef<string | null>(null);

  const [isErrorRecoveryNeeded, setIsErrorRecoveryNeeded] = useState(false);
  const [lastErrorTime, setLastErrorTime] = useState<number | null>(null);
  const [lastStreamingActivity, setLastStreamingActivity] = useState<number | null>(null);
  const [streamingStartTime, setStreamingStartTime] = useState<number | null>(null);
  const [lastToastId, setLastToastId] = useState<string | null>(null);
  const [lastErrorMessage, setLastErrorMessage] = useState("");
  const [lastToastTimestamp, setLastToastTimestamp] = useState(0);
  const [timeToFirstToken, setTimeToFirstToken] = useState<number | null>(null);
  const [tokensPerSecond, setTokensPerSecond] = useState<number | null>(null);
  const [totalDuration, setTotalDuration] = useState<number | null>(null);

  const chatBodyRef = useRef<ChatBodyRef>({
    selectedModel,
    mcpServers: mcpServersForApi,
    chatId: activeChatId,
    webSearch: { enabled: webSearchEnabled, contextSize: webSearchContextSize },
    imageGeneration: {
      enabled: imageGenerationEnabled,
      quality: imageGenerationQuality,
      aspectRatio: imageGenerationAspectRatio,
      outputFormat: imageGenerationOutputFormat,
      model: imageGenerationModel,
    },
    apiKeys: {},
    attachments: [],
  });

  useEffect(() => {
    chatBodyRef.current = {
      selectedModel: activePreset?.modelId || selectedModel,
      mcpServers: mcpServersForApi,
      chatId: activeChatId,
      webSearch: {
        enabled: activePreset?.webSearchEnabled ?? webSearchEnabled,
        contextSize: activePreset?.webSearchContextSize || webSearchContextSize,
      },
      imageGeneration: {
        enabled: imageGenerationEnabled,
        quality: imageGenerationQuality,
        aspectRatio: imageGenerationAspectRatio,
        outputFormat: imageGenerationOutputFormat,
        model: imageGenerationModel,
      },
      apiKeys: getClientApiKeys(),
      attachments: [],
      temperature: activePreset?.temperature,
      maxTokens: activePreset?.maxTokens,
      systemInstruction: activePreset?.systemInstruction,
    };
  }, [
    activePreset,
    selectedModel,
    mcpServersForApi,
    activeChatId,
    webSearchEnabled,
    webSearchContextSize,
    imageGenerationEnabled,
    imageGenerationQuality,
    imageGenerationAspectRatio,
    imageGenerationOutputFormat,
    imageGenerationModel,
    getClientApiKeys,
  ]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages, id, body }) => ({
          body: {
            ...body,
            ...chatBodyRef.current,
            messages,
            id,
            operation: pendingOperationRef.current,
          },
        }),
      }),
    []
  );

  const {
    messages,
    sendMessage,
    status,
    stop: originalStop,
    setMessages,
    regenerate: regenerateResponse,
  } = useChat({
    id: activeChatId,
    messages: initialMessages,
    transport,
    sendAutomaticallyWhen: ({ messages: chatMessages }) => {
      if (shouldSubmitCompare()) return false;
      if (mcpServersForApi.length > 0 || imageGenerationEnabled) return false;
      return lastAssistantMessageIsCompleteWithToolCalls({ messages: chatMessages });
    },
    experimental_throttle: 100,
    onFinish: () => {
      lastSubmittedDraftRef.current = null;
      clearFiles();
      setHideImagesInUI(false);

      requestAnimationFrame(() => {
        refreshMessageUsage();
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        queryClient.invalidateQueries({ queryKey: ["chat", activeChatId] });
        queryClient.invalidateQueries({ queryKey: ["chat-token-usage", activeChatId] });
      });

      window.setTimeout(() => {
        refreshMessageUsage();
        if (activeChatId) {
          queryClient.invalidateQueries({ queryKey: ["chats"] });
          queryClient.invalidateQueries({ queryKey: ["chat", activeChatId] });
        }
      }, 3000);

      if (!chatId && generatedChatId) {
        if (window.location.pathname !== `/chat/${generatedChatId}`) {
          router.push(`/chat/${generatedChatId}`, { scroll: false });
        }
      }
    },
    onError: (error) => {
      handleChatTransportError({
        error,
        activePresetModelId,
        selectedModel,
        lastSubmittedDraftRef,
        setInput,
        setHideImagesInUI,
        setIsErrorRecoveryNeeded,
        setLastErrorTime,
        lastToastId,
        setLastToastId,
        lastErrorMessage,
        setLastErrorMessage,
        lastToastTimestamp,
        setLastToastTimestamp,
        openAccessGateDialog,
      });
    },
  });

  useEffect(() => {
    const decision = adoptDbMessages({
      chatId,
      loadedChatId: loadedChatIdRef.current,
      isLoadingChat,
      status,
      isCompareLoading: isCompareLoadingRef.current,
      initialMessages,
      currentMessages: messages,
      activeLeafMessageId,
    });

    if (decision.action === "replace") {
      setMessages(decision.messages);
      if (decision.loadedChatId) {
        loadedChatIdRef.current = decision.loadedChatId;
      }
    }
  }, [
    chatId,
    isLoadingChat,
    initialMessages,
    status,
    setMessages,
    messages,
    activeLeafMessageId,
  ]);

  const stopStreaming = useCallback(async () => {
    if (activeChatId) {
      try {
        await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "stop", chatId: activeChatId }),
        });
      } catch (stopError) {
        console.warn("Failed to send explicit stop request to server:", stopError);
      }
    }

    originalStop();

    window.setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chat", activeChatId] });

      if (!chatId && generatedChatId) {
        if (window.location.pathname !== `/chat/${generatedChatId}`) {
          router.push(`/chat/${generatedChatId}`, { scroll: false });
        }
      }
    }, 100);
  }, [originalStop, queryClient, chatId, generatedChatId, router, activeChatId]);

  useEffect(() => {
    if (isErrorRecoveryNeeded && lastErrorTime) {
      const resetTimeout = window.setTimeout(() => {
        originalStop();
        regenerateSessionId?.();
        setIsErrorRecoveryNeeded(false);
        setLastErrorTime(null);
        setLastToastId(null);
        setLastErrorMessage("");
        setLastToastTimestamp(0);
      }, 500);

      return () => window.clearTimeout(resetTimeout);
    }
  }, [isErrorRecoveryNeeded, lastErrorTime, originalStop, regenerateSessionId]);

  useEffect(() => {
    if (status === "streaming") {
      if (!streamingStartTime) {
        setStreamingStartTime(Date.now());
      }

      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        const hasAssistantActivity =
          lastMessage.role === "assistant" &&
          ((lastMessage.parts?.length ?? 0) > 0 || getUIMessageText(lastMessage).length > 0);

        if (hasAssistantActivity) {
          setLastStreamingActivity(Date.now());

          if (timeToFirstToken === null && streamingStartTime) {
            setTimeToFirstToken(Date.now() - streamingStartTime);
          }
        }
      }
    } else if (streamingStartTime && status === "ready") {
      setTotalDuration(Date.now() - streamingStartTime);
      setStreamingStartTime(null);
      setTimeToFirstToken(null);
      setTokensPerSecond(null);
    }
  }, [status, messages, streamingStartTime, timeToFirstToken]);

  useEffect(() => {
    if (status === "streaming" || status === "submitted") {
      if (!lastStreamingActivity) {
        setLastStreamingActivity(Date.now());
      }

      const stuckTimeout = window.setTimeout(() => {
        const now = Date.now();
        const timeSinceLastActivity = now - (lastStreamingActivity || now);

        if (
          timeSinceLastActivity > 120000 &&
          (status === "streaming" || status === "submitted")
        ) {
          const stuckMessage = "Chat appears to be stuck. Attempting to recover...";
          const timeSinceLastToast = now - lastToastTimestamp;
          const isSameMessage = stuckMessage === lastErrorMessage;
          const tooSoon = timeSinceLastToast < (isSameMessage ? 5000 : 2000);

          if (tooSoon) return;

          setIsErrorRecoveryNeeded(true);
          setLastErrorTime(now);

          if (lastToastId) {
            toast.dismiss(lastToastId);
          }

          const toastId = toast.error(stuckMessage, {
            description: "No response activity detected for 2 minutes",
            position: "top-center",
            duration: 6000,
          });

          setLastToastId(String(toastId));
          setLastErrorMessage(stuckMessage);
          setLastToastTimestamp(now);
        }
      }, 120000);

      return () => window.clearTimeout(stuckTimeout);
    }

    setLastStreamingActivity(null);
  }, [status, lastStreamingActivity, lastErrorMessage, lastToastId, lastToastTimestamp]);

  return {
    messages,
    sendMessage,
    status,
    stopStreaming,
    setMessages,
    regenerateResponse,
    pendingOperationRef,
    lastSubmittedDraftRef,
    timeToFirstToken,
    tokensPerSecond,
    totalDuration,
    streamingStartTime,
    isRecovering: isErrorRecoveryNeeded,
    resetRecovery: () => {
      setIsErrorRecoveryNeeded(false);
      setLastErrorTime(null);
      setStreamingStartTime(null);
      setLastStreamingActivity(null);
      setLastToastId(null);
      setLastErrorMessage("");
      setLastToastTimestamp(0);
    },
    lastToastId,
  };
}
