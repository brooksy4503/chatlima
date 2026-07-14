jest.mock('server-only', () => ({}));

import type { UIMessage } from 'ai';
import { convertToDBMessages } from '@/lib/chat/messageConversion';
import { saveChat } from '@/lib/chat-store';
import { chats } from '@/lib/db/schema';

const mockOnConflictDoUpdate = jest.fn();
const mockInsertValues = jest.fn();
const mockFindFirstChat = jest.fn();

jest.mock('@/lib/db', () => ({
  db: {
    insert: jest.fn(() => ({
      values: mockInsertValues,
    })),
    query: {
      chats: {
        findFirst: (...args: unknown[]) => mockFindFirstChat(...args),
      },
    },
  },
}));

jest.mock('@/app/actions', () => ({
  generateTitle: jest.fn(),
}));

describe('chat-store message conversion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindFirstChat.mockResolvedValue(undefined);
    mockInsertValues.mockReturnValue({
      onConflictDoUpdate: mockOnConflictDoUpdate.mockResolvedValue(undefined),
    });
  });

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

describe('saveChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindFirstChat.mockResolvedValue(undefined);
    mockInsertValues.mockReturnValue({
      onConflictDoUpdate: mockOnConflictDoUpdate.mockResolvedValue(undefined),
    });
  });

  it('uses atomic upsert instead of separate insert/update paths', async () => {
    const result = await saveChat({
      id: 'chat-new',
      userId: 'user-1',
      title: 'My Chat',
    });

    expect(result).toEqual({ id: 'chat-new' });
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'chat-new',
        userId: 'user-1',
        title: 'My Chat',
      })
    );
    expect(mockOnConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        target: chats.id,
        set: expect.objectContaining({
          title: 'My Chat',
        }),
      })
    );
  });

  it('preserves existing meaningful title when no override is provided', async () => {
    mockFindFirstChat.mockResolvedValue({
      id: 'chat-existing',
      userId: 'user-1',
      title: 'Existing Title',
    });

    await saveChat({
      id: 'chat-existing',
      userId: 'user-1',
    });

    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Existing Title',
      })
    );
  });
});
