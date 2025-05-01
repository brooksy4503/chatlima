import type { ReasoningUIPart, SourceUIPart, FileUIPart, StepStartUIPart } from "@ai-sdk/ui-utils";

export interface WebSearchCitation {
    url: string;
    title: string;
    content?: string;
    startIndex: number;
    endIndex: number;
}

export interface TextUIPart {
    type: "text";
    text: string;
    citations?: WebSearchCitation[];
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

export type MessagePart = TextUIPart | ToolInvocationUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart; 