import type { UIMessage } from "ai";
import type { ModelInfo } from "@/lib/types/models";
import type { ImageUIPart } from '@/lib/types';

export interface MessageProcessingContext {
    messages: UIMessage[];
    attachments: Array<{
        name: string;
        contentType: string;
        url: string;
    }>;
    modelInfo: ModelInfo | null;
}

export interface ProcessedMessages {
    messages: UIMessage[];
    hasAttachments: boolean;
}

export class ChatMessageProcessingService {
    /**
     * Processes messages with attachments and returns formatted messages
     */
    static async processMessagesWithAttachments(context: MessageProcessingContext): Promise<ProcessedMessages> {
        const { messages, attachments, modelInfo } = context;

        console.log('[DEBUG] processMessagesWithAttachments called with:', {
            messagesCount: messages.length,
            attachmentsCount: attachments.length
        });

        if (attachments.length === 0) {
            console.log('[DEBUG] No attachments, returning original messages');
            return { messages, hasAttachments: false };
        }

        // Check if model supports vision
        const supportsVision = modelInfo?.vision === true;
        console.log('[DEBUG] Model vision support check:', {
            modelId: modelInfo?.id,
            supportsVision
        });

        if (!supportsVision) {
            console.error('[ERROR] Model does not support vision:', modelInfo?.id);
            throw new Error(`Selected model ${modelInfo?.id} does not support image inputs. Please choose a vision-capable model.`);
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
        return { messages: processedMessages, hasAttachments: true };
    }

    /**
     * Adds system instructions for specific models
     */
    static addModelSpecificInstructions(messages: UIMessage[], selectedModel: string): UIMessage[] {
        const modelMessages = [...messages];

        if (
            selectedModel === "openrouter/deepseek/deepseek-r1" ||
            selectedModel === "openrouter/deepseek/deepseek-r1-0528-qwen3-8b" ||
            selectedModel === "openrouter/qwen/qwq-32b"
        ) {
            const systemContent = "Please provide your reasoning within <think> tags. After closing the </think> tag, provide your final answer directly without any other special tags.";
            modelMessages.unshift({
                role: "system",
                id: `system_${Date.now()}`,
                content: systemContent,
                parts: [{ type: "text", text: systemContent }]
            });
        }

        return modelMessages;
    }

    /**
     * Validates message structure and content
     */
    static validateMessages(messages: UIMessage[]): void {
        if (!Array.isArray(messages) || messages.length === 0) {
            throw new Error('Messages array is required and cannot be empty');
        }

        for (const message of messages) {
            if (!message.role || !['user', 'assistant', 'system'].includes(message.role)) {
                throw new Error(`Invalid message role: ${message.role}`);
            }

            if (!message.content && !message.parts) {
                throw new Error('Message must have either content or parts');
            }
        }
    }
}