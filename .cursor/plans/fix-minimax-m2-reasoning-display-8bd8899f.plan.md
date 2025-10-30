<!-- 8bd8899f-ba54-4081-a2bf-2610c02bd137 3d3da3bb-75fb-4a8f-81b2-5db470093d95 -->
# Fix MiniMax M2 Reasoning Token Handling

## Problem

MiniMax M2 (free) model from OpenRouter is not correctly handling reasoning tokens. The reasoning content appears in the Reasoning section but may not be displaying correctly or properly separated from the main response.

## Current State

- Reasoning models like DeepSeek R1 and Grok 3 Beta use `extractReasoningMiddleware` with `<think>` tags
- OpenRouter models can output reasoning in a separate `reasoning` field in the API response
- `sendReasoning: true` is set in the stream response (line 1609 in `app/api/chat/route.ts`)
- MiniMax M2 is not currently detected as a reasoning model in `ai/providers.ts`

## Implementation Plan

### 1. Add MiniMax M2 to reasoning model detection

- File: `ai/providers.ts`
- Add `minimax` or `m2` to the reasoning model detection logic (around line 198)
- Ensure MiniMax M2 models are identified as reasoning models so they get proper handling

### 2. Verify OpenRouter reasoning field handling

- File: `app/api/chat/route.ts`
- Confirm that `sendReasoning: true` properly handles OpenRouter's `reasoning` field format
- Check if MiniMax M2 needs any special OpenRouter provider options (around line 974)

### 3. Check reasoning format compatibility

- File: `components/message.tsx`
- Verify that `ReasoningUIPart` correctly displays reasoning from OpenRouter's format
- Ensure `part.details` array is properly populated for OpenRouter reasoning responses

### 4. Test and validate

- Verify reasoning appears correctly in the Reasoning section
- Ensure main response text is separate from reasoning
- Confirm UI displays both reasoning and response properly

## Notes

- According to OpenRouter docs, reasoning tokens are preserved in reasoning blocks via the `reasoning` field
- MiniMax M2 may use OpenRouter's native reasoning format instead of tag-based reasoning
- The AI SDK should handle this automatically with `sendReasoning: true`, but model detection may be missing

### To-dos

- [ ] Add MiniMax M2 to reasoning model detection in ai/providers.ts so it's recognized as a reasoning model
- [ ] Verify OpenRouter reasoning field handling in app/api/chat/route.ts and ensure sendReasoning works correctly
- [ ] Check ReasoningMessagePart component displays OpenRouter reasoning format correctly
- [ ] Test MiniMax M2 reasoning display to ensure it shows correctly in UI