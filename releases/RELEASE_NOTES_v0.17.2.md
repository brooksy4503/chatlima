# 🚀 ChatLima v0.17.2 - Model Picker UI Fix

## 🎯 What's New
- **Fixed Model Picker UI Glitch**: Resolved an annoying layout issue where the model picker button would visually "flip" or change content when hovering over different models in the dropdown
- **Improved User Experience**: The model picker now maintains a stable, consistent display while still showing detailed information about hovered models

## 🔧 Technical Implementation
- **Separated Display Logic**: Split the display logic to ensure the main button always shows the selected model, while the details panel shows the hovered/focused model
- **Prevented Layout Flipping**: Updated [components/model-picker.tsx](mdc:chatlima/components/model-picker.tsx) to use separate state variables for button display vs. details panel content
- **Enhanced Stability**: The main button now consistently shows `selectedModelDetails` instead of switching between different model states during user interaction

## 🛡️ Security & Privacy
- No security or privacy changes in this release

## 📈 Benefits
- **Better UX**: Users no longer experience confusing visual changes when browsing available models
- **Improved Accessibility**: More predictable interface behavior for users navigating with keyboard or mouse
- **Reduced Cognitive Load**: Stable button display reduces visual distraction during model selection

## 🔄 Migration Notes
- No breaking changes or migration required
- Existing model selections and preferences remain unchanged

## 🚀 Deployment
- Standard deployment process
- No environment changes required
- No database migrations needed

## 📋 Technical Details
The fix involved updating the component's display logic:
- **Before**: Single `displayModelId` variable caused button content to change during hover
- **After**: Separate `selectedModelDetails` (for button) and `detailsPanelModelDetails` (for info panel)

This ensures the button always shows the currently selected model while the details panel can independently show information about hovered models.

---

**Full Changelog**: [v0.17.1...v0.17.2](https://github.com/brooksy4503/chatlima/compare/v0.17.1...v0.17.2) 