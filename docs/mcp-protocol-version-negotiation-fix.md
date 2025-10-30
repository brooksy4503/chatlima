# MCP Protocol Version Negotiation Fix

**Date:** October 30, 2025  
**Status:** ✅ Fixed  
**Severity:** Critical - Blocking MCP server connections

---

## Problem Summary

MCP (Model Context Protocol) servers were failing to connect with the error:

```
Error: Error POSTing to endpoint (HTTP 400): 
{"jsonrpc":"2.0","error":{"code":-32000,"message":"Bad Request: Unsupported protocol version (supported versions: 2025-06-18, 2025-03-26, 2024-11-05, 2024-10-07)"},"id":null}
```

The issue occurred during the MCP client connection phase when using `StreamableHTTPClientTransport`.

---

## Error Details

### Full Error Log

```
[2025-10-30T10:51:21.761Z][MCP_INIT_START] Starting MCP server initialization
[2025-10-30T10:51:21.761Z][MCP_SERVER_PROCESS] Processing MCP server
[2025-10-30T10:51:21.761Z][MCP_HTTP_TRANSPORT] Creating StreamableHTTP transport
[2025-10-30T10:51:21.761Z][MCP_CLIENT_CREATE] Creating MCP client
[2025-10-30T10:51:21.793Z][MCP_CLIENT_CONNECT] Connecting MCP client
[MCP_SERVER_ERROR] Failed to initialize MCP client: Error: Error POSTing to endpoint (HTTP 400): 
{"jsonrpc":"2.0","error":{"code":-32000,"message":"Bad Request: Unsupported protocol version 
(supported versions: 2025-06-18, 2025-03-26, 2024-11-05, 2024-10-07)"},"id":null}
    at StreamableHTTPClientTransport.send (../../../src/client/streamableHttp.ts:458:22)
    at async Client.notification (../../../src/shared/protocol.ts:633:8)
    at async Client.connect (../../../src/client/index.ts:157:12)
    at async ChatMCPServerService.initializeMCPServers (lib/services/chatMCPServerService.ts:81:16)
```

### Error Location

- **Component:** `ChatMCPServerService.createStreamableHTTPTransport()`
- **File:** `lib/services/chatMCPServerService.ts`
- **Phase:** MCP client connection handshake
- **Transport:** StreamableHTTP

---

## Root Cause Analysis

### What Was Wrong

The code was **manually setting the MCP protocol version header** when creating the `StreamableHTTPClientTransport`:

```typescript
// ❌ WRONG: Manually setting protocol version header
return new StreamableHTTPClientTransport(transportUrl, {
    requestInit: {
        headers: {
            'MCP-Protocol-Version': '2025-06-18',  // Manual override
            ...headers
        }
    }
});
```

### Why This Failed

1. **SDK Handles Protocol Negotiation**: The `@modelcontextprotocol/sdk` automatically negotiates the protocol version during the connection handshake. It's designed to:
   - Query the server for supported versions
   - Select the best mutually supported version
   - Handle the handshake protocol correctly

2. **Manual Header Interfered**: By manually setting the `MCP-Protocol-Version` header, we were:
   - Bypassing the SDK's negotiation mechanism
   - Potentially sending the header at the wrong stage of the connection
   - Hard-coding a single version instead of negotiating
   - Causing the server to reject the connection as improperly formatted

3. **Connection Handshake Failed**: The MCP server received a malformed or premature protocol version declaration and rejected the connection with HTTP 400.

---

## The Fix

### Code Change

**File:** `lib/services/chatMCPServerService.ts`  
**Function:** `createStreamableHTTPTransport()`

**Before:**
```typescript
private static createStreamableHTTPTransport(mcpServer: MCPServerConfig, requestId: string): Transport {
    const headers: Record<string, string> = {};
    if (mcpServer.headers && mcpServer.headers.length > 0) {
        mcpServer.headers.forEach(header => {
            if (header.key) headers[header.key] = header.value || '';
        });
    }

    logDiagnostic('MCP_HTTP_TRANSPORT', 'Creating StreamableHTTP transport', {
        requestId,
        url: mcpServer.url,
        headerCount: Object.keys(headers).length
    });

    const transportUrl = new URL(mcpServer.url);
    return new StreamableHTTPClientTransport(transportUrl, {
        requestInit: {
            headers: {
                'MCP-Protocol-Version': '2025-06-18',  // ❌ Manual override
                ...headers
            }
        }
    });
}
```

