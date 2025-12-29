# Feature: Programmatic SEO for Model Pages

## 🎯 Overview
Implement comprehensive programmatic SEO strategy creating 300+ dynamic pages for AI models, following Poe.com's successful approach. This will drive organic traffic through long-tail keyword targeting like "chat with GPT-4o free" and establish ChatLima as an authority in the AI model space.

## 📋 Requirements
- [ ] Create slug utilities for model ID conversion
- [ ] Implement dynamic model page at `/model/[slug]`
- [ ] Build models listing page at `/models`
- [ ] Create comparison pages at `/compare/[slug]`
- [ ] Update sitemap to include all model pages
- [ ] Update robots.txt to allow model page crawling
- [ ] Add structured data (JSON-LD) for SEO
- [ ] Pre-render top 100 models at build time
- [ ] Use ISR (1-hour revalidation) for all model pages
- [ ] Implement premium/free user gating logic
- [ ] Add internal linking between model pages
- [ ] Pre-build top 20 model comparisons

## 🏗️ Implementation Plan

### Phase 1: Core Infrastructure
1. **Slug Utilities**: Create `lib/models/slug-utils.ts` for ID↔slug conversion
2. **Model Selection**: Implement logic to identify top 100 models for pre-rendering
3. **Pre-built Comparisons**: Define top 20 model comparison pairs

### Phase 2: Page Implementation
1. **Model Page**: Create `app/model/[slug]/page.tsx` with:
   - generateStaticParams() for top 100 models
   - Dynamic metadata generation
   - Model hero section with CTA
   - Key specs (context, pricing, capabilities)
   - Full description and use cases
   - Sample prompts (3-5)
   - Related models section
   - Premium/free user appropriate CTAs
   - Internal links to comparisons

2. **Models Listing Page**: Create `app/models/page.tsx` with:
   - Hero section
   - Search and filtering
   - Featured models grid
   - Alphabetical model list by provider
   - SEO content
   - Internal links to all model pages

3. **Comparison Pages**: Create `app/compare/[slug]/page.tsx` with:
   - Pre-built top 20 comparisons
   - Dynamic comparison table
   - Side-by-side model details
   - Feature comparisons
   - CTAs for both models

### Phase 3: SEO Enhancements
1. **Metadata**: Implement dynamic titles and descriptions per page
2. **Structured Data**: Add JSON-LD SoftwareApplication schema
3. **Internal Linking**: Link related models, comparisons, and listing page
4. **Sitemap**: Update to include all model and comparison URLs
5. **Robots.txt**: Allow crawling of /model/, /models/, /compare/

### Phase 4: User Experience
1. **Premium Detection**: Show upgrade CTAs for free users on premium pages
2. **Free Model Highlighting**: Emphasize free model availability
3. **Anonymous Restrictions**: Enforce :free model access only
4. **Mobile Responsive**: Ensure all pages work well on mobile

### Phase 5: Testing & Validation
1. **SEO Testing**: Validate structured data, metadata, sitemaps
2. **User Testing**: Test free user, premium user, and anonymous flows
3. **Performance Testing**: Check build times, Lighthouse scores
4. **Functionality Testing**: Verify "Start Chat" works correctly

## 📁 Files to Modify/Create

### New Files:
```
lib/models/slug-utils.ts                    # Slug generation utilities
app/model/[slug]/page.tsx                  # Main model pages
app/model/[slug]/loading.tsx                # Loading state
app/models/page.tsx                         # Models listing
app/compare/page.tsx                        # Comparison index
app/compare/[slug]/page.tsx                # Individual comparisons
components/model-page/                      # Reusable components
  ├── model-hero.tsx
  ├── model-specs.tsx
  ├── model-description.tsx
  ├── model-prompts.tsx
  ├── model-related.tsx
  ├── model-premium-banner.tsx
  └── model-comparison-links.tsx
components/models-listing/
  ├── models-grid.tsx
  ├── model-card.tsx
  └── models-filter.tsx
components/comparison/
  ├── comparison-table.tsx
  ├── comparison-cards.tsx
  └── comparison-selector.tsx
```

### Modified Files:
```
app/sitemap.xml/route.ts                    # Add dynamic model/comparison URLs
app/robots.txt/route.ts                    # Allow new routes
app/layout.tsx                              # Update navigation (optional)
```

## 🧪 Testing Strategy
- **Unit Tests**: Slug utility functions, model selection logic
- **Integration Tests**: API model fetching, page generation
- **E2E Tests**: Model page navigation, chat initiation, comparison viewing
- **SEO Tests**: Google Rich Results Test, schema validation, sitemap validation
- **Performance Tests**: Build time, FCP, Lighthouse scores

## 📊 Success Metrics
- **300+ pages indexed** within 2-4 weeks
- **Long-tail keyword rankings** for 100+ terms
- **Organic traffic increase**: 5,000-15,000 visits/month by month 6
- **Premium upgrades**: Track conversion from model page CTAs
- **Domain authority**: Improve through internal linking structure

## 📝 Notes

### Model Selection Criteria for Pre-rendering:
1. Premium flagship models (GPT-5 Pro, Claude 4, Gemini 3 Pro)
2. Popular mid-tier models (GPT-5 Chat, Claude 3.5, Devstral)
3. Free/open-source models (Olmo, MiMo, Nemotron)
4. Models with unique capabilities (Vision, Reasoning, Coding)

### URL Structure:
- Pattern: `/model/[provider]-[model-name]`
- Examples:
  - `/model/openai-gpt-5-pro`
  - `/model/anthropic-claude-3-5-sonnet`
  - `/model/openrouter-xiaomi-mimo-v2-flash-free`

### Pre-built Comparison Pairs (Top 20):
1. GPT-5 Pro vs Claude 4
2. GPT-5 Pro vs Gemini 3 Pro
3. Claude 4 vs Gemini 3 Pro
4. GPT-5 Chat vs Claude 3.5
5. Devstral vs Olmo 3.1
6. + 15 more based on provider and capability pairs

### Premium Detection Logic:
- Anonymous users: Only show `:free` models with working "Start Chat"
- Free users without credits: Show premium pages with upgrade CTA
- Users with credits: Full access to all models
- Yearly subscribers: Access to all free models, not premium

### Build Strategy:
- Pre-render top 100 models at build time
- ISR with 1-hour revalidation for rest
- Monitor build times; adjust pre-render count if needed

## 🚨 Important Considerations
- **Build Time Impact**: Pre-rendering 100 pages may increase build time
- **Stale Data**: 1-hour ISR ensures fresh model availability
- **Index Bloat**: Use noindex for deprecated models
- **Free User UX**: Don't gate content unnecessarily, only "Start Chat" button
- **Anonymous Users**: Strict enforcement of `:free` model access only

## 🔗 Dependencies
- Existing `/api/models` endpoint for model data
- Existing authentication and credit system
- Existing presets for sample prompts
- Better Auth for user status detection
- Drizzle database (no changes needed)

## 📅 Timeline
- **Week 1**: Infrastructure (slug utils, model selection) + model pages
- **Week 2**: Models listing + comparison pages
- **Week 3**: SEO enhancements (metadata, schema, sitemap)
- **Week 4**: Testing + deployment + monitoring

## 🔄 Integration with Release Workflow
This feature will be released using [feature-release-workflow.mdc](../.cursor/rules/feature-release-workflow.mdc):

1. Complete all requirements
2. Thorough testing (development and preview)
3. Update documentation
4. Create pull request
5. Follow release workflow for deployment
