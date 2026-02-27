# ChatLima Walkthrough Onboarding Design

**Date:** 2026-02-24
**Author:** Nanobot & Garth Scaysbrook
**Status:** ✅ Design Approved - Ready for Implementation
**Approach:** Task-Based Micro-Walkthroughs (Approach 2)

---

## 📋 Executive Summary

**Goal:** Help new users quickly discover ChatLima's core features (chat capabilities + MCP integration) through contextual, task-based micro-walkthroughs.

**Approach:** Instead of a long comprehensive tour, show short, focused walkthroughs (2-3 steps each) triggered by user actions. This reduces cognitive load, increases completion rates, and teaches features at the right moment.

**Target:** First-time users who sign up and need to understand:
1. Core chat functionality (model selection, history)
2. MCP integration (unique selling point)

---

## 🏗️ Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     ChatLima Frontend                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Walkthrough │  │   Context    │  │  Storage Layer   │  │
│  │  Manager    │◄─►│   Tracker    │◄─►│  (LocalStorage)  │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
│         ▲                  │                │               │
│         │                  ▼                │               │
┌─────────┴──────────────────────────────────┴───────────────┐
│                      UI Components                          │
│  • ModelSelector  • ChatArea  • MCPSidebar  • HistoryNav  │
└─────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **WalkthroughManager** (`useWalkthrough` hook)
   - Registers walkthroughs and their triggers
   - Checks context before showing walkthroughs
   - Manages walkthrough state (pending, active, completed, dismissed)

2. **Context Tracker** (`useOnboardingContext`)
   - Tracks user behavior: first message, model selection, MCP clicks
   - Persists state to localStorage
   - Determines eligibility for each walkthrough

3. **Walkthrough Components**
   - `WalkthroughTooltip` - Highlight overlay with text
   - `WalkthroughCard` - Full-screen or modal style walkthroughs
   - `WalkthroughProgress` - Step indicator

4. **Trigger System**
   - Event listeners on key UI elements
   - One-time triggers (per user session or lifetime)

### Technology Stack
- **State:** React hooks (useState, useEffect, useLocalStorage)
- **Storage:** localStorage for completion tracking
- **Styling:** Tailwind CSS + existing design system
- **Animations:** Framer Motion (if already used, otherwise CSS transitions)

---

## 📦 Components

### WalkthroughManager (Context Provider)

```typescript
// context/WalkthroughContext.tsx
interface WalkthroughState {
  walkthroughs: Map<string, WalkthroughConfig>;
  activeWalkthrough: string | null;
  startWalkthrough: (id: string) => void;
  dismissWalkthrough: (id: string) => void;
  completeWalkthrough: (id: string) => void;
  isWalkthroughCompleted: (id: string) => boolean;
}
```

**Responsibilities:**
- Registers all available walkthroughs
- Manages active walkthrough state
- Provides methods to control walkthrough lifecycle
- Persists completion state to localStorage

---

### useOnboardingContext (Custom Hook)

```typescript
// hooks/useOnboardingContext.ts
interface OnboardingContext {
  hasSentFirstMessage: boolean;
  hasSelectedModel: boolean;
  hasClickedMCP: boolean;
  markEvent: (event: OnboardingEvent) => void;
  getEligibleWalkthrough: () => string | null;
}
```

**Responsibilities:**
- Tracks user behavior events
- Determines which walkthrough to show next
- Persists context to localStorage

---

### WalkthroughTooltip

```typescript
interface WalkthroughTooltipProps {
  targetRef: RefObject<HTMLElement>;
  step: WalkthroughStep;
  onNext: () => void;
  onDismiss: () => void;
}
```

**Features:**
- Highlight overlay on target element
- Position calculation (top, right, bottom, left)
- Back/Next navigation
- Skip button
- Step indicator (e.g., "Step 1 of 3")
- Arrow pointer to target

---

### WalkthroughCard

```typescript
interface WalkthroughCardProps {
  steps: WalkthroughStep[];
  onComplete: () => void;
  onDismiss: () => void;
}
```

**Features:**
- Full-screen centered modal style
- Used for multi-step walkthroughs
- Progress bar at top
- Rich content (images, code snippets)
- Optional "Don't show again" checkbox

---

### Trigger Wrappers

Small wrapper components that attach to existing UI:

```typescript
// wraps ModelSelector
<ModelSelectorWrapper onFirstSelect={() => triggerWalkthrough('model-selector')}>

// wraps ChatArea
<ChatAreaWrapper onFirstMessage={() => triggerWalkthrough('history')}>

// wraps MCPSidebar
<MCPSidebarWrapper onFirstClick={() => triggerWalkthrough('mcp-connect')}>
```

---

### Walkthrough Definitions

