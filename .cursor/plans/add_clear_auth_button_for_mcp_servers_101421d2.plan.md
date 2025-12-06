---
name: Add Clear Auth Button for MCP Servers
overview: Add a "Clear Auth" button to the MCP Server Manager that allows users to manually clear OAuth tokens for individual servers. The button will appear when a server is authorized and will clear all stored tokens from localStorage.
todos:
  - id: add-clear-oauth-function
    content: Add clearOAuth function to MCPServerManager component that clears tokens and updates status
    status: completed
  - id: update-oauth-ui
    content: Update OAuth status UI section to show 'Clear Auth' button when authorized
    status: completed
  - id: enhance-clear-auth-data
    content: Optionally enhance clearAuthData() to also remove tokens_stored_at timestamp
    status: completed
---

# Plan: Add Clear Auth Button for Individual MCP Servers

## Overview

Add functionality to manually clear OAuth authentication tokens for individual MCP servers. The button will appear in the OAuth status section when a server is authorized.

## Implementation Details

### 1. Add Clear Auth Function (`components/mcp-server-manager.tsx`)

- Create a new `clearOAuth` async function that:
- Takes a server as parameter
- Creates an `MCPOAuthProvider` instance for the server
- Calls `clearAuthData()` method to remove tokens from localStorage
- Updates `oauthStatus` state to mark server as unauthorized
- Shows a success toast notification
- Handles errors gracefully

### 2. Update OAuth Status UI (`components/mcp-server-manager.tsx`)

- Modify the OAuth status section (around line 730-764) to:
- Show a "Clear Auth" button when `oauthStatus[server.id] === true`
- Place the button next to the "Authorized" status indicator
- Use similar styling to the existing "Authorize" button
- Add appropriate icon (e.g., `X` or `LogOut` from lucide-react)

### 3. Optional Enhancement (`lib/services/mcpOAuthProvider.ts`)

- Consider updating `clearAuthData()` to also remove `tokens_stored_at` timestamp (line 177-180)
- This ensures complete cleanup of all OAuth-related data

## Files to Modify

1. **`components/mcp-server-manager.tsx`**

- Add `clearOAuth` function after `authorizeOAuth` function (around line 514)
- Update OAuth status UI section to include "Clear Auth" button (around line 749-763)

2. **`lib/services/mcpOAuthProvider.ts`** (optional)

- Update `clearAuthData()` to also remove `tokens_stored_at` (line 177-180)

## UI Changes

The OAuth status section will show:

- **When authorized**: "Authorized" status with CheckCircle icon + "Clear Auth" button
- **When not authorized**: "Not authorized" status with AlertCircle icon + "Authorize" button

## Testing Considerations

- Verify tokens are removed from localStorage after clicking "Clear Auth"
- Verify OAuth status updates immediately after clearing
- Verify toast notification appears
- Verify "Authorize" button appears after clearing
- Test with multiple servers to ensure only the selected server's tokens are cleared