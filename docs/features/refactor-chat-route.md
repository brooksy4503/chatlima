# Feature: Refactor Chat Route API

## 🎯 Overview
Refactor the main chat API route (`app/api/chat/route.ts`) to improve maintainability, readability, and performance. The current file is 2,465 lines long and handles multiple responsibilities that should be separated into focused modules.

## 📋 Requirements
- [ ] Extract authentication and authorization logic into separate service
- [ ] Extract credit checking and usage limits into dedicated services
- [ ] Extract MCP server initialization into separate module
- [ ] Extract web search configuration and validation
- [ ] Extract token tracking and cost calculation logic
- [ ] Extract error handling into centralized error handler
- [ ] Extract message processing and attachment handling
- [ ] Improve code organization and reduce file size
- [ ] Maintain all existing functionality and security measures
- [ ] Ensure backward compatibility with existing API contracts

## 🏗️ Implementation Plan

### Phase 1: Service Extraction
1. **Authentication Service** (`lib/services/authService.ts`)
   - Move user session validation
   - Handle anonymous user detection
   - Extract Polar customer ID logic

2. **Credit Service** (`lib/services/creditService.ts`)
   - Move credit checking logic
   - Handle API key validation
   - Extract free model detection

3. **Usage Limits Service** (`lib/services/usageLimitsService.ts`)
   - Move daily/monthly limit checks
   - Extract message usage tracking
   - Handle usage limit enforcement

### Phase 2: Processing Modules
4. **Message Processing Service** (`lib/services/messageProcessingService.ts`)
   - Extract attachment handling
   - Move message formatting logic
   - Handle OpenRouter format conversion

5. **MCP Service** (`lib/services/mcpService.ts`)
   - Extract MCP server initialization
   - Handle different transport types (SSE, stdio, streamable-http)
   - Manage MCP client lifecycle

6. **Web Search Service** (`lib/services/webSearchService.ts`)
   - Extract web search configuration
   - Handle model compatibility checks
   - Manage search context settings

### Phase 3: Error and Tracking
7. **Error Handler Service** (`lib/services/errorHandlerService.ts`)
   - Centralize error response creation
   - Extract error parsing and formatting
   - Handle provider-specific error mapping

8. **Token Tracking Service** (already exists, but may need updates)
   - Ensure compatibility with refactored structure
   - Update to work with new service architecture

### Phase 4: Main Route Refactoring
9. **Refactor Main Route** (`app/api/chat/route.ts`)
   - Reduce to orchestration logic only
   - Use extracted services
   - Maintain clean, readable flow
   - Target: <500 lines

## 📁 Files to Modify/Create

### New Service Files:
- `lib/services/authService.ts`
- `lib/services/creditService.ts`
- `lib/services/usageLimitsService.ts`
- `lib/services/messageProcessingService.ts`
- `lib/services/mcpService.ts`
- `lib/services/webSearchService.ts`
- `lib/services/errorHandlerService.ts`

### Modified Files:
- `app/api/chat/route.ts` (major refactoring)
- `lib/services/tokenTracking.ts` (minor updates for compatibility)

### Configuration Files:
- Update imports in affected files
- Ensure proper TypeScript types
- Update any related tests

## 🧪 Testing Strategy

### Unit Tests:
- Test each extracted service independently
- Mock dependencies for isolated testing
- Test error handling scenarios
- Validate input/output transformations

### Integration Tests:
- Test service interactions
- Verify API contract compatibility
- Test end-to-end chat flow
- Validate security measures still work

### Performance Tests:
- Ensure refactoring doesn't impact response times
- Test memory usage improvements
- Validate token tracking accuracy

## 📝 Notes

### Current File Analysis:
The `app/api/chat/route.ts` file currently handles:
- Authentication and session management
- Credit checking and usage limits
- MCP server initialization and management
- Web search configuration and validation
- Message processing and attachment handling
- Token tracking and cost calculation
- Error handling and response formatting
- Stream processing and response generation

### Key Considerations:
- **Security**: All existing security measures must be preserved
- **Performance**: Refactoring should not impact response times
- **Compatibility**: API contracts must remain unchanged
- **Maintainability**: New structure should be easier to understand and modify
- **Testing**: Each service should be independently testable

### Success Metrics:
- Reduce main route file from 2,465 lines to <500 lines
- Create 7+ focused service modules
- Maintain 100% API compatibility
- Improve code testability and maintainability
- Preserve all security and performance characteristics

### Dependencies:
- Existing service architecture
- Current authentication system
- Polar integration
- Token tracking system
- MCP protocol implementation

## 🚀 Getting Started

1. Start with Phase 1 (Service Extraction)
2. Create service files with proper TypeScript interfaces
3. Move related logic from main route to services
4. Update main route to use new services
5. Test each phase thoroughly before proceeding
6. Maintain git commits for each major change

## 🔄 Integration with Release Workflow

This refactoring will be merged using the standard feature release workflow:
1. Complete all phases of refactoring
2. Ensure comprehensive testing
3. Create pull request for review
4. Merge to main when approved
5. Deploy using standard release process
