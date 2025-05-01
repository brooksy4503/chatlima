# Implementation Plan: Adding OpenRouter Web Search Feature

## Overview
Add web search capabilities to the chat application using OpenRouter's web search feature, allowing the AI to ground responses in real-time web data.

## 1. API Integration Updates

### 1.1 OpenRouter Client Enhancement
- Update OpenRouter client configuration in `ai/providers.ts` to include web search options:
  ```typescript
  const openrouterClient = createOpenRouter({
    apiKey: getApiKey('OPENROUTER_API_KEY'),
    headers: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
      'X-Title': process.env.NEXT_PUBLIC_APP_TITLE,
    },
    plugins: [{ id: "web" }] // Add web search plugin
  });
  ```

### 1.2 API Client Updates
- Create new types for web search options and annotations
- Update API request structure to include web search parameters
- Add support for handling URL citations in responses

## 2. Database Schema Updates

### 2.1 Message Table Updates
- Add columns for storing web search metadata:
  - `has_web_search`: boolean
  - `web_search_context_size`: enum ('low', 'medium', 'high')
  - `citations`: jsonb array for storing URL citations

### 2.2 Chat Settings
- Add web search preferences to chat settings:
  - Default search context size
  - Maximum results per query
  - Enable/disable web search

## 3. Backend Implementation

### 3.1 API Route Updates
Location: `app/api/chat/route.ts`
- Add web search options to request processing
- Implement citation handling
- Add error handling for web search-specific cases

### 3.2 Chat Processing
- Update chat processing logic to:
  - Include web search parameters
  - Process and store citations
  - Handle pricing implications

## 4. Frontend Implementation

### 4.1 Chat Interface Updates
- Add UI components to existing chat interface:
  - Web search toggle in message input area
  - Search context size selector in settings
  - Citation display in message bubbles
- Style citations with proper linking

### 4.2 Settings Panel
- Extend existing API Key Manager with web search options:
  - Default search behavior
  - Context size preferences
  - Citation display preferences

### 4.3 Message Display
- Update existing message components to handle citations:
  - Add citation component with hover states
  - Implement citation highlighting
  - Add citation count badges

## 5. User Experience

### 5.1 Visual Feedback
- Add loading states for web searches
- Display search context size indicator
- Show citation count badges

### 5.2 Error Handling
- Implement user-friendly error messages for:
  - API rate limits
  - Search context size limits
  - Citation processing errors

## 6. Testing

### 6.1 Unit Tests
- Test web search parameter validation
- Test citation processing
- Test database operations

### 6.2 Integration Tests
- Test complete chat flow with web search
- Test error scenarios
- Test citation display and linking

### 6.3 E2E Tests
- Test full user journey with web search
- Test settings configuration
- Test citation interaction

## 7. Documentation

### 7.1 Code Documentation
- Add JSDoc comments for new functions
- Document web search configuration options
- Document citation handling

### 7.2 User Documentation
- Create user guide for web search features
- Document pricing implications
- Provide best practices

## 8. Deployment

### 8.1 Migration Plan
- Create database migrations
- Plan staged rollout
- Configure monitoring

### 8.2 Monitoring
- Add metrics for:
  - Web search usage
  - Citation clicks
  - Error rates
  - Response times

## Timeline Estimate
1. API Integration Updates: 1 day
2. Database Updates: 1 day
3. Backend Implementation: 2 days
4. Frontend Implementation: 3 days
5. Testing: 2 days
6. Documentation: 1 day
7. Deployment: 1 day

Total: ~11 working days

## Dependencies
- Existing OpenRouter integration (✓ Already implemented)
- Database migration permissions
- Frontend UI component library (✓ Already using shadcn/ui)

## Risks and Mitigation
1. Cost Management
   - Implement usage limits
   - Add cost monitoring
   - Create alert thresholds

2. Performance
   - Cache common searches
   - Optimize citation storage
   - Implement lazy loading

3. Rate Limiting
   - Add request queuing
   - Implement backoff strategy
   - Monitor usage patterns

## Success Metrics
1. User Engagement
   - Web search usage rate
   - Citation click-through rate
   - User feedback scores

2. Performance
   - Response time with web search
   - Error rate
   - Search relevance scores

3. Business Impact
   - Cost per chat
   - User retention
   - Feature adoption rate 