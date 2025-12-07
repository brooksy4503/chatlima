# Build Project and Fix Errors

Builds the ChatLima project with error checking and automatic fixes where possible.

## Command

```bash
# Step 1: Clear cache to avoid stale build artifacts
pnpm cache:clear

# Step 2: Run TypeScript type checking
npx tsc --noEmit

# Step 3: Run ESLint to check for linting errors
pnpm lint

# Step 4: Build the project
pnpm build
```

## One-Line Command

```bash
pnpm cache:clear && npx tsc --noEmit && pnpm lint && pnpm build
```

## What This Does

1. **Cache Clear**: Removes `.next` cache directory to ensure fresh build
2. **Type Checking**: Runs TypeScript compiler to catch type errors before build
3. **Linting**: Runs ESLint to catch code quality issues
4. **Build**: Compiles the Next.js application with Turbopack

## Common Build Errors and Fixes

### TypeScript Errors

**Error: Cannot find module or type**
- Check import paths use `@/` alias correctly
- Verify file extensions are correct (`.ts`, `.tsx`)
- Ensure dependencies are installed: `pnpm install`

**Error: Type 'X' is not assignable to type 'Y'**
- Review type definitions in the file
- Check if props/interfaces match expected types
- Use type assertions carefully: `as Type` or type guards

**Error: Property 'X' does not exist on type 'Y'**
- Check if the property exists in the type definition
- Verify imports are correct
- Check for optional chaining: `obj?.property`

### ESLint Errors

**Error: Unused variables**
- Remove unused imports/variables
- Prefix with underscore if intentionally unused: `_unusedVar`
- Note: `@typescript-eslint/no-unused-vars` is disabled in config

**Error: React Hook dependencies**
- Add missing dependencies to dependency arrays
- Use `eslint-disable-next-line` if intentional

### Next.js Build Errors

**Error: Module not found**
- Check file paths are correct
- Verify all dependencies in `package.json`
- Run `pnpm install` to ensure dependencies are installed

**Error: Hydration mismatch**
- Check for differences between server and client rendering
- Ensure no browser-only APIs in server components
- Verify `use client` directive is used correctly

**Error: Image optimization**
- Check `next.config.ts` for remote image patterns
- Verify image URLs are in allowed domains

## Build Configuration

The build uses:
- **Turbopack**: Faster builds with `--turbopack` flag
- **TypeScript**: Strict mode enabled, errors block builds
- **ESLint**: Errors block builds (configured in `next.config.ts`)

## Troubleshooting

### Build Fails with Type Errors

1. Run type check separately: `npx tsc --noEmit`
2. Fix reported errors one by one
3. Check `tsconfig.json` for path aliases
4. Verify all imports are correct

### Build Fails with Lint Errors

1. Run lint separately: `pnpm lint`
2. Auto-fix where possible: `pnpm lint --fix`
3. Review ESLint config in `eslint.config.mjs`
4. Fix remaining errors manually

### Build is Slow

1. Clear cache: `pnpm cache:clear`
2. Check for large dependencies
3. Consider incremental builds (already enabled)
4. Review bundle size with `next build --debug`

### Build Succeeds but App Doesn't Work

1. Check runtime errors in browser console
2. Verify environment variables are set
3. Check database connection
4. Review server logs

## Alternative Commands

```bash
# Build without cache clear (faster, but may have stale artifacts)
pnpm build

# Type check only
npx tsc --noEmit

# Lint only
pnpm lint

# Lint with auto-fix
pnpm lint --fix

# Build with debug output
pnpm build --debug
```

## Environment Variables

Ensure required environment variables are set in `.env.local`:
- Database connection strings
- API keys for AI providers
- Authentication secrets
- Other service credentials

## Next Steps After Build

1. Test the production build: `pnpm start`
2. Run tests: `pnpm test`
3. Check bundle size and optimize if needed
4. Deploy to staging/production
