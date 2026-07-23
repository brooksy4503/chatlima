import { ConversationPersistenceService } from '@/lib/services/conversationPersistence';

const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockOnConflictDoUpdate = jest.fn();
const mockTransaction = jest.fn();
const mockFindFirstChat = jest.fn();
const mockFindManyMessages = jest.fn();

const mockBackfillParentChainForChat = jest.spyOn(
  ConversationPersistenceService,
  'backfillParentChainForChat'
);

jest.mock('@/lib/db', () => ({
  db: {
    transaction: (...args: unknown[]) => mockTransaction(...args),
    query: {
      chats: { findFirst: (...args: unknown[]) => mockFindFirstChat(...args) },
      messages: { findMany: (...args: unknown[]) => mockFindManyMessages(...args) },
    },
  },
}));

jest.mock('@/lib/db/schema', () => ({
  chats: { id: 'chats.id', userId: 'chats.userId' },
  messages: { id: 'messages.id', chatId: 'messages.chatId' },
  chatProjects: { chatId: 'chatProjects.chatId' },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((...args: unknown[]) => args),
  and: jest.fn((...args: unknown[]) => args),
  inArray: jest.fn((...args: unknown[]) => args),
}));

describe('ConversationPersistenceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBackfillParentChainForChat.mockResolvedValue(undefined);

    mockInsert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        onConflictDoUpdate: mockOnConflictDoUpdate.mockResolvedValue(undefined),
      }),
    });
    mockUpdate.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    });

    mockTransaction.mockImplementation(async (callback: (tx: unknown) => Promise<void>) => {
      const tx = {
        insert: mockInsert,
        update: mockUpdate,
        query: {
          chats: { findFirst: mockFindFirstChat },
        },
      };
      await callback(tx);
    });
  });

  describe('upsertMessages', () => {
    it('upserts messages and updates active leaf in one transaction', async () => {
      const dbMessages = [
        {
          id: 'u1',
          chatId: 'chat-1',
          role: 'user' as const,
          parts: [{ type: 'text', text: 'Hi' }],
          createdAt: new Date('2026-01-01T00:00:00Z'),
        },
        {
          id: 'a1',
          chatId: 'chat-1',
          role: 'assistant' as const,
          parts: [{ type: 'text', text: 'Hello' }],
          parentMessageId: 'u1',
          createdAt: new Date('2026-01-01T00:00:01Z'),
        },
      ];

      const result = await ConversationPersistenceService.upsertMessages(dbMessages, 'a1');

      expect(result.activeLeafMessageId).toBe('a1');
      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(mockInsert).toHaveBeenCalledTimes(2);
      expect(mockOnConflictDoUpdate).toHaveBeenCalledTimes(2);
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });

    it('is idempotent when the same assistant variant is upserted twice', async () => {
      const assistantMessage = {
        id: 'asst-attempt-1',
        chatId: 'chat-1',
        role: 'assistant' as const,
        parts: [{ type: 'text', text: 'Answer' }],
        parentMessageId: 'u1',
        createdAt: new Date('2026-01-01T00:00:01Z'),
      };

      await ConversationPersistenceService.upsertMessages([assistantMessage], 'asst-attempt-1');
      await ConversationPersistenceService.upsertMessages([assistantMessage], 'asst-attempt-1');

      expect(mockTransaction).toHaveBeenCalledTimes(2);
      expect(mockOnConflictDoUpdate).toHaveBeenCalledTimes(2);
    });

    it('keeps active leaf on prior assistant when batch ends with user', async () => {
      const dbMessages = [
        {
          id: 'u1',
          chatId: 'chat-1',
          role: 'user' as const,
          parts: [{ type: 'text', text: 'Hi' }],
          createdAt: new Date('2026-01-01T00:00:00Z'),
        },
        {
          id: 'a1',
          chatId: 'chat-1',
          role: 'assistant' as const,
          parts: [{ type: 'text', text: 'Hello' }],
          parentMessageId: 'u1',
          createdAt: new Date('2026-01-01T00:00:01Z'),
        },
        {
          id: 'u2',
          chatId: 'chat-1',
          role: 'user' as const,
          parts: [{ type: 'text', text: 'Next' }],
          parentMessageId: 'a1',
          createdAt: new Date('2026-01-01T00:00:02Z'),
        },
      ];

      const result = await ConversationPersistenceService.upsertMessages(dbMessages);

      expect(result.activeLeafMessageId).toBe('a1');
    });
  });

  describe('setActiveLeaf', () => {
    it('returns false when chat is not owned by user', async () => {
      mockFindFirstChat.mockResolvedValueOnce(null);

      const ok = await ConversationPersistenceService.setActiveLeaf({
        chatId: 'chat-1',
        userId: 'user-1',
        leafMessageId: 'a1',
      });

      expect(ok).toBe(false);
    });
  });

  describe('promoteCompareTurn', () => {
    it('clears comparisonTurnId on every message in the turn', async () => {
      const turnId = 'turn-1';
      mockFindFirstChat.mockResolvedValueOnce({
        id: 'chat-1',
        userId: 'user-1',
        activeLeafMessageId: 'a1',
      });
      mockFindManyMessages.mockResolvedValueOnce([
        {
          id: 'u1',
          role: 'user',
          comparisonTurnId: turnId,
          modelId: null,
        },
        {
          id: 'a1',
          role: 'assistant',
          comparisonTurnId: turnId,
          modelId: 'openrouter/model-a',
        },
        {
          id: 'a2',
          role: 'assistant',
          comparisonTurnId: turnId,
          modelId: 'openrouter/model-b',
        },
      ]);

      const setMock = jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      });
      mockUpdate.mockReturnValue({ set: setMock });

      const result = await ConversationPersistenceService.promoteCompareTurn({
        chatId: 'chat-1',
        userId: 'user-1',
        comparisonTurnId: turnId,
        modelId: 'openrouter/model-a',
      });

      expect(result).toEqual({ assistantMessageId: 'a1' });
      expect(mockTransaction).toHaveBeenCalledTimes(1);
      // One update clears the whole turn; second updates active leaf.
      expect(mockUpdate).toHaveBeenCalledTimes(2);
      expect(setMock).toHaveBeenCalledWith({ comparisonTurnId: null });
      expect(setMock).toHaveBeenCalledWith({
        activeLeafMessageId: 'a1',
        updatedAt: expect.any(Date),
      });
    });

    it('returns null when the promoted model is missing from the turn', async () => {
      mockFindFirstChat.mockResolvedValueOnce({
        id: 'chat-1',
        userId: 'user-1',
      });
      mockFindManyMessages.mockResolvedValueOnce([
        {
          id: 'u1',
          role: 'user',
          comparisonTurnId: 'turn-1',
        },
        {
          id: 'a1',
          role: 'assistant',
          comparisonTurnId: 'turn-1',
          modelId: 'openrouter/model-a',
        },
      ]);

      const result = await ConversationPersistenceService.promoteCompareTurn({
        chatId: 'chat-1',
        userId: 'user-1',
        comparisonTurnId: 'turn-1',
        modelId: 'openrouter/model-missing',
      });

      expect(result).toBeNull();
      expect(mockTransaction).not.toHaveBeenCalled();
    });
  });

  describe('ensureParentChainBackfilled', () => {
    it('skips backfill when all messages already have parents', async () => {
      mockFindManyMessages.mockResolvedValueOnce([
        { id: 'u1', parentMessageId: null },
        { id: 'a1', parentMessageId: 'u1' },
      ]);

      await ConversationPersistenceService.ensureParentChainBackfilled('chat-1');

      expect(mockBackfillParentChainForChat).not.toHaveBeenCalled();
    });

    it('runs backfill when legacy messages lack parent edges', async () => {
      mockFindManyMessages.mockResolvedValueOnce([
        { id: 'u1', parentMessageId: null },
        { id: 'a1', parentMessageId: null },
      ]);

      await ConversationPersistenceService.ensureParentChainBackfilled('chat-1');

      expect(mockBackfillParentChainForChat).toHaveBeenCalledWith('chat-1');
    });
  });

  describe('loadChatGraph', () => {
    it('backfills legacy chats before building the active path', async () => {
      mockFindFirstChat
        .mockResolvedValueOnce({ id: 'chat-1', userId: 'user-1', activeLeafMessageId: 'a2' })
        .mockResolvedValueOnce({ id: 'chat-1', userId: 'user-1', activeLeafMessageId: 'a2' });

      mockFindManyMessages
        .mockResolvedValueOnce([
          { id: 'u1', parentMessageId: null },
          { id: 'a2', parentMessageId: null },
        ])
        .mockResolvedValueOnce([
          {
            id: 'u1',
            chatId: 'chat-1',
            role: 'user',
            parts: [{ type: 'text', text: 'Hi' }],
            parentMessageId: null,
            createdAt: new Date('2026-01-01T00:00:00Z'),
          },
          {
            id: 'a2',
            chatId: 'chat-1',
            role: 'assistant',
            parts: [{ type: 'text', text: 'Hello' }],
            parentMessageId: 'u1',
            createdAt: new Date('2026-01-01T00:00:01Z'),
          },
        ]);

      const graph = await ConversationPersistenceService.loadChatGraph('chat-1', 'user-1');

      expect(mockBackfillParentChainForChat).toHaveBeenCalledWith('chat-1');
      expect(graph?.activeLeafMessageId).toBe('a2');
      expect(graph?.activePathMessages).toHaveLength(2);
    });
  });
});
