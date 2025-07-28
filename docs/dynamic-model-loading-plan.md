# Dynamic AI Model Loading – Implementation Plan

## 1. Objectives

1. Replace the current static, hard-coded model catalogue in `ai/providers.ts` with a **dynamic, provider–driven catalogue**.
2. Support **all configured providers** (initially *OpenRouter* & *Requesty*, but architected for easy extension).
3. Preserve the existing consumer API (`modelDetails`, `MODELS`, `defaultModel`, etc.) *where possible* to minimise refactors, while gradually migrating to an async-ready API.
4. Provide robust **caching & refresh controls** so model metadata is fetched sparingly and can be manually refreshed from the UI.
5. Maintain graceful fallbacks when a provider is down or returns incomplete data.
6. **NEW**: Support both environment variables AND user-provided API keys seamlessly.
7. **NEW**: Implement comprehensive error handling and provider health monitoring.
8. **NEW**: Ensure smooth migration path for existing model configurations.

---

## 2. High-level Architecture

1. **Hybrid Server-side aggregator**
   * New utility (e.g. `lib/fetch-models.ts`) fetches, normalises and caches model lists from each provider.
   * **Dual API key support**: Uses environment variables for server-side fetching AND supports user-provided keys.
   * Runs **only on the server** (edge/runtime) to keep environment API keys secret.
   * Exposes data through a lightweight **Next API route** (`/api/models`) with `revalidate` headers.
   * **NEW**: Provider health monitoring and status tracking.
2. **Enhanced type layer**
   * Introduce `ModelInfo`, `ProviderInfo`, `RawProviderModel`, `ModelsResponse` etc. in `types/models.ts`.
   * **NEW**: Status tracking, error states, and provider health indicators.
   * Normaliser converts `RawProviderModel → ModelInfo` so the UI can stay provider-agnostic.
3. **Robust client-side hook**
   * `hooks/use-models.ts` wraps `swr`/`react-query`/native `fetch` to consume `/api/models`.
   * Returns `{ models, isLoading, refresh, metadata, error }`.
   * **NEW**: Handles both server-sourced and user-sourced models.
4. **Enhanced context**
   * Extend `ModelContext` to load models asynchronously and handle migration scenarios.
   * **NEW**: Graceful fallback when stored model IDs become invalid.
5. **Enhanced UI components**
   * `components/model-picker.tsx` switches from the static `MODELS` array to the new hook/context.
   * **NEW**: Provider status indicators, health warnings, and model availability badges.
   * Add "Refresh models" button & provider filter dropdown.

---

## 3. Enhanced Provider Integration

### 3.1 Provider Configuration System
```ts
interface ProviderConfig {
  name: string;
  envKey: string;
  endpoint: string;
  parse: (data: any) => ModelInfo[];
  healthCheck?: string;           // Endpoint for provider health
  rateLimit?: {                  // Rate limiting config
    requestsPerMinute: number;
    burstLimit: number;
  };
  retryConfig?: {                // Retry strategy
    maxRetries: number;
    backoffMs: number;
  };
}

export const PROVIDERS = {
  openrouter: {
    name: 'OpenRouter',
    envKey: 'OPENROUTER_API_KEY',
    endpoint: 'https://openrouter.ai/api/v1/models',
    healthCheck: 'https://openrouter.ai/api/v1/auth/key',
    parse: parseOpenRouterModels,
    rateLimit: { requestsPerMinute: 60, burstLimit: 10 },
    retryConfig: { maxRetries: 3, backoffMs: 1000 },
  },
  requesty: {
    name: 'Requesty',
    envKey: 'REQUESTY_API_KEY',
    endpoint: 'https://api.requesty.ai/v1/models',
    healthCheck: 'https://api.requesty.ai/v1/status',
    parse: parseRequestyModels,
    rateLimit: { requestsPerMinute: 120, burstLimit: 20 },
    retryConfig: { maxRetries: 3, backoffMs: 500 },
  },
  // add more …
} satisfies Record<string, ProviderConfig>;
```

