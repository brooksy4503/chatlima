# MCP 1.13.0 Upgrade Guide for ChatLima

This guide outlines the steps needed to upgrade ChatLima from MCP SDK 1.12.0 to 1.13.0 to leverage the latest Model Context Protocol features and improvements.

## Overview

MCP 1.13.0 introduces several important changes including:
- **MCP-Protocol-Version header requirement** for HTTP transport (BREAKING CHANGE)
- **Resource template reference naming changes** (BREAKING CHANGE)
- **Enhanced metadata support** with `_meta` fields
- **Tool, resource, and prompt titles** for better UI display
- **Resource links** in tool outputs
- **Context-aware completions**
- **Elicitation capability** for interactive workflows
- **Resource Indicators** (RFC 8707) for security

## Step 1: Update Package Dependencies

First, update the MCP SDK to the latest version:

```bash
pnpm update @modelcontextprotocol/sdk@^1.13.0
```

Update your `package.json`:

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.13.0"
  }
}
```

## Step 2: Update StreamableHTTP Transport (BREAKING CHANGE)

The most critical change is the **MCP-Protocol-Version header requirement** for HTTP transport.

### Current Implementation Issue

Your current code in `app/api/chat/route.ts` (lines 378-383) creates `StreamableHTTPClientTransport` without the required protocol version header:

```typescript
// CURRENT CODE - NEEDS UPDATE
finalTransportForClient = new StreamableHTTPClientTransport(transportUrl, {
  requestInit: {
    headers: Object.keys(headers).length > 0 ? headers : undefined
  }
});
```

### Updated Implementation

```typescript
// UPDATED CODE - With MCP-Protocol-Version header
finalTransportForClient = new StreamableHTTPClientTransport(transportUrl, {
  requestInit: {
    headers: {
      'MCP-Protocol-Version': '2025-06-18', // Required for MCP 1.13.0
      ...headers // Spread existing headers
    }
  }
});
```

## Step 3: Handle Resource Template Reference Changes

If your code uses `ResourceReference`, update it to `ResourceTemplateReference`:

```typescript
// OLD (1.12.0)
import { ResourceReference } from '@modelcontextprotocol/sdk';

// NEW (1.13.0)  
import { ResourceTemplateReference } from '@modelcontextprotocol/sdk';
```

## Step 4: Add Enhanced Metadata Support

### Tool Metadata with Titles

Update your MCP server configurations to include `title` fields for better UI display:

```typescript
// In lib/context/mcp-context.tsx - Update MCPServer interface
export interface MCPServer {
  id: string;
  name: string;
  title?: string; // NEW: Add title for display
  url: string;
  type: 'sse' | 'stdio' | 'streamable-http';
  command?: string;
  args?: string[];
  env?: KeyValuePair[];
  headers?: KeyValuePair[];
  description?: string;
  _meta?: Record<string, any>; // NEW: Add _meta support
}
```

### Update MCP Server Manager Component

In `components/mcp-server-manager.tsx`, add support for displaying titles:

```typescript
// Add title field to your server creation/editing forms
<div className="space-y-2">
  <Label htmlFor="name">Name (ID)</Label>
  <Input
    id="name"
    placeholder="e.g., filesystem-server"
    value={formData.name}
    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
  />
</div>

<div className="space-y-2">
  <Label htmlFor="title">Title (Display Name)</Label>
  <Input
    id="title"
    placeholder="e.g., File System Access"
    value={formData.title || ''}
    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
  />
</div>
```

## Step 5: Implement Resource Links Support

Update your tool calling logic to handle resource links in tool outputs:

```typescript
// In app/api/chat/route.ts - Update tool result processing
interface ResourceLink {
  type: 'resource_link';
  uri: string;
  name?: string;
  mimeType?: string;
  description?: string;
}

