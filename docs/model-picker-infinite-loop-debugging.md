# Debugging: Model Picker Infinite Update Loop in React Context

## Error Observed

```
Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
```

## Root Cause

- The error was caused by an infinite update loop between a consumer component (`components/chat.tsx`) and the context provider (`lib/context/model-context.tsx`).
- The consumer was reading from `localStorage` and calling `setSelectedModel` in a `useEffect`, while the context provider was also managing the same state and syncing with `localStorage`.
- This caused repeated state updates and re-renders, resulting in the React error above.

## Failed Fixes

### 1. Guarding setSelectedModel in Context
- **Attempt:** Only call `setSelectedModelState` if the new model is different from the current one.
- **Result:** Did not resolve the issue, as the consumer effect still caused repeated updates.

### 2. Removing setSelectedModel from useEffect in Consumer (Partial)
- **Attempt:** Remove the effect, but it was not fully removed in all places, so the loop persisted.
- **Result:** Error continued until the effect was completely removed.

## Correct Fix

- **Solution:** Remove the `useEffect` in `components/chat.tsx` that set `selectedModel` from `localStorage`.
- **Reason:** The context provider (`lib/context/model-context.tsx`) is solely responsible for initializing and syncing the model state with `localStorage`. Consumers should only use the context value and setter, not re-read or re-set from `localStorage`.
- **Result:** Infinite update loop resolved. Model picker works as expected.

## Key Takeaways

- **State should have a single source of truth.**
- **Do not duplicate state logic between context and consumers.**
- **Let context providers handle initialization and persistence.**

---

**Documented by AI after debugging session, 2024.** 