### 3.2 OpenRouter
* **Endpoint**: `GET https://openrouter.ai/api/v1/models`.
* **Auth**: `Authorization: Bearer <OPENROUTER_API_KEY>`.
* **Health Check**: `GET https://openrouter.ai/api/v1/auth/key`.
* **Important fields** (subject to API docs):
  * `id`, `name`, `context_length`, `description`, `pricing`, `capabilities`, `vision` flag, etc.
* **Normalisation notes**:
  * Derive `provider = "OpenRouter"`.
  * `premium = pricing?.prompt > 0` or API flag.
  * Map OpenRouter's `tags` to our `capabilities`.

### 3.3 Requesty
* **Endpoint**: `GET https://api.requesty.ai/v1/models` (placeholder – verify docs).
* **Auth**: `Authorization: Bearer <REQUESTY_API_KEY>`.
* **Health Check**: `GET https://api.requesty.ai/v1/status`.
* **Normalisation**: similar to OpenRouter.

### 3.4 Future Providers
* Define provider configs in `config/providers.ts` using the enhanced `ProviderConfig` interface above.

---

## 4. Enhanced Caching Strategy

| Layer | Technique | TTL | Notes |
|-------|-----------|-----|-------|
| **Server fetch util** | In-memory `Map` keyed by provider + API key hash | 10 min (configurable) | Simple, fast, auto-expires |
| **Next API Route** | `revalidate` header via `NextResponse` | 60 s default | Allows CDN/edge caching |
| **Client** | SWR/React-Query cache | 60 s + stale-while-revalidate | Provides instant repeat loads |
| **LocalStorage** (optional) | Persist last good payload | 24 h | Guard against offline/start-up |

### 4.1 Enhanced Cache Configuration
```ts
interface CacheConfig {
  modelListTTL: number;      // 10 minutes
  modelDetailsTTL: number;   // 1 hour  
  providerHealthTTL: number; // 30 seconds
  forceRefreshKey: string;   // Admin override
}
```

Admin-initiated refresh calls the API route with `?force=true`, skipping caches.

---

## 5. Enhanced Data Contract

### 5.1 Core Model Information
```ts
interface ModelInfo {
  id: string;            // unique (provider/model-id)
  provider: string;      // "OpenRouter" | "Requesty" | …
  name: string;          // human label
  description?: string;
  capabilities: string[];// normalised tags (code, reasoning…)
  premium: boolean;
  vision: boolean;
  contextMax?: number;
  apiVersion?: string;   // if available
  
  // NEW: Status and health tracking
  status: 'available' | 'limited' | 'deprecated' | 'unavailable';
  lastChecked: Date;
  errorMessage?: string;
  providerHealth?: 'healthy' | 'degraded' | 'down';
  
  // NEW: Enhanced metadata
  pricing?: {
    input?: number;      // per token
    output?: number;     // per token
    currency?: string;
  };
  rateLimit?: {
    requestsPerMinute?: number;
    tokensPerMinute?: number;
  };
}
```

### 5.2 API Response Structure
```ts
interface ModelsResponse {
  models: ModelInfo[];
  metadata: {
    lastUpdated: Date;
    providers: {
      [key: string]: {
        status: 'healthy' | 'degraded' | 'error';
        lastChecked: Date;
        modelCount: number;
        error?: string;
      };
    };
    totalModels: number;
    cacheHit: boolean;
    userProvidedKeys?: string[]; // Which providers used user keys
  };
}
```

---

## 6. Hybrid API Key Management

### 6.1 Current Implementation Analysis
The existing codebase supports both environment variables AND localStorage API keys:

```ts
// Current: ai/providers.ts
export const getApiKey = (key: string): string | undefined => {
  // Check for environment variables first
  if (process.env[key]) {
    return process.env[key] || undefined;
  }
  // Fall back to localStorage if available
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key) || undefined;
  }
  return undefined;
};
```

