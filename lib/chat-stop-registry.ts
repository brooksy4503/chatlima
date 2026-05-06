type ChatAbortEntry = {
  controller: AbortController;
  timeoutId: ReturnType<typeof setTimeout>;
};

const CHAT_ABORT_TTL_MS = 10 * 60 * 1000;
const chatAbortControllers = new Map<string, ChatAbortEntry>();

const buildChatAbortKey = (userId: string, chatId: string): string => `${userId}:${chatId}`;

export function registerChatAbortController(
  userId: string,
  chatId: string,
  controller: AbortController,
): void {
  const key = buildChatAbortKey(userId, chatId);
  const existing = chatAbortControllers.get(key);
  if (existing) {
    clearTimeout(existing.timeoutId);
  }

  const timeoutId = setTimeout(() => {
    chatAbortControllers.delete(key);
  }, CHAT_ABORT_TTL_MS);

  chatAbortControllers.set(key, { controller, timeoutId });
}

export function abortChatGeneration(userId: string, chatId: string): boolean {
  const key = buildChatAbortKey(userId, chatId);
  const entry = chatAbortControllers.get(key);
  if (!entry) {
    return false;
  }

  clearTimeout(entry.timeoutId);
  chatAbortControllers.delete(key);
  entry.controller.abort();
  return true;
}
