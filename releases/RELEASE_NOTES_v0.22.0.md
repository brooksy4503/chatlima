# 🚀 ChatLima v0.22.0 - Requesty Model Expansion & Model Selection Improvements

## 🎯 What's New
- **🆕 Major Requesty Model Expansion**: Added a wide range of new Requesty models, including the latest Anthropic Claude 4, Claude 3.5/3.7, DeepSeek, Google Gemini, Meta Llama, and more. Users now have access to dozens of new models via Requesty, greatly expanding the available AI model library.
- **🔄 Improved Model Selection**: Enhanced model selection logic and metadata for seamless switching between OpenRouter and Requesty providers.
- **🛠️ Model Details & Capabilities**: Updated model metadata for new and existing models, including improved capability flags, premium status, and vision support where applicable.
- **🐛 Bug Fixes**: Fixed image upload and preview issues for a smoother user experience.

## 🔧 Technical Implementation
- **Requesty Model Integration**: Updated `ai/providers.ts` to add and configure new Requesty models, including:
  - Anthropic Claude 4 Opus & Sonnet (2025-05-14)
  - Anthropic Claude 3.5 Sonnet/Haiku (latest)
  - Anthropic Claude 3.7 Sonnet (latest, thinking)
  - Anthropic Claude 3 Opus/Sonnet/Haiku (latest)
  - DeepSeek R1, V3, Reasoner, and distill variants (multiple providers)
  - Google Gemini 2.5 Flash/Pro (multiple variants)
  - Meta Llama 3.1/3.3 70B Instruct
  - Moonshot Kimi K2 Instruct
  - And many more (see `ai/providers.ts` for full list)
- **Scripted Model Addition**: Used and updated `scripts/add-requesty-models.ts` for automated model mapping and insertion.
- **Model Metadata**: Enhanced `modelDetails` with accurate provider, capability, premium, and vision flags for all new models.
- **Bug Fixes**: Addressed image upload and preview issues for improved reliability.

## 🛡️ Security & Privacy
- No new security risks introduced. All API keys and provider credentials remain managed via environment variables.
- Maintained secure API key management and provider selection logic.

## 📈 Benefits
- **Expanded Model Choice**: Users can now select from a much larger set of AI models, including the latest from Anthropic, DeepSeek, Google, Meta, and more, all via Requesty.
- **Provider Flexibility**: Easily switch between OpenRouter and Requesty for redundancy and access to exclusive models.
- **Improved User Experience**: Smoother image upload and preview, plus more accurate model metadata for better selection.

## 🔄 Migration Notes
- **No Breaking Changes**: All existing functionality remains compatible. New models are available immediately after deployment.
- **Environment Variables**: Ensure `REQUESTY_ENABLED` and `REQUESTY_API_KEY` are set if using Requesty provider.
- **Model Selection**: All new models are available in the model picker; no manual configuration required.

## 🚀 Deployment
- **Standard Deployment**: No special steps required. Deploy as usual after updating environment variables if needed.
- **No Database Changes**: No migrations required for this release.

---

**Full Changelog**: [v0.21.0...v0.22.0](https://github.com/brooksy4503/chatlima/compare/v0.21.0...v0.22.0) 