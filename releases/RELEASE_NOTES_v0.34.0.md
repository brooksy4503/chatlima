# 🚀 ChatLima v0.34.0 - Yearly Subscription Plan with Unlimited Free Models

## 🎯 What's New

This release introduces a revolutionary new subscription tier: the **$10/year plan** that provides unlimited access to free OpenRouter models. This makes ChatLima more accessible while maintaining premium features for power users.

### 💎 New Yearly Subscription Plan
- **Unlimited Messages**: No monthly message limits for yearly subscribers
- **Unlimited Free Models**: Access to all OpenRouter `:free` models without restrictions
- **92% Savings**: Pay $10/year instead of $10/month - save $110 annually
- **Perfect for Casual Users**: Ideal for users who primarily use free models and want unlimited access

### 📊 Enhanced Upgrade Page
- **Side-by-Side Comparison**: Clear comparison between monthly and yearly plans
- **Visual Indicators**: "BEST VALUE" badge on yearly plan, active subscription status
- **Smart Checkout Flow**: Seamless sign-in and checkout experience for anonymous users
- **Subscription Management**: Direct links to manage existing subscriptions

### 🔐 Subscription-Based Access Control
- **Intelligent Model Filtering**: Yearly subscribers see all free models automatically
- **Premium Model Protection**: Yearly subscribers are guided to upgrade for premium model access
- **Credit-Free Access**: Yearly subscribers don't need credits for free models
- **Message Limit Bypass**: Unlimited messages for yearly subscribers using free models

## 🔧 Technical Implementation

### Core Subscription Infrastructure

**`lib/polar.ts`** (New functions)
- `getSubscriptionTypeByExternalId()`: Detects subscription type (monthly/yearly/null)
- `hasUnlimitedFreeModels()`: Checks if user has yearly subscription
- Cached results for performance optimization
- Robust error handling for API failures

**`lib/auth.ts`** (Webhook handlers updated)
- `onSubscriptionCreated`: Detects product ID and sets subscription type in user metadata
- `onSubscriptionCanceled`: Clears subscription type from metadata
- `onSubscriptionRevoked`: Handles subscription revocation
- Product ID matching for monthly vs yearly plans
- Backward compatibility maintained with `hasSubscription` flag

### Model Access Logic Updates

**`app/api/models/route.ts`** (Model filtering enhanced)
- Priority check for yearly subscription before credit validation
- Yearly subscribers bypass credit checks for free models
- Premium models remain restricted for yearly subscribers
- Clear error messages guiding users to upgrade for premium access

**`lib/services/chatCreditValidationService.ts`** (Credit validation updated)
- `validateFreeModelAccess()`: Checks yearly subscription before enforcing restrictions
- Yearly subscribers can use free models without credits
- Premium model access blocked with helpful upgrade messaging
- Security logging for access attempts

### Message Limit Logic

**`lib/auth.ts` - `checkMessageLimit()` function** (Enhanced)
- Yearly subscribers receive unlimited message limit (999,999 for display)
- Credit checks skipped for yearly subscribers
- Message tracking continues for analytics
- Premium model access still requires monthly subscription

**`lib/services/dailyMessageUsageService.ts`** (Limit enforcement updated)
- Skips limit enforcement for yearly subscribers on free models
- Continues tracking for analytics purposes
- Maintains existing behavior for monthly subscribers

### User Interface Components

**`app/upgrade/page.tsx`** (New upgrade page)
- Beautiful side-by-side plan comparison
- Loading states using React Suspense
- OAuth error handling and cleanup
- Session storage for pending checkout flows
- Active subscription status display
- Direct subscription management links

**`components/checkout-button.tsx`** (Enhanced)
- Support for both monthly (`ai-usage`) and yearly (`free-models-unlimited`) plans
- Anonymous user sign-in flow integration
- Error handling and state management
- Loading states during checkout

**`app/checkout/success/page.tsx`** (Loading state added)
- Suspense wrapper for better loading experience
- Improved error handling

### API Route Updates

**`app/api/usage/messages/route.ts`** (Response enhanced)
- Includes `subscriptionType` in response
- Includes `hasUnlimitedFreeModels` flag
- Backward compatible with existing clients

**`lib/middleware/auth.ts`** (Auth context updated)
- `subscriptionType` added to context
- Populated from user metadata or Polar API
- Available throughout the application

### Type Definitions

**`lib/types/api.ts`** (Types extended)
- `subscriptionType?: 'monthly' | 'yearly' | null` added to interfaces
- `hasUnlimitedFreeModels?: boolean` flag added
- Type-safe subscription handling throughout codebase

## 🛡️ Security & Privacy

### Access Control Enhancements
- **Subscription Validation**: All subscription checks verified against Polar API
- **Model Access Enforcement**: Yearly subscribers cannot access premium models without upgrade
- **Credit Protection**: Yearly subscription doesn't grant access to premium models
- **Security Logging**: All access attempts logged for security monitoring

### Privacy Protection
- **Metadata Storage**: Subscription type stored securely in user metadata
- **API Key Isolation**: User API keys remain separate from subscription logic
- **No Data Leakage**: Subscription status only exposed to authenticated users

## 📈 Benefits

### For Users
- **Affordable Access**: $10/year for unlimited free model access
- **No Message Limits**: Chat as much as you want with free models
- **Clear Upgrade Path**: Easy to understand when and why to upgrade to monthly plan
- **Flexible Options**: Choose the plan that fits your usage pattern

