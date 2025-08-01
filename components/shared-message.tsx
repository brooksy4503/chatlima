"use client";

import { memo } from "react";
import { Markdown } from "./markdown";
import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";
import { BotIcon, UserIcon, SearchIcon } from "lucide-react";
import type { SnapshotMessage } from "@/lib/services/chat-sharing";

interface SharedMessageProps {
  message: SnapshotMessage;
  isLast: boolean;
}

function SharedMessageComponent({ message, isLast }: SharedMessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "group flex gap-4 px-4 py-4 text-sm",
        !isLast && "border-b border-border/40",
        isUser && "bg-muted/30",
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border",
            isUser
              ? "bg-background text-foreground"
              : "bg-primary text-primary-foreground"
          )}
        >
          {isUser ? (
            <UserIcon className="h-4 w-4" />
          ) : (
            <BotIcon className="h-4 w-4" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2 overflow-hidden">
        {/* Role label */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {isUser ? "You" : "Assistant"}
          </span>
          {message.hasWebSearch && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <SearchIcon className="h-3 w-3" />
              <span>Web search used</span>
            </div>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
        </div>

        {/* Message content */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {isAssistant ? (
            <Markdown>{message.content}</Markdown>
          ) : (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}
        </div>

        {/* Copy button */}
        {message.content && (
          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton 
              text={message.content}
              className="h-6 w-6 p-1"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export const SharedMessage = memo(SharedMessageComponent, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.isLast === nextProps.isLast
  );
});