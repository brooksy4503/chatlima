"use client";

import { defaultModel, type modelID, MODELS, modelDetails } from "@/ai/providers";
import { Message, useChat } from "@ai-sdk/react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Textarea } from "./textarea";
import { ProjectOverview } from "./project-overview";
import { Messages } from "./messages";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { convertToUIMessages } from "@/lib/chat-store";
import { type Message as DBMessage } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { useMCP } from "@/lib/context/mcp-context";
import { useSession } from "@/lib/auth-client";
import { useWebSearch } from "@/lib/context/web-search-context";
import { useModel } from "@/lib/context/model-context";
import type { ImageAttachment } from "@/lib/types";
import { type Preset } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { PresetManager } from "./preset-manager";

// Type for chat data from DB
interface ChatData {
  id: string;
  messages: DBMessage[];
  createdAt: string;
  updatedAt: string;
}

export default function Chat({ presetId }: { presetId: string | null }) {
  const router = useRouter();
  const params = useParams();
  const chatId = params?.id as string | undefined;
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionLoading } = useSession();
  
  const { 
    webSearchEnabled, 
    setWebSearchEnabled, 
    webSearchContextSize, 
    setWebSearchContextSize 
  } = useWebSearch();
  
  const { mcpServersForApi } = useMCP();
  
  const { selectedModel, setSelectedModel } = useModel();
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isSessionLoading) {
      if (session?.user?.id) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    }
  }, [isMounted, isSessionLoading, session]);
  
  useEffect(() => {
    if (isMounted && !isSessionLoading && !session && chatId && params?.id) {
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

  // Check if current model supports vision/images
  const modelSupportsVision = modelDetails[selectedModel]?.vision === true;

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

  // Fetch preset details if presetId is provided
  const { data: presetDetails } = useQuery<Preset | null>({
    queryKey: ["preset", presetId],
    queryFn: async () => {
      if (!presetId) return null;
      const res = await fetch(`/api/presets/${presetId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!presetId,
    staleTime: 1000 * 60 * 10,
  });

  const { messages, input, handleInputChange, handleSubmit, append, status, stop: originalStop } =
    useChat({
      id: chatId || generatedChatId,
      initialMessages,
      maxSteps: 20,
      body: {
        selectedModel,
        mcpServers: mcpServersForApi,
        chatId: chatId || generatedChatId,
        webSearch: {
          enabled: webSearchEnabled,
          contextSize: webSearchContextSize,
        },
        apiKeys: getClientApiKeys(),
        presetId,
        // Always send systemPrompt and temperature if presetDetails are available
        ...(presetDetails ? {
          systemPrompt: presetDetails.systemPrompt,
          temperature: presetDetails.temperature,
        } : {}),
        // Only send attachments for text-only messages (handleSubmit)
        // Don't send when using append() since images are already in message parts
        attachments: []
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
        let errorDetails = "No additional details available.";

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
        console.error(`Chat Error [Code: ${errorCode}]: ${errorMessage}`, { details: errorDetails, originalError: error });
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
            toastMessage = "A problem occurred while getting the response. Please try again.";
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
  }, [isErrorRecoveryNeeded, lastErrorTime, originalStop]);

  // Track streaming start/stop and activity
  useEffect(() => {
    if (status === "streaming") {
      if (!streamingStartTime) {
        setStreamingStartTime(Date.now());
      }
      
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.content) {
          setLastStreamingActivity(Date.now());
        }
      }
    } else {
      setStreamingStartTime(null);
    }
  }, [status, messages, streamingStartTime]);

  // Intelligent stuck detection: only trigger if no activity for extended period
  useEffect(() => {
    if (status === "streaming" || status === "submitted") {
      // Set initial activity time when streaming starts
      if (!lastStreamingActivity) {
        setLastStreamingActivity(Date.now());
      }

      const stuckTimeout = setTimeout(() => {
        const now = Date.now();
        const timeSinceLastActivity = now - (lastStreamingActivity || now);
        
        // Only consider stuck if no activity for 5 minutes AND status hasn't changed
        // Also check if there's any recent message activity to avoid false positives
        const hasRecentMessageActivity = messages.length > 0 && 
          messages[messages.length - 1].role === 'assistant' && 
          messages[messages.length - 1].content && 
          messages[messages.length - 1].content.length > 0;
        
        if (timeSinceLastActivity > 300000 && (status === "streaming" || status === "submitted") && !hasRecentMessageActivity) {
          console.warn('Chat appears stuck - no activity for 5 minutes');
          
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
            description: 'No response activity detected for 5 minutes',
            position: "top-center",
            duration: 6000
          });
          
          setLastToastId(String(toastId));
          setLastErrorMessage(stuckMessage);
          setLastToastTimestamp(now);
        }
      }, 300000); // Check every 5 minutes

      return () => clearTimeout(stuckTimeout);
    } else {
      // Reset activity tracking when not streaming
      setLastStreamingActivity(null);
    }
  }, [status, lastStreamingActivity, messages]);
    
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
  }, [handleSubmit, append, input, selectedImages]);

  const isLoading = (status === "streaming" || status === "submitted") && !isErrorRecoveryNeeded || isLoadingChat;

  const isOpenRouterModel = selectedModel.startsWith("openrouter/");

  // Enhance messages with hasWebSearch property for assistant messages when web search was enabled
  const enhancedMessages = useMemo(() => {
    return messages.map((message, index) => {
      let enhancedMessage = { ...message };
      
      // Check if this is an assistant message and if web search was enabled for the preceding user message
      if (message.role === 'assistant' && index > 0) {
        const previousMessage = messages[index - 1];
        // If the previous message was from user and web search was enabled, mark this assistant message
        if (previousMessage.role === 'user' && webSearchEnabled && isOpenRouterModel) {
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
  }, [messages, webSearchEnabled, isOpenRouterModel]);

  // Manual recovery function
  const forceRecovery = useCallback(() => {
    console.log('Manual recovery triggered by user');
    originalStop();
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
  }, [originalStop, lastToastId]);

  // Streaming status component
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
    }, [status, streamingStartTime]);

    if (status !== "streaming" || !streamingStartTime) return null;

    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

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
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col w-full max-w-3xl mx-auto px-4 sm:px-6 md:py-4">
      <Tabs defaultValue="chat" className="w-full h-full flex flex-col">
        <TabsList className="w-full flex mb-2">
          <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
          <TabsTrigger value="presets" className="flex-1">Presets</TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="flex flex-col flex-1 min-h-0">
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
          <div className="flex-1 min-h-0">
            <div className="h-full overflow-y-auto pb-2">
              {messages.length === 0 && !isLoadingChat ? (
                <div className="max-w-3xl mx-auto w-full pt-4 sm:pt-8">
                  <ProjectOverview />
                </div>
              ) : (
                <Messages messages={enhancedMessages} isLoading={isLoading} status={status} />
              )}
            </div>
          </div>

          {/* Streaming Status */}
          <StreamingStatus />

          {/* Input area: Always rendered at the bottom */}
          <div className="mt-2 w-full max-w-3xl mx-auto mb-4 sm:mb-auto shrink-0 flex flex-col">
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
        </TabsContent>
        <TabsContent value="presets" className="flex-1 min-h-0 p-0 border-0 bg-transparent">
          {/* Preset summary box and PresetManager in the Presets tab */}
          {presetDetails && (
            <div className="mb-4 p-4 rounded-lg border border-primary/20 bg-primary/5 text-xs text-foreground/90">
              <div className="font-semibold text-sm mb-1">Active Preset: {presetDetails.name}</div>
              <div className="flex flex-wrap gap-4 mb-1">
                <div><span className="font-medium">Model:</span> {presetDetails.model}</div>
                <div><span className="font-medium">Temperature:</span> {presetDetails.temperature}</div>
                <div><span className="font-medium">Max Tokens:</span> {presetDetails.maxTokens}</div>
              </div>
              {presetDetails.systemPrompt && (
                <div className="mt-1"><span className="font-medium">System Prompt:</span> <span className="whitespace-pre-line">{presetDetails.systemPrompt}</span></div>
              )}
            </div>
          )}
          <PresetManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
