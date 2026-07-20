# Plan 002: Block client-supplied MCP `stdio` command/args (RCE)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 813aa2c..HEAD -- lib/chat/chatRequest.ts lib/services/chatMCPServerService.ts`
> If either file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `813aa2c`, 2026-07-20

## Why this matters

A client can send an MCP server config of `type: 'stdio'` with an arbitrary
`command`, `args`, and `env` in the `/api/chat` request body, and the server
will `spawn` it verbatim with the server process's privileges. The request body
is parsed with a bare cast (no schema, no allowlist):

```ts
// lib/chat/chatRequest.ts:118  (current)
mcpServers: (raw.mcpServers as MCPServerConfig[]) ?? [],
```

…which flows unchanged into:

```ts
// lib/services/chatMCPServerService.ts:272-276  (current)
return new StdioClientTransport({
    command: mcpServer.command,   // fully client-controlled
    args: mcpServer.args,         // fully client-controlled
    env: spawnEnv as Record<string, string>  // merged over process.env
});
```

The only "validation" at `chatMCPServerService.ts:252-258` is a `which` /
`python3 -c import` **presence** check (does the binary exist?) — not a
restriction on which binary or arguments are allowed. Any anonymous or
authenticated user who can reach `/api/chat` can therefore execute arbitrary
programs on the server: read `AUTH_SECRET`, `POLAR_ACCESS_TOKEN`,
`BLOB_READ_WRITE_TOKEN`, OpenRouter keys from `process.env`; reach the
database; pivot to internal services. This is remote code execution on a
production deployment that handles real money.

The fix: **reject `type: 'stdio'` MCP server configs that arrive from the
client.** stdio MCP is a local-development feature; a multi-tenant web app must
never spawn user-supplied commands. (The `streamable-http` and `sse` transports
are handled separately in Plan 003 — that is the URL-validation class of bug,
not command execution.)

## Current state

### Relevant files

- `lib/chat/chatRequest.ts` — request-body parser. `parseChatRequestBody` at
  `:109` casts `raw.mcpServers as MCPServerConfig[]` with no validation.
- `lib/services/chatMCPServerService.ts` — `createStdioTransport` at `:240`
  builds the `StdioClientTransport`. The `command`/`args` reach `StdioClientTransport`
  at `:272-276` unchanged. Presence checks at `:252-258`
  (`verifyUvAvailable`, `verifyPythonModuleFromArgs`) only confirm the binary
  exists; they do not restrict it.
- `lib/chat/executeChatStream.ts:45-48` — the entry point:
  `ChatMCPServerService.initializeMCPServers({ mcpServers: chatBody.mcpServers, ... })`.
- `app/api/chat/route.ts:53` — `parseChatRequestBody(body)` is where the body
  becomes `chatBody`.

### Type definition (locate and confirm during step 1)

`MCPServerConfig` is the type used at `chatRequest.ts:118`. It has a
discriminated `type` field (`'stdio' | 'sse' | 'streamable-http'`) plus
`command`/`args`/`env` (stdio) and `url`/`headers`/`useOAuth`/`oauthTokens`
(http). The executor should `grep -rn "type MCPServerConfig\|interface MCPServerConfig"`
to find the exact definition and read it before editing — do not assume the
field names.

### Excerpts (confirm before editing)

```ts
// lib/chat/chatRequest.ts:109-138  (parseChatRequestBody)
export function parseChatRequestBody(body: unknown): ChatRequestBody {
  const raw = (body ?? {}) as Record<string, unknown>;
  return {
    action: typeof raw.action === 'string' ? raw.action : undefined,
    operation: parseChatOperation(raw.operation),
    messages: (raw.messages as UIMessage[]) ?? [],
    chatId: typeof raw.chatId === 'string' ? raw.chatId : undefined,
    selectedModel: String(raw.selectedModel ?? ''),
    mcpServers: (raw.mcpServers as MCPServerConfig[]) ?? [],   // <-- no validation
    webSearch: (raw.webSearch as WebSearchOptions) ?? { enabled: false, contextSize: 'medium' },
    // ...
  };
}
```

```ts
// lib/services/chatMCPServerService.ts:240-276  (createStdioTransport)
private static async createStdioTransport(mcpServer: MCPServerConfig, requestId: string): Promise<Transport> {
    if (!mcpServer.command || !mcpServer.args || mcpServer.args.length === 0) {
        throw new Error("Missing command or args for stdio MCP server");
    }
    const env: Record<string, string> = {};
    if (mcpServer.env && mcpServer.env.length > 0) {
        mcpServer.env.forEach(envVar => { if (envVar.key) env[envVar.key] = envVar.value || ''; });
    }
    if (mcpServer.command === 'uvx') { await this.verifyUvAvailable(requestId); }
    else if (mcpServer.command.includes('python3')) { await this.verifyPythonModuleFromArgs(mcpServer.args, requestId); }
    logDiagnostic('MCP_STDIO_TRANSPORT', 'Creating Stdio transport', { /* ... */ });
    const spawnEnv = Object.keys(env).length > 0 ? { ...process.env, ...env } : process.env;
    return new StdioClientTransport({
        command: mcpServer.command,
        args: mcpServer.args,
        env: spawnEnv as Record<string, string>
    });
}
```

