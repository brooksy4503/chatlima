<a href="https://www.chatlima.com">
  <h1 align="center">ChatLima</h1>
</a>

<p align="center">
  An open-source AI chatbot app powered by Model Context Protocol (MCP), built with Next.js and the AI SDK by Vercel.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> •
  <a href="#mcp-server-configuration"><strong>MCP Configuration</strong></a> •
  <a href="#license"><strong>License</strong></a>
</p>
<br/>

# ChatLima

A minimalistic MCP client with a comprehensive feature set for modern AI interactions.

This project is a fork of [scira-mcp-chat](https://github.com/zaidmukaddam/scira-mcp-chat) by Zaid Mukaddam, with extensive additional features and modifications by Garth Scaysbrook.

## Features

### 🤖 AI Model Support
- **Multiple AI Providers**: OpenRouter, Anthropic, OpenAI, Groq, X AI, and Requesty
- **40+ AI Models** including:
  - OpenAI GPT-4O series (via OpenRouter and Requesty)
  - Anthropic Claude 3.5, 3.7, and Sonnet 4 (via Anthropic and Requesty)
  - Google Gemini 2.5 Pro and Flash (via OpenRouter and Requesty)
  - DeepSeek R1 models including DeepSeek R1 0528 and Qwen3 8B variants
  - Meta Llama 3.1 series (via OpenRouter and Requesty)
  - Mistral Magistral Small and Medium 2506 models
  - Grok models with tool calling support
- **Dynamic API Key Management**: Use your own API keys for any provider with runtime overrides
- **Smart Credit Validation**: Bypasses credit checks when using personal API keys
- **Premium Model Access Control**: Intelligent credit checking for premium models with real-time validation
- **Model Picker**: Real-time model availability and access validation with comprehensive descriptions

### 🔐 Authentication & User Management
- **Google OAuth Integration**: Seamless sign-in with Google accounts
- **Anonymous Users**: Support for anonymous usage with unique tracking (10 messages/day)
- **Daily Message Limits**: 10 messages/day for anonymous users, 20 for Google users
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
- **Full MCP Integration**: Connect to any MCP-compatible server
- **Multiple Transport Types**: Support for SSE, stdio, and HTTP Streamable connections
- **Built-in Tool Integration**: Extend AI capabilities with external tools
- **Dynamic Server Management**: Add/remove MCP servers through the UI
- **Popular MCP Servers**: Support for Composio, Zapier, and more

### 🎨 User Interface & Experience
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Multiple Themes**: Various theme options with enhanced mathematical rendering
- **Responsive Design**: Mobile-first, responsive interface
- **Streaming Responses**: Real-time AI response streaming
- **Chat Management**: Persistent chat history and management
- **Smart Title Generation**: Dynamic model selection for AI-powered conversation titles
- **Enhanced Post-Checkout Navigation**: Better user flow after successful checkout completion
- **Enhanced Mathematical Display**: Improved KaTeX styling for consistent mathematical expressions

### 🔍 Advanced Capabilities
- **Web-Enabled Search**: Enhanced search capabilities via OpenRouter with premium billing
- **Reasoning Model Support**: Support for advanced reasoning models
- **Tool Calling**: MCP server integration for extended capabilities with Grok model support
- **Real-time Pricing Analysis**: Developer tools for cost optimization
- **Token Usage Tracking**: Accurate billing and usage monitoring
- **Smart Credit Exposure**: Frontend access to user credit balance for transparency

### 🛡️ Security & Privacy
- **Secure API Key Management**: Environment-based credential storage with runtime flexibility
- **Privacy-First Design**: User data protection and anonymous usage support
- **SEO Optimization**: Dynamic sitemap generation with privacy protection
- **Secure Authentication**: Better Auth with multiple provider support
- **Credit Validation**: Robust access control and usage tracking with negative balance prevention
- **Environment-Aware Security**: Production/development security configurations

### 🚀 Developer Tools
- **Real-time Pricing Analysis**: Cost planning and model comparison tools using actual usage data
- **Usage Analytics**: Token and cost tracking based on real usage data from 1,254+ API requests
- **Debugging Tools**: Enhanced logging and error tracking with comprehensive debugging capabilities
- **Development Scripts**: Automated analysis and optimization tools including OpenRouter pricing analysis
- **TypeScript Support**: Full TypeScript implementation
- **Testing Infrastructure**: Comprehensive Playwright testing suite with multiple configuration options

### 📊 Business Features
- **Polar Integration**: Credit purchase and subscription management with production environment
- **Usage Monitoring**: Daily/monthly usage tracking and limits
- **Cost Optimization**: Data-driven model selection and pricing analysis with real usage insights
- **Webhook Support**: Real-time payment and subscription updates
- **Customer Management**: Automated customer creation and management with advanced retrieval logic
- **Premium Feature Access**: Intelligent access control for paid features

### 🔧 Technical Enhancements
- **Enhanced Error Handling**: Improved error handling across chat API and credit management
- **Debugging & Traceability**: Enhanced debugging capabilities with comprehensive logging
- **Smart User Flow Handling**: Seamless experience for both anonymous and authenticated users
- **Token Usage Tracking**: Refined credit deduction logic for accurate billing
- **Mathematical Content**: Enhanced KaTeX styling for technical discussions

## Technical Architecture

- **Framework**: Next.js 14 with App Router
- **AI SDK**: Vercel AI SDK for streaming responses
- **Authentication**: Better Auth with Google OAuth
- **Database**: Drizzle ORM with PostgreSQL
- **Payments**: Polar integration for credits and subscriptions with production environment
- **Styling**: Tailwind CSS with shadcn/ui components
- **Type Safety**: Full TypeScript implementation
- **Testing**: Comprehensive Playwright testing suite

## MCP Server Configuration

This application supports connecting to Model Context Protocol (MCP) servers to access their tools. You can add and manage MCP servers through the settings icon in the chat interface.

### Adding an MCP Server

1. Click the settings icon (⚙️) next to the model selector in the chat interface.
2. Enter a name for your MCP server.
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