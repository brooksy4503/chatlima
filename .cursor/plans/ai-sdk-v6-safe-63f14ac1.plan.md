<!-- 63f14ac1-2882-4790-a19c-1f4853cc7ad1 145d0539-de82-4ae6-a2d6-4e4001c29d52 -->
# AI SDK v6 Safe Upgrade

## Overview

Upgrade all AI SDK packages to v6 beta versions while preserving existing functionality. This is a conservative migration that focuses on package compatibility without introducing new v6 features.

## Implementation Steps

### 1. Branch Creation

- Create feature branch `feature/ai-sdk-v6-upgrade` from main
- Ensure clean working tree before starting

### 2. Package Upgrades

Update all AI SDK packages in `package.json`:

- `ai`: `^4.3.9` → `ai@beta`
- `@ai-sdk/anthropic`: `^1.2.10` → `@ai-sdk/anthropic@beta`
- `@ai-sdk/cohere`: `^1.2.9` → `@ai-sdk/cohere@beta`
- `@ai-sdk/google`: `^1.2.12` → `@ai-sdk/google@beta`
- `@ai-sdk/groq`: `^1.2.8` → `@ai-sdk/groq@beta`
- `@ai-sdk/openai`: `^1.3.16` → `@ai-sdk/openai@beta`
- `@ai-sdk/react`: `^1.2.9` → `@ai-sdk/react@beta`
- `@ai-sdk/ui-utils`: `^1.2.10` → `@ai-sdk/ui-utils@beta`
- `@ai-sdk/xai`: `^1.2.14` → `@ai-sdk/xai@beta`

### 3. Dependency Resolution

- Install dependencies with `pnpm install`
- Resolve any peer dependency conflicts
- Pin specific beta versions to avoid unexpected updates

### 4. Code Compatibility Check

Review key integration points for breaking changes:

- `app/api/chat/route.ts` - streamText usage
- `components/chat.tsx` - useChat hook
- `ai/providers.ts` - provider configurations
- All import statements across the codebase

### 5. Testing & Validation

- Run full test suite: `pnpm test`
- Manual testing of core chat functionality
- Verify MCP server integration still works
- Test web search functionality
- Validate multi-model provider support

### 6. Development Server Testing

- Start dev server: `pnpm dev`
- Test chat conversations with different models
- Verify streaming responses work correctly
- Check error handling remains intact

## Key Files to Monitor

- `package.json` - All AI SDK package versions
- `app/api/chat/route.ts` - Core chat API functionality
- `components/chat.tsx` - Frontend chat interface
- `ai/providers.ts` - Model provider configurations

## Success Criteria

- All existing tests pass
- Chat functionality works identically to before
- No regression in MCP tool integration
- Web search continues working
- All model providers respond correctly
- No console errors or warnings

## Rollback Plan

If issues arise, revert the feature branch and return to main branch with original package versions.

### To-dos

- [ ] Create feature branch 'feature/ai-sdk-v6-upgrade' from main
- [ ] Update all @ai-sdk/* packages to beta versions in package.json
- [ ] Run pnpm install and resolve any dependency conflicts
- [ ] Review key files for breaking changes and import issues
- [ ] Execute full test suite to validate compatibility
- [ ] Manual validation of chat, MCP tools, and web search functionality