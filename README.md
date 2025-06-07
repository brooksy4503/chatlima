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
- **30+ AI Models** including:
  - OpenAI GPT-4O series (via OpenRouter and Requesty)
  - Anthropic Claude 3.5, 3.7, and Sonnet 4 (via Anthropic and Requesty)
  - Google Gemini 2.5 Pro and Flash (via OpenRouter and Requesty)
  - DeepSeek R1 models
  - Meta Llama 3.1 series
  - Grok models with tool calling support
- **Dynamic API Key Management**: Use your own API keys for any provider
- **Smart Credit Validation**: Bypasses credit checks when using personal API keys
- **Premium Model Access Control**: Intelligent credit checking for premium models

### 🔐 Authentication & User Management
- **Google OAuth Integration**: Seamless sign-in with Google accounts
- **Anonymous Users**: Support for anonymous usage with unique tracking
- **Daily Message Limits**: 10 messages/day for anonymous users, 20 for Google users
- **Credit System**: Integrated billing and credit management with Polar
- **Better Auth Integration**: Modern authentication with session management

### 🛠️ Model Context Protocol (MCP)
- **Full MCP Integration**: Connect to any MCP-compatible server
- **Multiple Transport Types**: Support for SSE, stdio, and HTTP Streamable connections
- **Built-in Tool Integration**: Extend AI capabilities with external tools
- **Dynamic Server Management**: Add/remove MCP servers through the UI
- **Popular MCP Servers**: Support for Composio, Zapier, and more

### 🎨 User Interface & Experience
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Multiple Themes**: Various theme options for personalization
- **Responsive Design**: Mobile-first, responsive interface
- **Streaming Responses**: Real-time AI response streaming
- **Chat Management**: Persistent chat history and management
- **Model Picker**: Real-time model availability and access validation

### 🔍 Advanced Capabilities
- **Web-Enabled Search**: Enhanced search capabilities via OpenRouter
- **Reasoning Model Support**: Support for advanced reasoning models
- **Tool Calling**: MCP server integration for extended capabilities
- **Real-time Pricing Analysis**: Developer tools for cost optimization
- **Token Usage Tracking**: Accurate billing and usage monitoring

### 🛡️ Security & Privacy
- **Secure API Key Management**: Environment-based credential storage
- **Privacy-First Design**: User data protection and anonymous usage support
- **SEO Optimization**: Dynamic sitemap with privacy protection
- **Secure Authentication**: Better Auth with multiple provider support
- **Credit Validation**: Robust access control and usage tracking

### 🚀 Developer Tools
- **Real-time Pricing Analysis**: Cost planning and model comparison tools
- **Usage Analytics**: Token and cost tracking based on real usage data
- **Debugging Tools**: Enhanced logging and error tracking
- **Development Scripts**: Automated analysis and optimization tools
- **TypeScript Support**: Full TypeScript implementation

### 📊 Business Features
- **Polar Integration**: Credit purchase and subscription management
- **Usage Monitoring**: Daily/monthly usage tracking and limits
- **Cost Optimization**: Data-driven model selection and pricing analysis
- **Webhook Support**: Real-time payment and subscription updates
- **Customer Management**: Automated customer creation and management

## Technical Architecture

- **Framework**: Next.js 14 with App Router
- **AI SDK**: Vercel AI SDK for streaming responses
- **Authentication**: Better Auth with Google OAuth
- **Database**: Drizzle ORM with PostgreSQL
- **Payments**: Polar integration for credits and subscriptions
- **Styling**: Tailwind CSS with shadcn/ui components
- **Type Safety**: Full TypeScript implementation

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