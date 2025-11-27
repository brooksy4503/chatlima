<!-- 1bbc2ff8-6e81-47b9-a026-443582853ef3 47103b78-9c49-4192-a927-58332480f3b9 -->
# Replace Umami Analytics with Vercel Analytics

## Overview

Replace the Umami analytics script (line 139 in `app/layout.tsx`) with Vercel Analytics, which is the native analytics solution for Vercel-deployed Next.js applications.

## Implementation Steps

### 1. Install Vercel Analytics Package

- Add `@vercel/analytics` to `package.json` dependencies
- Run `pnpm install` to install the package

### 2. Update Root Layout (`app/layout.tsx`)

- Remove the `Script` import from `next/script` (line 6) since it's only used for Umami
- Import `Analytics` from `@vercel/analytics/react`
- Replace the Umami `<Script>` tag (line 139) with `<Analytics />` component
- Place the `<Analytics />` component inside the `<body>` tag, typically at the end before the closing tag

## Files to Modify

- `app/layout.tsx`: Remove Script import, add Analytics import, replace Umami script with Analytics component
- `package.json`: Add `@vercel/analytics` dependency

## Notes

- Vercel Analytics automatically works when deployed on Vercel - no configuration needed
- The Analytics component is lightweight and doesn't require any props or configuration
- The codefetch documentation file (`codefetch/codebase.md`) also contains a reference to Umami, but that's likely just documentation and doesn't need to be updated

### To-dos

- [ ] Install @vercel/analytics package via pnpm
- [ ] Remove Script import and add Analytics import from @vercel/analytics/react
- [ ] Replace Umami Script tag with Analytics component in layout.tsx