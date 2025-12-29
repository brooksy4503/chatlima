# Testing Guide: Programmatic SEO Features

This guide covers how to test the new programmatic SEO features added in the recent commits.

## New Features Overview

1. **Models Listing Page** (`/models`) - Browse and filter all available AI models
2. **Comparison Pages** (`/compare` and `/compare/[slug]`) - Compare models side-by-side
3. **Dynamic Model Pages** (`/model/[slug]`) - Individual model detail pages
4. **Enhanced SEO** - Dynamic sitemap and robots.txt generation

## Prerequisites

- Development server should be running on port 3000
- If not running, start it with: `pnpm dev`

## Testing Checklist

### 1. Models Listing Page (`/models`)

#### Basic Functionality
- [ ] Navigate to `http://localhost:3000/models`
- [ ] Verify page loads without errors
- [ ] Check that models are displayed in a grid layout
- [ ] Verify featured premium and free model sections appear
  - **Note**: Premium models now appear for all users (including free users) in featured sections for marketing purposes
  - Free users will see premium models with a lock icon and "Upgrade to Access" button
  - Premium users will see premium models without restrictions
  - See [Premium Model Display Feature](./features/premium-model-display.md) for details

#### Search Functionality
- [ ] Test search by model name (e.g., "GPT-4")
- [ ] Test search by provider (e.g., "OpenAI", "Anthropic")
- [ ] Test search by capability (e.g., "vision", "coding")
- [ ] Verify search results update in real-time
- [ ] Check that search results count is displayed correctly

#### Filter Functionality
- [ ] Test "All Models" filter (should show all models)
- [ ] Test "Free Models" filter (should only show models ending with `:free`)
- [ ] Test "Premium Models" filter (should only show premium models)
- [ ] Test "Vision" filter (should show vision-capable models)
- [ ] Test "Coding" filter (should show coding-capable models)
- [ ] Test "Reasoning" filter (should show reasoning models)
- [ ] Verify filters work in combination with search

#### UI/UX
- [ ] Check responsive design on mobile viewport
- [ ] Verify "Compare Models" button links to `/compare`
- [ ] Test "Clear Filters" button when no results found
- [ ] Verify loading spinner appears while models load
- [ ] Check that model cards display correctly with badges

#### Edge Cases
- [ ] Test with empty search term
- [ ] Test with very long search term
- [ ] Test with special characters in search
- [ ] Verify "No models found" message appears when appropriate

### 2. Comparison Pages

#### Main Comparison Page (`/compare`)
- [ ] Navigate to `http://localhost:3000/compare`
- [ ] Verify page loads without errors
- [ ] Check that popular comparison cards are displayed
- [ ] Verify each comparison card links to the correct comparison page
- [ ] Test "Browse All Models" button links to `/models`
- [ ] Check responsive design

#### Individual Comparison Pages (`/compare/[slug]`)
- [ ] Test a few popular comparisons:
  - `/compare/openai-gpt-5-pro-vs-anthropic-claude-3-5-sonnet`
  - `/compare/openai-gpt-5-pro-vs-google-gemini-3-flash-preview`
  - `/compare/anthropic-claude-3-5-sonnet-vs-google-gemini-3-flash-preview`
- [ ] Verify comparison table/cards display both models
- [ ] Check that model specifications are shown correctly
- [ ] Verify pricing information is displayed
- [ ] Check that capabilities are compared
- [ ] Test navigation back to main compare page

### 3. Dynamic Model Pages (`/model/[slug]`)

#### Test Popular Models
- [ ] Test free models:
  - `/model/openai-gpt-4o-mini-free`
  - `/model/google-gemini-2-0-flash-thinking-exp-free`
- [ ] Test premium models:
  - `/model/openai-gpt-5-pro`
  - `/model/anthropic-claude-3-5-sonnet`
  - `/model/google-gemini-2-5-pro`
