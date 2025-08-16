# Feature Plan: Display Model Used for Each Message

## Overview
Implement functionality to display which AI model was used for each assistant message in the chat interface. This will help users understand which model generated each response and provide transparency about the AI models being used.

## Current State
- Messages are stored in the database with parts, web search information, and other metadata
- Model information is available during message generation in the chat API route
- Model information is not currently stored with individual messages
- UI does not display which model was used for each response

## Goal
Display the AI model name used for each assistant message directly in the chat interface, providing users with clear information about which model generated each response.

## Implementation Plan

### Phase 1: Database Schema Update

1. **Add model_id column to messages table**
   - File: `lib/db/schema.ts`
   - Add `modelId: text('model_id')` to the messages table schema
   - Update the DBMessage type to include optional `modelId?: string`

2. **Update Drizzle migrations**
   - Create a new migration file to add the column to the existing database schema
   - File: `drizzle/XXXX_add_model_id_to_messages.sql`

### Phase 2: API Route Updates

1. **Modify message saving logic**
   - File: `app/api/chat/route.ts`
   - In the `onFinish` callback, ensure the selected model is stored with each assistant message
   - Update the `convertToDBMessages` function or the message creation logic to include modelId

2. **Update token usage tracking**
   - Ensure model information is properly passed to token usage tracking
   - File: `app/api/chat/route.ts` (already mostly implemented)

### Phase 3: Data Flow Updates

1. **Update chat store functions**
   - File: `lib/chat-store.ts`
   - Modify `convertToUIMessages` function to include modelId in the UI message objects
   - Update UIMessage type to include optional modelId

2. **Update message types**
   - File: `lib/db/schema.ts`
   - Ensure all message types properly include the modelId field

### Phase 4: UI Implementation

1. **Modify message component**
   - File: `components/message.tsx`
   - Add UI element to display model information for assistant messages
   - Position the model display appropriately (e.g., below the message content)
   - Style the model display to be subtle but visible

2. **Design considerations**
   - Display model name in a small badge or text element
   - Use appropriate styling to distinguish it from the main message content
   - Only show for assistant messages (not user messages)
   - Handle cases where model information might be missing

### Phase 5: Testing

1. **Unit tests**
   - Update existing tests for message conversion functions
   - File: `__tests__/lib/chat-store.test.ts` (if it exists)

2. **Integration tests**
   - Test that model information is properly stored and retrieved
   - Verify UI display works correctly

3. **Migration testing**
   - Test that existing messages without model information display correctly
   - Ensure backward compatibility

## Technical Details

### Database Changes
```sql
ALTER TABLE messages ADD COLUMN model_id TEXT;
```

### Type Updates
```typescript
// In DBMessage type
export type DBMessage = {
  id: string;
  chatId: string;
  role: string;
  parts: MessagePart[];
  modelId?: string; // NEW
  createdAt: Date;
};

// In UIMessage type
type UIMessage = {
  id: string;
  role: string;
  content: string;
  parts: Array<TextUIPart | ToolInvocationUIPart | ImageUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
  modelId?: string; // NEW
  createdAt?: Date;
  hasWebSearch?: boolean;
  webSearchContextSize?: 'low' | 'medium' | 'high';
};
```

### UI Display Example
```tsx
// In message.tsx, for assistant messages
{message.modelId && (
  <div className="text-xs text-muted-foreground mt-2">
    Model: {message.modelId}
  </div>
)}
```

## Backward Compatibility
- Existing messages without model information will not display model names
- The feature will only show information for new messages going forward
- No breaking changes to existing functionality

## Timeline
- Phase 1 (Database): 1-2 hours
- Phase 2 (API): 2-3 hours
- Phase 3 (Data Flow): 1-2 hours
- Phase 4 (UI): 2-3 hours
- Phase 5 (Testing): 2-3 hours
- Total estimated time: 8-15 hours

## Dependencies
- Drizzle ORM for database migrations
- Existing chat message infrastructure
- Token usage tracking system

## Rollout Strategy
1. Implement on development branch
2. Test with sample data
3. Deploy to staging environment
4. Verify functionality with real chat sessions
5. Deploy to production with monitoring

## Success Metrics
- Model information displays correctly for new messages
- No performance degradation in chat loading
- Backward compatibility maintained for existing messages
- User feedback indicates the feature is helpful and not intrusive