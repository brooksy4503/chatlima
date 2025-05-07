import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type Chat } from '@/lib/db/schema';
import { toast } from 'sonner';

export function useChats(userId: string) {
  const queryClient = useQueryClient();

  // Main query to fetch chats
  const {
    data: chats = [],
    isLoading,
    error,
    refetch
  } = useQuery<Chat[]>({
    queryKey: ['chats', userId],
    queryFn: async () => {
      if (!userId) return [];

      const response = await fetch('/api/chats', {
        headers: {
          'x-user-id': userId
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      return response.json();
    },
    enabled: !!userId, // Only run query if userId exists
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Mutation to delete a chat
  const deleteChat = useMutation({
    mutationFn: async (chatId: string) => {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userId
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      return chatId;
    },
    onSuccess: (deletedChatId) => {
      // Update cache by removing the deleted chat
      queryClient.setQueryData<Chat[]>(['chats', userId], (oldChats = []) =>
        oldChats.filter(chat => chat.id !== deletedChatId)
      );

      toast.success('Chat deleted');
    },
    onError: (error) => {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  });

  // Mutation to update a chat's title
  const updateChatTitle = useMutation({
    mutationFn: async ({ chatId, title }: { chatId: string; title: string }) => {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ title })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update chat title' }));
        throw new Error(errorData.message || 'Failed to update chat title');
      }

      return response.json();
    },
    onMutate: async ({ chatId, title }: { chatId: string; title: string }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['chats', userId] });

      // Snapshot the previous value
      const previousChats = queryClient.getQueryData<Chat[]>(['chats', userId]);

      // Optimistically update to the new value
      queryClient.setQueryData<Chat[]>(['chats', userId], (oldChats = []) =>
        oldChats.map(chat =>
          chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat
        )
      );

      // Return a context object with the snapshotted value
      return { previousChats };
    },
    onError: (err, variables, context) => {
      console.error('Error updating chat title:', err);
      // Rollback to the previous value if optimistic update occurred
      if (context?.previousChats) {
        queryClient.setQueryData<Chat[]>(['chats', userId], context.previousChats);
      }
      toast.error(err.message || 'Failed to update chat title. Please try again.');
    },
    onSuccess: (data: Chat, variables) => {
      // Update the specific chat in the cache with the server's response
      queryClient.setQueryData<Chat[]>(['chats', userId], (oldChats = []) =>
        oldChats.map(chat => (chat.id === variables.chatId ? data : chat))
      );
      toast.success('Chat title updated successfully!');
    },
    // Always refetch after error or success:
    // onSettled: () => {
    //   queryClient.invalidateQueries({ queryKey: ['chats', userId] });
    // }
  });

  // Function to invalidate chats cache for refresh
  const refreshChats = () => {
    queryClient.invalidateQueries({ queryKey: ['chats', userId] });
  };

  // Function for optimistic UI update of chat title (now part of updateChatTitle mutation's onMutate)
  // const updateChatTitleOptimistic = (chatId: string, newTitle: string) => {
  //   queryClient.setQueryData<Chat[]>(['chats', userId], (oldChats = []) =>
  //     oldChats.map(chat =>
  //       chat.id === chatId ? { ...chat, title: newTitle, updatedAt: new Date() } : chat
  //     )
  //   );
  // };

  return {
    chats,
    isLoading,
    error,
    deleteChat: deleteChat.mutate,
    isDeleting: deleteChat.isPending,
    updateChatTitle: updateChatTitle.mutate,
    isUpdatingChatTitle: updateChatTitle.isPending,
    refreshChats,
    refetch
    // updateChatTitleOptimistic // No longer directly exposed, handled by the mutation
  };
}