- [ ] Verify page loads without errors
- [ ] Check that model hero section displays correctly
- [ ] Verify model specifications are shown
- [ ] Check model description is displayed
- [ ] Test model prompts section (if applicable)
- [ ] Verify related models section appears
- [ ] Check premium banner for premium models
- [ ] Test comparison links section

#### SEO Metadata
- [ ] Check page title in browser tab
- [ ] Verify meta description (view page source)
- [ ] Check Open Graph tags (if implemented)
- [ ] Verify structured data (if implemented)

#### Edge Cases
- [ ] Test with invalid model slug (should show 404)
- [ ] Test with non-existent model
- [ ] Verify error handling for failed model fetches

### 4. SEO Features

#### Sitemap (`/sitemap.xml`)
- [ ] Navigate to `http://localhost:3000/sitemap.xml`
- [ ] **Note**: Sitemap only works in production (chatlima.com)
- [ ] In production, verify:
  - Static pages are included (/, /models, /compare)
  - Top 100 model pages are included
  - Comparison pages are included
  - Proper XML format
  - Correct priorities and changefreq values
  - Valid lastmod dates

#### Robots.txt (`/robots.txt`)
- [ ] Navigate to `http://localhost:3000/robots.txt`
- [ ] Verify robots.txt is accessible
- [ ] Check that sitemap URL is referenced (if applicable)
- [ ] Verify proper format

### 5. Integration Testing

#### Navigation Flow
- [ ] Start at homepage → Navigate to `/models`
- [ ] From `/models` → Click a model card → Should go to `/model/[slug]`
- [ ] From `/models` → Click "Compare Models" → Should go to `/compare`
- [ ] From `/compare` → Click a comparison card → Should go to `/compare/[slug]`
- [ ] From model page → Click related model → Should navigate to that model page
- [ ] From model page → Click comparison link → Should go to comparison page

#### Cross-Page Features
- [ ] Verify consistent styling across all pages
- [ ] Check that model data is consistent across pages
- [ ] Test that filters/search state doesn't persist incorrectly
- [ ] Verify all links work correctly

### 6. Performance Testing

- [ ] Check page load times (should be reasonable)
- [ ] Verify models load efficiently (check Network tab)
- [ ] Test with slow network (throttle in DevTools)
- [ ] Check for any console errors
- [ ] Verify no memory leaks during navigation

### 7. Browser Compatibility

- [ ] Test in Chrome/Edge
- [ ] Test in Firefox
- [ ] Test in Safari (if on Mac)
- [ ] Test on mobile device or mobile emulation

## Quick Test Commands

### Start Dev Server (if not running)
```bash
# Kill existing server if needed
kill -9 $(lsof -ti:3000)

# Start fresh dev server
pnpm dev:fresh
```

### Test Specific Routes
```bash
# Test models page
open http://localhost:3000/models

# Test compare page
open http://localhost:3000/compare

# Test a specific model
open http://localhost:3000/model/openai-gpt-4o-mini-free

# Test a comparison
open http://localhost:3000/compare/openai-gpt-5-pro-vs-anthropic-claude-3-5-sonnet
```

### Run Automated Tests (if available)
```bash
# Run Playwright tests
pnpm test:local

# Run unit tests
pnpm test:unit
```

## Common Issues to Watch For

1. **Model Loading Errors**: Check console for API errors when fetching models
2. **Slug Generation**: Verify slugs are generated correctly (no special characters, proper formatting)
3. **404 Errors**: Check that invalid slugs show proper 404 pages
4. **Performance**: Watch for slow model loading or rendering
5. **Responsive Design**: Verify all pages work on mobile devices
6. **SEO**: Check that metadata is correct for search engines

## Notes

- The sitemap only generates in production (chatlima.com domain)
- Model pages use static generation for top 100 models
- Comparison pages use static generation for prebuilt comparisons
- All pages should be responsive and mobile-friendly
