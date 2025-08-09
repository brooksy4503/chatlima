### Objective

Ensure anonymous users can only access free models. Specifically, allow only OpenRouter models that end with ":free" for anonymous sessions. Block all other models (including cheap non-premium models) for anonymous users. Authenticated users retain existing behavior based on credits.

### Definitions
- **Anonymous user**: `session.user.isAnonymous === true`.
- **Free model**: Any model whose id matches `^openrouter/.+:free$`.
- **Own API keys**: User supplies provider API key(s) in request; configurable policy below.

### Policy
- Anonymous users:
  - May use only OpenRouter `:free` models.
  - All other models are blocked server-side, regardless of premium flag.
  - Web Search remains blocked for anonymous users (unchanged).
- Authenticated users (non-anonymous): unchanged (credit/limits logic remains).
- Own API keys: Default = still blocked for anonymous unless the model is `:free`. Optional env flag to allow.

### Enforcement points (server-first)
1) Chat generation API (`app/api/chat/route.ts`)
   - After extracting `isAnonymous`, `isUsingOwnApiKeys`, and `isFreeModel`:
     - If `isAnonymous && !isFreeModel` then reject with 403 and code `ANON_FREE_ONLY`.
     - Continue allowing `:free` models and existing logic for credits, negative balances, and premium checks.
   - Optional: env toggle `ALLOW_ANON_OWN_KEYS` to permit anonymous + own keys bypass. Default `false`.

2) Models listing API (`app/api/models/route.ts`)
   - Detect session. If `anonymous` (or unauthenticated), filter returned `models` to only those matching `^openrouter/.+:free$`.
   - Preserve `metadata` fields appropriately (counts reflect filtered list).

3) Preset creation/validation (`app/api/presets/route.ts`)
   - Replace placeholder `userCanAccessPremium()` with real logic:
     - If anonymous: return `false` and additionally enforce `:free` restriction during validation.
   - When validating model access:
     - If anonymous and modelId does not match `^openrouter/.+:free$`, return 403 `ANON_FREE_ONLY`.

### Client-side UX (defense-in-depth, not relied upon)
- Model context (`lib/context/model-context.tsx`): When `isAnonymous`, filter `availableModels` to only free models. Provide a safe default free model fallback if current selection is not allowed. Suggested defaults:
  - `openrouter/mistralai/mistral-7b-instruct:free`
  - `openrouter/google/gemma-7b-it:free`
  - `openrouter/meta-llama/llama-3.1-8b-instruct:free`
- Model Picker (`components/model-picker.tsx`): With `isAnonymous`, display only free models. If a non-free model is somehow selected (e.g., from old localStorage), show inline message and auto-switch to the default free model.

### Config
- `ALLOW_ANON_OWN_KEYS` (default: `false`)
  - If `true`, anonymous users with their own API keys may access non-free models. If `false`, anonymous users are always restricted to free models.

### Files to change
- `app/api/chat/route.ts`: Add early guard `ANON_FREE_ONLY` and optional own-keys allowance.
- `app/api/models/route.ts`: Filter response for anonymous sessions.
- `app/api/presets/route.ts`: Enforce anonymous free-only on create/validate.
- `lib/context/model-context.tsx`: Filter `availableModels` and set free default for anonymous.
- `components/model-picker.tsx`: Defensive UI behavior for anonymous (show only free; tooltip for blocked selections if any leak through).
- (Optional) `lib/parameter-validation.ts`: Helper `isOpenRouterFreeModel(id: string)` used across server and client to avoid duplicated regex.

### Pseudocode snippets
- Guard in chat API:
  ```ts
  const isFreeModel = selectedModel.startsWith('openrouter/') && selectedModel.endsWith(':free');
  const allowAnonOwnKeys = process.env.ALLOW_ANON_OWN_KEYS === 'true';
  if (isAnonymous && !isFreeModel && !(allowAnonOwnKeys && isUsingOwnApiKeys)) {
    return createErrorResponse(
      'Anonymous users can only use free models. Please sign in to use other models.',
      403
    );
  }
  ```

- Filter in models API:
  ```ts
  const isAnon = !!session?.user?.isAnonymous || !session?.user?.id;
  const filtered = isAnon ? all.models.filter(m => m.id.startsWith('openrouter/') && m.id.endsWith(':free')) : all.models;
  ```

- Presets validation:
  ```ts
  if (isAnonymous && !(modelId.startsWith('openrouter/') && modelId.endsWith(':free'))) {
    return createErrorResponse('Anonymous users can only use free models', 403);
  }
  ```

- Model context filter:
  ```ts
  const isAnon = auth.isAnonymous;
  const visibleModels = isAnon ? models.filter(m => m.id.startsWith('openrouter/') && m.id.endsWith(':free')) : models;
  ```

### Test plan
- Anonymous user:
  - Attempt premium model → 403 `PREMIUM_MODEL_RESTRICTED` (existing) or `ANON_FREE_ONLY` if not free.
  - Attempt non-premium, non-free model → 403 `ANON_FREE_ONLY`.
  - Attempt `openrouter/...:free` → 200 OK, respects daily message limits.
  - Model list shows only `:free` items; Model Picker cannot select others.
- Authenticated user without credits:
  - Behavior unchanged; premium blocked by existing credit checks, non-premium allowed.
- Authenticated user with credits:
  - Behavior unchanged; can access all eligible models.
- Env toggle:
  - With `ALLOW_ANON_OWN_KEYS=true`, anonymous + own keys can use non-free models (confirm server guard permits).

### Rollout notes
- Server-side checks are the source of truth. Client-side filtering is UX only.
- Minimal risk; anonymous requests are a subset of traffic.
- Monitor logs for `ANON_FREE_ONLY` errors after shipment.

### Post-deploy checklist
- Verify anonymous model list is limited to `:free`.
- Verify chat API blocks anonymous non-free requests.
- Verify preset creation blocked for anonymous non-free models.
- Run and greenlight existing premium access tests and anonymous tests; add a new case for anon + non-premium/non-free model.
