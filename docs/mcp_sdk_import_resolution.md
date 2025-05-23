# Resolving `@modelcontextprotocol/sdk` Import and Configuration Issues

This document outlines the challenges faced when integrating `StreamableHTTPClientTransport` from `@modelcontextprotocol/sdk` version `1.12.0` in the Next.js application and the steps taken to resolve them.

## Problem Summary

The primary issue was a persistent TypeScript/ESLint error:
`"Cannot find module '@modelcontextprotocol/sdk/client/streamableHttp' or its corresponding type declarations."`

This error occurred in `app/api/chat/route.ts` despite several checks confirming:
1.  The package `@modelcontextprotocol/sdk@1.12.0` was correctly installed.
2.  The necessary files (`streamableHttp.js` and `streamableHttp.d.ts`) existed at the expected path within `node_modules` (`node_modules/@modelcontextprotocol/sdk/dist/esm/client/`).
3.  The `package.json` of `@modelcontextprotocol/sdk` had a correct `exports` map pointing to the `dist/esm/` directory.
4.  The project's `tsconfig.json` was correctly configured with `"moduleResolution": "bundler"`, which should handle `exports` maps.
5.  Restarting the IDE (Cursor) did not clear the error.

A secondary issue arose after an initial fix for the import resolution:
`"Object literal may only specify known properties, and 'headers' does not exist in type 'StreamableHTTPClientTransportOptions'."`

This indicated that the options being passed to the `StreamableHTTPClientTransport` constructor were incorrect for version `1.12.0` of the SDK.

## Investigation and Verification Steps

1.  **Package Installation:** Verified `@modelcontextprotocol/sdk` was installed using `pnpm install`.
2.  **File Existence:**
    *   Confirmed `node_modules/@modelcontextprotocol/sdk/dist/esm/client/streamableHttp.js` and `streamableHttp.d.ts` existed.
    *   Confirmed `node_modules/@modelcontextprotocol/sdk/client/` *did not* exist, leading to checking the `dist/` folder.
3.  **`package.json` Exports:** Examined `node_modules/@modelcontextprotocol/sdk/package.json` to confirm its `exports` field correctly mapped `./client/streamableHttp` to `./dist/esm/client/streamableHttp`.
4.  **Type Definitions:** Read `streamableHttp.d.ts` to confirm that `StreamableHTTPClientTransport` was indeed exported and to check its `StreamableHTTPClientTransportOptions` definition.
5.  **`tsconfig.json` Review:** Checked the project's `tsconfig.json` for any conflicting settings, particularly `moduleResolution`, `baseUrl`, and `paths`. Found it to be correctly configured with `"moduleResolution": "bundler"`.

## Resolution Steps

### 1. Fixing the Import Resolution Error

Despite all verifications suggesting the import path was correct, the resolution error persisted. The following change was applied to `app/api/chat/route.ts`:

**Original Import:**
```typescript
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp';
```

**Modified Import (Explicit `.js` extension):**
```typescript
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
```

**Reasoning:** Explicitly adding the `.js` extension can sometimes help TypeScript/ESLint (especially with `moduleResolution: "bundler"` or `"nodenext"`) bypass stubborn caching or resolve ambiguities in module resolution, forcing it to pick up the JavaScript file and its adjacent type definition. While the exact cause of the initial resolution failure remains elusive (likely a deep-seated cache or tooling quirk), this change successfully resolved the "Cannot find module" error.

### 2. Fixing the `StreamableHTTPClientTransportOptions` Error

After the import was resolved, the linter flagged an issue with how `StreamableHTTPClientTransport` was being instantiated:
```typescript
// In app/api/chat/route.ts, around line 248
finalTransportForClient = new StreamableHTTPClientTransport(transportUrl, {
  headers: Object.keys(headers).length > 0 ? headers : undefined
});
```
The type definition for `StreamableHTTPClientTransportOptions` in `@modelcontextprotocol/sdk@1.12.0` revealed that `headers` is not a direct property. Instead, it should be nested within the `requestInit` property (which is of type `RequestInit` from Fetch API standards).

**Corrected Instantiation:**
```typescript
// In app/api/chat/route.ts
finalTransportForClient = new StreamableHTTPClientTransport(transportUrl, {
  requestInit: { 
    headers: Object.keys(headers).length > 0 ? headers : undefined
  }
});
```
This change aligns the constructor options with the SDK's type definition for version `1.12.0`, resolving the linter error.

## Conclusion

The combination of explicitly adding the `.js` extension to the import path and correcting the constructor options for `StreamableHTTPClientTransport` allowed for the successful integration of `@modelcontextprotocol/sdk@1.12.0` for handling streamable HTTP MCP servers. The root cause for the initial import resolution failure is suspected to be a stubborn caching or module resolution issue within the development environment that was bypassed by the explicit file extension. 