```typescript
// config/walkthroughs.ts
const WALKTHROUGHS: WalkthroughConfig[] = [
  {
    id: 'model-selector',
    trigger: (ctx) => !ctx.hasSelectedModel && ctx.messageCount === 1,
    steps: [
      {
        target: '#model-selector',
        title: 'Choose Your AI Model',
        content: 'Select from 300+ AI models. Each has unique strengths for different tasks.',
        position: 'bottom'
      }
    ]
  },
  {
    id: 'history',
    trigger: (ctx) => ctx.hasSentFirstMessage && !ctx.historyViewed,
    steps: [
      {
        target: '#history-nav',
        title: 'Your Conversations',
        content: 'All your chats are saved here. Resume anytime.',
        position: 'right'
      }
    ]
  },
  {
    id: 'mcp-connect',
    trigger: (ctx) => ctx.hasSentFirstMessage && !ctx.hasUsedMCP,
    steps: [
      {
        target: '#mcp-sidebar',
        title: 'Connect MCP Tools',
        content: 'Enhance ChatLima by connecting tools like filesystems, databases, APIs.',
        position: 'left'
      },
      {
        target: '#mcp-add-btn',
        title: 'Add Your First Tool',
        content: 'Click here to browse available MCP tools and connect one.',
        position: 'top'
      }
    ]
  }
]
```

---

## 🔄 Data Flow

### User Journey

```
User Signs Up
     │
     ▼
┌─────────────────────┐
│ Initialize Onboarding │
│ - Load localStorage │
│ - Set context defaults│
└─────────────────────┘
     │
     ▼
User Interacts (clicks, types, navigates)
     │
     ├─────────────────────────────────────┐
     │                                     │
     ▼                                     ▼
┌─────────────────┐              ┌─────────────────┐
│ Event Triggered  │              │ Walkthrough     │
│ (e.g., clicks   │              │ Manager Checks  │
│ model selector) │              │ Eligibility     │
└─────────────────┘              └─────────────────┘
     │                                     │
     ├─────────────────────────────────────┤
     │                                     │
     ▼                                     ▼
┌─────────────────┐              ┌─────────────────┐
│ Update Context  │◄─────────────┤ Determine Next  │
│ (mark event)    │              │ Walkthrough     │
└─────────────────┘              └─────────────────┘
                                           │
                                           ▼
                              ┌─────────────────────────┐
                              │ Is Walkthrough Eligible?│
                              └─────────────────────────┘
                                    │         │
                                   Yes        No
                                    │         │
                                    ▼         │
                        ┌─────────────────────┐
                        │ Check if Completed   │
                        └─────────────────────┘
                              │         │
                             No       Yes
                              │         │
                              ▼         │
              ┌────────────────────────┐│
              │ Show Walkthrough       ││
              │ (Tooltip or Card)      ││
              └────────────────────────┘│
                     │                  │
                     ▼                  │
         ┌─────────────────────┐        │
         │ User Interacts      │        │
         │ (Next, Skip, Dismiss)│       │
         └─────────────────────┘        │
                     │                  │
         ┌───────────┼───────────┐      │
         ▼           ▼           ▼      │
     ┌────────┐ ┌────────┐ ┌────────┐    │
     │Complete│ │Dismiss │ │ Skip   │    │
     │ State  │ │ Temp   │ │ All    │    │
     └────────┘ └────────┘ └────────┘    │
         │                               │
         └───────────────────────────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Persist to      │
          │ localStorage    │
          └─────────────────┘
```

### Storage Schema

```typescript
// Onboarding Context (tracked events)
interface OnboardingContextState {
  // Counters
  messageCount: number;
  modelChanges: number;

  // One-time flags
  hasSentFirstMessage: boolean;
  hasSelectedModel: boolean;
  hasClickedMCP: boolean;
  hasViewedHistory: boolean;
  hasUsedMCP: boolean;

  // Timestamps
  firstMessageAt?: string;
  signUpAt: string;
}

// Walkthrough State
interface WalkthroughState {
  status: 'pending' | 'active' | 'completed' | 'dismissed';
  step?: number;
  completedAt?: string;
  dismissedAt?: string;
  isPermanent?: boolean; // true if user chose "Don't show again"
}

// Combined Storage Schema
interface OnboardingStorage {
  context: OnboardingContextState;
  walkthroughs: Record<string, WalkthroughState>;
  version: number; // for schema migrations
}
```

---

## 🛡️ Error Handling

### Storage Failures

| Error | Cause | Solution |
|-------|-------|----------|
| `localStorage unavailable` | Private browsing, Safari ITP, storage disabled | Fallback to in-memory state, warn user, degrade gracefully |
| `Quota exceeded` | localStorage full (5MB limit) | Clear old onboarding data, migrate to sessionStorage |
| `Corrupted data` | Invalid JSON, schema mismatch | Clear and reset to defaults, log error for analytics |

```typescript
const safeStorage = {
  get: <T>(key: string, fallback: T): T => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn(`Failed to read ${key}:`, e);
      return fallback;
    }
  },
  set: (key: string, value: unknown): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`Failed to write ${key}:`, e);
      return false;
    }
  }
};
```

