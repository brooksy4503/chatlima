import {
  encodeCompareEvent,
  parseCompareRequestBody,
} from '@/lib/chat/compareRequest';

describe('parseCompareRequestBody', () => {
  it('applies empty defaults when the payload is missing', () => {
    expect(parseCompareRequestBody(null)).toEqual({
      chatId: '',
      messages: [],
      compareModels: [],
      comparisonTurnId: '',
      userMessageId: '',
      apiKeys: {},
    });
  });

  it('keeps only string model identifiers', () => {
    expect(
      parseCompareRequestBody({
        chatId: 'chat-1',
        messages: [{ id: 'user-1', role: 'user', parts: [] }],
        compareModels: ['model-a', null, 42, 'model-b'],
        comparisonTurnId: 'turn-1',
        userMessageId: 'user-1',
        apiKeys: { openrouter: 'secret' },
      })
    ).toEqual({
      chatId: 'chat-1',
      messages: [{ id: 'user-1', role: 'user', parts: [] }],
      compareModels: ['model-a', 'model-b'],
      comparisonTurnId: 'turn-1',
      userMessageId: 'user-1',
      apiKeys: { openrouter: 'secret' },
    });
  });

  it('rejects a non-array compareModels value', () => {
    expect(
      parseCompareRequestBody({ compareModels: 'model-a' }).compareModels
    ).toEqual([]);
  });
});

describe('encodeCompareEvent', () => {
  it('encodes one newline-delimited JSON event', () => {
    const event = {
      type: 'model-error' as const,
      modelId: 'model-a',
      messageId: 'message-1',
      error: 'Provider unavailable',
    };

    expect(encodeCompareEvent(event)).toBe(`${JSON.stringify(event)}\n`);
  });
});
