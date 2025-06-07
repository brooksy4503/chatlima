# 🚀 ChatLima v0.4.0 - Support for DeepSeek R1 0528

## 🎯 What's New
- Added support for the DeepSeek R1 0528 model.
- Users can now select DeepSeek R1 0528 for chat interactions.
- Enhanced model selection capabilities in the UI.

## 🔧 Technical Implementation
- Integrated DeepSeek R1 0528 API.
- Updated model provider logic to include DeepSeek.
- Modified chat interface to accommodate new model options.
- New API route for DeepSeek interactions (if applicable, specify route).

## 🛡️ Security & Privacy
- Ensured secure API key management for DeepSeek.
- Maintained existing privacy standards with the new model integration.
- No changes to user data handling.

## 📈 Benefits
- Access to a new, powerful language model.
- Potentially improved response quality and capabilities.
- More options for users to tailor their chat experience.

## 🔄 Migration Notes
- No breaking changes.
- Ensure DeepSeek API key is configured in environment variables if self-hosting.
- No database migrations needed.

## 🚀 Deployment
- Standard deployment process.
- Verify DeepSeek API connectivity in the production environment.
- Ensure `.env` includes `DEEPSEEK_API_KEY` (or similar).

---

**Full Changelog**: [v0.3.1...v0.4.0](https://github.com/brooksy4503/chatlima/compare/v0.3.1...v0.4.0) 