interface ToolCallResult {
  content: Array<{
    type: 'text' | 'resource_link';
    text?: string;
    uri?: string;
    name?: string;
    mimeType?: string;
    description?: string;
  }>;
  isError?: boolean;
}
```

## Step 6: Add Context-Aware Completions Support

If you plan to use completions, update to support the new `context` field:

```typescript
// NEW: Context-aware completion support
interface CompletionRequest {
  ref: {
    type: 'ref/prompt' | 'ref/resource';
    name?: string;
    uri?: string;
  };
  argument: {
    name: string;
    value: string;
  };
  context?: {
    arguments?: Record<string, any>;
  }; // NEW: Context support
}
```

## Step 7: Implement Elicitation Capability (Optional)

For interactive workflows, you can implement elicitation support:

```typescript
// NEW: Elicitation capability
interface ElicitationRequest {
  message: string;
  requestedSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

// In your MCP client setup, add elicitation capability
const clientCapabilities = {
  elicitation: {}, // NEW: Declare elicitation support
  // ... other capabilities
};
```

## Step 8: Update Error Handling

Update error handling to use the new "reject" terminology instead of "decline":

```typescript
// OLD
if (result.action === 'decline') {
  // handle decline
}

// NEW  
if (result.action === 'reject') {
  // handle rejection
}
```

## Step 9: Enhanced Security with Resource Indicators

For production deployments, implement Resource Indicators (RFC 8707) support:

```typescript
// In StreamableHTTP transport configuration
finalTransportForClient = new StreamableHTTPClientTransport(transportUrl, {
  requestInit: {
    headers: {
      'MCP-Protocol-Version': '2025-06-18',
      'Resource': transportUrl.origin, // RFC 8707 Resource Indicator
      ...headers
    }
  }
});
```

## Step 10: Update Development Dependencies

Update any development tools that might be affected:

```bash
# Update all MCP-related dependencies if any
pnpm update
```

## Step 11: Testing the Upgrade

1. **Test Existing MCP Servers**: Ensure all your current MCP server connections still work
2. **Test StreamableHTTP**: Verify that HTTP-based MCP servers can connect properly
3. **Test Error Handling**: Ensure error cases are handled gracefully
4. **Test UI**: Verify that server titles display correctly in the MCP Server Manager

## Step 12: Optional Enhancements

Consider implementing these new features:

### A. Enhanced Tool Output with Resource Links

```typescript
// Example of returning resource links from tools
const toolResult = {
  content: [
    { type: "text", text: "Found the following files:" },
    {
      type: "resource_link",
      uri: "file:///project/README.md", 
      name: "README.md",
      mimeType: "text/markdown",
      description: "Project documentation"
    }
  ]
};
```

### B. Interactive Workflows with Elicitation

```typescript
// Example elicitation for user confirmation
const userInput = await mcpClient.elicitInput({
  message: "Do you want to proceed with deleting these files?",
  requestedSchema: {
    type: "object",
    properties: {
      confirm: {
        type: "boolean",
        title: "Confirm deletion"
      }
    },
    required: ["confirm"]
  }
});
```

## Breaking Changes Summary

1. **MCP-Protocol-Version header**: Required for HTTP transport
2. **ResourceReference → ResourceTemplateReference**: Update imports
3. **decline → reject**: Update error handling terminology

## Migration Checklist

- [ ] Update MCP SDK to 1.13.0
- [ ] Add MCP-Protocol-Version header to StreamableHttp transport
- [ ] Update ResourceReference imports if used
- [ ] Add title and _meta fields to MCP server interface
- [ ] Update server manager UI to support titles
- [ ] Test all existing MCP server connections
- [ ] Update error handling from "decline" to "reject"
- [ ] Consider implementing elicitation for interactive workflows
- [ ] Consider implementing resource links for better tool outputs

## Resources

- [MCP 1.13.0 Release Notes](https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/1.13.0)
- [MCP Specification 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/changelog)
- [MCP TypeScript SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)

## Support

If you encounter issues during the upgrade:
1. Check the [MCP GitHub Discussions](https://github.com/modelcontextprotocol/typescript-sdk/discussions)
2. Review the [MCP specification](https://modelcontextprotocol.io/)
3. Test with the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) for debugging