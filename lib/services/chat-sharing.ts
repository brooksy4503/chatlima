import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import { chats, messages, chatShares } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { MessageRole } from '@/lib/db/schema';

// Types for chat sharing
export interface ChatSnapshot {
    version: number;
    chat: {
        title: string;
        createdAt: string;
    };
    messages: SnapshotMessage[];
    metadata: {
        models: string[];
        redaction: {
            hideSystemPrompts: boolean;
            hideToolArgs: boolean;
            excludeMedia: boolean;
            piiRemoved: boolean;
        };
    };
}

export interface SnapshotMessage {
    id: string;
    role: MessageRole;
    content: string;
    createdAt: string;
    hasWebSearch?: boolean;
    citations?: Array<{
        url: string;
        title: string;
        content?: string;
        startIndex: number;
        endIndex: number;
        source?: string;
    }>;
}

// Generate secure share ID
export function generateShareId(): string {
    return nanoid(32);
}

// Pre-compiled RegExp patterns for better compilation performance
const PII_PATTERNS = [
    // Email addresses
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    // API keys (common patterns)
    /\b[A-Za-z0-9]{20,}\b/g,
    // Phone numbers (various formats)
    /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    // Credit card numbers
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    // SSN patterns
    /\b\d{3}-\d{2}-\d{4}\b/g,
];

// Redaction utilities
class RedactionService {

    static redactPII(text: string): string {
        let redacted = text;

        for (const pattern of PII_PATTERNS) {
            redacted = redacted.replace(pattern, '[REDACTED]');
        }

        return redacted;
    }

    static sanitizeMessage(message: any): SnapshotMessage | null {
        // Skip system messages and tool calls
        if (message.role === 'tool') {
            return null;
        }

        // Extract text content and citations from parts
        let content = '';
        const citations: any[] = [];

        if (message.parts && Array.isArray(message.parts)) {
            for (const part of message.parts) {
                if (part.type === 'text' && part.text) {
                    content += part.text;
                    // Extract citations from text parts
                    if (part.citations && Array.isArray(part.citations)) {
                        citations.push(...part.citations);
                    }
                }
                // Skip media/attachments (images, files, etc.)
            }
        }

        // Redact PII from content
        content = this.redactPII(content);

        return {
            id: message.id,
            role: message.role as MessageRole,
            content,
            createdAt: message.createdAt.toISOString(),
            hasWebSearch: message.hasWebSearch || false,
            citations: citations.length > 0 ? citations : undefined,
        };
    }
}

// Chat sharing service
export class ChatSharingService {
    // Verify chat ownership and get chat data
    private static async getChatWithOwnership(chatId: string, userId: string) {
        const chat = await db
            .select()
            .from(chats)
            .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
            .limit(1);

        if (chat.length === 0) {
            throw new Error('Chat not found or access denied');
        }
        return chat[0];
    }

    // Get and sanitize messages for a chat
    private static async getSanitizedMessages(chatId: string): Promise<SnapshotMessage[]> {
        const chatMessages = await db
            .select()
            .from(messages)
            .where(eq(messages.chatId, chatId))
            .orderBy(messages.createdAt);

        const sanitizedMessages: SnapshotMessage[] = [];
        for (const message of chatMessages) {
            const sanitized = RedactionService.sanitizeMessage(message);
            if (sanitized) {
                sanitizedMessages.push(sanitized);
            }
        }
        return sanitizedMessages;
    }

    // Create a sanitized snapshot of a chat
    static async createSnapshot(chatId: string, userId: string): Promise<ChatSnapshot> {
        const chat = await this.getChatWithOwnership(chatId, userId);
        const sanitizedMessages = await this.getSanitizedMessages(chatId);

        return {
            version: 1,
            chat: {
                title: chat.title,
                createdAt: chat.createdAt.toISOString(),
            },
            messages: sanitizedMessages,
            metadata: {
                models: [],
                redaction: {
                    hideSystemPrompts: true,
                    hideToolArgs: true,
                    excludeMedia: true,
                    piiRemoved: true,
                },
            },
        };
    }

    // Get existing share for a chat (without creating a new one)
    static async getExistingShare(chatId: string, userId: string, baseUrl: string): Promise<{ shareId: string; shareUrl: string } | null> {
        // Check if an active share already exists
        const existingShare = await db
            .select()
            .from(chatShares)
            .where(and(
                eq(chatShares.chatId, chatId),
                eq(chatShares.ownerUserId, userId),
                eq(chatShares.status, 'active')
            ))
            .limit(1);

        if (existingShare.length > 0) {
            const share = existingShare[0];
            return {
                shareId: share.shareId,
                shareUrl: `${baseUrl}/chats/shared/${share.shareId}`,
            };
        }

        return null;
    }

    // Create or get existing share for a chat
    static async createShare(chatId: string, userId: string, baseUrl: string): Promise<{ shareId: string; shareUrl: string }> {
        // Check if an active share already exists
        const existingShare = await db
            .select()
            .from(chatShares)
            .where(and(
                eq(chatShares.chatId, chatId),
                eq(chatShares.ownerUserId, userId),
                eq(chatShares.status, 'active')
            ))
            .limit(1);

        if (existingShare.length > 0) {
            const share = existingShare[0];
            return {
                shareId: share.shareId,
                shareUrl: `${baseUrl}/chats/shared/${share.shareId}`,
            };
        }

        // Create new snapshot
        const snapshot = await this.createSnapshot(chatId, userId);
        const shareId = generateShareId();

        // Insert new share
        await db.insert(chatShares).values({
            chatId,
            ownerUserId: userId,
            shareId,
            status: 'active',
            visibility: 'unlisted',
            snapshotJson: snapshot,
            viewCount: 0,
        });

        return {
            shareId,
            shareUrl: `${baseUrl}/chats/shared/${shareId}`,
        };
    }

    // Revoke a chat share
    static async revokeShare(chatId: string, userId: string): Promise<void> {
        await db
            .update(chatShares)
            .set({
                status: 'revoked',
                revokedAt: new Date(),
            })
            .where(and(
                eq(chatShares.chatId, chatId),
                eq(chatShares.ownerUserId, userId),
                eq(chatShares.status, 'active')
            ));
    }

    // Get shared chat by shareId
    static async getSharedChat(shareId: string): Promise<ChatSnapshot | null> {
        const share = await db
            .select()
            .from(chatShares)
            .where(and(
                eq(chatShares.shareId, shareId),
                eq(chatShares.status, 'active')
            ))
            .limit(1);

        if (share.length === 0) {
            return null;
        }

        // Increment view count (best effort, ignore errors)
        try {
            await db
                .update(chatShares)
                .set({
                    viewCount: share[0].viewCount + 1,
                })
                .where(eq(chatShares.shareId, shareId));
        } catch (error) {
            console.warn('Failed to increment view count:', error);
        }

        return share[0].snapshotJson as ChatSnapshot;
    }
}