import type { CompareUIMessage } from '@/lib/chat/compareHistory';

export type TreeMessageNode = {
  id: string;
  chatId?: string;
  role: string;
  parentMessageId?: string | null;
  comparisonTurnId?: string | null;
  modelId?: string | null;
  modelProvider?: string | null;
  modelDisplayName?: string | null;
  createdAt?: Date | string;
};

export type MessageGraph = {
  byId: Map<string, TreeMessageNode>;
  childrenByParent: Map<string | null, TreeMessageNode[]>;
};

export function buildMessageGraph<T extends TreeMessageNode>(messages: T[]): MessageGraph {
  const byId = new Map<string, TreeMessageNode>();
  const childrenByParent = new Map<string | null, TreeMessageNode[]>();

  for (const message of messages) {
    byId.set(message.id, message);
  }

  for (const message of messages) {
    const parentId = message.parentMessageId ?? null;
    const siblings = childrenByParent.get(parentId) ?? [];
    siblings.push(message);
    childrenByParent.set(parentId, siblings);
  }

  for (const siblings of childrenByParent.values()) {
    siblings.sort((a, b) => {
      const aTime = toTimestamp(a.createdAt);
      const bTime = toTimestamp(b.createdAt);
      if (aTime !== bTime) return aTime - bTime;
      return a.id.localeCompare(b.id);
    });
  }

  return { byId, childrenByParent };
}

function toTimestamp(value: Date | string | undefined): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function resolveDefaultLeafId<T extends TreeMessageNode>(messages: T[]): string | null {
  if (messages.length === 0) return null;

  const graph = buildMessageGraph(messages);
  const roots = graph.childrenByParent.get(null) ?? [];

  if (roots.length === 0) {
    const sorted = [...messages].sort(
      (a, b) => toTimestamp(a.createdAt) - toTimestamp(b.createdAt) || a.id.localeCompare(b.id)
    );
    return sorted[sorted.length - 1]?.id ?? null;
  }

  let leaf = roots[roots.length - 1];
  while (true) {
    const children = graph.childrenByParent.get(leaf.id) ?? [];
    if (children.length === 0) break;
    leaf = children[children.length - 1];
  }
  return leaf.id;
}

export function buildPathToLeaf<T extends TreeMessageNode>(
  leafId: string | null | undefined,
  graph: MessageGraph
): T[] {
  if (!leafId) return [];

  const path: T[] = [];
  let currentId: string | null | undefined = leafId;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) break;
    visited.add(currentId);

    const node = graph.byId.get(currentId) as T | undefined;
    if (!node) break;

    path.unshift(node);
    currentId = node.parentMessageId ?? null;
  }

  return path;
}

export function getMessageSiblings<T extends TreeMessageNode>(
  messageId: string,
  graph: MessageGraph
): T[] {
  const node = graph.byId.get(messageId) as T | undefined;
  if (!node) return [];

  const parentId = node.parentMessageId ?? null;
  const siblings = (graph.childrenByParent.get(parentId) ?? []) as T[];

  if (node.role === 'assistant' && node.comparisonTurnId) {
    return siblings.filter(
      (sibling) =>
        sibling.role === 'assistant' && sibling.comparisonTurnId === node.comparisonTurnId
    );
  }

  return siblings.filter((sibling) => sibling.role === node.role);
}

export function getSiblingVersionInfo(
  messageId: string,
  graph: MessageGraph
): { index: number; total: number; siblings: TreeMessageNode[] } | null {
  const siblings = getMessageSiblings(messageId, graph);
  if (siblings.length <= 1) return null;

  const index = siblings.findIndex((sibling) => sibling.id === messageId);
  if (index < 0) return null;

  return { index: index + 1, total: siblings.length, siblings };
}

export function filterCompareSiblingsFromPath<T extends CompareUIMessage>(
  path: T[],
  activeComparisonTurnId?: string | null,
  selectedModelId?: string | null
): T[] {
  if (!activeComparisonTurnId) return path;

  return path.filter((msg) => {
    if (msg.comparisonTurnId !== activeComparisonTurnId) return true;
    if (msg.role === 'user') return true;
    if (msg.role === 'assistant' && selectedModelId && msg.modelId === selectedModelId) {
      return true;
    }
    return false;
  });
}

export function buildActivePathMessages<T extends CompareUIMessage>(
  allMessages: T[],
  activeLeafId: string | null | undefined
): T[] {
  if (allMessages.length === 0) return [];

  const graph = buildMessageGraph(allMessages);
  const leafId = activeLeafId ?? resolveDefaultLeafId(allMessages);
  if (!leafId) return [...allMessages].sort((a, b) => toTimestamp(a.createdAt) - toTimestamp(b.createdAt));

  return buildPathToLeaf<T>(leafId, graph);
}

export function validateParentInChat(
  parentMessageId: string | null | undefined,
  chatId: string,
  graph: MessageGraph
): boolean {
  if (!parentMessageId) return true;
  const parent = graph.byId.get(parentMessageId);
  return Boolean(parent && parent.chatId === chatId);
}

export type ForkRemapResult<T extends { id: string; parentMessageId?: string | null }> = {
  messages: Array<T & { id: string; parentMessageId: string | null }>;
  idMap: Map<string, string>;
  newActiveLeafId: string | null;
};

export function remapForkPath<T extends TreeMessageNode & { parts?: unknown }>(
  pathMessages: T[],
  newChatId: string,
  generateId: () => string
): ForkRemapResult<T> {
  const idMap = new Map<string, string>();

  for (const message of pathMessages) {
    idMap.set(message.id, generateId());
  }

  const remapped = pathMessages.map((message) => ({
    ...message,
    id: idMap.get(message.id)!,
    chatId: newChatId,
    parentMessageId: message.parentMessageId
      ? idMap.get(message.parentMessageId) ?? null
      : null,
  }));

  const newActiveLeafId =
    pathMessages.length > 0 ? idMap.get(pathMessages[pathMessages.length - 1].id) ?? null : null;

  return { messages: remapped, idMap, newActiveLeafId };
}

export function inferParentChainFromLinearOrder<T extends CompareUIMessage>(
  messages: T[]
): Array<T & { parentMessageId: string | null }> {
  let previousId: string | null = null;
  const compareUserByTurn = new Map<string, string>();

  return messages.map((message) => {
    // Preserve explicit branch parents (regenerate/edit siblings). Only infer when unset.
    let parentMessageId: string | null =
      message.parentMessageId !== undefined
        ? message.parentMessageId ?? null
        : previousId;

    if (
      message.parentMessageId === undefined &&
      message.comparisonTurnId &&
      message.role === 'assistant'
    ) {
      const userParent = compareUserByTurn.get(message.comparisonTurnId);
      parentMessageId = userParent ?? previousId;
    }

    if (message.comparisonTurnId && message.role === 'user') {
      compareUserByTurn.set(message.comparisonTurnId, message.id);
    }

    const withParent = { ...message, parentMessageId };
    previousId = message.id;
    return withParent;
  });
}
