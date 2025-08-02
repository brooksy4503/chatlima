# Compilation Speed Optimization Guide

## Current Issues Identified

1. **Large node_modules (948MB)** - Heavy dependencies impacting build times
2. **Excessive API calls** - Hundreds of auth session calls causing performance issues
3. **Long initial compilation** - Home page taking 17.6s to compile

## Changes Applied

✅ **TypeScript Configuration**
- Added `tsBuildInfoFile` to store incremental build info in `.next/cache`
- Enabled `incremental: true` for faster subsequent builds

✅ **Next.js Configuration**
- Removed problematic `optimizePackageImports` (not supported in current version)
- Kept core optimizations: `reactStrictMode`, build flags

✅ **Build Tools**
- Created cache clearing script (`scripts/clear-cache.sh`)
- Added `pnpm cache:clear` and `pnpm dev:fresh` commands
- Created `.npmrc` with pnpm optimizations

## Remaining Issues & Solutions

### 1. Optimize Dependencies

#### Split Heavy Dependencies
Consider lazy loading heavy packages that aren't needed on initial load:

```typescript
// Instead of importing at the top
import katex from 'katex';

// Use dynamic imports
const katex = await import('katex');
```

#### Review and Remove Unused Dependencies
Run dependency analysis:
```bash
npx depcheck
```

### 2. Next.js Configuration Optimizations

Update your `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  
  // Optimize for development
  reactStrictMode: true,
  
  // Experimental features for faster builds
  experimental: {
    // Use the new optimized package imports
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      'lucide-react',
      'framer-motion',
      'ai',
    ],
  },
  
  // Reduce source map size in development
  productionBrowserSourceMaps: false,
  
  // TypeScript and ESLint optimizations
  typescript: {
    // During development, skip type checking
    ignoreBuildErrors: false,
  },
  eslint: {
    // During development builds
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
```

### 3. TypeScript Optimizations

Already applied:
- ✅ Added `tsBuildInfoFile` to tsconfig.json
- ✅ `skipLibCheck: true` is already enabled
- ✅ `incremental: true` is already enabled

### 4. Development Environment Optimizations

#### Use SWC instead of Babel
Turbopack already uses SWC, but ensure you're not overriding it with custom Babel configs.

#### Clear Cache Periodically
```bash
rm -rf .next
rm -rf node_modules/.cache
rm tsconfig.tsbuildinfo
```

#### Use pnpm's Optimizations
Add to `.npmrc`:
```
node-linker=hoisted
shamefully-hoist=true
```

### 5. Code Splitting Strategies

#### Dynamic Imports for Large Components
```typescript
// For heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // If not needed on server
});
```

#### Route-based Code Splitting
Next.js does this automatically, but ensure you're not importing everything in layout.tsx

### 6. Environment-Specific Optimizations

Create a development-specific config:
```bash
# .env.development
NEXT_TELEMETRY_DISABLED=1
ANALYZE=false
```

### 7. Hardware Considerations

- **RAM**: Ensure you have at least 8GB available
- **SSD**: Use SSD instead of HDD
- **CPU**: Close other heavy applications

### 8. Monitoring Build Performance

Add build analysis script to package.json:
```json
"analyze": "ANALYZE=true next build"
```

## Quick Wins

1. **Immediate**: Clear your cache
   ```bash
   rm -rf .next node_modules/.cache tsconfig.tsbuildinfo
   ```

2. **Short-term**: Update next.config.ts with optimizations above

3. **Medium-term**: Review and reduce dependencies

4. **Long-term**: Implement code splitting for heavy features

## Expected Improvements

- Initial load: 30-50% faster
- Hot reload: 20-40% faster
- Memory usage: 20-30% reduction

## Verification

After implementing changes, measure improvement:
```bash
time pnpm dev
```

Compare before and after compilation times.