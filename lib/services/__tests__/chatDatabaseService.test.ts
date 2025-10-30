import { ChatDatabaseService, ChatCreationContext, MessageSavingContext } from '../chatDatabaseService';
import type { UIMessage } from 'ai';
import type { TextUIPart, ToolInvocationUIPart, ImageUIPart, ReasoningUIPart, SourceUIPart, FileUIPart, StepStartUIPart } from '@ai-sdk/ui-utils';

// Define DBMessage type for testing
type DBMessage = {
    id: string;
    chatId: string;
    role: string;
    parts: Array<TextUIPart | ToolInvocationUIPart | ImageUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
    createdAt: Date;
    hasWebSearch?: boolean;
    webSearchContextSize?: 'low' | 'medium' | 'high';
};

type Chat = {
    id: string;
    userId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
};

// Mock dependencies
jest.mock('@/lib/chat-store', () => ({
    saveChat: jest.fn(),
    saveMessages: jest.fn(),
    convertToDBMessages: jest.fn()
}));

jest.mock('@/lib/db', () => ({
    db: {
        query: {
            chats: {
                findFirst: jest.fn()
            }
        }
    }
}));

jest.mock('@/lib/db/schema', () => ({
    chats: {
        id: 'chats.id',
        userId: 'chats.userId'
    }
}));

jest.mock('drizzle-orm', () => ({
    eq: jest.fn(),
    and: jest.fn()
}));

jest.mock('@/lib/utils/performantLogging', () => ({
    logDiagnostic: jest.fn()
}));

import { saveChat, saveMessages, convertToDBMessages } from '@/lib/chat-store';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { logDiagnostic } from '@/lib/utils/performantLogging';

