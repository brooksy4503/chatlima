import { convertToOpenRouterFormat } from '@/lib/openrouter-utils';
import type { UIMessage } from 'ai';
import type { ModelInfo } from '@/lib/types/models';
import type { ImageUIPart } from '@/lib/types';

export interface Attachment {
    name: string;
    contentType: string;
    url: string;
}

export interface ProcessedMessagesResult {
    messages: UIMessage[];
    hasAttachments: boolean;
    supportsVision: boolean;
}

export class MessageProcessingService {
    /**
     * Process messages with attachments, checking vision support
     */
    static async processMessagesWithAttachments(
        messages: UIMessage[],
        attachments: Attachment[],
        modelInfo: ModelInfo | null,
        selectedModel: string
    ): Promise<ProcessedMessagesResult> {
        console.log('[DEBUG] processMessagesWithAttachments called with:', {
            messagesCount: messages.length,
            attachmentsCount: attachments.length
        });

        if (attachments.length === 0) {
            console.log('[DEBUG] No attachments, returning original messages');
            return {
                messages,
                hasAttachments: false,
                supportsVision: false
            };
        }

        // Check if model supports vision
        const supportsVision = modelInfo?.vision === true;
        console.log('[DEBUG] Model vision support check:', {
            selectedModel,
            supportsVision
        });

        if (!supportsVision) {
            console.error('[ERROR] Model does not support vision:', selectedModel);
            throw new Error(`Selected model ${selectedModel} does not support image inputs. Please choose a vision-capable model.`);
        }

        // Add attachments to the last user message
        const processedMessages = [...messages];
        const lastMessageIndex = processedMessages.length - 1;

        console.log('[DEBUG] Processing attachments for message at index:', lastMessageIndex);

        if (lastMessageIndex >= 0 && processedMessages[lastMessageIndex].role === 'user') {
            const lastMessage = processedMessages[lastMessageIndex];
            console.log('[DEBUG] Last message:', {
                role: lastMessage.role,
                content: lastMessage.content?.substring(0, 100),
                hasExistingParts: !!lastMessage.parts,
                existingPartsCount: lastMessage.parts?.length || 0
            });

            // Convert attachments to image parts
            const imageParts: ImageUIPart[] = attachments.map((attachment, index) => {
                console.log('[DEBUG] Converting attachment', index, ':', {
                    name: attachment.name,
                    contentType: attachment.contentType,
                    urlLength: attachment.url.length,
                    isValidDataUrl: attachment.url.startsWith('data:image/')
                });

                return {
                    type: 'image_url' as const,
                    image_url: {
                        url: attachment.url,
                        detail: 'auto' as const
                    },
                    metadata: {
                        filename: attachment.name,
                        mimeType: attachment.contentType,
                        size: 0, // We don't have size info from the attachment
                        width: 0,
                        height: 0
                    }
                };
            });

            console.log('[DEBUG] Created image parts:', imageParts.length);

            // Create new parts array with type assertion
            const existingParts = lastMessage.parts || [{ type: 'text', text: lastMessage.content }];
            const newParts = [...existingParts, ...imageParts] as any;

            console.log('[DEBUG] Combined parts:', {
                existingPartsCount: existingParts.length,
                newImagePartsCount: imageParts.length,
                totalPartsCount: newParts.length
            });

            processedMessages[lastMessageIndex] = {
                ...lastMessage,
                parts: newParts
            };

            console.log('[DEBUG] Updated last message with image parts');
        } else {
            console.warn('[WARN] No user message found to attach images to, or last message is not from user');
        }

        console.log('[DEBUG] Returning processed messages with attachments');
        return {
            messages: processedMessages,
            hasAttachments: true,
            supportsVision
        };
    }

    /**
     * Convert messages to OpenRouter format if needed
     */
    static convertToOpenRouterFormat(messages: UIMessage[]): UIMessage[] {
        return convertToOpenRouterFormat(messages);
    }

    /**
     * Check if model supports vision
     */
    static modelSupportsVision(modelInfo: ModelInfo | null): boolean {
        return modelInfo?.vision === true;
    }

    /**
     * Validate attachments for vision models
     */
    static validateAttachmentsForVision(
        attachments: Attachment[],
        modelInfo: ModelInfo | null,
        selectedModel: string
    ): void {
        if (attachments.length === 0) return;

        const supportsVision = this.modelSupportsVision(modelInfo);
        if (!supportsVision) {
            throw new Error(`Selected model ${selectedModel} does not support image inputs. Please choose a vision-capable model.`);
        }
    }

    /**
     * Process messages for different providers
     */
    static processMessagesForProvider(
        messages: UIMessage[],
        provider: string
    ): UIMessage[] {
        // Convert to OpenRouter format if using OpenRouter
        if (provider === 'openrouter') {
            return this.convertToOpenRouterFormat(messages);
        }

        return messages;
    }
}
