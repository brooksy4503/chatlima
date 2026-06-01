# xAI BYOK Support Implementation Plan

**Date:** 2026-06-01
**Status:** Planning only
**Source of truth:** `SPEC.md`
**Goal:** Make xAI a first-class Bring Your Own Key provider in ChatLima so a user who saves `XAI_API_KEY` can discover direct xAI models in the picker, select `xai/...` model IDs, pass access gating with xAI BYOK, stream chat responses through `@ai-sdk/xai`, and skip ChatLima credit charging for those direct xAI requests.

---

## Executive Summary

Today, saving an xAI API key is not enough for a complete xAI BYOK flow.

Current behavior found in code:

- `components/api-key-manager.tsx` already exposes an xAI key field and saves it as `XAI_API_KEY`.
- `hooks/use-models.ts` and `lib/context/model-context.tsx` already include `XAI_API_KEY` in client BYOK propagation.
- `lib/services/accessGateService.ts` already maps the `xai` provider prefix to `XAI_API_KEY`.
- `ai/providers.ts` imports `@ai-sdk/xai` and can create an xAI client, but only handles legacy static ID `grok-3-mini` and does not handle dynamic `xai/...` IDs.
- `lib/models/provider-configs.ts` only registers OpenRouter and Requesty for dynamic catalog loading.
- The Grok models users see today are OpenRouter IDs such as `openrouter/x-ai/grok-4`, so `accessGateService` correctly requires `OPENROUTER_API_KEY`, not `XAI_API_KEY`.
- `SPEC.md` currently says dynamic model loading fetches from OpenRouter and Requesty only, while direct providers are runtime chat providers.

Recommended implementation: add direct xAI models with an explicit `xai/...` model ID namespace. Do not silently reroute `openrouter/x-ai/...` models to direct xAI when an xAI key exists.

---

## Desired Product Behavior

1. A user can save an xAI key in Settings/API Keys using the existing `XAI_API_KEY` field.
2. When `XAI_API_KEY` is available from environment or browser BYOK, `/api/models` includes direct xAI models with IDs like:
   - `xai/grok-4`
   - `xai/grok-3`
   - `xai/grok-3-mini`
   - optionally future xAI model IDs returned by the xAI models endpoint
3. The model picker displays those direct models as provider `XAI`.
4. Selecting `xai/...` uses `XAI_API_KEY` for:
   - billing access gate bypass when `ALLOW_BYOK_BYPASS=true`
   - chat streaming through `@ai-sdk/xai`
   - credit-billing skip via existing `hasProviderByokForModel`
   - title generation provider selection
5. Existing `openrouter/x-ai/...` models remain OpenRouter models:
   - they require `OPENROUTER_API_KEY` for BYOK bypass
   - they retain OpenRouter-only features such as OpenRouter web search where supported
   - they do not implicitly spend the user's xAI API key
6. Web search and image generation remain OpenRouter-only unless separately designed later.
7. Existing legacy selected model `grok-3-mini` continues to work during migration, but new UI and persisted selections should prefer `xai/grok-3-mini`.

---

## Architecture Recommendation

### Model ID Strategy Options

#### Option A: Direct xAI IDs with `xai/...`

Examples:

- `xai/grok-4`
- `xai/grok-3`
- `xai/grok-3-mini`

Pros:

- Matches existing provider-prefix architecture in `accessGateService`.
- Makes BYOK semantics explicit: `xai/...` uses `XAI_API_KEY`, `openrouter/...` uses `OPENROUTER_API_KEY`.
- Avoids surprising users by routing an OpenRouter-selected model to a different vendor endpoint.
- Keeps model attribution, provider health, pricing, favorites, presets, and credit skip behavior straightforward.
- Aligns with `SPEC.md` model ID format: `{provider}/{model-path}`.

Cons:

- Users will see duplicate Grok entries: one via OpenRouter and one direct via XAI.
- Presets currently referencing `openrouter/x-ai/grok-4` will not automatically use direct xAI.

#### Option B: Transparently map OpenRouter Grok IDs to direct xAI when `XAI_API_KEY` exists

Example:

- User selects `openrouter/x-ai/grok-4`.
- Runtime detects `XAI_API_KEY`.
- Chat is sent to `xai/grok-4` instead of OpenRouter.

Pros:

- Users who already select OpenRouter Grok models might expect their xAI key to work.
- Less visual duplication in the model picker.

Cons:

- Breaks the provider-prefix contract used across access gating, credit skip, UI badges, web search, and image generation.
- Makes an `openrouter/...` model spend `XAI_API_KEY`, which is surprising and hard to explain.
- May break OpenRouter-specific model options, web search behavior, model metadata, and pricing assumptions.
- Requires cross-provider alias logic in several services and makes future provider debugging harder.

#### Option C: Add an explicit user-facing toggle or alias preference

Example:

- Keep OpenRouter Grok entries.
- Add "Prefer direct xAI when available" setting.

Pros:

- Gives power users control.

Cons:

- More product complexity for a provider-specific edge case.
- Still needs alias routing complexity.
- Not necessary for first-class BYOK.

### Final Recommendation

Use Option A. Add direct xAI models as `xai/...` entries and keep OpenRouter Grok entries as OpenRouter entries. Add targeted copy or metadata if needed to distinguish "Grok 4 via xAI" from "Grok 4 via OpenRouter".

For backward compatibility, migrate legacy `grok-3-mini` to `xai/grok-3-mini` in `MODEL_MIGRATIONS`, while keeping the legacy switch case in `ai/providers.ts` for at least one release.

---

## External API Assumption to Confirm During Implementation

xAI provides OpenAI-compatible APIs and a models endpoint. Before coding, confirm the latest official xAI model-list response shape from xAI docs and a real `curl` against the endpoint with a test key.

Expected endpoint shape to verify:

```bash
curl https://api.x.ai/v1/models \
  -H "Authorization: Bearer $XAI_API_KEY"
```

If the response follows OpenAI-style `{ data: [{ id, object, created, owned_by, ... }] }`, implement `parseXaiModels` against `data`. If xAI omits pricing/capability metadata, use conservative static defaults and document that in `SPEC.md`.

Official docs checked while preparing this plan:

- xAI API docs: `https://docs.x.ai/`
- xAI OpenAI SDK compatibility docs: `https://docs.x.ai/docs/guides/openai`

---

## Files Likely to Modify

### Product/source files

- `lib/models/provider-configs.ts`
  - Add `parseXaiModels`.
  - Register `xai` in `PROVIDERS`.
  - Add xAI-specific capability/default metadata mapping.

- `ai/providers.ts`
  - Add dynamic `modelId.startsWith('xai/')` handling in `getLanguageModelWithKeys`.
  - Update xAI title model default to an `xai/...` ID.
  - Update title model provider detection for `xai/...`.
  - Keep legacy `grok-3-mini` compatibility.

- `lib/models/client-constants.ts`
  - Add migration from `grok-3-mini` to `xai/grok-3-mini`.
  - Consider migrations for any earlier direct xAI IDs if found.

- `SPEC.md`
  - Update dynamic model loading to include xAI.
  - Clarify model ID semantics for direct xAI vs OpenRouter-hosted xAI models.
  - Update BYOK access/credit behavior examples.
  - Document xAI web search/image-generation limitations.

- `README.md` or `docs/settings-panel.md`
  - Optional but recommended: clarify that xAI BYOK unlocks direct `xai/...` models, not OpenRouter `openrouter/x-ai/...` entries.

### Test files

- Add `__tests__/models/provider-configs-xai.test.ts` or extend existing provider config tests if present.
- Add/extend provider tests for `ai/providers.ts`, likely `__tests__/ai/providers.test.ts` if no current file exists.
- Extend `__tests__/services/access-gate-service.test.ts`.
- Add/extend API model route tests if a route test pattern exists.
- Extend model context or hook tests only if needed to lock refresh behavior after saving `XAI_API_KEY`.

### Files probably not needing changes

- `components/api-key-manager.tsx`: xAI key storage already exists.
- `hooks/use-models.ts`: `XAI_API_KEY` is already propagated.
- `lib/context/model-context.tsx`: `XAI_API_KEY` is already loaded and refreshes models.
- `components/model-picker.tsx`: provider icon/key mapping already includes `xai`; verify display only.
- Database schema: no migration should be needed.

---

## Implementation Tasks

### Task 1: Add failing parser tests for xAI models

Objective: define the catalog contract before touching provider code.

Create `__tests__/models/provider-configs-xai.test.ts`.

Test cases:

1. `parseXaiModels` accepts OpenAI-style `{ data: [...] }`.
2. Returned model IDs are prefixed with `xai/`.
3. Provider is `XAI`.
4. Grok models get useful display names and capabilities:
   - `grok-4` includes `Reasoning`
   - `grok-3-mini` includes `Fast` or `Efficient`
   - unknown xAI IDs still include `General Purpose`
5. `supportsWebSearch` is `false` for direct xAI models.
6. `supportsToolCalling` is conservative unless verified with xAI SDK/docs.
7. Invalid response shape throws a clear error.