describe('ChatDatabaseService', () => {
    const mockSaveChat = saveChat as jest.MockedFunction<typeof saveChat>;
    const mockSaveMessages = saveMessages as jest.MockedFunction<typeof saveMessages>;
    const mockConvertToDBMessages = convertToDBMessages as jest.MockedFunction<typeof convertToDBMessages>;
    const mockFindFirst = db.query.chats.findFirst as jest.MockedFunction<typeof db.query.chats.findFirst>;
    const mockEq = eq as jest.MockedFunction<typeof eq>;
    const mockAnd = and as jest.MockedFunction<typeof and>;
    const mockLogDiagnostic = logDiagnostic as jest.MockedFunction<typeof logDiagnostic>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const createMockChatContext = (overrides: Partial<ChatCreationContext> = {}): ChatCreationContext => ({
        id: 'chat123',
        userId: 'user456',
        selectedModel: 'openai/gpt-4',
        apiKeys: { 'OPENAI_API_KEY': 'sk-test' },
        isAnonymous: false,
        messages: [
            {
                id: 'msg1',
                role: 'user',
                content: 'Hello',
                parts: [{ type: 'text', text: 'Hello' } as TextUIPart]
            },
            {
                id: 'msg2',
                role: 'assistant',
                content: 'Hi there',
                parts: [{ type: 'text', text: 'Hi there' } as TextUIPart]
            }
        ] as UIMessage[],
        ...overrides
    });

    const createMockMessageContext = (overrides: Partial<MessageSavingContext> = {}): MessageSavingContext => ({
        messages: [
            { id: 'msg1', role: 'user', content: 'Hello', hasWebSearch: false },
            { id: 'msg2', role: 'assistant', content: 'Hi there', hasWebSearch: true, webSearchContextSize: 'medium' }
        ],
        hasWebSearch: true,
        webSearchContextSize: 'medium',
        ...overrides
    });

    describe('saveChatToDatabase', () => {
        it('should save chat successfully', async () => {
            const context = createMockChatContext();
            mockSaveChat.mockResolvedValue({ id: 'chat123' });

            const result = await ChatDatabaseService.saveChatToDatabase(context);

            expect(result).toEqual({
                success: true,
                chatId: 'chat123'
            });

            expect(mockSaveChat).toHaveBeenCalledWith({
                id: 'chat123',
                userId: 'user456',
                messages: context.messages,
                selectedModel: 'openai/gpt-4',
                apiKeys: { 'OPENAI_API_KEY': 'sk-test' },
                isAnonymous: false,
                title: undefined
            });

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'CHAT_SAVE_START',
                'Starting chat save operation',
                expect.objectContaining({
                    requestId: expect.any(String),
                    chatId: 'chat123',
                    userId: 'user456'
                })
            );
        });

        it('should handle save chat errors', async () => {
            const context = createMockChatContext();
            const error = new Error('Database connection failed');
            mockSaveChat.mockRejectedValue(error);

            const result = await ChatDatabaseService.saveChatToDatabase(context);

            expect(result).toEqual({
                success: false,
                chatId: 'chat123',
                error: 'Database connection failed'
            });

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'CHAT_SAVE_ERROR',
                'Error saving chat',
                expect.objectContaining({
                    requestId: expect.any(String),
                    chatId: 'chat123',
                    userId: 'user456',
                    error: 'Database connection failed'
                })
            );
        });

        it('should save chat with title', async () => {
            const context = createMockChatContext({ title: 'Test Chat' });
            mockSaveChat.mockResolvedValue({ id: 'chat123' });

            await ChatDatabaseService.saveChatToDatabase(context);

            expect(mockSaveChat).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Test Chat'
                })
            );
        });
    });

    describe('saveMessagesToDatabase', () => {
        it('should save messages successfully', async () => {
            const context = createMockMessageContext();
            mockSaveMessages.mockResolvedValue(null);

            const result = await ChatDatabaseService.saveMessagesToDatabase(context);

            expect(result).toEqual({
                success: true,
                messageCount: 2
            });

            expect(mockSaveMessages).toHaveBeenCalledWith({
                messages: [
                    { id: 'msg1', role: 'user', content: 'Hello', hasWebSearch: false, webSearchContextSize: 'medium' },
                    {
                        id: 'msg2',
                        role: 'assistant',
                        content: 'Hi there',
                        hasWebSearch: true,
                        webSearchContextSize: 'medium'
                    }
                ]
            });

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MESSAGES_SAVE_START',
                'Starting messages save operation',
                expect.objectContaining({
                    requestId: expect.any(String),
                    messageCount: 2
                })
            );
        });

        it('should handle save messages errors', async () => {
            const context = createMockMessageContext();
            const error = new Error('Messages save failed');
            mockSaveMessages.mockRejectedValue(error);

            const result = await ChatDatabaseService.saveMessagesToDatabase(context);

            expect(result).toEqual({
                success: false,
                messageCount: 2,
                error: 'Messages save failed'
            });

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MESSAGES_SAVE_ERROR',
                'Error saving messages',
                expect.objectContaining({
                    requestId: expect.any(String),
                    messageCount: 2,
                    error: 'Messages save failed'
                })
            );
        });

        it('should handle messages without web search metadata', async () => {
            const context = createMockMessageContext({
                messages: [
                    { id: 'msg1', role: 'user', content: 'Hello' },
                    { id: 'msg2', role: 'assistant', content: 'Hi there' }
                ],
                hasWebSearch: false
            });
            mockSaveMessages.mockResolvedValue(null);

            await ChatDatabaseService.saveMessagesToDatabase(context);

            expect(mockSaveMessages).toHaveBeenCalledWith({
                messages: [
                    { id: 'msg1', role: 'user', content: 'Hello', hasWebSearch: false },
                    { id: 'msg2', role: 'assistant', content: 'Hi there', hasWebSearch: false, webSearchContextSize: undefined }
                ]
            });
        });
    });

    describe('convertMessagesForDatabase', () => {
        it('should convert messages successfully', () => {
            const messages = [
                { id: 'msg1', role: 'user', content: 'Hello' },
                { id: 'msg2', role: 'assistant', content: 'Hi there' }
            ];
            const chatId = 'chat123';
            const convertedMessages = [
                { id: 'msg1', chatId: 'chat123', role: 'user', content: 'Hello' },
                { id: 'msg2', chatId: 'chat123', role: 'assistant', content: 'Hi there' }
            ];

            mockConvertToDBMessages.mockReturnValue(convertedMessages);

            const result = ChatDatabaseService.convertMessagesForDatabase(messages, chatId);

            expect(result).toEqual(convertedMessages);
            expect(mockConvertToDBMessages).toHaveBeenCalledWith(messages, chatId);
        });

        it('should handle conversion errors', () => {
            const messages = [{ id: 'msg1', role: 'user', content: 'Hello' }];
            const chatId = 'chat123';
            const error = new Error('Conversion failed');

            mockConvertToDBMessages.mockImplementation(() => {
                throw error;
            });

            expect(() => {
                ChatDatabaseService.convertMessagesForDatabase(messages, chatId);
            }).toThrow(error);

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MESSAGE_CONVERSION_ERROR',
                'Error converting messages for database',
                expect.objectContaining({
                    chatId: 'chat123',
                    messageCount: 1,
                    error: 'Conversion failed'
                })
            );
        });
    });

    describe('checkChatExists', () => {
        it('should return true when chat exists', async () => {
            const chatId = 'chat123';
            const userId = 'user456';
            const mockChat = { id: chatId, userId };

            mockFindFirst.mockResolvedValue(mockChat);
            mockEq.mockReturnValue('eq_mock' as any);
            mockAnd.mockReturnValue('and_mock' as any);

            const result = await ChatDatabaseService.checkChatExists({ chatId, userId });

            expect(result).toBe(true);
            expect(mockFindFirst).toHaveBeenCalledWith({
                where: 'and_mock'
            });
            expect(mockEq).toHaveBeenCalledWith(chats.id, chatId);
            expect(mockEq).toHaveBeenCalledWith(chats.userId, userId);
            expect(mockAnd).toHaveBeenCalledWith('eq_mock', 'eq_mock');

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'CHAT_EXISTS_CHECK_START',
                'Checking if chat exists',
                expect.objectContaining({
                    requestId: expect.any(String),
                    chatId: 'chat123',
                    userId: 'user456'
                })
            );
        });

        it('should return false when chat does not exist', async () => {
            const chatId = 'chat123';
            const userId = 'user456';

            mockFindFirst.mockResolvedValue(null);
            mockEq.mockReturnValue('eq_mock' as any);
            mockAnd.mockReturnValue('and_mock' as any);

            const result = await ChatDatabaseService.checkChatExists({ chatId, userId });

            expect(result).toBe(false);
            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'CHAT_EXISTS_CHECK_COMPLETE',
                'Chat existence check completed',
                expect.objectContaining({
                    chatId: 'chat123',
                    userId: 'user456',
                    exists: false
                })
            );
        });

        it('should return false on database error', async () => {
            const chatId = 'chat123';
            const userId = 'user456';
            const error = new Error('Database error');

            mockFindFirst.mockRejectedValue(error);
            mockEq.mockReturnValue('eq_mock' as any);
            mockAnd.mockReturnValue('and_mock' as any);

            const result = await ChatDatabaseService.checkChatExists({ chatId, userId });

            expect(result).toBe(false);
            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'CHAT_EXISTS_CHECK_ERROR',
                'Error checking chat existence',
                expect.objectContaining({
                    chatId: 'chat123',
                    userId: 'user456',
                    error: 'Database error'
                })
            );
        });
    });

    describe('createChatIfNotExists', () => {
        it('should return success when chat already exists', async () => {
            const context = createMockChatContext();
            mockFindFirst.mockResolvedValue({ id: 'chat123', userId: 'user456' });
            mockEq.mockReturnValue('eq_mock' as any);
            mockAnd.mockReturnValue('and_mock' as any);

            const result = await ChatDatabaseService.createChatIfNotExists(context);

            expect(result).toEqual({
                success: true,
                chatId: 'chat123'
            });

            expect(mockSaveChat).not.toHaveBeenCalled();
            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'CHAT_PREEMPTIVE_SKIP',
                'Chat already exists, skipping pre-emptive creation',
                expect.objectContaining({
                    chatId: 'chat123',
                    userId: 'user456'
                })
            );
        });

        it('should create chat when it does not exist', async () => {
            const context = createMockChatContext();
            mockFindFirst.mockResolvedValue(null);
            mockSaveChat.mockResolvedValue({ id: 'chat123' });
            mockEq.mockReturnValue('eq_mock' as any);
            mockAnd.mockReturnValue('and_mock' as any);

            const result = await ChatDatabaseService.createChatIfNotExists(context);

            expect(result).toEqual({
                success: true,
                chatId: 'chat123'
            });

            expect(mockSaveChat).toHaveBeenCalledWith({
                id: 'chat123',
                userId: 'user456',
                messages: [],
                selectedModel: 'openai/gpt-4',
                apiKeys: { 'OPENAI_API_KEY': 'sk-test' },
                isAnonymous: false,
                title: undefined
            });

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'CHAT_PREEMPTIVE_CREATE',
                'Pre-emptively creating chat',
                expect.objectContaining({
                    chatId: 'chat123',
                    userId: 'user456'
                })
            );
        });
    });

    describe('saveChatAndMessages', () => {
        it('should save both chat and messages successfully', async () => {
            const chatContext = createMockChatContext();
            const messageContext = createMockMessageContext();

            mockSaveChat.mockResolvedValue({ id: 'chat123' });
            mockSaveMessages.mockResolvedValue(null);

            const result = await ChatDatabaseService.saveChatAndMessages(chatContext, messageContext);

            expect(result).toEqual({
                success: true,
                chatId: 'chat123',
                messageCount: 2
            });

            expect(mockSaveChat).toHaveBeenCalled();
            expect(mockSaveMessages).toHaveBeenCalled();

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'CHAT_AND_MESSAGES_SAVE_START',
                'Starting combined chat and messages save',
                expect.objectContaining({
                    requestId: expect.any(String),
                    chatId: 'chat123',
                    userId: 'user456',
                    messageCount: 2
                })
            );
        });

        it('should handle chat save failure', async () => {
            const chatContext = createMockChatContext();
            const messageContext = createMockMessageContext();
            const chatError = new Error('Chat save failed');

            mockSaveChat.mockRejectedValue(chatError);

            const result = await ChatDatabaseService.saveChatAndMessages(chatContext, messageContext);

            expect(result).toEqual({
                success: false,
                chatId: 'chat123',
                error: 'Failed to save chat: Chat save failed'
            });

            expect(mockSaveMessages).not.toHaveBeenCalled();
        });

        it('should handle messages save failure', async () => {
            const chatContext = createMockChatContext();
            const messageContext = createMockMessageContext();
            const messageError = new Error('Messages save failed');

            mockSaveChat.mockResolvedValue({ id: 'chat123' });
            mockSaveMessages.mockRejectedValue(messageError);

            const result = await ChatDatabaseService.saveChatAndMessages(chatContext, messageContext);

            expect(result).toEqual({
                success: false,
                chatId: 'chat123',
                error: 'Failed to save messages: Messages save failed'
            });
        });
    });

    describe('updateChatWithMessages', () => {
        it('should update chat with messages successfully', async () => {
            const chatId = 'chat123';
            const userId = 'user456';
            const messages = [
                { id: 'msg1', role: 'user', content: 'Hello' },
                { id: 'msg2', role: 'assistant', content: 'Hi there' }
            ];
            const selectedModel = 'openai/gpt-4';
            const apiKeys = { 'OPENAI_API_KEY': 'sk-test' };
            const isAnonymous = false;

            mockSaveChat.mockResolvedValue({ id: 'chat123' });

            const result = await ChatDatabaseService.updateChatWithMessages(
                chatId,
                userId,
                messages,
                selectedModel,
                apiKeys,
                isAnonymous
            );

            expect(result).toEqual({
                success: true,
                chatId: 'chat123',
                messageCount: 2
            });

            expect(mockSaveChat).toHaveBeenCalledWith({
                id: 'chat123',
                userId: 'user456',
                messages,
                selectedModel: 'openai/gpt-4',
                apiKeys: { 'OPENAI_API_KEY': 'sk-test' },
                isAnonymous: false
            });

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'CHAT_UPDATE_START',
                'Starting chat update with messages',
                expect.objectContaining({
                    requestId: expect.any(String),
                    chatId: 'chat123',
                    userId: 'user456',
                    messageCount: 2
                })
            );
        });

        it('should handle update errors', async () => {
            const chatId = 'chat123';
            const userId = 'user456';
            const messages = [{ id: 'msg1', role: 'user', content: 'Hello' }];
            const selectedModel = 'openai/gpt-4';
            const error = new Error('Update failed');

            mockSaveChat.mockRejectedValue(error);

            const result = await ChatDatabaseService.updateChatWithMessages(
                chatId,
                userId,
                messages,
                selectedModel
            );

            expect(result).toEqual({
                success: false,
                chatId: 'chat123',
                error: 'Update failed'
            });

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'CHAT_UPDATE_ERROR',
                'Error updating chat',
                expect.objectContaining({
                    requestId: expect.any(String),
                    chatId: 'chat123',
                    userId: 'user456',
                    error: 'Update failed'
                })
            );
        });

        it('should handle default parameters', async () => {
            const chatId = 'chat123';
            const userId = 'user456';
            const messages = [{ id: 'msg1', role: 'user', content: 'Hello' }];
            const selectedModel = 'openai/gpt-4';

            mockSaveChat.mockResolvedValue({ id: 'chat123' });

            await ChatDatabaseService.updateChatWithMessages(
                chatId,
                userId,
                messages,
                selectedModel
            );

            expect(mockSaveChat).toHaveBeenCalledWith({
                id: 'chat123',
                userId: 'user456',
                messages,
                selectedModel: 'openai/gpt-4',
                apiKeys: undefined,
                isAnonymous: false
            });
        });
    });
});