"use client";

import { defaultModel, type modelID, MODELS } from "@/ai/providers";
import { Message, useChat } from "@ai-sdk/react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Textarea } from "./textarea";
import { ProjectOverview } from "./project-overview";
import { Messages } from "./messages";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { getUserId, updateUserId } from "@/lib/user-id";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { convertToUIMessages } from "@/lib/chat-store";
import { type Message as DBMessage } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { useMCP } from "@/lib/context/mcp-context";
import { useSession } from "@/lib/auth-client";
import { useWebSearch } from "@/lib/context/web-search-context";

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
  
  const [selectedModel, setSelectedModel] = useState<modelID>(defaultModel);
  const [userId, setUserId] = useState<string>('');
  const [generatedChatId, setGeneratedChatId] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const storedModel = localStorage.getItem('selected_ai_model');
      if (storedModel && MODELS.includes(storedModel)) {
        setSelectedModel(storedModel as modelID);
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      setUserId(getUserId());
    }
  }, [isMounted]);
  
  useEffect(() => {
    if (isMounted && !isSessionLoading) {
      if (session?.user?.id) {
        const authenticatedUserId = session.user.id;
        const currentLocalId = getUserId();

        if (currentLocalId && currentLocalId !== authenticatedUserId) {
          console.log(
            `Local user ID (${currentLocalId}) differs from authenticated ID (${authenticatedUserId}). Attempting migration.`,
          );
          fetch('/api/chats/migrate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ localUserId: currentLocalId }),
          })
            .then(async (res) => {
              if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(
                  `Migration API failed with status ${res.status}: ${errorData.error || 'Unknown error'}`,
                );
              }
              return res.json();
            })
            .then((data) => {
              console.log(`Successfully migrated ${data.migratedCount} chats.`);
              toast.success(`Synced ${data.migratedCount} previous chats to your account.`);
              updateUserId(authenticatedUserId);
              console.log('Chat component updated local storage userId after migration.');
              setUserId(authenticatedUserId);
              queryClient.invalidateQueries({ queryKey: ['chats', authenticatedUserId] });
              if (chatId) {
                queryClient.invalidateQueries({ queryKey: ['chat', chatId, authenticatedUserId] });
              }
            })
            .catch((error) => {
              if (error instanceof Error && error.message.includes('status 401')) {
                 console.warn('Chat migration attempt failed likely due to logout or session expiry.');
              } else {
                 console.error('Chat migration failed:', error);
                 toast.error('Failed to sync previous chats to your account.');
              }
            });
            setUserId(authenticatedUserId); 
        } else {
           if (currentLocalId !== authenticatedUserId) {
             updateUserId(authenticatedUserId);
             console.log('Chat component updated local storage userId (no migration needed).');
           }
           setUserId(authenticatedUserId);
        }

      } else {
        setUserId(getUserId());
      }
    }
  }, [session, isSessionLoading, queryClient, chatId]);
  
  useEffect(() => {
    if (isMounted && !isSessionLoading && !session && chatId) {
      if (params?.id) { 
        console.log("User logged out while on chat page, redirecting to home.");
        toast.info("You have been logged out.");
        router.push('/'); 
      }
    }
  }, [session, isSessionLoading, chatId, router, params]);
  
  useEffect(() => {
    if (!chatId) {
      setGeneratedChatId(nanoid());
    }
  }, [chatId]);
  
  const { data: chatData, isLoading: isLoadingChat } = useQuery({
    queryKey: ['chat', chatId, userId] as const,
    queryFn: async ({ queryKey }) => {
      const [_, chatId, userId] = queryKey;
      if (!chatId || !userId) return null;
      
      try {
        const response = await fetch(`/api/chats/${chatId}`, {
          headers: {
            'x-user-id': userId
          }
        });
        
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
    enabled: !!chatId && !!session?.user?.id, 
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
        userId,
        webSearch: {
          enabled: webSearchEnabled,
          contextSize: webSearchContextSize,
        }
      },
      experimental_throttle: 500,
      onFinish: () => {
        if (userId) {
          queryClient.invalidateQueries({ queryKey: ['chats', userId] });
        }
      },
      onError: (error) => {
        toast.error(
          error.message.length > 0
            ? error.message
            : "An error occured, please try again later.",
          { position: "top-center", richColors: true },
        );
      },
    });
    
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('selected_ai_model', selectedModel);
    }
  }, [selectedModel, isMounted]);

  const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!chatId && generatedChatId && input.trim()) {
      const effectiveChatId = generatedChatId;
      
      handleSubmit(e);
      
      router.push(`/chat/${effectiveChatId}`);
    } else {
      handleSubmit(e);
    }
  }, [chatId, generatedChatId, input, handleSubmit, router]);

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
