import type { Message as TMessage } from "ai";
import { Message } from "./message";
import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom";

export const Messages = ({
  messages,
  isLoading,
  status,
  chatTokenUsage,
}: {
  messages: (TMessage & { hasWebSearch?: boolean })[];
  isLoading: boolean;
  status: "error" | "submitted" | "streaming" | "ready";
  chatTokenUsage?: {
    inputTokens?: number;
    outputTokens?: number;
    estimatedCost?: number;
    currency?: string;
  };
}) => {
  const [containerRef, endRef] = useScrollToBottom();
  
  return (
    <div
      className="h-full overflow-y-auto no-scrollbar"
      ref={containerRef}
    >
      <div className="max-w-lg sm:max-w-3xl mx-auto py-4">
        {messages.map((m, i) => (
          <Message
            key={i}
            isLatestMessage={i === messages.length - 1}
            isLoading={isLoading}
            message={{
              ...m,
              hasWebSearch: m.hasWebSearch
            }}
            status={status}
            chatTokenUsage={chatTokenUsage}
          />
        ))}
        <div className="h-1" ref={endRef} />
      </div>
    </div>
  );
};
