# Plan 003: Block SSRF in the MCP OAuth proxy and MCP `streamable-http`/`sse` transports

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 813aa2c..HEAD -- app/api/mcp/oauth/proxy/route.ts lib/services/chatMCPServerService.ts lib/services/webFetchService.ts`
> If any file changed since this plan was written, compare the "Current state"
> excerpts against the live code before proceeding; on a mismatch, treat it as
> a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW–MED
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `813aa2c`, 2026-07-20

## Why this matters

Two separate SSRF sinks let a client make the server fetch arbitrary URLs,
bypassing the IP blocklist the codebase **already has** for the `web_fetch`
tool:

1. **Unauthenticated SSRF — MCP OAuth proxy** (`app/api/mcp/oauth/proxy/route.ts`).
   The GET handler at `:41` and POST handler at `:112` take a `url` query param,
   do only a pathname `includes()` substring check (trivially bypassable:
   `https://attacker/.well-known/oauth-anything` passes), then `fetch(targetUrl)`
   with **no auth**, **no private-IP blocklist**, and **default redirect-following**.
   The response body is returned to the caller — a full read-back SSRF:
   `http://169.254.169.254/...` cloud-metadata, internal Neon/Vercel-internal
   services, or `localhost` admin ports are all reachable and readable.
   POST additionally forwards an attacker-controlled JSON body.

2. **Authenticated SSRF — MCP `streamable-http`/`sse` transports**
   (`lib/services/chatMCPServerService.ts`). `createSSETransport` at `:229` and
   `createStreamableHTTPTransport` at `:307` construct transports from a URL
   taken straight from the `/api/chat` request body (`chatRequest.ts:118`). The
   URL is never run through the IP blocklist. The client also controls
   `oauthTokens.access_token`, which becomes an attacker-chosen
   `Authorization: Bearer` header on the outbound request (`:291-292`).

The codebase already has the correct validation primitive —
`WebFetchService.assertPublicUrl` (`lib/services/webFetchService.ts:421`) blocks
`localhost`, `.local`, all private IPv4 ranges, `169.254.0.0/16` (metadata),
`100.64.0.0/10` (CGN), IPv6 `::1`/`fc00::/7`/`fe80::/10`, plus embedded
credentials and DNS resolution. Both SSRF sinks just need to call it. This plan
reuses that primitive rather than reinventing it.

## Current state

### The reusable guard (exists, needs exposing)

```ts
// lib/services/webFetchService.ts:421-458  (assertPublicUrl — currently PRIVATE)
private static async assertPublicUrl(url: string): Promise<void> {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
        throw new WebFetchError("WEB_FETCH_FORBIDDEN_HOST", "Local and private network hosts are not allowed.", 403);
    }
    const directIp = isIP(hostname) ? hostname : null;
    if (directIp && this.isBlockedIp(directIp)) { /* throw */ }
    if (!directIp) {
        const records = await lookup(hostname, { all: true });   // resolves DNS
        // throws if any resolved IP is blocked
    }
}
```

Also relevant — `validateAndNormalizeUrl` at `:377` rejects non-http(s), embedded
credentials (`userinfo`), and missing protocols. And the `fetchPage` /
`fetchSingleUrl` methods already re-call `assertPublicUrl(currentUrl)` after each
redirect (`:113`, `:197`, `:294`) — that is the established redirect-safety
pattern in this codebase.

`WebFetchError` is already exported (`lib/services/webFetchService.ts:61`).

### The MCP OAuth proxy (sink #1)

```ts
// app/api/mcp/oauth/proxy/route.ts:15-85  (GET — current)
export async function GET(request: NextRequest) {
    const targetUrl = searchParams.get('url');
    const url = new URL(targetUrl);
    const isOAuthEndpoint =
        url.pathname.includes('/.well-known/oauth') ||   // substring, bypassable
        url.pathname.includes('/api/auth/mcp/');
    if (!isOAuthEndpoint) { return 400; }
    const response = await fetch(targetUrl, {   // <-- no auth, no IP check, follows redirects
        method: 'GET',
        headers: { 'Accept': 'application/json', 'User-Agent': 'ChatLima-MCP-Client/1.0' },
    });
    // ... response body returned to caller ...
}
```