**After:**
```typescript
private static createStreamableHTTPTransport(mcpServer: MCPServerConfig, requestId: string): Transport {
    const headers: Record<string, string> = {};
    if (mcpServer.headers && mcpServer.headers.length > 0) {
        mcpServer.headers.forEach(header => {
            if (header.key) headers[header.key] = header.value || '';
        });
    }

    logDiagnostic('MCP_HTTP_TRANSPORT', 'Creating StreamableHTTP transport', {
        requestId,
        url: mcpServer.url,
        headerCount: Object.keys(headers).length
    });

    const transportUrl = new URL(mcpServer.url);
    // Let the SDK handle protocol version negotiation automatically
    return new StreamableHTTPClientTransport(transportUrl, 
        Object.keys(headers).length > 0 ? {
            requestInit: {
                headers: headers  // ✅ Only custom headers, SDK handles protocol
            }
        } : undefined
    );
}
```

### Key Changes

1. **Removed manual protocol version header** - No longer setting `'MCP-Protocol-Version': '2025-06-18'`
2. **Only pass custom headers** - User-defined headers are still passed through
3. **Pass `undefined` when no headers** - Cleaner API usage when no custom headers are needed
4. **Let SDK handle negotiation** - The MCP SDK now handles all protocol version negotiation automatically

---

## How MCP Protocol Negotiation Works

### Automatic Protocol Negotiation

The MCP SDK's connection process:

1. **Client Initiates**: Client sends connection request without pre-declaring protocol version
2. **Server Advertises**: Server responds with list of supported protocol versions
3. **Client Selects**: Client picks the newest mutually supported version
4. **Handshake Completes**: Connection established with agreed-upon protocol version

### Supported Versions (as of Oct 2025)

According to the error message, the MCP server supported:
- `2025-06-18` (Latest)
- `2025-03-26`
- `2024-11-05`
- `2024-10-07`

The SDK automatically selects the best version from this list.

### Why Automatic Is Better

✅ **Advantages of SDK negotiation:**
- Works with any MCP server version
- Future-proof as new versions are released
- Proper handshake timing and sequence
- Handles version compatibility correctly
- No maintenance needed when versions change

❌ **Problems with manual version:**
- Hard-coded to single version
- Breaks with older/newer servers
- Wrong timing in handshake protocol
- Requires code updates for new versions

---

## Verification

### Success Indicators

After the fix, successful MCP connection shows:

```
[MCP_INIT_START] Starting MCP server initialization
[MCP_SERVER_PROCESS] Processing MCP server
[MCP_HTTP_TRANSPORT] Creating StreamableHTTP transport
[MCP_CLIENT_CREATE] Creating MCP client
[MCP_CLIENT_CONNECT] Connecting MCP client
[MCP_LIST_TOOLS] Listing MCP tools
[MCP_TOOLS_LOADED] MCP tools loaded from streamable-http transport
[MCP_INIT_COMPLETE] MCP server initialization completed
```

### Test Results

- ✅ MCP server connection successful
- ✅ Tools loaded and available
- ✅ No protocol version errors
- ✅ Chat requests with MCP tools work correctly
- ✅ Tool calling functions as expected

---

## Related Issues

### Duplicate MCP Initialization

This fix was part of a larger effort to fix tool calling. See:
- [Tool Calling Duplicate Initialization Fix](./tool-calling-duplicate-initialization-fix.md)
- [MCP Tools AI SDK Integration Fix](./mcp-tools-ai-sdk-integration-fix.md)

### Enhanced Error Logging

As part of debugging this issue, we added enhanced error logging:

```typescript
} catch (error) {
    console.error(`[MCP_SERVER_ERROR] Failed to initialize MCP client:`, error);
    logDiagnostic('MCP_SERVER_ERROR', `Failed to initialize MCP client`, {
        requestId,
        type: mcpServer.type,
        url: mcpServer.url,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
    });
    // Continue with other servers instead of failing the entire request
}
```

This helped identify the exact error and location.

---

## Best Practices

### When Using MCP SDK

1. **Let SDK Handle Protocol**: Don't manually set `MCP-Protocol-Version` header
2. **Pass Only Custom Headers**: Only include user-defined headers in `requestInit`
3. **Trust the Handshake**: The SDK knows how to negotiate properly
4. **Update SDK Regularly**: Protocol improvements happen in the SDK

### When Creating MCP Transports

