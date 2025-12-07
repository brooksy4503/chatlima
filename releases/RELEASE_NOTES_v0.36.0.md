# 🚀 ChatLima v0.36.0 - Tiered Credit System & Enhanced Workflows

## 🎯 What's New

This release introduces a **tiered credit cost system** that charges different amounts of credits per message based on the actual API pricing of AI models. This major enhancement protects against abuse where users could consume $100+ of API costs while only paying $10 in credits, while also providing transparent pricing to users. Additionally, this release includes significant improvements to the release workflow automation and enhanced OAuth functionality.

### 💰 Tiered Credit Cost System

- **Five-Tier Pricing Structure**: Models are categorized into five tiers based on their API pricing:
  - **Free/Standard**: 1 credit (free or low-cost models)
  - **Premium**: 2 credits ($3-15/M input or $5-50/M output)
  - **High Premium**: 5 credits ($15-50/M) - Claude Opus, GPT-4
  - **Very High Premium**: 15 credits ($50-100/M) - GPT-5 Pro
  - **Ultra Premium**: 30 credits ($100+/M) - o1-pro, o3-pro

- **Transparent Pricing**: Credit costs are displayed in the model picker, allowing users to make informed decisions
- **Smart Calculation**: Automatically calculates credit costs based on model pricing data
- **API Endpoint**: New `/api/models/[modelId]/credit-cost` endpoint provides real-time credit cost information
- **Protection Against Abuse**: Prevents users from consuming expensive API resources while paying flat rates

### 🔄 Release Workflow Enhancements

- **Smart Branch Detection**: Automatically skips merge step when already on main branch
- **Critical Branch Protection**: Prevents accidental deletion of protected branches (main, master, develop)
- **Improved Safety**: Enhanced error handling and validation in release automation

### 🔐 OAuth Improvements

- **Clear Auth Button**: New button to easily clear OAuth authorization for MCP servers
- **Enhanced Logging**: Improved OAuth flow logging for better debugging
- **Fetch Interceptor**: Integrated OAuth fetch interceptor for seamless token management
- **Session Optimization**: Optimized session handling and model refresh logic

### 📝 Message Formatting Enhancements

- **Tool Message Filtering**: Enhanced message formatting by filtering out tool messages
- **Improved OpenRouter Compatibility**: Refined message filtering logic for better compatibility with OpenRouter API
- **Better Message Handling**: More robust message conversion and formatting

## 🔧 Technical Implementation

### Tiered Credit System

**`lib/utils/creditCostCalculator.ts`** (New)
- Central utility function `calculateCreditCostPerMessage()` that calculates credit costs based on model pricing
- Five-tier pricing structure with automatic tier determination
- Fallback behavior for missing pricing data
- Support for both input and output pricing calculations

**`lib/tokenCounter.ts`** (Enhanced)
- Updated `trackTokenUsage()` to accept `modelInfo` parameter
- Integrated variable credit cost calculation
- Updated `hasEnoughCredits()` to validate based on model-specific credit costs

**`lib/services/chatCreditValidationService.ts`** (Enhanced)
- Integrated tiered credit cost validation
- Pre-flight credit checks based on model pricing
- Enhanced error messages showing required credit costs

**`app/api/models/[modelId]/credit-cost/route.ts`** (New)
- RESTful API endpoint for querying model credit costs
- Real-time credit cost calculation
- Error handling for missing models

**`components/model-picker.tsx`** (Enhanced)
- Credit cost display in model details panel
- Real-time credit cost fetching
- Visual indicators for premium models
- Color-coded credit cost display (yellow for premium models)

### Release Workflow Script

**`scripts/release-workflow.ts`** (Enhanced)
- Added protection for critical branches (main, master, develop)
- Automatic detection of main branch to skip merge step
- Improved error messages and validation
- Enhanced safety checks before branch deletion

### OAuth Enhancements

**`lib/services/chatMCPServerService.ts`** (Enhanced)
- Improved OAuth status checking and logging
- Optimized session handling and model refresh logic
- Integrated OAuth fetch interceptor
- Enhanced logging throughout OAuth flow

**`components/mcp-server-manager.tsx`** (Enhanced)
- Added "Clear Auth" button for easy OAuth revocation
- Enhanced OAuth flow logging
- Improved status indicators

### Message Formatting

**Message Conversion Logic** (Enhanced)
- Enhanced message formatting by filtering out tool messages
- Refined message filtering logic in `convertToOpenRouterFormat`
- Better compatibility with OpenRouter API requirements

## 🛡️ Security & Privacy

### Security Enhancements
- **Tiered Credit Protection**: Prevents abuse of expensive models by requiring appropriate credit costs
- **Credit Validation**: Enhanced pre-flight credit checks prevent unauthorized usage
- **OAuth Security**: Improved OAuth token management and session handling
- **Branch Protection**: Prevents accidental deletion of critical branches in release workflow

### Privacy Considerations
- **Transparent Pricing**: Users can see credit costs before using models
- **No Data Collection**: Credit cost calculations use existing model pricing data
- **Local Calculations**: Credit costs calculated server-side with no external data sharing

## 📈 Benefits

### For Users
- **Fair Pricing**: Credit costs reflect actual API pricing, ensuring fair usage
- **Transparent Costs**: See credit costs before selecting models
- **Better Planning**: Understand credit requirements before sending messages
- **Protection**: System protects against unexpected high costs

### For Platform Operators
- **Cost Protection**: Prevents abuse where users consume expensive API resources at flat rates
- **Fair Billing**: Credit costs align with actual API costs
- **Better Economics**: Sustainable pricing model that scales with usage
- **Transparency**: Clear pricing structure builds user trust

