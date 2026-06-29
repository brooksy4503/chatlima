type ChatAbortEntry = {
  controller: AbortController;
  timeoutId: ReturnType<typeof setTimeout>;
};

const CHAT_ABORT_TTL_MS = 10 * 60 * 1000;
const chatAbortControllers = new Map<string, ChatAbortEntry>();

const buildChatAbortKey = (
  userId: string,
  chatId: string,
  streamKey?: string
): string => (streamKey ? `${userId}:${chatId}:${streamKey}` : `${userId}:${chatId}`);

export function registerChatAbortController(
  userId: string,
  chatId: string,
  controller: AbortController,
  streamKey?: string
): void {
  const key = buildChatAbortKey(userId, chatId, streamKey);
  const existing = chatAbortControllers.get(key);
  if (existing) {
    clearTimeout(existing.timeoutId);
  }

  const timeoutId = setTimeout(() => {
    chatAbortControllers.delete(key);
  }, CHAT_ABORT_TTL_MS);

  chatAbortControllers.set(key, { controller, timeoutId });
}

export function abortChatGeneration(
  userId: string,
  chatId: string,
  streamKey?: string
): boolean {
  if (streamKey) {
    const key = buildChatAbortKey(userId, chatId, streamKey);
    const entry = chatAbortControllers.get(key);
    if (!entry) {
      return false;
    }
    clearTimeout(entry.timeoutId);
    chatAbortControllers.delete(key);
    entry.controller.abort();
    return true;
  }

  const prefix = `${userId}:${chatId}`;
  let stopped = false;
  for (const [key, entry] of chatAbortControllers.entries()) {
    if (key === prefix || key.startsWith(`${prefix}:`)) {
      clearTimeout(entry.timeoutId);
      chatAbortControllers.delete(key);
      entry.controller.abort();
      stopped = true;
    }
  }
  return stopped;
}
