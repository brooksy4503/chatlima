import type { UIMessage } from 'ai';
import { convertToDBMessages } from '@/lib/chat-store';

jest.mock('@/lib/db', () => ({
  db: {},
}));

jest.mock('@/app/actions', () => ({
  generateTitle: jest.fn(),
}));

describe('chat-store message conversion', () => {
  it('assigns monotonically increasing createdAt values to preserve array order', () => {
    const messages: UIMessage[] = [
      {
        id: 'user-1',
        role: 'user',
        parts: [{ type: 'text', text: 'First prompt' }],
      },
      {
        id: 'assistant-1',
        role: 'assistant',
        parts: [{ type: 'text', text: 'First answer' }],
      },
      {
        id: 'user-2',
        role: 'user',
        parts: [{ type: 'text', text: 'Second prompt' }],
      },
    ];

    const dbMessages = convertToDBMessages(messages, 'chat-1');
    const timestamps = dbMessages.map((message) => message.createdAt.getTime());

    expect(dbMessages.map((message) => message.id)).toEqual([
      'user-1',
      'assistant-1',
      'user-2',
    ]);
    expect(timestamps[0]).toBeLessThan(timestamps[1]);
    expect(timestamps[1]).toBeLessThan(timestamps[2]);
  });

  it('normalizes duplicate existing createdAt values in message order', () => {
    const sameCreatedAt = '2026-05-31T04:41:47.761Z';
    const messages = [
      {
        id: 'user-1',
        role: 'user',
        createdAt: sameCreatedAt,
        parts: [{ type: 'text', text: 'First prompt' }],
      },
      {
        id: 'assistant-1',
        role: 'assistant',
        createdAt: sameCreatedAt,
        parts: [{ type: 'text', text: 'First answer' }],
      },
    ] as Array<UIMessage & { createdAt: string }>;

    const dbMessages = convertToDBMessages(messages, 'chat-1');

    expect(dbMessages[0].createdAt.toISOString()).toBe(sameCreatedAt);
    expect(dbMessages[1].createdAt.getTime()).toBe(
      dbMessages[0].createdAt.getTime() + 1
    );
  });

  it('round-trips comparison metadata fields', () => {
    const messages = [
      {
        id: 'u1',
        role: 'user',
        parts: [{ type: 'text', text: 'Compare this' }],
        comparisonTurnId: 'turn-1',
      },
      {
        id: 'a1',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Response' }],
        comparisonTurnId: 'turn-1',
        modelId: 'openrouter/gpt-4o-mini',
        modelProvider: 'openrouter',
        modelDisplayName: 'GPT-4o mini',
      },
    ] as Array<UIMessage & { comparisonTurnId?: string; modelId?: string; modelProvider?: string; modelDisplayName?: string }>;

    const db = convertToDBMessages(messages, 'chat-1');
    expect(db[1].modelId).toBe('openrouter/gpt-4o-mini');
    expect(db[1].comparisonTurnId).toBe('turn-1');
  });
});