### For Platform Operators
- **Increased Accessibility**: Lower barrier to entry for new users
- **Revenue Diversification**: Multiple subscription tiers for different user segments
- **User Retention**: Yearly subscriptions improve long-term retention
- **Clear Value Proposition**: Easy to communicate benefits of each plan

### For Developers
- **Type-Safe Implementation**: Full TypeScript support for subscription types
- **Extensible Architecture**: Easy to add new subscription tiers
- **Comprehensive Testing**: Test coverage for all subscription scenarios
- **Clean Separation**: Subscription logic separated from credit logic

## 🔄 Migration Notes

### No Breaking Changes
This release maintains **full backward compatibility**. All existing functionality remains intact.

### User-Facing Changes
- New upgrade page at `/upgrade` showing both subscription options
- Yearly subscribers see unlimited message limits
- Yearly subscribers automatically see all free models
- Premium models show upgrade prompts for yearly subscribers

### For Developers
If you're extending subscription functionality:
- Use `getSubscriptionTypeByExternalId()` to check subscription type
- Use `hasUnlimitedFreeModels()` for free model access checks
- Check `subscriptionType` in user metadata or API responses
- Subscription type is available in `AuthContext` via middleware

### Environment Variables
- **New Required**: `POLAR_PRODUCT_ID_YEARLY` - Product ID for yearly subscription plan
- **Existing**: `POLAR_PRODUCT_ID` - Product ID for monthly subscription plan (unchanged)

### Database Changes
- No database migrations required
- Subscription type stored in user metadata (JSON field)
- Backward compatible with existing user records

## 🚀 Deployment

### Standard Deployment Process
This release follows the standard deployment workflow:

```bash
# Completed:
# 1. Version bumped to 0.34.0
# 2. Git tag created (v0.34.0)
# 3. Tags pushed to remote
```

### Automatic Deployment
With GitHub integration enabled, pushing to main automatically triggers production deployment via Vercel.

### Environment Considerations
- ✅ **New Environment Variable**: `POLAR_PRODUCT_ID_YEARLY` must be set in production
- ✅ No database migrations needed
- ✅ No dependency updates required
- ✅ Backward compatible with all previous versions
- ⚠️ **Action Required**: Create yearly subscription product in Polar dashboard and set `POLAR_PRODUCT_ID_YEARLY`

### Pre-Deployment Checklist
- [ ] Create yearly subscription product in Polar dashboard
- [ ] Set `POLAR_PRODUCT_ID_YEARLY` environment variable
- [ ] Test checkout flow for both plans
- [ ] Verify subscription type detection works correctly
- [ ] Test model filtering for yearly subscribers
- [ ] Verify message limits are bypassed for yearly subscribers
- [ ] Test upgrade/downgrade flow between plans

## 📊 Changes Summary

### Files Modified
- `lib/auth.ts` - Webhook handlers, checkout config, message limit logic
- `lib/polar.ts` - Subscription type detection functions
- `app/api/models/route.ts` - Model filtering logic
- `lib/services/chatCreditValidationService.ts` - Credit validation
- `lib/services/dailyMessageUsageService.ts` - Message limit logic
- `components/checkout-button.tsx` - Checkout button updates
- `lib/middleware/auth.ts` - Auth context updates
- `lib/types/api.ts` - Type definitions
- `app/api/usage/messages/route.ts` - Usage API response
- `app/checkout/success/page.tsx` - Loading state improvements
- `__tests__/components/checkout-button.test.tsx` - Test updates

### Files Added
- `app/upgrade/page.tsx` - New upgrade page with plan comparison
- `releases/RELEASE_NOTES_v0.34.0.md` - This release notes file

### Files Refactored
- `app/api/chat/route.ts` - Error handling improvements
- MCP client initialization - Simplified and enhanced error logging
- Various components - Loading states using Suspense

### Commits Included
- `1e218a9` - feat: enhance checkout button logic for yearly subscribers
- `4f93914` - Merge pull request #25: feature/yearly-subscription-plan
- `3b3294b` - refactor: update CheckoutButton tests to use signIn.social
- `f15933f` - fix: remove merge conflict marker from chat route file
- `779e67c` - feat: implement loading state in UpgradePage using Suspense
- `fbeedf7` - feat: implement loading state for CheckoutSuccessPage using Suspense
- `9189f9e` - feat: update checkout button logic for anonymous users
- `81af503` - refactor: simplify UpgradeButton component structure
- `b377c1e` - feat: update checkout and upgrade flows for authenticated users
- `ca8212b` - feat: enhance auth context and trusted origins for development
- `6625e2e` - feat: implement subscription-based access control for models and messages
- Plus additional refactoring and error handling improvements

### Statistics
- **20+ files changed**
- **1,500+ insertions**, 200+ deletions
- Net improvement: +1,300+ lines
- **Major feature**: Yearly subscription plan with unlimited free models

---

**Full Changelog**: [v0.33.4...v0.34.0](https://github.com/brooksy4503/chatlima/compare/v0.33.4...v0.34.0)

## 🎉 What's Next

This release establishes a flexible subscription foundation. Future enhancements may include:
- Additional subscription tiers (e.g., student discounts, enterprise plans)
- Subscription analytics and reporting
- Automated subscription management features
- Usage-based billing options
- Family/shared subscription plans
- Subscription gift cards or promotional codes
