# SuperMemory MCP Server Troubleshooting

## Test Results

The test script confirms:
- ✅ **Server is reachable** (200 OK)
- ✅ **OAuth discovery works** - Found OAuth metadata successfully
- ❌ **MCP connection requires authentication** (HTTP 401)

## OAuth Configuration

SuperMemory MCP server provides:
- **Registration endpoint**: `https://api.supermemory.ai/api/auth/mcp/register`
- **Authorization endpoint**: `https://api.supermemory.ai/api/auth/mcp/authorize`
- **Token endpoint**: `https://api.supermemory.ai/api/auth/mcp/token`
- **Supported scopes**: `openid`, `profile`, `email`, `offline_access`
- **PKCE support**: Yes (S256)

## "Failed to Fetch" Error Diagnosis

The "failed to fetch" error when clicking AUTH in ChatLima is likely occurring during one of these OAuth flow steps:

### Step 1: Client Registration
The MCP SDK automatically registers the OAuth client at:
```
POST https://api.supermemory.ai/api/auth/mcp/register
```

**Possible issues:**
- CORS not enabled for registration endpoint
- Client registration request format incorrect
- Server rejecting the registration

**Check:** Open browser DevTools → Network tab → Look for POST request to `/api/auth/mcp/register`

### Step 2: Authorization Redirect
After registration, the SDK redirects to:
```
GET https://api.supermemory.ai/api/auth/mcp/authorize?...
```

**Possible issues:**
- Redirect URL not matching server configuration
- CORS blocking the redirect
- Authorization endpoint not accessible

**Check:** Check if browser redirects to SuperMemory authorization page

### Step 3: Token Exchange
After authorization, callback exchanges code for tokens:
```
POST https://api.supermemory.ai/api/auth/mcp/token
```

**Possible issues:**
- Code expired or invalid
- PKCE verifier mismatch
- Redirect URI mismatch

## Debugging Steps

### 1. Check Browser Console

Open DevTools (F12) and look for `[MCP OAuth]` log messages:

```
[MCP OAuth] Starting OAuth flow for server: https://api.supermemory.ai/mcp
[MCP OAuth] Redirect URL: http://localhost:3000/oauth/callback
[MCP OAuth] Client metadata: {...}
[MCP OAuth] No existing client info, will register client
[MCP OAuth] Auth function returned: REDIRECT
[MCP OAuth] redirectToAuthorization called with URL: ...
```

### 2. Check Network Tab

Look for these requests in order:

1. **Client Registration** (if needed):
   - Method: POST
   - URL: `https://api.supermemory.ai/api/auth/mcp/register`
   - Status: Should be 201 Created or 200 OK

2. **Authorization Redirect**:
   - Method: GET (browser navigation)
   - URL: `https://api.supermemory.ai/api/auth/mcp/authorize?...`
   - Status: Should redirect to SuperMemory login

3. **Token Exchange** (in callback):
   - Method: POST
   - URL: `https://api.supermemory.ai/api/auth/mcp/token`
   - Status: Should be 200 OK

### 3. Check for CORS Errors

Look for CORS-related errors in console:
```
Access to fetch at '...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:** Contact SuperMemory support to enable CORS for:
- `http://localhost:3000` (development)
- Your production domain (production)

### 4. Verify Redirect URI

The redirect URI must match exactly what's registered. Check:
- Current redirect: `http://localhost:3000/oauth/callback` (dev) or `https://yourdomain.com/oauth/callback` (prod)
- Server expects: Should match exactly (including protocol, domain, path)

## Code Changes Made

### 1. Enhanced Logging
- Added detailed `[MCP OAuth]` console logs throughout the OAuth flow
- Logs show each step: registration, authorization, token exchange

### 2. Updated OAuth Scopes
Changed from `'read write'` to standard OAuth scopes:
```typescript
scope: 'openid profile email offline_access'
```

This matches SuperMemory's supported scopes.

### 3. Better Error Messages
Improved error handling to show specific error types:
- CORS errors
- Network errors
- Authentication failures
- Endpoint not found

## Testing the OAuth Flow

### Option 1: Use the Test Page (Recommended)

We've created a dedicated test page to debug OAuth issues:

1. **Start your dev server**: `pnpm dev`
2. **Navigate to**: `http://localhost:3000/test-mcp-oauth`
3. **Enter the server URL**: `https://api.supermemory.ai/mcp`
4. **Click "Test OAuth Flow"**
5. **Watch the logs** to see each step
6. **Check Network tab** for HTTP requests

This page will show you:
- Client registration attempt
- PKCE generation
- Authorization URL construction
- Any errors that occur

### Option 2: Test in ChatLima UI

1. **Open ChatLima** and go to Settings → MCP Servers
2. **Add SuperMemory server** with OAuth enabled
3. **Click "Authorize"**
4. **Open DevTools** (F12) → Console tab
5. **Look for `[MCP OAuth]` messages**
6. **Check Network tab** for failed requests

## Next Steps

1. **Try the OAuth flow again** with enhanced logging enabled
2. **Use the test page** (`/test-mcp-oauth`) for detailed debugging
3. **Check browser console** for `[MCP OAuth]` messages
4. **Check Network tab** to see which request fails
5. **Share the error details** if it still fails

## Expected Flow

1. User clicks "Authorize" in MCP Server Manager
2. Console shows: `[MCP OAuth] Starting OAuth flow...`
3. If no client registered: `[MCP OAuth] No existing client info, will register client`
4. Browser makes POST to registration endpoint
5. Console shows: `[MCP OAuth] Auth function returned: REDIRECT`
6. Console shows: `[MCP OAuth] redirectToAuthorization called with URL: ...`
7. Browser redirects to SuperMemory authorization page
8. User logs in and authorizes
9. Browser redirects back to `/oauth/callback?code=...`
10. Callback exchanges code for tokens
11. Tokens saved to localStorage
12. User redirected back to chat

## Common Issues

### Issue: "Failed to fetch" immediately
**Cause:** CORS blocking client registration
**Solution:** Contact SuperMemory to enable CORS for registration endpoint

### Issue: Redirect doesn't happen
**Cause:** Most likely client registration failed before redirect
**Symptoms:**
- No redirect happens when clicking "Authorize"
- Console shows `[MCP OAuth] Auth function threw error`
- Network tab shows failed POST to `/api/auth/mcp/register`

**Solution:** 
1. Check Network tab for the registration request
2. If it's a CORS error, contact SuperMemory to enable CORS
3. If it's a 400/401 error, check the request payload format
4. Use the test page (`/test-mcp-oauth`) to see detailed logs

### Issue: Callback fails with "Client information not found"
**Cause:** Client registration didn't complete or localStorage cleared
**Solution:** Try authorizing again - client will be re-registered

### Issue: Token exchange fails
**Cause:** Code expired, PKCE mismatch, or redirect URI mismatch
**Solution:** Check that redirect URI matches exactly, try again

## Testing

Run the test script to verify server connectivity:
```bash
pnpm test:mcp https://api.supermemory.ai/mcp --oauth
```

This will show:
- ✅ Server reachability
- ✅ OAuth endpoint discovery
- ❌ MCP connection (expected to fail without auth)

The MCP connection test will fail with 401 until OAuth tokens are obtained through the browser flow.
