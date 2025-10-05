# 🚀 ChatLima v0.33.2 - Enhanced Model Access & API Improvements

## 🎯 What's New

This patch release focuses on improving model access flexibility and enhancing API parsing for better compatibility with provider updates.

### 🔓 Enhanced Model Access Control
- **User API Key Support**: Users who provide their own OpenRouter or Requesty API keys now have access to **all models** from those providers, not just free models
- **Flexible Credit System**: The model filtering system now intelligently determines access based on:
  - User authentication status
  - Available credits
  - User-provided API keys (per provider)
- **Granular Provider Control**: Each provider's access is evaluated independently - users with an OpenRouter key get full OpenRouter access, while Requesty access remains restricted unless they also provide a Requesty key

### 🔧 Requesty API Parser Update
- **New Response Format Support**: Updated the Requesty model parser to handle the latest API response structure
- **Direct ID Field Usage**: Now uses the `id` field directly for model identification, improving accuracy and reliability
- **Improved Pricing Calculations**: Per-token pricing is now extracted directly from the API response (`input_price` and `output_price` fields)
- **Enhanced Capability Detection**: Better detection of model capabilities based on the `id` field rather than deprecated `model` field

### 📚 Documentation Improvements
- **Updated README**: Enhanced documentation reflecting recent features including:
  - Daily message tracking enhancements
  - Automated user cleanup system
  - Admin cleanup dashboard
  - PDF export capabilities
  - Security features and monitoring
  - Developer tools and health check APIs

## 🔧 Technical Implementation

### Model Filtering Logic (`app/api/models/route.ts`)
The model filtering system has been enhanced with more sophisticated logic:

```typescript
// Check which providers the user has API keys for
const hasOpenRouterKey = userKeys['OPENROUTER_API_KEY']?.trim().length > 0;
const hasRequestyKey = userKeys['REQUESTY_API_KEY']?.trim().length > 0;

// Allow all models from providers where user has their own API key
if (m.id.startsWith('openrouter/') && hasOpenRouterKey) {
    return true;
}
if (m.id.startsWith('requesty/') && hasRequestyKey) {
    return true;
}
```

### Requesty Parser Updates (`lib/models/provider-configs.ts`)
- **Line 220-226**: Updated model ID extraction to use `model.id` directly
- **Line 229**: Simplified model ID construction with direct field usage
- **Line 234-237**: Enhanced capability detection using the `id` field
- **Line 259-262**: Updated pricing extraction to use new `input_price` and `output_price` fields
- **Line 266-269**: Improved display name generation from model ID

### Key Changes
1. **Model Access Control** (Lines 126-150 in `app/api/models/route.ts`):
   - Checks for user-provided API keys per provider
   - Allows full model access when user has their own keys
   - Maintains credit-based restrictions for users without API keys

2. **Requesty API Compatibility** (Lines 208-301 in `lib/models/provider-configs.ts`):
   - Updated to handle new API response format
   - Direct field access for improved reliability
   - Better error handling and validation

## 🎯 Benefits

### For Users
- **More Flexibility**: Bring your own API keys to unlock all models from specific providers
- **Cost Control**: Use your own API keys for providers where you have better rates or unlimited access
- **Better Experience**: More accurate model information and pricing from Requesty

### For Developers
- **Cleaner Code**: Simplified parser logic with direct field access
- **Better Maintainability**: More robust handling of API response changes
- **Improved Documentation**: Updated README reflects current feature set

### For Platform Operators
- **Flexible Monetization**: Support both credit-based and BYOK (Bring Your Own Key) models
- **Reduced API Costs**: Users with their own keys don't consume platform credits
- **Better Scalability**: More granular control over model access

## 🔄 Migration Notes

### No Breaking Changes
This is a patch release with **no breaking changes**. All existing functionality remains intact.

### For Users with API Keys
If you've already provided OpenRouter or Requesty API keys in your settings:
- You'll automatically gain access to all models from those providers
- No action required - the change is transparent

### For Developers
If you're working with the model filtering logic:
- Review the updated filtering logic in `app/api/models/route.ts` (lines 126-150)
- The Requesty parser now expects the new API format - ensure your test data matches

## 🚀 Deployment

### Standard Deployment Process
This release follows the standard deployment workflow:

```bash
# Already completed:
# 1. Version bumped to 0.33.2
# 2. Git tag created (v0.33.2)

# Next steps:
git push origin main --tags
```

### Automatic Deployment
With GitHub integration enabled, pushing to main will automatically trigger production deployment via Vercel.

### Environment Considerations
- No new environment variables required
- Existing API keys continue to work as before
- No database migrations needed

## 📊 Changes Summary

### Files Modified
- `app/api/models/route.ts` - Enhanced model filtering logic (25 lines changed)
- `lib/models/provider-configs.ts` - Updated Requesty parser (63 lines changed)
- `README.md` - Documentation improvements (48 lines changed)

### Commits Included
- `91896ad` - feat: enhance model filtering and parsing for OpenRouter and Requesty
- `030ad55` - feat: enhance README with new features and improvements

---

**Full Changelog**: [v0.33.1...v0.33.2](https://github.com/brooksy4503/chatlima/compare/v0.33.1...v0.33.2)
