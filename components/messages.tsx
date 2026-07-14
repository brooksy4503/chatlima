import type { UIMessage } from "ai";
import { Message } from "./message";
import { SelectionAddToChatToolbar } from "./selection-add-to-chat-toolbar";
import { useSelectionAddToChat } from "@/hooks/use-selection-add-to-chat";
import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom";
import type { ChatUsageChipProps } from "./token-metrics/ChatUsageChip";

export const Messages = ({
  messages,
  isLoading,
  status,
  chatTokenUsage,
  chatUsage,
  webSearchEnabled = false,
  imageGenerationEnabled = false,
  onAddToChat,
  messageMetricsById,
  branchActionsDisabled = false,
  getBranchVersion,
  onSelectBranch,
  onRegenerate,
  onEditResubmit,
  onFork,
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
  chatUsage?: ChatUsageChipProps | null;
  webSearchEnabled?: boolean;
  imageGenerationEnabled?: boolean;
  messageMetricsById?: Record<
    string,
    {
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
      estimatedCost?: number;
      currency?: string;
      modelId?: string;
      modelDisplayName?: string;
      timeToFirstToken?: number;
      tokensPerSecond?: number;
      totalDuration?: number;
    }
  >;
  branchActionsDisabled?: boolean;
  getBranchVersion?: (messageId: string) => { index: number; total: number } | null;
  onSelectBranch?: (messageId: string, direction: -1 | 1) => void;
  onRegenerate?: (assistantMessageId: string) => void;
  onEditResubmit?: (userMessageId: string, content: string) => void;
  onFork?: (messageId: string) => void;
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

  const showChatUsage =
    Boolean(chatUsage) &&
    status === "ready" &&
    lastMessage?.role === "assistant";

  return (
    <>
    <div
      className="h-full min-h-0 min-w-0 overflow-y-auto overflow-x-hidden no-scrollbar"
      ref={containerRef}
    >
      <div className="max-w-lg sm:max-w-3xl mx-auto min-w-0 w-full py-4">
        {messages.map((m, i) => (
          <Message
            key={m.id}
            isLatestMessage={i === messages.length - 1}
            isLoading={isLoading}
            message={{
              ...m,
              hasWebSearch: m.hasWebSearch,
              modelDisplayName:
                (m as { modelDisplayName?: string | null }).modelDisplayName ??
                messageMetricsById?.[m.id]?.modelDisplayName,
              tokenUsage: messageMetricsById?.[m.id],
            }}
            status={status}
            chatTokenUsage={chatTokenUsage}
            chatUsage={
              showChatUsage && i === messages.length - 1 ? chatUsage : null
            }
            webSearchEnabled={webSearchEnabled}
            imageGenerationEnabled={imageGenerationEnabled}
            branchVersion={getBranchVersion?.(m.id) ?? null}
            branchActionsDisabled={branchActionsDisabled}
            onSelectBranch={
              onSelectBranch ? (direction) => onSelectBranch(m.id, direction) : undefined
            }
            onRegenerate={
              m.role === "assistant" && onRegenerate
                ? () => onRegenerate(m.id)
                : undefined
            }
            onEditResubmit={
              m.role === "user" && onEditResubmit
                ? (content) => onEditResubmit(m.id, content)
                : undefined
            }
            onFork={onFork ? () => onFork(m.id) : undefined}
          />
        ))}
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
