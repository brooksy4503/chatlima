import { ChatMessageProcessingService, MessageProcessingContext } from '../chatMessageProcessingService';
import type { UIMessage } from 'ai';

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

describe('ChatMessageProcessingService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const createMockUIMessage = (overrides: Partial<UIMessage> = {}): UIMessage => ({
        id: 'msg123',
        role: 'user',
        content: 'Hello world',
        parts: [{ type: 'text', text: 'Hello world' }],
        ...overrides
    });

    const createMockModelInfo = (overrides: any = {}) => ({
        id: 'openai/gpt-4',
        vision: true,
        name: 'GPT-4',
        ...overrides
    });

    describe('processMessagesWithAttachments', () => {
        it('should return original messages when no attachments', async () => {
            const context: MessageProcessingContext = {
                messages: [createMockUIMessage()],
                attachments: [],
                modelInfo: createMockModelInfo()
            };

            const result = await ChatMessageProcessingService.processMessagesWithAttachments(context);

            expect(result).toEqual({
                messages: context.messages,
                hasAttachments: false
            });

            expect(mockConsoleLog).toHaveBeenCalledWith('[DEBUG] processMessagesWithAttachments called with:', {
                messagesCount: 1,
                attachmentsCount: 0
            });

            expect(mockConsoleLog).toHaveBeenCalledWith('[DEBUG] No attachments, returning original messages');
        });

        it('should throw error when model does not support vision', async () => {
            const context: MessageProcessingContext = {
                messages: [createMockUIMessage()],
                attachments: [{
                    name: 'image.jpg',
                    contentType: 'image/jpeg',
                    url: 'data:image/jpeg;base64,test'
                }],
                modelInfo: createMockModelInfo({ vision: false })
            };

            await expect(ChatMessageProcessingService.processMessagesWithAttachments(context))
                .rejects.toThrow('Selected model openai/gpt-4 does not support image inputs. Please choose a vision-capable model.');

            expect(mockConsoleError).toHaveBeenCalledWith('[ERROR] Model does not support vision:', 'openai/gpt-4');
        });

        it('should process attachments and add them to last user message', async () => {
            const context: MessageProcessingContext = {
                messages: [
                    createMockUIMessage({ role: 'assistant', content: 'Previous response' }),
                    createMockUIMessage({ role: 'user', content: 'Check this image' })
                ],
                attachments: [{
                    name: 'test.jpg',
                    contentType: 'image/jpeg',
                    url: 'data:image/jpeg;base64,testdata'
                }],
                modelInfo: createMockModelInfo()
            };

            const result = await ChatMessageProcessingService.processMessagesWithAttachments(context);

            expect(result.hasAttachments).toBe(true);
            expect(result.messages).toHaveLength(2);

            const lastMessage = result.messages[1];
            expect(lastMessage.role).toBe('user');
            expect(lastMessage.parts).toHaveLength(2);
            expect(lastMessage.parts[0]).toEqual({ type: 'text', text: 'Hello world' });
            expect(lastMessage.parts[1]).toEqual({
                type: 'image_url',
                image_url: {
                    url: 'data:image/jpeg;base64,testdata',
                    detail: 'auto'
                },
                metadata: {
                    filename: 'test.jpg',
                    mimeType: 'image/jpeg',
                    size: 0,
                    width: 0,
                    height: 0
                }
            });
        });

        it('should handle multiple attachments', async () => {
            const context: MessageProcessingContext = {
                messages: [createMockUIMessage({ role: 'user', content: 'Check these images' })],
                attachments: [
                    {
                        name: 'image1.jpg',
                        contentType: 'image/jpeg',
                        url: 'data:image/jpeg;base64,test1'
                    },
                    {
                        name: 'image2.png',
                        contentType: 'image/png',
                        url: 'data:image/png;base64,test2'
                    }
                ],
                modelInfo: createMockModelInfo()
            };

            const result = await ChatMessageProcessingService.processMessagesWithAttachments(context);

            expect(result.hasAttachments).toBe(true);
            const lastMessage = result.messages[0];
            expect(lastMessage.parts).toHaveLength(3); // text + 2 images
        });

        it('should warn when no user message found to attach images to', async () => {
            const context: MessageProcessingContext = {
                messages: [createMockUIMessage({ role: 'assistant', content: 'Response' })],
                attachments: [{
                    name: 'image.jpg',
                    contentType: 'image/jpeg',
                    url: 'data:image/jpeg;base64,test'
                }],
                modelInfo: createMockModelInfo()
            };

            const result = await ChatMessageProcessingService.processMessagesWithAttachments(context);

            expect(result.hasAttachments).toBe(true);
            expect(mockConsoleWarn).toHaveBeenCalledWith('[WARN] No user message found to attach images to, or last message is not from user');
        });

        it('should handle messages without existing parts', async () => {
            const context: MessageProcessingContext = {
                messages: [createMockUIMessage({
                    role: 'user',
                    content: 'Check this',
                    parts: undefined
                })],
                attachments: [{
                    name: 'image.jpg',
                    contentType: 'image/jpeg',
                    url: 'data:image/jpeg;base64,test'
                }],
                modelInfo: createMockModelInfo()
            };

            const result = await ChatMessageProcessingService.processMessagesWithAttachments(context);

            expect(result.hasAttachments).toBe(true);
            const lastMessage = result.messages[0];
            expect(lastMessage.parts).toHaveLength(2);
            expect(lastMessage.parts[0]).toEqual({ type: 'text', text: 'Check this' });
        });

        it('should handle null modelInfo', async () => {
            const context: MessageProcessingContext = {
                messages: [createMockUIMessage()],
                attachments: [{
                    name: 'image.jpg',
                    contentType: 'image/jpeg',
                    url: 'data:image/jpeg;base64,test'
                }],
                modelInfo: null
            };

            await expect(ChatMessageProcessingService.processMessagesWithAttachments(context))
                .rejects.toThrow('Selected model undefined does not support image inputs');
        });
    });

    describe('addModelSpecificInstructions', () => {
        it('should add instructions for DeepSeek R1 models', () => {
            const messages: UIMessage[] = [createMockUIMessage()];

            const result = ChatMessageProcessingService.addModelSpecificInstructions(
                messages,
                "openrouter/deepseek/deepseek-r1"
            );

            expect(result).toHaveLength(2);
            expect(result[0].role).toBe('system');
            expect(result[0].content).toContain('Please provide your reasoning within <think> tags');
            expect(result[1]).toBe(messages[0]);
        });

        it('should add instructions for DeepSeek R1 0528 Qwen3 8B model', () => {
            const messages: UIMessage[] = [createMockUIMessage()];

            const result = ChatMessageProcessingService.addModelSpecificInstructions(
                messages,
                "openrouter/deepseek/deepseek-r1-0528-qwen3-8b"
            );

            expect(result).toHaveLength(2);
            expect(result[0].role).toBe('system');
            expect(result[0].content).toContain('<think>');
        });

        it('should add instructions for QWQ 32B model', () => {
            const messages: UIMessage[] = [createMockUIMessage()];

            const result = ChatMessageProcessingService.addModelSpecificInstructions(
                messages,
                "openrouter/qwen/qwq-32b"
            );

            expect(result).toHaveLength(2);
            expect(result[0].role).toBe('system');
            expect(result[0].content).toContain('<think>');
        });

        it('should return original messages for non-matching models', () => {
            const messages: UIMessage[] = [createMockUIMessage()];

            const result = ChatMessageProcessingService.addModelSpecificInstructions(
                messages,
                "openai/gpt-4"
            );

            expect(result).toEqual(messages);
        });

        it('should handle empty messages array', () => {
            const result = ChatMessageProcessingService.addModelSpecificInstructions(
                [],
                "openrouter/deepseek/deepseek-r1"
            );

            expect(result).toHaveLength(1);
            expect(result[0].role).toBe('system');
        });
    });

    describe('validateMessages', () => {
        it('should validate valid messages', () => {
            const messages: UIMessage[] = [
                createMockUIMessage({ role: 'user', content: 'Hello' }),
                createMockUIMessage({ role: 'assistant', content: 'Hi there' }),
                createMockUIMessage({ role: 'system', content: 'You are helpful' })
            ];

            expect(() => {
                ChatMessageProcessingService.validateMessages(messages);
            }).not.toThrow();
        });

        it('should throw error for empty messages array', () => {
            expect(() => {
                ChatMessageProcessingService.validateMessages([]);
            }).toThrow('Messages array is required and cannot be empty');
        });

        it('should throw error for null messages', () => {
            expect(() => {
                ChatMessageProcessingService.validateMessages(null as any);
            }).toThrow('Messages array is required and cannot be empty');
        });

        it('should throw error for invalid message role', () => {
            const messages: UIMessage[] = [
                createMockUIMessage({ role: 'invalid' as any })
            ];

            expect(() => {
                ChatMessageProcessingService.validateMessages(messages);
            }).toThrow('Invalid message role: invalid');
        });

        it.skip('should throw error for message without content or parts', () => {
            const messages: UIMessage[] = [
                {
                    id: 'msg123',
                    role: 'user',
                    content: '',
                    parts: []
                } as UIMessage
            ];

            expect(() => {
                ChatMessageProcessingService.validateMessages(messages);
            }).toThrow('Message must have either content or parts');
        });

        it('should allow message with only content', () => {
            const messages: UIMessage[] = [
                createMockUIMessage({ content: 'Hello', parts: undefined })
            ];

            expect(() => {
                ChatMessageProcessingService.validateMessages(messages);
            }).not.toThrow();
        });

        it('should allow message with only parts', () => {
            const messages: UIMessage[] = [
                {
                    id: 'msg123',
                    role: 'user',
                    content: '',
                    parts: [{ type: 'text', text: 'Hello' }]
                } as UIMessage
            ];

            expect(() => {
                ChatMessageProcessingService.validateMessages(messages);
            }).not.toThrow();
        });
    });
});