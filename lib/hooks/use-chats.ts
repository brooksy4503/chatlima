import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type Chat } from '@/lib/db/schema';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export function useChats() {
  const queryClient = useQueryClient();
  const { session, isPending: isSessionLoading } = useAuth();

  // Main query to fetch chats
  const {
    data: chats = [],
    isLoading,
    error,
    refetch
  } = useQuery<Chat[]>({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await fetch('/api/chats?limit=50'); // Only load most recent 50 chats

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      return response.json();
    },
    enabled: !isSessionLoading && !!session?.user?.id, // Only fetch when session is loaded and user exists
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes (increased from 5)
    refetchOnWindowFocus: false, // Disable aggressive refetching on focus
    refetchOnMount: false, // Don't refetch on mount if data is available
    refetchOnReconnect: false, // Don't refetch on reconnect
  });

  // Mutation to delete a chat
  const deleteChat = useMutation({
    mutationFn: async (chatId: string) => {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      return chatId;
    },
    onSuccess: (deletedChatId) => {
      // Update cache by removing the deleted chat
      queryClient.setQueryData<Chat[]>(['chats'], (oldChats = []) =>
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
          'Content-Type': 'application/json'
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
      await queryClient.cancelQueries({ queryKey: ['chats'] });

      // Snapshot the previous value
      const previousChats = queryClient.getQueryData<Chat[]>(['chats']);

      // Optimistically update to the new value
      queryClient.setQueryData<Chat[]>(['chats'], (oldChats = []) =>
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
        queryClient.setQueryData<Chat[]>(['chats'], context.previousChats);
      }
      toast.error(err.message || 'Failed to update chat title. Please try again.');
    },
    onSuccess: (data: Chat, variables) => {
      // Update the specific chat in the cache with the server's response
      queryClient.setQueryData<Chat[]>(['chats'], (oldChats = []) =>
        oldChats.map(chat => (chat.id === variables.chatId ? data : chat))
      );
      toast.success('Chat title updated successfully!');
    }
  });

  // Function to invalidate chats cache for refresh
  const refreshChats = () => {
    queryClient.invalidateQueries({ queryKey: ['chats'] });
  };

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
  };
}