Focused command:

```bash
pnpm test:unit -- __tests__/models/provider-configs-xai.test.ts --runInBand
```

Expected first result: fail because `parseXaiModels` is not implemented.

### Task 2: Implement `parseXaiModels` and provider registration

Objective: make `/api/models` capable of fetching direct xAI model catalog entries.

Modify `lib/models/provider-configs.ts`:

- Add `parseXaiModels(data: any): ModelInfo[]`.
- Register:

```ts
xai: {
  name: 'XAI',
  envKey: 'XAI_API_KEY',
  endpoint: 'https://api.x.ai/v1/models',
  healthCheck: undefined,
  parse: parseXaiModels,
  rateLimit: { requestsPerMinute: 60, burstLimit: 10 },
  retryConfig: { maxRetries: 3, backoffMs: 1000 },
}
```

Parsing rules:

- `id`: `xai/${model.id}`
- `provider`: `XAI`
- `name`: model ID transformed for display, e.g. `Grok 4`
- `description`: `Grok 4 via xAI` or provider description if xAI returns one
- `apiVersion`: raw xAI model ID
- `status`: `available`
- `lastChecked`: `new Date()`
- `premium`: `true` for paid direct xAI models unless verified pricing supports tier calculation
- `vision`: true only for known/declared vision models
- `supportsWebSearch`: `false`
- `supportsTemperature`: `true`
- `supportsMaxTokens`: `true`
- `supportsSystemInstruction`: `true`
- `pricing`: omit or fill from a static map only if xAI docs provide stable pricing in machine-readable form
- `maxTokensRange`: use static known defaults for Grok families if xAI response does not include limits

Important cache note:

- `fetchAllModels` caches by provider key only. After adding `xai`, `/api/models` will have an independent `xai` cache entry.
- If a previous no-key failure was not cached, adding a key and forcing refresh should fetch xAI.

Focused command:

```bash
pnpm test:unit -- __tests__/models/provider-configs-xai.test.ts --runInBand
```

### Task 3: Add dynamic xAI runtime model resolution tests

Objective: ensure selected `xai/...` IDs actually instantiate an xAI model with the xAI key.

Add or extend `__tests__/ai/providers.test.ts`.

Mock `@ai-sdk/xai` and assert:

1. `getLanguageModelWithKeys('xai/grok-4', { XAI_API_KEY: 'xai-test' })` calls `createXai({ apiKey: 'xai-test' })`.
2. The returned provider model is invoked with raw ID `grok-4`.
3. Missing key throws the existing clear xAI missing-key error.
4. Legacy `grok-3-mini` still maps to `grok-3-mini-latest`.
5. `getTitleGenerationModelId('xai/grok-4')` returns `process.env.XAI_TITLE_MODEL || 'xai/grok-3-mini'`.
6. `getTitleGenerationModelId('openrouter/x-ai/grok-4')` still returns the OpenRouter title model.

Focused command:

```bash
pnpm test:unit -- __tests__/ai/providers.test.ts --runInBand
```

Expected first result: fail for dynamic `xai/...`.

### Task 4: Implement dynamic `xai/...` in `ai/providers.ts`

Objective: route direct xAI model IDs through `@ai-sdk/xai`.

Modify `getLanguageModelWithKeys`:

```ts
if (modelId.startsWith('xai/')) {
  const xaiModelId = modelId.replace('xai/', '');
  console.log(`[getLanguageModelWithKeys] Creating dynamic XAI client for: ${xaiModelId}`);
  return getXaiClient()(xaiModelId) as unknown as LanguageModel;
}
```

Reasoning middleware:

- Do not automatically apply OpenRouter Grok tag extraction to all direct xAI models unless manual testing confirms direct xAI emits `<think>` tags into text.
- If direct xAI reasoning needs middleware, add a narrowly named helper such as `usesXaiTagBasedReasoningExtraction(modelId)` and cover it with tests.

Title generation:

- Change xAI title default from `grok-3-mini` to `xai/grok-3-mini`.
- Detect `selectedModelId.startsWith('xai/')`.
- Keep `selectedModelId.startsWith('grok-')` legacy fallback during migration.

Focused command:

```bash
pnpm test:unit -- __tests__/ai/providers.test.ts --runInBand
```

### Task 5: Strengthen BYOK gate tests for direct vs OpenRouter Grok

Objective: lock the most important product distinction.

Extend `__tests__/services/access-gate-service.test.ts`:

1. `hasProviderByokForModel('xai/grok-4', { XAI_API_KEY: 'xai-test' })` is `true`.
2. `hasProviderByokForModel('openrouter/x-ai/grok-4', { XAI_API_KEY: 'xai-test' })` is `false`.
3. `canUserChat` allows unsubscribed users with `selectedModel: 'xai/grok-4'` and `XAI_API_KEY` when `ALLOW_BYOK_BYPASS=true`.
4. `canUserChat` blocks unsubscribed users with `selectedModel: 'openrouter/x-ai/grok-4'` and only `XAI_API_KEY`.
5. `canUserChat` allows `openrouter/x-ai/grok-4` with `OPENROUTER_API_KEY`.

Command:

```bash
pnpm test:unit -- __tests__/services/access-gate-service.test.ts --runInBand
```

Expected: existing code may already pass most of these except direct `xai/grok-4` should pass because provider prefix mapping is already generic. Add the tests anyway to prevent future alias regressions.

### Task 6: Add model fetching integration tests

Objective: prove `fetchAllModels` includes xAI only when a key is present and reports provider metadata correctly.

Add `__tests__/models/fetch-models-xai.test.ts` or extend an existing fetch-models suite.

Mock `global.fetch`.

Cases:

1. With `environment: { XAI_API_KEY: 'xai-env' }`, `fetchAllModels` calls `https://api.x.ai/v1/models` with `Authorization: Bearer xai-env`.
2. With `user: { XAI_API_KEY: 'xai-user' }`, user key takes precedence over environment key.
3. `metadata.providers.xai` is healthy and has expected model count on successful response.
4. `metadata.userProvidedKeys` includes `xai` when user key is used.
5. With no xAI key, provider metadata has `status: 'down'` and `error: 'No API key available'`, but OpenRouter/Requesty results are not blocked.

Command:

```bash
pnpm test:unit -- __tests__/models/fetch-models-xai.test.ts --runInBand
```

Implementation caution:

- Provider cache is module-level. Tests should call `clearProviderCache()` between cases.
- If rate limiter state interferes, add a test-only reset helper or isolate modules with `jest.resetModules()`.

### Task 7: Add model API route coverage if practical

Objective: verify `/api/models` exposes direct xAI models in the same path the UI uses.

If existing route tests are easy to extend, cover:

1. `x-api-keys` header with `XAI_API_KEY` results in `xai/...` models.
2. `display=true` marks direct xAI models accessible when BYOK is present and billing is enforced.
3. `openrouter/x-ai/...` remains inaccessible with only xAI BYOK when billing is enforced and no subscription exists.

Command:

```bash
pnpm test:unit -- __tests__/api/models-route*.test.ts --runInBand
```

If route tests require too much mocking, document the gap and rely on `fetchAllModels` plus `accessGateService` unit coverage.

### Task 8: Add client migration for legacy direct xAI selection

Objective: move old persisted direct xAI selections to the new provider-prefixed ID.

Modify `lib/models/client-constants.ts`:

```ts
{
  oldId: 'grok-3-mini',
  newId: 'xai/grok-3-mini',
  reason: 'moved',
  automaticMigration: true,
}
```

Add/extend model context migration tests if there is a low-friction existing suite. If not, note manual verification:

1. Put `selectedModel=grok-3-mini` in localStorage.
2. Load app with `XAI_API_KEY`.
3. Confirm it migrates to `xai/grok-3-mini` if available.

### Task 9: Update `SPEC.md`

Objective: keep product source of truth accurate.

Update these sections:

- `Application Overview`: dynamic providers now include xAI when an xAI key is configured.
- `5.1 Supported Providers`: distinguish direct xAI from OpenRouter-hosted xAI/Grok models.
- `5.2 Dynamic Model Loading`: add xAI `/v1/models`.
- `5.3 Model ID Format`: add `xai/grok-4` example and clarify `openrouter/x-ai/grok-4` is still OpenRouter.
- `5.4 API Key Management`: state `XAI_API_KEY` unlocks direct `xai/...` models.
- `7.5 Credit Validation Flow`: BYOK skip applies to provider-matched model IDs.
- `8.1 Chat Features`: web search/image generation remain OpenRouter-only.
- `11.4 AI Provider API Keys`: no new env vars, but add comment explaining `XAI_API_KEY`.

### Task 10: Optional docs/readme copy update

Objective: avoid user confusion from duplicate Grok entries.

Update `README.md` or `docs/settings-panel.md` with one concise note:

> xAI BYOK applies to direct `xai/...` models. OpenRouter-hosted Grok models use `openrouter/x-ai/...` IDs and require an OpenRouter key for BYOK.