### For Developers
- **Extensible System**: Easy to adjust tiers or add new pricing models
- **Type-Safe**: Full TypeScript support with proper type definitions
- **Well-Documented**: Comprehensive documentation in `docs/variable-credit-costs-implementation.md`
- **Test Coverage**: Comprehensive test suite for credit cost calculations

## 🔄 Migration Notes

### No Breaking Changes
This release maintains **full backward compatibility**. All existing functionality continues to work without modification.

### New Features Available
- **Tiered Credit Costs**: Credit costs now vary by model (1-30 credits)
- **Credit Cost API**: New `/api/models/[modelId]/credit-cost` endpoint
- **Credit Cost Display**: Credit costs visible in model picker
- **Release Workflow**: Enhanced automation with branch protection
- **OAuth Clear Button**: Easy OAuth revocation in MCP Server Manager

### User-Facing Changes
- **Credit Cost Display**: Models now show credit costs in the model picker
- **Variable Costs**: Different models cost different amounts of credits
- **Clear Auth Button**: New button in MCP Server Manager for OAuth management

### For Developers
- **New Utility**: `calculateCreditCostPerMessage()` function in `lib/utils/creditCostCalculator.ts`
- **New API Route**: `/api/models/[modelId]/credit-cost` for credit cost queries
- **Enhanced Services**: Updated credit validation and token tracking services
- **No Database Migrations**: No database changes required
- **No Environment Variables**: No new environment variables needed

### Usage Examples

**Checking Credit Cost for a Model:**
```typescript
// Via API
const response = await fetch(`/api/models/${modelId}/credit-cost`);
const { creditCost } = await response.json();

// Programmatically
import { calculateCreditCostPerMessage } from '@/lib/utils/creditCostCalculator';
const creditCost = calculateCreditCostPerMessage(modelInfo);
```

**Credit Cost Tiers:**
- Free models (gpt-3.5-turbo): 1 credit
- Premium models (claude-3-sonnet): 2 credits
- High Premium (claude-opus, gpt-4): 5 credits
- Very High Premium (gpt-5-pro): 15 credits
- Ultra Premium (o1-pro, o3-pro): 30 credits

## 🚀 Deployment

### Standard Deployment Process
This release follows the standard deployment workflow:

```bash
# Completed:
# 1. Version bumped to 0.36.0
# 2. Git tag created (v0.36.0)
# 3. Tags pushed to remote
```

### Automatic Deployment
With GitHub integration enabled, pushing to main automatically triggers production deployment via Vercel.

### Environment Considerations
- ✅ No new environment variables needed
- ✅ No database migrations needed
- ✅ Backward compatible with all previous versions
- ✅ Credit cost calculations use existing model pricing data

### Pre-Deployment Checklist
- [x] Tiered credit system tested with various models
- [x] Credit cost display verified in UI
- [x] API endpoint tested and working
- [x] Release workflow script tested
- [x] OAuth enhancements verified
- [x] Message formatting improvements tested

## 📊 Changes Summary

### Files Modified
- `lib/tokenCounter.ts` - Integrated tiered credit cost calculation
- `lib/services/chatCreditValidationService.ts` - Added tiered credit validation
- `lib/services/chatTokenTrackingService.ts` - Updated to use variable credit costs
- `lib/services/creditCache.ts` - Enhanced credit checking with tiered costs
- `lib/services/directTokenTracking.ts` - Added model info fetching for credit costs
- `lib/services/chatMCPServerService.ts` - OAuth improvements and logging
- `components/model-picker.tsx` - Added credit cost display
- `components/mcp-server-manager.tsx` - Added Clear Auth button and OAuth improvements
- `scripts/release-workflow.ts` - Added branch protection and main branch detection
- `app/api/chat/route.ts` - Updated to pass model info for credit calculations

### Files Added
- `lib/utils/creditCostCalculator.ts` - Credit cost calculation utility (33 lines)
- `app/api/models/[modelId]/credit-cost/route.ts` - Credit cost API endpoint (53 lines)
- `docs/variable-credit-costs-implementation.md` - Comprehensive documentation (310 lines)
- `releases/RELEASE_NOTES_v0.36.0.md` - This release notes file

### Commits Included
- `ef86f85` - 0.36.0 (version bump)
- `20ca822` - feat: skip merge step for main branch in release workflow
- `3323762` - feat: add protection for critical branches in release workflow
- `db667b1` - feat: implement tiered credit system and enhance model pricing transparency
- `a9f05eb` - refactor: update pricing management for increased precision
- `b2aae38` - refactor: improve OAuth status checking and logging in MCP server manager
- `b71b3d6` - refactor: optimize session handling and model refresh logic
- `291e6ea` - refactor: integrate OAuth fetch interceptor and enhance logging in MCP server manager
- `ed621d9` - fix: update log messages and improve accessibility in components
- `ba10bbf` - feat: add Clear Auth button and enhance OAuth flow logging
- `0f4d994` - fix: refine message filtering logic in convertToOpenRouterFormat
- `d8945c0` - feat: enhance message formatting by filtering out tool messages

### Statistics
- **12 commits** included in this release
- **Major Feature**: Tiered credit cost system
- **Enhancement**: Release workflow automation improvements
- **Enhancement**: OAuth functionality improvements
- **Enhancement**: Message formatting improvements

---

**Full Changelog**: [v0.35.0...v0.36.0](https://github.com/brooksy4503/chatlima/compare/v0.35.0...v0.36.0)

## 🎉 What's Next

This release establishes a sustainable pricing model that protects against abuse while providing transparency to users. Future enhancements may include:
- Dynamic tier adjustments based on usage patterns
- User-specific pricing tiers
- Bulk discount programs
- Credit cost optimization suggestions
- Enhanced OAuth token refresh automation
- Additional release workflow automation features
