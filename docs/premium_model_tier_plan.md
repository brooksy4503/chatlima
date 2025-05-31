# Plan to Add Premium Model Tier

## 1. Update `ModelInfo` Interface

The `ModelInfo` interface needs to be updated to include an optional `premium` property. This property will be a boolean.

**File:** `ai/providers.ts`

**Change:**
Add `premium?: boolean;` to the `ModelInfo` interface.

```typescript
export interface ModelInfo {
  provider: string;
  name: string;
  description: string;
  apiVersion: string;
  capabilities: string[];
  enabled?: boolean;
  supportsWebSearch?: boolean;
  premium?: boolean;
}
```

## 2. Update `modelDetails` Object

Each model in the `modelDetails` object will need to have the `premium` property added. We will designate certain models as premium.

**File:** `ai/providers.ts`

**Change:**
For each model entry in `modelDetails`, add the `premium: boolean` property. For example, `claude-opus-4` and `gpt-4.1` could be marked as premium. Other models that are generally more expensive or higher capability would also be good candidates.

**Example (showing a few models):**

```typescript
export const modelDetails: Record<keyof typeof languageModels, ModelInfo> = {
  // ... other models
  "openrouter/anthropic/claude-3.5-sonnet": {
    provider: "OpenRouter",
    name: "Claude 3.5 Sonnet",
    description: "New Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at: Coding, Data science, Visual processing, Agentic tasks",
    apiVersion: "anthropic/claude-3.5-sonnet",
    capabilities: ["Coding", "Data science", "Visual processing", "Agentic tasks"],
    enabled: true,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/openai/gpt-4.1": {
    provider: "OpenRouter",
    name: "OpenAI GPT-4.1",
    description: "GPT-4.1 is a flagship large language model excelling in instruction following, software engineering, and long-context reasoning, supporting a 1 million token context. It's tuned for precise code diffs, agent reliability, and high recall, ideal for agents, IDE tooling, and enterprise knowledge retrieval. Note: Web search is not supported for this model.",
    apiVersion: "openai/gpt-4.1",
    capabilities: ["Coding", "Instruction Following", "Long Context", "Multimodal", "Agents", "IDE Tooling", "Knowledge Retrieval"],
    enabled: true,
    supportsWebSearch: false,
    premium: true
  },
  "openrouter/anthropic/claude-opus-4": {
    provider: "OpenRouter",
    name: "Claude Opus 4",
    description: "Anthropic's most advanced model, excelling at coding, advanced reasoning, agentic tasks, and long-context operations.",
    apiVersion: "anthropic/claude-opus-4",
    capabilities: ["Coding", "Advanced Reasoning", "Agentic Tasks", "Long Context", "Sustained Performance"],
    enabled: true,
    supportsWebSearch: true,
    premium: true
  },
  // ... other models with the premium flag added
};
```
*(**Note**: You will need to go through all models in `modelDetails` and decide whether `premium: true` or `premium: false` is appropriate for each.)*

## 3. Implement UI and Logic for Premium Models

*   **Filtering and Access Logic (Backend & Hooks):**
    *   Modify `lib/tokenCounter.ts` in the `hasEnoughCredits` function:
        *   If a selected model is marked as `premium: true` (from `ai/providers.ts`), the function should additionally check if the user has `credits > 0`.
        *   This check should occur alongside existing credit consumption checks.
        *   Anonymous users should still be blocked from premium models.
    *   Update `hooks/useCredits.ts`:
        *   Add a new function, e.g., `canAccessPremiumModels()`, which returns `true` if `credits > 0`, and `false` otherwise. This will be used by the UI.
*   **UI Updates (`components/model-picker.tsx`):**
    *   Fetch user's credit status using the `useCredits` hook.
    *   For models marked `premium: true`:
        *   Display a visual indicator (e.g., a diamond icon <Sparkles /> from lucide-react) next to their names in the `ModelPicker` dropdown.
        *   If the user *cannot* access premium models (i.e., `credits <= 0` based on the new function in `useCredits.ts`):
            *   Disable the `SelectItem` for premium models to prevent selection.
            *   Show a tooltip or a small message on hover/focus for disabled premium models explaining that credits are required (e.g., "Requires credits to use").
    *   Ensure the UI clearly communicates why a model might be disabled.

## 4. Testing

*   Verify that the `