```typescript
// ✅ GOOD: Let SDK handle protocol
const transport = new StreamableHTTPClientTransport(url, {
    requestInit: {
        headers: customHeaders  // Only your custom headers
    }
});

// ❌ BAD: Manual protocol version
const transport = new StreamableHTTPClientTransport(url, {
    requestInit: {
        headers: {
            'MCP-Protocol-Version': '2025-06-18',  // Don't do this
            ...customHeaders
        }
    }
});
```

### Error Handling

Always log full error details for MCP connection failures:

```typescript
try {
    await mcpClient.connect(transport);
} catch (error) {
    console.error(`[MCP_SERVER_ERROR] Failed to initialize MCP client:`, error);
    logDiagnostic('MCP_SERVER_ERROR', `Failed to initialize MCP client`, {
        requestId,
        type: mcpServer.type,
        url: mcpServer.url,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
    });
}
```

---

## Testing

### How to Test MCP Connections

1. **Configure MCP Server** in the UI
2. **Send Chat Message** that would benefit from tools
3. **Check Logs** for MCP initialization sequence
4. **Verify Tools Loaded** - Look for `MCP_TOOLS_LOADED` log
5. **Test Tool Calling** - Verify AI can call the tools

### Expected Log Sequence

```
[MCP_INIT_START] Starting MCP server initialization
  serverCount: 1
  selectedModel: "openrouter/anthropic/claude-3.5-sonnet"
  
[MCP_SERVER_PROCESS] Processing MCP server
  type: "streamable-http"
  url: "https://your-mcp-server.com"
  
[MCP_HTTP_TRANSPORT] Creating StreamableHTTP transport
  headerCount: 1
  
[MCP_CLIENT_CREATE] Creating MCP client

[MCP_CLIENT_CONNECT] Connecting MCP client
  url: "https://your-mcp-server.com"
  
[MCP_LIST_TOOLS] Listing MCP tools

[MCP_TOOLS_LOADED] MCP tools loaded from streamable-http transport
  toolCount: 4
  toolNames: ["tool1", "tool2", "tool3", "tool4"]
  
[MCP_INIT_COMPLETE] MCP server initialization completed
  toolCount: 4
```

---

## Impact

### Before Fix

- ❌ All StreamableHTTP MCP connections failed
- ❌ HTTP 400 errors on connection
- ❌ No tools available for AI
- ❌ Tool calling completely broken

### After Fix

- ✅ StreamableHTTP MCP connections work
- ✅ Automatic protocol version negotiation
- ✅ Tools load successfully
- ✅ Tool calling works as designed
- ✅ Future-proof for new protocol versions

---

## Files Modified

### Primary Fix

**File:** `lib/services/chatMCPServerService.ts`
- **Function:** `createStreamableHTTPTransport()`
- **Lines:** ~288-296
- **Change:** Removed manual `MCP-Protocol-Version` header

### Enhanced Logging

**File:** `lib/services/chatMCPServerService.ts`
- **Lines:** ~77-85, 118-127
- **Change:** Added detailed error logging and connection step logging

---

## References

### MCP Protocol Specification

- Protocol versions are negotiated during handshake
- Client must not pre-declare version in headers
- Server advertises supported versions
- Client selects best mutual version

### Related Documentation

- [Model Context Protocol (MCP) SDK](https://github.com/modelcontextprotocol/sdk)
- [StreamableHTTP Transport Documentation](https://modelcontextprotocol.io/docs/concepts/transports#streamable-http)
- [MCP Protocol Versions](https://modelcontextprotocol.io/docs/specification/protocol-versions)

---

## Lessons Learned

1. **Trust the SDK**: Don't override protocol-level functionality that the SDK handles
2. **Read Error Messages**: The "Unsupported protocol version" error clearly indicated protocol negotiation issue
3. **Enhanced Logging Helps**: Adding step-by-step logging made it clear where the error occurred
4. **Test MCP Changes**: Always test with actual MCP servers, not just local stubs
5. **Document Protocol Behavior**: Understanding how MCP handshake works prevented future issues

---

## Prevention

To prevent similar issues:

1. **Code Review Checklist**: Don't manually set MCP protocol headers
2. **Documentation**: Keep this doc updated with any transport changes
3. **Testing**: Include MCP connection tests in CI/CD
4. **SDK Updates**: Monitor MCP SDK changelog for protocol changes

---

## Status

✅ **Fixed and Verified**

MCP servers now connect successfully with automatic protocol version negotiation. Tool calling works correctly with StreamableHTTP transport.

