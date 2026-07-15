import { parseChatRequestBody } from '@/lib/chat/chatRequest';

describe('parseChatRequestBody', () => {
  it('applies safe defaults for an empty request', () => {
    expect(parseChatRequestBody(undefined)).toEqual({
      action: undefined,
      operation: { type: 'continue' },
      messages: [],
      chatId: undefined,
      selectedModel: '',
      mcpServers: [],
      webSearch: { enabled: false, contextSize: 'medium' },
      imageGeneration: {
        enabled: false,
        quality: 'medium',
        aspectRatio: '1:1',
        outputFormat: 'png',
        model: 'openai/gpt-5-image',
      },
      apiKeys: {},
      attachments: [],
      temperature: undefined,
      maxTokens: undefined,
      systemInstruction: undefined,
    });
  });

  it.each([
    {
      operation: {
        type: 'regenerate',
        assistantMessageId: 'assistant-1',
        attemptId: 'attempt-1',
      },
    },
    {
      operation: {
        type: 'edit-resubmit',
        userMessageId: 'user-1',
        content: 'Revised prompt',
        attemptId: 'attempt-2',
      },
    },
  ])('preserves a valid $operation.type operation', ({ operation }) => {
    expect(parseChatRequestBody({ operation }).operation).toEqual(operation);
  });

  it.each([
    null,
    'regenerate',
    { type: 'regenerate', assistantMessageId: 'assistant-1' },
    { type: 'edit-resubmit', userMessageId: 'user-1', content: 'Edit' },
    { type: 'unknown' },
  ])('falls back to continue for a malformed operation: %p', (operation) => {
    expect(parseChatRequestBody({ operation }).operation).toEqual({
      type: 'continue',
    });
  });

  it('merges image generation options over the documented defaults', () => {
    expect(
      parseChatRequestBody({
        imageGeneration: {
          enabled: true,
          aspectRatio: '16:9',
          model: 'provider/image-model',
        },
      }).imageGeneration
    ).toEqual({
      enabled: true,
      quality: 'medium',
      aspectRatio: '16:9',
      outputFormat: 'png',
      model: 'provider/image-model',
    });
  });

  it('preserves supported scalar request values, including zero', () => {
    const parsed = parseChatRequestBody({
      action: 'submit',
      chatId: 'chat-1',
      selectedModel: 'openrouter/model',
      temperature: 0,
      maxTokens: 0,
      systemInstruction: 'Be concise.',
    });

    expect(parsed).toEqual(
      expect.objectContaining({
        action: 'submit',
        chatId: 'chat-1',
        selectedModel: 'openrouter/model',
        temperature: 0,
        maxTokens: 0,
        systemInstruction: 'Be concise.',
      })
    );
  });

  it('ignores non-numeric generation parameters', () => {
    const parsed = parseChatRequestBody({
      temperature: '0.5',
      maxTokens: '1000',
    });

    expect(parsed.temperature).toBeUndefined();
    expect(parsed.maxTokens).toBeUndefined();
  });
});
