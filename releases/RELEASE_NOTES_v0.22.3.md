# 🚀 ChatLima v0.22.3 - Flash Model Access & Premium Coding

## 🎯 What's New
- **Enhanced Flash Model Access**: Made Google Gemini 2.5 Flash available for free users while maintaining premium Pro-tier models
- **Premium Coding Model**: Upgraded specialized Gemini 2.5 Pro Preview Coding model to premium tier for enhanced development workflows
- **Consistent Pro-Tier Premium**: All Gemini 2.5 Pro variants remain premium-only, maintaining clear value distinction

## 🔧 Technical Implementation
- Updated premium status flags in `ai/providers.ts` for 2 Google Gemini models
- Made `requesty/google/gemini-2.5-flash` accessible to free users
- Elevated `requesty/coding/gemini-2.5-pro-preview-05-06` to premium tier
- Maintained backward compatibility with existing model configurations

## 📊 Model Access Changes

### 🆓 Models Made Free
- **Google Gemini 2.5 Flash** (`requesty/google/gemini-2.5-flash`) - Fast, efficient model with thinking capabilities now available for free tier

### 💎 Models Made Premium  
- **Gemini 2.5 Pro Preview Coding** (`requesty/coding/gemini-2.5-pro-preview-05-06`) - Specialized coding model with enhanced development capabilities

**Note**: All Gemini 2.5 Pro models remain premium-only. No Pro-tier models were made free in this release.

## 🎁 Benefits
- **Improved Free Tier**: Google Gemini 2.5 Flash now available without subscription for fast, efficient AI processing
- **Enhanced Premium Value**: Premium users retain exclusive access to all Pro-tier models plus specialized coding variants
- **Clear Model Hierarchy**: Maintained distinction between Flash (accessible) and Pro (premium) model tiers
- **Developer-Focused Premium**: Specialized coding model now premium, providing enhanced value for development workflows

## 🔄 Migration Notes
- No breaking changes - existing API calls will continue to work
- Users with existing premium subscriptions retain access to all premium models
- Free tier users gain access to Google Gemini 2.5 Flash (previously premium)
- `requesty/coding/gemini-2.5-pro-preview-05-06` now requires premium subscription
- Model IDs remain unchanged, only access tiers have been modified

## 🚀 Deployment
- Changes are automatically deployed via GitHub integration
- No database migrations required
- Model access changes take effect immediately upon deployment
- No additional configuration needed

---

**Full Changelog**: [v0.22.2...v0.22.3](https://github.com/brooksy4503/chatlima/compare/v0.22.2...v0.22.3)

**GitHub Release**: [v0.22.3](https://github.com/brooksy4503/chatlima/releases/tag/v0.22.3) 