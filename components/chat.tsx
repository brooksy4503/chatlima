"use client";

import { defaultModel, type modelID, MODELS } from "@/ai/providers";
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

  const { messages, input, handleInputChange, handleSubmit, status, stop } =
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
        apiKeys: getClientApiKeys()
      },
      experimental_throttle: 500,
      onFinish: (message) => {
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

        // Log the detailed error for debugging
        console.error(`Chat Error [Code: ${errorCode}]: ${errorMessage}`, { details: errorDetails, originalError: error });

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
            // For UNKNOWN_ERROR or other unhandled codes, use the errorMessage as is (or a generic one)
            if (!errorMessage || errorMessage === "An error occurred, please try again later.") {
                toastMessage = "An unexpected issue occurred. Please try again.";
            }
            break;
        }

        toast.error(
          toastMessage,
          { 
            position: "top-center", 
            richColors: true,
            description: errorCode !== "UNKNOWN_ERROR" && errorMessage !== toastMessage ? errorMessage : undefined,
            duration: 8000 // Longer duration for errors
          }
        );
      },
    });
    
  const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    handleSubmit(e);
  }, [handleSubmit]);

  const isLoading = status === "streaming" || status === "submitted" || isLoadingChat;

  const isOpenRouterModel = selectedModel.startsWith("openrouter/");

  // Enhance messages with hasWebSearch property for assistant messages when web search was enabled
  const enhancedMessages = useMemo(() => {
    return messages.map((message, index) => {
      // Check if this is an assistant message and if web search was enabled for the preceding user message
      if (message.role === 'assistant' && index > 0) {
        const previousMessage = messages[index - 1];
        // If the previous message was from user and web search was enabled, mark this assistant message
        if (previousMessage.role === 'user' && webSearchEnabled && isOpenRouterModel) {
          return {
            ...message,
            hasWebSearch: true
          } as Message & { hasWebSearch?: boolean };
        }
      }
      return {
        ...message,
        hasWebSearch: (message as any).hasWebSearch || false
      } as Message & { hasWebSearch?: boolean };
    });
  }, [messages, webSearchEnabled, isOpenRouterModel]);

  return (
    <div className="h-dvh flex flex-col justify-between w-full max-w-3xl mx-auto px-4 sm:px-6 md:py-4">
      {/* Main content area: Either ProjectOverview or Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-2">
        {messages.length === 0 && !isLoadingChat ? (
          <div className="max-w-xl mx-auto w-full pt-4 sm:pt-8">
            <ProjectOverview />
          </div>
        ) : (
          <Messages messages={enhancedMessages} isLoading={isLoading} status={status} />
        )}
      </div>

      {/* Input area: Always rendered at the bottom */}
      <div className="mt-2 w-full mx-auto mb-4 sm:mb-auto shrink-0">
        {/* Conditionally render ProjectOverview above input only when no messages and not loading */}
        {messages.length === 0 && !isLoadingChat && (
          <div className="max-w-xl mx-auto w-full mb-4 sm:hidden"> {/* Hidden on sm+, shown on mobile */}
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
          />
        </form>
      </div>
    </div>
  );
}
