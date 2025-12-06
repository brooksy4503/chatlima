# 🚀 ChatLima v0.35.0 - MCP OAuth 2.1 Authorization Support

## 🎯 What's New

This release introduces comprehensive OAuth 2.1 authorization support for Model Context Protocol (MCP) servers, enabling secure authentication with remote MCP servers that require user login. This major enhancement expands ChatLima's MCP capabilities to support authenticated services like CogniMemo and other OAuth-protected MCP servers.

### 🔐 OAuth 2.1 Authorization Flow
- **Browser-Based Authentication**: Seamless OAuth flow with automatic browser redirects
- **PKCE Security**: Implementation of Proof Key for Code Exchange (PKCE) for enhanced security
- **Token Management**: Automatic token storage, refresh, and expiration handling
- **Multi-Server Support**: Independent OAuth authentication for each MCP server
- **Persistent Sessions**: OAuth tokens persist across browser sessions

### 🎨 Enhanced MCP Server Manager
- **OAuth Toggle**: Easy-to-use checkbox to enable OAuth authentication for SSE and Streamable HTTP servers
- **Authorize Button**: One-click authorization flow initiation
- **Status Indicators**: Visual feedback showing authorization status (Authorized/Not Authorized)
- **Session Management**: Automatic cleanup of session storage during OAuth flow

### 🔄 OAuth Callback Handling
- **Dedicated Callback Page**: New `/oauth/callback` route for handling OAuth redirects
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Automatic Redirect**: Seamless return to chat interface after successful authentication
- **State Management**: Secure handling of OAuth state and authorization codes

## 🔧 Technical Implementation

### OAuth Provider Implementation

**`lib/services/mcpOAuthProvider.ts`** (New)
- Complete implementation of `OAuthClientProvider` interface from MCP SDK
- PKCE code verifier generation and storage
- Token storage and retrieval using localStorage
- Client metadata management for OAuth registration
- OAuth endpoint discovery via `.well-known/oauth-authorization-server`
- Token expiration checking and validation
- Secure token exchange with authorization codes

### OAuth Callback Page

**`app/oauth/callback/page.tsx`** (New)
- Handles OAuth redirect callbacks from authorization servers
- Extracts authorization codes from URL parameters
- Exchanges authorization codes for access tokens
- Manages session storage cleanup
- Provides user feedback during authorization process
- Handles errors gracefully with clear error messages

### MCP Service Updates

**`lib/services/chatMCPServerService.ts`** (Enhanced)
- Added `useOAuth` flag support in server configuration
- Integration with `MCPOAuthProvider` for authenticated transports
- OAuth token injection into HTTP requests
- Support for OAuth-enabled Streamable HTTP transports

### MCP Context Updates

**`lib/context/mcp-context.tsx`** (Enhanced)
- Added `useOAuth` field to `MCPServer` interface
- OAuth state management per server
- Token status tracking and validation
- Integration with OAuth provider for token management

### MCP Server Manager UI

**`components/mcp-server-manager.tsx`** (Enhanced)
- OAuth toggle checkbox for SSE and Streamable HTTP servers
- Authorize button with loading states
- Authorization status indicators (green for authorized, yellow for not authorized)
- Session storage management during OAuth flow
- Improved error handling and user feedback

### API Route Updates

**`app/api/chat/route.ts`** (Enhanced)
- Support for OAuth-enabled MCP server configurations
- Token passing to MCP service layer

## 🛡️ Security & Privacy

### Security Enhancements
- **PKCE Implementation**: Uses Proof Key for Code Exchange to prevent authorization code interception attacks
- **Secure Token Storage**: OAuth tokens stored securely in browser localStorage with server-specific prefixes
- **Token Expiration**: Automatic token expiration checking and validation
- **No Client Secrets**: Uses PKCE instead of client secrets for enhanced security
- **Session Isolation**: Each MCP server's OAuth tokens are stored separately and securely

### Privacy Considerations
- **Local Storage Only**: All OAuth tokens stored locally in user's browser
- **No Server-Side Storage**: Tokens never sent to ChatLima servers
- **User Control**: Users can authorize and revoke access at any time
- **Secure Redirects**: OAuth redirects use secure HTTPS endpoints
- **State Management**: Proper OAuth state handling prevents CSRF attacks

## 📈 Benefits

### For Users
- **Access to Protected MCP Servers**: Connect to OAuth-protected MCP servers like CogniMemo
- **Seamless Authentication**: Simple one-click authorization flow
- **Persistent Sessions**: Stay authenticated across browser sessions
- **Visual Feedback**: Clear status indicators show authorization state
- **Secure Access**: Industry-standard OAuth 2.1 with PKCE security

