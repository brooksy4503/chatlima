import type { UIMessage } from "ai";
import type { ImageUIPart, TextUIPart } from "./types";

interface OpenRouterImageContent {
    type: "image_url";
    image_url: {
        url: string;
        detail?: "low" | "high" | "auto";
    };
}

interface OpenRouterTextContent {
    type: "text";
    text: string;
}

type OpenRouterMessageContent = OpenRouterTextContent | OpenRouterImageContent;

export function convertToOpenRouterFormat(messages: UIMessage[]): any[] {
    return messages.map(message => {
        if (message.role === "user" && message.parts) {
            // Convert parts to OpenRouter content format
            const content: OpenRouterMessageContent[] = [];

            (message.parts as any[]).forEach(part => {
                switch (part.type) {
                    case "text":
                        const textPart = part as TextUIPart;
                        content.push({
                            type: "text",
                            text: textPart.text
                        });
                        break;
                    case "image_url":
                        const imagePart = part as ImageUIPart;
                        content.push({
                            type: "image_url",
                            image_url: {
                                url: imagePart.image_url.url, // Base64 data URL: data:image/jpeg;base64,{data}
                                detail: imagePart.image_url.detail || "auto"
                            }
                        });
                        break;
                }
            });

            return {
                role: message.role,
                content: content
            };
        }

        // Handle non-multimodal messages
        return {
            role: message.role,
            content: getTextContent(message)
        };
    });
}

export function validateImageForOpenRouter(imageData: string): {
    valid: boolean;
    error?: string;
} {
    // Validate base64 data URL format: data:image/{type};base64,{data}
    if (!imageData.startsWith('data:image/')) {
        return { valid: false, error: 'Invalid data URL format - must start with data:image/' };
    }

    // Check for supported formats (OpenRouter limitation)
    const validTypes = ['data:image/jpeg', 'data:image/png', 'data:image/webp'];
    if (!validTypes.some(type => imageData.startsWith(type))) {
        return { valid: false, error: 'Unsupported image format. OpenRouter supports JPEG, PNG, and WebP only' };
    }

    // Check if it's properly base64 encoded
    if (!imageData.includes(';base64,')) {
        return { valid: false, error: 'Data URL must be base64 encoded' };
    }

    // Estimate file size from base64 (rough calculation)
    const base64Data = imageData.split(',')[1];
    if (!base64Data) {
        return { valid: false, error: 'Invalid base64 data' };
    }

    const estimatedSize = (base64Data.length * 3) / 4; // Base64 is ~33% larger than original

    if (estimatedSize > 20 * 1024 * 1024) { // 20MB limit for OpenRouter
        return { valid: false, error: 'Image data too large (exceeds 20MB limit for OpenRouter)' };
    }

    return { valid: true };
}

export function estimateImageTokens(
    modelId: string,
    imageCount: number,
    detail: "low" | "high" | "auto" = "auto"
): number {
    // Token estimates for image processing
    const tokenCosts = {
        low: 85,    // tokens per image at low detail
        high: 170,  // tokens per image at high detail
        auto: 85    // default - model chooses, usually "low" unless needed
    };

    return imageCount * (tokenCosts[detail] || tokenCosts.auto);
}

// Helper function to get text content from message parts
function getTextContent(message: UIMessage): string {
    if (message.parts) {
        return message.parts
            .filter(part => part.type === 'text')
            .map(part => (part as TextUIPart).text)
            .join('\n\n');
    }

    return message.content || '';
}

// Helper function to check if message contains images
export function hasImageContent(message: UIMessage): boolean {
    if (!message.parts) return false;

    return (message.parts as any[]).some(part => part.type === 'image_url');
}

// Helper function to count images in a message
export function countImages(message: UIMessage): number {
    if (!message.parts) return 0;

    return (message.parts as any[]).filter(part => part.type === 'image_url').length;
}

// Validate all images in a message array
export function validateAllImages(messages: UIMessage[]): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    messages.forEach((message, messageIndex) => {
        if (message.parts) {
            (message.parts as any[]).forEach((part, partIndex) => {
                if (part.type === 'image_url') {
                    const imagePart = part as ImageUIPart;
                    const validation = validateImageForOpenRouter(imagePart.image_url.url);
                    if (!validation.valid) {
                        errors.push(`Message ${messageIndex + 1}, Image ${partIndex + 1}: ${validation.error}`);
                    }
                }
            });
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}

// Convert message parts to OpenRouter format
export function convertMessagePartsToOpenRouter(parts: any[]): OpenRouterMessageContent[] {
    const content: OpenRouterMessageContent[] = [];

    parts.forEach(part => {
        switch (part.type) {
            case "text":
                content.push({
                    type: "text",
                    text: part.text
                });
                break;
            case "image_url":
                content.push({
                    type: "image_url",
                    image_url: {
                        url: part.image_url.url,
                        detail: part.image_url.detail || "auto"
                    }
                });
                break;
            // Skip other part types that OpenRouter doesn't support
        }
    });

    return content;
} 