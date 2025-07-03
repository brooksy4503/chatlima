# OpenRouter Presets Implementation Research for ChatLima

## Overview

OpenRouter Presets are a powerful new feature that allows separating LLM configuration from application code. Instead of hard-coding model selection, system prompts, and parameters, presets enable dynamic configuration management through the OpenRouter web interface.

## What are OpenRouter Presets?

[OpenRouter Presets](https://openrouter.ai/docs/features/presets) are named configurations that encapsulate:

- **Provider routing preferences** (sort by price, latency, etc.)
- **Model selection** (specific model or array with fallbacks)
- **System prompts**
- **Generation parameters** (temperature, top_p, etc.)
- **Provider inclusion/exclusion rules**

## Current ChatLima Architecture Analysis

### Model Selection System
ChatLima currently uses:
- **ModelPicker component** (`components/model-picker.tsx`) for UI model selection
- **Provider system** (`ai/providers.ts`) with static model definitions
- **Chat API route** (`app/api/chat/route.ts`) that instantiates models via `getLanguageModelWithKeys()`

### Key Integration Points
1. **Model instantiation** in `getLanguageModelWithKeys()` function
2. **OpenRouter client creation** via `createOpenRouterClientWithKey()`
3. **Model parameter handling** in chat API route
4. **UI model selection** through ModelPicker component

## Implementation Approaches

### 1. Direct Model Reference Approach
Replace model selection with preset slugs:

```typescript
// Instead of:
const modelInstance = getLanguageModelWithKeys("openrouter/anthropic/claude-3.5-sonnet", apiKeys);

// Use:
const modelInstance = getLanguageModelWithKeys("@preset/coding-assistant", apiKeys);
```

### 2. Preset Field Approach
Add preset support alongside model selection:

```typescript
// API request structure:
{
  "model": "openrouter/anthropic/claude-3.5-sonnet",
  "preset": "coding-assistant",
  "messages": [...],
  "apiKeys": {...}
}
```

### 3. Combined Model and Preset Approach
Support composite model@preset syntax:

```typescript
// Format: model@preset
const modelId = "openrouter/anthropic/claude-3.5-sonnet@preset/coding-assistant";
```

## Proposed Implementation Strategy

### Phase 1: Core Preset Support

#### 1. Extend Model Types
```typescript
// ai/providers.ts
export type PresetID = `@preset/${string}`;
export type ModelOrPresetID = modelID | PresetID;

// Update ModelInfo interface
export interface PresetInfo {
  type: 'preset';
  slug: string;
  name: string;
  description: string;
  baseModel?: string;
  capabilities: string[];
  enabled?: boolean;
  supportsWebSearch?: boolean;
  premium?: boolean;
}
```

#### 2. Update Model Selection Logic
```typescript
// ai/providers.ts
export const getLanguageModelWithKeys = (
  modelOrPresetId: ModelOrPresetID, 
  apiKeys?: Record<string, string>
) => {
  if (modelOrPresetId.startsWith('@preset/')) {
    const presetSlug = modelOrPresetId.replace('@preset/', '');
    const openrouterClient = createOpenRouterClientWithKey(apiKeys?.['OPENROUTER_API_KEY']);
    return openrouterClient(modelOrPresetId); // OpenRouter handles preset resolution
  }
  
  // Existing model logic...
  return getExistingModel(modelOrPresetId, apiKeys);
};
```

#### 3. Update Chat API Route
```typescript
// app/api/chat/route.ts
interface ChatRequest {
  messages: UIMessage[];
  chatId?: string;
  selectedModel: ModelOrPresetID; // Updated type
  preset?: string; // Optional preset field
  mcpServers?: MCPServerConfig[];
  webSearch?: WebSearchOptions;
  apiKeys?: Record<string, string>;
}
```

### Phase 2: UI Integration

#### 1. Preset Management Interface
Create new components:
- `PresetPicker` component for preset selection
- `PresetManager` for creating/editing presets (links to OpenRouter)
- Integration with existing `ModelPicker`

#### 2. Model Picker Enhancement
```typescript
// components/model-picker.tsx
interface ModelPickerProps {
  selectedModel: ModelOrPresetID;
  setSelectedModel: (model: ModelOrPresetID) => void;
  presetMode?: boolean; // Toggle between models and presets
  onModelSelected?: () => void;
}
```

#### 3. Preset Categories in UI
Organize presets by use case:
- **Coding Assistants**
- **Content Writers**
- **Research Analysts** 
- **Customer Support**
- **Creative Writers**

### Phase 3: Advanced Features

#### 1. Preset Synchronization
- Fetch available presets from OpenRouter API
- Cache preset configurations locally
- Auto-refresh preset list

#### 2. Dynamic Preset Creation
- In-app preset creation interface
- Integration with OpenRouter web interface
- Preset sharing between team members

#### 3. Context-Aware Preset Suggestions
- Suggest presets based on conversation context
- Smart preset recommendations
- Usage analytics and optimization

## Use Cases for ChatLima

### 1. Coding Assistant Presets
```typescript
// Example: "@preset/coding-assistant"
{
  "model": ["anthropic/claude-3.5-sonnet", "openai/gpt-4.1"],
  "system": "You are an expert software engineer. Focus on clean, efficient code with detailed explanations. Always consider edge cases and provide examples.",
  "temperature": 0.1,
  "provider_routing": {
    "sort_by": "latency",
    "fallback": true
  }
}
```

**Benefits for ChatLima:**
- Optimized for code generation and debugging
- Consistent coding style and practices
- Automatic fallback to backup models
- Low temperature for deterministic outputs

### 2. Content Writing Presets
```typescript
// Example: "@preset/content-writer"
{
  "model": ["anthropic/claude-3.7-sonnet", "openai/gpt-4.1"],
  "system": "You are a professional content writer. Create engaging, well-structured content that's optimized for readability and SEO. Always maintain brand voice consistency.",
  "temperature": 0.7,
  "provider_routing": {
    "sort_by": "cost",
    "include": ["anthropic", "openai"]
  }
}
```

**Benefits for ChatLima:**
- Creative yet structured content generation
- SEO-optimized writing style
- Cost-effective provider routing
- Consistent brand voice

### 3. Research Analysis Presets
```typescript
// Example: "@preset/research-analyst"
{
  "model": ["google/gemini-2.5-pro", "anthropic/claude-3.5-sonnet"],
  "system": "You are a research analyst. Provide comprehensive, well-sourced analysis with proper citations. Break down complex topics into digestible insights with actionable recommendations.",
  "temperature": 0.3,
  "web_search_options": {
    "search_context_size": "high"
  }
}
```

**Benefits for ChatLima:**
- Enhanced web search integration
- Analytical thinking patterns
- Citation and source management
- Factual accuracy focus

### 4. Customer Support Presets
```typescript
// Example: "@preset/customer-support"
{
  "model": ["anthropic/claude-3.5-sonnet", "openai/gpt-4.1-mini"],
  "system": "You are a helpful customer support agent. Be empathetic, solution-focused, and provide clear step-by-step instructions. Always ask clarifying questions when needed.",
  "temperature": 0.4,
  "provider_routing": {
    "sort_by": "latency"
  }
}
```

**Benefits for ChatLima:**
- Consistent support experience
- Empathetic communication style
- Quick response optimization
- Solution-oriented approach

### 5. Creative Writing Presets
```typescript
// Example: "@preset/creative-writer"
{
  "model": ["anthropic/claude-3.7-sonnet", "openai/gpt-4.1"],
  "system": "You are a creative writing assistant. Help develop compelling narratives, vivid descriptions, and engaging dialogue. Focus on character development and plot structure.",
  "temperature": 0.8,
  "provider_routing": {
    "sort_by": "quality"
  }
}
```

**Benefits for ChatLima:**
- Enhanced creativity and storytelling
- Character and plot development
- High-quality model prioritization
- Narrative consistency

## Integration Benefits for ChatLima

### 1. Separation of Concerns
- **Configuration Management**: Move LLM settings out of code
- **Rapid Iteration**: Update configurations without deployments
- **A/B Testing**: Test different configurations easily
- **Version Control**: Track configuration changes

### 2. Enhanced User Experience
- **Specialized Workflows**: Purpose-built presets for specific tasks
- **Consistent Results**: Standardized configurations for predictable outputs
- **Easy Switching**: Quick preset changes without losing context
- **Smart Defaults**: Optimized settings for common use cases

### 3. Cost and Performance Optimization
- **Provider Routing**: Automatic selection based on cost/latency preferences
- **Fallback Models**: Ensure availability during outages
- **Usage Analytics**: Track preset performance and costs
- **Resource Optimization**: Dynamic scaling based on demand

### 4. Team Collaboration
- **Shared Presets**: Organization-wide configurations
- **Best Practices**: Standardized approaches across teams
- **Knowledge Sharing**: Preset libraries and templates
- **Compliance**: Consistent security and policy adherence

## Implementation Challenges

### 1. Technical Challenges
- **Type Safety**: Ensuring TypeScript compatibility with dynamic presets
- **Error Handling**: Managing preset resolution failures
- **Caching**: Efficient preset configuration caching
- **Fallbacks**: Graceful degradation when presets are unavailable

### 2. User Experience Challenges
- **Discovery**: Making presets easily findable and understandable
- **Configuration**: Balancing power with simplicity
- **Migration**: Smooth transition from models to presets
- **Education**: Teaching users about preset benefits

### 3. API Integration Challenges
- **Authentication**: Managing OpenRouter API access
- **Rate Limiting**: Handling API quotas and limits
- **Synchronization**: Keeping local and remote configs in sync
- **Versioning**: Managing preset version changes

## Recommended Implementation Plan

### Sprint 1: Foundation (2 weeks)
1. **Core Types**: Extend type system for preset support
2. **Basic Integration**: Update model selection logic
3. **API Updates**: Modify chat route for preset handling
4. **Testing**: Comprehensive test coverage

### Sprint 2: UI Integration (2 weeks)
1. **Preset Picker**: Create preset selection interface
2. **Model Picker Updates**: Integrate preset/model toggle
3. **Preset Categories**: Organize presets by use case
4. **Basic Preset Management**: Link to OpenRouter interface

### Sprint 3: Advanced Features (3 weeks)
1. **Preset Synchronization**: Fetch from OpenRouter API
2. **Caching Strategy**: Implement efficient caching
3. **Error Handling**: Robust fallback mechanisms
4. **Analytics Integration**: Track preset usage

### Sprint 4: Polish and Optimization (1 week)
1. **Performance Optimization**: Minimize API calls
2. **User Experience**: Refine UI and interactions
3. **Documentation**: User guides and developer docs
4. **Testing**: End-to-end testing and validation

## Conclusion

OpenRouter Presets offer significant value for ChatLima by:

1. **Enabling specialized workflows** for different use cases
2. **Improving configuration management** and deployment flexibility
3. **Providing cost and performance optimization** through intelligent routing
4. **Supporting team collaboration** with shared configurations

The implementation should be phased to ensure stability while delivering incremental value. Starting with core preset support and gradually adding advanced features will provide the best balance of functionality and maintainability.

The preset system aligns well with ChatLima's existing architecture and will enhance its positioning as a professional AI chat platform with enterprise-ready features.