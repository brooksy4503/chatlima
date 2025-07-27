# 🚀 ChatLima v0.25.0 - Dynamic AI Models Openrouter/Requesty Integration

## 🎯 What's New
- **🌟 Dynamic Model Loading**: Real-time fetching of AI models from OpenRouter and Requesty APIs, eliminating manual model updates
- **🔄 Requesty AI Integration**: Complete integration with Requesty.ai routing service providing access to 300+ language models
- **⚡ Automatic Model Discovery**: Dynamic model discovery with smart caching and automatic updates
- **🏷️ Enhanced Model Metadata**: Rich model information including capabilities, pricing, and performance characteristics
- **🚫 Intelligent Model Filtering**: Automatic filtering of blocked, deprecated, and unavailable models
- **🧠 Enhanced Reasoning Model Support**: Improved support for reasoning models with specialized middleware and configurations
- **💰 Dynamic Pricing Integration**: Real-time pricing information from provider APIs
- **🔧 Provider Health Monitoring**: Comprehensive provider status tracking and health checks

## 🔧 Technical Implementation

### Dynamic Model Architecture
- **Provider Configuration System**: Extensible provider registry supporting OpenRouter and Requesty with unified interfaces
- **Model Fetching Service**: Robust API integration with retry logic, rate limiting, and error handling
- **Intelligent Caching**: Multi-layer caching with 1-hour model list TTL and 24-hour detail caching
- **Model Transformation Pipeline**: Standardized parsing and transformation of external API responses to internal format
- **Real-time Updates**: Automatic model synchronization with configurable refresh intervals

### OpenRouter Dynamic Integration
- **Live Model Fetching**: Direct integration with OpenRouter's `/api/v1/models` endpoint
- **Capability Detection**: Automatic capability parsing from model metadata (Vision, Reasoning, Coding, Fast)
- **Premium Model Classification**: Dynamic premium status determination based on pricing thresholds
- **Context Length Support**: Dynamic context length detection and configuration
- **Pricing Integration**: Real-time per-token pricing from OpenRouter API

### Requesty AI Integration
- **Multi-Provider Access**: Access to 300+ models through unified Requesty routing service
- **Provider Configuration**: Seamless integration with Requesty's model routing API
- **Compatibility Layer**: OpenAI SDK compatible integration for consistent behavior
- **Enhanced Rate Limits**: Higher rate limits (120 requests/minute) for improved performance
- **Model Diversity**: Access to additional model providers beyond OpenRouter's offerings

### Enhanced Model Management
- **Blocked Model System**: JSON-based model filtering with support for deprecated and problematic models
- **Model Validation**: Comprehensive validation of model availability and capabilities
- **Provider Health Checks**: Automated provider status monitoring and error reporting
- **Fallback Mechanisms**: Graceful degradation when providers are unavailable, with minimal direct provider fallbacks

## 🛡️ Security & Privacy
- **API Key Protection**: Secure handling of multiple provider API keys with environment variable management
- **Rate Limiting**: Built-in rate limiting to prevent API abuse and ensure stability
- **Error Sanitization**: Secure error handling that prevents sensitive information leakage
- **Provider Authentication**: Robust authentication handling for multiple AI providers
- **Input Validation**: Enhanced validation for all dynamic model configurations

## 📈 Benefits
- **Always Up-to-Date Models**: Primary model architecture now provides automatic access to latest AI models without code deployments
- **Massive Model Expansion**: Access to 300+ models through dynamic provider integration
- **Zero Maintenance**: Complete elimination of manual model configuration and updates
- **Enhanced Model Discovery**: Users automatically get access to new models as they become available
- **Improved Performance**: Intelligent caching reduces API calls while maintaining freshness
- **Provider Redundancy**: Multiple provider support ensures better availability and pricing options
- **Cost Optimization**: Real-time pricing helps users make informed model choices

## 🌟 User Experience Improvements

### Seamless Model Selection
- **Real-time Availability**: Model picker shows current availability status for all models
- **Enhanced Metadata**: Rich model descriptions with capabilities, pricing, and provider information
- **Smart Filtering**: Automatic filtering of unavailable or problematic models
- **Provider Indicators**: Clear indication of which provider serves each model