Keep this optional if the implementation scope is intended to be source + SPEC only.

---

## Edge Cases

- **Only `XAI_API_KEY` is configured:** `/api/models` should include direct `xai/...` models; OpenRouter models should only appear if OpenRouter has an environment/user key.
- **Both `XAI_API_KEY` and `OPENROUTER_API_KEY` are configured:** show both direct xAI and OpenRouter Grok entries. Each entry should use its own provider key.
- **Billing enforced, no subscription, only xAI key:** allow `xai/...`; block `openrouter/x-ai/...` unless an OpenRouter key is also present.
- **Anonymous user with xAI key:** current `canUserChat` allows BYOK bypass for anonymous users if `ALLOW_BYOK_BYPASS=true`. Preserve or explicitly revisit this product rule before changing it.
- **No pricing from xAI model endpoint:** use conservative credit tier metadata for display, but actual ChatLima credits should be skipped for provider-matched BYOK.
- **Direct xAI model not found in dynamic catalog but manually selected:** `ChatModelValidationService` currently tolerates `modelInfo === null` and `getLanguageModelWithKeys` can still route `xai/...`; decide whether to preserve this permissive behavior or add stricter validation separately.
- **Grok reasoning output format differs by endpoint:** do not assume OpenRouter's Grok reasoning behavior exactly matches direct xAI.
- **xAI rate limits/errors:** should surface as provider errors in `/api/models` metadata and normal stream errors in chat.
- **OpenRouter-specific tools:** web search and image generation should not attach OpenRouter server tools to direct `xai/...` models.
- **Favorites/presets:** existing IDs remain valid. New direct xAI IDs are separate favorites/preset choices.

---

## Migration and Backward Compatibility

- Add client-side model migration from `grok-3-mini` to `xai/grok-3-mini`.
- Keep legacy `case "grok-3-mini"` in `ai/providers.ts` temporarily.
- Do not migrate `openrouter/x-ai/grok-*` presets to `xai/grok-*`; those are different providers.
- Consider adding direct xAI versions of built-in Grok presets later, but do not rewrite existing preset templates in the first implementation unless product explicitly wants that.
- No database migration is expected because selected model IDs are strings and provider API keys are browser/local env values.

---

## Verification Commands

Run focused tests as tasks are implemented:

```bash
pnpm test:unit -- __tests__/models/provider-configs-xai.test.ts --runInBand
pnpm test:unit -- __tests__/ai/providers.test.ts --runInBand
pnpm test:unit -- __tests__/services/access-gate-service.test.ts --runInBand
pnpm test:unit -- __tests__/models/fetch-models-xai.test.ts --runInBand
```

Run broader validation before merging:

```bash
pnpm lint
pnpm test:unit -- --runInBand
pnpm build
```

Manual model catalog verification:

```bash
curl -s http://localhost:3000/api/models \
  -H "Content-Type: application/json" \
  -H "x-api-keys: {\"XAI_API_KEY\":\"$XAI_API_KEY\"}" \
  | jq '.models[] | select(.id | startswith("xai/")) | {id, provider, name}'
```

Manual chat verification:

1. Check port 3000 is free:

```bash
lsof -ti:3000
```

2. Start dev server:

```bash
pnpm dev
```

3. In Settings/API Keys, save only `XAI_API_KEY`.
4. Confirm the picker includes direct xAI models with `xai/...` IDs.
5. Select `xai/grok-4` or `xai/grok-3-mini`.
6. Send a simple prompt and confirm streaming succeeds.
7. With `BILLING_ENFORCED=true` and `ALLOW_BYOK_BYPASS=true`, confirm:
   - `xai/...` works with only `XAI_API_KEY`
   - `openrouter/x-ai/grok-4` does not work with only `XAI_API_KEY`
   - `openrouter/x-ai/grok-4` works with `OPENROUTER_API_KEY`
8. Confirm web search/image generation controls do not become available because a direct xAI model is selected.

---

## Implementation Order

1. Parser tests for xAI model response.
2. `parseXaiModels` plus `PROVIDERS.xai`.
3. Runtime provider tests for `xai/...`.
4. `getLanguageModelWithKeys` dynamic xAI support.
5. Access gate tests for direct vs OpenRouter Grok.
6. Fetch-models integration tests.
7. Optional API route tests.
8. Legacy model migration.
9. `SPEC.md` updates.
10. Optional README/settings docs update.

This order keeps each change small and makes failures local: catalog parsing, runtime routing, billing gate semantics, then documentation.
