# ChatLima Basic UI Tests

## Overview

These are simple, reliable tests that focus on core UI functionality without external dependencies. They test the fundamental user interface elements that should always work.

## Why These Tests Are Better

### Problems with Previous Tests:
- ❌ Complex authentication flows for preview.chatlima.com
- ❌ Testing specific AI models that may not be available  
- ❌ API dependencies that can fail
- ❌ Too many assertions and edge cases
- ❌ Fragile setup and teardown

### New Simple Approach:
- ✅ Tests run on local dev server (localhost:3000)
- ✅ No authentication required
- ✅ No API calls or external dependencies
- ✅ Focus on basic UI interactions
- ✅ Fast and reliable

## Test Coverage

### 1. Page Load Test
**What it tests:** Basic interface loads correctly
- Page title is "ChatLima"
- Main heading is visible
- Message input field is present
- Model picker dropdown is present
- Send button is present

### 2. Message Input Test  
**What it tests:** Text input functionality works
- Input field starts empty
- Can type text into the field
- Text appears correctly
- Can clear the input
- Placeholder text is correct

### 3. Model Picker Test
**What it tests:** Model picker interaction works
- Model picker is visible and enabled
- Contains expected model text (with ":" pattern)
- Can be focused and interacted with
- Remains functional after interactions

## Running the Tests

### Prerequisites
1. Install dependencies: `pnpm install`
2. Install Playwright browsers: `npx playwright install`

### Run Tests
```bash
# Run all basic tests
pnpm run test:basic

# Run with UI (interactive mode)  
pnpm run test:basic:ui

# Run in debug mode
pnpm run test:basic:debug
```

### Local Development
Tests automatically start and stop the dev server (localhost:3000) as needed.

## Configuration

Tests use `playwright.basic.config.ts` which:
- Runs on localhost:3000
- Starts dev server automatically
- Uses simple retry strategy
- Generates HTML reports
- Takes screenshots only on failure

## What These Tests Don't Cover

These basic tests intentionally **do not** test:
- ❌ AI model responses
- ❌ Authentication flows
- ❌ Credit systems
- ❌ Message sending to APIs
- ❌ Complex user workflows

For those features, use integration tests or manual testing.

## When Tests Should Pass

These tests should pass if:
- ✅ The dev server starts successfully
- ✅ Basic React components render
- ✅ CSS styles load correctly
- ✅ Basic DOM interactions work

## Troubleshooting

### Dev Server Won't Start
- Check if port 3000 is already in use
- Verify `npm run dev` works manually
- Check for TypeScript compilation errors

### Tests Fail on Element Selection
- Elements might have changed - update selectors
- Check browser console for JavaScript errors
- Verify components are rendering correctly

### Slow Performance
- Tests run much faster than the old complex tests
- If still slow, check system resources
- Consider reducing browser parallelism

## Maintenance

These tests are designed to be low-maintenance:
- Minimal selectors that target core functionality
- No complex setup or teardown
- Self-contained with clear failure points
- Easy to debug with screenshots and traces

Update tests only when core UI elements change significantly. 