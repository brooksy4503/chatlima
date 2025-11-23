<!-- b18a8dd7-4842-4ca3-b775-3ff283bdff82 d85f120e-fc31-4acf-a5e6-d94a421d0c83 -->
# Improve Upgrade Page Copy and Add FAQ

## Overview

Implement recommendations from Grok analysis to make the upgrade page more accessible to non-technical users by clarifying free model access, improving plan comparisons, adding visual elements (icons/tooltips), and creating a comprehensive FAQ page.

## Implementation Plan

### 1. Update Upgrade Page Copy (`app/upgrade/page.tsx`)

**Yearly Plan Card Improvements:**

- Replace "Unlimited access to free models" with clearer benefit-focused copy: "Unlimited chats with top free AI models (like Grok 4.1 Fast, GPT-OSS-20B, Kimi K2, DeepSeek R1 & more—no setup or extra fees needed)"
- Add subtitle under card title: "Perfect for everyday use: Brainstorm ideas, write emails, or explore with AI tools like maps & search"
- Update "Premium models" bullet from crossed-out negative to positive: "Premium models available anytime (easy upgrade to monthly for GPT-5.1, Claude Sonnet 4.5, Grok 4.1 & more)"
- Remove "All OpenRouter :free models" bullet (redundant with improved free models copy)

**Monthly Plan Card:**

- Keep existing copy but ensure consistency in tone
- Update premium models mention to reflect current models: GPT-5.1, Claude Sonnet 4.5, Grok 4.1 Fast, Gemini 3 Pro, Kimi K2, MiniMax M2, GLM-4.6

**Visual Enhancements:**

- Add icons to feature bullets (MessageSquare for messages, Brain for models, Search for web search, Sparkles for premium)
- Add tooltips to explain "free models" and "premium models" concepts
- Add shared comparison note below both cards: "Free models power 80% of chats (smart, fast AI like writing helpers). Need heavy premium use? Monthly's your flex pass."

**Sign-up Flow:**

- Add one-liner above sign-in buttons: "Get started in seconds—no credit card needed for the first chat"

### 2. Add Icons and Tooltips

**Icons to Add (from lucide-react):**

- `MessageSquare` for messages
- `Brain` for AI models
- `Search` for web search
- `Sparkles` for premium features
- `Info` or `HelpCircle` for tooltip triggers

**Tooltip Implementation:**

- Add tooltip to "free models" explaining current top free models: Grok 4.1 Fast, GPT-OSS-20B, GLM-4.5 Air, Kimi K2, Dolphin Mistral 24B, DeepSeek R1, Qwen3-235B, DeepSeek Chat V3, Gemma 3-27B
- Add tooltip to "premium models" explaining current premium models: GPT-5.1 Chat, Claude Sonnet 4.5, Grok 4.1 Fast, Gemini 3 Pro Preview, Kimi K2 Thinking, MiniMax M2, GLM-4.6
- Use existing `Tooltip` component from `components/ui/tooltip.tsx`

### 3. Create FAQ Page (`app/faq/page.tsx`)

**Structure:**

- Follow same layout pattern as `app/privacy/page.tsx` and `app/terms/page.tsx`
- Use professional but friendly tone matching existing pages
- Include metadata for SEO

**Sections to Include:**

- **What are free models?** - Explain OpenRouter free models with current examples: Grok 4.1 Fast, GPT-OSS-20B, GLM-4.5 Air, Kimi K2, Dolphin Mistral 24B, DeepSeek R1, Qwen3-235B, DeepSeek Chat V3, Gemma 3-27B. Explain they're powerful AI models available without extra cost.
- **What are premium models?** - Explain current premium models: GPT-5.1 Chat, Claude Sonnet 4.5, Grok 4.1 Fast, Gemini 3 Pro Preview, Kimi K2 Thinking, MiniMax M2, GLM-4.6 and when you'd need them (advanced reasoning, complex tasks, etc.)
- **What's the difference between yearly and monthly plans?** - Clear comparison
- **What are MCP tools?** - Explain integrations like Google Maps, search, etc.
- **Do I need an OpenRouter account?** - Clarify that ChatLima handles everything
- **Can I switch plans?** - Explain upgrade/downgrade process
- **What happens if I cancel?** - Explain cancellation policy
- **How do I manage my subscription?** - Link to portal

**Link from Upgrade Page:**

- Add "Learn more" or "FAQ" link near the bottom of upgrade page

### 4. Enhance Subscription Management Link

**Current:** "Already have a subscription? Manage your subscription"
**Enhancement:** Make "Manage" link more prominent and consider adding usage stats context if possible (future enhancement)

## Current Free Models

The following are current top free models (may change):

- x-ai/grok-4.1-fast:free
- openai/gpt-oss-20b:free
- z-ai/glm-4.5-air:free
- moonshotai/kimi-k2:free
- cognitivecomputations/dolphin-mistral-24b-venice-edition:free
- deepseek/deepseek-r1-0528:free
- qwen/qwen3-235b-a22b:free
- deepseek/deepseek-chat-v3-0324:free
- google/gemma-3-27b-it:free

## Current Premium Models

The following are the current premium models available:

- x-ai/grok-4.1-fast
- google/gemini-3-pro-preview
- openai/gpt-5.1-chat
- moonshotai/kimi-k2-thinking
- minimax/minimax-m2
- z-ai/glm-4.6
- anthropic/claude-sonnet-4.5

These should be referenced in copy and FAQ as examples of free and premium models respectively.

## Files to Modify

1. `app/upgrade/page.tsx` - Update copy, add icons, tooltips, comparison note
2. `app/faq/page.tsx` - Create new FAQ page
3. Potentially update navigation/footer to include FAQ link (if navigation exists)

## Technical Details

- Use existing `Tooltip` component from `components/ui/tooltip.tsx`
- Import icons from `lucide-react` (already used in upgrade page)
- Maintain existing styling patterns (card layout, colors, spacing)
- Ensure responsive design matches current upgrade page
- Follow existing voice/tone from privacy/terms pages (professional, friendly, clear)

## Voice/Tone Guidelines

Based on existing pages:

- Professional but approachable
- Clear explanations without jargon
- Australian date formatting (en-AU) if dates are used
- Direct and helpful
- Focus on user benefits, not technical details

### To-dos

- [ ] Update yearly plan card copy: replace 'Unlimited access to free models' with benefit-focused wording and add subtitle about everyday use
- [ ] Change premium models bullet from negative (crossed-out) to positive 'available anytime' messaging
- [ ] Add icons (MessageSquare, Brain, Search, Sparkles) to feature bullets on both plans
- [ ] Add tooltips explaining free models and premium models concepts using Tooltip component
- [ ] Add shared comparison note below both cards explaining that free models power 80% of chats
- [ ] Add one-liner above sign-in buttons: 'Get started in seconds—no credit card needed for the first chat'
- [ ] Create new FAQ page at app/faq/page.tsx with sections on free models, premium models, plan differences, MCP tools, etc.
- [ ] Add FAQ link to upgrade page for users who want more information