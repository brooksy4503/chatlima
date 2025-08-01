"use client";

import { SharedMessage } from "./shared-message";
import type { SnapshotMessage } from "@/lib/services/chat-sharing";

interface SharedChatMessagesProps {
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

export function SharedChatMessages({ messages, metadata }: SharedChatMessagesProps) {
  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="max-w-lg sm:max-w-3xl mx-auto py-4">
        {messages.map((message, index) => (
          <SharedMessage
            key={message.id}
            message={message}
            isLast={index === messages.length - 1}
          />
        ))}
        
        {/* Show models used if available */}
        {metadata.models.length > 0 && (
          <div className="mt-8 p-4 bg-muted/30 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Models used in this conversation:</h3>
            <div className="flex flex-wrap gap-2">
              {metadata.models.map((model, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-background text-xs rounded-full border"
                >
                  {model}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}