<a href="https://www.chatlima.com">
  <h1 align="center">ChatLima</h1>
</a>

<p align="center">
  Feature-rich MCP-powered AI chatbot with multi-model support and advanced tools.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> •
  <a href="#mcp-server-configuration"><strong>MCP Configuration</strong></a> •
  <a href="#license"><strong>License</strong></a>
</p>
<br/>

# ChatLima

Feature-rich MCP-powered AI chatbot with multi-model support and advanced tools.

This project is a fork of [scira-mcp-chat](https://github.com/zaidmukaddam/scira-mcp-chat) by Zaid Mukaddam, with extensive additional features and modifications by Garth Scaysbrook.

## Features

### 🤖 AI Model Support
- **Dynamic Model Loading**: Real-time fetching of AI models from OpenRouter and Requesty APIs, eliminating manual model updates
- **300+ AI Models**: Access to 300+ language models through dynamic provider integration including:
  - OpenAI GPT-4.1 series (Full, Mini, Nano) and GPT-4O series (via OpenRouter and Requesty)
  - Anthropic Claude 4 series (Sonnet, Opus), Claude 3.5, 3.7 Sonnet with thinking variants (via Anthropic and Requesty)
  - Google Gemini 2.5 Pro and Flash variants with built-in thinking capabilities (via OpenRouter and Requesty)
  - DeepSeek R1 models including DeepSeek R1 0528, V3, Chat, and Qwen3 8B variants
  - Meta Llama 4 Maverick and 3.1/3.3 70B series (via OpenRouter and Requesty)
  - Mistral Magistral Small and Medium 2506 models with thinking variants
  - X AI Grok 3 and 4 models with advanced reasoning and tool calling support
  - MiniMax M1 models with 456B parameters and extended context
  - Specialized models: TheDrummer Anubis 70B, Inception Mercury, Baidu ERNIE-4.5-300B, Kimi K2
- **Automatic Model Discovery**: Dynamic model discovery with smart caching and automatic updates
- **Enhanced Model Metadata**: Rich model information including capabilities, pricing, and performance characteristics
- **Intelligent Model Filtering**: Automatic filtering of blocked, deprecated, and unavailable models
- **Dynamic API Key Management**: Use your own API keys for any provider with runtime overrides
- **Smart Credit Validation**: Bypasses credit checks when using personal API keys
- **Premium Model Access Control**: Intelligent credit checking for premium models with real-time validation
- **Model Picker**: Real-time model availability and access validation with comprehensive descriptions and search functionality
- **Provider Health Monitoring**: Comprehensive provider status tracking and health checks

### 🖼️ Image Input & Multimodal Support
- **Complete Image Upload System**: Drag-and-drop interface with support for JPEG, PNG, and WebP formats
- **Advanced Image Processing**: Intelligent validation, compression, and format optimization with 20MB file limit
- **Multiple Image Support**: Upload up to 5 images per message for complex visual conversations
- **Image Preview & Management**: Real-time previews, full-screen modal viewing, and metadata display
- **Vision Model Integration**: Works seamlessly with all vision-capable AI models for image analysis, OCR, and visual question answering
- **Detail Control**: Configurable image detail levels (low, high, auto) for cost and quality optimization
- **Download Support**: Direct image download functionality from the modal viewer
- **Smart UI Integration**: Seamless integration with existing chat interface and message flow

### 🎨 Comprehensive Presets System
- **Custom AI Configurations**: Save, manage, and apply personalized AI model configurations
- **Built-in Templates**: Ready-to-use presets for coding, writing, research, analysis, and specialized tasks
- **Template Categories**: 
  - **Coding**: Advanced Code Architect, DeepSeek V3 Code Expert, Kimi K2 Agentic Coder, GPT-4.1 Mini Rapid Coder
  - **Analysis**: DeepSeek R1 Deep Reasoner, Grok 4 Research Analyst, Gemini Pro 2.5 Data Scientist
  - **Writing**: Claude Sonnet 4 Technical Writer, Gemini 2.5 Flash Content Creator
  - **General**: Executive Assistant, Personal Assistant, Strategic Problem Solver, Learning Tutor
- **Visual Management**: Intuitive preset selection with indicators, tooltips, and responsive design
- **Default Preset Support**: Smart default handling with proper constraint management
- **Template-Based Creation**: Quick preset creation using predefined templates
- **Contextual Hints**: Template name hints during preset creation for better UX

### 🔐 Authentication & User Management
- **Google OAuth Integration**: Seamless sign-in with Google accounts
- **Anonymous Users**: Support for anonymous usage with unique tracking (10 messages/day)
- **Daily Message Limits**: 10 messages/day for anonymous users, 20 for Google users
- **Enhanced Daily Message Tracking**: Tamper-proof daily message usage tracking that prevents limit bypass vulnerabilities
- **Automated User Cleanup**: Intelligent system to remove inactive anonymous users for optimal database performance
- **Admin Cleanup Dashboard**: Comprehensive interface with preview, configuration, and monitoring capabilities
- **Credit System**: Integrated billing and credit management with Polar
- **Better Auth Integration**: Modern authentication with session management
- **Robust Credit Management**: Enhanced validation to prevent negative credit balance issues

### 💳 Billing & Payment System
- **Polar Integration**: Complete integration with Polar billing platform for customer management
- **Production Checkout System**: User-friendly purchase flow with smart user handling
- **Customer Portal Access**: Direct access to Polar customer portal for subscription management
- **Credit Purchase Workflow**: Streamlined process for purchasing AI usage credits
- **Paid Web Search**: Premium web search feature with credit-based billing and usage tracking
- **Comprehensive Error Handling**: Dedicated error pages for failed, canceled, and problematic transactions
- **Environment-Based Configuration**: Secure Polar server environment selection

### 🛠️ Model Context Protocol (MCP)
- **Latest MCP 1.13.0 Support**: Full compatibility with the latest Model Context Protocol specification
- **Enhanced Protocol Headers**: Proper MCP-Protocol-Version headers for HTTP transport
- **Multiple Transport Types**: Support for SSE, stdio, and HTTP Streamable connections
- **Server Metadata Support**: Title and metadata fields for better MCP server organization
- **Built-in Tool Integration**: Extend AI capabilities with external tools
- **Dynamic Server Management**: Add/remove MCP servers through the enhanced UI with connection testing
- **Popular MCP Servers**: Support for Composio, Zapier, and more with improved configuration validation
- **Connection Testing**: Test MCP server connections with detailed feedback
- **Enhanced UI**: Improved server management interface with validation

### 🎨 User Interface & Experience
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Multiple Themes**: Various theme options with enhanced mathematical rendering
- **Enhanced Mobile Experience**: Mobile-first responsive design with optimized touch interactions
- **Responsive Layout**: Fixed overflow issues on narrow screens with intelligent space management
- **Streaming Responses**: Real-time AI response streaming with visual status indicators
- **Chat Management**: Persistent chat history and management
- **Smart Title Generation**: Dynamic model selection for AI-powered conversation titles
- **Enhanced Post-Checkout Navigation**: Better user flow after successful checkout completion
- **Enhanced Mathematical Display**: Improved KaTeX styling for consistent mathematical expressions
- **Advanced Model Picker**: Search functionality across models with keyboard navigation, provider icons, and improved responsive design with collision handling
- **Real-time Streaming Status**: Visual indicators for chat generation progress with timing information
- **PDF Download Button**: One-click access to export conversations from chat list

### 📝 Smart Code Input
ChatLima automatically detects when you paste code and wraps it in proper markdown code blocks for better formatting:

- **Auto-detection**: Automatically detects code based on syntax patterns, keywords, and structure
- **Language detection**: Identifies the programming language and adds appropriate syntax highlighting
- **Manual wrapping**: Press `Ctrl+K` (or `Cmd+K` on Mac) to manually wrap selected text or entire input in code blocks
- **Visual feedback**: Shows a temporary indicator when code is automatically wrapped
- **Smart processing**: Normalizes indentation and fixes common copy-paste artifacts

#### Supported Languages
- JavaScript/TypeScript (including JSX/TSX)
- Python
- HTML/CSS
- JSON
- SQL
- Shell/Bash
- Java
- C/C++
- And more...

### 📄 PDF Export & Sharing
- **One-Click PDF Download**: Export entire chat conversations as professional PDF documents
- **Professional PDF Formatting**: Clean layout with ChatLima.com branding, headers, and page numbers
- **Full Markdown Support**: PDFs preserve all markdown formatting including code blocks, headers, and lists
- **Automatic Pagination**: Smart page breaks for long conversations
- **Social Sharing**: Built-in sharing buttons for Twitter, Facebook, and LinkedIn
- **Direct Link Copying**: Copy share URLs with one click for easy distribution
- **Client-Side Processing**: All PDF generation happens locally for complete privacy
- **Cross-Platform Export**: PDFs work seamlessly across all devices and operating systems

### 🔍 Advanced Capabilities
- **Web-Enabled Search**: Enhanced search capabilities via OpenRouter with premium billing
- **Reasoning Model Support**: Support for advanced reasoning models with thinking capabilities
- **Tool Calling**: MCP server integration for extended capabilities with Grok model support
- **Real-time Pricing Analysis**: Developer tools for cost optimization
- **Token Usage Tracking**: Accurate billing and usage monitoring
- **Smart Credit Exposure**: Frontend access to user credit balance for transparency
- **Enhanced Streaming**: Improved handling of interrupted conversations with timeout detection
- **Error Recovery**: Intelligent error detection and recovery mechanisms with automatic chat reset
- **Advanced Image Analysis**: OCR, visual question answering, and multimodal understanding
- **Intelligent Error Recovery**: Comprehensive error handling with automatic recovery mechanisms
- **Enhanced UI Resilience**: Error boundary components with graceful error isolation
- **Smart Error Detection**: Automatic detection and recovery from stuck or failed requests
- **Automatic JSON Repair**: Integrated JSON repair functionality to handle malformed JSON from AI models gracefully
- **PDF Export**: One-click PDF generation for chat conversations with professional formatting and markdown support
- **Social Sharing**: Built-in sharing buttons for Twitter, Facebook, LinkedIn, and direct link copying

### 🛡️ Security & Privacy
- **Secure API Key Management**: Environment-based credential storage with runtime flexibility and show/hide toggles
- **Privacy-First Design**: User data protection and anonymous usage support
- **Tamper-Proof Daily Limits**: Security patch preventing daily message limit bypass through atomic tracking
- **Automated Security Monitoring**: Admin dashboard for user activity monitoring and cleanup management
- **SEO Optimization**: Dynamic sitemap generation with privacy protection
- **Secure Authentication**: Better Auth with multiple provider support
- **Credit Validation**: Robust access control and usage tracking with negative balance prevention
- **Environment-Aware Security**: Production/development security configurations
- **Image Privacy**: Client-side image processing with secure transmission to AI providers
- **API Key Privacy**: Show/hide toggles for sensitive API key management
- **Input Validation**: Enhanced validation for all preset and configuration inputs
- **Audit Trails**: Comprehensive logging for cleanup operations and usage tracking

### 🚀 Developer Tools
- **Real-time Pricing Analysis**: Cost planning and model comparison tools using actual usage data
- **Usage Analytics**: Token and cost tracking based on real usage data from 1,254+ API requests
- **Debugging Tools**: Enhanced logging and error tracking with comprehensive debugging capabilities
- **Development Scripts**: Automated analysis and optimization tools including OpenRouter pricing analysis
- **TypeScript Support**: Full TypeScript implementation with comprehensive type definitions
- **Testing Infrastructure**: Comprehensive Playwright testing suite with Jest unit tests for services
- **Service Test Coverage**: Extensive unit test coverage for all 8 specialized services
- **Enhanced Error Boundaries**: Comprehensive error handling with graceful error isolation
- **Provider Health Monitoring**: Comprehensive provider status tracking and health checks
- **Dynamic Model Architecture**: Extensible provider registry supporting OpenRouter and Requesty with unified interfaces
- **Admin CLI Tools**: Command-line utilities for user cleanup and database maintenance
- **Health Check APIs**: System monitoring and diagnostics endpoints for operational excellence

### 📊 Business Features
- **Polar Integration**: Credit purchase and subscription management with production environment
- **Usage Monitoring**: Daily/monthly usage tracking and limits with tamper-proof atomic tracking
- **Cost Optimization**: Data-driven model selection and pricing analysis with real usage insights
- **Webhook Support**: Real-time payment and subscription updates
- **Customer Management**: Automated customer creation and management with advanced retrieval logic
- **Premium Feature Access**: Intelligent access control for paid features including image processing
- **Dynamic Pricing Integration**: Real-time pricing information from provider APIs
- **Database Performance Optimization**: Automated user cleanup for optimal database performance and storage efficiency
- **Admin Operations Dashboard**: Comprehensive monitoring and management tools for system health

### 🔧 Technical Enhancements
- **Modular Service-Oriented Architecture**: Clean, maintainable architecture with 8 specialized services (Authentication, Credit Validation, Database, MCP Server, Message Processing, Model Validation, Token Tracking, Web Search)
- **Enhanced Error Handling**: Improved error handling across chat API and credit management with domain-specific error classes
- **JSON Repair Utility**: Automatic detection and correction of malformed JSON from AI models using jsonrepair library
- **Debugging & Traceability**: Enhanced debugging capabilities with comprehensive logging and performant logging utilities
- **Smart User Flow Handling**: Seamless experience for both anonymous and authenticated users
- **Token Usage Tracking**: Refined credit deduction logic for accurate billing with dedicated tracking service
- **Mathematical Content**: Enhanced KaTeX styling for technical discussions
- **Progressive Web App**: iOS homescreen shortcut support with native app-like experience
- **Advanced Client Instantiation**: Optimized dynamic client creation with helper functions
- **Model Transformation Pipeline**: Standardized parsing and transformation of external API responses to internal format
- **Intelligent Caching**: Multi-layer caching with 1-hour model list TTL and 24-hour detail caching
- **Pre-emptive Operations**: Race condition prevention through pre-emptive chat creation

## Technical Architecture

- **Framework**: Next.js 14 with App Router
- **AI SDK**: Vercel AI SDK for streaming responses
- **Authentication**: Better Auth with Google OAuth
- **Database**: Drizzle ORM with PostgreSQL
- **Payments**: Polar integration for credits and subscriptions with production environment
- **Styling**: Tailwind CSS with shadcn/ui components
- **Type Safety**: Full TypeScript implementation
- **Testing**: Comprehensive Playwright testing suite with Jest for unit tests
- **Image Processing**: Client-side image validation and compression with multimodal AI integration
- **Presets System**: Database-backed configuration management with template support
- **MCP Integration**: Latest Model Context Protocol 1.13.0 with enhanced server management
- **Dynamic Model Loading**: Real-time model fetching with intelligent caching and provider health monitoring
- **Service Architecture**: Modular service-oriented design with 8 specialized services for maintainability
- **PDF Generation**: jsPDF library for client-side PDF export with markdown rendering
- **User Management**: Automated cleanup system with admin dashboard for database optimization
- **Error Resilience**: JSON repair utility with jsonrepair library for malformed data handling

## MCP Server Configuration

This application supports connecting to Model Context Protocol (MCP) servers to access their tools. You can add and manage MCP servers through the settings icon in the chat interface.

### Adding an MCP Server

1. Click the settings icon (⚙️) next to the model selector in the chat interface.
2. Enter a name for your MCP server and optionally a display title for better organization.
3. Select the transport type:
   - **SSE (Server-Sent Events)**: For HTTP-based remote servers
   - **stdio (Standard I/O)**: For local servers running on the same machine

#### SSE Configuration

If you select SSE transport:
1. Enter the server URL (e.g., `https://mcp.example.com/token/sse`)
2. Click "Add Server"

#### stdio Configuration

If you select stdio transport:
1. Enter the command to execute (e.g., `npx`)
2. Enter the command arguments (e.g., `-y @modelcontextprotocol/server-google-maps`)
   - You can enter space-separated arguments or paste a JSON array
3. Click "Add Server"

4. Click "Use" to activate the server for the current chat session.

### Enhanced MCP Features

- **Connection Testing**: Test MCP server connections with detailed feedback
- **Server Metadata**: Add titles and descriptions for better server organization
- **Protocol Compliance**: Full MCP 1.13.0 specification support with proper headers
- **Enhanced UI**: Improved server management interface with validation

### Available MCP Servers

You can use any MCP-compatible server with this application. Here are some examples:

- [Composio](https://composio.dev/mcp) - Provides search, code interpreter, and other tools
- [Zapier MCP](https://zapier.com/mcp) - Provides access to Zapier tools
- Any MCP server using stdio transport with npx and python3

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Original project by Zaid Mukaddam (https://github.com/zaidmukaddam/scira-mcp-chat)
- Built with the [AI SDK by Vercel](https://sdk.vercel.ai/docs)
- Powered by [Model Context Protocol (MCP)](https://modelcontextprotocol.io)
- UI components from [shadcn/ui](https://ui.shadcn.com/)