POST (`:87-158`) is structurally identical, plus forwards the JSON body at `:119`.
Neither handler imports or calls `auth` or `WebFetchService`.

### The MCP HTTP transports (sink #2)

```ts
// lib/services/chatMCPServerService.ts:229-234  (SSE)
return new SSEClientTransport(new URL(mcpServer.url), /* headers */);

// lib/services/chatMCPServerService.ts:307-318  (Streamable HTTP)
const transportUrl = new URL(mcpServer.url);
if (mcpServer.useOAuth && mcpServer.oauthTokens?.access_token) {
    headers['Authorization'] = `Bearer ${mcpServer.oauthTokens.access_token}`;  // client-chosen bearer
}
return new StreamableHTTPClientTransport(transportUrl, /* requestInit */);
```

Both URLs come from `chatBody.mcpServers` (client body). Neither is validated.

### Repo conventions to match

- Auth on API routes uses `auth.api.getSession({ headers: req.headers })` (see
  `app/api/chats/migrate/route.ts:14`, `app/api/cost-calculate/route.ts`); throw
  `NextResponse.json({ error }, { status: 401 })` when absent. For admin-style
  routes, `AuthMiddleware.requireAuth` in `lib/middleware/auth.ts` is the
  higher-level helper.
- Error responses follow `NextResponse.json({ error: '...' }, { status })`.
- Tests: `__tests__/api/chats/[id]/active-leaf.test.ts:1-80` —
  `@jest-environment node`, `jest.mock('@/lib/auth', ...)`, invoke the exported
  handler with a constructed `NextRequest`.

## Commands you will need

| Purpose   | Command                                       | Expected on success |
|-----------|-----------------------------------------------|---------------------|
| Lint      | `pnpm lint`                                   | exit 0              |
| Typecheck | `pnpm exec tsc --noEmit`                      | exit 0, no errors   |
| Unit tests| `pnpm test:unit:ci`                           | exit 0, all pass    |
| Single test | `pnpm test:unit:ci -- mcpSsrf\|oauthProxy`  | new tests pass      |
| Build     | `pnpm build`                                  | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `lib/services/webFetchService.ts` — expose `assertPublicUrl` and
  `validateAndNormalizeUrl` (make them `public static`, or add thin public
  wrappers). Pure visibility change, no behavior change.
- `app/api/mcp/oauth/proxy/route.ts` — add auth, validate URL via
  `assertPublicUrl`, tighten the pathname match, disable auto-redirect
  following (re-validate each hop).
- `lib/services/chatMCPServerService.ts` — validate `mcpServer.url` via
  `assertPublicUrl` before constructing the SSE / Streamable HTTP transport.
  (Stdio is out of scope — Plan 002 handles command execution.)
- `__tests__/lib/mcpSsrfGuard.test.ts` — **create**; tests for the transport
  URL guard.
- `__tests__/api/mcpOauthProxy.test.ts` — **create**; tests for the proxy
  (unauth → 401, private IP → 403, public URL → proxied).

**Out of scope** (do NOT touch):
- `lib/chat/chatRequest.ts` (Plan 002 territory for stdio; the http/sse URL
  validation belongs in the service where the transport is built, not the
  parser, because the same `MCPServerConfig` is used for display/testing).
- The stdio transport (`createStdioTransport`) — Plan 002.
- `WebFetchService.fetchPage` / `fetchSingleUrl` — already correct; only the
  private helpers' visibility changes here.
- `lib/services/webFetchService.ts` IP-list logic — do not alter the blocklist;
  only expose it.

