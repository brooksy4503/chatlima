# MCP OAuth Redirect Debugging Guide

## Problem
When clicking "Authorize" for SuperMemory MCP server, the browser redirects to ChatLima's `/oauth/callback` endpoint instead of SuperMemory's authorization page.

## Expected Flow
1. User clicks "Authorize"
2. MCP SDK registers OAuth client (if needed)
3. MCP SDK calls `redirectToAuthorization()` with SuperMemory's authorization URL
4. Browser navigates to SuperMemory's authorization page
5. User authorizes on SuperMemory
6. SuperMemory redirects back to ChatLima's `/oauth/callback` with a code
7. ChatLima exchanges code for tokens

## What's Happening
The flow is jumping from step 2 directly to step 6, skipping steps 3-5. This means:
- Either `redirectToAuthorization()` is not being called
- Or `redirectToAuthorization()` is being called with ChatLima's callback URL instead of SuperMemory's authorization URL

## Debugging Steps

### Step 1: Check Console Logs

Open browser DevTools (F12) → Console tab and look for these logs in order:

```
[MCP OAuth] Starting OAuth flow for server: https://api.supermemory.ai/mcp
[MCP OAuth] Redirect URL: http://localhost:3000/oauth/callback
[MCP OAuth] Client metadata: {...}
[MCP OAuth] No existing client info, will register client
[MCP OAuth] Calling MCP SDK auth() function...
[MCP OAuth] Auth function returned: REDIRECT
[MCP OAuth] ===== redirectToAuthorization CALLED =====
[MCP OAuth] Authorization URL: https://api.supermemory.ai/api/auth/mcp/authorize?...
[MCP OAuth] About to redirect browser to: ...
```

**What to check:**
- ✅ Do you see `redirectToAuthorization CALLED`? 
  - **YES**: Check what URL it shows
  - **NO**: The MCP SDK is not calling `redirectToAuthorization()` - this is an SDK bug

- ✅ If `redirectToAuthorization` was called, what URL does it show?
  - Should be: `https://api.supermemory.ai/api/auth/mcp/authorize?...`
  - If it's: `http://localhost:3000/oauth/callback` → Wrong URL being passed
  - If it's something else → Check what it is

### Step 2: Check Network Tab

Open DevTools → Network tab and look for:

1. **Client Registration** (if needed):
   - Method: POST
   - URL: `https://api.supermemory.ai/api/auth/mcp/register`
   - Status: Should be 200/201
   - **If this fails with CORS**: That's the problem - registration is blocked

2. **Authorization Redirect**:
   - Type: Document (navigation)
   - URL: Should be `https://api.supermemory.ai/api/auth/mcp/authorize?...`
   - **If you don't see this**: `redirectToAuthorization` was not called or didn't redirect

3. **Callback** (should NOT happen yet):
   - If you see `/oauth/callback` without going through SuperMemory first, something is wrong

### Step 3: Use the Test Page

Navigate to `http://localhost:3000/test-mcp-oauth`:

1. Enter server URL: `https://api.supermemory.ai/mcp`
2. Enter server ID: `test-supermemory`
3. Click "Test OAuth Flow"
4. Watch the logs - they will show exactly what happens
5. Check if `redirectToAuthorization` is called and with what URL

### Step 4: Check for Existing OAuth State

Sometimes old OAuth state can cause issues:

1. Open DevTools → Application tab → Local Storage
2. Look for keys starting with `mcp_oauth_test-supermemory_`
3. Clear them if they exist
4. Try again

## Common Issues

### Issue 1: redirectToAuthorization Not Called

**Symptoms:**
- Console shows `Auth function returned: REDIRECT`
- But NO `redirectToAuthorization CALLED` log
- Browser redirects to `/oauth/callback` anyway

**Possible Causes:**
- MCP SDK bug - it's supposed to call `redirectToAuthorization` but doesn't
- Some other code is triggering a redirect
- Browser is auto-navigating based on URL parameters

**Solution:**
- Check if there's any other OAuth code running
- Check if URL has `code` parameter that's triggering callback
- Report as MCP SDK bug if confirmed

### Issue 2: redirectToAuthorization Called with Wrong URL

**Symptoms:**
- Console shows `redirectToAuthorization CALLED`
- But URL is `http://localhost:3000/oauth/callback` instead of SuperMemory's authorization URL

**Possible Causes:**
- MCP SDK is constructing authorization URL incorrectly
- OAuth endpoint discovery is returning wrong endpoints
- Some configuration issue

**Solution:**
- Check what `discoverOAuthEndpoints()` returns
- Verify the authorization endpoint in OAuth metadata
- Check if MCP SDK is using the correct endpoint

### Issue 3: CORS Blocking Client Registration

**Symptoms:**
- Network tab shows failed POST to `/api/auth/mcp/register`
- CORS error in console
- `auth()` function throws error before redirect

**Solution:**
- Contact SuperMemory to enable CORS for registration endpoint
- Or use a proxy/server-side registration

## What to Report

If the issue persists, collect this information:

1. **Console logs**: Copy all `[MCP OAuth]` logs
2. **Network tab**: Screenshot of failed requests
3. **Test page output**: What the test page shows
4. **MCP SDK version**: Check `package.json` for `@modelcontextprotocol/sdk` version
5. **Browser**: Which browser and version

## Quick Test

Run this in browser console after clicking "Authorize":

```javascript
// Check if redirectToAuthorization was called
console.log('Checking localStorage for OAuth state...');
Object.keys(localStorage).filter(k => k.includes('mcp_oauth')).forEach(k => {
    console.log(k, localStorage.getItem(k));
});

// Check sessionStorage
console.log('Checking sessionStorage...');
console.log('mcp_oauth_server_id:', sessionStorage.getItem('mcp_oauth_server_id'));
console.log('mcp_oauth_server_url:', sessionStorage.getItem('mcp_oauth_server_url'));
```

This will show if OAuth state was set (which happens in `redirectToAuthorization`).
