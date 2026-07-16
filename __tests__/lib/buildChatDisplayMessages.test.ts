import {
  buildChatDisplayMessages,
  buildCompareDisplayPath,
} from '@/lib/chat/buildChatDisplayMessages';
import type { Message } from '@/lib/db/schema';

const dbMessage = (
  id: string,
  role: 'user' | 'assistant',
  extras: Partial<Message> = {}
): Message =>
  ({
    id,
    chatId: 'chat-1',
    role,
    parts: [{ type: 'text', text: id }],
    createdAt: new Date(),
    hasWebSearch: false,
    webSearchContextSize: 'medium',
    modelId: null,
    modelProvider: null,
    modelDisplayName: null,
    comparisonTurnId: null,
    parentMessageId: null,
    ...extras,
  }) as Message;

describe('buildChatDisplayMessages', () => {
  it('returns empty arrays when chat has no messages', () => {
    expect(buildChatDisplayMessages(null)).toEqual({
      allGraphMessages: [],
      initialMessages: [],
    });
    expect(buildChatDisplayMessages({ messages: [] })).toEqual({
      allGraphMessages: [],
      initialMessages: [],
    });
  });

  it('expands compare siblings for initialMessages while preserving full graph', () => {
    const turnId = 'turn-1';
    const messages = [
      dbMessage('u1', 'user', { comparisonTurnId: turnId }),
      dbMessage('a1', 'assistant', {
        comparisonTurnId: turnId,
        modelId: 'openrouter/model-a',
        parentMessageId: 'u1',
      }),
      dbMessage('a2', 'assistant', {
        comparisonTurnId: turnId,
        modelId: 'openrouter/model-b',
        parentMessageId: 'u1',
      }),
      dbMessage('a3', 'assistant', {
        comparisonTurnId: turnId,
        modelId: 'openrouter/model-c',
        parentMessageId: 'u1',
      }),
    ];

    const collapsedPath = [
      {
        id: 'u1',
        role: 'user' as const,
        parts: [{ type: 'text', text: 'u1' }],
        comparisonTurnId: turnId,
      },
      {
        id: 'a3',
        role: 'assistant' as const,
        parts: [{ type: 'text', text: 'a3' }],
        comparisonTurnId: turnId,
        modelId: 'openrouter/model-c',
      },
    ];

    const result = buildChatDisplayMessages({
      messages,
      activePathMessages: collapsedPath,
    });

    expect(result.allGraphMessages).toHaveLength(4);
    expect(result.initialMessages.map((message) => message.id)).toEqual([
      'u1',
      'a1',
      'a2',
      'a3',
    ]);
  });

  it('uses the full graph as the active path when activePathMessages is absent', () => {
    const messages = [
      dbMessage('u1', 'user'),
      dbMessage('a1', 'assistant'),
    ];

    const result = buildChatDisplayMessages({ messages });

    expect(result.allGraphMessages).toHaveLength(2);
    expect(result.initialMessages.map((message) => message.id)).toEqual(['u1', 'a1']);
  });
});

describe('buildCompareDisplayPath', () => {
  it('delegates to compare sibling expansion', () => {
    const turnId = 'turn-1';
    const all = [
      { id: 'u1', role: 'user' as const, parts: [{ type: 'text', text: 'Hi' }], comparisonTurnId: turnId },
      { id: 'a1', role: 'assistant' as const, parts: [{ type: 'text', text: 'A' }], comparisonTurnId: turnId, modelId: 'm1' },
      { id: 'a2', role: 'assistant' as const, parts: [{ type: 'text', text: 'B' }], comparisonTurnId: turnId, modelId: 'm2' },
    ];

    expect(buildCompareDisplayPath([all[0], all[1]], all).map((message) => message.id)).toEqual([
      'u1',
      'a1',
      'a2',
    ]);
  });
});
