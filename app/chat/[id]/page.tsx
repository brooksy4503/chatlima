"use client";

import Chat from "@/components/chat";
import { ErrorBoundary } from "@/components/error-boundary";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chatId = params?.id as string;
  const presetId = searchParams.get('preset');
  const queryClient = useQueryClient();

  // Prefetch chat data
  // useEffect(() => {
  //   async function prefetchChat() {
  //     if (!chatId || !userId) return;
  //     
  //     // Check if data already exists in cache
  //     const existingData = queryClient.getQueryData(['chat', chatId, userId]);
  //     if (existingData) return;
  //
  //     // Prefetch the data
  //     await queryClient.prefetchQuery({
  //       queryKey: ['chat', chatId, userId] as const,
  //       queryFn: async () => {
  //         try {
  //           const response = await fetch(`/api/chats/${chatId}`, {
  //             headers: {
  //               'x-user-id': userId
  //             }
  //           });
  //           
  //           if (response.status === 404) {
  //             // Chat doesn't exist yet, expected for new chats. Return null silently.
  //             return null;
  //           }
  //
  //           if (!response.ok) {
  //             console.error(`Prefetch failed for chat ${chatId}: Status ${response.status}`);
  //             return null;
  //           }
  //           
  //           return response.json();
  //         } catch (error) {
  //           console.error('Error prefetching chat:', error);
  //           return null;
  //         }
  //       },
  //       staleTime: 1000 * 60 * 5, // 5 minutes
  //     });
  //   }
  //
  //   prefetchChat();
  // }, [chatId, userId, queryClient]);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Chat page error:', error, errorInfo);
      }}
    >
      <Chat presetId={presetId} />
    </ErrorBoundary>
  );
} 