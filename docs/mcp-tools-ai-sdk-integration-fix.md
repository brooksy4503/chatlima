# MCP Tools Integration with Vercel AI SDK - Issue & Fix

**Date:** October 30, 2025  
**Status:** ✅ Resolved  
**Severity:** Critical - Blocking MCP tool usage

---

## Problem Summary

When integrating Model Context Protocol (MCP) tools with the Vercel AI SDK in the ChatLima chat API, the application encountered critical schema validation errors that prevented MCP tools from being used. The errors occurred during the AI SDK's tool preparation phase when attempting to pass MCP tools to language models.

---

## Error Symptoms

### Error 1: Initial Syntax Error
```
Parsing ecmascript source code failed
Line 1714: Expression expected
```
**Cause:** Extra closing brace `}` in the code

### Error 2: Schema Validation Error (_def)
```
TypeError: Cannot read properties of undefined (reading '_def')
at zodToJsonSchema
at prepareToolsAndToolChoice
```

### Error 3: Schema Validation Error (typeName)
```
TypeError: Cannot read properties of undefined (reading 'typeName')
at parseDef
at zodToJsonSchema
at prepareToolsAndToolChoice
```

---

## Root Cause Analysis

### 1. Array vs Object Structure Mismatch

The MCP SDK's `listTools()` returns tools as an **array**:
```typescript
[
  { name: "tavily-search", description: "...", inputSchema: {...} },
  { name: "tavily-extract", description: "...", inputSchema: {...} }
]
```

The code was incorrectly spreading this array into an object:
```typescript
// ❌ WRONG: Spreading array creates numeric keys
tools = { ...tools, ...mcptools };
// Result: { '0': tool1, '1': tool2, '2': tool3 }
```

When `Object.keys(mcptools)` was called on the array, it returned numeric indices (`['0', '1', '2', '3']`) instead of tool names.

### 2. Schema Format Incompatibility

MCP tools use **JSON Schema** format:
```typescript
{
  name: "tool-name",
  description: "Search the web",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string" }
    }
  }
}
```

The Vercel AI SDK expects tools in a different format with **Zod schemas** or explicitly wrapped JSON Schemas:
```typescript
{
  "tool-name": {
    description: "Search the web",
    parameters: zodSchema(...) // or jsonSchema(...)
    execute: async (params) => { ... }
  }
}
```

The AI SDK was trying to parse the MCP JSON Schema as a Zod schema, causing the validation errors.

---

## The Solution

### Step 1: Import AI SDK Tool Helpers

```typescript
import { tool, jsonSchema } from 'ai';
```

### Step 2: Convert MCP Tools to AI SDK Format

The fix properly converts MCP tools using the AI SDK's `tool()` helper function and `jsonSchema()` wrapper:

```typescript
const toolsList = await mcpClient.listTools();
const mcptools = toolsList.tools || [];

// Convert MCP tools array to AI SDK tool format
const toolsObject = Array.isArray(mcptools) 
    ? mcptools.reduce((acc: Record<string, any>, mcpTool: any) => {
        if (mcpTool && mcpTool.name) {
            // ✅ CORRECT: Use tool() helper with jsonSchema() wrapper
            acc[mcpTool.name] = tool({
                description: mcpTool.description || '',
                parameters: jsonSchema(mcpTool.inputSchema || { 
                    type: 'object', 
                    properties: {} 
                }),
                execute: async (params: any) => {
                    try {
                        const result = await mcpClient.callTool({
                            name: mcpTool.name,
                            arguments: params
                        });
                        return result.content;
                    } catch (error) {
                        console.error(`Error executing MCP tool ${mcpTool.name}:`, error);
                        throw error;
                    }
                }
            });
        }
        return acc;
    }, {})
    : mcptools;

// Add converted tools to tools object
Object.assign(tools, toolsObject);
```

### Key Changes:

1. **Renamed loop variable** from `tool` to `mcpTool` to avoid shadowing the imported `tool()` function

2. **Used `tool()` helper** to create properly formatted AI SDK tools

3. **Wrapped JSON Schema** with `jsonSchema()` to explicitly tell AI SDK the schema format

4. **Preserved execute function** to call the MCP tool via `mcpClient.callTool()`

5. **Converted array to object** with tool names as keys (not numeric indices)

---

## Files Modified

### 1. `/app/api/chat/route.ts`
- Added imports: `tool, jsonSchema` from `'ai'`
- Updated MCP tool conversion logic (lines ~750-782)

### 2. `/lib/services/chatMCPServerService.ts`
- Added imports: `tool, jsonSchema` from `'ai'`
- Updated MCP tool conversion logic (lines ~81-117)

---

## Verification

After the fix:
- ✅ MCP tools load successfully: `['tavily-search', 'tavily-extract', 'tavily-crawl', 'tavily-map']`
- ✅ No schema validation errors
- ✅ Chat requests complete successfully with ~30s response time
- ✅ Token tracking works correctly
- ✅ Cost calculation succeeds ($0.0014146 actual cost tracked)

---

## Technical Explanation

### Why `jsonSchema()` is Required

The Vercel AI SDK's `tool()` function expects the `parameters` field to be one of:
1. A Zod schema object (e.g., `z.object({...})`)
2. A JSON Schema wrapped with `jsonSchema()` helper

Without the `jsonSchema()` wrapper, the AI SDK attempts to parse the raw JSON Schema object as a Zod schema, accessing Zod-specific properties like `_def` and `typeName` that don't exist in JSON Schema objects, causing the TypeError.

The `jsonSchema()` wrapper tells the AI SDK: "This is a JSON Schema, not a Zod schema, so don't try to parse it as Zod."

### The Tool Format Transformation

```
MCP Tool Format:
{
  name: "tavily-search",
  description: "Search the web",
  inputSchema: { type: "object", properties: { query: { type: "string" } } }
}

↓ Conversion ↓

AI SDK Tool Format:
{
  "tavily-search": tool({
    description: "Search the web",
    parameters: jsonSchema({ type: "object", properties: { query: { type: "string" } } }),
    execute: async (params) => { /* call MCP tool */ }
  })
}
```

---

## Prevention

To prevent similar issues in the future:

1. **Always use AI SDK tool helpers** (`tool()`, `jsonSchema()`) when integrating external tool formats
2. **Check array vs object structures** - use `.reduce()` or explicit loops instead of spreading arrays
3. **Validate tool schema format** before passing to AI SDK
4. **Test tool integration** with actual MCP servers in development

---

## Related Resources

- [Vercel AI SDK Tools Documentation](https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/specification)
- [MCP SDK Client Documentation](https://github.com/modelcontextprotocol/sdk)

---

## Lessons Learned

1. **Type mismatches can cause cryptic errors** - The error messages about `_def` and `typeName` didn't clearly indicate the root cause (JSON Schema vs Zod Schema format)

2. **Framework helpers exist for a reason** - The AI SDK provides `tool()` and `jsonSchema()` specifically to handle different schema formats

3. **Variable naming matters** - The shadowing of the `tool` function by a loop variable masked the real issue initially

4. **Integration testing is crucial** - These errors only appeared when actually running the application with MCP tools enabled

---

## Status

**✅ RESOLVED** - MCP tools are now fully functional and properly integrated with the Vercel AI SDK.

