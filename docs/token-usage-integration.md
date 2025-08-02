# Token Usage Metrics Integration

This document describes the integration of token usage metrics with the existing chat functionality in ChatLima. The integration provides comprehensive tracking of token usage and associated costs for AI model interactions.

## Overview

The token usage metrics integration allows users to:
- View token usage information for individual messages
- See aggregated token usage statistics for entire chat sessions
- Monitor token usage in real-time during streaming responses
- Track costs associated with AI model usage
- Access usage summaries in the sidebar

## Components

### 1. MessageTokenMetrics

Located at: `components/token-metrics/MessageTokenMetrics.tsx`

This component displays token usage metrics for individual messages with three variants:

#### MessageTokenMetrics
- Full-featured display with detailed breakdown
- Shows input tokens, output tokens, total tokens, and estimated cost
- Suitable for detailed views

#### CompactMessageTokenMetrics
- Minimal display for space-constrained areas
- Shows only total tokens and estimated cost
- Used in message footers

#### StreamingTokenMetrics
- Real-time display during streaming responses
- Shows input → output tokens with animated indicator
- Used for active streaming responses

### 2. ChatTokenSummary

Located at: `components/token-metrics/ChatTokenSummary.tsx`

This component displays aggregated token usage information for entire chat sessions with two variants:

#### ChatTokenSummary
- Comprehensive view of chat session metrics
- Shows token breakdown, cost information, and efficiency metrics
- Includes refresh functionality and error handling
- Used in the main chat interface

#### MiniChatTokenSummary
- Compact view for sidebar usage
- Shows essential metrics in minimal space
- Used in the ChatSidebar

## Integration Points

### 1. Message Component Integration

The `Message` component has been updated to include token usage information:

```typescript
interface MessageProps {
  message: TMessage & {
    // ... other properties
    tokenUsage?: {
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
      estimatedCost?: number;
      currency?: string;
    };
  };
  // ... other props
  chatTokenUsage?: {
    inputTokens?: number;
    outputTokens?: number;
    estimatedCost?: number;
    currency?: string;
  };
}
```

The component displays:
- `StreamingTokenMetrics` during active streaming
- `CompactMessageTokenMetrics` for completed messages

### 2. Chat Component Integration

The `Chat` component has been updated to:

1. Fetch token usage data using React Query:
```typescript
const { data: chatTokenData, isLoading: isTokenDataLoading, error: tokenDataError, refetch: refetchTokenData } = useQuery({
  queryKey: ['chat-token-usage', chatId],
  queryFn: async ({ queryKey }) => {
    // Fetch token usage data for the chat
  },
  enabled: !!chatId && !!userId,
});
```

2. Display token usage summary:
```typescript
<ChatTokenSummary
  totalInputTokens={chatTokenData?.totalInputTokens || 0}
  totalOutputTokens={chatTokenData?.totalOutputTokens || 0}
  totalTokens={chatTokenData?.totalTokens || 0}
  totalEstimatedCost={chatTokenData?.totalEstimatedCost || 0}
  totalActualCost={chatTokenData?.totalActualCost || 0}
  messageCount={messages.length}
  currency={chatTokenData?.currency || 'USD'}
  isLoading={isTokenDataLoading}
  error={tokenDataError?.message || null}
  onRefresh={refetchTokenData}
  compact={true}
/>
```

3. Provide real-time updates during streaming:
```typescript
useEffect(() => {
  if (status === "streaming" && messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant') {
      // Update with estimated token counts during streaming
      setChatTokenUsage({
        inputTokens: estimatedInputTokens,
        outputTokens: estimatedOutputTokens,
        estimatedCost: estimatedCost,
        currency: 'USD'
      });
    }
  }
}, [messages, status, chatTokenData]);
```

### 3. ChatSidebar Integration

The `ChatSidebar` component includes a `TokenUsageSummary` component that displays user-wide token usage metrics:

```typescript
function TokenUsageSummary({ userId }: { userId: string | null }) {
  const { data: tokenData, isLoading, error } = useQuery({
    queryKey: ['user-token-usage', userId],
    queryFn: async ({ queryKey }) => {
      // Fetch user-wide token usage data
    },
    enabled: !!userId,
  });

  return (
    <MiniChatTokenSummary
      totalInputTokens={tokenData?.totalInputTokens || 0}
      totalOutputTokens={tokenData?.totalOutputTokens || 0}
      totalTokens={tokenData?.totalTokens || 0}
      totalEstimatedCost={tokenData?.totalEstimatedCost || 0}
      messageCount={tokenData?.messageCount || 0}
      currency={tokenData?.currency || 'USD'}
      isLoading={isLoading}
      error={error?.message || null}
    />
  );
}
```

### 4. Messages Component Integration

The `Messages` component has been updated to pass token usage data to individual `Message` components:

```typescript
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
  return (
    <div>
      {messages.map((m, i) => (
        <Message
          key={i}
          isLatestMessage={i === messages.length - 1}
          isLoading={isLoading}
          message={m}
          status={status}
          chatTokenUsage={chatTokenUsage}
        />
      ))}
    </div>
  );
};
```

## Data Flow

1. **Token Usage Data Collection**:
   - Token usage is tracked during API calls to AI models
   - Data is stored in the database via the token tracking middleware
   - Cost calculations are performed using the cost calculation service

2. **Data Retrieval**:
   - Chat-specific token usage is fetched via `/api/token-usage?chatId={chatId}`
   - User-wide token usage is fetched via `/api/token-usage?userId={userId}`
   - Data is cached using React Query for optimal performance

3. **Real-time Updates**:
   - During streaming, estimated token counts are calculated based on message content
   - When streaming completes, actual token data is fetched from the API
   - UI updates smoothly between estimated and actual values

4. **Error Handling**:
   - All components handle loading states with skeleton loaders
   - Error states are displayed with appropriate messaging
   - Refresh functionality allows users to retry failed requests

## Styling and UI Considerations

- All components follow the existing design system
- Consistent use of icons, colors, and typography
- Responsive design works across different screen sizes
- Loading states provide visual feedback during data fetching
- Error states are clear and actionable

## Performance Considerations

- Data is cached with appropriate stale times
- Queries are only enabled when necessary (e.g., when userId is available)
- Minimal re-rendering through careful prop management
- Efficient formatting of large numbers (e.g., 1M instead of 1,000,000)

## Future Enhancements

1. **Historical Data Visualization**:
   - Charts showing token usage over time
   - Comparison between different models or time periods

2. **Budget Management**:
   - Set usage limits and receive notifications
   - Track spending against budgets

3. **Model Comparison**:
   - Compare token efficiency between different AI models
   - Cost analysis for model selection

4. **Export Functionality**:
   - Export token usage data for external analysis
   - Generate reports for accounting or billing purposes

## Testing

The integration includes comprehensive testing for:
- Component rendering with different data states
- Error handling and recovery
- Real-time updates during streaming
- Responsive behavior across screen sizes
- Performance with large token counts

## Accessibility

All components follow accessibility best practices:
- Proper ARIA labels and descriptions
- Keyboard navigation support
- High contrast mode compatibility
- Screen reader friendly markup