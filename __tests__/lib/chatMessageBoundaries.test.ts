import type { UIMessage } from 'ai';
import {
  convertToDBMessages,
  convertToDBMessagesWithParents,
  convertToUIMessages,
} from '@/lib/chat/messageConversion';
import { buildModelSnapshot } from '@/lib/chat/modelSnapshot';
import { normalizeChatMessages } from '@/lib/chat/normalizeChatMessages';
import {
  modelShouldDisableLogprobs,
  modelUsesReasoningTagInstructions,
} from '@/lib/chat/reasoningModels';

describe('message conversion boundaries', () => {
  it('preserves rich parts and persistence metadata', () => {
    const createdAt = new Date('2026-07-15T01:02:03.000Z');
    const messages = [
      {
        id: 'assistant-1',
        role: 'assistant',
        createdAt,
        parts: [
          { type: 'text', text: 'Answer' },
          { type: 'reasoning', text: 'Reasoning' },
        ],
        hasWebSearch: true,
        webSearchContextSize: 'high',
        modelId: 'openrouter/provider/model',
        modelProvider: 'openrouter',
        modelDisplayName: 'Model',
        comparisonTurnId: 'turn-1',
        parentMessageId: 'user-1',
      },
    ] as Parameters<typeof convertToDBMessages>[0];

    expect(convertToDBMessages(messages, 'chat-1')).toEqual([
      expect.objectContaining({
        id: 'assistant-1',
        chatId: 'chat-1',
        role: 'assistant',
        createdAt,
        parts: messages[0].parts,
        hasWebSearch: true,
        webSearchContextSize: 'high',
        modelId: 'openrouter/provider/model',
        modelProvider: 'openrouter',
        modelDisplayName: 'Model',
        comparisonTurnId: 'turn-1',
        parentMessageId: 'user-1',
      }),
    ]);
  });

  it('falls back to an empty text part and metadata defaults when parts are empty', () => {
    const messageWithoutParts = {
      id: 'user-1',
      role: 'user',
      parts: [],
      createdAt: 'not-a-date',
    } as unknown as UIMessage;

    const [converted] = convertToDBMessages([messageWithoutParts], 'chat-1');

    expect(converted.parts).toEqual([{ type: 'text', text: '' }]);
    expect(converted.createdAt).toBeInstanceOf(Date);
    expect(converted).toEqual(
      expect.objectContaining({
        hasWebSearch: false,
        webSearchContextSize: 'medium',
        modelId: null,
        modelProvider: null,
        modelDisplayName: null,
        comparisonTurnId: null,
        parentMessageId: null,
      })
    );
  });

  it('infers a linear parent chain before persistence', () => {
    const messages: UIMessage[] = [
      { id: 'user-1', role: 'user', parts: [] },
      { id: 'assistant-1', role: 'assistant', parts: [] },
      { id: 'user-2', role: 'user', parts: [] },
    ];

    expect(
      convertToDBMessagesWithParents(messages, 'chat-1').map((message) =>
        message.parentMessageId
      )
    ).toEqual([null, 'user-1', 'assistant-1']);
  });

  it('converts nullable database metadata to stable UI defaults', () => {
    const dbMessage = {
      id: 'assistant-1',
      chatId: 'chat-1',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Answer' }],
      createdAt: new Date('2026-07-15T01:02:03.000Z'),
      hasWebSearch: null,
      webSearchContextSize: null,
      modelId: null,
      modelProvider: null,
      modelDisplayName: null,
      comparisonTurnId: null,
      parentMessageId: null,
    } as Parameters<typeof convertToUIMessages>[0][number];

    expect(convertToUIMessages([dbMessage])).toEqual([
      expect.objectContaining({
        id: 'assistant-1',
        hasWebSearch: false,
        webSearchContextSize: 'medium',
        modelId: null,
        modelProvider: null,
        modelDisplayName: null,
        comparisonTurnId: null,
        parentMessageId: null,
      }),
    ]);
  });
});

describe('chat message metadata helpers', () => {
  it('derives model provider and display name from the selected model', () => {
    expect(
      buildModelSnapshot({ selectedModel: 'openrouter/provider/model-name' })
    ).toEqual({
      modelId: 'openrouter/provider/model-name',
      modelProvider: 'openrouter',
      modelDisplayName: 'model-name',
    });
  });

  it('preserves explicit model snapshot overrides, including null', () => {
    expect(
      buildModelSnapshot({
        selectedModel: 'standalone-model',
        modelProvider: null,
        modelDisplayName: 'Friendly Model',
      })
    ).toEqual({
      modelId: 'standalone-model',
      modelProvider: null,
      modelDisplayName: 'Friendly Model',
    });
  });

  it('normalizes only the persisted chat fields', () => {
    const source = {
      id: 'assistant-1',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Answer' }],
      createdAt: new Date('2026-07-15T01:02:03.000Z'),
      modelId: 'model-1',
      transient: 'drop me',
    } as Parameters<typeof normalizeChatMessages>[0][number] & {
      transient: string;
    };

    expect(normalizeChatMessages([source])).toEqual([
      {
        id: 'assistant-1',
        role: 'assistant',
        parts: source.parts,
        createdAt: source.createdAt,
        hasWebSearch: undefined,
        webSearchContextSize: undefined,
        modelId: 'model-1',
        modelProvider: undefined,
        modelDisplayName: undefined,
        comparisonTurnId: undefined,
        parentMessageId: undefined,
      },
    ]);
  });
});

describe('reasoning model classification', () => {
  it('recognizes models requiring tag-based reasoning instructions', () => {
    expect(
      modelUsesReasoningTagInstructions('openrouter/deepseek/deepseek-r1')
    ).toBe(true);
    expect(modelUsesReasoningTagInstructions('openrouter/provider/model')).toBe(
      false
    );
  });

  it('disables logprobs for exact reasoning models and MiniMax M2 variants', () => {
    expect(modelShouldDisableLogprobs('openrouter/qwen/qwq-32b')).toBe(true);
    expect(modelShouldDisableLogprobs('openrouter/minimax/m2.1')).toBe(true);
    expect(modelShouldDisableLogprobs('openrouter/minimax-m2-preview')).toBe(true);
    expect(modelShouldDisableLogprobs('openrouter/provider/model')).toBe(false);
  });
});
