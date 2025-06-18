# 🚀 ChatLima v0.14.0 - Enhanced AI Model Portfolio

## 🎯 What's New

- **Google Gemini 2.5 Pro & Flash Models**: Access to Google's latest state-of-the-art AI models with superior reasoning, coding, and multimodal capabilities
- **MiniMax M1 Model Family**: New large-scale reasoning models with extended context support (up to 1 million tokens) and high-efficiency inference
- **Enhanced Model Selection**: Four new premium AI models expanding ChatLima's capabilities across different use cases and performance requirements
- **Advanced Reasoning Features**: Built-in thinking capabilities in Gemini 2.5 Flash for improved accuracy and nuanced context handling

## 🔧 Technical Implementation

- Added Google Gemini 2.5 Pro and Flash model integrations via OpenRouter
- Implemented MiniMax M1 and M1 Extended models with hybrid Mixture-of-Experts (MoE) architecture
- Enhanced `ai/providers.ts` with comprehensive model configurations and capability mappings
- Added detailed model descriptions showcasing advanced reasoning, coding, mathematics, and scientific task capabilities
- Updated model selection interface with proper provider attribution following naming conventions

### New Models Added:

#### Google Models (via OpenRouter)
- **Google Gemini 2.5 Pro**: Premium model for advanced reasoning, coding, mathematics, and scientific tasks
- **Google Gemini 2.5 Flash**: Workhorse model with built-in thinking capabilities for balanced performance and cost

#### MiniMax Models (via OpenRouter)  
- **MiniMax M1**: Large-scale reasoning model with 456B total parameters and 45.9B active per token
- **MiniMax M1 Extended**: Extended context variant processing up to 128,000 tokens

## 🛡️ Security & Privacy

- All new models inherit existing API key management and user authentication protections
- Maintained secure provider integration patterns with proper headers and referrer policies
- No changes to existing security or privacy implementations

## 📈 Benefits

- **Expanded Choice**: Users now have access to 4 additional cutting-edge AI models
- **Performance Optimization**: Different models optimized for various tasks (speed vs. quality vs. context length)
- **Cost Flexibility**: Mix of premium and standard pricing tiers to match user needs and budgets
- **Advanced Capabilities**: Enhanced reasoning, longer context windows, and specialized task performance

### Model Capabilities Overview:
- **Advanced Reasoning**: All new models excel at complex logical tasks
- **Long Context Support**: Gemini 2.5 Pro/Flash and MiniMax M1 support up to 1 million tokens
- **Multimodal Processing**: Gemini models support text, image, and mixed content
- **Software Engineering**: Optimized for coding and technical documentation tasks
- **Mathematical Reasoning**: Enhanced capabilities for mathematical and scientific problem-solving

## 🔄 Migration Notes

- **No Breaking Changes**: All existing functionality remains unchanged
- **Automatic Availability**: New models are immediately available in the model selection interface
- **Backward Compatibility**: Existing chats and configurations continue to work seamlessly

## 🚀 Deployment

### Environment Considerations:
- No new environment variables required
- Existing OpenRouter API key provides access to all new models
- Models are enabled by default for users with appropriate access levels

### Model Access:
- **Gemini 2.5 Flash**: Available to all users (premium: false)
- **Gemini 2.5 Pro**: Premium model requiring credits or subscription
- **MiniMax M1 Models**: Premium models requiring credits or subscription

## 📊 Model Comparison

| Model | Context Length | Strengths | Pricing Tier |
|-------|---------------|-----------|--------------|
| Gemini 2.5 Pro | 1M tokens | Top-tier reasoning, scientific tasks | Premium |
| Gemini 2.5 Flash | 1M tokens | Built-in thinking, balanced performance | Standard |
| MiniMax M1 | 1M tokens | Extended context, high efficiency | Premium |
| MiniMax M1 Extended | 128K tokens | Long context, reasoning | Premium |

## 🔍 Technical Details

### Architecture Improvements:
- Enhanced model metadata system with comprehensive capability tracking
- Improved provider integration with consistent naming patterns
- Advanced model configuration supporting specialized features like thinking modes

### Performance Considerations:
- Models are loaded on-demand to maintain application responsiveness
- Optimized API integration patterns for efficient model switching
- Maintained compatibility with existing rate limiting and usage tracking

---

**Repository**: [https://github.com/brooksy4503/chatlima](https://github.com/brooksy4503/chatlima)
**Full Changelog**: [v0.13.0...v0.14.0](https://github.com/brooksy4503/chatlima/compare/v0.13.0...v0.14.0) 