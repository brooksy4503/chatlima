# OpenRouter User Tracking Implementation

## Overview

This document describes the implementation of OpenRouter's user tracking feature in ChatLima, which allows correlation between OpenRouter API logs and ChatLima users.

## Implementation Details

### User Identifier Format

- **Registered Users**: `chatlima_user_{userId}`
  - Example: `chatlima_user_sg8PcSbHlSnL01nfbmWFheyHdTQmvCbp`
- **Anonymous Users**: `chatlima_anon_{userId}`
  - Example: `chatlima_anon_8wHvXrPh6jfKGtuEQnxxD3sRMjiFdPbc`

### Modified Files

1. **`/app/api/chat/route.ts`**
   - Added `openRouterUserId` generation based on user session
   - Added `user` parameter to `openRouterPayload` (top-level)
   - Added `user` parameter to `providerOptions.openrouter` 
   - Added `user` parameter to `providerOptions.openrouter.extraBody`
   - Added debug logging for user tracking
   - Added `X-ChatLima-User-ID` header for additional context

2. **`/ai/providers.ts`**
   - Updated `createOpenRouterClientWithKey()` to accept optional `userId` parameter
   - Updated `getLanguageModelWithKeys()` to pass `userId` to OpenRouter client
   - Updated `getTitleGenerationModel()` to support user tracking
   - Added `X-ChatLima-User-ID` header in OpenRouter client configuration

3. **`/app/actions.ts`**
   - Updated `generateTitle()` function to accept and pass `userId` parameter

4. **`/lib/chat-store.ts`**
   - Updated `generateTitle()` call to pass `userId` parameter

### Implementation Status

✅ **Fully Implemented** - All components are in place and working:
- User session detection and ID generation
- OpenRouter client configuration with user tracking
- Title generation with user context
- Debug logging for monitoring
- Header-based user identification

### Benefits

1. **Enhanced Debugging**: OpenRouter logs now show `external_user` field with ChatLima user identifiers
2. **Improved Analytics**: User-specific usage analytics in OpenRouter dashboard
3. **Better Performance**: Sticky caching per user improves load-balancing and throughput
4. **Easy Correlation**: Direct mapping between OpenRouter logs and ChatLima database records
5. **User-Specific Caching**: OpenRouter can optimize responses based on user patterns

### Example OpenRouter Log Output

```json
{
  "id": 17577457331,
  "generation_id": "gen-1754518643-bjdW5x1EZJhqvSo6THy5",
  "provider_name": "OpenAI",
  "model": "openai/chatgpt-4o-latest",
  "external_user": "chatlima_user_clW7Qbm19MO0rhs2g9SuHOVdYc0hM0a9",
  "usage": 0.01509,
  "created_at": "2025-08-06T22:17:32.443002+00:00"
}
```

### Privacy Considerations

- Uses internal user IDs, not personally identifiable information
- Follows OpenRouter's recommended best practices
- Consistent with existing ChatLima privacy practices
- Anonymous users are tracked with `chatlima_anon_` prefix for analytics while maintaining privacy

### Testing

The implementation has been tested for:
- TypeScript compilation (✅ No errors)
- ESLint validation (✅ No new errors)
- Build process (✅ Successful)
- Runtime functionality (✅ Working in production)

### Monitoring

Debug logs will show user tracking information:
```
[Chat {id}] OpenRouter user tracking: chatlima_user_{userId}
```

Additional monitoring points:
- User session detection in chat route
- OpenRouter client creation with user context
- Title generation with user tracking
- Header-based user identification

### Technical Details

#### User Session Handling
- Detects both registered and anonymous users
- Generates appropriate user identifiers based on session type
- Handles session state changes gracefully

#### OpenRouter Integration
- Passes user ID at multiple levels for maximum compatibility
- Uses both `user` parameter and `X-ChatLima-User-ID` header
- Supports all OpenRouter models including web search variants

#### Error Handling
- Graceful fallback when user session is unavailable
- Continues operation even if user tracking fails
- Comprehensive logging for debugging

### Performance Impact

- **Minimal overhead**: User ID generation is lightweight
- **No additional API calls**: Uses existing session data
- **Improved caching**: OpenRouter can optimize per-user responses
- **Better load balancing**: User-aware routing improves throughput

## References

- [OpenRouter User Tracking Documentation](https://openrouter.ai/docs/use-cases/user-tracking)
- Implementation Date: August 2025
- Last Updated: August 2025
