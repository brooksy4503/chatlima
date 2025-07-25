"use client";

import type { Message as TMessage } from "ai";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useEffect, useState } from "react";
import equal from "fast-deep-equal";
import { Markdown } from "./markdown";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon, LightbulbIcon, BrainIcon } from "lucide-react";
import { SpinnerIcon } from "./icons";
import { ToolInvocation } from "./tool-invocation";
import { CopyButton } from "./copy-button";
import { Citations } from "./citation";
import type { TextUIPart, ToolInvocationUIPart, ImageUIPart } from "@/lib/types";
import type { ReasoningUIPart, SourceUIPart, FileUIPart, StepStartUIPart } from "@ai-sdk/ui-utils";
import { formatFileSize } from "@/lib/image-utils";
import { WebSearchSuggestion } from "./web-search-suggestion";
import { ImageModal } from "./image-modal";

interface ReasoningPart {
  type: "reasoning";
  reasoning: string;
  details: Array<{ type: "text"; text: string }>;
}

interface ReasoningMessagePartProps {
  part: ReasoningUIPart;
  isReasoning: boolean;
}

export function ReasoningMessagePart({
  part,
  isReasoning,
}: ReasoningMessagePartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const memoizedSetIsExpanded = useCallback((value: boolean) => {
    setIsExpanded(value);
  }, []);

  useEffect(() => {
    memoizedSetIsExpanded(isReasoning);
  }, [isReasoning, memoizedSetIsExpanded]);

  return (
    <div className="flex flex-col mb-2 group">
      {isReasoning ? (
        <div className={cn(
          "flex items-center gap-2.5 rounded-full py-1.5 px-3",
          "bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300",
          "border border-indigo-200/50 dark:border-indigo-700/20 w-fit"
        )}>
          <div className="animate-spin h-3.5 w-3.5">
            <SpinnerIcon />
          </div>
          <div className="text-xs font-medium tracking-tight">Thinking...</div>
        </div>
      ) : (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center justify-between w-full",
            "rounded-md py-2 px-3 mb-0.5",
            "bg-muted/50 border border-border/60 hover:border-border/80",
            "transition-all duration-150 cursor-pointer",
            isExpanded ? "bg-muted border-primary/20" : ""
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full",
              "bg-amber-50 dark:bg-amber-900/20",
              "text-amber-600 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-700/30",
            )}>
              <LightbulbIcon className="h-3.5 w-3.5" />
            </div>
            <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
              Reasoning
              <span className="text-xs text-muted-foreground font-normal">
                (click to {isExpanded ? "hide" : "view"})
              </span>
            </div>
          </div>
          <div className={cn(
            "flex items-center justify-center",
            "rounded-full p-0.5 w-5 h-5",
            "text-muted-foreground hover:text-foreground",
            "bg-background/80 border border-border/50",
            "transition-colors",
          )}>
            {isExpanded ? (
              <ChevronDownIcon className="h-3 w-3" />
            ) : (
              <ChevronUpIcon className="h-3 w-3" />
            )}
          </div>
        </button>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="reasoning"
            className={cn(
              "text-sm text-muted-foreground flex flex-col gap-2",
              "pl-3.5 ml-0.5 mt-1",
              "border-l border-amber-200/50 dark:border-amber-700/30"
            )}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="text-xs text-muted-foreground/70 pl-1 font-medium">
              The assistant&apos;s thought process:
            </div>
            {part.details.map((detail, detailIndex) =>
              detail.type === "text" ? (
                <div key={detailIndex} className="px-2 py-1.5 bg-muted/10 rounded-md border border-border/30">
                  <Markdown>{detail.text}</Markdown>
                </div>
              ) : (
                "<redacted>"
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MessageProps {
  message: TMessage & {
    parts?: Array<TextUIPart | ToolInvocationUIPart | ImageUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
    hasWebSearch?: boolean;
  };
  isLoading: boolean;
  status: "error" | "submitted" | "streaming" | "ready";
  isLatestMessage: boolean;
}

const PurePreviewMessage = ({
  message,
  isLatestMessage,
  status,
  isLoading,
}: MessageProps) => {
  // State for image modal
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    metadata?: ImageUIPart['metadata'];
    detail?: string;
  } | null>(null);

  // Create a string with all text parts for copy functionality
  const getMessageText = () => {
    if (!message.parts) return "";
    return message.parts
      .filter(part => part.type === "text")
      .map(part => (part.type === "text" ? part.text : ""))
      .join("\n\n");
  };

  // Check if message has web search results - use hasWebSearch flag if available, otherwise detect from parts
  const hasWebSearchResults = message.hasWebSearch || message.parts?.some(part => 
    (part.type === "text" && (part as TextUIPart).citations && (part as TextUIPart).citations!.length > 0) ||
    (part.type === "tool-invocation" && (part as ToolInvocationUIPart).toolInvocation.toolName === "web_search")
  );
  


  // Only show copy button if the message is from the assistant or user, and not currently streaming
  const shouldShowCopyButton = (message.role === "assistant" || message.role === "user") && (!isLatestMessage || status !== "streaming");

  return (
    <AnimatePresence key={message.id}>
      <motion.div
        className={cn(
          "w-full mx-auto px-4 group/message",
          message.role === "assistant" ? "mb-8" : "mb-6"
        )}
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        key={`message-${message.id}`}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            "group-data-[role=user]/message:w-fit",
          )}
        >
          <div className="flex flex-col w-full space-y-3">
            {message.parts?.map((part, i) => {
              switch ((part as any).type) {
                case "text":
                  const textPart = part as TextUIPart;
                  return (
                    <motion.div
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      key={`message-${message.id}-part-${i}`}
                      className="flex flex-row gap-2 items-start w-full"
                    >
                      <div
                        className={cn("flex flex-col gap-3 w-full", {
                          "bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl flex items-center gap-2":
                            message.role === "user",
                        })}
                      >
                        <Markdown>{textPart.text}</Markdown>
                        {textPart.citations && <Citations citations={textPart.citations} />}
                        {message.role === 'user' && shouldShowCopyButton && (
                          <CopyButton text={getMessageText()} className="ml-auto" />
                        )}
                      </div>
                    </motion.div>
                  );
                case "tool-invocation":
                  const toolPart = part as ToolInvocationUIPart;
                  const { toolName, state, args } = toolPart.toolInvocation;
                  const result = 'result' in toolPart.toolInvocation ? toolPart.toolInvocation.result : null;
                  
                  return (
                    <ToolInvocation
                      key={`message-${message.id}-part-${i}`}
                      toolName={toolName}
                      state={state}
                      args={args}
                      result={result}
                      isLatestMessage={isLatestMessage}
                      status={status}
                    />
                  );
                case "image_url":
                  const imagePart = part as any as ImageUIPart;
                  return (
                    <motion.div
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      key={`message-${message.id}-part-${i}`}
                      className="flex flex-row gap-2 items-start w-full"
                    >
                      <div className={cn("flex flex-col gap-2", {
                        "bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl":
                          message.role === "user",
                      })}>
                        <img
                          src={imagePart.image_url.url}
                          alt={imagePart.metadata?.filename || "Uploaded image"}
                          className="message-image"
                          loading="lazy"
                          onClick={() => {
                            setSelectedImage({
                              url: imagePart.image_url.url,
                              metadata: imagePart.metadata,
                              detail: imagePart.image_url.detail
                            });
                          }}
                        />
                        {imagePart.metadata && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {imagePart.metadata.filename}
                            {imagePart.metadata.size && (
                              <> • {formatFileSize(imagePart.metadata.size)}</>
                            )}
                            {imagePart.metadata.width && imagePart.metadata.height && (
                              <> • {imagePart.metadata.width}×{imagePart.metadata.height}</>
                            )}
                            {imagePart.image_url.detail && imagePart.image_url.detail !== 'auto' && (
                              <> • {imagePart.image_url.detail} quality</>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                case "reasoning":
                  const reasoningPart = part as ReasoningUIPart;
                  return (
                    <ReasoningMessagePart
                      key={`message-${message.id}-${i}`}
                      part={reasoningPart}
                      isReasoning={
                        (message.parts &&
                          status === "streaming" &&
                          i === message.parts.length - 1) ??
                        false
                      }
                    />
                  );
                default:
                  return null;
              }
            })}
            
            {/* Web Search Suggestion - only for assistant messages with web search results and when not streaming */}
            {message.role === 'assistant' && hasWebSearchResults && status !== "streaming" && (
              <WebSearchSuggestion 
                messageId={message.id} 
                hasWebSearchResults={hasWebSearchResults}
              />
            )}
            
            {message.role === 'assistant' && shouldShowCopyButton && (
              <div className="flex justify-start mt-2">
                <CopyButton text={getMessageText()} />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.url}
          metadata={selectedImage.metadata}
          detail={selectedImage.detail}
        />
      )}
    </AnimatePresence>
  );
};

export const Message = memo(PurePreviewMessage, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.message.annotations !== nextProps.message.annotations)
    return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
  return true;
});
