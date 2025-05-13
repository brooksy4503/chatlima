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
    } as Message));
  }, [chatData]);
  
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
        }
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
        try {
          // Attempt to parse the error message as JSON, assuming the API error response body might be stringified here
          const parsedError = JSON.parse(error.message);
          // If parsing is successful and a specific message exists in the parsed object, use it
          if (parsedError && typeof parsedError.message === 'string' && parsedError.message.length > 0) {
            errorMessage = parsedError.message;
          } else if (error.message.length > 0) {
            // Fallback to the original error message if parsing fails or doesn't yield a message field
            errorMessage = error.message;
          }
        } catch (e) {
          // If parsing fails, check if the original error message is non-empty
          if (error.message && error.message.length > 0) {
            errorMessage = error.message;
          }
        }
        toast.error(
          errorMessage,
          { position: "top-center", richColors: true },
        );
      },
    });
    
  const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    handleSubmit(e);
  }, [handleSubmit]);

  const isLoading = status === "streaming" || status === "submitted" || isLoadingChat;

  const isOpenRouterModel = selectedModel.startsWith("openrouter/");

  return (
    <div className="h-dvh flex flex-col justify-between w-full max-w-3xl mx-auto px-4 sm:px-6 md:py-4">
      {/* Main content area: Either ProjectOverview or Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-2">
        {messages.length === 0 && !isLoadingChat ? (
          <div className="max-w-xl mx-auto w-full pt-4 sm:pt-8">
            <ProjectOverview />
          </div>
        ) : (
          <Messages messages={messages} isLoading={isLoading} status={status} />
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
