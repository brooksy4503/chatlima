import type { UIMessage } from "ai";
import { Message } from "./message";
import { SelectionAddToChatToolbar } from "./selection-add-to-chat-toolbar";
import { useSelectionAddToChat } from "@/hooks/use-selection-add-to-chat";
import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom";
import { ChatUsageChip } from "./token-metrics/ChatUsageChip";

export type ChatUsageSummaryProps = {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCreditsConsumed: number;
  messageCount: number;
  error?: string | null;
  onRefresh?: () => void;
};

export const Messages = ({
  messages,
  isLoading,
  status,
  chatTokenUsage,
  webSearchEnabled = false,
  imageGenerationEnabled = false,
  onAddToChat,
  activeChatId,
  chatUsageSummary,
}: {
  messages: (UIMessage & { hasWebSearch?: boolean })[];
  isLoading: boolean;
  status: "error" | "submitted" | "streaming" | "ready";
  onAddToChat?: (text: string) => void;
  chatTokenUsage?: {
    inputTokens?: number;
    outputTokens?: number;
    estimatedCost?: number;
    currency?: string;
    timeToFirstToken?: number;
    tokensPerSecond?: number;
    totalDuration?: number;
  };
  webSearchEnabled?: boolean;
  imageGenerationEnabled?: boolean;
  activeChatId?: string | null;
  chatUsageSummary?: ChatUsageSummaryProps;
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
  const { toolbar, handleAddToChat } = useSelectionAddToChat(
    containerRef,
    Boolean(onAddToChat)
  );

  const showUsageChip =
    Boolean(activeChatId && chatUsageSummary && status === "ready" && lastMessage?.role === "assistant");

  return (
    <>
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
            imageGenerationEnabled={imageGenerationEnabled}
          />
        ))}
        {showUsageChip && chatUsageSummary ? (
          <ChatUsageChip {...chatUsageSummary} />
        ) : null}
        <div className="h-1" ref={endRef} />
      </div>
    </div>
    {onAddToChat && toolbar ? (
      <SelectionAddToChatToolbar
        toolbar={toolbar}
        onAdd={(text) => handleAddToChat(onAddToChat)}
      />
    ) : null}
    </>
  );
};
