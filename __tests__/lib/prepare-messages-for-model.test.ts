import { prepareMessagesForModel } from '@/lib/chat/prepareMessagesForModel';
import type { UIMessage } from 'ai';

describe('prepareMessagesForModel', () => {
  it('converts UIMessage parts to ModelMessage content for direct providers', async () => {
    const messages: UIMessage[] = [
      {
        id: 'msg-1',
        role: 'user',
        parts: [{ type: 'text', text: 'is pursuing a goal healthy?' }],
      },
    ];

    const result = await prepareMessagesForModel({
      messages,
      attachments: [],
      selectedModel: 'openai/gpt-5-nano',
      modelInfo: null,
    });

    expect(result.formattedMessages).toEqual([
      {
        role: 'user',
        content: [{ type: 'text', text: 'is pursuing a goal healthy?' }],
      },
    ]);
    expect(result.formattedMessages[0]).not.toHaveProperty('parts');
  });
});