### For Developers
- **Standard Implementation**: Follows MCP SDK OAuth 2.1 specification
- **Extensible Architecture**: Easy to add support for additional OAuth providers
- **Well-Documented**: Clear code structure and error handling
- **Type-Safe**: Full TypeScript support with proper type definitions

### For Platform Operators
- **Expanded MCP Ecosystem**: Support for more MCP servers requiring authentication
- **Better User Experience**: Streamlined authentication flow
- **Security Best Practices**: Implementation follows OAuth 2.1 security guidelines

## 🔄 Migration Notes

### No Breaking Changes
This release maintains **full backward compatibility**. All existing MCP server configurations continue to work without modification.

### New Features Available
- **OAuth Support**: New optional `useOAuth` flag available for SSE and Streamable HTTP servers
- **OAuth UI**: New OAuth toggle and authorize button in MCP Server Manager
- **Callback Route**: New `/oauth/callback` route for OAuth redirects

### User-Facing Changes
- **New UI Elements**: OAuth toggle checkbox and authorize button in MCP Server Manager
- **New Route**: `/oauth/callback` route handles OAuth redirects (users typically won't see this directly)
- **Status Indicators**: Authorization status indicators for OAuth-enabled servers

### For Developers
- **New Service**: `MCPOAuthProvider` class available for OAuth implementations
- **New Page**: OAuth callback page at `app/oauth/callback/page.tsx`
- **Enhanced Interfaces**: `MCPServer` interface now includes optional `useOAuth` field
- **No API Changes**: No changes to existing APIs
- **No Database Migrations**: No database changes required
- **No Environment Variables**: No new environment variables needed

### Usage Examples

**Enabling OAuth for an MCP Server:**
1. Add an SSE or Streamable HTTP MCP server
2. Check the "Use OAuth Authentication" checkbox
3. Click "Authorize" button
4. Complete authentication on the MCP server's authorization page
5. You'll be redirected back to ChatLima with tokens stored

**Checking Authorization Status:**
- Green "Authorized" indicator: Server has valid OAuth tokens
- Yellow "Not authorized" indicator: OAuth enabled but no valid tokens - click "Authorize"

## 🚀 Deployment

### Standard Deployment Process
This release follows the standard deployment workflow:

```bash
# Completed:
# 1. Version bumped to 0.35.0
# 2. Git tag created (v0.35.0)
# 3. Tags pushed to remote
```

### Automatic Deployment
With GitHub integration enabled, pushing to main automatically triggers production deployment via Vercel.

### Environment Considerations
- ✅ No new environment variables needed
- ✅ No database migrations needed
- ✅ Backward compatible with all previous versions
- ✅ OAuth flow works entirely client-side

### Pre-Deployment Checklist
- [x] OAuth flow tested with test MCP server
- [x] Token storage and retrieval verified
- [x] Error handling tested
- [x] UI components tested
- [x] Callback page tested
- [x] Session storage cleanup verified

## 📊 Changes Summary

### Files Modified
- `app/api/chat/route.ts` - Added OAuth support for MCP servers
- `components/mcp-server-manager.tsx` - Added OAuth UI elements and authorization flow
- `lib/context/mcp-context.tsx` - Added OAuth state management
- `lib/services/chatMCPServerService.ts` - Integrated OAuth provider support
- `README.md` - Updated documentation with OAuth information
- `package.json` - Version bumped to 0.35.0

### Files Added
- `lib/services/mcpOAuthProvider.ts` - OAuth provider implementation (299 lines)
- `app/oauth/callback/page.tsx` - OAuth callback handler (136 lines)
- `.cursor/plans/mcp_oauth_authorization_e897ed04.plan.md` - Implementation plan
- `releases/RELEASE_NOTES_v0.35.0.md` - This release notes file

### Commits Included
- `f394625` - Merge pull request #26 from brooksy4503/feature/mcp-oauth-authorization
- `e55521c` - fix: clean up sessionStorage keys during OAuth flow
- `5f20081` - feat: implement OAuth 2.1 support for MCP servers

### Statistics
- **10 files changed**
- **1,087 insertions**, 45 deletions
- Net improvement: +1,042 lines
- **Enhancement**: OAuth 2.1 authorization support for MCP servers

---

**Full Changelog**: [v0.34.2...v0.35.0](https://github.com/brooksy4503/chatlima/compare/v0.34.2...v0.35.0)

## 🎉 What's Next

This release significantly expands ChatLima's MCP capabilities by enabling secure authentication with protected MCP servers. Future enhancements may include:
- Token refresh automation
- OAuth token revocation UI
- Support for additional OAuth grant types
- Enhanced OAuth error recovery
- OAuth token expiration notifications
- Support for custom OAuth scopes
