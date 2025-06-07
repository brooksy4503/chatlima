# 🚀 ChatLima v0.8.0 - Requesty Provider & Enhanced Model Selection

## 🎯 What's New
- **New AI Provider**: Introduced Requesty as a new AI provider option alongside OpenRouter, Anthropic, OpenAI, Groq, and X AI
- **7 New Requesty Models**: Access popular AI models through Requesty's infrastructure:
  - `requesty/openai/gpt-4o` - OpenAI's advanced GPT-4O model
  - `requesty/openai/gpt-4o-mini` - Efficient GPT-4O Mini variant  
  - `requesty/anthropic/claude-3.5-sonnet` - Anthropic's Claude 3.5 Sonnet
  - `requesty/anthropic/claude-3.7-sonnet` - Latest Claude 3.7 Sonnet
  - `requesty/google/gemini-2.5-flash-preview` - Google's Gemini 2.5 Flash
  - `requesty/meta-llama/llama-3.1-70b-instruct` - Meta's Llama 3.1 70B
  - `requesty/anthropic/claude-sonnet-4-20250514` - Claude Sonnet 4 (May 2025)
- **New OpenRouter Model**: Added `google/gemini-2.5-pro-preview` - Google's state-of-the-art AI model for advanced reasoning, coding, mathematics, and scientific tasks
- **Enhanced Model Diversity**: Users now have access to 8 additional high-quality AI models across multiple providers

## 🔧 Technical Implementation
- Integrated `@requesty/ai-sdk` package (version ^0.0.7) for Requesty provider support
- Added Requesty client configuration with proper API key management and headers
- Updated `ai/providers.ts` with comprehensive Requesty model definitions
- Enhanced model metadata with detailed capabilities, pricing tiers, and web search support
- Maintained consistent provider architecture for seamless integration
- Added proper error handling and API key fallback mechanisms

## 🛡️ Security & Privacy
- Implemented secure API key management for Requesty provider through environment variables
- Added proper request headers including HTTP-Referer and X-Title for provider identification
- Maintained existing security protocols across all provider integrations
- Ensured consistent authentication flow for new provider

## 📈 Benefits
- **Expanded Choice**: Users can now choose from 8 additional AI models based on their specific needs
- **Provider Redundancy**: Multiple providers offer increased reliability and availability
- **Cost Options**: Mix of premium and standard models provides flexibility for different use cases
- **Performance Variety**: Access to models optimized for different tasks (reasoning, coding, efficiency)
- **Future-Proofing**: Establishes foundation for easy addition of more Requesty models

## 🔄 Migration Notes
- **No Breaking Changes**: Existing users continue to use their current models without any changes
- **Automatic Detection**: New Requesty models are automatically available in the model picker
- **API Key Setup**: Users wanting to use Requesty models need to add `REQUESTY_API_KEY` to their environment variables
- **Backward Compatibility**: All existing OpenRouter, Anthropic, OpenAI, Groq, and X AI models remain fully functional

## 🚀 Deployment
- No special deployment requirements - changes are backward compatible
- New models become available immediately after deployment
- Users can start using Requesty models by adding their API key to environment variables
- All existing functionality remains unchanged

## 🎯 Model Highlights

### Requesty Provider Models:
- **GPT-4O Series**: Advanced OpenAI models with reasoning and multimodal capabilities
- **Claude Series**: Anthropic's latest models including Claude 3.5, 3.7, and Sonnet 4
- **Gemini 2.5 Flash**: Google's fast and efficient model optimized for speed
- **Llama 3.1 70B**: Meta's open-source model for instruction following

### OpenRouter Addition:
- **Gemini 2.5 Pro Preview**: Google's flagship model for advanced reasoning and scientific tasks

---

**Full Changelog**: [v0.7.0...v0.8.0](https://github.com/brooksy4503/chatlima/compare/v0.7.0...v0.8.0) 