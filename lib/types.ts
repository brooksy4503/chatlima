import type { ReasoningUIPart, SourceUIPart, FileUIPart, StepStartUIPart } from "@ai-sdk/ui-utils";

export interface TextUIPart {
    type: "text";
    text: string;
}

export interface ToolInvocationUIPart {
    type: "tool-invocation";
    toolInvocation: {
        toolName: string;
        state: string;
        args: any;
        result?: any;
    };
}

export interface ImageUIPart {
    type: "image_url";
    image_url: {
        url: string; // Can be external URL or base64 data URL (data:image/jpeg;base64,...)
        detail?: "low" | "high" | "auto"; // Image processing detail level
    };
    metadata?: {
        filename?: string;
        size?: number;
        mimeType?: string;
        width?: number;
        height?: number;
    };
}

// Image detail levels control processing quality and token cost:
// - "low": ~85 tokens, faster, good for simple images
// - "high": ~170 tokens, slower, better for detailed analysis  
// - "auto": Model chooses optimal level (default)

export interface ImageAttachment {
    file?: File;
    dataUrl: string;
    metadata: {
        filename: string;
        size: number;
        mimeType: string;
        width: number;
        height: number;
        originalSize?: number;
        compressedSize?: number;
    };
    detail?: "low" | "high" | "auto";
}

export interface ImageMetadata {
    width: number;
    height: number;
    size: number;
    mimeType: string;
    filename: string;
    originalSize?: number; // Track original file size before compression
    compressedSize?: number; // Track compressed file size
}

export type MessagePart = TextUIPart | ToolInvocationUIPart | ImageUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart; 