### Performance Enhancements
- **Faster Loading**: Cached model data provides instant model picker loading
- **Background Updates**: Model data refreshes in background without interrupting user experience
- **Optimized Requests**: Efficient API usage with intelligent caching and batching
- **Error Recovery**: Graceful handling of provider outages with cached fallbacks

## 🔄 Migration Notes
- **Architectural Shift**: Transitioned from static model configuration to dynamic model loading system
- **Seamless Integration**: Dynamic models integrate seamlessly with existing chat functionality  
- **Minimal Fallbacks**: Only essential direct provider models (4) remain for critical system functions
- **No User Impact**: All changes are transparent to end users with significantly expanded model access

## 🚀 Deployment
- **Simple Configuration**: Only requires optional provider API keys - no complex configuration needed
- **Automatic Activation**: Dynamic model system activates automatically when API keys are provided
- **Zero Downtime**: Complete architectural transition completed without service interruption
- **Built-in Intelligence**: Smart caching and provider management works out of the box

## 🎁 New Features in Detail

### OpenRouter Dynamic Models
- **Real-time Model Catalog**: Access to OpenRouter's complete model catalog with live updates
- **Pricing Integration**: Real-time pricing information displayed in model selection
- **Capability Mapping**: Automatic detection of model capabilities (Vision, Reasoning, Coding)
- **Context Length Detection**: Dynamic context length configuration based on model specifications
- **Provider Status**: Live provider health monitoring with status indicators

### Requesty AI Integration  
- **300+ Model Access**: Unified access to models from multiple providers through Requesty routing
- **Enhanced Performance**: Superior routing algorithms for optimal model selection
- **Cost Optimization**: Intelligent routing to minimize costs while maintaining quality
- **Provider Diversity**: Access to providers not available through other routing services
- **Advanced Features**: Support for specialized routing features and custom configurations

### Enhanced Model Infrastructure
- **Provider Registry**: Extensible system for adding new AI model providers
- **Caching System**: Multi-layer caching with configurable TTL and refresh strategies
- **Health Monitoring**: Comprehensive monitoring of provider status and API health
- **Error Recovery**: Automatic retry logic with exponential backoff for failed requests
- **Rate Limiting**: Built-in rate limiting to ensure stable API usage

### Model Filtering and Validation
- **Blocked Model Management**: JSON-based system for filtering problematic models
- **Capability Validation**: Automatic validation of model capabilities and features
- **Pricing Validation**: Verification of pricing data and premium status classification
- **Status Monitoring**: Real-time tracking of model availability and status

## 🔧 Developer Features
- **Extensible Architecture**: Clean provider interface for adding new AI routing services
- **Comprehensive Logging**: Detailed logging for model fetching, caching, and provider interactions
- **Type Safety**: Full TypeScript support for all dynamic model functionality
- **Testing Support**: Comprehensive test coverage for model fetching and transformation
- **Configuration Management**: Environment-based configuration for all provider settings

## 🐛 Bug Fixes
- **Fixed**: Model availability detection now properly handles provider outages
- **Fixed**: Pricing calculation accuracy improved for various providers
- **Fixed**: Cache invalidation now properly updates model availability
- **Fixed**: Provider health checks no longer cause false negatives
- **Fixed**: Model metadata parsing handles edge cases in provider responses
- **Fixed**: Rate limiting properly prevents API quota exhaustion

## ⚙️ Configuration

### Optional Environment Variables
```bash
# OpenRouter Configuration (Optional - enables OpenRouter models)
OPENROUTER_API_KEY=your_openrouter_api_key

# Requesty Configuration (Optional - enables Requesty models) 
REQUESTY_API_KEY=your_requesty_api_key
```

### Cache Configuration (Hardcoded)
- **Model List Cache**: 10 minutes
- **Model Details Cache**: 1 hour  
- **Provider Health Cache**: 30 seconds

### API Endpoints Enhanced
- **GET /api/models**: Now returns dynamically fetched models with real-time data
- **GET /api/models/health**: New endpoint for provider health monitoring
- **Model Selection**: Enhanced with dynamic availability and pricing information

---

**Full Changelog**: [v0.24.0...v0.25.0](https://github.com/brooksy4503/chatlima/compare/v0.24.0...v0.25.0)

**GitHub Release**: [v0.25.0](https://github.com/brooksy4503/chatlima/releases/tag/v0.25.0)

**Pull Request**: [#14 - Dynamic AI Models](https://github.com/brooksy4503/chatlima/pull/14) 