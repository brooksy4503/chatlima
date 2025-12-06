# MCP Server Testing Guide

This guide explains how to test MCP servers, diagnose connection issues, and troubleshoot OAuth authentication problems.

## Quick Start

### Test an MCP Server

```bash
# Test a streamable-http MCP server (default)
pnpm test:mcp https://api.supermemory.ai/mcp

# Test with OAuth discovery
pnpm test:mcp https://api.supermemory.ai/mcp --oauth

# Test an SSE server
pnpm test:mcp https://mcp.example.com/sse --type sse

# Test with custom headers
pnpm test:mcp https://api.supermemory.ai/mcp --header "Authorization:Bearer token123"

# Test a stdio server
pnpm test:mcp --type stdio --command node --args "server.js --port 3000"
```

## Common Issues and Solutions

### "Failed to fetch" Error

This error typically occurs during OAuth authentication. Here are the most common causes and solutions:

#### 1. CORS Issues

**Problem**: The MCP server doesn't allow cross-origin requests from your browser.

**Solution**: 
- Check if the server has CORS headers configured
- Contact the server administrator to enable CORS for your domain
- For testing, you can use the test script which runs server-side and bypasses CORS

**Check**: Look for CORS errors in the browser console (Network tab)

#### 2. OAuth Endpoint Discovery Failure

**Problem**: The OAuth discovery endpoint (`/.well-known/oauth-authorization-server`) is not accessible or returns an error.

**Solution**:
- The code will automatically fall back to default endpoints (`/token` and `/authorize`)
- Check if the server implements OAuth 2.1 discovery (RFC 8414)
- Verify the server URL is correct

**Check**: Run the test script with `--oauth` flag to see detailed discovery logs

#### 3. Network Connectivity

**Problem**: The server is unreachable or timing out.

**Solution**:
- Verify the server URL is correct
- Check your internet connection
- Ensure the server is running and accessible
- Check firewall settings

**Check**: The test script includes a basic connectivity test

#### 4. Invalid Server URL

**Problem**: The URL format is incorrect or the endpoint doesn't exist.

**Solution**:
- For `streamable-http`: URL should point to the MCP endpoint (e.g., `https://api.supermemory.ai/mcp`)
- For `sse`: URL should point to the SSE endpoint (e.g., `https://mcp.example.com/sse`)
- Verify the URL in your browser or with curl

## Testing SuperMemory MCP Server

To test the SuperMemory MCP server specifically:

```bash
# Basic test
pnpm test:mcp https://api.supermemory.ai/mcp

# Test with OAuth discovery
pnpm test:mcp https://api.supermemory.ai/mcp --oauth

# Test with verbose output (check console)
```

### Expected Behavior

1. **Basic Connectivity**: Should succeed if the server is reachable
2. **OAuth Discovery**: May fail if CORS is not enabled, but will fall back to defaults
3. **MCP Connection**: Should connect and list available tools

### Troubleshooting Steps

1. **Check Server Status**:
   ```bash
   curl -I https://api.supermemory.ai/mcp
   ```

2. **Test OAuth Discovery**:
   ```bash
   curl https://api.supermemory.ai/.well-known/oauth-authorization-server
   ```

3. **Check CORS Headers**:
   ```bash
   curl -H "Origin: http://localhost:3000" -I https://api.supermemory.ai/mcp
   ```

4. **Run Full Test Suite**:
   ```bash
   pnpm test:mcp https://api.supermemory.ai/mcp --oauth
   ```

## Understanding Test Output

The test script provides color-coded output:

- **Green (✓)**: Test passed
- **Red (✗)**: Test failed
- **Yellow (⚠)**: Warning (non-fatal)
- **Cyan (ℹ)**: Informational message

### Test Sections

1. **Basic Connectivity Test**: Checks if the server is reachable
2. **OAuth Endpoint Discovery**: Tests OAuth metadata discovery
3. **MCP Protocol Connection**: Tests the actual MCP protocol handshake
4. **Tool Listing**: Lists available MCP tools

## Adding MCP Servers in ChatLima

### Step 1: Add Server Configuration

1. Open ChatLima
2. Go to Settings → MCP Servers
3. Click "Add Server"
4. Fill in:
   - **Name**: SuperMemory (or any name)
   - **URL**: `https://api.supermemory.ai/mcp`
   - **Type**: Streamable HTTP
   - **OAuth**: Enable if the server requires OAuth

### Step 2: Test Connection

1. Click the test button (WiFi icon) next to the server
2. Check the test result message
3. If OAuth is enabled, click "Authorize" to start OAuth flow

### Step 3: Enable Server

1. Toggle the server to "Active"
2. The server will be used in chat conversations

## Debugging OAuth Issues

### Enable Console Logging

Open browser DevTools (F12) and check the Console tab. Look for messages prefixed with `[MCP OAuth]`:

- `[MCP OAuth] Attempting to discover OAuth endpoints from: ...`
- `[MCP OAuth] Well-known endpoint response: ...`
- `[MCP OAuth] Using fallback endpoints: ...`

### Common OAuth Errors

1. **"Failed to fetch"**:
   - Usually a CORS issue
   - Check browser console for detailed error
   - Try the test script (runs server-side, bypasses CORS)

2. **"OAuth endpoint not found"**:
   - Server may not support OAuth discovery
   - Code will fall back to default endpoints
   - Verify server documentation

3. **"Authorization failed"**:
   - Server rejected the authorization request
   - Check if OAuth is correctly configured on the server
   - Verify redirect URI matches server configuration

## Code Improvements Made

### Enhanced Error Handling

- Added detailed logging in `mcpOAuthProvider.ts` for OAuth discovery
- Improved error messages in `mcp-server-manager.tsx` for user-facing errors
- Better CORS and network error detection

### Test Script Features

- Basic connectivity testing
- OAuth endpoint discovery testing
- MCP protocol connection testing
- Tool listing
- Color-coded output for easy reading
- Detailed error messages with troubleshooting hints

## Additional Resources

- [MCP Specification](https://modelcontextprotocol.io)
- [OAuth 2.1 Discovery (RFC 8414)](https://www.rfc-editor.org/rfc/rfc8414)
- [ChatLima MCP Documentation](../README.md#mcp-servers)