## Git workflow

- Branch: `advisor/003-block-mcp-oauth-ssrf`
- Three logical commits: (1) expose the guard, (2) harden the proxy, (3) harden
  the MCP transports + tests. Conventional-commit style, e.g.
  `fix(security): block SSRF in MCP OAuth proxy and HTTP transports`.

## Steps

### Step 1: Expose the URL-safety guard

In `lib/services/webFetchService.ts`, change the visibility of two methods so
the MCP paths can reuse the **same** validation the `web_fetch` tool uses:

- `private static async assertPublicUrl(url: string)` → `static async assertPublicUrl(url: string)` (line ~421)
- `private static validateAndNormalizeUrl(rawUrl: string)` → `static validateAndNormalizeUrl(rawUrl: string)` (line ~377)

Leave their bodies unchanged. Do **not** alter `isBlockedIp` / `isPrivateIPv4`
(keep them private; they're encapsulated by `assertPublicUrl`).

If you prefer not to widen the public surface, the alternative is to add two
thin public wrappers that delegate — but the visibility flip is simpler and the
methods are pure validation with no internal state. Pick the visibility flip.

**Verify**: `pnpm exec tsc --noEmit` → exit 0 (the visibility change should not
break any existing caller).

### Step 2: Harden the MCP OAuth proxy (sink #1)

Rewrite `app/api/mcp/oauth/proxy/route.ts` GET and POST to:

1. **Require auth.** Add at the top of each handler:
   ```ts
   const session = await auth.api.getSession({ headers: request.headers });
   if (!session?.user?.id) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```
   Import `auth` from `@/lib/auth`.

2. **Validate the URL.** Before fetching, call:
   ```ts
   const normalized = WebFetchService.validateAndNormalizeUrl(targetUrl);
   await WebFetchService.assertPublicUrl(normalized);
   ```
   Catch `WebFetchError` and return its `status` (or 403) with
   `{ error: 'URL not allowed' }`. The pathname check below uses `normalized`.

3. **Tighten the pathname gate.** Replace the bypassable `includes()`:
   ```ts
   const isOAuthMetadata =
       url.pathname === '/.well-known/oauth-authorization-server' ||
       url.pathname === '/.well-known/oauth-protected-resource';
   const isMcpRegister = url.pathname === '/api/auth/mcp/register';
   ```
   GET allows metadata OR register; POST allows register only (match current
   intent). Use exact equality, not substring.

4. **Disable auto-redirect; re-validate each hop.** OAuth metadata endpoints
   rarely redirect; when they do, the redirect target must be re-validated
   (mirrors `fetchSingleUrl` at `webFetchService.ts:197`). Fetch with
   `redirect: 'manual'`, and if the response is a 3xx, parse `Location`, run it
   through `validateAndNormalizeUrl` + `assertPublicUrl`, and fetch again. Cap
   at 3 hops. If `Location` points to a blocked host, return 403. (If this
   redirect loop proves fiddly, the acceptable simpler fallback is
   `redirect: 'error'` — refuse redirects entirely for these metadata
   endpoints. Note which you chose.)

5. Keep the existing response-parsing logic (JSON-then-text fallback) unchanged.

**Verify**:
- `grep -n "auth.api.getSession" app/api/mcp/oauth/proxy/route.ts` → present in
  both handlers.
- `grep -n "assertPublicUrl" app/api/mcp/oauth/proxy/route.ts` → present in both
  handlers.
- `grep -n "includes('/.well-known/oauth')" app/api/mcp/oauth/proxy/route.ts`
  → no matches (substring check removed).
- `pnpm exec tsc --noEmit` → exit 0.

### Step 3: Harden the MCP HTTP transports (sink #2)

In `lib/services/chatMCPServerService.ts`, before constructing either
transport, validate the URL. Add a shared private helper on the class:

```ts
private static async assertSafeMcpUrl(rawUrl: string, requestId: string): Promise<URL> {
    const normalized = WebFetchService.validateAndNormalizeUrl(rawUrl);
    await WebFetchService.assertPublicUrl(normalized);
    return new URL(normalized);
}
```

Then in `createSSETransport` (~:229) and `createStreamableHTTPTransport`
(~:307), replace `new URL(mcpServer.url)` with:

```ts
const transportUrl = await ChatMCPServerService.assertSafeMcpUrl(mcpServer.url, requestId);
```

(Both methods must become `async` if they aren't already — check the call site
in the dispatcher and `await` them. If making them async ripples widely,
instead validate at the top of the dispatcher and let the existing sync
transport builders take an already-validated `URL`. Pick whichever is less
invasive; report the choice.)

Catch `WebFetchError` at the dispatcher level and throw a typed
`MCP_URL_BLOCKED` error so the chat request fails explicitly rather than
silently dropping the server. Note: this closes the direct-private-IP and
localhost cases. A DNS-rebind attacker who flips their DNS record between
`assertPublicUrl`'s `lookup()` and the transport's own connection could still
pivot — document this residual in a code comment. (A fuller fix — injecting a
custom `fetch` into the transports that re-validates per request — is noted
under Maintenance notes; do not build it in this plan unless the SDK makes it
trivial.)

Import `WebFetchService` and `WebFetchError` at the top of
`chatMCPServerService.ts`.

**Verify**:
- `grep -n "assertSafeMcpUrl\|assertPublicUrl" lib/services/chatMCPServerService.ts`
  → present.
- `grep -n "new URL(mcpServer.url)" lib/services/chatMCPServerService.ts` → no
  matches remaining in the SSE/HTTP branches (all routed through the guard).
- `pnpm exec tsc --noEmit` → exit 0.

### Step 4: Tests — proxy

Create `__tests__/api/mcpOauthProxy.test.ts`. Import `GET` and `POST` from
`@/app/api/mcp/oauth/proxy/route`. Mock `@/lib/auth` (unauthenticated → `null`;
authenticated → `{ user: { id: 'u1' } }`). Mock `WebFetchService.assertPublicUrl`
to throw on `localhost`/`169.254.169.254` and resolve on public hosts. Cases:

1. Unauthenticated GET → `401`.
2. Authenticated GET with `url=http://169.254.169.254/...` → `403`.
3. Authenticated GET with `url=http://localhost/foo` → `403`.
4. Authenticated GET with a bypass-attempt pathname
   (`https://attacker.example/.well-known/oauth-anything`) → `400` (the
   tightened exact-match gate rejects it).
5. Authenticated GET with a valid public `.well-known/oauth-authorization-server`
   URL → `200` and the proxied body (mock `fetch`/`globalThis.fetch`).
6. Authenticated POST to `/api/auth/mcp/register` on a public host → `200`;
   POST to a private host → `403`.

Use the `__tests__/api/chats/[id]/active-leaf.test.ts` structure
(`@jest-environment node`, constructed `NextRequest`).

### Step 5: Tests — MCP transport guard

Create `__tests__/lib/mcpSsrfGuard.test.ts`. Import
`ChatMCPServerService` (or the dispatcher method). Cases:

1. A `streamable-http` config with `url: 'http://169.254.169.254/'` is rejected
   (throws / the request fails) and `StreamableHTTPClientTransport` is never
   constructed.
2. A `sse` config with `url: 'http://localhost:3000/'` is rejected.
3. A `streamable-http` config with a public `https://` URL is accepted (mock
   `assertPublicUrl` to resolve).

Mock `WebFetchService.assertPublicUrl` to drive the cases. Mock the transport
constructors (`SSEClientTransport`, `StreamableHTTPClientTransport`) so the
test asserts they were/weren't called.

**Verify**: `pnpm test:unit:ci -- mcpOauthProxy|mcpSsrfGuard` → all pass.

### Step 6: Full verification

**Verify** (all must pass):
- `pnpm lint` → exit 0
- `pnpm exec tsc --noEmit` → exit 0
- `pnpm test:unit:ci` → exit 0 (pre-existing + new tests)
- `pnpm build` → exit 0

## Test plan

- `__tests__/api/mcpOauthProxy.test.ts`: 6 cases above (unauth, private-IP GET,
  localhost GET, bypass-attempt pathname, valid public GET, POST public/private).
- `__tests__/lib/mcpSsrfGuard.test.ts`: 3 cases above (metadata IP rejected,
  localhost rejected, public accepted).
- Pattern: `__tests__/api/chats/[id]/active-leaf.test.ts`.
- Verification: `pnpm test:unit:ci` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n "auth.api.getSession" app/api/mcp/oauth/proxy/route.ts` → in
      both GET and POST.
- [ ] `grep -n "assertPublicUrl" app/api/mcp/oauth/proxy/route.ts lib/services/chatMCPServerService.ts`
      → present in both proxy handlers and both HTTP transport builders.
- [ ] `grep -n "includes('/.well-known/oauth')" app/api/mcp/oauth/proxy/route.ts`
      → no matches (exact-match only).
- [ ] `grep -n "new URL(mcpServer.url)" lib/services/chatMCPServerService.ts`
      → no matches in SSE/HTTP branches.
- [ ] `assertPublicUrl` and `validateAndNormalizeUrl` are `public static` (or
      wrapped) in `webFetchService.ts`.
- [ ] `pnpm exec tsc --noEmit` exits 0
- [ ] `pnpm lint` exits 0
- [ ] `pnpm test:unit:ci` exits 0; both new test files exist and pass
- [ ] `pnpm build` exits 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the cited locations doesn't match the excerpts (drifted since
  `813aa2c`).
- `assertPublicUrl` or `validateAndNormalizeUrl` has moved or been renamed in
  `webFetchService.ts` — the visibility flip must target the real symbols.
- `createSSETransport` / `createStreamableHTTPTransport` are not the methods
  that construct the transports (architecture changed) — report what you found.
- Making the transport builders `async` ripples beyond
  `chatMCPServerService.ts` and would force touching `executeChatStream.ts` or
  `app/api/chat/route.ts`. Report and ask — the fallback is validating at the
  dispatcher top and passing a validated `URL` down.
- The `@modelcontextprotocol/sdk` transports accept a custom `fetch` option
  (check the SDK source) — if so, the better fix is injecting a guarded fetch
  that re-validates per request. If that's low-effort, do it; if not, ship the
  pre-validation fix and note the DNS-rebind residual. Report either way.

## Maintenance notes

- **Residual risk (DNS rebind):** `assertPublicUrl` resolves DNS once at call
  time. A transport that later opens its own connection (with its own DNS
  resolution) could be pointed at a private IP if the attacker flips their DNS
  between the two resolutions. The direct-IP and localhost cases are fully
  closed; the rebind case is not. The complete fix is to pass a custom `fetch`
  to `SSEClientTransport` / `StreamableHTTPClientTransport` that re-runs
  `assertPublicUrl` on every outbound request — pursue this as a follow-up if
  the SDK supports it (check `opensrc path @modelcontextprotocol/sdk` for the
  transport constructor options).
- **OAuth tokens from the client:** the client-supplied
  `oauthTokens.access_token` (`chatMCPServerService.ts:291`) sets a
  chosen `Authorization` header on outbound requests. Even with URL validation,
  this lets a user send a chosen bearer token to a public host of their choice
  (request smuggling / token abuse surface). Consider resolving MCP OAuth
  tokens server-side only as a follow-up — out of scope here because it's an
  auth-flow change, not SSRF.
- A reviewer should run the two new test files with the guards removed to
  confirm they fail (proving they actually exercise the fix).