### Where `initializeMCPServers` is called

```ts
// lib/chat/executeChatStream.ts:45-48  (current)
const mcpResult = await ChatMCPServerService.initializeMCPServers({
    mcpServers: chatBody.mcpServers,
    selectedModel: chatBody.selectedModel,
});
```

### Repo conventions to match

- Error handling: the chat path returns structured errors via
  `createErrorResponse(code, message, status)` from
  `lib/chat/createErrorResponse.ts`, and `executeChatStream` already uses it
  (`executeChatStream.ts:55-61`). A blocked-stdio request should follow the same
  shape (e.g. code `'MCP_STDIO_BLOCKED'`, status `400`).
- Logging uses `logDiagnostic` from `@/lib/utils/performantLogging` (already
  imported in `chatMCPServerService.ts`).
- Tests: route-level tests live in `__tests__/api/...` with `@jest-environment node`,
  mocking `@/lib/auth` and the relevant service — see
  `__tests__/api/chats/[id]/active-leaf.test.ts:1-80` for the pattern.

## Commands you will need

| Purpose   | Command                                       | Expected on success |
|-----------|-----------------------------------------------|---------------------|
| Lint      | `pnpm lint`                                   | exit 0              |
| Typecheck | `pnpm exec tsc --noEmit`                      | exit 0, no errors   |
| Unit tests| `pnpm test:unit:ci`                           | exit 0, all pass    |
| Single test | `pnpm test:unit:ci -- mcp-stdio-block`     | the new test passes |
| Build     | `pnpm build`                                  | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `lib/chat/chatRequest.ts` — strip `type: 'stdio'` entries from `mcpServers`
  during parsing (defense in depth at the trust boundary).
- `lib/services/chatMCPServerService.ts` — harden `createStdioTransport` (or the
  dispatcher that selects it) to reject stdio configs; keep the hardening here
  so it holds even if a future caller bypasses `parseChatRequestBody`.
- `__tests__/lib/mcpStdioBlock.test.ts` — **create**; unit test the filter and
  the service-level rejection.

**Out of scope** (do NOT touch):
- `lib/services/chatMCPServerService.ts` SSE / `streamable-http` transport
  builders. URL/IP validation for those is Plan 003 — keep this plan scoped to
  the command-execution fix only.
- The MCP UI (`components/mcp-server-manager.tsx`) — the client may still
  *offer* stdio config in local dev; the server must simply refuse it in
  production. If you want to also hide the stdio option in the UI, do it in a
  separate plan.
- `app/api/chat/route.ts`, `lib/chat/executeChatStream.ts` — no changes needed;
  the fix is in the parser and the transport builder.

## Git workflow

- Branch: `advisor/002-block-mcp-stdio-rce`
- Two commits: (1) server-side hardening + service test, (2) parser-level
  filter + parser test. Conventional-commit style, e.g.
  `fix(security): reject client-supplied MCP stdio commands (RCE)`.
- Do NOT push or open a PR unless the operator instructs it.

## Steps

### Step 1: Locate the `MCPServerConfig` type and confirm field names

Run `grep -rn "MCPServerConfig" lib/ | head` and read the type definition.
Confirm the discriminated `type` field and the `command`/`args`/`env` fields
exist on the stdio variant. Record the file path — you'll need it for imports
in the test.

**Verify**: you can name the file that declares `MCPServerConfig` and the
literal string value of the stdio discriminant (expected `'stdio'`).

### Step 2: Strip stdio configs at the parser (trust boundary)

In `lib/chat/chatRequest.ts`, replace the bare cast:

```ts
mcpServers: (raw.mcpServers as MCPServerConfig[]) ?? [],
```

with a filter that drops stdio entries and logs the rejection:

```ts
mcpServers: filterOutStdioMcpServers(raw.mcpServers),
```

Add a small helper in the same file (above `parseChatRequestBody`):

```ts
function filterOutStdioMcpServers(raw: unknown): MCPServerConfig[] {
  if (!Array.isArray(raw)) return [];
  const accepted: MCPServerConfig[] = [];
  for (const entry of raw) {
    if (entry && typeof entry === 'object' && (entry as MCPServerConfig).type === 'stdio') {
      // stdio spawns server-side processes from client input — never accept it.
      console.warn('[chatRequest] Rejected client-supplied stdio MCP server config.');
      continue;
    }
    accepted.push(entry as MCPServerConfig);
  }
  return accepted;
}
```

Rationale: defense in depth. Even if a future caller skips the service check,
the parser is the trust boundary between the wire and the app.

**Verify**: `pnpm exec tsc --noEmit` → exit 0, no errors.

### Step 3: Harden the service to refuse stdio (authoritative guard)

The parser is the first line, but the authoritative guard belongs in
`ChatMCPServerService` so any caller is protected. In
`lib/services/chatMCPServerService.ts`, find the transport dispatcher (the
`switch`/`if` on `mcpServer.type` that routes to `createStdioTransport` /
`createSSETransport` / `createStreamableHTTPTransport`). For the stdio branch,
throw a typed error instead of building the transport. Keep the
`createStdioTransport` method present but unreachable from the dispatcher
(delete it only if nothing else references it — check with
`grep -n createStdioTransport`).

