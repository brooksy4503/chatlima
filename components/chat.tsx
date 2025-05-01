"use client";

import { defaultModel, type modelID } from "@/ai/providers";
import { Message, useChat } from "@ai-sdk/react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Textarea } from "./textarea";
import { ProjectOverview } from "./project-overview";
import { Messages } from "./messages";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { getUserId, updateUserId } from "@/lib/user-id";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { convertToUIMessages } from "@/lib/chat-store";
import { type Message as DBMessage } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { useMCP } from "@/lib/context/mcp-context";
import { useSession } from "@/lib/auth-client";
import { WebSearchContextSizeSelector } from "./web-search-settings";

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
  
  const [selectedModel, setSelectedModel] = useLocalStorage<modelID>("selectedModel", defaultModel);
  const [userId, setUserId] = useState<string>('');
  const [generatedChatId, setGeneratedChatId] = useState<string>('');
  const [webSearch, setWebSearch] = useLocalStorage<{
    enabled: boolean;
    contextSize: 'low' | 'medium' | 'high';
  }>("webSearch", {
    enabled: false,
    contextSize: 'medium'
  });
  
  // Get MCP server data from context
  const { mcpServersForApi } = useMCP();
  
  // Initialize userId
  useEffect(() => {
    setUserId(getUserId());
  }, []);
  
  // Effect to update userId based on authentication status
  useEffect(() => {
    // Wait until session loading is complete
    if (!isSessionLoading) {
      if (session?.user?.id) {
        // User is authenticated
        const authenticatedUserId = session.user.id;
        const currentLocalId = getUserId(); // Check ID in local storage

        // If local ID exists and differs from authenticated ID, migrate chats
        if (currentLocalId && currentLocalId !== authenticatedUserId) {
          console.log(
            `Local user ID (${currentLocalId}) differs from authenticated ID (${authenticatedUserId}). Attempting migration.`,
          );
          fetch('/api/chats/migrate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Session cookie should be sent automatically by the browser
            },
            body: JSON.stringify({ localUserId: currentLocalId }),
          })
            .then(async (res) => {
              if (!res.ok) {
                const errorData = await res.json().catch(() => ({})); // Try to parse error
                throw new Error(
                  `Migration API failed with status ${res.status}: ${errorData.error || 'Unknown error'}`,
                );
              }
              return res.json();
            })
            .then((data) => {
              console.log(`Successfully migrated ${data.migratedCount} chats.`);
              toast.success(`Synced ${data.migratedCount} previous chats to your account.`);
              // IMPORTANT: Update local storage to prevent re-migration
              updateUserId(authenticatedUserId);
              console.log('Chat component updated local storage userId after migration.');
              setUserId(authenticatedUserId); // Update component state immediately
              // Optional: Refresh chat list or current chat view if needed
              queryClient.invalidateQueries({ queryKey: ['chats', authenticatedUserId] });
              if (chatId) {
                queryClient.invalidateQueries({ queryKey: ['chat', chatId, authenticatedUserId] });
              }
            })
            .catch((error) => {
              // Check if the error message indicates a 401 Unauthorized
              if (error instanceof Error && error.message.includes('status 401')) {
                 console.warn('Chat migration attempt failed likely due to logout or session expiry.');
                 // Don't show a toast here, as the user initiated logout.
              } else {
                 // Handle other potential errors during migration
                 console.error('Chat migration failed:', error);
                 toast.error('Failed to sync previous chats to your account.');
              }
              // If migration fails, we still need to ensure the component's userId state 
              // reflects the authenticated user for the current render, 
              // otherwise subsequent operations might use the wrong ID until the next effect run.
              // However, the outer logic should handle setting userId based on session status correctly.
              // Let's ensure setUserId(authenticatedUserId) is called outside the fetch promise chain
              // if the session is valid, regardless of migration outcome.
            });
          // Ensure component state reflects authenticated user ID immediately in this block
          setUserId(authenticatedUserId); 
        } else {
           // Local ID matches authenticated ID, or no local ID existed.
           // Ensure local storage and state are set to the authenticated ID.
           if (currentLocalId !== authenticatedUserId) {
             updateUserId(authenticatedUserId);
             console.log('Chat component updated local storage userId (no migration needed).');
           }
           setUserId(authenticatedUserId);
        }

      } else {
        // User is not authenticated, ensure component state uses local storage ID
        setUserId(getUserId());
      }
    }
  }, [session, isSessionLoading, queryClient, chatId]); // Added queryClient and chatId dependencies
  
  // Effect to redirect user away from chat page on logout
  useEffect(() => {
    if (!isSessionLoading && !session && chatId) {
      // If session loading is done, user is logged out, and we are on a specific chat page
      console.log("User logged out while on chat page, redirecting to home.");
      toast.info("You have been logged out."); // Optional user feedback
      router.push('/'); 
    }
  }, [session, isSessionLoading, chatId, router]); // Dependencies: session status, loading status, chat ID, router
  
  // Generate a chat ID if needed
  useEffect(() => {
    if (!chatId) {
      setGeneratedChatId(nanoid());
    }
  }, [chatId]);
  
  // Use React Query to fetch chat history
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
    // Only enable this query if we have a specific chatId AND a logged-in user session
    enabled: !!chatId && !!session?.user?.id, 
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });
  
  // Prepare initial messages from query data
  const initialMessages = useMemo(() => {
    if (!chatData || !chatData.messages || chatData.messages.length === 0) {
      return [];
    }
    
    // Convert DB messages to UI format, then ensure it matches the Message type from @ai-sdk/react
    const uiMessages = convertToUIMessages(chatData.messages);
    return uiMessages.map(msg => ({
      id: msg.id,
      role: msg.role as Message['role'], // Ensure role is properly typed
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
        webSearch
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
    
  // Custom submit handler
  const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!chatId && generatedChatId && input.trim()) {
      // If this is a new conversation, redirect to the chat page with the generated ID
      const effectiveChatId = generatedChatId;
      
      // Submit the form
      handleSubmit(e);
      
      // Redirect to the chat page with the generated ID
      router.push(`/chat/${effectiveChatId}`);
    } else {
      // Normal submission for existing chats
      handleSubmit(e);
    }
  }, [chatId, generatedChatId, input, handleSubmit, router]);

  const isLoading = status === "streaming" || status === "submitted" || isLoadingChat;

  return (
    <div className="h-dvh flex flex-col justify-center w-full max-w-3xl mx-auto px-4 sm:px-6 md:py-4">
      {messages.length === 0 && !isLoadingChat ? (
        <div className="max-w-xl mx-auto w-full">
          <ProjectOverview />
          <form
            onSubmit={handleFormSubmit}
            className="mt-4 w-full mx-auto"
          >
            <Textarea
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              handleInputChange={handleInputChange}
              input={input}
              isLoading={isLoading}
              status={status}
              stop={stop}
              webSearchEnabled={webSearch.enabled}
              onWebSearchToggle={(enabled) => setWebSearch(prev => ({ ...prev, enabled }))}
              webSearchContextSize={webSearch.contextSize}
              onWebSearchContextSizeChange={(size) => setWebSearch(prev => ({ ...prev, contextSize: size }))}
            />
          </form>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto min-h-0 pb-2">
            <Messages messages={messages} isLoading={isLoading} status={status} />
          </div>
          <div className="mt-2 w-full mx-auto mb-4 sm:mb-auto">
            <form onSubmit={handleFormSubmit} className="mt-2">
              <Textarea
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                handleInputChange={handleInputChange}
                input={input}
                isLoading={isLoading}
                status={status}
                stop={stop}
                webSearchEnabled={webSearch.enabled}
                onWebSearchToggle={(enabled) => setWebSearch(prev => ({ ...prev, enabled }))}
                webSearchContextSize={webSearch.contextSize}
                onWebSearchContextSizeChange={(size) => setWebSearch(prev => ({ ...prev, contextSize: size }))}
              />
            </form>
          </div>
        </>
      )}
    </div>
  );
}
