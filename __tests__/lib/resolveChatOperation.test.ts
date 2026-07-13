import type { ChatRequestBody } from '@/lib/chat/chatRequest';
import { resolveChatOperation } from '@/lib/chat/resolveChatOperation';
import { ConversationPersistenceService } from '@/lib/services/conversationPersistence';

jest.mock('@/lib/services/conversationPersistence', () => ({
  ConversationPersistenceService: {
    loadChatGraph: jest.fn(),
  },
}));

const loadChatGraph = ConversationPersistenceService.loadChatGraph as jest.MockedFunction<
  typeof ConversationPersistenceService.loadChatGraph
>;

function makeBody(overrides: Partial<ChatRequestBody> = {}): ChatRequestBody {
  return {
    chatId: 'client-generated-chat',
    operation: { type: 'continue' },
    messages: [
      {
        id: 'user-1',
        role: 'user',
        parts: [{ type: 'text', text: 'Hello' }],
      },
    ],
    selectedModel: 'openrouter/test-model',
    mcpServers: [],
    webSearch: { enabled: false, contextSize: 'medium' },
    imageGeneration: { enabled: false },
    apiKeys: {},
    attachments: [],
    ...overrides,
  };
}

describe('resolveChatOperation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows a first continue request with a client-generated chat ID', async () => {
    loadChatGraph.mockResolvedValue(null);
    const body = makeBody();

    await expect(
      resolveChatOperation({ body, userId: 'user-1' })
    ).resolves.toEqual({
      kind: 'stream',
      messages: body.messages,
    });
  });

  it('rejects branch operations when the chat does not exist', async () => {
    loadChatGraph.mockResolvedValue(null);

    await expect(
      resolveChatOperation({
        body: makeBody({
          operation: {
            type: 'regenerate',
            assistantMessageId: 'assistant-1',
            attemptId: 'attempt-1',
          },
        }),
        userId: 'user-1',
      })
    ).resolves.toEqual({
      kind: 'error',
      code: 'CHAT_NOT_FOUND',
      message: 'Chat not found',
      status: 404,
    });
  });

  it('keeps the server active path when the client sends a divergent continue transcript', async () => {
    loadChatGraph.mockResolvedValue({
      chat: { id: 'chat-1' },
      dbMessages: [],
      allMessages: [
        { id: 'u1', role: 'user', parentMessageId: null },
        { id: 'a1', role: 'assistant', parentMessageId: 'u1' },
        { id: 'a1b', role: 'assistant', parentMessageId: 'u1' },
      ],
      activeLeafMessageId: 'a1',
      activePathMessages: [
        { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] },
        { id: 'a1', role: 'assistant', parts: [{ type: 'text', text: 'Hello' }] },
      ],
    });

    const body = makeBody({
      chatId: 'chat-1',
      messages: [
        { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] },
        { id: 'a1b', role: 'assistant', parts: [{ type: 'text', text: 'Other branch' }] },
      ],
    });

    await expect(
      resolveChatOperation({ body, userId: 'user-1' })
    ).resolves.toEqual({
      kind: 'stream',
      messages: [
        { id: 'u1', role: 'user', parentMessageId: null },
        { id: 'a1', role: 'assistant', parentMessageId: 'u1' },
      ],
      activeLeafMessageId: 'a1',
    });
  });
});
