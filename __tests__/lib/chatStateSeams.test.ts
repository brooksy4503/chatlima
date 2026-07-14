/**
 * Integration-style tests for client ↔ server ↔ graph sync seams.
 * These guard the failure modes that caused conversation-branching regressions.
 */
import type { UIMessage } from 'ai';
import { adoptDbMessages } from '@/lib/chat/adoptDbMessages';
import { mergeContinuePath } from '@/lib/chat/mergeContinuePath';
import {
  buildMessageGraph,
  getSiblingVersionInfo,
  inferParentChainFromLinearOrder,
  mergeGraphMessages,
  resolvePersistedActiveLeafId,
} from '@/lib/chat/conversationTree';
import {
  dbActivePathIsDifferentBranch,
  dbMessagesHaveRicherAssistantParts,
  localTranscriptAheadOfStaleDbPath,
} from '@/lib/chat-message-persistence';

const msg = (
  id: string,
  role: 'user' | 'assistant',
  extras: Record<string, unknown> = {}
): UIMessage =>
  ({
    id,
    role,
    parts: [{ type: 'text', text: id }],
    ...extras,
  }) as UIMessage;

describe('chat state seams', () => {
  describe('stale DB refetch vs in-memory branch', () => {
    it('preserves in-memory edit branch when stale DB shares a prefix and local has newer assistant turn', () => {
      const editBranch = [
        msg('u1', 'user'),
        msg('a1', 'assistant'),
        msg('user-edit', 'user', { parentMessageId: null }),
        msg('asst-edit', 'assistant', { parentMessageId: 'user-edit' }),
      ];
      const staleDbPath = [msg('u1', 'user'), msg('a1', 'assistant')];

      expect(localTranscriptAheadOfStaleDbPath(editBranch, staleDbPath)).toBe(true);
      expect(dbMessagesHaveRicherAssistantParts(editBranch, staleDbPath)).toBe(false);
      expect(
        adoptDbMessages({
          chatId: 'chat-1',
          loadedChatId: 'chat-1',
          isLoadingChat: false,
          status: 'ready',
          isCompareLoading: false,
          initialMessages: staleDbPath,
          currentMessages: editBranch,
          activeLeafMessageId: 'a1',
        })
      ).toEqual({ action: 'none' });
    });

    it('keeps local transcript when DB is one turn behind after stream finish', () => {
      const staleDb = [msg('u1', 'user'), msg('a1', 'assistant'), msg('u2', 'user')];
      const local = [...staleDb, msg('a2', 'assistant')];

      expect(localTranscriptAheadOfStaleDbPath(local, staleDb)).toBe(true);
      expect(
        adoptDbMessages({
          chatId: 'chat-1',
          loadedChatId: 'chat-1',
          isLoadingChat: false,
          status: 'ready',
          isCompareLoading: false,
          initialMessages: staleDb,
          currentMessages: local,
          activeLeafMessageId: 'u2',
        }).action
      ).toBe('none');
    });

    it('adopts DB path only when active leaf matches reported branch', () => {
      const local = [msg('u1', 'user'), msg('a1', 'assistant')];
      const dbOtherBranch = [msg('u1', 'user'), msg('a1b', 'assistant')];

      expect(dbActivePathIsDifferentBranch(local, dbOtherBranch, 'a1b')).toBe(true);
      expect(
        adoptDbMessages({
          chatId: 'chat-1',
          loadedChatId: 'chat-1',
          isLoadingChat: false,
          status: 'ready',
          isCompareLoading: false,
          initialMessages: dbOtherBranch,
          currentMessages: local,
          activeLeafMessageId: 'a1b',
        }).action
      ).toBe('replace');
    });

    it('ignores richer assistant parts when the DB message id is absent from local state', () => {
      const local = [msg('u1', 'user'), msg('a1', 'assistant')];
      const db = [
        msg('u1', 'user'),
        msg('a1b', 'assistant', {
          parts: [
            { type: 'text', text: 'other branch' },
            { type: 'reasoning', text: 'extra' },
          ],
        }),
      ];

      expect(dbMessagesHaveRicherAssistantParts(local, db)).toBe(false);
    });

    it('allows enrichment when the same assistant id gains tool/reasoning parts', () => {
      const local = [msg('u1', 'user'), msg('a1', 'assistant')];
      const db = [
        msg('u1', 'user'),
        msg('a1', 'assistant', {
          parts: [
            { type: 'text', text: 'a1' },
            { type: 'reasoning', text: 'thinking' },
          ],
        }),
      ];

      expect(dbMessagesHaveRicherAssistantParts(local, db)).toBe(true);
    });
  });

  describe('graph merge during streaming', () => {
    it('preserves regenerate sibling edges when live path omits parentMessageId', () => {
      const persisted = [
        { id: 'u1', role: 'user', parentMessageId: null, createdAt: new Date(1) },
        { id: 'a1', role: 'assistant', parentMessageId: 'u1', createdAt: new Date(2) },
        { id: 'a1b', role: 'assistant', parentMessageId: 'u1', createdAt: new Date(3) },
      ];
      const live = [
        { id: 'u1', role: 'user', createdAt: new Date(1) },
        { id: 'a1', role: 'assistant', createdAt: new Date(2) },
        { id: 'a1b', role: 'assistant', createdAt: new Date(3) },
      ];

      const merged = mergeGraphMessages(persisted, live);
      const withParents = inferParentChainFromLinearOrder(merged);
      expect(withParents.map((m) => m.parentMessageId)).toEqual([null, 'u1', 'u1']);

      const graph = buildMessageGraph(withParents);
      expect(getSiblingVersionInfo('a1b', graph)).toEqual({
        index: 2,
        total: 2,
        siblings: expect.any(Array),
      });
    });
  });

  describe('server-owned continue authority', () => {
    it('rejects client path that diverges from server active path', () => {
      const serverPath = [
        { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] },
        { id: 'a1', role: 'assistant', parts: [{ type: 'text', text: 'Hello' }] },
      ];
      const clientPath = [
        { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] },
        { id: 'a1-forged', role: 'assistant', parts: [{ type: 'text', text: 'Nope' }] },
      ];

      const result = mergeContinuePath(serverPath, clientPath);
      expect(result.messages.map((m) => m.id)).toEqual(['u1', 'a1']);
      expect(result.activeLeafMessageId).toBe('a1');
    });

    it('does not set user message as active leaf before assistant stream completes', () => {
      const batch = [
        { id: 'u1', role: 'user' },
        { id: 'a1', role: 'assistant' },
        { id: 'u2', role: 'user' },
      ];
      expect(resolvePersistedActiveLeafId(batch)).toBe('a1');
    });
  });
});