### Target Element Not Found

| Error | Cause | Solution |
|-------|-------|----------|
| `Target element missing` | DOM changed, component unmounted, selector wrong | Retarget using `document.querySelector`, show centered tooltip as fallback, skip step if not critical |
| `Element not visible` | Hidden, off-screen, in collapsed panel | Auto-scroll to element, expand parent panel, or skip |

### Multiple Eligible Walkthroughs

Priority system to show one at a time:
```typescript
const WALKTHROUGH_PRIORITY = {
  'model-selector': 1,    // First - core chat
  'history': 2,           // Second - after using chat
  'mcp-connect': 3        // Third - advanced feature
};
```

### Accessibility

| Issue | Solution |
|-------|----------|
| Screen reader not aware of walkthrough | ARIA live regions, role="dialog", focus management |
| Keyboard navigation broken | Escape to dismiss, tab through steps, focus target element |
| Color contrast issues | Ensure tooltip text meets WCAG AA (4.5:1) |

---

## 🧪 Testing

### Test Coverage Targets

| Component/Module | Target Coverage |
|------------------|-----------------|
| `useOnboardingContext` | 90%+ |
| `WalkthroughContext` | 85%+ |
| `WalkthroughTooltip` | 80%+ |
| `WalkthroughCard` | 80%+ |
| Storage utilities | 95%+ |

### Testing Checklist

- [ ] Unit tests for all hooks (Vitest)
- [ ] Integration tests for trigger flows (Testing Library)
- [ ] E2E tests for complete user journeys (Playwright)
- [ ] Accessibility tests (keyboard, screen reader)
- [ ] Error scenario tests (storage failures, missing elements)
- [ ] State persistence tests
- [ ] Visual regression (optional)
- [ ] Performance tests (no re-renders, smooth animations)

---

## 📊 Success Metrics

| Metric | Target | How to Track |
|--------|--------|--------------|
| **Walkthrough completion rate** | >70% | localStorage + analytics |
| **Time to first model change** | <2 minutes | Event tracking |
| **Time to first MCP connection** | <5 minutes | Event tracking |
| **User feedback (optional survey)** | Positive >80% | Post-walkthrough prompt |
| **Reduction in support tickets** related to features | -30% | Support ticket analysis |

---

## 🚀 Implementation Plan

### Phase 1: Core Infrastructure (Week 1)
- [ ] Create `WalkthroughContext` provider
- [ ] Implement `useOnboardingContext` hook
- [ ] Build storage utilities with error handling
- [ ] Set up `safeStorage` wrapper

### Phase 2: UI Components (Week 2)
- [ ] Build `WalkthroughTooltip` component
- [ ] Build `WalkthroughCard` component
- [ ] Create trigger wrapper components
- [ ] Implement positioning logic

### Phase 3: Walkthrough Definitions (Week 3)
- [ ] Define `model-selector` walkthrough
- [ ] Define `history` walkthrough
- [ ] Define `mcp-connect` walkthrough
- [ ] Implement priority queue system

### Phase 4: Integration (Week 4)
- [ ] Wrap existing UI components with triggers
- [ ] Test end-to-end flows
- [ ] Add analytics tracking
- [ ] Polish animations and transitions

### Phase 5: Testing & Polish (Week 5)
- [ ] Complete unit tests (target 90% coverage)
- [ ] Complete E2E tests (Playwright)
- [ ] Accessibility audit and fixes
- [ ] Performance optimization

---

## 🎨 Design Considerations

### Visual Style
- Match ChatLima's existing design system
- Use consistent colors, typography, spacing
- Smooth animations for tooltips (fade in, slide)
- Highlight overlay should be subtle (not jarring)

### Copy Guidelines
- Keep it concise (2-3 sentences max per step)
- Use action-oriented language
- Focus on benefits, not just features
- Add personality where appropriate

### Behavior Rules
- **HARD GATE:** Never show more than one walkthrough at a time
- Respect user's dismissal choice (permanent vs temporary)
- Don't interrupt active typing or complex tasks
- Allow users to re-trigger walkthroughs from settings

---

## 🔮 Future Enhancements

### Potential Additions (Post-MVP)
- Interactive walkthroughs for file uploads
- Team collaboration walkthroughs
- API key setup walkthrough
- "Explore more" modal for advanced features

### Analytics Insights
- Track which walkthroughs get skipped most
- Identify where users drop off
- A/B test different copy or timing
- Personalize walkthrough order based on user type

---

## ✅ Approval

**Design Status:** ✅ Approved

**Ready for Implementation:** Yes

**Next Step:** Proceed with Phase 1 (Core Infrastructure)

---

*Design created by Nanobot (AI Assistant) & Garth Scaysbrook*
*Date: 2026-02-24*