### 6.2 Enhanced Strategy
1. **Server-side route** fetches models using environment API keys
2. **Client-side hook** can also fetch models when user provides their own API keys
3. **Merge and deduplicate** models from both sources
4. **Clear separation** between environment and user-provided credentials

### 6.3 Implementation Approach
```ts
// Enhanced API route: /api/models
export async function GET(request: NextRequest) {
  const userApiKeys = extractUserApiKeys(request); // From headers/body
  
  // Fetch using environment keys
  const envModels = await fetchModelsWithEnvKeys();
  
  // Fetch using user-provided keys (if any)
  const userModels = await fetchModelsWithUserKeys(userApiKeys);
  
  // Merge and deduplicate
  const allModels = mergeAndDeduplicateModels(envModels, userModels);
  
  return NextResponse.json({
    models: allModels,
    metadata: {
      // ... enhanced metadata
      userProvidedKeys: Object.keys(userApiKeys),
    }
  });
}
```

---

## 7. Migration Compatibility & Error Handling

### 7.1 Model ID Migration
```ts
interface ModelMigration {
  oldId: string;
  newId: string;
  reason: 'renamed' | 'moved' | 'deprecated';
  automaticMigration: boolean;
}

// Example migrations
const MODEL_MIGRATIONS: ModelMigration[] = [
  {
    oldId: 'openrouter/anthropic/claude-3.5-sonnet-old',
    newId: 'openrouter/anthropic/claude-3.5-sonnet',
    reason: 'renamed',
    automaticMigration: true,
  },
];
```

### 7.2 Graceful Degradation
```ts
// Enhanced ModelContext with migration support
export function ModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModelState] = useState<modelID>(defaultModel);
  const { models, isLoading } = useModels();

  useEffect(() => {
    if (!isLoading && models.length > 0) {
      const storedModel = localStorage.getItem('selected_ai_model');
      if (storedModel) {
        // Check if stored model exists
        const modelExists = models.find(m => m.id === storedModel);
        if (modelExists) {
          setSelectedModelState(storedModel as modelID);
        } else {
          // Try migration
          const migration = findMigration(storedModel);
          if (migration?.automaticMigration) {
            setSelectedModelState(migration.newId as modelID);
            notifyUserOfMigration(migration);
          } else {
            // Fallback to default
            setSelectedModelState(defaultModel);
            notifyUserOfInvalidModel(storedModel);
          }
        }
      }
    }
  }, [models, isLoading]);

  // ... rest of implementation
}
```

### 7.3 Error Boundaries & Fallbacks
```ts
// Model picker with error handling
export const ModelPicker = ({ ... }) => {
  const { models, isLoading, error, refresh } = useModels();
  
  if (error) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => refresh()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
        <span className="text-sm text-muted-foreground">
          Failed to load models
        </span>
      </div>
    );
  }
  
  // ... rest of implementation
};
```

---

## 8. Enhanced UI Components

### 8.1 Model Picker Enhancements
* **Provider status indicators** – colored dots showing health
* **Model availability badges** – "new", "deprecated", "limited"
* **Refresh button** – manual cache invalidation
* **Provider filter dropdown** – quickly toggle between providers
* **Health warnings** – when provider is degraded
* **Pricing indicators** – show relative cost levels

### 8.2 Provider Health Dashboard
```tsx
// New component: components/provider-health.tsx
export const ProviderHealthDashboard = () => {
  const { metadata } = useModels();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(metadata.providers).map(([name, status]) => (
        <div key={name} className="p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <HealthIndicator status={status.status} />
            <span className="font-medium">{name}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {status.modelCount} models • Last checked: {formatTime(status.lastChecked)}
          </div>
          {status.error && (
            <div className="text-xs text-red-600 mt-1">{status.error}</div>
          )}
        </div>
      ))}
    </div>
  );
};
```

---

## 9. Revised Implementation Plan

