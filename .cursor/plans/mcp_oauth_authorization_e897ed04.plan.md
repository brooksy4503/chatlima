---
name: MCP OAuth Authorization
overview: Implement MCP OAuth 2.1 authorization flow to support remote MCP servers like cognimemo.com that require user authentication via browser redirect.
todos:
  - id: oauth-provider
    content: Create MCPOAuthProvider class implementing OAuthClientProvider interface
    status: pending
  - id: mcp-context-update
    content: Add useOAuth field and OAuth state to MCP context
    status: pending
  - id: service-update
    content: Update ChatMCPServerService to use authProvider when useOAuth is true
    status: pending
  - id: callback-page
    content: Create /oauth/callback page to handle OAuth redirect
    status: pending
  - id: ui-update
    content: Add OAuth toggle and authorize button to MCP server manager
    status: pending
  - id: test-cognimemo
    content: Test with cognimemo.com MCP server
    status: pending
---

# MCP OAuth Authorization Support

## Summary

Add OAuth 2.1 authorization support for MCP servers that require user login. When connecting to a server that returns 401 Unauthorized, the app will redirect users to authenticate via browser, handle the callback, and store tokens for future requests.

## Key Files to Modify

1. `lib/services/chatMCPServerService.ts` - Add OAuth provider support to transports
2. `lib/context/mcp-context.tsx` - Add OAuth state management per server
3. `components/mcp-server-manager.tsx` - Add OAuth toggle and authorize button
4. New: `lib/services/mcpOAuthProvider.ts` - Implement OAuthClientProvider interface
5. New: `app/oauth/callback/page.tsx` - OAuth callback handler

## Implementation

### 1. Create OAuth Provider (`lib/services/mcpOAuthProvider.ts`)

Implement `OAuthClientProvider` interface from MCP SDK:

```typescript
import { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth.js';

export class MCPOAuthProvider implements OAuthClientProvider {
  constructor(private serverUrl: string, private serverId: string) {}
  
  get redirectUrl() { return `${window.location.origin}/oauth/callback`; }
  get clientMetadata() { /* client registration metadata */ }
  
  async tokens() { /* retrieve from localStorage */ }
  async saveTokens(tokens) { /* save to localStorage */ }
  async clientInformation() { /* retrieve client info */ }
  async saveClientInformation(info) { /* save client info */ }
  async codeVerifier() { /* PKCE verifier */ }
  async saveCodeVerifier(verifier) { /* save verifier */ }
  async redirectToAuthorization(authUrl) { window.location.href = authUrl.toString(); }
}
```

### 2. Update MCP Server Config

Add `useOAuth` boolean to `MCPServer` interface in `lib/context/mcp-context.tsx`:

```typescript
export interface MCPServer {
  // existing fields...
  useOAuth?: boolean;  // Enable OAuth flow instead of static headers
}
```

### 3. Update ChatMCPServerService

Modify `createStreamableHTTPTransport` to accept optional `authProvider`:

```typescript
// In createStreamableHTTPTransport
if (mcpServer.useOAuth) {
  const authProvider = new MCPOAuthProvider(mcpServer.url, mcpServer.id);
  return new StreamableHTTPClientTransport(transportUrl, { authProvider });
}
```

### 4. Create OAuth Callback Page (`app/oauth/callback/page.tsx`)

Handle OAuth redirect, exchange code for tokens, and redirect back to chat:

```typescript
// Extract code from URL params
// Exchange for tokens using MCP SDK auth utilities
// Store tokens via MCPOAuthProvider
// Redirect back to /chat or previous page
```

### 5. Update MCP Server Manager UI

Add OAuth toggle in `components/mcp-server-manager.tsx`:

- Switch to enable "Use OAuth" for SSE/Streamable HTTP servers
- Show "Authorize" button when OAuth is enabled but no tokens exist
- Show "Authorized" status when tokens are present

## Testing

1. Add cognimemo.com MCP server with OAuth enabled
2. Click "Authorize" - should redirect to cognimemo login
3. After login, callback should store tokens
4. MCP tools should work with stored tokens