Shape:

```ts
if (mcpServer.type === 'stdio') {
  logDiagnostic('MCP_STDIO_BLOCKED', 'Rejected client-supplied stdio MCP config', { requestId });
  throw new Error('MCP_STDIO_BLOCKED: stdio MCP servers are not permitted from client requests.');
}
```

If `initializeMCPServers` currently catches per-server errors and continues,
confirm a thrown error here surfaces as a request failure rather than a silent
skip. If it silently skips, make the failure explicit (the whole request should
fail, not proceed with a missing server the user expected). Read
`initializeMCPServers` before deciding.

**Verify**:
- `grep -n "StdioClientTransport" lib/services/chatMCPServerService.ts` → the
  only remaining reference is inside `createStdioTransport`, which is now
  unreachable from the dispatcher (or deleted).
- `pnpm exec tsc --noEmit` → exit 0.

### Step 4: Add tests

Create `__tests__/lib/mcpStdioBlock.test.ts` with two unit tests:

1. **Parser drops stdio**: call `parseChatRequestBody` with a body containing
   one `stdio` and one `streamable-http` MCP server; assert the result's
   `mcpServers` has length 1 and the surviving entry has
   `type === 'streamable-http'`.
2. **Service refuses stdio**: construct a `stdio` `MCPServerConfig` and assert
   `ChatMCPServerService.initializeMCPServers` (or the dispatcher method, if
   callable) throws / rejects. Mock `StdioClientTransport` so the test would
   *fail* if the guard were removed (i.e. assert it was never constructed).

Model the test structure on
`__tests__/api/chats/[id]/active-leaf.test.ts` (`@jest-environment node`,
`jest.mock` for any heavy dependency). Import the parser directly:

```ts
import { parseChatRequestBody } from '@/lib/chat/chatRequest';
```

**Verify**: `pnpm test:unit:ci -- mcpStdioBlock` → 2 passed, 0 failed.

### Step 5: Full verification

**Verify** (all must pass):
- `pnpm lint` → exit 0
- `pnpm exec tsc --noEmit` → exit 0
- `pnpm test:unit:ci` → exit 0 (all pre-existing tests still pass + 2 new)
- `pnpm build` → exit 0

## Test plan

- `__tests__/lib/mcpStdioBlock.test.ts`:
  - `parseChatRequestBody` strips `type: 'stdio'` entries and keeps http/sse.
  - `ChatMCPServerService` refuses a stdio config (throws; never constructs
    `StdioClientTransport`).
- Pattern: `__tests__/api/chats/[id]/active-leaf.test.ts` for the
  `@jest-environment node` + `jest.mock` shape.
- Verification: `pnpm test:unit:ci -- mcpStdioBlock` → 2 passed.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] A request body with `mcpServers: [{ type: 'stdio', command: 'anything', args: [] }]`
      yields `chatBody.mcpServers` of length 0 (parser filter works).
- [ ] `grep -n "StdioClientTransport({" lib/services/chatMCPServerService.ts`
      shows the call site is either deleted or unreachable from the dispatcher
      (the stdio branch throws before reaching it).
- [ ] `pnpm exec tsc --noEmit` exits 0
- [ ] `pnpm lint` exits 0
- [ ] `pnpm test:unit:ci` exits 0; `mcpStdioBlock.test.ts` exists with 2 passing tests
- [ ] `pnpm build` exits 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the cited locations doesn't match the excerpts (drifted since
  `813aa2c`).
- `MCPServerConfig` does not have a `type` discriminant, or the stdio variant
  uses a different literal than `'stdio'` — the filter predicate must match
  reality; report what you found and stop.
- `initializeMCPServerService` (or its dispatcher) has no single place that
  switches on `mcpServer.type` — the architecture may have changed; report and
  stop rather than scattering guards.
- Throwing in the service silently drops the server instead of failing the
  request, AND making it fail-fast would require touching out-of-scope files
  (`executeChatStream.ts`, `app/api/chat/route.ts`). Report and ask.
- Any stdio MCP test in the existing suite (`grep -rn "stdio" __tests__/`)
  breaks because of this change and cannot be updated within scope.

## Maintenance notes

- If stdio MCP support is ever legitimately needed in production, it must be
  served from a **server-curated allowlist** of `{command, args}` tuples (read
  from env/config, never the request body), with `env` never merged over
  `process.env`. This plan intentionally does not build that allowlist — the
  feature is local-dev-only and the safe default is to refuse.
- Plan 003 handles the sibling transports (`streamable-http`, `sse`) — the URL
  SSRF fix. The two plans are independent but both touch
  `chatMCPServerService.ts`; if landed in parallel, resolve the merge by
  keeping both guards (parser-level stdio filter + service-level URL
  validation).
- A reviewer should `grep -n "StdioClientTransport"` to confirm no path reaches
  the spawn with client input, and run the new test to see it fail without the
  guard.
