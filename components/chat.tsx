"use client";

import { type modelID } from "@/ai/providers";
import { Message, useChat } from "@ai-sdk/react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Textarea } from "./textarea";
import { ProjectOverview } from "./project-overview";
import { Messages } from "./messages";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { convertToUIMessages } from "@/lib/chat-store";
import { type Message as DBMessage } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { useModel } from "@/lib/context/model-context";
import { usePresets } from "@/lib/context/preset-context";
import { useMCP } from "@/lib/context/mcp-context";
import { useAuth } from "@/hooks/useAuth";
import { MCPServerManager } from "./mcp-server-manager";
import { useWebSearch } from "@/lib/context/web-search-context";
import { ErrorBoundary } from "./error-boundary";
import { useCredits } from "@/hooks/useCredits";
import type { ImageAttachment } from "@/lib/types";
import { useModels } from "@/hooks/use-models";
import { ChatTokenSummary } from "./token-metrics/ChatTokenSummary";

// Type for chat data from DB
interface ChatData {
  id: string;
  messages: DBMessage[];
  createdAt: string;
  updatedAt: string;
}

export default function Chat() {
  const router = useRouter();
  const params = useParams();
  const chatId = params?.id as string | undefined;
  const queryClient = useQueryClient();
  const { session, isPending: isSessionLoading } = useAuth();
  const sessionUpdateRef = useRef(false);
  
  const { 
    webSearchEnabled, 
    setWebSearchEnabled, 
    webSearchContextSize, 
    setWebSearchContextSize 
  } = useWebSearch();
  
  const { mcpServersForApi } = useMCP();
  
  const { selectedModel, setSelectedModel } = useModel();
  const { activePreset } = usePresets();
  const [userId, setUserId] = useState<string | null>(null);
  const [generatedChatId, setGeneratedChatId] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageAttachment[]>([]);
  const [hideImagesInUI, setHideImagesInUI] = useState(false);
  const [isErrorRecoveryNeeded, setIsErrorRecoveryNeeded] = useState(false);
  const [lastErrorTime, setLastErrorTime] = useState<number | null>(null);
  const [lastStreamingActivity, setLastStreamingActivity] = useState<number | null>(null);
  const [streamingStartTime, setStreamingStartTime] = useState<number | null>(null);
  const [lastToastId, setLastToastId] = useState<string | null>(null);
  const [lastErrorMessage, setLastErrorMessage] = useState<string>("");
  const [lastToastTimestamp, setLastToastTimestamp] = useState<number>(0);
  // NEW: Enhanced timing tracking for Phase 2
  const [timeToFirstToken, setTimeToFirstToken] = useState<number | null>(null);
  const [tokensPerSecond, setTokensPerSecond] = useState<number | null>(null);
  const [totalDuration, setTotalDuration] = useState<number | null>(null);
  
  // Token usage state
  const [chatTokenUsage, setChatTokenUsage] = useState<{
    inputTokens?: number;
    outputTokens?: number;
    estimatedCost?: number;
    currency?: string;
    // NEW: Enhanced timing metrics for Phase 2
    timeToFirstToken?: number;
    tokensPerSecond?: number;
    totalDuration?: number;
  }>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      router.push('/'); 
    }
  }, [isMounted, session, isSessionLoading, chatId, router, params]);
  
  useEffect(() => {
    if (!chatId) {
      setGeneratedChatId(nanoid());
    }
  }, [chatId]);

  // Reset error state when navigating to a new chat
  useEffect(() => {
    if (!chatId) {
      // Reset any error recovery state when starting fresh
      setIsErrorRecoveryNeeded(false);
      setLastErrorTime(null);
      setHideImagesInUI(false);
      setSelectedImages([]);
      
      // Clear any lingering toast state
      if (lastToastId) {
        toast.dismiss(lastToastId);
        setLastToastId(null);
      }
      setLastErrorMessage("");
      setLastToastTimestamp(0);
      
      // Reset streaming state
      setStreamingStartTime(null);
      setLastStreamingActivity(null);
    }
  }, [chatId, lastToastId]);

  // Error recovery mechanism - reset chat state when errors occur
  // Note: This will be moved after the useChat hook is defined
  
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
  
  const initialMessages = useMemo(() => {
    if (!chatData || !chatData.messages || chatData.messages.length === 0) {
      return [];
    }
    
    const uiMessages = convertToUIMessages(chatData.messages);
    return uiMessages.map(msg => ({
      id: msg.id,
      role: msg.role as Message['role'],
      content: msg.content,
      parts: msg.parts,
      hasWebSearch: msg.hasWebSearch,
    } as Message & { hasWebSearch?: boolean }));
  }, [chatData]);
  
  // Function to get API keys from localStorage
  const getClientApiKeys = () => {
    if (typeof window === 'undefined') return {};
    
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
      const value = localStorage.getItem(keyName);
      if (value) {
        apiKeys[keyName] = value;
      }
    });
    
    return apiKeys;
  };

  // Check if current model supports vision/images - use preset model if active
  const effectiveModel = activePreset?.modelId || selectedModel;
  const { models } = useModels();
  const modelSupportsVision = useMemo(() => {
    const modelInfo = models.find(model => model.id === effectiveModel);
    return modelInfo?.vision === true;
  }, [models, effectiveModel]);

  // Handle image selection
  const handleImageSelect = useCallback((newImages: ImageAttachment[]) => {
    console.log('[DEBUG] handleImageSelect called with:', newImages.length, 'images');
    console.log('[DEBUG] New images details:', newImages.map(img => ({
      filename: img.metadata.filename,
      size: img.metadata.size,
      mimeType: img.metadata.mimeType,
      detail: img.detail,
      dataUrlLength: img.dataUrl.length
    })));
    
    setSelectedImages(prev => {
      const updated = [...prev, ...newImages];
      console.log('[DEBUG] Updated selectedImages count:', updated.length);
      return updated;
    });
  }, []);

  // Handle image removal
  const handleImageRemove = useCallback((index: number) => {
    console.log('[DEBUG] handleImageRemove called for index:', index);
    setSelectedImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      console.log('[DEBUG] After removal, selectedImages count:', updated.length);
      return updated;
    });
  }, []);

  // Clear images after successful submission
  const clearImages = useCallback(() => {
    console.log('[DEBUG] clearImages called');
    setSelectedImages([]);
  }, []);

  // Note: No longer creating attachments array since we use message parts directly

  const { messages, input, handleInputChange, handleSubmit, append, status, stop: originalStop } =
    useChat({
      id: chatId || generatedChatId,
      initialMessages,
      maxSteps: 20,
      body: {
        selectedModel: activePreset?.modelId || selectedModel,
        mcpServers: mcpServersForApi,
        chatId: chatId || generatedChatId,
        webSearch: {
          enabled: activePreset?.webSearchEnabled ?? webSearchEnabled,
          contextSize: activePreset?.webSearchContextSize || webSearchContextSize,
        },
        apiKeys: getClientApiKeys(),
        // Only send attachments for text-only messages (handleSubmit)
        // Don't send when using append() since images are already in message parts
        attachments: [],
        // Include preset parameters
        temperature: activePreset?.temperature,
        maxTokens: activePreset?.maxTokens,
        systemInstruction: activePreset?.systemInstruction
      },
      experimental_throttle: 500,
      onFinish: (message) => {
        // Clear images and reset UI state after successful submission
        clearImages();
        setHideImagesInUI(false);
        
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        queryClient.invalidateQueries({ queryKey: ['chat', chatId || generatedChatId] });
        if (!chatId && generatedChatId) {
          if (window.location.pathname !== `/chat/${generatedChatId}`) {
             router.push(`/chat/${generatedChatId}`, { scroll: false }); 
          }
        }
      },
      onError: (error) => {
        let errorMessage = "An error occurred, please try again later."; // Default message
        let errorCode = "UNKNOWN_ERROR";
        let errorDetails: any = "No additional details available.";

        try {
          // The error.message from the Vercel AI SDK is now expected to be a JSON string.
          const parsedBody = JSON.parse(error.message);

          // Check for the structure from getErrorMessage (nested error object)
          if (parsedBody.error && typeof parsedBody.error === 'object' && parsedBody.error.code) {
            const apiErrorObject = parsedBody.error;
            errorMessage = apiErrorObject.message || errorMessage;
            errorCode = apiErrorObject.code || errorCode;
            errorDetails = apiErrorObject.details || errorDetails;
          } 
          // Check for the flatter structure (e.g., from direct 429 response)
          else if (typeof parsedBody.error === 'string' && parsedBody.message) {
            errorMessage = parsedBody.message; // Use the detailed message from the API
            if (parsedBody.error === "Message limit reached") {
              errorCode = "MESSAGE_LIMIT_REACHED";
              // Optionally, capture other details like limit and remaining
              const details: any = {};
              if (typeof parsedBody.limit !== 'undefined') details.limit = parsedBody.limit;
              if (typeof parsedBody.remaining !== 'undefined') details.remaining = parsedBody.remaining;
              if (Object.keys(details).length > 0) errorDetails = JSON.stringify(details);

            } else {
              // For other flat errors, we might not have a specific code yet
              // but we have the detailed message.
              // errorCode remains UNKNOWN_ERROR or could be set to a generic API_ERROR
            }
          }
          // Fallback for other JSON structures or if parsing was incomplete
          else if (parsedBody.message) {
            errorMessage = parsedBody.message;
          }
           else {
            // If parsing was successful but structure is unrecognized
            // and errorMessage hasn't been updated from a recognized structure.
             if (error.message && error.message.length > 0 && errorMessage === "An error occurred, please try again later.") {
                 errorMessage = error.message; // use raw JSON string if no better message found
            }
            console.warn("Received JSON error message with unrecognized structure:", error.message);
          }
        } catch (e) {
          // If parsing fails, it means error.message was not a JSON string.
          // Use the raw error.message if available.
          if (error.message && error.message.length > 0) {
            errorMessage = error.message;
          }
          console.warn("Failed to parse error message as JSON:", e, "Raw error message:", error.message);
        }

        // Reset UI state on error so images reappear
        setHideImagesInUI(false);

        // Force reset the chat state to allow new messages
        setIsErrorRecoveryNeeded(true);
        setLastErrorTime(Date.now());

        // Log the detailed error for debugging
        console.error(`Chat Error [Code: ${errorCode}]: ${errorMessage}`, { 
          details: errorDetails, 
          originalError: error,
          parsedError: (() => {
            try {
              return JSON.parse(error.message);
            } catch {
              return null;
            }
          })()
        });
        console.log(`[Toast Debug] Error handler triggered with message: "${errorMessage}"`);
        console.log(`[Toast Debug] Previous message: "${lastErrorMessage}", Time since last: ${Date.now() - lastToastTimestamp}ms`);

        // Display user-friendly toast messages based on error code
        let toastMessage = errorMessage;
        switch (errorCode) {
          case "AUTHENTICATION_REQUIRED":
            toastMessage = "Authentication required. Please log in to continue.";
            // Optionally, redirect to login or prompt user
            // router.push('/login'); 
            break;
          case "MESSAGE_LIMIT_REACHED":
            // The message from the backend (now correctly assigned to errorMessage) is descriptive.
            // toastMessage will use this errorMessage.
            break;
          case "INSUFFICIENT_CREDITS":
            toastMessage = "You have insufficient credits. Please top up your account.";
            break;
          case "RATE_LIMIT_EXCEEDED":
            toastMessage = "Too many requests. Please wait a moment and try again.";
            break;
          case "LLM_PROVIDER_ERROR":
            toastMessage = "The AI model provider is experiencing issues. Please try a different model or try again later.";
            break;
          case "MODEL_INIT_FAILED":
            toastMessage = "Failed to initialize the selected AI model. Please try another model.";
            break;
          case "STREAM_ERROR": // Generic stream error from backend
            // Try to provide more specific error message from details if available
            if (typeof errorDetails === 'object' && errorDetails !== null && 
                (errorDetails.rawMessage || errorDetails.cause)) {
              const detailMsg = errorDetails.rawMessage || errorDetails.cause;
              toastMessage = `Error: ${detailMsg}`;
            } else if (errorMessage && errorMessage !== "An error occurred while processing your request.") {
              toastMessage = errorMessage; // Use the specific error message from the API
            } else {
              toastMessage = "A problem occurred while getting the response. Please try again.";
            }
            break;
          // Add more cases as new error codes are defined in the backend
          default:
            // Check for specific model compatibility errors
            if (errorMessage.includes("does not currently support") && 
                (errorMessage.includes("tool_choice") || errorMessage.includes("tools"))) {
              toastMessage = "This model doesn't support the advanced features required for this request. Please try a different model.";
            }
            // For other UNKNOWN_ERROR or unhandled codes, use the errorMessage as is (or a generic one)
            else if (!errorMessage || errorMessage === "An error occurred, please try again later.") {
                toastMessage = "An unexpected issue occurred. Please try again.";
            }
            break;
        }

        // Debounce error toasts to prevent rapid-fire messages
        const now = Date.now();
        const timeSinceLastToast = now - lastToastTimestamp;
        const isSameMessage = toastMessage === lastErrorMessage;
        const tooSoon = timeSinceLastToast < (isSameMessage ? 5000 : 2000); // 5s for same message, 2s for different

        if (tooSoon) {
          console.log(`Suppressing duplicate error toast: "${toastMessage}" (${timeSinceLastToast}ms ago)`);
          return;
        }

        // Dismiss any previous error toasts
        if (lastToastId) {
          toast.dismiss(lastToastId);
        }

        // Show the error toast
        const toastId = toast.error(
          toastMessage,
          { 
            position: "top-center", 
            richColors: true,
            description: errorCode !== "UNKNOWN_ERROR" && errorMessage !== toastMessage ? errorMessage : undefined,
            duration: 8000 // Longer duration for errors
          }
        );
        
        // Update tracking state
        setLastToastId(String(toastId));
        setLastErrorMessage(toastMessage);
        setLastToastTimestamp(now);
      },
    });

  // Custom stop function that handles both stopping the stream and refreshing data
  const stop = useCallback(() => {
    console.log('Stopping stream and refreshing chat data...');
    
    // Call the original stop function to abort the stream
    originalStop();
    
    // Give the server a moment to process the onStop callback and save data
    setTimeout(() => {
      // Refresh the chat data since the server-side onStop handler saves the current state
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chat', chatId || generatedChatId] });
      
      // If this is a new chat that was just created, navigate to it
      if (!chatId && generatedChatId) {
        if (window.location.pathname !== `/chat/${generatedChatId}`) {
           router.push(`/chat/${generatedChatId}`, { scroll: false }); 
        }
      }
    }, 100); // Small delay to ensure server-side processing completes
  }, [originalStop, queryClient, chatId, generatedChatId, router]);

  // Error recovery mechanism - reset chat state when errors occur
  useEffect(() => {
    if (isErrorRecoveryNeeded && lastErrorTime) {
      const resetTimeout = setTimeout(() => {
        // Force stop the current stream/request to reset useChat internal state
        originalStop();
        
        // If we're in a new chat (no chatId), regenerate the chatId to force useChat to reset completely
        if (!chatId) {
          console.log('Regenerating chat ID to ensure fresh useChat state after error');
          setGeneratedChatId(nanoid());
        }
        
        // Reset error recovery state
        setIsErrorRecoveryNeeded(false);
        setLastErrorTime(null);
        
        // Clear any lingering toast IDs and tracking state
        setLastToastId(null);
        setLastErrorMessage("");
        setLastToastTimestamp(0);
        
        console.log('Chat state reset after error - ready for new messages');
      }, 500); // Short delay to allow error handling to complete

      return () => clearTimeout(resetTimeout);
    }
  }, [isErrorRecoveryNeeded, lastErrorTime, originalStop, chatId]);

  // Track streaming start/stop and activity with enhanced timing metrics
  useEffect(() => {
    if (status === "streaming") {
      if (!streamingStartTime) {
        setStreamingStartTime(Date.now());
      }
      
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.content) {
          setLastStreamingActivity(Date.now());
          
          // NEW: Track time to first token when first content appears
          if (timeToFirstToken === null && streamingStartTime) {
            const ttft = Date.now() - streamingStartTime;
            setTimeToFirstToken(ttft);
            console.log(`[Chat] Time to first token: ${ttft}ms`);
          }
        }
      }
    } else {
      // Reset timing metrics when streaming stops
      if (streamingStartTime && status === "ready") {
        const duration = Date.now() - streamingStartTime;
        setTotalDuration(duration);
        console.log(`[Chat] Total duration: ${duration}ms`);
      }
      setStreamingStartTime(null);
      setTimeToFirstToken(null);
      setTokensPerSecond(null);
      setTotalDuration(null);
    }
  }, [status, messages, streamingStartTime, timeToFirstToken]);

  // Intelligent stuck detection: only trigger if no streaming activity for extended period
  useEffect(() => {
    if (status === "streaming" || status === "submitted") {
      // Set initial activity time when streaming starts
      if (!lastStreamingActivity) {
        setLastStreamingActivity(Date.now());
      }

      const stuckTimeout = setTimeout(() => {
        const now = Date.now();
        const timeSinceLastActivity = now - (lastStreamingActivity || now);
        
                 // Only consider stuck if no activity for 2 minutes AND status hasn't changed
         if (timeSinceLastActivity > 120000 && (status === "streaming" || status === "submitted")) {
           console.warn('Chat appears stuck - no streaming activity for 2 minutes');
           
           const stuckMessage = 'Chat appears to be stuck. Attempting to recover...';
           const now = Date.now();
           const timeSinceLastToast = now - lastToastTimestamp;
           const isSameMessage = stuckMessage === lastErrorMessage;
           const tooSoon = timeSinceLastToast < (isSameMessage ? 5000 : 2000);

           if (tooSoon) {
             console.log(`Suppressing duplicate stuck toast: "${stuckMessage}" (${timeSinceLastToast}ms ago)`);
             return;
           }
           
           setIsErrorRecoveryNeeded(true);
           setLastErrorTime(Date.now());
           
           // Dismiss any previous error toasts
           if (lastToastId) {
             toast.dismiss(lastToastId);
           }
           
           const toastId = toast.error(stuckMessage, {
             description: 'No response activity detected for 2 minutes',
             position: "top-center",
             duration: 6000
           });
           
           setLastToastId(String(toastId));
           setLastErrorMessage(stuckMessage);
           setLastToastTimestamp(now);
         }
      }, 120000); // Check every 2 minutes

      return () => clearTimeout(stuckTimeout);
    } else {
      // Reset activity tracking when not streaming
      setLastStreamingActivity(null);
    }
  }, [status, lastStreamingActivity, lastErrorMessage, lastToastId, lastToastTimestamp]);
    
  const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Don't submit if no content and no images
    if (!input.trim() && selectedImages.length === 0) {
      return;
    }
    
    // Hide images from UI immediately when form is submitted
    if (selectedImages.length > 0) {
      setHideImagesInUI(true);
    }
    
    // If we have images, use append to create a message with parts
    if (selectedImages.length > 0) {
      const textPart = { type: 'text' as const, text: input };
      const imageParts = selectedImages.map((img) => ({
        type: 'image_url' as const,
        image_url: {
          url: img.dataUrl,
          detail: img.detail as 'auto' | 'low' | 'high'
        },
        metadata: {
          filename: img.metadata.filename,
          mimeType: img.metadata.mimeType,
          size: img.metadata.size,
          width: img.metadata.width,
          height: img.metadata.height
        }
      }));
      
      // Use append to create message with image parts
      append({
        role: 'user',
        content: input,
        parts: [textPart, ...imageParts] as any
      });
      
      // Clear the input field manually since append doesn't do it automatically
      handleInputChange({ target: { value: '' } } as any);
    } else {
      // No images, use regular handleSubmit
      handleSubmit(e);
    }
  }, [handleSubmit, append, input, selectedImages, handleInputChange]);

  const isLoading = (status === "streaming" || status === "submitted") && !isErrorRecoveryNeeded || isLoadingChat;

  // Function to send a message from suggested prompts
  const sendSuggestedMessage = useCallback((message: string) => {
    append({
      role: 'user',
      content: message
    });
  }, [append]);

  const isOpenRouterModel = effectiveModel.startsWith("openrouter/");

  // Enhance messages with hasWebSearch property for assistant messages when web search was enabled
  const enhancedMessages = useMemo(() => {
    const effectiveWebSearchEnabled = activePreset?.webSearchEnabled ?? webSearchEnabled;
    
    return messages.map((message, index) => {
      let enhancedMessage = { ...message };
      
      // Check if this is an assistant message and if web search was enabled for the preceding user message
      if (message.role === 'assistant' && index > 0) {
        const previousMessage = messages[index - 1];
        // If the previous message was from user and web search was enabled, mark this assistant message
        if (previousMessage.role === 'user' && effectiveWebSearchEnabled && isOpenRouterModel) {
          enhancedMessage = {
            ...enhancedMessage,
            hasWebSearch: true
          } as any;
        }
      }
      
      return {
        ...enhancedMessage,
        hasWebSearch: (enhancedMessage as any).hasWebSearch || false
      } as Message & { hasWebSearch?: boolean };
    });
  }, [messages, webSearchEnabled, activePreset, isOpenRouterModel]);

  // Fetch chat token usage data
  const { data: chatTokenData, isLoading: isTokenDataLoading, error: tokenDataError, refetch: refetchTokenData } = useQuery({
    queryKey: ['chat-token-usage', chatId],
    queryFn: async ({ queryKey }) => {
      const [_, chatId] = queryKey;
      if (!chatId || !userId) return null;
      
      try {
        const response = await fetch(`/api/token-usage?chatId=${chatId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load token usage data');
        }
        
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error('Error loading chat token usage:', error);
        throw error;
      }
    },
    enabled: !!chatId && !!userId,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Update chat token usage when streaming
  useEffect(() => {
    if (status === "streaming" && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        // Simulate real-time token updates during streaming
        // In a real implementation, this would come from the streaming response
        let outputContentLength = 0;
        let inputContentLength = 0;

        // Handle structured content (Google models)
        if (Array.isArray(lastMessage.content)) {
          outputContentLength = lastMessage.content
            .filter((part: any) => part.type === 'text')
            .map((part: any) => part.text)
            .join('').length;
        } else if (typeof lastMessage.content === 'string') {
          outputContentLength = lastMessage.content.length;
        }

        // Handle input message content
        if (messages.length > 1) {
          const inputMessage = messages[messages.length - 2];
          if (Array.isArray(inputMessage.content)) {
            inputContentLength = inputMessage.content
              .filter((part: any) => part.type === 'text')
              .map((part: any) => part.text)
              .join('').length;
          } else if (typeof inputMessage.content === 'string') {
            inputContentLength = inputMessage.content.length;
          }
        }

        const estimatedOutputTokens = Math.floor(outputContentLength / 4); // Rough estimate
        const estimatedInputTokens = Math.floor(inputContentLength / 4);
        
        setChatTokenUsage({
          inputTokens: estimatedInputTokens,
          outputTokens: estimatedOutputTokens,
          estimatedCost: (estimatedInputTokens + estimatedOutputTokens) * 0.000002, // Rough estimate
          currency: 'USD',
          // NEW: Enhanced timing metrics for Phase 2
          timeToFirstToken: timeToFirstToken || undefined,
          tokensPerSecond: tokensPerSecond || undefined,
          totalDuration: totalDuration || undefined
        });
      }
    } else if (status === "ready") {
      if (chatTokenData) {
        // When streaming is complete and we have actual data from the API
        // Handle both old format (totalInputTokens) and new format (totalInputTokens from chat-specific data)
        const inputTokens = chatTokenData.totalInputTokens || chatTokenData.inputTokens || 0;
        const outputTokens = chatTokenData.totalOutputTokens || chatTokenData.outputTokens || 0;
        const estimatedCost = chatTokenData.totalEstimatedCost || chatTokenData.estimatedCost || 0;
        
        setChatTokenUsage({
          inputTokens,
          outputTokens,
          estimatedCost,
          currency: chatTokenData.currency || 'USD',
          // NEW: Enhanced timing metrics for Phase 2
          timeToFirstToken: chatTokenData.avgTimeToFirstToken || timeToFirstToken || undefined,
          tokensPerSecond: chatTokenData.avgTokensPerSecond || tokensPerSecond || undefined,
          totalDuration: chatTokenData.avgTotalDuration || totalDuration || undefined
        });
        
        // Refetch token data to get the latest information
        refetchTokenData();
        
        // Invalidate user token usage queries to refresh sidebar data
        if (userId) {
          queryClient.invalidateQueries({ queryKey: ['user-token-usage', userId] });
        }
      }
      // If chatTokenData is not available yet, keep the estimated values from streaming
    }
  }, [messages, status, chatTokenData, refetchTokenData, userId, queryClient, timeToFirstToken, tokensPerSecond, totalDuration, chatTokenData?.avgTimeToFirstToken, chatTokenData?.avgTokensPerSecond, chatTokenData?.avgTotalDuration]);

  // Manual recovery function
  const forceRecovery = useCallback(() => {
    console.log('Manual recovery triggered by user');
    originalStop();
    
    // If we're in a new chat (no chatId), regenerate the chatId to force useChat to reset completely
    if (!chatId) {
      console.log('Regenerating chat ID to ensure fresh useChat state after manual recovery');
      setGeneratedChatId(nanoid());
    }
    
    setIsErrorRecoveryNeeded(false);
    setLastErrorTime(null);
    setStreamingStartTime(null);
    setLastStreamingActivity(null);
    setHideImagesInUI(false);
    
    // Dismiss any previous error toasts and clear tracking state
    if (lastToastId) {
      toast.dismiss(lastToastId);
      setLastToastId(null);
    }
    setLastErrorMessage("");
    setLastToastTimestamp(0);
    
    toast.success('Chat reset successfully. You can now send new messages.', {
      position: "top-center",
      duration: 3000
    });
  }, [originalStop, lastToastId, chatId]);

  // Streaming status component with enhanced timing metrics
  const StreamingStatus = () => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
      if (status === "streaming" && streamingStartTime) {
        // Set initial elapsed time immediately
        setElapsed(Date.now() - streamingStartTime);
        
        const interval = setInterval(() => {
          setElapsed(Date.now() - streamingStartTime);
        }, 1000);
        return () => clearInterval(interval);
      } else if (status !== "streaming") {
        // Only reset to 0 when not streaming
        setElapsed(0);
      }
    }, [elapsed]);

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
    <div className="h-full flex flex-col justify-between w-full max-w-3xl mx-auto px-4 sm:px-6 md:py-4">
      {/* Error Recovery Banner - Only show if no recent error toast to avoid conflicts */}
      {isErrorRecoveryNeeded && Date.now() - lastToastTimestamp > 1000 && (
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

      {/* Main content area: Either ProjectOverview or Messages */}
      <div className={`flex-1 min-h-0 pb-2 ${messages.length === 0 && !isLoadingChat ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {messages.length === 0 && !isLoadingChat ? (
          <div className="h-full overflow-y-auto no-scrollbar">
            <div className="max-w-3xl mx-auto w-full pt-4 sm:pt-8">
              <ProjectOverview 
                sendMessage={sendSuggestedMessage}
                selectedModel={selectedModel}
              />
            </div>
          </div>
        ) : (
          <Messages
            messages={enhancedMessages}
            isLoading={isLoading}
            status={status}
            chatTokenUsage={chatTokenUsage}
          />
        )}
      </div>

      {/* Token Usage Summary - Only show when not streaming or submitted */}
      {chatId && status === "ready" && (
        <div className="mb-4">
          <ChatTokenSummary
            totalInputTokens={chatTokenData?.totalInputTokens || chatTokenUsage?.inputTokens || 0}
            totalOutputTokens={chatTokenData?.totalOutputTokens || chatTokenUsage?.outputTokens || 0}
            totalTokens={chatTokenData?.totalTokens || (chatTokenUsage?.inputTokens || 0) + (chatTokenUsage?.outputTokens || 0) || 0}
            totalEstimatedCost={chatTokenData?.totalEstimatedCost || chatTokenUsage?.estimatedCost || 0}
            totalActualCost={chatTokenData?.totalActualCost || 0}
            messageCount={messages.length}
            currency={chatTokenData?.currency || chatTokenUsage?.currency || 'USD'}
            isLoading={false}
            error={tokenDataError?.message || null}
            onRefresh={refetchTokenData}
            compact={true}
          />
        </div>
      )}

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
            images={hideImagesInUI ? [] : selectedImages}
            onImagesChange={setSelectedImages}
          />
        </form>
      </div>
    </div>
  );
}
