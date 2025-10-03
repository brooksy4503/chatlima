# 🚀 ChatLima v0.33.1 - JSON Repair & UI Enhancements

## 🎯 What's New

- **Automatic JSON Repair**: Integrated the `jsonrepair` library to automatically detect and fix malformed JSON in chat messages
- **Improved Model Picker UI**: Enhanced the ModelPicker component with better responsive design and collision handling
- **Better Error Resilience**: Chat title generation now handles corrupted JSON gracefully without breaking the user experience

## 🔧 Technical Implementation

### JSON Repair Utility
- Added new `lib/utils/json-repair.ts` utility module with comprehensive JSON repair functionality
- Integrated `jsonrepair` package (v3.13.1) for robust JSON correction
- Updated `app/actions.ts` to use the new `repairJSON` utility in the `generateTitle` function
- Handles multiple JSON issues: missing quotes, trailing commas, unclosed brackets, malformed strings

### ModelPicker Improvements
- Updated `components/model-picker.tsx` with responsive max-height calculations using `min()` function
- Added `side` and `sideOffset` properties to PopoverContent for better positioning
- Implemented `collisionPadding` for improved usability on smaller screens
- Enhanced overflow behavior with consistent scroll-area management

## 🛡️ Security & Privacy

- Client-side JSON repair ensures sensitive data never leaves the user's device
- No external API calls for JSON correction, maintaining complete privacy
- Robust error handling prevents data loss from malformed messages

## 📈 Benefits

### For Users
- **Seamless Experience**: Malformed JSON from AI models no longer breaks chat functionality
- **Better UI/UX**: Model picker adapts better to different screen sizes and viewport constraints
- **Reliability**: Automatic error correction reduces friction in conversations

### For Developers
- **Maintainability**: Centralized JSON repair logic in a reusable utility module
- **Debugging**: Clear error logging for JSON repair attempts
- **Flexibility**: Easy to extend with additional JSON repair strategies

## 🔄 Migration Notes

No breaking changes in this release. This is a drop-in upgrade with backward compatibility maintained.

## 🚀 Deployment

Standard deployment process:
```bash
git pull origin main
pnpm install  # New jsonrepair dependency
pnpm build
```

### New Dependency
- `jsonrepair@3.13.1` - Automatic JSON correction library

## 📦 Files Changed

### New Files
- `lib/utils/json-repair.ts` - JSON repair utility with error handling

### Modified Files
- `app/actions.ts` - Integrated JSON repair in title generation
- `components/model-picker.tsx` - Enhanced responsive design and collision handling
- `package.json` - Added jsonrepair dependency

## 🐛 Bug Fixes

- Fixed ModelPicker popover positioning issues on smaller screens
- Resolved overflow behavior inconsistencies in model selector
- Improved responsive height management for model details column

## 🔍 Technical Details

### JSON Repair Implementation
The new JSON repair utility provides:
- Safe JSON parsing with automatic repair attempts
- Fallback to original string if repair fails
- Comprehensive error logging for debugging
- Type-safe TypeScript implementation with proper error handling

### ModelPicker Responsive Improvements
- Max height now uses `min(calc(100vh - 200px), 600px)` for better viewport adaptation
- Collision padding ensures popover never extends beyond viewport boundaries
- Consistent scroll behavior across all screen sizes

---

**Full Changelog**: [v0.33.0...v0.33.1](https://github.com/brooksy4503/chatlima/compare/v0.33.0...v0.33.1)

**Previous Release**: [v0.33.0 - PDF Export Functionality](./RELEASE_NOTES_v0.33.0.md)

