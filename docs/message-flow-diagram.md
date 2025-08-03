# ChatLima Message Flow Diagram

## Overview
This diagram shows the complete flow of files involved when sending and receiving messages in the ChatLima chat system, from user input to AI response and back to the UI.

## Message Flow Architecture

### High-Level Flow

```
User Input → Frontend → API → AI Model → Response → Database → UI Update
```

### Detailed File Flow

#### 1. User Interface Layer
```
User Types Message
    ↓
components/chat.tsx (Main orchestrator)
    ↓
components/textarea.tsx (Input handling)
    ↓
components/messages.tsx (Message container)
    ↓
components/message.tsx (Individual message rendering)
```

#### 2. Frontend State Management
```
components/chat.tsx
    ↓
├── lib/context/model-context.tsx (AI model selection)
├── lib/context/preset-context.tsx (Chat presets)
├── lib/context/mcp-context.tsx (MCP server connections)
├── lib/context/web-search-context.tsx (Web search)
├── hooks/useAuth.ts (Authentication)
└── hooks/useCredits.ts (Credit tracking)
```

#### 3. API Request Layer
```
components/chat.tsx
    ↓
app/api/chat/route.ts (Main chat endpoint)
    ↓
├── ai/providers.ts (AI model clients)
├── lib/auth.ts (Authentication)
├── lib/tokenCounter.ts (Token counting)
└── lib/polar.ts (Billing integration)
```

#### 4. Database Operations
```
app/api/chat/route.ts
    ↓
lib/chat-store.ts (Chat & message persistence)
    ↓
lib/db/schema.ts (Database schema)
    ↓
lib/db/index.ts (Database connection)
```

#### 5. Token Tracking
```
app/api/chat/route.ts
    ↓
lib/tokenTracking.ts (Comprehensive tracking)
    ↓
├── lib/services/costCalculation.ts (Cost calculation)
└── lib/services/openrouterCostTracker.ts (OpenRouter costs)
```

#### 6. AI Model Integration
```
ai/providers.ts
    ↓
├── lib/models/fetch-models.ts (Model information)
├── lib/parameter-validation.ts (Parameter validation)
└── lib/openrouter-utils.ts (OpenRouter utilities)
```

#### 7. Response Handling
```
AI Model Response
    ↓
app/api/chat/route.ts (Streaming response)
    ↓
lib/chat-store.ts (Save to database)
    ↓
app/actions.ts (Additional actions)
```

#### 8. UI Updates
```
Streaming Response
    ↓
components/chat.tsx (Update UI)
    ↓
├── components/messages.tsx (Render messages)
├── components/message.tsx (Individual message)
├── components/token-metrics/MessageTokenMetrics.tsx (Real-time metrics)
└── components/token-metrics/ChatTokenSummary.tsx (Chat summary)
```

### Database Schema

#### Core Tables
```
lib/db/schema.ts
    ↓
├── chats (Chat sessions)
├── messages (Individual messages)
├── users (User accounts)
├── token_usage_metrics (Token tracking)
├── daily_token_usage (Daily aggregation)
└── presets (Chat configurations)
```

### External Services

#### AI Providers
```
ai/providers.ts
    ↓
├── OpenAI API
├── Anthropic API
├── OpenRouter API
├── Google Vertex AI
├── Groq API
├── X.AI API
└── Requesty API
```

#### Integrations
```
├── MCP Servers (Model Context Protocol)
├── Web Search API
└── Polar Billing System
```

## Detailed File Descriptions

### Frontend Components

#### Core Chat Components
- **`components/chat.tsx`**: Main chat interface component that orchestrates the entire chat experience
- **`components/textarea.tsx`**: Input component for text and image attachments
- **`components/messages.tsx`**: Container for displaying all messages in the chat
- **`components/message.tsx`**: Individual message component with rendering logic for different message types

#### Context Providers
- **`lib/context/model-context.tsx`**: Manages selected AI model state
- **`lib/context/preset-context.tsx`**: Handles chat presets and configurations
- **`lib/context/mcp-context.tsx`**: Manages MCP (Model Context Protocol) server connections
- **`lib/context/web-search-context.tsx`**: Controls web search functionality
- **`lib/context/auth-context.tsx`**: Authentication state management

#### Hooks
- **`hooks/useAuth.ts`**: Authentication hook for user session management
- **`hooks/useCredits.ts`**: Credit balance and usage tracking
- **`hooks/use-mobile.ts`**: Mobile device detection
- **`hooks/use-models.ts`**: Model fetching and management

#### Token Metrics
- **`components/token-metrics/MessageTokenMetrics.tsx`**: Real-time token usage display
- **`components/token-metrics/ChatTokenSummary.tsx`**: Chat-level token usage summary

### API Layer

#### Main Chat API
- **`app/api/chat/route.ts`**: Primary chat endpoint handling message processing, AI model calls, and response streaming