### Phase 1: Core Infrastructure (2 days)
| Task | Time | Priority |
|------|------|----------|
| Enhanced provider config & parsers | 0.5 d | Critical |
| Server-side aggregator with advanced caching | 0.75 d | Critical |
| `/api/models` route with error handling | 0.5 d | Critical |
| Basic health monitoring | 0.25 d | High |

### Phase 2: Client Integration (1.5 days)
| Task | Time | Priority |
|------|------|----------|
| `useModels()` hook with SWR + error handling | 0.5 d | Critical |
| Enhanced ModelPicker adaptation | 0.75 d | Critical |
| ModelContext async initialization + migration | 0.25 d | High |

### Phase 3: Production Readiness (1.5 days)
| Task | Time | Priority |
|------|------|----------|
| Hybrid API key support | 0.5 d | Critical |
| Provider health monitoring dashboard | 0.5 d | High |
| Model migration utilities | 0.25 d | High |
| Enhanced UI features (status indicators, etc.) | 0.25 d | Medium |

### Phase 4: Testing & Polish (1 day)
| Task | Time | Priority |
|------|------|----------|
| Unit and integration tests | 0.5 d | Critical |
| Provider API mocking for tests | 0.25 d | High |
| Documentation updates | 0.25 d | Medium |

**Total Estimated Time**: **6 days** (vs. original 3 days)

---

## 10. Security Considerations

* **API key isolation**: Environment keys never exposed to client
* **User key validation**: Sanitize and validate user-provided keys
* **Rate limiting**: Implement per-provider rate limiting to prevent abuse
* **Error sanitization**: Never expose internal errors or API keys in responses
* **Audit logging**: Track API key usage and model access patterns
* **CORS protection**: Ensure API routes are properly protected

---

## 11. Real-time Updates & Future Enhancements

### 11.1 Real-time Capabilities (Future)
Consider adding for production environments:
* **WebSocket/SSE** for real-time model availability updates
* **Provider status notifications** when services go down/up
* **New model announcements** pushed to active users
* **Pricing change alerts** for cost-sensitive users

### 11.2 Advanced Features (Future Roadmap)
1. **Model Analytics**: Track usage patterns, popular models, performance metrics
2. **Cost Optimization**: Suggest cheaper alternatives for similar capabilities  
3. **A/B Testing**: Easy model switching for performance comparisons
4. **Custom Model Support**: Allow users to add their own API endpoints
5. **Model Recommendations**: AI-powered suggestions based on conversation context
6. **Model Performance Tracking**: Response time, quality metrics, user ratings
7. **Auto-failover**: Automatically switch to backup models when primary fails
8. **Model Presets**: Pre-configured model groups for specific use cases

---

## 12. Testing Strategy

### 12.1 Unit Tests
* Provider parsers and normalizers
* Caching logic and TTL handling
* Model migration utilities
* Error handling scenarios

### 12.2 Integration Tests
* API route functionality with mocked provider responses
* Client-server data flow
* Cache invalidation and refresh mechanisms
* Error propagation and fallback behavior

### 12.3 E2E Tests
* Complete model selection flow
* Provider failure scenarios
* Model migration scenarios
* Performance under load

### 12.4 Mock Strategy
```ts
// Enhanced mock setup for testing
const mockProviderResponses = {
  openrouter: {
    healthy: mockOpenRouterModels,
    degraded: mockPartialResponse,
    error: mockErrorResponse,
  },
  requesty: {
    healthy: mockRequestyModels,
    degraded: mockPartialResponse,
    error: mockErrorResponse,
  },
};
```

---

## 13. Performance Monitoring

### 13.1 Metrics to Track
* Model fetching latency per provider
* Cache hit/miss ratios
* Provider health check response times
* Client-side model picker performance
* Error rates and types

### 13.2 Alerting
* Provider downtime notifications
* High error rates
* Cache performance degradation
* Unusual model usage patterns

---

**Next Steps**: Begin implementation with Phase 1, focusing on the enhanced provider configuration system and robust server-side aggregator. The hybrid API key support should be implemented from the start to avoid architectural refactoring later. 