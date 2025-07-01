# 🚀 ChatLima v0.20.0 - New Models & Enhanced Streaming

## 🎯 What's New
- **🤖 Three Powerful New AI Models**: Expanded model library with specialized capabilities
- **⚡ Enhanced Streaming Experience**: Improved handling of interrupted conversations
- **🎨 UI Polish**: Refined markdown rendering and bug fixes
- **🔧 Technical Improvements**: Better credit handling and extended streaming support

### 🤖 New AI Models

#### **TheDrummer Anubis 70B v1.1**
- **Specialized for Creative Writing**: Unaligned, creative Llama 3.3 70B model focused on character-driven roleplay and storytelling
- **Unique Capabilities**: Excels at gritty, visceral prose, unique character adherence, and coherent narratives
- **Large Context**: 131,072 token context window for extended conversations
- **Creative Focus**: Optimized for roleplay scenarios and creative storytelling while maintaining instruction following

#### **Inception Mercury - Ultra-Fast Performance**
- **Revolutionary Speed**: First diffusion large language model (dLLM) running 5-10x faster than GPT-4.1 Nano and Claude 3.5 Haiku
- **Matching Performance**: Delivers speed without sacrificing quality - matches performance of leading speed-optimized models
- **Developer-Friendly**: Enables responsive user experiences for voice agents, search interfaces, and chatbots
- **Breakthrough Technology**: Discrete diffusion approach for unprecedented speed optimization

#### **Mistral Small 3.2 24B Instruct**
- **Enhanced Instruction Following**: Updated 24B parameter model optimized for instruction following and repetition reduction
- **Improved Function Calling**: Better function calling capabilities with structured outputs
- **Multimodal Support**: Supports both image and text inputs
- **STEM Excellence**: Excels at coding, STEM subjects, and vision benchmarks
- **Free Variant Available**: Includes rate-limited free version for accessibility

### ⚡ Streaming & Performance Enhancements

#### **Enhanced onStop Functionality**
- **Robust Interruption Handling**: Significantly improved chat API's ability to handle user-interrupted streaming responses
- **Multiple Extraction Methods**: Implements multiple fallback methods to extract partial content when streams are stopped
- **State Preservation**: Better preservation of conversation state when users interrupt AI responses
- **Smart Token Tracking**: Improved token usage tracking for partial responses with accurate credit calculations
- **Enhanced Error Handling**: Comprehensive error handling and logging for stopped streams

#### **Extended Streaming Support**
- **Longer Responses**: Increased maximum streaming response duration to 300 seconds on Hobby plan
- **Better Reliability**: More robust streaming infrastructure for handling longer AI responses
- **Improved Stability**: Enhanced error recovery for extended conversations

### 🎨 UI/UX Improvements

#### **Markdown Rendering Enhancements**
- **Improved List Styling**: Updated markdown list styles to use `list-outside` positioning
- **Better Layout**: Adjusted padding for improved readability and visual consistency
- **Enhanced Typography**: More polished text rendering throughout the application

#### **Bug Fixes & Polish**
- **Component Cleanup**: Fixed minor typo in ChatList component className attribute
- **Code Quality**: Improved code consistency and maintainability

### 🔧 Technical Improvements

#### **Enhanced Credit System**
- **Free Model Logic**: Improved credit checking system to properly handle free models (ending with `:free`)
- **Smart Credit Deduction**: Credits only deducted when appropriate, skipping free models and user-provided API keys
- **Better Error Handling**: More robust error handling throughout the credit system

#### **Performance Optimizations**
- **Efficient Processing**: Optimized model selection and processing logic
- **Better Resource Management**: Improved handling of API keys and model configurations
- **Enhanced Logging**: Better debugging and monitoring capabilities

## 🛠️ Development Quality
- **Robust Error Handling**: Enhanced error handling across streaming and credit systems
- **Better Logging**: Improved debugging capabilities with detailed logging for stream interruptions
- **Code Maintainability**: Cleaner code structure and better separation of concerns
- **Type Safety**: Improved TypeScript coverage and type definitions

## 📈 Benefits
- **🎯 More Model Choices**: Three specialized models for different use cases - speed, creativity, and instruction following
- **⚡ Better User Experience**: Improved handling of interrupted conversations with proper state saving
- **💰 Smarter Credit Usage**: More intelligent credit deduction that respects free models and user API keys
- **🔧 Enhanced Reliability**: More robust streaming with better error recovery and longer response support
- **🎨 Polished Interface**: Refined UI elements and better markdown rendering

## 🔄 Migration Notes
- **No Breaking Changes**: All existing functionality remains fully compatible
- **Automatic Model Availability**: New models are immediately available in the model picker
- **Preserved User Preferences**: All user settings, conversations, and preferences are maintained
- **Backward Compatible**: No configuration changes required for existing deployments

## 🚀 Deployment
- **Zero Downtime**: Seamless deployment with no service interruption
- **No Environment Changes**: No new environment variables or configuration required
- **No Database Changes**: No database migrations needed
- **Immediate Availability**: New features are immediately visible after deployment

## 🌟 Looking Forward
ChatLima v0.20.0 builds upon the solid UI foundation of v0.19.0 with significant model expansion and streaming improvements. The addition of three specialized models - ultra-fast Mercury, creative Anubis, and enhanced Mistral Small 3.2 - provides users with more tailored AI experiences for their specific needs.

The enhanced streaming capabilities ensure that users have a more reliable and responsive experience, especially when dealing with longer conversations or when needing to interrupt responses. Combined with smarter credit management, these improvements make ChatLima more efficient and user-friendly than ever.

This release represents our continued commitment to providing both cutting-edge AI capabilities and exceptional user experience, setting the stage for even more exciting developments ahead.

🎯 **Discover new possibilities with ChatLima v0.20.0's expanded model library and enhanced streaming!**

---

**Full Changelog**: [v0.19.0...v0.20.0](https://github.com/brooksy4503/chatlima/compare/v0.19.0...v0.20.0) 