#### Supporting APIs
- **`app/api/chats/[id]/route.ts`**: Chat retrieval and management
- **`app/api/token-usage/route.ts`**: Token usage statistics
- **`app/api/models/route.ts`**: Available models endpoint
- **`app/api/presets/route.ts`**: Preset management

### Core Libraries

#### AI Integration
- **`ai/providers.ts`**: AI model provider configurations and client creation
- **`lib/models/fetch-models.ts`**: Model information fetching and caching
- **`lib/parameter-validation.ts`**: Model parameter validation
- **`lib/openrouter-utils.ts`**: OpenRouter-specific utilities

#### Authentication & Authorization
- **`lib/auth.ts`**: Authentication middleware and session management
- **`lib/middleware/auth-middleware.ts`**: Route protection middleware

#### Data Management
- **`lib/chat-store.ts`**: Chat and message persistence operations
- **`lib/db/schema.ts`**: Database schema definitions
- **`lib/db/index.ts`**: Database connection and configuration

#### Token Tracking
- **`lib/tokenTracking.ts`**: Comprehensive token usage tracking service
- **`lib/tokenCounter.ts`**: Legacy token counting for credit system
- **`lib/services/costCalculation.ts`**: Cost calculation based on token usage
- **`lib/services/openrouterCostTracker.ts`**: OpenRouter-specific cost tracking

#### External Integrations
- **`lib/polar.ts`**: Polar billing system integration
- **`lib/types.ts`**: TypeScript type definitions
- **`lib/image-utils.ts`**: Image processing utilities

### Database Schema

#### Core Tables
- **`chats`**: Chat sessions and metadata
- **`messages`**: Individual messages with parts and metadata
- **`users`**: User accounts and authentication data
- **`token_usage_metrics`**: Detailed token usage tracking
- **`daily_token_usage`**: Aggregated daily usage statistics
- **`presets`**: Chat configuration presets

#### Supporting Tables
- **`accounts`**: OAuth account connections
- **`sessions`**: User session management
- **`chat_shares`**: Shared chat functionality
- **`model_pricing`**: AI model pricing information

### Message Flow Process

#### 1. User Input Phase
1. User types message in `components/textarea.tsx`
2. Message processed in `components/chat.tsx` with context from various providers
3. Image attachments handled through `lib/image-utils.ts`
4. Form submission triggers `useChat` hook from Vercel AI SDK

#### 2. API Request Phase
1. Request sent to `app/api/chat/route.ts`
2. Authentication checked via `lib/auth.ts`
3. Credit validation through `lib/polar.ts`
4. Model selection via `ai/providers.ts`
5. MCP tools configured through `lib/context/mcp-context.tsx`

#### 3. AI Processing Phase
1. Message formatted for AI model in `lib/openrouter-utils.ts`
2. Model parameters validated in `lib/parameter-validation.ts`
3. AI model called through provider-specific clients
4. Web search enabled if configured via `lib/context/web-search-context.tsx`

#### 4. Response Handling Phase
1. Streaming response processed in `app/api/chat/route.ts`
2. Token usage tracked via `lib/tokenTracking.ts`
3. Messages saved to database through `lib/chat-store.ts`
4. Chat metadata updated in database

#### 5. UI Update Phase
1. Response streamed to frontend via `useChat` hook
2. Messages rendered through `components/messages.tsx` and `components/message.tsx`
3. Token metrics updated in real-time via `components/token-metrics/`
4. Chat list refreshed through TanStack Query invalidation

### Key Features Supported

#### Message Types
- **Text messages**: Standard text input/output
- **Image messages**: Vision model support with image attachments
- **Tool invocations**: MCP tool usage and results
- **Web search**: OpenRouter web search integration
- **Reasoning**: AI reasoning process display

#### Advanced Features
- **Real-time streaming**: Live response streaming
- **Token tracking**: Comprehensive usage monitoring
- **Cost calculation**: Accurate cost estimation
- **Error recovery**: Robust error handling and recovery
- **Mobile support**: Responsive design for mobile devices
- **Preset system**: Configurable chat presets
- **MCP integration**: External tool connectivity
- **Web search**: Real-time web information retrieval

### Error Handling

#### Frontend Errors
- **`components/error-boundary.tsx`**: React error boundary for component errors
- **`components/chat.tsx`**: Chat-specific error handling and recovery
- **Toast notifications**: User-friendly error messages

#### Backend Errors
- **`app/api/chat/route.ts`**: Comprehensive error handling for API errors
- **`lib/tokenTracking.ts`**: Graceful handling of tracking failures
- **`lib/chat-store.ts`**: Database error handling

### Performance Optimizations

#### Caching
- **TanStack Query**: Client-side data caching
- **Model caching**: Cached model information
- **Session caching**: Optimized session management

#### Streaming
- **Real-time updates**: Live token metrics during streaming
- **Progressive rendering**: Message parts rendered as received
- **Optimistic updates**: UI updates before server confirmation

This architecture provides a robust, scalable chat system with comprehensive token tracking, multiple AI provider support, and advanced features like MCP integration and web search capabilities. 