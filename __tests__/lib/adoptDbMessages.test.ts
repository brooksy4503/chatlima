import { adoptDbMessages } from '@/lib/chat/adoptDbMessages';
import type { UIMessage } from 'ai';

const baseMessage = (id: string, role: 'user' | 'assistant' = 'user'): UIMessage => ({
  id,
  role,
  parts: [{ type: 'text', text: id }],
});

describe('adoptDbMessages', () => {
  it('replaces messages on new chat navigation', () => {
    const initial = [baseMessage('u1'), baseMessage('a1', 'assistant')];

    expect(
      adoptDbMessages({
        chatId: 'chat-2',
        loadedChatId: 'chat-1',
        isLoadingChat: false,
        status: 'ready',
        isCompareLoading: false,
        initialMessages: initial,
        currentMessages: [],
        activeLeafMessageId: 'a1',
      })
    ).toEqual({
      action: 'replace',
      messages: initial,
      loadedChatId: 'chat-2',
    });
  });

  it('does nothing while streaming', () => {
    expect(
      adoptDbMessages({
        chatId: 'chat-1',
        loadedChatId: 'chat-1',
        isLoadingChat: false,
        status: 'streaming',
        isCompareLoading: false,
        initialMessages: [baseMessage('u1')],
        currentMessages: [baseMessage('u1')],
      }).action
    ).toBe('none');
  });
});
