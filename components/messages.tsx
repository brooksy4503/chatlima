import type { UIMessage } from "ai";
import { Message } from "./message";
import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom";

export const Messages = ({
  messages,
  isLoading,
  status,
  chatTokenUsage,
  webSearchEnabled = false,
}: {
  messages: (UIMessage & { hasWebSearch?: boolean })[];
  isLoading: boolean;
  status: "error" | "submitted" | "streaming" | "ready";
  chatTokenUsage?: {
    inputTokens?: number;
    outputTokens?: number;
    estimatedCost?: number;
    currency?: string;
    // NEW: Enhanced timing metrics for Phase 2
    timeToFirstToken?: number;
    tokensPerSecond?: number;
    totalDuration?: number;
  };
  webSearchEnabled?: boolean;
}) => {
  const lastMessage = messages[messages.length - 1];
  const lastMessageTextLength = lastMessage?.parts
    ?.filter((part) => part.type === "text")
    .reduce((total, part) => total + (part.type === "text" ? part.text.length : 0), 0) ?? 0;

  const scrollTrigger =
    status === "streaming" || status === "submitted"
      ? `${messages.length}:${lastMessageTextLength}:${status}`
      : messages.length;

  const [containerRef, endRef] = useScrollToBottom(scrollTrigger);

  return (
    <div
      className="h-full min-h-0 overflow-y-auto no-scrollbar"
      ref={containerRef}
    >
      <div className="max-w-lg sm:max-w-3xl mx-auto py-4">
        {messages.map((m, i) => (
          <Message
            key={m.id}
            isLatestMessage={i === messages.length - 1}
            isLoading={isLoading}
            message={{
              ...m,
              hasWebSearch: m.hasWebSearch
            }}
            status={status}
            chatTokenUsage={chatTokenUsage}
            webSearchEnabled={webSearchEnabled}
          />
        ))}
        <div className="h-1" ref={endRef} />
      </div>
    </div>
  );
};
