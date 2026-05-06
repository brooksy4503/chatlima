import { startBackgroundStreamConsumption } from '@/lib/chat-stream-consumption';

describe('startBackgroundStreamConsumption', () => {
  const flushPromises = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useRealTimers();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('starts consumeStream without awaiting completion', async () => {
    let resolveConsume!: () => void;
    const consumeStream = jest.fn(() => new Promise<void>((resolve) => {
      resolveConsume = resolve;
    }));

    startBackgroundStreamConsumption({ consumeStream }, 'chat-123');
    await flushPromises();

    expect(consumeStream).toHaveBeenCalledTimes(1);

    resolveConsume();
    await Promise.resolve();
  });

  it('logs consumeStream failures instead of throwing', async () => {
    const error = new Error('consume failed');
    const consumeStream = jest.fn().mockRejectedValue(error);

    expect(() => {
      startBackgroundStreamConsumption({ consumeStream }, 'chat-123');
    }).not.toThrow();

    await flushPromises();
    await flushPromises();
    await flushPromises();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Chat chat-123] Background stream consumption failed:',
      error,
    );
  });

  it('does nothing when consumeStream is unavailable', () => {
    expect(() => {
      startBackgroundStreamConsumption({}, 'chat-123');
    }).not.toThrow();

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('documents the route call-site contract: consume first, return response separately', async () => {
    const events: string[] = [];
    const result = {
      consumeStream: jest.fn(async () => {
        events.push('consume-started');
      }),
      toDataStreamResponse: jest.fn(() => {
        events.push('response-created');
        return new Response('stream');
      }),
    };

    startBackgroundStreamConsumption(result, 'chat-123');
    const response = result.toDataStreamResponse();

    await Promise.resolve();

    expect(response).toBeInstanceOf(Response);
    expect(result.consumeStream).toHaveBeenCalledTimes(1);
    expect(result.toDataStreamResponse).toHaveBeenCalledTimes(1);
    expect(events).toContain('consume-started');
    expect(events).toContain('response-created');
  });
});
