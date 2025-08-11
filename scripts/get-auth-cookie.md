# How to Get Your Authentication Cookie

## Method 1: Using Browser DevTools

1. **Open your app** in the browser: http://localhost:3000
2. **Sign in as admin** (make sure you have admin privileges)
3. **Open Developer Tools**:
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Opt+I` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Opt+I` (Mac)
4. **Go to Application/Storage tab**:
   - Chrome/Edge: Click "Application" tab → "Storage" → "Cookies" → "http://localhost:3000"
   - Firefox: Click "Storage" tab → "Cookies" → "http://localhost:3000"
5. **Find the session cookie**:
   - Look for a cookie named exactly `better-auth.session_token`
   - This is the specific cookie name used by Better Auth in your project
6. **Copy the cookie**:
   - Right-click on the cookie → "Copy" or manually select and copy the **Value** field
   - The value will be a long string like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Method 2: Copy Full Cookie Header

Instead of just the value, you can copy the full cookie header:
1. In DevTools, go to **Network** tab
2. Make any request to your app (like refresh the page)
3. Click on any request to your domain
4. In the **Request Headers** section, find the `Cookie:` header
5. Copy the entire cookie header value (it might contain multiple cookies)

## Method 3: Use the Cookie in Tests

Once you have the cookie value:

### Option A: Create a file
```bash
echo "your-cookie-value-here" > .auth-cookie
```

### Option B: Set environment variable
```bash
export TEST_AUTH_COOKIE="your-cookie-value-here"
```

### Option C: Add to .env.local
```bash
echo "TEST_AUTH_COOKIE=your-cookie-value-here" >> .env.local
```

## Example Cookie Formats

**Just the session token value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Full cookie header (with name):**
```
better-auth.session_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Note:** The test script automatically handles both formats - you can provide just the token value or the full `name=value` format.

## Security Note

⚠️ **Keep your session cookie private!** 
- Don't commit it to version control
- The `.auth-cookie` file is gitignored for security
- Session cookies give full access to your account

## Troubleshooting

- **Cookie not found?** Make sure you're signed in and have admin privileges
- **Still getting 401?** Try copying the full cookie header including the cookie name
- **Cookie expired?** Sign out and sign back in to get a fresh cookie
