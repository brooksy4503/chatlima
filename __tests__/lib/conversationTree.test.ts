import {
  buildActivePathMessages,
  buildMessageGraph,
  buildPathToLeaf,
  getSiblingVersionInfo,
  inferParentChainFromLinearOrder,
  remapForkPath,
  resolveDeepestLeafId,
  resolvePersistedActiveLeafId,
} from '@/lib/chat/conversationTree';

describe('conversationTree', () => {
  const linearMessages = [
    { id: 'u1', role: 'user', createdAt: new Date('2026-01-01T00:00:00Z') },
    { id: 'a1', role: 'assistant', createdAt: new Date('2026-01-01T00:01:00Z') },
    { id: 'u2', role: 'user', createdAt: new Date('2026-01-01T00:02:00Z') },
    { id: 'a2', role: 'assistant', createdAt: new Date('2026-01-01T00:03:00Z') },
  ];

  it('preserves explicit regenerate sibling parents', () => {
    const branched = [
      { id: 'u1', role: 'user', parentMessageId: null, createdAt: new Date(1) },
      { id: 'a1', role: 'assistant', parentMessageId: 'u1', createdAt: new Date(2) },
      { id: 'a1b', role: 'assistant', parentMessageId: 'u1', createdAt: new Date(3) },
    ];
    const withParents = inferParentChainFromLinearOrder(branched);
    expect(withParents.map((m) => m.parentMessageId)).toEqual([null, 'u1', 'u1']);
  });

  it('infers parent chain from linear order', () => {
    const withParents = inferParentChainFromLinearOrder(linearMessages);
    expect(withParents.map((m) => m.parentMessageId)).toEqual([null, 'u1', 'a1', 'u2']);
  });

  it('builds active path to selected leaf', () => {
    const withParents = inferParentChainFromLinearOrder(linearMessages);
    const graph = buildMessageGraph(withParents);
    const path = buildPathToLeaf('a2', graph);
    expect(path.map((m) => m.id)).toEqual(['u1', 'a1', 'u2', 'a2']);
  });

  it('reports sibling versions for assistant branches', () => {
    const branched = [
      { id: 'u1', role: 'user', parentMessageId: null, createdAt: new Date(1) },
      { id: 'a1', role: 'assistant', parentMessageId: 'u1', createdAt: new Date(2) },
      { id: 'a1b', role: 'assistant', parentMessageId: 'u1', createdAt: new Date(3) },
    ];
    const graph = buildMessageGraph(branched);
    const info = getSiblingVersionInfo('a1b', graph);
    expect(info).toEqual({ index: 2, total: 2, siblings: expect.any(Array) });
  });

  it('remaps fork path with new ids', () => {
    const withParents = inferParentChainFromLinearOrder(linearMessages.slice(0, 2));
    const remapped = remapForkPath(withParents, 'chat-2', () => 'new-id');
    expect(remapped.messages).toHaveLength(2);
    expect(remapped.messages[0].chatId).toBe('chat-2');
    expect(remapped.newActiveLeafId).toBe('new-id');
  });

  it('reports sibling versions for edited user branches', () => {
    const branched = [
      { id: 'u1', role: 'user', parentMessageId: null, createdAt: new Date(1) },
      { id: 'a1', role: 'assistant', parentMessageId: 'u1', createdAt: new Date(2) },
      { id: 'u1b', role: 'user', parentMessageId: null, createdAt: new Date(3) },
      { id: 'a1b', role: 'assistant', parentMessageId: 'u1b', createdAt: new Date(4) },
    ];
    const graph = buildMessageGraph(branched);
    const info = getSiblingVersionInfo('u1b', graph);
    expect(info).toEqual({ index: 2, total: 2, siblings: expect.any(Array) });
  });

  it('resolves deepest leaf under a user sibling for pager navigation', () => {
    const branched = [
      { id: 'u1', role: 'user', parentMessageId: null, createdAt: new Date(1) },
      { id: 'a1', role: 'assistant', parentMessageId: 'u1', createdAt: new Date(2) },
      { id: 'u1b', role: 'user', parentMessageId: null, createdAt: new Date(3) },
      { id: 'a1b', role: 'assistant', parentMessageId: 'u1b', createdAt: new Date(4) },
    ];
    const graph = buildMessageGraph(branched);
    expect(resolveDeepestLeafId('u1', graph)).toBe('a1');
    expect(resolveDeepestLeafId('u1b', graph)).toBe('a1b');
    expect(resolveDeepestLeafId('a1b', graph)).toBe('a1b');
  });

  it('buildActivePathMessages follows active leaf', () => {
    const branched = [
      { id: 'u1', role: 'user', parentMessageId: null, createdAt: new Date(1) },
      { id: 'a1', role: 'assistant', parentMessageId: 'u1', createdAt: new Date(2) },
      { id: 'a1b', role: 'assistant', parentMessageId: 'u1', createdAt: new Date(3) },
    ];
    const path = buildActivePathMessages(branched, 'a1b');
    expect(path.map((m) => m.id)).toEqual(['u1', 'a1b']);
  });

  it('resolvePersistedActiveLeafId keeps leaf on prior assistant before stream', () => {
    const batch = [
      { id: 'u1', role: 'user' },
      { id: 'a1', role: 'assistant' },
      { id: 'u2', role: 'user' },
    ];
    expect(resolvePersistedActiveLeafId(batch)).toBe('a1');
  });

  it('resolvePersistedActiveLeafId uses trailing assistant after stream', () => {
    const batch = [
      { id: 'u1', role: 'user' },
      { id: 'a1', role: 'assistant' },
      { id: 'u2', role: 'user' },
      { id: 'a2', role: 'assistant' },
    ];
    expect(resolvePersistedActiveLeafId(batch)).toBe('a2');
  });

  it('resolvePersistedActiveLeafId honors explicit leaf ids', () => {
    const batch = [{ id: 'u1', role: 'user' }];
    expect(resolvePersistedActiveLeafId(batch, 'placeholder-a1')).toBe('placeholder-a1');
  });
});
