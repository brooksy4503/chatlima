import { saveChat, saveMessages, convertToDBMessages } from '@/lib/chat-store';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { logDiagnostic } from '@/lib/utils/performantLogging';
import type { UIMessage } from 'ai';

export interface ChatCreationContext {
    id: string;
    userId: string;
    selectedModel: string;
    apiKeys?: Record<string, string>;
    isAnonymous: boolean;
    messages?: UIMessage[];
    title?: string;
}

export interface MessageSavingContext {
    messages: any[];
    hasWebSearch?: boolean;
    webSearchContextSize?: 'low' | 'medium' | 'high';
}

export interface ChatExistenceCheck {
    chatId: string;
    userId: string;
}

export interface DatabaseOperationResult {
    success: boolean;
    chatId?: string;
    messageCount?: number;
    error?: string;
}

export class ChatDatabaseService {
    /**
     * Creates or updates a chat in the database
     */
    static async saveChatToDatabase(context: ChatCreationContext): Promise<DatabaseOperationResult> {
        const { id, userId, messages, selectedModel, apiKeys, isAnonymous, title } = context;

        const requestId = `db_save_chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        logDiagnostic('CHAT_SAVE_START', 'Starting chat save operation', {
            requestId,
            chatId: id,
            userId,
            messageCount: messages?.length || 0,
            selectedModel,
            isAnonymous,
            hasTitle: !!title
        });

        try {
            await saveChat({
                id,
                userId,
                messages: messages || [],
                selectedModel,
                apiKeys,
                isAnonymous,
                title
            });

            logDiagnostic('CHAT_SAVE_SUCCESS', 'Chat saved successfully', {
                requestId,
                chatId: id,
                userId
            });

            return {
                success: true,
                chatId: id
            };

        } catch (error) {
            logDiagnostic('CHAT_SAVE_ERROR', 'Error saving chat', {
                requestId,
                chatId: id,
                userId,
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                success: false,
                chatId: id,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Saves messages to the database
     */
    static async saveMessagesToDatabase(context: MessageSavingContext): Promise<DatabaseOperationResult> {
        const { messages, hasWebSearch, webSearchContextSize } = context;

        const requestId = `db_save_messages_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        logDiagnostic('MESSAGES_SAVE_START', 'Starting messages save operation', {
            requestId,
            messageCount: messages.length,
            hasWebSearch,
            webSearchContextSize
        });

        try {
            // Add web search metadata to messages if applicable
            const messagesWithMetadata = messages.map(msg => ({
                ...msg,
                hasWebSearch: hasWebSearch && msg.role === 'assistant',
                webSearchContextSize: hasWebSearch ? webSearchContextSize : undefined
            }));

            await saveMessages({ messages: messagesWithMetadata });

            logDiagnostic('MESSAGES_SAVE_SUCCESS', 'Messages saved successfully', {
                requestId,
                messageCount: messages.length
            });

            return {
                success: true,
                messageCount: messages.length
            };

        } catch (error) {
            logDiagnostic('MESSAGES_SAVE_ERROR', 'Error saving messages', {
                requestId,
                messageCount: messages.length,
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                success: false,
                messageCount: messages.length,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Converts UI messages to database format
     */
    static convertMessagesForDatabase(messages: UIMessage[], chatId: string): any[] {
        try {
            return convertToDBMessages(messages as any, chatId);
        } catch (error) {
            logDiagnostic('MESSAGE_CONVERSION_ERROR', 'Error converting messages for database', {
                chatId,
                messageCount: messages.length,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Checks if a chat exists for the given user
     */
    static async checkChatExists(context: ChatExistenceCheck): Promise<boolean> {
        const { chatId, userId } = context;

        const requestId = `db_check_chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        logDiagnostic('CHAT_EXISTS_CHECK_START', 'Checking if chat exists', {
            requestId,
            chatId,
            userId
        });

        try {
            const existingChat = await db.query.chats.findFirst({
                where: and(
                    eq(chats.id, chatId),
                    eq(chats.userId, userId)
                )
            });

            const exists = !!existingChat;

            logDiagnostic('CHAT_EXISTS_CHECK_COMPLETE', 'Chat existence check completed', {
                requestId,
                chatId,
                userId,
                exists
            });

            return exists;

        } catch (error) {
            logDiagnostic('CHAT_EXISTS_CHECK_ERROR', 'Error checking chat existence', {
                requestId,
                chatId,
                userId,
                error: error instanceof Error ? error.message : String(error)
            });
            // Return false on error to allow chat creation
            return false;
        }
    }

    /**
     * Pre-emptively creates a chat if it doesn't exist
     */
    static async createChatIfNotExists(context: ChatCreationContext): Promise<DatabaseOperationResult> {
        const { id, userId } = context;

        // Check if chat already exists
        const exists = await this.checkChatExists({ chatId: id, userId });

        if (exists) {
            logDiagnostic('CHAT_PREEMPTIVE_SKIP', 'Chat already exists, skipping pre-emptive creation', {
                chatId: id,
                userId
            });
            return {
                success: true,
                chatId: id
            };
        }

        // Create chat with empty messages (will be updated later)
        const createContext: ChatCreationContext = {
            ...context,
            messages: []
        };

        logDiagnostic('CHAT_PREEMPTIVE_CREATE', 'Pre-emptively creating chat', {
            chatId: id,
            userId
        });

        return await this.saveChatToDatabase(createContext);
    }

    /**
     * Saves both chat and messages in a transaction-like manner
     */
    static async saveChatAndMessages(
        chatContext: ChatCreationContext,
        messageContext: MessageSavingContext
    ): Promise<DatabaseOperationResult> {
        const requestId = `db_save_both_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        logDiagnostic('CHAT_AND_MESSAGES_SAVE_START', 'Starting combined chat and messages save', {
            requestId,
            chatId: chatContext.id,
            userId: chatContext.userId,
            messageCount: messageContext.messages.length
        });

        try {
            // Save chat first
            const chatResult = await this.saveChatToDatabase(chatContext);
            if (!chatResult.success) {
                throw new Error(`Failed to save chat: ${chatResult.error}`);
            }

            // Save messages
            const messageResult = await this.saveMessagesToDatabase(messageContext);
            if (!messageResult.success) {
                throw new Error(`Failed to save messages: ${messageResult.error}`);
            }

            logDiagnostic('CHAT_AND_MESSAGES_SAVE_SUCCESS', 'Combined save completed successfully', {
                requestId,
                chatId: chatContext.id,
                userId: chatContext.userId,
                messageCount: messageContext.messages.length
            });

            return {
                success: true,
                chatId: chatContext.id,
                messageCount: messageContext.messages.length
            };

        } catch (error) {
            logDiagnostic('CHAT_AND_MESSAGES_SAVE_ERROR', 'Error in combined save operation', {
                requestId,
                chatId: chatContext.id,
                userId: chatContext.userId,
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                success: false,
                chatId: chatContext.id,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Updates chat with new messages (for streaming completions)
     */
    static async updateChatWithMessages(
        chatId: string,
        userId: string,
        messages: UIMessage[],
        selectedModel: string,
        apiKeys?: Record<string, string>,
        isAnonymous: boolean = false
    ): Promise<DatabaseOperationResult> {
        const requestId = `db_update_chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        logDiagnostic('CHAT_UPDATE_START', 'Starting chat update with messages', {
            requestId,
            chatId,
            userId,
            messageCount: messages.length,
            selectedModel
        });

        try {
            await saveChat({
                id: chatId,
                userId,
                messages,
                selectedModel,
                apiKeys,
                isAnonymous
            });

            logDiagnostic('CHAT_UPDATE_SUCCESS', 'Chat updated successfully', {
                requestId,
                chatId,
                userId,
                messageCount: messages.length
            });

            return {
                success: true,
                chatId,
                messageCount: messages.length
            };

        } catch (error) {
            logDiagnostic('CHAT_UPDATE_ERROR', 'Error updating chat', {
                requestId,
                chatId,
                userId,
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                success: false,
                chatId,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}