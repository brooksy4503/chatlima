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

  it('keeps a completed local assistant turn when DB active path is stale', () => {
    const initial = [baseMessage('u1'), baseMessage('a1', 'assistant'), baseMessage('u2')];
    const current = [
      ...initial,
      baseMessage('a2', 'assistant'),
    ];

    expect(
      adoptDbMessages({
        chatId: 'chat-1',
        loadedChatId: 'chat-1',
        isLoadingChat: false,
        status: 'ready',
        isCompareLoading: false,
        initialMessages: initial,
        currentMessages: current,
        activeLeafMessageId: 'u2',
      })
    ).toEqual({ action: 'none' });
  });

  it('does not clobber a promoted compare turn with expanded DB hydration', () => {
    const turnId = 'turn-1';
    const promoted = [
      { id: 'u1', role: 'user' as const, parts: [{ type: 'text', text: 'Hi' }] },
      {
        id: 'a1',
        role: 'assistant' as const,
        parts: [{ type: 'text', text: 'A' }],
        modelId: 'openrouter/model-a',
      },
    ];
    const expandedDb = [
      {
        id: 'u1',
        role: 'user' as const,
        parts: [{ type: 'text', text: 'Hi' }],
        comparisonTurnId: turnId,
      },
      {
        id: 'a1',
        role: 'assistant' as const,
        parts: [{ type: 'text', text: 'A' }],
        comparisonTurnId: turnId,
        modelId: 'openrouter/model-a',
      },
      {
        id: 'a2',
        role: 'assistant' as const,
        parts: [{ type: 'text', text: 'B' }],
        comparisonTurnId: turnId,
        modelId: 'openrouter/model-b',
      },
      {
        id: 'a3',
        role: 'assistant' as const,
        parts: [{ type: 'text', text: 'C' }],
        comparisonTurnId: turnId,
        modelId: 'openrouter/model-c',
      },
    ];

    expect(
      adoptDbMessages({
        chatId: 'chat-1',
        loadedChatId: 'chat-1',
        isLoadingChat: false,
        status: 'ready',
        isCompareLoading: false,
        initialMessages: expandedDb,
        currentMessages: promoted,
        activeLeafMessageId: 'a3',
      })
    ).toEqual({ action: 'none' });
  });
});
