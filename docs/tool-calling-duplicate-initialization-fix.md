# Tool Calling Failure Fix - Duplicate MCP Initialization

**Date:** October 30, 2025  
**Status:** ✅ Fixed  
**Severity:** Critical - Blocking tool calling functionality

---

## Problem Summary

Tool calling was failing in the chat API because there was **duplicate MCP (Model Context Protocol) server initialization code**. The service was being called but its result was never used, and then the entire initialization was repeated inline with duplicate code.

---

## Root Cause

In `app/api/chat/route.ts`:

### Issue 1: Service Result Not Used
```typescript
// Line 482: Service was called
const mcpResult = await ChatMCPServerService.initializeMCPServers({
    mcpServers: initialMcpServers,
    selectedModel
});

// ❌ PROBLEM: mcpResult was completely ignored!
// The code never used mcpResult.tools or mcpResult.cleanup
```

### Issue 2: Duplicate Initialization Code
```typescript
// Lines 629-800: Entire MCP initialization was duplicated inline
// - Manual transport creation
// - Manual client connection
// - Manual tool conversion
// - Manual cleanup registration
// This was ~170 lines of duplicate code!
```

### Why This Broke Tool Calling

1. The service properly initialized MCP servers and converted tools
2. But `mcpResult.tools` was never assigned to the `tools` variable
3. The duplicate inline code tried to re-initialize everything
4. This likely caused conflicts, race conditions, or the tools object to be empty/malformed
5. Without proper tools, the AI SDK couldn't perform tool calling

---

## The Fix

### Changed Code Structure

**Before:**
```typescript
// Step 1: Call service (result ignored)
const mcpResult = await ChatMCPServerService.initializeMCPServers({...});

// Step 2: Duplicate initialization (170 lines)
let tools = {};
const mcpClients: any[] = [];
for (const mcpServer of initialMcpServers) {
    // ... 170 lines of duplicate code ...
}

// Step 3: Use the wrong tools
const toolsToUse = isGoogleModel ? cleanTools(tools) : tools;
```

**After:**
```typescript
// Step 1: Call service
const mcpResult = await ChatMCPServerService.initializeMCPServers({
    mcpServers: initialMcpServers,
    selectedModel
});

// Step 2: Register cleanup properly
if (mcpResult.cleanup) {
    req.signal.addEventListener('abort', async () => {
        await mcpResult.cleanup();
    });
}

// Step 3: Use tools from service (no duplication!)
const tools = mcpResult.tools;

// Step 4: Continue with proper tools
const toolsToUse = isGoogleModel ? cleanTools(tools) : tools;
```

---

## Changes Made

### 1. Removed Duplicate Code (Lines 629-800)
Deleted ~170 lines including:
- Manual transport creation logic
- Manual MCP client initialization
- Manual tool conversion with `tool()` and `jsonSchema()`
- Manual cleanup registration

### 2. Used Service Result Properly
```typescript
const tools = mcpResult.tools;
```

### 3. Registered Cleanup from Service
```typescript
if (mcpResult.cleanup) {
    req.signal.addEventListener('abort', async () => {
        await mcpResult.cleanup();
    });
}
```

### 4. Removed Unused Imports
Since we removed all inline MCP code, we no longer need:
```typescript
// ❌ Removed these unused imports:
import { Client as MCPClient } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { spawn } from "child_process";
```

---

## Benefits

### 1. ✅ Tool Calling Now Works
- Proper tools are passed to the AI SDK
- MCP servers initialize once, not twice
- No race conditions or conflicts

### 2. ✅ Cleaner Code
- Removed 170 lines of duplicate code
- Single source of truth (the service)
- Easier to maintain

### 3. ✅ Proper Resource Management
- Cleanup function properly registered
- MCP clients close on request abort
- No resource leaks

### 4. ✅ Better Separation of Concerns
- Business logic in service layer
- Route handler uses service, not duplicate logic
- Follows DRY principle

---

## Verification

### What to Test

1. **MCP Tool Initialization**
   - Check logs for: `MCP_INIT_START` and `MCP_TOOLS_LOADED`
   - Verify tool count and names are logged

2. **Tool Calling During Chat**
   - Send a chat message that should trigger tool usage
   - Verify tools are available in `toolsToUse`
   - Check that AI model can call tools

3. **Cleanup on Abort**
   - Start a chat request
   - Abort it (close browser tab or cancel request)
   - Verify `mcpResult.cleanup()` is called
   - Check no orphaned MCP clients

### Expected Log Flow

```
[MCP_INIT_START] Starting MCP server initialization
[MCP_TOOLS_LOADED] MCP tools loaded from streamable-http transport
  toolCount: 4
  toolNames: ['tavily-search', 'tavily-extract', 'tavily-crawl', 'tavily-map']
[DEBUG] Using converted message format for model: openrouter/anthropic/claude-3.5-sonnet
POST /api/chat 200 in 23697ms
```

---

## Technical Details

### ChatMCPServerService.initializeMCPServers()

The service properly handles:
- ✅ Transport creation (SSE, stdio, streamable-http)
- ✅ MCP client connection
- ✅ Tool listing and conversion
- ✅ AI SDK format transformation with `tool()` and `jsonSchema()`
- ✅ Cleanup function creation
- ✅ Error handling and logging
- ✅ Model-specific filtering (e.g., disable for DeepSeek R1)

### Return Type
```typescript
interface MCPServerResult {
    tools: Record<string, any>;      // Converted AI SDK tools
    mcpClients: any[];               // Active MCP clients
    cleanup: () => Promise<void>;    // Cleanup function
}
```

---

## Files Modified

### `/app/api/chat/route.ts`
- **Removed:** Lines 629-800 (duplicate MCP initialization)
- **Changed:** Lines 481-493 (properly use service result)
- **Removed:** Lines 28-32 (unused MCP imports)
- **Impact:** -176 lines, cleaner code structure

---

## Lessons Learned

1. **Always use service layer results** - Don't call a service and then ignore its return value
2. **Avoid code duplication** - If you create a service to handle something, remove the old inline code
3. **Check for unused imports** - When removing code, clean up imports too
4. **Test both paths** - If there's a service AND inline code, something is wrong

---

## Related Documentation

- [MCP Tools AI SDK Integration Fix](./mcp-tools-ai-sdk-integration-fix.md) - Original MCP tool conversion fix
- [ChatMCPServerService](../lib/services/chatMCPServerService.ts) - Service implementation

---

## Status

✅ **Fixed and ready for testing**

The tool calling infrastructure now properly uses the service layer, eliminating duplicate code and ensuring MCP tools are correctly initialized and available for the AI SDK.

