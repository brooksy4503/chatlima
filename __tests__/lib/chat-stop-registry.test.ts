import { abortChatGeneration, registerChatAbortController } from '@/lib/chat-stop-registry';

describe('chat stop registry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('aborts an active chat generation', () => {
    const controller = new AbortController();
    registerChatAbortController('user-1', 'chat-1', controller);

    const stopped = abortChatGeneration('user-1', 'chat-1');

    expect(stopped).toBe(true);
    expect(controller.signal.aborted).toBe(true);
  });

  it('returns false for unknown chat generation', () => {
    expect(abortChatGeneration('user-1', 'chat-missing')).toBe(false);
  });

  it('expires controllers automatically after ttl', () => {
    const controller = new AbortController();
    registerChatAbortController('user-1', 'chat-ttl', controller);

    jest.advanceTimersByTime(10 * 60 * 1000 + 1);

    expect(abortChatGeneration('user-1', 'chat-ttl')).toBe(false);
    expect(controller.signal.aborted).toBe(false);
  });
});
