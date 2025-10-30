<!-- 9683a3bb-b6ee-4094-abfa-08d7ea48eed8 0968980d-1d15-41c8-ae36-d9513300d60f -->
# Fix AI SDK v6 Upgrade Issues

## Problem Analysis

The AI SDK v6 upgrade is broken due to several compatibility issues:

1. **Message Type Changes**: `UIMessage` type structure has changed - now uses `parts` array instead of `content` string
2. **useChat Hook API Changes**: Hook parameters and return values have changed significantly
3. **Import Path Issues**: Some imports are using deprecated paths
4. **Incomplete Implementation**: Chat component has placeholder code that doesn't work
5. **Message Processing**: Backend and frontend message processing is inconsistent with v6 format

## Implementation Steps

### 1. Fix Message Types and Imports

**Files to Update:**

- `components/chat.tsx` - Fix useChat import and message types
- `lib/chat-store.ts` - Update message type definitions
- `app/api/chat/route.ts` - Ensure consistent message format

**Key Changes:**

- Import `UIMessage` from correct AI SDK v6 path
- Update message structure to use `parts` array consistently
- Fix type casting and message conversion functions

### 2. Fix useChat Hook Implementation

**File:** `components/chat.tsx`

**Issues to Fix:**

- Remove placeholder `handleSubmit` and `append` functions
- Restore proper useChat hook configuration
- Fix message handling for AI SDK v6 format
- Ensure proper error handling and streaming

**Key Changes:**

- Update useChat hook parameters for v6 API
- Fix message submission and streaming
- Restore proper append functionality
- Update message processing for parts-based format

### 3. Fix Message Processing Pipeline

**Files to Update:**

- `lib/chat-store.ts` - Update message conversion functions
- `app/api/chat/route.ts` - Ensure backend sends v6-compatible messages
- `components/messages.tsx` - Update message rendering for parts format

**Key Changes:**

- Update `convertToUIMessages` for v6 format
- Fix message part processing (text, images, etc.)
- Ensure consistent message structure throughout pipeline

### 4. Fix Image Attachment Handling

**File:** `components/chat.tsx`

**Issues:**

- Image attachments not properly integrated with useChat
- Message parts not correctly formatted for v6

**Changes:**

- Fix image attachment processing for v6 message format
- Ensure proper integration with useChat hook
- Update message part creation for images

### 5. Test and Validate

**Testing Steps:**

- Start development server and verify no console errors
- Test basic chat functionality (send/receive messages)
- Test image attachments with vision models
- Test error handling and recovery
- Verify streaming responses work correctly

## Success Criteria

- ✅ No TypeScript errors or console warnings
- ✅ Chat interface loads without errors
- ✅ Messages can be sent and received successfully
- ✅ Streaming responses work correctly
- ✅ Image attachments work with vision models
- ✅ Error handling functions properly
- ✅ All existing features remain functional

## Risk Mitigation

- Make incremental changes and test each step
- Keep backup of current state before major changes
- Focus on core functionality first, then advanced features
- Ensure backward compatibility with existing chat data

### To-dos

- [ ] Update message type definitions and imports for AI SDK v6 compatibility
- [ ] Restore proper useChat hook implementation and remove placeholder code
- [ ] Update message processing pipeline to handle v6 parts-based format
- [ ] Fix image attachment handling for v6 message format
- [ ] Test and validate all chat functionality works correctly