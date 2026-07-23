"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { UIMessage } from "ai";
import { Textarea } from "./textarea";
import { ProjectOverview } from "./project-overview";
import { Messages } from "./messages";
import { CompareTimeline } from "./compare/CompareTimeline";
import { CompareModeBar } from "./compare/CompareModeBar";
import { toast } from "sonner";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatQuotedMessageContent } from "@/lib/quoted-text-utils";
import { type Message as DBMessage } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { useModel } from "@/lib/context/model-context";
import { useCompare } from "@/lib/context/compare-context";
import { MIN_COMPARE_MODELS } from "@/lib/compare/comparePolicy";
import { useCompareOrchestrator } from "@/hooks/useCompareOrchestrator";
import { useChatSession } from "@/hooks/useChatSession";
import { useChatDisplayMessages } from "@/hooks/useChatDisplayMessages";
import { useConversationBranches } from "@/hooks/useConversationBranches";
import { useMessageMetrics } from "@/hooks/useMessageMetrics";
import type { ChatOperation } from "@/lib/chat/chatRequest";
import { usePresets } from "@/lib/context/preset-context";
import { useMCP } from "@/lib/context/mcp-context";
import { useAuth } from "@/hooks/useAuth";
import { MCPServerManager } from "./mcp-server-manager";
import { useWebSearch } from "@/lib/context/web-search-context";
import { useImageGeneration } from "@/lib/context/image-generation-context";
import { ErrorBoundary } from "./error-boundary";
import { useCredits } from "@/hooks/useCredits";
import type { FileAttachment } from "@/lib/types";
import { useModels } from "@/hooks/use-models";
import { useChatTokenMetrics } from "@/hooks/useChatTokenMetrics";
import { getLocalStorageItem, isLocalStorageAvailable } from "@/lib/browser-storage";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { ChatProjectSelector } from "./projects/chat-project-selector";
import { Button } from "./ui/button";
import { Check, MessageSquare, Search, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { hasProviderByokForModel } from "@/lib/services/accessGateService";
import { getUIMessageText, isWebSearchToolPart } from "@/lib/message-utils";
import type { CompareUIMessage } from "@/lib/chat/compareHistory";

type ChatUIMessage = CompareUIMessage;

// Type for chat data from DB
interface ChatData {
  id: string;
  messages: DBMessage[];
  activeLeafMessageId?: string | null;
  activePathMessages?: ChatUIMessage[];
  createdAt: string;
  updatedAt: string;
}

export default function Chat() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const chatId = params?.id as string | undefined;
  const queryClient = useQueryClient();
  const { session, isPending: isSessionLoading, refreshMessageUsage, usageData, user } = useAuth();
  const sessionUpdateRef = useRef(false);
  const modelFromQueryRef = useRef(false);
  
  const { 
    webSearchEnabled, 
    setWebSearchEnabled, 
    webSearchContextSize, 
    setWebSearchContextSize 
  } = useWebSearch();

  const {
    imageGenerationEnabled,
    setImageGenerationEnabled,
    imageGenerationQuality,
    imageGenerationAspectRatio,
    imageGenerationOutputFormat,
    imageGenerationModel,
  } = useImageGeneration();
  
  const { mcpServersForApi } = useMCP();
  
  const { selectedModel, setSelectedModel } = useModel();
  const { compareModeEnabled, compareModels } = useCompare();
  const compareSubmitRef = useRef({ compareModeEnabled: false, compareModels: [] as string[] });
  compareSubmitRef.current = { compareModeEnabled, compareModels };
  const shouldSubmitCompare = () =>
    compareSubmitRef.current.compareModeEnabled &&
    compareSubmitRef.current.compareModels.length >= MIN_COMPARE_MODELS;
  const { canUseModelAtCreditCost } = useCredits(undefined, user?.id);
  const { activePreset } = usePresets();
  const [showWelcomeScreen, setShowWelcomeScreen] = useLocalStorage(STORAGE_KEYS.SHOW_WELCOME_SCREEN, true);
  const [showSuggestedPrompts] = useLocalStorage(STORAGE_KEYS.SHOW_SUGGESTED_PROMPTS, true);
  const [userId, setUserId] = useState<string | null>(null);
  const [generatedChatId, setGeneratedChatId] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileAttachment[]>([]);
  const [hideImagesInUI, setHideImagesInUI] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [accessGateDialogOpen, setAccessGateDialogOpen] = useState(false);
  const [accessGateReason, setAccessGateReason] = useState<'PAYWALL_SUBSCRIPTION_REQUIRED' | 'PAYWALL_BYOK_REQUIRED'>('PAYWALL_SUBSCRIPTION_REQUIRED');
  const [accessGateModelId, setAccessGateModelId] = useState<string>("");
  const compareLoadingRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle model query parameter from URL (e.g., /chat?model=openrouter/model-name)
  useEffect(() => {
    if (isMounted && !modelFromQueryRef.current) {
      const modelParam = searchParams.get('model');
      if (modelParam) {
        // Decode the model ID (handles URL encoding like %3A for :)
        const decodedModelId = decodeURIComponent(modelParam);
        setSelectedModel(decodedModelId);
        modelFromQueryRef.current = true;
        
        // Clean up the query parameter from URL after setting the model
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete('model');
        const newQuery = newSearchParams.toString();
        const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
        router.replace(newUrl, { scroll: false });
      }
    }
  }, [isMounted, searchParams, setSelectedModel, router]);

  useEffect(() => {
    if (isMounted && !isSessionLoading && !sessionUpdateRef.current) {
      sessionUpdateRef.current = true;
      if (session?.user?.id) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
      // Reset after a brief delay to allow for proper session handling
      setTimeout(() => {
        sessionUpdateRef.current = false;
      }, 50);
    }
  }, [isMounted, isSessionLoading, session]);
  
  useEffect(() => {
    // Only redirect if we're sure the session is actually gone and not just loading
    if (isMounted && !isSessionLoading && !session && chatId && params?.id && !sessionUpdateRef.current) {
      console.log("User logged out while on chat page, redirecting to home.");
      toast.info("You have been logged out.");
      router.push('/chat'); 
    }
  }, [isMounted, session, isSessionLoading, chatId, router, params]);
  
  useEffect(() => {
    if (!chatId) {
      setGeneratedChatId(nanoid());
    }
  }, [chatId]);

  const activeChatId = chatId || generatedChatId;

  // Reset UI state when navigating to a new chat
  useEffect(() => {
    if (!chatId) {
      setHideImagesInUI(false);
      setSelectedFiles([]);
    }
  }, [chatId]);

  const { data: chatData, isLoading: isLoadingChat } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async ({ queryKey }) => {
      const [_, chatId] = queryKey;
      if (!chatId) return null;
      
      try {
        const response = await fetch(`/api/chats/${chatId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load chat');
        }
        
        const data = await response.json();
        return data as ChatData;
      } catch (error) {
        console.error('Error loading chat history:', error);
        toast.error('Failed to load chat history');
        throw error;
      }
    },
    enabled: 
      !!chatId && 
      !(isMounted && !isSessionLoading && !session && chatId && params?.id),
    retry: 1,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });
  
  const { allGraphMessages, initialMessages } = useChatDisplayMessages(chatData);

  const [input, setInput] = useState("");
  const [quotedText, setQuotedText] = useState<string | null>(null);

  const getClientApiKeys = useCallback(() => {
    if (!isLocalStorageAvailable()) return {};

    const apiKeys: Record<string, string> = {};
    const keyNames = [
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'GROQ_API_KEY',
      'XAI_API_KEY',
      'OPENROUTER_API_KEY',
      'REQUESTY_API_KEY'
    ];

    keyNames.forEach(keyName => {
      const value = getLocalStorageItem(keyName);
      if (value) {
        apiKeys[keyName] = value;
      }
    });

    return apiKeys;
  }, []);

  const effectiveModel = activePreset?.modelId || selectedModel;
  const { models } = useModels();
  const modelSupportsVision = useMemo(() => {
    const modelInfo = models.find(model => model.id === effectiveModel);
    return modelInfo?.vision === true;
  }, [models, effectiveModel]);

  const billingEnforced =
    process.env.NEXT_PUBLIC_BILLING_ENFORCED === 'true' ||
    process.env.BILLING_ENFORCED === 'true';

  const openAccessGateDialog = useCallback((
    reason: 'PAYWALL_SUBSCRIPTION_REQUIRED' | 'PAYWALL_BYOK_REQUIRED',
    modelId: string
  ) => {
    setAccessGateReason(reason);
    setAccessGateModelId(modelId);
    setAccessGateDialogOpen(true);
  }, []);

  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
    setUploadErrors([]);
  }, []);

  const {
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
    isRecovering,
    resetRecovery,
    lastToastId,
  } = useChatSession({
    chatId,
    generatedChatId,
    initialMessages,
    isLoadingChat,
    isCompareLoadingRef: compareLoadingRef,
    activeLeafMessageId: chatData?.activeLeafMessageId,
    activePresetModelId: activePreset?.modelId,
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
    regenerateSessionId: () => setGeneratedChatId(nanoid()),
  });

  const compareOrchestrator = useCompareOrchestrator({
    chatId: chatId || generatedChatId,
    messages: messages as ChatUIMessage[],
    setMessages: setMessages as React.Dispatch<React.SetStateAction<ChatUIMessage[]>>,
    getApiKeys: getClientApiKeys,
    canUseModelAtCreditCost,
    queryClient,
  });

  const {
    submit: submitCompare,
    stop: stopCompare,
    isCompareLoading,
    promoteModel: promoteCompareModel,
  } = compareOrchestrator;

  // Only treat a turn as live compare UI when the user message still has a
  // comparisonTurnId. Orphan assistant-only comparison metadata (partial promote)
  // must use the normal Messages UI so branch actions stay available.
  const hasComparisonMessages = useMemo(
    () =>
      messages.some(
        (m) => m.role === "user" && Boolean((m as ChatUIMessage).comparisonTurnId)
      ),
    [messages]
  );

  useEffect(() => {
    compareLoadingRef.current = isCompareLoading;
  }, [isCompareLoading]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const stop = useCallback(async () => {
    if (isCompareLoading) {
      await stopCompare();
      return;
    }
    await stopStreaming();
  }, [isCompareLoading, stopCompare, stopStreaming]);

  const handleFormSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Don't submit if no content and no files
    if (!input.trim() && selectedFiles.length === 0 && !quotedText) {
      return;
    }

    // Don't submit if already uploading
    if (isUploadingFiles) {
      return;
    }

    if (shouldSubmitCompare()) {
      if (selectedFiles.length > 0) {
        toast.error('File attachments are not supported in compare mode.');
        return;
      }
      const draftInput = input.trim();
      if (!draftInput && !quotedText) {
        return;
      }
      const messageContent = quotedText
        ? formatQuotedMessageContent(quotedText, draftInput)
        : draftInput;
      const { compareModels: activeCompareModels } = compareSubmitRef.current;
      lastSubmittedDraftRef.current = draftInput;
      setInput('');
      const ok = await submitCompare(messageContent, activeCompareModels);
      if (ok) {
        setQuotedText(null);
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        queryClient.invalidateQueries({ queryKey: ['chat', chatId || generatedChatId] });
        if (!chatId && generatedChatId && window.location.pathname !== `/chat/${generatedChatId}`) {
          router.push(`/chat/${generatedChatId}`, { scroll: false });
        }
      } else if (lastSubmittedDraftRef.current !== null) {
        setInput(lastSubmittedDraftRef.current);
        lastSubmittedDraftRef.current = null;
      }
      return;
    }

    // Conversion funnel pre-check: block with actionable UI before server returns a paywall error.
    const effectiveSelectedModel = activePreset?.modelId || selectedModel;
    const hasPaidSubscription = Boolean(
      usageData?.subscriptionType === 'monthly' ||
      usageData?.subscriptionType === 'yearly' ||
      user?.hasSubscription
    );
    const hasByokForSelectedModel = hasProviderByokForModel(effectiveSelectedModel, getClientApiKeys());

    if (billingEnforced && !hasPaidSubscription && !hasByokForSelectedModel) {
      openAccessGateDialog(
        session?.user?.isAnonymous ? 'PAYWALL_SUBSCRIPTION_REQUIRED' : 'PAYWALL_BYOK_REQUIRED',
        effectiveSelectedModel
      );
      return;
    }
    
    // Separate images from other files
    const imageFiles = selectedFiles.filter(f => f.type === 'image' && f.dataUrl);
    const nonImageFiles = selectedFiles.filter(f => f.type !== 'image' || !f.dataUrl);

    // Images require a vision-capable model. Non-image files can still be submitted.
    if (imageFiles.length > 0 && !modelSupportsVision) {
      toast.error('The selected model does not support images. Remove image files or switch to a vision model.');
      return;
    }

    const draftInput = input;
    lastSubmittedDraftRef.current = draftInput;
    setInput('');

    // Hide files from UI immediately when form is submitted
    if (selectedFiles.length > 0) {
      setHideImagesInUI(true);
    }

    const restoreDraftAfterFailedSubmit = () => {
      setInput(draftInput);
      lastSubmittedDraftRef.current = null;
    };

    // Upload non-image files first
    let uploadedFiles: Array<{ filepath: string; url: string; filename: string }> = [];
    if (nonImageFiles.length > 0) {
      setIsUploadingFiles(true);
      setUploadErrors([]);

      try {
        const formData = new FormData();
        nonImageFiles.forEach(f => {
          if (f.file) {
            formData.append('files', f.file);
          }
        });

        const response = await fetch('/api/upload-files', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!result.success || result.errors?.length > 0) {
          setUploadErrors(result.errors || ['Upload failed']);
          setHideImagesInUI(false);
          setIsUploadingFiles(false);
          restoreDraftAfterFailedSubmit();
          toast.error('Failed to upload files: ' + (result.errors?.join(', ') || 'Unknown error'));
          return;
        }

        uploadedFiles = result.files || [];
      } catch (error) {
        console.error('[Chat] Error uploading files:', error);
        setUploadErrors(['Network error during upload']);
        setHideImagesInUI(false);
        setIsUploadingFiles(false);
        restoreDraftAfterFailedSubmit();
        toast.error('Failed to upload files. Please try again.');
        return;
      }

      setIsUploadingFiles(false);
    }

    // Build enhanced message content with file context
    let messageContent = quotedText
      ? formatQuotedMessageContent(quotedText, draftInput)
      : draftInput;
    if (uploadedFiles.length > 0) {
      const fileList = uploadedFiles
        .map(f => `- ${f.filename} | filepath: ${f.filepath} | url: ${f.url}`)
        .join('\n');
      messageContent = `${messageContent}\n\n[Attached files:]\n${fileList}\n\n[Instruction: Use the read_file tool with filepath values before answering.]`;
    }

    try {
      if (imageFiles.length > 0) {
        const textPart = { type: 'text' as const, text: messageContent };
        const imageParts = imageFiles.map((file) => ({
          type: 'image_url' as const,
          image_url: {
            url: file.dataUrl!,
            detail: file.detail as 'auto' | 'low' | 'high'
          },
          metadata: {
            filename: file.metadata.filename,
            mimeType: file.metadata.mimeType,
            size: file.metadata.size,
            width: file.metadata.width,
            height: file.metadata.height
          }
        }));

        await sendMessage({
          role: 'user',
          parts: [textPart, ...imageParts] as ChatUIMessage['parts'],
        });
      } else {
        await sendMessage({ text: messageContent });
      }
      setQuotedText(null);
    } catch (error) {
      restoreDraftAfterFailedSubmit();
      setHideImagesInUI(false);
      console.error('[Chat] Error sending message:', error);
    }
  }, [
    sendMessage,
    input,
    quotedText,
    selectedFiles,
    isUploadingFiles,
    modelSupportsVision,
    activePreset?.modelId,
    selectedModel,
    usageData?.subscriptionType,
    user?.hasSubscription,
    billingEnforced,
    session?.user?.isAnonymous,
    openAccessGateDialog,
    submitCompare,
    queryClient,
    chatId,
    generatedChatId,
    router,
  ]);

  const isLoading = ((status === "streaming" || status === "submitted") && !isRecovering) || isCompareLoading || isLoadingChat || isUploadingFiles;

  // Function to send a message from suggested prompts
  const sendSuggestedMessage = useCallback((message: string) => {
    void sendMessage({ text: message });
  }, [sendMessage]);

  const isOpenRouterModel = effectiveModel.startsWith("openrouter/");

  // Enhance messages with hasWebSearch only from server/tool evidence (not toggle alone).
  // Client-side "toggle was on" used to force true and show a fake completed search card.
  const enhancedMessages = useMemo(() => {
    return messages.map((message) => {
      const hasWebSearchFromParts = message.parts?.some((part) =>
        isWebSearchToolPart(part as UIMessage['parts'][number])
      );

      return {
        ...message,
        hasWebSearch:
          (message as ChatUIMessage).hasWebSearch === true || hasWebSearchFromParts === true,
      } as ChatUIMessage;
    });
  }, [messages]);

  const branchActionsDisabled =
    status === "streaming" || status === "submitted" || isCompareLoading;

  const {
    getVersionInfo,
    selectSibling,
    regenerate,
    editResubmit,
    forkChat,
  } = useConversationBranches({
    chatId: activeChatId ?? undefined,
    messages: enhancedMessages,
    allMessages: allGraphMessages.length > 0 ? allGraphMessages : enhancedMessages,
    activeLeafMessageId: chatData?.activeLeafMessageId ?? null,
    setMessages: setMessages as (messages: ChatUIMessage[]) => void,
    isStreaming: branchActionsDisabled,
    onForkNavigate: (newChatId) => {
      router.push(`/chat/${newChatId}`);
    },
  });

  const sendWithOperation = useCallback(
    async (operation: ChatOperation, nextMessages: ChatUIMessage[]) => {
      pendingOperationRef.current = operation;
      setMessages(nextMessages as Parameters<typeof setMessages>[0]);

      const targetAssistantId = [...nextMessages]
        .reverse()
        .find((message) => message.role === "assistant")?.id;

      try {
        if (targetAssistantId) {
          await regenerateResponse({ messageId: targetAssistantId });
        } else {
          await sendMessage();
        }
      } finally {
        pendingOperationRef.current = { type: "continue" };
      }
    },
    [regenerateResponse, sendMessage, setMessages]
  );

  const handleRegenerate = useCallback(
    (assistantMessageId: string) => {
      const result = regenerate(assistantMessageId);
      if (!result) return;
      void sendWithOperation(result.operation, result.messages as ChatUIMessage[]);
    },
    [regenerate, sendWithOperation]
  );

  const handleEditResubmit = useCallback(
    (userMessageId: string, content: string) => {
      const result = editResubmit(userMessageId, content);
      if (!result) return;
      void sendWithOperation(result.operation, result.messages as ChatUIMessage[]);
    },
    [editResubmit, sendWithOperation]
  );

  const {
    chatTokenUsage,
    totalInputTokens,
    totalOutputTokens,
    totalTokens,
    totalCreditsConsumed,
    messageCount: chatMessageCount,
    tokenDataError,
    refetchTokenData,
    chatTokenData,
  } = useChatTokenMetrics({
    activeChatId,
    userId,
    messages,
    status,
    timeToFirstToken,
    tokensPerSecond,
    totalDuration,
  });

  const messageMetricsById = useMessageMetrics(chatTokenData, enhancedMessages);

  const chatUsage = useMemo(
    () =>
      activeChatId
        ? {
            totalInputTokens,
            totalOutputTokens,
            totalTokens,
            totalCreditsConsumed,
            messageCount: chatMessageCount,
            error: tokenDataError?.message || null,
            onRefresh: refetchTokenData,
          }
        : null,
    [
      activeChatId,
      totalInputTokens,
      totalOutputTokens,
      totalTokens,
      totalCreditsConsumed,
      chatMessageCount,
      tokenDataError?.message,
      refetchTokenData,
    ]
  );

  // Manual recovery function
  const forceRecovery = useCallback(() => {
    resetRecovery();

    if (!chatId) {
      setGeneratedChatId(nanoid());
    }

    setHideImagesInUI(false);

    if (lastToastId) {
      toast.dismiss(lastToastId);
    }

    toast.success('Chat reset successfully. You can now send new messages.', {
      position: "top-center",
      duration: 3000
    });
  }, [resetRecovery, lastToastId, chatId]);

  // Streaming status component with enhanced timing metrics
  const StreamingStatus = () => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
      if (status !== "streaming" || !streamingStartTime) {
        setElapsed(0);
        return;
      }

      setElapsed(Date.now() - streamingStartTime);

      const interval = setInterval(() => {
        setElapsed(Date.now() - streamingStartTime);
      }, 1000);

      return () => clearInterval(interval);
    }, [status, streamingStartTime]);

    if (status !== "streaming" || !streamingStartTime) return null;

    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formatTime = (ms: number) => {
      if (ms < 1000) {
        return `${ms}ms`;
      }
      return `${(ms / 1000).toFixed(1)}s`;
    };

    const getTimingColor = (ttft: number) => {
      if (ttft < 1000) return "text-green-600 dark:text-green-400";
      if (ttft < 3000) return "text-yellow-600 dark:text-yellow-400";
      return "text-red-600 dark:text-red-400";
    };

    return (
      <div className="flex items-center justify-center py-2">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>
            Generating response... {minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`}
          </span>
          {/* NEW: Show timing metrics during streaming */}
          {timeToFirstToken && (
            <span className={getTimingColor(timeToFirstToken)}>
              • TTFT: {formatTime(timeToFirstToken)}
            </span>
          )}
          {tokensPerSecond && (
            <span>
              • {tokensPerSecond.toFixed(1)}/s
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full min-w-0 flex flex-col justify-between w-full max-w-3xl mx-auto px-4 sm:px-6 md:py-4">
      {/* Error Recovery Banner - Only show if no recent error toast to avoid conflicts */}
      {isRecovering && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-yellow-800 dark:text-yellow-200 text-sm">
                Something went wrong. The chat is being reset automatically...
              </div>
            </div>
            <button
              onClick={forceRecovery}
              className="px-3 py-1 text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors"
            >
              Reset Now
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress Banner */}
      {isUploadingFiles && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            <div className="text-blue-800 dark:text-blue-200 text-sm">
              Uploading files...
            </div>
          </div>
        </div>
      )}

      {/* Upload Errors Banner */}
      {uploadErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="text-red-800 dark:text-red-200 text-sm">
              <strong>Upload failed:</strong> {uploadErrors.join(', ')}
            </div>
            <button
              onClick={() => setUploadErrors([])}
              className="px-3 py-1 text-xs bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded hover:bg-red-300 dark:hover:bg-red-700 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main content area: Either ProjectOverview, minimal empty state, or Messages */}
      <div className="flex-1 min-h-0 min-w-0 pb-2 overflow-hidden flex flex-col">
        {messages.length === 0 && !isLoadingChat ? (
          <>
            {compareModeEnabled && <CompareModeBar />}
            {showWelcomeScreen || showSuggestedPrompts ? (
              <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-3xl mx-auto w-full pt-4 sm:pt-8">
                  <ProjectOverview
                    sendMessage={sendSuggestedMessage}
                    selectedModel={selectedModel}
                    showWelcomeOnboarding={showWelcomeScreen}
                    onShowWelcomeOnboardingChange={setShowWelcomeScreen}
                    showSuggestedPrompts={showSuggestedPrompts}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center px-4">
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Type a message below to get started.
                </p>
              </div>
            )}
          </>
        ) : hasComparisonMessages || compareModeEnabled ? (
          <CompareTimeline
            messages={enhancedMessages as ChatUIMessage[]}
            isLoading={isLoading}
            status={status}
            compareModeEnabled={compareModeEnabled}
            compareModels={compareModels}
            isCompareStreaming={isCompareLoading}
            onPromoteModel={(modelId, comparisonTurnId) => {
              void promoteCompareModel(modelId, comparisonTurnId);
              setSelectedModel(modelId as typeof selectedModel);
            }}
            webSearchEnabled={(activePreset?.webSearchEnabled ?? webSearchEnabled) && isOpenRouterModel}
            imageGenerationEnabled={imageGenerationEnabled && isOpenRouterModel}
            onAddToChat={setQuotedText}
          />
        ) : (
          <Messages
            messages={enhancedMessages}
            isLoading={isLoading}
            status={status}
            chatTokenUsage={chatTokenUsage}
            chatUsage={chatUsage}
            webSearchEnabled={(activePreset?.webSearchEnabled ?? webSearchEnabled) && isOpenRouterModel}
            imageGenerationEnabled={imageGenerationEnabled && isOpenRouterModel}
            onAddToChat={setQuotedText}
            messageMetricsById={messageMetricsById}
            branchActionsDisabled={branchActionsDisabled}
            getBranchVersion={(messageId) => {
              const info = getVersionInfo(messageId);
              return info ? { index: info.index, total: info.total } : null;
            }}
            onSelectBranch={(messageId, direction) => {
              void selectSibling(messageId, direction);
            }}
            onRegenerate={handleRegenerate}
            onEditResubmit={handleEditResubmit}
            onFork={(messageId) => {
              void forkChat(messageId);
            }}
          />
        )}
      </div>

      {/* Streaming Status */}
      <StreamingStatus />

      {/* Input area: Always rendered at the bottom */}
      <div className="mt-2 w-full max-w-3xl mx-auto mb-4 sm:mb-auto shrink-0">
        {/* Conditionally render ProjectOverview above input only when no messages and not loading */}
        {messages.length === 0 && !isLoadingChat && (
          <div className="max-w-3xl mx-auto w-full mb-4 sm:hidden"> {/* Hidden on sm+, shown on mobile */}
            {/* Maybe a condensed overview or nothing here if ProjectOverview is too large */}
          </div>
        )}
        <form onSubmit={handleFormSubmit} className="mt-2">
          <Textarea
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            handleInputChange={handleInputChange}
            input={input}
            isLoading={isLoading}
            status={status}
            stop={stop}
            files={hideImagesInUI ? [] : selectedFiles}
            onFilesChange={setSelectedFiles}
            quotedText={quotedText}
            onClearQuotedText={() => setQuotedText(null)}
            leadingActions={
              chatId && session?.user ? (
                <ChatProjectSelector
                  chatId={chatId}
                  userId={userId ?? session.user.id}
                />
              ) : null
            }
          />
        </form>
      </div>

      <Dialog open={accessGateDialogOpen} onOpenChange={setAccessGateDialogOpen}>
        <DialogContent className="overflow-hidden border-primary/30 p-0 sm:max-w-[560px]">
          <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 pb-4">
            <div className="mb-2 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Subscription or BYOK required
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl">Unlock chat access</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Start a plan for ChatLima credits and tools, or connect your own provider API key.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-6 pb-6">
            <div className="rounded-lg border border-border bg-card p-4 text-sm">
              <p className="font-medium text-foreground">Selected model</p>
              <p className="mt-1 break-all text-muted-foreground">
                {accessGateModelId || "Current model"}
              </p>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
              <p className="font-medium text-foreground">Why you are seeing this</p>
            {accessGateReason === 'PAYWALL_BYOK_REQUIRED' ? (
              <p className="mt-1 text-muted-foreground">
                This model needs either an active plan or a BYOK key for the matching provider.
              </p>
            ) : (
              <p className="mt-1 text-muted-foreground">
                Sign in and pick a plan to continue chatting with this model.
              </p>
            )}
            </div>

            <div className="grid gap-2 rounded-lg border bg-muted/30 p-4 text-sm text-foreground">
              <p className="font-medium">What you get with a plan</p>
              <p className="flex items-center text-muted-foreground">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <MessageSquare className="mr-1.5 h-4 w-4" />
                Monthly or yearly credits from Polar. Message cost varies by model.
              </p>
              <p className="flex items-center text-muted-foreground">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <Sparkles className="mr-1.5 h-4 w-4" />
                Full model catalog with credit-based usage
              </p>
              <p className="flex items-center text-muted-foreground">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <Search className="mr-1.5 h-4 w-4" />
                Web search and advanced tools
              </p>
            </div>

            <DialogFooter className="mt-1 flex flex-col items-center justify-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
              <Button
                type="button"
                className="w-full max-w-xs sm:w-auto sm:min-w-[220px]"
                onClick={() => {
                  setAccessGateDialogOpen(false);
                  router.push('/upgrade');
                }}
              >
                See plans from $9/month
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full max-w-xs sm:w-auto sm:min-w-[220px]"
                onClick={() => {
                  setAccessGateDialogOpen(false);
                  router.push('/faq#byok-api-keys');
                }}
              >
                Connect BYOK key
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
