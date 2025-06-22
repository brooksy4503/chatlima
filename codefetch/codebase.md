You are a senior developer. You produce optimized, maintainable code that follows best practices. 

Your task is to review the current codebase and fix the current issues.

Current Issue:
<issue>
Suggest 3 New Simple Features to implement 
</issue>

Rules:
- Keep your suggestions concise and focused. Avoid unnecessary explanations or fluff. 
- Your output should be a series of specific, actionable changes.

When approaching this task:
1. Carefully review the provided code.
2. Identify the area thats raising this issue or error and provide a fix.
3. Consider best practices for the specific programming language used.

For each suggested change, provide:
1. A short description of the change (one line maximum).
2. The modified code block.

Use the following format for your output:

[Short Description]
```[language]:[path/to/file]
[code block]
```

Begin fixing the codebase provide your solutions.

My current codebase:
<current_codebase>
Project Structure:
├── LICENSE
├── MCP_UPGRADE_GUIDE.md
├── README.md
├── ai
│   └── providers.ts
├── app
│   ├── actions.ts
│   ├── api
│   │   ├── auth
│   │   │   ├── [...betterauth]
│   │   │   │   └── route.ts
│   │   │   ├── polar
│   │   │   │   ├── route.ts
│   │   │   └── sign-in
│   │   ├── chat
│   │   │   └── route.ts
│   │   ├── chats
│   │   │   ├── [id]
│   │   │   │   └── route.ts
│   │   │   ├── migrate
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── create-polar-customer
│   │   │   └── route.ts
│   │   ├── credits
│   │   │   └── route.ts
│   │   ├── debug-credits
│   │   │   └── route.ts
│   │   ├── portal
│   │   │   └── route.ts
│   │   ├── usage
│   │   │   └── messages
│   │   │       └── route.ts
│   │   └── version
│   │       └── route.ts
│   ├── chat
│   │   └── [id]
│   │       └── page.tsx
│   ├── checkout
│   │   ├── error
│   │   │   └── page.tsx
│   │   └── success
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── opengraph-image.png
│   ├── page.tsx
│   ├── providers.tsx
│   ├── robots.txt
│   │   └── route.ts
│   ├── sitemap.xml
│   │   └── route.ts
│   └── twitter-image.png
├── auth-schema.ts
├── chatlima.code-workspace
├── codefetch
│   ├── codebase.md
│   └── prompts
│       └── default.md
├── codefetch.config.mjs
├── components
│   ├── api-key-manager.tsx
│   ├── auth
│   │   ├── AnonymousAuth.tsx
│   │   ├── SignInButton.tsx
│   │   └── UserAccountMenu.tsx
│   ├── chat-list.tsx
│   ├── chat-sidebar.tsx
│   ├── chat.tsx
│   ├── checkout-button.tsx
│   ├── citation.tsx
│   ├── copy-button.tsx
│   ├── deploy-button.tsx
│   ├── icons.tsx
│   ├── input.tsx
│   ├── ios-install-prompt.tsx
│   ├── markdown.tsx
│   ├── mcp-server-manager.tsx
│   ├── message.tsx
│   ├── messages.tsx
│   ├── mobile
│   ├── model-picker.tsx
│   ├── project-overview.tsx
│   ├── suggested-prompts.tsx
│   ├── textarea.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   ├── tool-invocation.tsx
│   ├── top-nav.tsx
│   ├── ui
│   │   ├── BuildInfo.tsx
│   │   ├── accordion.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── popover.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx
│   │   ├── switch.tsx
│   │   ├── text-morph.tsx
│   │   ├── textarea.tsx
│   │   └── tooltip.tsx
│   └── web-search-suggestion.tsx
├── components.json
├── docs
├── drizzle
│   ├── 0000_supreme_rocket_raccoon.sql
│   ├── 0001_curious_paper_doll.sql
│   ├── 0002_free_cobalt_man.sql
│   ├── 0003_oval_energizer.sql
│   ├── 0004_tense_ricochet.sql
│   ├── 0005_early_payback.sql
│   ├── 0007_update_verification_table.sql
│   ├── 0008_alter_accounts_expiresat_type.sql
│   ├── 0009_alter_users_emailverified_type.sql
│   ├── 0010_optimal_jane_foster.sql
│   ├── 0011_fixed_cerebro.sql
│   ├── 0012_tearful_misty_knight.sql
│   ├── 0013_special_whirlwind.sql
│   ├── 0014_fair_praxagora.sql
│   ├── 0015_remarkable_owl.sql
│   ├── 0016_cooing_lester.sql
│   ├── 0017_past_bromley.sql
│   ├── 0018_conscious_dragon_man.sql
│   ├── 0018_manual_polar_events.sql
│   ├── 0019_fix_session_token.sql
│   ├── 0020_rainy_rockslide.sql
│   ├── 0021_aberrant_baron_zemo.sql
│   ├── meta
│   │   ├── 0001_snapshot.json
│   │   ├── 0002_snapshot.json
│   │   ├── 0003_snapshot.json
│   │   ├── 0004_snapshot.json
│   │   ├── 0005_snapshot.json
│   │   ├── 0007_snapshot.json
│   │   ├── 0008_snapshot.json
│   │   ├── 0009_snapshot.json
│   │   ├── 0010_snapshot.json
│   │   ├── 0011_snapshot.json
│   │   ├── 0012_snapshot.json
│   │   ├── 0013_snapshot.json
│   │   ├── 0014_snapshot.json
│   │   ├── 0015_snapshot.json
│   │   ├── 0016_snapshot.json
│   │   ├── 0017_snapshot.json
│   │   ├── 0018_snapshot.json
│   │   ├── 0020_snapshot.json
│   │   ├── 0021_snapshot.json
│   │   └── _journal.json
│   └── migrations
│       └── 0003_add_web_search.sql
├── drizzle.config.ts
├── eslint.config.mjs
├── hooks
│   ├── use-mobile.ts
│   ├── useAuth.ts
│   └── useCredits.ts
├── lib
│   ├── auth-client.ts
│   ├── auth.ts
│   ├── chat-store.ts
│   ├── constants.ts
│   ├── context
│   │   ├── mcp-context.tsx
│   │   ├── model-context.tsx
│   │   └── web-search-context.tsx
│   ├── db
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── hooks
│   │   ├── use-chats.ts
│   │   ├── use-copy.ts
│   │   ├── use-local-storage.ts
│   │   └── use-scroll-to-bottom.tsx
│   ├── polar.ts
│   ├── tokenCounter.ts
│   ├── types.ts
│   └── utils.ts
├── next-env.d.ts
├── next.config.ts
├── package.json
├── playwright
├── playwright-report
│   ├── data
│   │   ├── 46fa7c505fd617ddf34563badbcaa93e9b325a24.md
│   │   ├── 68543ca30fcbaf77133168c4979b10ffe9f2174a.webm
│   │   ├── bdf017e1bcc86645e8664bdd7f33085fcbce1f3f.png
│   │   └── bfe39c3bf09ab2664064951fb21e5d877c273eb6.webm
│   └── index.html
├── playwright.config.ts
├── playwright.local.config.ts
├── pnpm-lock.yaml
├── postcss.config.mjs
├── public
│   ├── apple-touch-icon-120x120.png
│   ├── apple-touch-icon-152x152.png
│   ├── apple-touch-icon-167x167.png
│   ├── apple-touch-icon-180x180.png
│   ├── apple-touch-icon.png
│   ├── file.svg
│   ├── globe.svg
│   ├── logo.png
│   ├── manifest.json
│   ├── next.svg
│   ├── scira.png
│   ├── vercel.svg
│   └── window.svg
├── railpack.json
├── releases
│   ├── RELEASE_NOTES_v0.10.0.md
│   ├── RELEASE_NOTES_v0.11.0.md
│   ├── RELEASE_NOTES_v0.12.0.md
│   ├── RELEASE_NOTES_v0.12.1.md
│   ├── RELEASE_NOTES_v0.13.0.md
│   ├── RELEASE_NOTES_v0.14.0.md
│   ├── RELEASE_NOTES_v0.16.0.md
│   ├── RELEASE_NOTES_v0.16.1.md
│   ├── RELEASE_NOTES_v0.17.0.md
│   ├── RELEASE_NOTES_v0.17.1.md
│   ├── RELEASE_NOTES_v0.17.2.md
│   ├── RELEASE_NOTES_v0.18.0.md
│   ├── RELEASE_NOTES_v0.3.0.md
│   ├── RELEASE_NOTES_v0.3.1.md
│   ├── RELEASE_NOTES_v0.4.0.md
│   ├── RELEASE_NOTES_v0.4.1.md
│   ├── RELEASE_NOTES_v0.5.0.md
│   ├── RELEASE_NOTES_v0.5.1.md
│   ├── RELEASE_NOTES_v0.5.2.md
│   ├── RELEASE_NOTES_v0.6.0.md
│   ├── RELEASE_NOTES_v0.8.0.md
│   ├── RELEASE_NOTES_v0.9.0.md
│   └── RELEASE_NOTES_v0.9.1.md
├── reset_db.sql
├── scripts
│   ├── README.md
│   ├── analyze-openrouter-data.py
│   ├── debug-polar-api.ts
│   └── openrouter-pricing-analysis.ts
├── test-results
│   ├── auth.local.setup.ts-authenticate-locally-local-setup
│   │   ├── error-context.md
│   │   ├── test-failed-1.png
│   │   └── video.webm
│   └── chatlima-anonymous-test-Ch-1876e-th-anonymous-authentication-local-anonymous-chromium
│       ├── test-failed-1.png
│       └── video.webm
├── tests
│   ├── README-TESTING.md
│   ├── auth.local.setup.ts
│   ├── auth.setup.ts
│   ├── chatlima-anonymous-test.spec.ts
│   └── chatlima-deepseek-test.spec.ts
├── tsconfig.json
└── tsconfig.tsbuildinfo


MCP_UPGRADE_GUIDE.md
```
1 | # MCP 1.13.0 Upgrade Guide for ChatLima
2 | 
3 | This guide outlines the steps needed to upgrade ChatLima from MCP SDK 1.12.0 to 1.13.0 to leverage the latest Model Context Protocol features and improvements.
4 | 
5 | ## Overview
6 | 
7 | MCP 1.13.0 introduces several important changes including:
8 | - **MCP-Protocol-Version header requirement** for HTTP transport (BREAKING CHANGE)
9 | - **Resource template reference naming changes** (BREAKING CHANGE)
10 | - **Enhanced metadata support** with `_meta` fields
11 | - **Tool, resource, and prompt titles** for better UI display
12 | - **Resource links** in tool outputs
13 | - **Context-aware completions**
14 | - **Elicitation capability** for interactive workflows
15 | - **Resource Indicators** (RFC 8707) for security
16 | 
17 | ## Step 1: Update Package Dependencies
18 | 
19 | First, update the MCP SDK to the latest version:
20 | 
21 | ```bash
22 | pnpm update @modelcontextprotocol/sdk@^1.13.0
23 | ```
24 | 
25 | Update your `package.json`:
26 | 
27 | ```json
28 | {
29 |   "dependencies": {
30 |     "@modelcontextprotocol/sdk": "^1.13.0"
31 |   }
32 | }
33 | ```
34 | 
35 | ## Step 2: Update StreamableHTTP Transport (BREAKING CHANGE)
36 | 
37 | The most critical change is the **MCP-Protocol-Version header requirement** for HTTP transport.
38 | 
39 | ### Current Implementation Issue
40 | 
41 | Your current code in `app/api/chat/route.ts` (lines 378-383) creates `StreamableHTTPClientTransport` without the required protocol version header:
42 | 
43 | ```typescript
44 | // CURRENT CODE - NEEDS UPDATE
45 | finalTransportForClient = new StreamableHTTPClientTransport(transportUrl, {
46 |   requestInit: {
47 |     headers: Object.keys(headers).length > 0 ? headers : undefined
48 |   }
49 | });
50 | ```
51 | 
52 | ### Updated Implementation
53 | 
54 | ```typescript
55 | // UPDATED CODE - With MCP-Protocol-Version header
56 | finalTransportForClient = new StreamableHTTPClientTransport(transportUrl, {
57 |   requestInit: {
58 |     headers: {
59 |       'MCP-Protocol-Version': '2025-06-18', // Required for MCP 1.13.0
60 |       ...headers // Spread existing headers
61 |     }
62 |   }
63 | });
64 | ```
65 | 
66 | ## Step 3: Handle Resource Template Reference Changes
67 | 
68 | If your code uses `ResourceReference`, update it to `ResourceTemplateReference`:
69 | 
70 | ```typescript
71 | // OLD (1.12.0)
72 | import { ResourceReference } from '@modelcontextprotocol/sdk';
73 | 
74 | // NEW (1.13.0)  
75 | import { ResourceTemplateReference } from '@modelcontextprotocol/sdk';
76 | ```
77 | 
78 | ## Step 4: Add Enhanced Metadata Support
79 | 
80 | ### Tool Metadata with Titles
81 | 
82 | Update your MCP server configurations to include `title` fields for better UI display:
83 | 
84 | ```typescript
85 | // In lib/context/mcp-context.tsx - Update MCPServer interface
86 | export interface MCPServer {
87 |   id: string;
88 |   name: string;
89 |   title?: string; // NEW: Add title for display
90 |   url: string;
91 |   type: 'sse' | 'stdio' | 'streamable-http';
92 |   command?: string;
93 |   args?: string[];
94 |   env?: KeyValuePair[];
95 |   headers?: KeyValuePair[];
96 |   description?: string;
97 |   _meta?: Record<string, any>; // NEW: Add _meta support
98 | }
99 | ```
100 | 
101 | ### Update MCP Server Manager Component
102 | 
103 | In `components/mcp-server-manager.tsx`, add support for displaying titles:
104 | 
105 | ```typescript
106 | // Add title field to your server creation/editing forms
107 | <div className="space-y-2">
108 |   <Label htmlFor="name">Name (ID)</Label>
109 |   <Input
110 |     id="name"
111 |     placeholder="e.g., filesystem-server"
112 |     value={formData.name}
113 |     onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
114 |   />
115 | </div>
116 | 
117 | <div className="space-y-2">
118 |   <Label htmlFor="title">Title (Display Name)</Label>
119 |   <Input
120 |     id="title"
121 |     placeholder="e.g., File System Access"
122 |     value={formData.title || ''}
123 |     onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
124 |   />
125 | </div>
126 | ```
127 | 
128 | ## Step 5: Implement Resource Links Support
129 | 
130 | Update your tool calling logic to handle resource links in tool outputs:
131 | 
132 | ```typescript
133 | // In app/api/chat/route.ts - Update tool result processing
134 | interface ResourceLink {
135 |   type: 'resource_link';
136 |   uri: string;
137 |   name?: string;
138 |   mimeType?: string;
139 |   description?: string;
140 | }
141 | 
142 | interface ToolCallResult {
143 |   content: Array<{
144 |     type: 'text' | 'resource_link';
145 |     text?: string;
146 |     uri?: string;
147 |     name?: string;
148 |     mimeType?: string;
149 |     description?: string;
150 |   }>;
151 |   isError?: boolean;
152 | }
153 | ```
154 | 
155 | ## Step 6: Add Context-Aware Completions Support
156 | 
157 | If you plan to use completions, update to support the new `context` field:
158 | 
159 | ```typescript
160 | // NEW: Context-aware completion support
161 | interface CompletionRequest {
162 |   ref: {
163 |     type: 'ref/prompt' | 'ref/resource';
164 |     name?: string;
165 |     uri?: string;
166 |   };
167 |   argument: {
168 |     name: string;
169 |     value: string;
170 |   };
171 |   context?: {
172 |     arguments?: Record<string, any>;
173 |   }; // NEW: Context support
174 | }
175 | ```
176 | 
177 | ## Step 7: Implement Elicitation Capability (Optional)
178 | 
179 | For interactive workflows, you can implement elicitation support:
180 | 
181 | ```typescript
182 | // NEW: Elicitation capability
183 | interface ElicitationRequest {
184 |   message: string;
185 |   requestedSchema: {
186 |     type: string;
187 |     properties: Record<string, any>;
188 |     required?: string[];
189 |   };
190 | }
191 | 
192 | // In your MCP client setup, add elicitation capability
193 | const clientCapabilities = {
194 |   elicitation: {}, // NEW: Declare elicitation support
195 |   // ... other capabilities
196 | };
197 | ```
198 | 
199 | ## Step 8: Update Error Handling
200 | 
201 | Update error handling to use the new "reject" terminology instead of "decline":
202 | 
203 | ```typescript
204 | // OLD
205 | if (result.action === 'decline') {
206 |   // handle decline
207 | }
208 | 
209 | // NEW  
210 | if (result.action === 'reject') {
211 |   // handle rejection
212 | }
213 | ```
214 | 
215 | ## Step 9: Enhanced Security with Resource Indicators
216 | 
217 | For production deployments, implement Resource Indicators (RFC 8707) support:
218 | 
219 | ```typescript
220 | // In StreamableHTTP transport configuration
221 | finalTransportForClient = new StreamableHTTPClientTransport(transportUrl, {
222 |   requestInit: {
223 |     headers: {
224 |       'MCP-Protocol-Version': '2025-06-18',
225 |       'Resource': transportUrl.origin, // RFC 8707 Resource Indicator
226 |       ...headers
227 |     }
228 |   }
229 | });
230 | ```
231 | 
232 | ## Step 10: Update Development Dependencies
233 | 
234 | Update any development tools that might be affected:
235 | 
236 | ```bash
237 | # Update all MCP-related dependencies if any
238 | pnpm update
239 | ```
240 | 
241 | ## Step 11: Testing the Upgrade
242 | 
243 | 1. **Test Existing MCP Servers**: Ensure all your current MCP server connections still work
244 | 2. **Test StreamableHTTP**: Verify that HTTP-based MCP servers can connect properly
245 | 3. **Test Error Handling**: Ensure error cases are handled gracefully
246 | 4. **Test UI**: Verify that server titles display correctly in the MCP Server Manager
247 | 
248 | ## Step 12: Optional Enhancements
249 | 
250 | Consider implementing these new features:
251 | 
252 | ### A. Enhanced Tool Output with Resource Links
253 | 
254 | ```typescript
255 | // Example of returning resource links from tools
256 | const toolResult = {
257 |   content: [
258 |     { type: "text", text: "Found the following files:" },
259 |     {
260 |       type: "resource_link",
261 |       uri: "file:///project/README.md", 
262 |       name: "README.md",
263 |       mimeType: "text/markdown",
264 |       description: "Project documentation"
265 |     }
266 |   ]
267 | };
268 | ```
269 | 
270 | ### B. Interactive Workflows with Elicitation
271 | 
272 | ```typescript
273 | // Example elicitation for user confirmation
274 | const userInput = await mcpClient.elicitInput({
275 |   message: "Do you want to proceed with deleting these files?",
276 |   requestedSchema: {
277 |     type: "object",
278 |     properties: {
279 |       confirm: {
280 |         type: "boolean",
281 |         title: "Confirm deletion"
282 |       }
283 |     },
284 |     required: ["confirm"]
285 |   }
286 | });
287 | ```
288 | 
289 | ## Breaking Changes Summary
290 | 
291 | 1. **MCP-Protocol-Version header**: Required for HTTP transport
292 | 2. **ResourceReference → ResourceTemplateReference**: Update imports
293 | 3. **decline → reject**: Update error handling terminology
294 | 
295 | ## Migration Checklist
296 | 
297 | - [ ] Update MCP SDK to 1.13.0
298 | - [ ] Add MCP-Protocol-Version header to StreamableHttp transport
299 | - [ ] Update ResourceReference imports if used
300 | - [ ] Add title and _meta fields to MCP server interface
301 | - [ ] Update server manager UI to support titles
302 | - [ ] Test all existing MCP server connections
303 | - [ ] Update error handling from "decline" to "reject"
304 | - [ ] Consider implementing elicitation for interactive workflows
305 | - [ ] Consider implementing resource links for better tool outputs
306 | 
307 | ## Resources
308 | 
309 | - [MCP 1.13.0 Release Notes](https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/1.13.0)
310 | - [MCP Specification 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/changelog)
311 | - [MCP TypeScript SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)
312 | 
313 | ## Support
314 | 
315 | If you encounter issues during the upgrade:
316 | 1. Check the [MCP GitHub Discussions](https://github.com/modelcontextprotocol/typescript-sdk/discussions)
317 | 2. Review the [MCP specification](https://modelcontextprotocol.io/)
318 | 3. Test with the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) for debugging
```

auth-schema.ts
```
1 | import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
2 | 
3 | export const user = pgTable("user", {
4 | 					id: text('id').primaryKey(),
5 | 					name: text('name').notNull(),
6 |  email: text('email').notNull().unique(),
7 |  emailVerified: boolean('email_verified').notNull(),
8 |  image: text('image'),
9 |  createdAt: timestamp('created_at').notNull(),
10 |  updatedAt: timestamp('updated_at').notNull(),
11 |  isAnonymous: boolean('is_anonymous')
12 | 				});
13 | 
14 | export const session = pgTable("session", {
15 | 					id: text('id').primaryKey(),
16 | 					expiresAt: timestamp('expires_at').notNull(),
17 |  token: text('token').notNull().unique(),
18 |  createdAt: timestamp('created_at').notNull(),
19 |  updatedAt: timestamp('updated_at').notNull(),
20 |  ipAddress: text('ip_address'),
21 |  userAgent: text('user_agent'),
22 |  userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' })
23 | 				});
24 | 
25 | export const account = pgTable("account", {
26 | 					id: text('id').primaryKey(),
27 | 					accountId: text('account_id').notNull(),
28 |  providerId: text('provider_id').notNull(),
29 |  userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
30 |  accessToken: text('access_token'),
31 |  refreshToken: text('refresh_token'),
32 |  idToken: text('id_token'),
33 |  accessTokenExpiresAt: timestamp('access_token_expires_at'),
34 |  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
35 |  scope: text('scope'),
36 |  password: text('password'),
37 |  createdAt: timestamp('created_at').notNull(),
38 |  updatedAt: timestamp('updated_at').notNull()
39 | 				});
40 | 
41 | export const verification = pgTable("verification", {
42 | 					id: text('id').primaryKey(),
43 | 					identifier: text('identifier').notNull(),
44 |  value: text('value').notNull(),
45 |  expiresAt: timestamp('expires_at').notNull(),
46 |  createdAt: timestamp('created_at'),
47 |  updatedAt: timestamp('updated_at')
48 | 				});
```

chatlima.code-workspace
```
1 | {
2 |     "folders": [
3 |         {
4 |             "name": "chatlima",
5 |             "path": "."
6 |         },
7 |         {
8 |             "name": "chatlima-docs",
9 |             "path": "../chatlima-docs"
10 |         }
11 |     ],
12 |     "settings": {
13 |         "typescript.preferences.includePackageJsonAutoImports": "auto",
14 |         "editor.formatOnSave": true,
15 |         "editor.codeActionsOnSave": {
16 |             "source.fixAll.eslint": "explicit"
17 |         }
18 |     },
19 |     "extensions": {
20 |         "recommendations": [
21 |             "bradlc.vscode-tailwindcss",
22 |             "esbenp.prettier-vscode",
23 |             "dbaeumer.vscode-eslint"
24 |         ]
25 |     }
26 | }
```

codefetch.config.mjs
```
1 | /** @type {import('codefetch').CodefetchConfig} */
2 | export default {
3 |   "projectTree": 5,
4 |   "tokenLimiter": "truncated",
5 |   "defaultPromptFile": "default.md"
6 | };
```

components.json
```
1 | {
2 |   "$schema": "https://ui.shadcn.com/schema.json",
3 |   "style": "new-york",
4 |   "rsc": true,
5 |   "tsx": true,
6 |   "tailwind": {
7 |     "config": "",
8 |     "css": "app/globals.css",
9 |     "baseColor": "zinc",
10 |     "cssVariables": true,
11 |     "prefix": ""
12 |   },
13 |   "aliases": {
14 |     "components": "@/components",
15 |     "utils": "@/lib/utils",
16 |     "ui": "@/components/ui",
17 |     "lib": "@/lib",
18 |     "hooks": "@/hooks"
19 |   },
20 |   "iconLibrary": "lucide"
21 | }
```

drizzle.config.ts
```
1 | import type { Config } from "drizzle-kit";
2 | import dotenv from "dotenv";
3 | 
4 | // Load environment variables
5 | dotenv.config({ path: ".env.local" });
6 | 
7 | export default {
8 |   schema: "./lib/db/schema.ts",
9 |   out: "./drizzle",
10 |   dialect: "postgresql",
11 |   dbCredentials: {
12 |     url: process.env.DATABASE_URL!,
13 |   },
14 | } satisfies Config; 
```

eslint.config.mjs
```
1 | import { dirname } from "path";
2 | import { fileURLToPath } from "url";
3 | import { FlatCompat } from "@eslint/eslintrc";
4 | 
5 | const __filename = fileURLToPath(import.meta.url);
6 | const __dirname = dirname(__filename);
7 | 
8 | const compat = new FlatCompat({
9 |   baseDirectory: __dirname,
10 | });
11 | 
12 | const eslintConfig = [
13 |   ...compat.extends("next/core-web-vitals", "next/typescript"),
14 |   {
15 |     rules: {
16 |       "@typescript-eslint/no-unused-vars": "off",
17 |       "@typescript-eslint/no-explicit-any": "off"
18 |     }
19 |   }
20 | ];
21 | 
22 | export default eslintConfig;
```

next.config.ts
```
1 | import type { NextConfig } from "next";
2 | 
3 | const nextConfig: NextConfig = {
4 |   images: {
5 |     remotePatterns: [
6 |       {
7 |         protocol: 'https',
8 |         hostname: 'lh3.googleusercontent.com',
9 |       },
10 |     ],
11 |   },
12 |   /* config options here */
13 | };
14 | 
15 | export default nextConfig;
```

package.json
```
1 | {
2 |   "name": "chatlima",
3 |   "version": "0.18.0",
4 |   "private": true,
5 |   "scripts": {
6 |     "dev": "next dev --turbopack",
7 |     "build": "next build --turbopack",
8 |     "start": "next start",
9 |     "lint": "next lint",
10 |     "test": "playwright test --config=playwright.local.config.ts",
11 |     "test:ui": "playwright test --ui",
12 |     "test:debug": "playwright test --debug",
13 |     "test:headed": "playwright test --headed",
14 |     "test:local": "playwright test --config=playwright.local.config.ts",
15 |     "test:local:ui": "playwright test --config=playwright.local.config.ts --ui",
16 |     "test:local:debug": "playwright test --config=playwright.local.config.ts --debug",
17 |     "test:local:headed": "playwright test --config=playwright.local.config.ts --headed",
18 |     "test:anonymous": "playwright test --project=local-anonymous-chromium --config=playwright.local.config.ts",
19 |     "db:generate": "drizzle-kit generate",
20 |     "db:migrate": "drizzle-kit migrate",
21 |     "db:push": "drizzle-kit push",
22 |     "db:studio": "drizzle-kit studio",
23 |     "pricing:analysis": "npx tsx scripts/openrouter-pricing-analysis.ts"
24 |   },
25 |   "dependencies": {
26 |     "@ai-sdk/anthropic": "^1.2.10",
27 |     "@ai-sdk/cohere": "^1.2.9",
28 |     "@ai-sdk/google": "^1.2.12",
29 |     "@ai-sdk/groq": "^1.2.8",
30 |     "@ai-sdk/openai": "^1.3.16",
31 |     "@ai-sdk/react": "^1.2.9",
32 |     "@ai-sdk/ui-utils": "^1.2.10",
33 |     "@ai-sdk/xai": "^1.2.14",
34 |     "@modelcontextprotocol/sdk": "^1.13.0",
35 |     "@neondatabase/serverless": "^1.0.0",
36 |     "@openrouter/ai-sdk-provider": "^0.4.5",
37 |     "@polar-sh/better-auth": "^0.1.1",
38 |     "@polar-sh/nextjs": "^0.4.0",
39 |     "@polar-sh/sdk": "^0.32.13",
40 |     "@radix-ui/react-accordion": "^1.2.7",
41 |     "@radix-ui/react-avatar": "^1.1.6",
42 |     "@radix-ui/react-dialog": "^1.1.10",
43 |     "@radix-ui/react-dropdown-menu": "^2.1.11",
44 |     "@radix-ui/react-label": "^2.1.3",
45 |     "@radix-ui/react-popover": "^1.1.10",
46 |     "@radix-ui/react-scroll-area": "^1.2.5",
47 |     "@radix-ui/react-select": "^2.1.7",
48 |     "@radix-ui/react-separator": "^1.1.4",
49 |     "@radix-ui/react-slot": "^1.2.0",
50 |     "@radix-ui/react-switch": "^1.2.2",
51 |     "@radix-ui/react-tooltip": "^1.2.3",
52 |     "@requesty/ai-sdk": "^0.0.7",
53 |     "@tanstack/react-query": "^5.74.4",
54 |     "@vercel/otel": "^1.11.0",
55 |     "ai": "^4.3.9",
56 |     "better-auth": "^1.2.7",
57 |     "class-variance-authority": "^0.7.1",
58 |     "clsx": "^2.1.1",
59 |     "drizzle-orm": "^0.42.0",
60 |     "fast-deep-equal": "^3.1.3",
61 |     "framer-motion": "^12.7.4",
62 |     "groq-sdk": "^0.19.0",
63 |     "katex": "^0.16.22",
64 |     "lucide-react": "^0.488.0",
65 |     "motion": "^12.7.3",
66 |     "nanoid": "^5.1.5",
67 |     "next": "^15.3.1",
68 |     "next-themes": "^0.4.6",
69 |     "or": "^0.2.0",
70 |     "pg": "^8.14.1",
71 |     "react": "^19.1.0",
72 |     "react-dom": "^19.1.0",
73 |     "react-markdown": "^10.1.0",
74 |     "rehype-katex": "^7.0.1",
75 |     "remark-gfm": "^4.0.1",
76 |     "remark-math": "^6.0.0",
77 |     "sonner": "^2.0.3",
78 |     "tailwind-merge": "^3.2.0",
79 |     "tailwindcss-animate": "^1.0.7",
80 |     "zod": "^3.24.2"
81 |   },
82 |   "devDependencies": {
83 |     "@better-auth/cli": "^1.2.7",
84 |     "@eslint/eslintrc": "^3.3.1",
85 |     "@playwright/test": "^1.48.0",
86 |     "@tailwindcss/postcss": "^4.1.4",
87 |     "@types/node": "^22.14.1",
88 |     "@types/pg": "^8.11.13",
89 |     "@types/react": "^19.1.2",
90 |     "@types/react-dom": "^19.1.2",
91 |     "dotenv": "^16.5.0",
92 |     "dotenv-cli": "^8.0.0",
93 |     "drizzle-kit": "^0.31.0",
94 |     "esbuild": ">=0.25.0",
95 |     "eslint": "^9.24.0",
96 |     "eslint-config-next": "15.3.0",
97 |     "pg-pool": "^3.8.0",
98 |     "tailwindcss": "^4.1.4",
99 |     "tsx": "^4.19.4",
100 |     "typescript": "^5.8.3"
101 |   }
102 | }
```

playwright.config.ts
```
1 | import { defineConfig, devices } from '@playwright/test';
2 | 
3 | export default defineConfig({
4 |     testDir: './tests',
5 |     fullyParallel: true,
6 |     forbidOnly: !!process.env.CI,
7 |     retries: process.env.CI ? 2 : 0,
8 |     workers: process.env.CI ? 1 : undefined,
9 |     reporter: 'html',
10 | 
11 |     use: {
12 |         baseURL: 'https://preview.chatlima.com',
13 |         trace: 'on-first-retry',
14 |         screenshot: 'only-on-failure',
15 |         video: 'retain-on-failure',
16 |     },
17 | 
18 |     projects: [
19 |         // Setup project to authenticate once (only for authenticated tests)
20 |         {
21 |             name: 'setup',
22 |             testMatch: /.*\.setup\.ts/,
23 |         },
24 | 
25 |         // Anonymous user tests (no auth required)
26 |         {
27 |             name: 'anonymous-chromium',
28 |             use: {
29 |                 ...devices['Desktop Chrome'],
30 |             },
31 |             testMatch: /.*anonymous.*\.spec\.ts/,
32 |         },
33 | 
34 |         // Authenticated user tests (require auth setup)
35 |         {
36 |             name: 'authenticated-chromium',
37 |             use: {
38 |                 ...devices['Desktop Chrome'],
39 |                 // Use the authenticated state
40 |                 storageState: 'playwright/.auth/user.json',
41 |             },
42 |             dependencies: ['setup'],
43 |             testMatch: /.*deepseek.*\.spec\.ts/,
44 |         },
45 |         {
46 |             name: 'authenticated-firefox',
47 |             use: {
48 |                 ...devices['Desktop Firefox'],
49 |                 // Use the authenticated state
50 |                 storageState: 'playwright/.auth/user.json',
51 |             },
52 |             dependencies: ['setup'],
53 |             testMatch: /.*deepseek.*\.spec\.ts/,
54 |         },
55 |         {
56 |             name: 'authenticated-webkit',
57 |             use: {
58 |                 ...devices['Desktop Safari'],
59 |                 // Use the authenticated state
60 |                 storageState: 'playwright/.auth/user.json',
61 |             },
62 |             dependencies: ['setup'],
63 |             testMatch: /.*deepseek.*\.spec\.ts/,
64 |         },
65 |     ],
66 | 
67 |     webServer: {
68 |         command: 'echo "Using external ChatLima server"',
69 |         url: 'https://preview.chatlima.com',
70 |         reuseExistingServer: true,
71 |         timeout: 120 * 1000,
72 |     },
73 | }); 
```

playwright.local.config.ts
```
1 | import { defineConfig, devices } from '@playwright/test';
2 | 
3 | export default defineConfig({
4 |     testDir: './tests',
5 |     fullyParallel: true,
6 |     forbidOnly: !!process.env.CI,
7 |     retries: process.env.CI ? 2 : 0,
8 |     workers: process.env.CI ? 1 : undefined,
9 |     reporter: 'html',
10 | 
11 |     use: {
12 |         baseURL: 'http://localhost:3000',
13 |         trace: 'on-first-retry',
14 |         screenshot: 'only-on-failure',
15 |         video: 'retain-on-failure',
16 |     },
17 | 
18 |     projects: [
19 |         // Setup project to authenticate once (only for authenticated tests)
20 |         {
21 |             name: 'local-setup',
22 |             testMatch: /.*local\.setup\.ts/,
23 |         },
24 | 
25 |         // Anonymous user tests (no auth required)
26 |         {
27 |             name: 'local-anonymous-chromium',
28 |             use: {
29 |                 ...devices['Desktop Chrome'],
30 |             },
31 |             testMatch: /.*anonymous.*\.spec\.ts/,
32 |         },
33 | 
34 |         // Authenticated user tests (require auth setup)
35 |         {
36 |             name: 'local-authenticated-chromium',
37 |             use: {
38 |                 ...devices['Desktop Chrome'],
39 |                 // Use the authenticated state
40 |                 storageState: 'playwright/.auth/local-user.json',
41 |             },
42 |             dependencies: ['local-setup'],
43 |             testMatch: /.*deepseek.*\.spec\.ts/,
44 |         },
45 |     ],
46 | 
47 |     webServer: {
48 |         command: 'pnpm dev',
49 |         url: 'http://localhost:3000',
50 |         reuseExistingServer: !process.env.CI,
51 |         stdout: 'ignore',
52 |         stderr: 'pipe',
53 |         timeout: 120 * 1000,
54 |     },
55 | }); 
```

postcss.config.mjs
```
1 | const config = {
2 |   plugins: ["@tailwindcss/postcss"],
3 | };
4 | 
5 | export default config;
```

railpack.json
```
1 | {
2 |     "$schema": "https://schema.railpack.com",
3 |     "provider": "node",
4 |     "buildAptPackages": [
5 |         "git",
6 |         "curl"
7 |     ],
8 |     "packages": {
9 |         "node": "22",
10 |         "python": "3.12.7"
11 |     },
12 |     "deploy": {
13 |         "aptPackages": [
14 |             "git",
15 |             "curl"
16 |         ]
17 |     }
18 | }
```

reset_db.sql
```
1 | -- Drop all tables in the database
2 | DROP TABLE IF EXISTS polar_usage_events CASCADE;
3 | DROP TABLE IF EXISTS messages CASCADE;
4 | DROP TABLE IF EXISTS chats CASCADE;
5 | DROP TABLE IF EXISTS verification CASCADE;
6 | DROP TABLE IF EXISTS sessions CASCADE;
7 | DROP TABLE IF EXISTS accounts CASCADE;
8 | DROP TABLE IF EXISTS users CASCADE;
9 | DROP TABLE IF EXISTS _drizzle_migrations CASCADE;
10 | 
11 | -- The tables will be recreated using Drizzle migrations 
```

tsconfig.json
```
1 | {
2 |   "compilerOptions": {
3 |     "target": "ES2017",
4 |     "lib": ["dom", "dom.iterable", "esnext"],
5 |     "allowJs": true,
6 |     "skipLibCheck": true,
7 |     "strict": true,
8 |     "noEmit": true,
9 |     "esModuleInterop": true,
10 |     "module": "esnext",
11 |     "moduleResolution": "bundler",
12 |     "resolveJsonModule": true,
13 |     "isolatedModules": true,
14 |     "jsx": "preserve",
15 |     "incremental": true,
16 |     "plugins": [
17 |       {
18 |         "name": "next"
19 |       }
20 |     ],
21 |     "paths": {
22 |       "@/*": ["./*"]
23 |     }
24 |   },
25 |   "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
26 |   "exclude": ["node_modules"]
27 | }
```

.cursor/environment.json
```
1 | {
2 |   "snapshot": "snapshot-20250620-e9439ea3-9378-42a1-ab4f-e3b0ef16a2f9",
3 |   "install": "pnpm install",
4 |   "start": "pnpm run dev",
5 |   "terminals": []
6 | }
```

ai/providers.ts
```
1 | import { createOpenAI } from "@ai-sdk/openai";
2 | import { createGroq } from "@ai-sdk/groq";
3 | import { createAnthropic } from "@ai-sdk/anthropic";
4 | import { createXai } from "@ai-sdk/xai";
5 | import { createOpenRouter } from "@openrouter/ai-sdk-provider";
6 | import { createRequesty } from "@requesty/ai-sdk";
7 | 
8 | import {
9 |   customProvider,
10 |   wrapLanguageModel,
11 |   extractReasoningMiddleware
12 | } from "ai";
13 | 
14 | export interface ModelInfo {
15 |   provider: string;
16 |   name: string;
17 |   description: string;
18 |   apiVersion: string;
19 |   capabilities: string[];
20 |   enabled?: boolean;
21 |   supportsWebSearch?: boolean;
22 |   premium?: boolean;
23 | }
24 | 
25 | const middleware = extractReasoningMiddleware({
26 |   tagName: 'think',
27 | });
28 | 
29 | const deepseekR1Middleware = extractReasoningMiddleware({
30 |   tagName: 'think',
31 | });
32 | 
33 | // Helper to get API keys from environment variables first, then localStorage
34 | export const getApiKey = (key: string): string | undefined => {
35 |   // Check for environment variables first
36 |   if (process.env[key]) {
37 |     return process.env[key] || undefined;
38 |   }
39 | 
40 |   // Fall back to localStorage if available
41 |   if (typeof window !== 'undefined') {
42 |     return window.localStorage.getItem(key) || undefined;
43 |   }
44 | 
45 |   return undefined;
46 | };
47 | 
48 | // Helper to get API keys with runtime override option
49 | export const getApiKeyWithOverride = (key: string, override?: string): string | undefined => {
50 |   // Use override if provided
51 |   if (override) {
52 |     return override;
53 |   }
54 | 
55 |   // Fall back to the standard method
56 |   return getApiKey(key);
57 | };
58 | 
59 | // Create provider instances with API keys from localStorage
60 | const openaiClient = createOpenAI({
61 |   apiKey: getApiKey('OPENAI_API_KEY'),
62 | });
63 | 
64 | const anthropicClient = createAnthropic({
65 |   apiKey: getApiKey('ANTHROPIC_API_KEY'),
66 | });
67 | 
68 | const groqClient = createGroq({
69 |   apiKey: getApiKey('GROQ_API_KEY'),
70 | });
71 | 
72 | const xaiClient = createXai({
73 |   apiKey: getApiKey('XAI_API_KEY'),
74 | });
75 | 
76 | const openrouterClient = createOpenRouter({
77 |   apiKey: getApiKey('OPENROUTER_API_KEY'),
78 |   headers: {
79 |     'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com/',
80 |     'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'ChatLima',
81 |   }
82 | });
83 | 
84 | const requestyClient = createRequesty({
85 |   apiKey: getApiKey('REQUESTY_API_KEY'),
86 |   headers: {
87 |     'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com/',
88 |     'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'ChatLima',
89 |   }
90 | });
91 | 
92 | // Helper functions to create provider clients with dynamic API keys
93 | export const createOpenAIClientWithKey = (apiKey?: string) => {
94 |   const finalApiKey = getApiKeyWithOverride('OPENAI_API_KEY', apiKey);
95 |   if (!finalApiKey) {
96 |     throw new Error('OpenAI API key is missing. Pass it using the \'apiKey\' parameter or the OPENAI_API_KEY environment variable.');
97 |   }
98 |   return createOpenAI({
99 |     apiKey: finalApiKey,
100 |   });
101 | };
102 | 
103 | export const createAnthropicClientWithKey = (apiKey?: string) => {
104 |   const finalApiKey = getApiKeyWithOverride('ANTHROPIC_API_KEY', apiKey);
105 |   if (!finalApiKey) {
106 |     throw new Error('Anthropic API key is missing. Pass it using the \'apiKey\' parameter or the ANTHROPIC_API_KEY environment variable.');
107 |   }
108 |   return createAnthropic({
109 |     apiKey: finalApiKey,
110 |   });
111 | };
112 | 
113 | export const createGroqClientWithKey = (apiKey?: string) => {
114 |   const finalApiKey = getApiKeyWithOverride('GROQ_API_KEY', apiKey);
115 |   if (!finalApiKey) {
116 |     throw new Error('Groq API key is missing. Pass it using the \'apiKey\' parameter or the GROQ_API_KEY environment variable.');
117 |   }
118 |   return createGroq({
119 |     apiKey: finalApiKey,
120 |   });
121 | };
122 | 
123 | export const createXaiClientWithKey = (apiKey?: string) => {
124 |   const finalApiKey = getApiKeyWithOverride('XAI_API_KEY', apiKey);
125 |   if (!finalApiKey) {
126 |     throw new Error('XAI API key is missing. Pass it using the \'apiKey\' parameter or the XAI_API_KEY environment variable.');
127 |   }
128 |   return createXai({
129 |     apiKey: finalApiKey,
130 |   });
131 | };
132 | 
133 | export const createOpenRouterClientWithKey = (apiKey?: string) => {
134 |   const finalApiKey = getApiKeyWithOverride('OPENROUTER_API_KEY', apiKey);
135 |   if (!finalApiKey) {
136 |     throw new Error('OpenRouter API key is missing. Pass it using the \'apiKey\' parameter or the OPENROUTER_API_KEY environment variable.');
137 |   }
138 |   return createOpenRouter({
139 |     apiKey: finalApiKey,
140 |     headers: {
141 |       'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com/',
142 |       'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'ChatLima',
143 |     }
144 |   });
145 | };
146 | 
147 | export const createRequestyClientWithKey = (apiKey?: string) => {
148 |   const finalApiKey = getApiKeyWithOverride('REQUESTY_API_KEY', apiKey);
149 |   if (!finalApiKey) {
150 |     throw new Error('Requesty API key is missing. Pass it using the \'apiKey\' parameter or the REQUESTY_API_KEY environment variable.');
151 |   }
152 |   return createRequesty({
153 |     apiKey: finalApiKey,
154 |     headers: {
155 |       'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com/',
156 |       'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'ChatLima',
157 |     }
158 |   });
159 | };
160 | 
161 | const languageModels = {
162 |   "claude-3-7-sonnet": anthropicClient('claude-3-7-sonnet-20250219'),
163 |   "openrouter/anthropic/claude-3.5-sonnet": openrouterClient("anthropic/claude-3.5-sonnet"),
164 |   "openrouter/anthropic/claude-3.7-sonnet": openrouterClient("anthropic/claude-3.7-sonnet"),
165 |   "openrouter/anthropic/claude-3.7-sonnet:thinking": openrouterClient("anthropic/claude-3.7-sonnet:thinking"),
166 |   "openrouter/deepseek/deepseek-chat-v3-0324": openrouterClient("deepseek/deepseek-chat-v3-0324"),
167 |   "openrouter/deepseek/deepseek-r1": wrapLanguageModel({
168 |     model: openrouterClient("deepseek/deepseek-r1", { logprobs: false }),
169 |     middleware: deepseekR1Middleware,
170 |   }),
171 |   "openrouter/deepseek/deepseek-r1-0528": wrapLanguageModel({
172 |     model: openrouterClient("deepseek/deepseek-r1-0528", { logprobs: false }),
173 |     middleware: deepseekR1Middleware,
174 |   }),
175 |   "openrouter/deepseek/deepseek-r1-0528-qwen3-8b": wrapLanguageModel({
176 |     model: openrouterClient("deepseek/deepseek-r1-0528-qwen3-8b", { logprobs: false }),
177 |     middleware: deepseekR1Middleware,
178 |   }),
179 |   "openrouter/google/gemini-2.5-flash-preview": openrouterClient("google/gemini-2.5-flash-preview"),
180 |   "openrouter/google/gemini-2.5-flash-preview:thinking": openrouterClient("google/gemini-2.5-flash-preview:thinking"),
181 |   "openrouter/google/gemini-2.5-flash-preview-05-20": openrouterClient("google/gemini-2.5-flash-preview-05-20"),
182 |   "openrouter/google/gemini-2.5-flash-preview-05-20:thinking": openrouterClient("google/gemini-2.5-flash-preview-05-20:thinking"),
183 |   "openrouter/google/gemini-2.5-pro-preview-03-25": openrouterClient("google/gemini-2.5-pro-preview-03-25"),
184 |   "openrouter/google/gemini-2.5-pro-preview": openrouterClient("google/gemini-2.5-pro-preview"),
185 |   "openrouter/google/gemini-2.5-pro": openrouterClient("google/gemini-2.5-pro"),
186 |   "openrouter/google/gemini-2.5-flash": openrouterClient("google/gemini-2.5-flash"),
187 |   "openrouter/google/gemini-2.5-flash-lite-preview-06-17": openrouterClient("google/gemini-2.5-flash-lite-preview-06-17"),
188 |   "gpt-4.1-mini": openaiClient("gpt-4.1-mini"),
189 |   "openrouter/openai/gpt-4.1": openrouterClient("openai/gpt-4.1"),
190 |   "openrouter/openai/gpt-4.1-mini": openrouterClient("openai/gpt-4.1-mini"),
191 |   "openrouter/openai/gpt-4.1-nano": openrouterClient("openai/gpt-4.1-nano"),
192 |   "openrouter/x-ai/grok-3-beta": wrapLanguageModel({
193 |     model: openrouterClient("x-ai/grok-3-beta", { logprobs: false }),
194 |     middleware: deepseekR1Middleware,
195 |   }),
196 |   "grok-3-mini": xaiClient("grok-3-mini-latest"),
197 |   "openrouter/x-ai/grok-3-mini-beta": wrapLanguageModel({
198 |     model: openrouterClient("x-ai/grok-3-mini-beta", { logprobs: false }),
199 |     middleware: deepseekR1Middleware,
200 |   }),
201 |   "openrouter/x-ai/grok-3-mini-beta-reasoning-high": wrapLanguageModel({
202 |     model: openrouterClient("x-ai/grok-3-mini-beta", { reasoning: { effort: "high" }, logprobs: false }),
203 |     middleware: deepseekR1Middleware,
204 |   }),
205 |   "openrouter/mistralai/mistral-medium-3": openrouterClient("mistralai/mistral-medium-3"),
206 |   "openrouter/mistralai/mistral-small-3.1-24b-instruct": openrouterClient("mistralai/mistral-small-3.1-24b-instruct"),
207 |   "openrouter/mistralai/magistral-small-2506": openrouterClient("mistralai/magistral-small-2506"),
208 |   "openrouter/mistralai/magistral-medium-2506": openrouterClient("mistralai/magistral-medium-2506"),
209 |   "openrouter/mistralai/magistral-medium-2506:thinking": openrouterClient("mistralai/magistral-medium-2506:thinking"),
210 |   "openrouter/meta-llama/llama-4-maverick": openrouterClient("meta-llama/llama-4-maverick"),
211 |   "openrouter/openai/o4-mini-high": openrouterClient("openai/o4-mini-high"),
212 |   "qwen-qwq": wrapLanguageModel(
213 |     {
214 |       model: groqClient("qwen-qwq-32b"),
215 |       middleware
216 |     }
217 |   ),
218 |   "openrouter/qwen/qwq-32b": wrapLanguageModel({
219 |     model: openrouterClient("qwen/qwq-32b"),
220 |     middleware: deepseekR1Middleware,
221 |   }),
222 |   // "openrouter/qwen/qwq-32b": openrouterClient("qwen/qwq-32b"),
223 |   "openrouter/qwen/qwen3-235b-a22b": openrouterClient("qwen/qwen3-235b-a22b"),
224 |   "openrouter/anthropic/claude-sonnet-4": openrouterClient("anthropic/claude-sonnet-4"),
225 |   "openrouter/anthropic/claude-opus-4": openrouterClient("anthropic/claude-opus-4"),
226 |   "openrouter/sentientagi/dobby-mini-unhinged-plus-llama-3.1-8b": openrouterClient("sentientagi/dobby-mini-unhinged-plus-llama-3.1-8b"),
227 |   "openrouter/minimax/minimax-m1": openrouterClient("minimax/minimax-m1"),
228 |   "openrouter/minimax/minimax-m1:extended": openrouterClient("minimax/minimax-m1:extended"),
229 |   // Requesty models
230 |   "requesty/openai/gpt-4o": requestyClient("openai/gpt-4o"),
231 |   "requesty/openai/gpt-4o-mini": requestyClient("openai/gpt-4o-mini"),
232 |   "requesty/openai/gpt-4.1": requestyClient("openai/gpt-4.1"),
233 |   "requesty/openai/gpt-4.1-nano": requestyClient("openai/gpt-4.1-nano"),
234 |   "requesty/openai/gpt-4.1-mini": requestyClient("openai/gpt-4.1-mini"),
235 |   "requesty/anthropic/claude-3.5-sonnet": requestyClient("anthropic/claude-3-5-sonnet-20241022"),
236 |   "requesty/anthropic/claude-3.7-sonnet": requestyClient("anthropic/claude-3-7-sonnet-20250219"),
237 |   "requesty/google/gemini-2.5-flash-preview": requestyClient("google/gemini-2.5-flash-preview-05-20"),
238 |   "requesty/google/gemini-2.5-flash": requestyClient("google/gemini-2.5-flash"),
239 |   "requesty/google/gemini-2.5-pro": requestyClient("google/gemini-2.5-pro"),
240 |   "requesty/meta-llama/llama-3.1-70b-instruct": requestyClient("deepinfra/meta-llama/Meta-Llama-3.1-70B-Instruct"),
241 |   "requesty/anthropic/claude-sonnet-4-20250514": requestyClient("anthropic/claude-sonnet-4-20250514"),
242 |   "requesty/deepseek/deepseek-chat": requestyClient("deepseek/deepseek-chat"),
243 |   "requesty/deepseek/deepseek-reasoner": wrapLanguageModel({
244 |     model: requestyClient("deepseek/deepseek-reasoner", { logprobs: false }),
245 |     middleware: deepseekR1Middleware,
246 |   }),
247 |   "requesty/deepseek/deepseek-v3": requestyClient("deepinfra/deepseek-ai/DeepSeek-V3"),
248 |   "requesty/deepseek/deepseek-r1": wrapLanguageModel({
249 |     model: requestyClient("deepinfra/deepseek-ai/DeepSeek-R1", { logprobs: false }),
250 |     middleware: deepseekR1Middleware,
251 |   }),
252 |   "requesty/meta-llama/llama-3.3-70b-instruct": requestyClient("deepinfra/meta-llama/Llama-3.3-70B-Instruct"),
253 |   "requesty/google/gemini-2.5-flash-lite-preview-06-17": requestyClient("google/gemini-2.5-flash-lite-preview-06-17"),
254 | };
255 | 
256 | // Helper to get language model with dynamic API keys
257 | export const getLanguageModelWithKeys = (modelId: string, apiKeys?: Record<string, string>) => {
258 |   // Helper function to create clients on demand
259 |   const getOpenAIClient = () => createOpenAIClientWithKey(apiKeys?.['OPENAI_API_KEY']);
260 |   const getAnthropicClient = () => createAnthropicClientWithKey(apiKeys?.['ANTHROPIC_API_KEY']);
261 |   const getGroqClient = () => createGroqClientWithKey(apiKeys?.['GROQ_API_KEY']);
262 |   const getXaiClient = () => createXaiClientWithKey(apiKeys?.['XAI_API_KEY']);
263 |   const getOpenRouterClient = () => createOpenRouterClientWithKey(apiKeys?.['OPENROUTER_API_KEY']);
264 |   const getRequestyClient = () => createRequestyClientWithKey(apiKeys?.['REQUESTY_API_KEY']);
265 | 
266 |   // Check if the specific model exists and create only the needed client
267 |   switch (modelId) {
268 |     // Anthropic models
269 |     case "claude-3-7-sonnet":
270 |       return getAnthropicClient()('claude-3-7-sonnet-20250219');
271 | 
272 |     // OpenAI models
273 |     case "gpt-4.1-mini":
274 |       return getOpenAIClient()("gpt-4.1-mini");
275 | 
276 |     // Groq models
277 |     case "qwen-qwq":
278 |       return wrapLanguageModel({
279 |         model: getGroqClient()("qwen-qwq-32b"),
280 |         middleware
281 |       });
282 | 
283 |     // XAI models
284 |     case "grok-3-mini":
285 |       return getXaiClient()("grok-3-mini-latest");
286 | 
287 |     // OpenRouter models
288 |     case "openrouter/anthropic/claude-3.5-sonnet":
289 |       return getOpenRouterClient()("anthropic/claude-3.5-sonnet");
290 |     case "openrouter/anthropic/claude-3.7-sonnet":
291 |       return getOpenRouterClient()("anthropic/claude-3.7-sonnet");
292 |     case "openrouter/anthropic/claude-3.7-sonnet:thinking":
293 |       return getOpenRouterClient()("anthropic/claude-3.7-sonnet:thinking");
294 |     case "openrouter/deepseek/deepseek-chat-v3-0324":
295 |       return getOpenRouterClient()("deepseek/deepseek-chat-v3-0324");
296 |     case "openrouter/deepseek/deepseek-r1":
297 |       return wrapLanguageModel({
298 |         model: getOpenRouterClient()("deepseek/deepseek-r1", { logprobs: false }),
299 |         middleware: deepseekR1Middleware,
300 |       });
301 |     case "openrouter/deepseek/deepseek-r1-0528":
302 |       return wrapLanguageModel({
303 |         model: getOpenRouterClient()("deepseek/deepseek-r1-0528", { logprobs: false }),
304 |         middleware: deepseekR1Middleware,
305 |       });
306 |     case "openrouter/deepseek/deepseek-r1-0528-qwen3-8b":
307 |       return wrapLanguageModel({
308 |         model: getOpenRouterClient()("deepseek/deepseek-r1-0528-qwen3-8b", { logprobs: false }),
309 |         middleware: deepseekR1Middleware,
310 |       });
311 |     case "openrouter/google/gemini-2.5-flash-preview":
312 |       return getOpenRouterClient()("google/gemini-2.5-flash-preview");
313 |     case "openrouter/google/gemini-2.5-flash-preview:thinking":
314 |       return getOpenRouterClient()("google/gemini-2.5-flash-preview:thinking");
315 |     case "openrouter/google/gemini-2.5-flash-preview-05-20":
316 |       return getOpenRouterClient()("google/gemini-2.5-flash-preview-05-20");
317 |     case "openrouter/google/gemini-2.5-flash-preview-05-20:thinking":
318 |       return getOpenRouterClient()("google/gemini-2.5-flash-preview-05-20:thinking");
319 |     case "openrouter/google/gemini-2.5-pro-preview-03-25":
320 |       return getOpenRouterClient()("google/gemini-2.5-pro-preview-03-25");
321 |     case "openrouter/google/gemini-2.5-pro-preview":
322 |       return getOpenRouterClient()("google/gemini-2.5-pro-preview");
323 |     case "openrouter/google/gemini-2.5-pro":
324 |       return getOpenRouterClient()("google/gemini-2.5-pro");
325 |     case "openrouter/google/gemini-2.5-flash":
326 |       return getOpenRouterClient()("google/gemini-2.5-flash");
327 |     case "openrouter/google/gemini-2.5-flash-lite-preview-06-17":
328 |       return getOpenRouterClient()("google/gemini-2.5-flash-lite-preview-06-17");
329 |     case "openrouter/openai/gpt-4.1":
330 |       return getOpenRouterClient()("openai/gpt-4.1");
331 |     case "openrouter/openai/gpt-4.1-mini":
332 |       return getOpenRouterClient()("openai/gpt-4.1-mini");
333 |     case "openrouter/openai/gpt-4.1-nano":
334 |       return getOpenRouterClient()("openai/gpt-4.1-nano");
335 |     case "openrouter/x-ai/grok-3-beta":
336 |       return wrapLanguageModel({
337 |         model: getOpenRouterClient()("x-ai/grok-3-beta", { logprobs: false }),
338 |         middleware: deepseekR1Middleware,
339 |       });
340 |     case "openrouter/x-ai/grok-3-mini-beta":
341 |       return wrapLanguageModel({
342 |         model: getOpenRouterClient()("x-ai/grok-3-mini-beta", { logprobs: false }),
343 |         middleware: deepseekR1Middleware,
344 |       });
345 |     case "openrouter/x-ai/grok-3-mini-beta-reasoning-high":
346 |       return wrapLanguageModel({
347 |         model: getOpenRouterClient()("x-ai/grok-3-mini-beta", { reasoning: { effort: "high" }, logprobs: false }),
348 |         middleware: deepseekR1Middleware,
349 |       });
350 |     case "openrouter/mistralai/mistral-medium-3":
351 |       return getOpenRouterClient()("mistralai/mistral-medium-3");
352 |     case "openrouter/mistralai/mistral-small-3.1-24b-instruct":
353 |       return getOpenRouterClient()("mistralai/mistral-small-3.1-24b-instruct");
354 |     case "openrouter/mistralai/magistral-small-2506":
355 |       return getOpenRouterClient()("mistralai/magistral-small-2506");
356 |     case "openrouter/mistralai/magistral-medium-2506":
357 |       return getOpenRouterClient()("mistralai/magistral-medium-2506");
358 |     case "openrouter/mistralai/magistral-medium-2506:thinking":
359 |       return getOpenRouterClient()("mistralai/magistral-medium-2506:thinking");
360 |     case "openrouter/meta-llama/llama-4-maverick":
361 |       return getOpenRouterClient()("meta-llama/llama-4-maverick");
362 |     case "openrouter/openai/o4-mini-high":
363 |       return getOpenRouterClient()("openai/o4-mini-high");
364 |     case "openrouter/qwen/qwq-32b":
365 |       return wrapLanguageModel({
366 |         model: getOpenRouterClient()("qwen/qwq-32b"),
367 |         middleware: deepseekR1Middleware,
368 |       });
369 |     case "openrouter/qwen/qwen3-235b-a22b":
370 |       return getOpenRouterClient()("qwen/qwen3-235b-a22b");
371 |     case "openrouter/anthropic/claude-sonnet-4":
372 |       return getOpenRouterClient()("anthropic/claude-sonnet-4");
373 |     case "openrouter/anthropic/claude-opus-4":
374 |       return getOpenRouterClient()("anthropic/claude-opus-4");
375 |     case "openrouter/sentientagi/dobby-mini-unhinged-plus-llama-3.1-8b":
376 |       return getOpenRouterClient()("sentientagi/dobby-mini-unhinged-plus-llama-3.1-8b");
377 |     case "openrouter/minimax/minimax-m1":
378 |       return getOpenRouterClient()("minimax/minimax-m1");
379 |     case "openrouter/minimax/minimax-m1:extended":
380 |       return getOpenRouterClient()("minimax/minimax-m1:extended");
381 | 
382 |     // Requesty models
383 |     case "requesty/openai/gpt-4o":
384 |       return getRequestyClient()("openai/gpt-4o");
385 |     case "requesty/openai/gpt-4o-mini":
386 |       return getRequestyClient()("openai/gpt-4o-mini");
387 |     case "requesty/openai/gpt-4.1":
388 |       return getRequestyClient()("openai/gpt-4.1");
389 |     case "requesty/openai/gpt-4.1-nano":
390 |       return getRequestyClient()("openai/gpt-4.1-nano");
391 |     case "requesty/openai/gpt-4.1-mini":
392 |       return getRequestyClient()("openai/gpt-4.1-mini");
393 |     case "requesty/anthropic/claude-3.5-sonnet":
394 |       return getRequestyClient()("anthropic/claude-3-5-sonnet-20241022");
395 |     case "requesty/anthropic/claude-3.7-sonnet":
396 |       return getRequestyClient()("anthropic/claude-3-7-sonnet-20250219");
397 |     case "requesty/google/gemini-2.5-flash-preview":
398 |       return getRequestyClient()("google/gemini-2.5-flash-preview-05-20");
399 |     case "requesty/google/gemini-2.5-flash":
400 |       return getRequestyClient()("google/gemini-2.5-flash");
401 |     case "requesty/google/gemini-2.5-pro":
402 |       return getRequestyClient()("google/gemini-2.5-pro");
403 |     case "requesty/meta-llama/llama-3.1-70b-instruct":
404 |       return getRequestyClient()("deepinfra/meta-llama/Meta-Llama-3.1-70B-Instruct");
405 |     case "requesty/anthropic/claude-sonnet-4-20250514":
406 |       return getRequestyClient()("anthropic/claude-sonnet-4-20250514");
407 |     case "requesty/deepseek/deepseek-chat":
408 |       return getRequestyClient()("deepseek/deepseek-chat");
409 |     case "requesty/deepseek/deepseek-reasoner":
410 |       return wrapLanguageModel({
411 |         model: getRequestyClient()("deepseek/deepseek-reasoner", { logprobs: false }),
412 |         middleware: deepseekR1Middleware,
413 |       });
414 |     case "requesty/deepseek/deepseek-v3":
415 |       return getRequestyClient()("deepinfra/deepseek-ai/DeepSeek-V3");
416 |     case "requesty/deepseek/deepseek-r1":
417 |       return wrapLanguageModel({
418 |         model: getRequestyClient()("deepinfra/deepseek-ai/DeepSeek-R1", { logprobs: false }),
419 |         middleware: deepseekR1Middleware,
420 |       });
421 |     case "requesty/meta-llama/llama-3.3-70b-instruct":
422 |       return getRequestyClient()("deepinfra/meta-llama/Llama-3.3-70B-Instruct");
423 |     case "requesty/google/gemini-2.5-flash-lite-preview-06-17":
424 |       return getRequestyClient()("google/gemini-2.5-flash-lite-preview-06-17");
425 | 
426 |     default:
427 |       // Fallback to static models if not found (shouldn't happen in normal cases)
428 |       console.warn(`Model ${modelId} not found in dynamic models, falling back to static model`);
429 |       return languageModels[modelId as keyof typeof languageModels];
430 |   }
431 | 
432 | };
433 | 
434 | export const modelDetails: Record<keyof typeof languageModels, ModelInfo> = {
435 |   "openrouter/anthropic/claude-3.5-sonnet": {
436 |     provider: "OpenRouter",
437 |     name: "Claude 3.5 Sonnet",
438 |     description: "New Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at: Coding, Data science, Visual processing, Agentic tasks",
439 |     apiVersion: "anthropic/claude-3.5-sonnet",
440 |     capabilities: ["Coding", "Data science", "Visual processing", "Agentic tasks"],
441 |     enabled: true,
442 |     supportsWebSearch: true,
443 |     premium: true
444 |   },
445 |   "claude-3-7-sonnet": {
446 |     provider: "Anthropic",
447 |     name: "Claude 3.7 Sonnet",
448 |     description: "Latest version of Anthropic\'s Claude 3.7 Sonnet with strong reasoning and coding capabilities.",
449 |     apiVersion: "claude-3-7-sonnet-20250219",
450 |     capabilities: ["Reasoning", "Efficient", "Agentic"],
451 |     enabled: false,
452 |     premium: true
453 |   },
454 |   "openrouter/anthropic/claude-3.7-sonnet": {
455 |     provider: "OpenRouter",
456 |     name: "Claude 3.7 Sonnet",
457 |     description: "Latest version of Anthropic\'s Claude 3.7 Sonnet accessed via OpenRouter. Strong reasoning and coding capabilities.",
458 |     apiVersion: "anthropic/claude-3.7-sonnet",
459 |     capabilities: ["Reasoning", "Coding", "Agentic"],
460 |     enabled: true,
461 |     supportsWebSearch: true,
462 |     premium: true
463 |   },
464 |   "openrouter/anthropic/claude-3.7-sonnet:thinking": {
465 |     provider: "OpenRouter",
466 |     name: "Claude 3.7 Sonnet (thinking)",
467 |     description: "Advanced LLM with improved reasoning, coding, and problem-solving. Features a hybrid reasoning approach for flexible processing.",
468 |     apiVersion: "anthropic/claude-3.7-sonnet:thinking",
469 |     capabilities: ["Reasoning", "Coding", "Problem-solving", "Agentic"],
470 |     enabled: true,
471 |     supportsWebSearch: true,
472 |     premium: true
473 |   },
474 |   "openrouter/deepseek/deepseek-chat-v3-0324": {
475 |     provider: "OpenRouter",
476 |     name: "DeepSeek Chat V3 0324",
477 |     description: "DeepSeek Chat model V3 accessed via OpenRouter.",
478 |     apiVersion: "deepseek/deepseek-chat-v3-0324",
479 |     capabilities: ["Chat", "Efficient"],
480 |     enabled: true,
481 |     supportsWebSearch: true,
482 |     premium: false
483 |   },
484 |   "openrouter/deepseek/deepseek-r1": {
485 |     provider: "OpenRouter",
486 |     name: "DeepSeek R1",
487 |     description: "DeepSeek R1: Open-source model with performance on par with OpenAI o1, featuring open reasoning tokens. 671B parameters (37B active). MIT licensed. Note: This model cannot be used for Tool Calling (e.g., MCP Servers).",
488 |     apiVersion: "deepseek/deepseek-r1",
489 |     capabilities: ["Reasoning", "Open Source"],
490 |     enabled: true,
491 |     supportsWebSearch: true,
492 |     premium: false
493 |   },
494 |   "openrouter/deepseek/deepseek-r1-0528": {
495 |     provider: "OpenRouter",
496 |     name: "DeepSeek R1 0528",
497 |     description: "DeepSeek R1 0528: May 28th update to DeepSeek R1. Open-source model with performance on par with OpenAI o1, featuring open reasoning tokens. 671B parameters (37B active). MIT licensed. Note: This model cannot be used for Tool Calling (e.g., MCP Servers).",
498 |     apiVersion: "deepseek/deepseek-r1-0528",
499 |     capabilities: ["Reasoning", "Open Source"],
500 |     enabled: true,
501 |     supportsWebSearch: true,
502 |     premium: false
503 |   },
504 |   "openrouter/deepseek/deepseek-r1-0528-qwen3-8b": {
505 |     provider: "OpenRouter",
506 |     name: "DeepSeek R1 0528 Qwen3 8B",
507 |     description: "DeepSeek-R1-0528-Qwen3-8B, an 8B parameter model distilled from DeepSeek R1 0528, excels in reasoning, math, programming, and logic. Accessed via OpenRouter.",
508 |     apiVersion: "deepseek/deepseek-r1-0528-qwen3-8b",
509 |     capabilities: ["Reasoning", "Math", "Programming", "Logic"],
510 |     enabled: false,
511 |     supportsWebSearch: true,
512 |     premium: false
513 |   },
514 |   "openrouter/google/gemini-2.5-flash-preview": {
515 |     provider: "OpenRouter",
516 |     name: "Google Gemini 2.5 Flash Preview",
517 |     description: "Google\'s latest Gemini 2.5 Flash model, optimized for speed and efficiency, accessed via OpenRouter.",
518 |     apiVersion: "google/gemini-2.5-flash-preview",
519 |     capabilities: ["Fast", "Efficient", "Multimodal"],
520 |     enabled: true,
521 |     supportsWebSearch: true,
522 |     premium: false
523 |   },
524 |   "openrouter/google/gemini-2.5-flash-preview:thinking": {
525 |     provider: "OpenRouter",
526 |     name: "Google Gemini 2.5 Flash Preview (thinking)",
527 |     description: "Google\'s latest Gemini 2.5 Flash model with thinking capabilities, optimized for speed and efficiency, accessed via OpenRouter.",
528 |     apiVersion: "google/gemini-2.5-flash-preview:thinking",
529 |     capabilities: ["Fast", "Efficient", "Multimodal", "Thinking"],
530 |     enabled: true,
531 |     supportsWebSearch: true,
532 |     premium: false
533 |   },
534 |   "openrouter/google/gemini-2.5-flash-preview-05-20": {
535 |     provider: "OpenRouter",
536 |     name: "Google Gemini 2.5 Flash Preview (05-20)",
537 |     description: "Google\'s Gemini 2.5 Flash model (May 20th version), optimized for speed and efficiency, accessed via OpenRouter.",
538 |     apiVersion: "google/gemini-2.5-flash-preview-05-20",
539 |     capabilities: ["Fast", "Efficient", "Multimodal"],
540 |     enabled: true,
541 |     supportsWebSearch: true,
542 |     premium: false
543 |   },
544 |   "openrouter/google/gemini-2.5-flash-preview-05-20:thinking": {
545 |     provider: "OpenRouter",
546 |     name: "Google Gemini 2.5 Flash Preview (05-20, thinking)",
547 |     description: "Google\'s Gemini 2.5 Flash model (May 20th version) with thinking capabilities, optimized for speed and efficiency, accessed via OpenRouter.",
548 |     apiVersion: "google/gemini-2.5-flash-preview-05-20:thinking",
549 |     capabilities: ["Fast", "Efficient", "Multimodal", "Thinking"],
550 |     enabled: true,
551 |     supportsWebSearch: true,
552 |     premium: false
553 |   },
554 |   "openrouter/google/gemini-2.5-pro-preview-03-25": {
555 |     provider: "OpenRouter",
556 |     name: "Google Gemini 2.5 Pro Preview (03-25)",
557 |     description: "Google\'s Gemini 2.5 Pro model (March 25th version), a powerful and versatile model, accessed via OpenRouter.",
558 |     apiVersion: "google/gemini-2.5-pro-preview-03-25",
559 |     capabilities: ["Powerful", "Versatile", "Multimodal"],
560 |     enabled: true,
561 |     supportsWebSearch: true,
562 |     premium: true
563 |   },
564 |   "openrouter/google/gemini-2.5-pro-preview": {
565 |     provider: "OpenRouter",
566 |     name: "Google Gemini 2.5 Pro Preview (06-05)",
567 |     description: "Google\'s state-of-the-art AI model designed for advanced reasoning, coding, mathematics, and scientific tasks. Achieves top-tier performance on multiple benchmarks with superior human-preference alignment.",
568 |     apiVersion: "google/gemini-2.5-pro-preview",
569 |     capabilities: ["Advanced Reasoning", "Coding", "Mathematics", "Scientific Tasks", "Multimodal"],
570 |     enabled: true,
571 |     supportsWebSearch: true,
572 |     premium: true
573 |   },
574 |   "openrouter/google/gemini-2.5-pro": {
575 |     provider: "OpenRouter",
576 |     name: "Google Gemini 2.5 Pro",
577 |     description: "Google's state-of-the-art AI model designed for advanced reasoning, coding, mathematics, and scientific tasks. Achieves top-tier performance on multiple benchmarks with superior human-preference alignment.",
578 |     apiVersion: "google/gemini-2.5-pro",
579 |     capabilities: ["Advanced Reasoning", "Coding", "Mathematics", "Scientific Tasks", "Multimodal"],
580 |     enabled: true,
581 |     supportsWebSearch: true,
582 |     premium: true
583 |   },
584 |   "openrouter/google/gemini-2.5-flash": {
585 |     provider: "OpenRouter",
586 |     name: "Google Gemini 2.5 Flash",
587 |     description: "Google's state-of-the-art workhorse model, specifically designed for advanced reasoning, coding, mathematics, and scientific tasks. It includes built-in thinking capabilities, enabling it to provide responses with greater accuracy and nuanced context handling.",
588 |     apiVersion: "google/gemini-2.5-flash",
589 |     capabilities: ["Advanced Reasoning", "Coding", "Mathematics", "Scientific Tasks", "Thinking", "Multimodal"],
590 |     enabled: true,
591 |     supportsWebSearch: true,
592 |     premium: false
593 |   },
594 |   "openrouter/google/gemini-2.5-flash-lite-preview-06-17": {
595 |     provider: "OpenRouter",
596 |     name: "Google Gemini 2.5 Flash Lite Preview 06-17",
597 |     description: "Gemini 2.5 Flash-Lite is a lightweight reasoning model in the Gemini 2.5 family, optimized for ultra-low latency and cost efficiency. It offers improved throughput, faster token generation, and better performance across common benchmarks compared to earlier Flash models. By default, thinking is disabled to prioritize speed, but can be enabled via the Reasoning API parameter.",
598 |     apiVersion: "google/gemini-2.5-flash-lite-preview-06-17",
599 |     capabilities: ["Ultra-low latency", "Cost efficient", "Fast token generation", "Lightweight reasoning", "Improved throughput"],
600 |     enabled: true,
601 |     supportsWebSearch: true,
602 |     premium: false
603 |   },
604 |   "openrouter/x-ai/grok-3-beta": {
605 |     provider: "OpenRouter",
606 |     name: "X AI Grok 3 Beta",
607 |     description: "Grok 3 Beta from X AI, a cutting-edge model with strong reasoning and problem-solving capabilities, accessed via OpenRouter.",
608 |     apiVersion: "x-ai/grok-3-beta",
609 |     capabilities: ["Reasoning", "Problem-solving", "Cutting-edge"],
610 |     enabled: true,
611 |     supportsWebSearch: true,
612 |     premium: true
613 |   },
614 |   "grok-3-mini": {
615 |     provider: "X AI",
616 |     name: "X AI Grok 3 Mini",
617 |     description: "Grok 3 Mini from X AI, a compact and efficient model for various tasks.",
618 |     apiVersion: "grok-3-mini-latest",
619 |     capabilities: ["Compact", "Efficient", "Versatile"],
620 |     enabled: false,
621 |     supportsWebSearch: true,
622 |     premium: false
623 |   },
624 |   "openrouter/x-ai/grok-3-mini-beta": {
625 |     provider: "OpenRouter",
626 |     name: "X AI Grok 3 Mini Beta",
627 |     description: "Grok 3 Mini Beta from X AI, a compact and efficient model, accessed via OpenRouter.",
628 |     apiVersion: "x-ai/grok-3-mini-beta",
629 |     capabilities: ["Compact", "Efficient", "Versatile"],
630 |     enabled: true,
631 |     supportsWebSearch: true,
632 |     premium: false
633 |   },
634 |   "openrouter/x-ai/grok-3-mini-beta-reasoning-high": {
635 |     provider: "OpenRouter",
636 |     name: "X AI Grok 3 Mini Beta (High Reasoning)",
637 |     description: "Grok 3 Mini Beta from X AI with high reasoning effort, accessed via OpenRouter.",
638 |     apiVersion: "x-ai/grok-3-mini-beta",
639 |     capabilities: ["Compact", "Efficient", "Versatile", "High Reasoning"],
640 |     enabled: true,
641 |     supportsWebSearch: true,
642 |     premium: false
643 |   },
644 |   "openrouter/meta-llama/llama-4-maverick": {
645 |     provider: "OpenRouter",
646 |     name: "Meta Llama 4 Maverick",
647 |     description: "Meta Llama 4 Maverick, a cutting-edge model from Meta, accessed via OpenRouter.",
648 |     apiVersion: "meta-llama/llama-4-maverick",
649 |     capabilities: ["Cutting-edge", "Versatile"],
650 |     enabled: true,
651 |     supportsWebSearch: true,
652 |     premium: false
653 |   },
654 |   "openrouter/mistralai/mistral-medium-3": {
655 |     provider: "OpenRouter",
656 |     name: "Mistral Medium 3",
657 |     description: "Mistral Medium 3, a powerful model from Mistral AI, accessed via OpenRouter.",
658 |     apiVersion: "mistralai/mistral-medium-3",
659 |     capabilities: ["Powerful", "Versatile"],
660 |     enabled: true,
661 |     supportsWebSearch: true,
662 |     premium: false
663 |   },
664 |   "openrouter/mistralai/mistral-small-3.1-24b-instruct": {
665 |     provider: "OpenRouter",
666 |     name: "Mistral Small 3.1 24B Instruct",
667 |     description: "Mistral Small 3.1 24B Instruct, an efficient and capable model from Mistral AI, accessed via OpenRouter.",
668 |     apiVersion: "mistralai/mistral-small-3.1-24b-instruct",
669 |     capabilities: ["Efficient", "Capable", "Instruct"],
670 |     enabled: true,
671 |     supportsWebSearch: true,
672 |     premium: false
673 |   },
674 |   "openrouter/mistralai/magistral-small-2506": {
675 |     provider: "OpenRouter",
676 |     name: "Mistral Magistral Small 2506",
677 |     description: "Magistral Small is a 24B parameter instruction-tuned model based on Mistral-Small-3.1, enhanced through supervised fine-tuning and reinforcement learning. Optimized for reasoning and supports multilingual capabilities across 20+ languages.",
678 |     apiVersion: "mistralai/magistral-small-2506",
679 |     capabilities: ["Reasoning", "Multilingual", "Instruction Following", "Enhanced"],
680 |     enabled: true,
681 |     supportsWebSearch: true,
682 |     premium: false
683 |   },
684 |   "openrouter/mistralai/magistral-medium-2506": {
685 |     provider: "OpenRouter",
686 |     name: "Mistral Magistral Medium 2506",
687 |     description: "Magistral is Mistral's first reasoning model. Ideal for general purpose use requiring longer thought processing and better accuracy than with non-reasoning LLMs. From legal research and financial forecasting to software development and creative storytelling — this model solves multi-step challenges where transparency and precision are critical.",
688 |     apiVersion: "mistralai/magistral-medium-2506",
689 |     capabilities: ["Reasoning", "Legal Research", "Financial Forecasting", "Software Development", "Creative Storytelling", "Multi-step Problem Solving"],
690 |     enabled: true,
691 |     supportsWebSearch: true,
692 |     premium: true
693 |   },
694 |   "openrouter/mistralai/magistral-medium-2506:thinking": {
695 |     provider: "OpenRouter",
696 |     name: "Mistral Magistral Medium 2506 (thinking)",
697 |     description: "Magistral Medium 2506 with enhanced thinking capabilities. Mistral's first reasoning model optimized for longer thought processing and better accuracy. Excels at legal research, financial forecasting, software development, and creative storytelling with transparent reasoning.",
698 |     apiVersion: "mistralai/magistral-medium-2506:thinking",
[TRUNCATED]
```

app/actions.ts
```
1 | "use server";
2 | 
3 | import { openai } from "@ai-sdk/openai";
4 | import { generateObject } from "ai";
5 | import { z } from "zod";
6 | import { getApiKey, model, titleGenerationModel, getTitleGenerationModel, type modelID } from "@/ai/providers";
7 | import { type MessagePart } from "@/lib/db/schema";
8 | 
9 | // Helper to extract text content from a message regardless of format
10 | function getMessageText(message: any): string {
11 |   // Check if the message has parts (new format)
12 |   if (message.parts && Array.isArray(message.parts)) {
13 |     const textParts = message.parts.filter((p: any) => p.type === 'text' && p.text);
14 |     if (textParts.length > 0) {
15 |       return textParts.map((p: any) => p.text).join('\n');
16 |     }
17 |   }
18 | 
19 |   // Fallback to content (old format)
20 |   if (typeof message.content === 'string') {
21 |     return message.content;
22 |   }
23 | 
24 |   // If content is an array (potentially of parts), try to extract text
25 |   if (Array.isArray(message.content)) {
26 |     const textItems = message.content.filter((item: any) =>
27 |       typeof item === 'string' || (item.type === 'text' && item.text)
28 |     );
29 | 
30 |     if (textItems.length > 0) {
31 |       return textItems.map((item: any) =>
32 |         typeof item === 'string' ? item : item.text
33 |       ).join('\n');
34 |     }
35 |   }
36 | 
37 |   return '';
38 | }
39 | 
40 | export async function generateTitle(messages: any[], selectedModel?: string, apiKeys?: Record<string, string>) {
41 |   // Find the first user message
42 |   const firstUserMessage = messages.find(msg => msg.role === 'user');
43 | 
44 |   // If no user message, fallback to a default title (or handle as error)
45 |   if (!firstUserMessage) {
46 |     console.warn("No user message found for title generation.");
47 |     return 'New Chat';
48 |   }
49 | 
50 |   const userContent = getMessageText(firstUserMessage);
51 | 
52 |   // Prepare messages for the API - just the user content
53 |   const titleGenMessages = [
54 |     {
55 |       role: 'user' as const,
56 |       content: userContent
57 |     }
58 |   ];
59 | 
60 |   console.log('Generating title with simplified messages:', JSON.stringify(titleGenMessages, null, 2)); // Log the messages
61 | 
62 |   // Determine the title generation model to use
63 |   let titleModel;
64 |   if (selectedModel && apiKeys) {
65 |     // Use dynamic model selection with API keys
66 |     titleModel = getTitleGenerationModel(selectedModel as modelID, apiKeys);
67 |   } else if (selectedModel) {
68 |     // Use dynamic model selection without API keys
69 |     titleModel = getTitleGenerationModel(selectedModel as modelID);
70 |   } else {
71 |     // Fallback to static model
72 |     titleModel = titleGenerationModel;
73 |   }
74 | 
75 |   try {
76 |     const { object } = await generateObject({
77 |       model: titleModel,
78 |       schema: z.object({
79 |         title: z.string().min(1).max(100),
80 |       }),
81 |       system: `
82 |       You are a helpful assistant that generates short, concise titles for chat conversations based *only* on the user's first message.
83 |       The title should summarize the main topic or request of the user's message.
84 |       The title should be no more than 30 characters.
85 |       The title should be unique and not generic like "Chat Title".
86 |       Focus on keywords from the user's message.
87 |       `,
88 |       messages: [
89 |         ...titleGenMessages,
90 |         {
91 |           role: "user",
92 |           content: "Generate a concise title based on my first message.",
93 |         },
94 |       ],
95 |     });
96 |     return object.title;
97 |   } catch (error) {
98 |     console.error('Error generating title with generateObject:', error);
99 |     // Fallback to a simple title derived from the first few words if AI fails
100 |     return userContent.split(' ').slice(0, 5).join(' ') + (userContent.split(' ').length > 5 ? '...' : '');
101 |   }
102 | }
```

app/globals.css
```
1 | @import "tailwindcss";
2 | 
3 | @plugin "tailwindcss-animate";
4 | 
5 | @custom-variant dark (&:is(.dark *));
6 | @custom-variant sunset (&:is(.sunset *));
7 | @custom-variant black (&:is(.black *));
8 | @custom-variant cyberpunk (&:is(.cyberpunk *));
9 | 
10 | :root {
11 |   --background: oklch(0.99 0.01 56.32);
12 |   --foreground: oklch(0.34 0.01 2.77);
13 |   --card: oklch(1.00 0 0);
14 |   --card-foreground: oklch(0.34 0.01 2.77);
15 |   --popover: oklch(1.00 0 0);
16 |   --popover-foreground: oklch(0.34 0.01 2.77);
17 |   --primary: oklch(0.74 0.16 34.71);
18 |   --primary-foreground: oklch(1.00 0 0);
19 |   --secondary: oklch(0.96 0.02 28.90);
20 |   --secondary-foreground: oklch(0.56 0.13 32.74);
21 |   --muted: oklch(0.97 0.02 39.40);
22 |   --muted-foreground: oklch(0.49 0.05 26.45);
23 |   --accent: oklch(0.83 0.11 58.00);
24 |   --accent-foreground: oklch(0.34 0.01 2.77);
25 |   --destructive: oklch(0.61 0.21 22.24);
26 |   --destructive-foreground: oklch(1.00 0 0);
27 |   --border: oklch(0.93 0.04 38.69);
28 |   --input: oklch(0.93 0.04 38.69);
29 |   --ring: oklch(0.74 0.16 34.71);
30 |   --chart-1: oklch(0.74 0.16 34.71);
31 |   --chart-2: oklch(0.83 0.11 58.00);
32 |   --chart-3: oklch(0.88 0.08 54.93);
33 |   --chart-4: oklch(0.82 0.11 40.89);
34 |   --chart-5: oklch(0.64 0.13 32.07);
35 |   --sidebar: oklch(0.97 0.02 39.40);
36 |   --sidebar-foreground: oklch(0.34 0.01 2.77);
37 |   --sidebar-primary: oklch(0.74 0.16 34.71);
38 |   --sidebar-primary-foreground: oklch(1.00 0 0);
39 |   --sidebar-accent: oklch(0.83 0.11 58.00);
40 |   --sidebar-accent-foreground: oklch(0.34 0.01 2.77);
41 |   --sidebar-border: oklch(0.93 0.04 38.69);
42 |   --sidebar-ring: oklch(0.74 0.16 34.71);
43 |   --font-sans: Montserrat, sans-serif;
44 |   --font-serif: Merriweather, serif;
45 |   --font-mono: Ubuntu Mono, monospace;
46 |   --radius: 0.625rem;
47 |   --shadow-2xs: 0px 6px 12px -3px hsl(0 0% 0% / 0.04);
48 |   --shadow-xs: 0px 6px 12px -3px hsl(0 0% 0% / 0.04);
49 |   --shadow-sm: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 1px 2px -4px hsl(0 0% 0% / 0.09);
50 |   --shadow: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 1px 2px -4px hsl(0 0% 0% / 0.09);
51 |   --shadow-md: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 2px 4px -4px hsl(0 0% 0% / 0.09);
52 |   --shadow-lg: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 4px 6px -4px hsl(0 0% 0% / 0.09);
53 |   --shadow-xl: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 8px 10px -4px hsl(0 0% 0% / 0.09);
54 |   --shadow-2xl: 0px 6px 12px -3px hsl(0 0% 0% / 0.22);
55 | }
56 | 
57 | .dark {
58 |   --background: oklch(0.26 0.02 352.40);
59 |   --foreground: oklch(0.94 0.01 51.32);
60 |   --card: oklch(0.32 0.02 341.45);
61 |   --card-foreground: oklch(0.94 0.01 51.32);
62 |   --popover: oklch(0.32 0.02 341.45);
63 |   --popover-foreground: oklch(0.94 0.01 51.32);
64 |   --primary: oklch(0.57 0.15 35.26);
65 |   --primary-foreground: oklch(1.00 0 0);
66 |   --secondary: oklch(0.36 0.02 342.27);
67 |   --secondary-foreground: oklch(0.94 0.01 51.32);
68 |   --muted: oklch(0.32 0.02 341.45);
69 |   --muted-foreground: oklch(0.84 0.02 52.63);
70 |   --accent: oklch(0.36 0.02 342.27);
71 |   --accent-foreground: oklch(0.94 0.01 51.32);
72 |   --destructive: oklch(0.51 0.16 20.19);
73 |   --destructive-foreground: oklch(1.00 0 0);
74 |   --border: oklch(0.36 0.02 342.27);
75 |   --input: oklch(0.36 0.02 342.27);
76 |   --ring: oklch(0.74 0.16 34.71);
77 |   --chart-1: oklch(0.74 0.16 34.71);
78 |   --chart-2: oklch(0.83 0.11 58.00);
79 |   --chart-3: oklch(0.88 0.08 54.93);
80 |   --chart-4: oklch(0.82 0.11 40.89);
81 |   --chart-5: oklch(0.64 0.13 32.07);
82 |   --sidebar: oklch(0.26 0.02 352.40);
83 |   --sidebar-foreground: oklch(0.94 0.01 51.32);
84 |   --sidebar-primary: oklch(0.47 0.08 34.31);
85 |   --sidebar-primary-foreground: oklch(1.00 0 0);
86 |   --sidebar-accent: oklch(0.67 0.09 56.00);
87 |   --sidebar-accent-foreground: oklch(0.94 0.01 51.32);
88 |   --sidebar-border: oklch(0.36 0.02 342.27);
89 |   --sidebar-ring: oklch(0.74 0.16 34.71);
90 |   --font-sans: Montserrat, sans-serif;
91 |   --font-serif: Merriweather, serif;
92 |   --font-mono: Ubuntu Mono, monospace;
93 |   --radius: 0.625rem;
94 |   --shadow-2xs: 0px 6px 12px -3px hsl(0 0% 0% / 0.04);
95 |   --shadow-xs: 0px 6px 12px -3px hsl(0 0% 0% / 0.04);
96 |   --shadow-sm: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 1px 2px -4px hsl(0 0% 0% / 0.09);
97 |   --shadow: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 1px 2px -4px hsl(0 0% 0% / 0.09);
98 |   --shadow-md: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 2px 4px -4px hsl(0 0% 0% / 0.09);
99 |   --shadow-lg: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 4px 6px -4px hsl(0 0% 0% / 0.09);
100 |   --shadow-xl: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 8px 10px -4px hsl(0 0% 0% / 0.09);
101 |   --shadow-2xl: 0px 6px 12px -3px hsl(0 0% 0% / 0.22);
102 | }
103 | 
104 | .sunset {
105 |   --background: oklch(0.98 0.03 80.00);
106 |   --foreground: oklch(0.34 0.01 2.77);
107 |   --card: oklch(1.00 0 0);
108 |   --card-foreground: oklch(0.34 0.01 2.77);
109 |   --popover: oklch(1.00 0 0);
110 |   --popover-foreground: oklch(0.34 0.01 2.77);
111 |   --primary: oklch(0.65 0.26 34.00);
112 |   --primary-foreground: oklch(1.00 0 0);
113 |   --secondary: oklch(0.96 0.05 60.00);
114 |   --secondary-foreground: oklch(0.56 0.13 32.74);
115 |   --muted: oklch(0.97 0.02 39.40);
116 |   --muted-foreground: oklch(0.49 0.05 26.45);
117 |   --accent: oklch(0.83 0.22 50.00);
118 |   --accent-foreground: oklch(0.34 0.01 2.77);
119 |   --destructive: oklch(0.61 0.21 22.24);
120 |   --destructive-foreground: oklch(1.00 0 0);
121 |   --border: oklch(0.93 0.06 60.00);
122 |   --input: oklch(0.93 0.06 60.00);
123 |   --ring: oklch(0.65 0.26 34.00);
124 |   --chart-1: oklch(0.65 0.26 34.00);
125 |   --chart-2: oklch(0.83 0.22 50.00);
126 |   --chart-3: oklch(0.88 0.15 54.93);
127 |   --chart-4: oklch(0.82 0.20 40.89);
128 |   --chart-5: oklch(0.64 0.18 32.07);
129 |   --sidebar: oklch(0.97 0.04 70.00);
130 |   --sidebar-foreground: oklch(0.34 0.01 2.77);
131 |   --sidebar-primary: oklch(0.65 0.26 34.00);
132 |   --sidebar-primary-foreground: oklch(1.00 0 0);
133 |   --sidebar-accent: oklch(0.83 0.22 50.00);
134 |   --sidebar-accent-foreground: oklch(0.34 0.01 2.77);
135 |   --sidebar-border: oklch(0.93 0.06 60.00);
136 |   --sidebar-ring: oklch(0.65 0.26 34.00);
137 |   --font-sans: Montserrat, sans-serif;
138 |   --font-serif: Merriweather, serif;
139 |   --font-mono: Ubuntu Mono, monospace;
140 |   --radius: 0.625rem;
141 |   --shadow-2xs: 0px 6px 12px -3px hsl(0 0% 0% / 0.04);
142 |   --shadow-xs: 0px 6px 12px -3px hsl(0 0% 0% / 0.04);
143 |   --shadow-sm: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 1px 2px -4px hsl(0 0% 0% / 0.09);
144 |   --shadow: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 1px 2px -4px hsl(0 0% 0% / 0.09);
145 |   --shadow-md: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 2px 4px -4px hsl(0 0% 0% / 0.09);
146 |   --shadow-lg: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 4px 6px -4px hsl(0 0% 0% / 0.09);
147 |   --shadow-xl: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 8px 10px -4px hsl(0 0% 0% / 0.09);
148 |   --shadow-2xl: 0px 6px 12px -3px hsl(0 0% 0% / 0.22);
149 | }
150 | 
151 | .black {
152 |   --background: oklch(0.15 0.01 350.00);
153 |   --foreground: oklch(0.95 0.01 60.00);
154 |   --card: oklch(0.20 0.01 340.00);
155 |   --card-foreground: oklch(0.95 0.01 60.00);
156 |   --popover: oklch(0.20 0.01 340.00);
157 |   --popover-foreground: oklch(0.95 0.01 60.00);
158 |   --primary: oklch(0.45 0.10 35.00);
159 |   --primary-foreground: oklch(1.00 0 0);
160 |   --secondary: oklch(0.25 0.01 340.00);
161 |   --secondary-foreground: oklch(0.95 0.01 60.00);
162 |   --muted: oklch(0.22 0.01 340.00);
163 |   --muted-foreground: oklch(0.86 0.01 60.00);
164 |   --accent: oklch(0.70 0.09 58.00);
165 |   --accent-foreground: oklch(0.15 0.01 350.00);
166 |   --destructive: oklch(0.45 0.16 20.00);
167 |   --destructive-foreground: oklch(1.00 0 0);
168 |   --border: oklch(0.25 0.01 340.00);
169 |   --input: oklch(0.25 0.01 340.00);
170 |   --ring: oklch(0.45 0.10 35.00);
171 |   --chart-1: oklch(0.45 0.10 35.00);
172 |   --chart-2: oklch(0.70 0.09 58.00);
173 |   --chart-3: oklch(0.80 0.06 54.00);
174 |   --chart-4: oklch(0.75 0.08 40.00);
175 |   --chart-5: oklch(0.55 0.10 32.00);
176 |   --sidebar: oklch(0.15 0.01 350.00);
177 |   --sidebar-foreground: oklch(0.95 0.01 60.00);
178 |   --sidebar-primary: oklch(0.40 0.06 34.00);
179 |   --sidebar-primary-foreground: oklch(1.00 0 0);
180 |   --sidebar-accent: oklch(0.60 0.07 56.00);
181 |   --sidebar-accent-foreground: oklch(0.15 0.01 350.00);
182 |   --sidebar-border: oklch(0.25 0.01 340.00);
183 |   --sidebar-ring: oklch(0.45 0.10 35.00);
184 |   --font-sans: Montserrat, sans-serif;
185 |   --font-serif: Merriweather, serif;
186 |   --font-mono: Ubuntu Mono, monospace;
187 |   --radius: 0.625rem;
188 |   --shadow-2xs: 0px 6px 12px -3px hsl(0 0% 0% / 0.04);
189 |   --shadow-xs: 0px 6px 12px -3px hsl(0 0% 0% / 0.04);
190 |   --shadow-sm: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 1px 2px -4px hsl(0 0% 0% / 0.09);
191 |   --shadow: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 1px 2px -4px hsl(0 0% 0% / 0.09);
192 |   --shadow-md: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 2px 4px -4px hsl(0 0% 0% / 0.09);
193 |   --shadow-lg: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 4px 6px -4px hsl(0 0% 0% / 0.09);
194 |   --shadow-xl: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 8px 10px -4px hsl(0 0% 0% / 0.09);
195 |   --shadow-2xl: 0px 6px 12px -3px hsl(0 0% 0% / 0.22);
196 | }
197 | 
198 | /* Cyberpunk Theme */
199 | .cyberpunk {
200 |   --background: oklch(0.18 0.05 280);
201 |   /* Dark Purple */
202 |   --foreground: oklch(0.95 0.15 180);
203 |   /* Brighter Cyan */
204 |   --card: oklch(0.22 0.06 275);
205 |   /* Darker Purple */
206 |   --card-foreground: oklch(0.95 0.15 180);
207 |   /* Brighter Cyan */
208 |   --popover: oklch(0.22 0.06 275);
209 |   /* Darker Purple */
210 |   --popover-foreground: oklch(0.95 0.15 180);
211 |   /* Brighter Cyan */
212 |   --primary: oklch(0.70 0.25 300);
213 |   /* Electric Pink */
214 |   --primary-foreground: oklch(0.10 0.02 280);
215 |   /* Very Dark Purple */
216 |   --secondary: oklch(0.30 0.08 270);
217 |   /* Medium Purple */
218 |   --secondary-foreground: oklch(0.95 0.15 180);
219 |   /* Brighter Cyan */
220 |   --muted: oklch(0.25 0.07 272);
221 |   /* Muted Purple */
222 |   --muted-foreground: oklch(0.80 0.10 180);
223 |   /* Brighter Lighter Cyan */
224 |   --accent: oklch(0.85 0.20 140);
225 |   /* Neon Green */
226 |   --accent-foreground: oklch(0.10 0.02 280);
227 |   /* Very Dark Purple */
228 |   --destructive: oklch(0.60 0.25 15);
229 |   /* Bright Red */
230 |   --destructive-foreground: oklch(0.10 0.02 280);
231 |   /* Very Dark Purple */
232 |   --border: oklch(0.40 0.10 290);
233 |   /* Neon Border */
234 |   --input: oklch(0.30 0.08 270);
235 |   /* Medium Purple */
236 |   --ring: oklch(0.70 0.25 300);
237 |   /* Electric Pink */
238 |   --chart-1: oklch(0.70 0.25 300);
239 |   /* Electric Pink */
240 |   --chart-2: oklch(0.85 0.20 140);
241 |   /* Neon Green */
242 |   --chart-3: oklch(0.75 0.22 240);
243 |   /* Electric Blue */
244 |   --chart-4: oklch(0.80 0.18 90);
245 |   /* Neon Yellow */
246 |   --chart-5: oklch(0.65 0.20 0);
247 |   /* Bright Orange */
248 |   --sidebar: oklch(0.15 0.04 285);
249 |   /* Very Dark Purple */
250 |   --sidebar-foreground: oklch(0.95 0.15 180);
251 |   /* Brighter Cyan */
252 |   --sidebar-primary: oklch(0.70 0.25 300);
253 |   /* Electric Pink */
254 |   --sidebar-primary-foreground: oklch(0.10 0.02 280);
255 |   /* Very Dark Purple */
256 |   --sidebar-accent: oklch(0.85 0.20 140);
257 |   /* Neon Green */
258 |   --sidebar-accent-foreground: oklch(0.10 0.02 280);
259 |   /* Very Dark Purple */
260 |   --sidebar-border: oklch(0.40 0.10 290);
261 |   /* Neon Border */
262 |   --sidebar-ring: oklch(0.70 0.25 300);
263 |   /* Electric Pink */
264 |   --font-sans: 'Orbitron', sans-serif;
265 |   /* Futuristic font */
266 |   --font-serif: 'Share Tech Mono', monospace;
267 |   /* Monospaced for code feel */
268 |   --font-mono: 'Share Tech Mono', monospace;
269 |   --radius: 0.25rem;
270 |   /* Sharper edges */
271 |   --shadow-2xs: 0px 2px 4px -1px oklch(0.70 0.25 300 / 0.2);
272 |   --shadow-xs: 0px 3px 6px -1px oklch(0.70 0.25 300 / 0.25);
273 |   --shadow-sm: 0px 4px 8px -2px oklch(0.70 0.25 300 / 0.3), 0px 2px 4px -2px oklch(0.70 0.25 300 / 0.2);
274 |   --shadow: 0px 6px 12px -3px oklch(0.70 0.25 300 / 0.35), 0px 4px 6px -4px oklch(0.70 0.25 300 / 0.25);
275 |   --shadow-md: 0px 8px 16px -4px oklch(0.70 0.25 300 / 0.4), 0px 4px 8px -4px oklch(0.70 0.25 300 / 0.3);
276 |   --shadow-lg: 0px 12px 24px -6px oklch(0.70 0.25 300 / 0.45), 0px 6px 12px -6px oklch(0.70 0.25 300 / 0.35);
277 |   --shadow-xl: 0px 16px 32px -8px oklch(0.70 0.25 300 / 0.5), 0px 8px 16px -8px oklch(0.70 0.25 300 / 0.4);
278 |   --shadow-2xl: 0px 24px 48px -12px oklch(0.70 0.25 300 / 0.6);
279 | }
280 | 
281 | /* Retro Theme */
282 | .retro {
283 |   --background: oklch(0.95 0.02 90);
284 |   /* Cream */
285 |   --foreground: oklch(0.35 0.08 40);
286 |   /* Dark Brown */
287 |   --card: oklch(0.98 0.01 85);
288 |   /* Lighter Cream */
289 |   --card-foreground: oklch(0.35 0.08 40);
290 |   /* Dark Brown */
291 |   --popover: oklch(0.98 0.01 85);
292 |   /* Lighter Cream */
293 |   --popover-foreground: oklch(0.35 0.08 40);
294 |   /* Dark Brown */
295 |   --primary: oklch(0.60 0.15 140);
296 |   /* Avocado Green */
297 |   --primary-foreground: oklch(0.95 0.02 90);
298 |   /* Cream */
299 |   --secondary: oklch(0.85 0.10 80);
300 |   /* Mustard Yellow */
301 |   --secondary-foreground: oklch(0.35 0.08 40);
302 |   /* Dark Brown */
303 |   --muted: oklch(0.92 0.03 88);
304 |   /* Muted Cream */
305 |   --muted-foreground: oklch(0.50 0.06 50);
306 |   /* Medium Brown */
307 |   --accent: oklch(0.65 0.18 30);
308 |   /* Burnt Orange */
309 |   --accent-foreground: oklch(0.95 0.02 90);
310 |   /* Cream */
311 |   --destructive: oklch(0.55 0.20 25);
312 |   /* Muted Red */
313 |   --destructive-foreground: oklch(0.95 0.02 90);
314 |   /* Cream */
315 |   --border: oklch(0.88 0.04 70);
316 |   /* Light Brown Border */
317 |   --input: oklch(0.88 0.04 70);
318 |   /* Light Brown Border */
319 |   --ring: oklch(0.60 0.15 140);
320 |   /* Avocado Green */
321 |   --chart-1: oklch(0.60 0.15 140);
322 |   /* Avocado Green */
323 |   --chart-2: oklch(0.65 0.18 30);
324 |   /* Burnt Orange */
325 |   --chart-3: oklch(0.70 0.12 190);
326 |   /* Teal */
327 |   --chart-4: oklch(0.85 0.10 80);
328 |   /* Mustard Yellow */
329 |   --chart-5: oklch(0.50 0.10 45);
330 |   /* Darker Brown */
331 |   --sidebar: oklch(0.90 0.03 85);
332 |   /* Slightly Darker Cream */
333 |   --sidebar-foreground: oklch(0.35 0.08 40);
334 |   /* Dark Brown */
335 |   --sidebar-primary: oklch(0.60 0.15 140);
336 |   /* Avocado Green */
337 |   --sidebar-primary-foreground: oklch(0.95 0.02 90);
338 |   /* Cream */
339 |   --sidebar-accent: oklch(0.65 0.18 30);
340 |   /* Burnt Orange */
341 |   --sidebar-accent-foreground: oklch(0.95 0.02 90);
342 |   /* Cream */
343 |   --sidebar-border: oklch(0.88 0.04 70);
344 |   /* Light Brown Border */
345 |   --sidebar-ring: oklch(0.60 0.15 140);
346 |   /* Avocado Green */
347 |   --font-sans: 'Lobster', cursive;
348 |   /* Retro script */
349 |   --font-serif: 'Playfair Display', serif;
350 |   /* Classic serif */
351 |   --font-mono: 'Courier Prime', monospace;
352 |   /* Typewriter mono */
353 |   --radius: 0.8rem;
354 |   /* Rounded corners */
355 |   --shadow-2xs: 0px 1px 2px 0px oklch(0.35 0.08 40 / 0.05);
356 |   --shadow-xs: 0px 2px 4px -1px oklch(0.35 0.08 40 / 0.06), 0px 1px 2px -1px oklch(0.35 0.08 40 / 0.04);
357 |   --shadow-sm: 0px 3px 6px -1px oklch(0.35 0.08 40 / 0.08), 0px 2px 4px -2px oklch(0.35 0.08 40 / 0.05);
358 |   --shadow: 0px 4px 8px -2px oklch(0.35 0.08 40 / 0.1), 0px 2px 4px -2px oklch(0.35 0.08 40 / 0.06);
359 |   --shadow-md: 0px 6px 12px -3px oklch(0.35 0.08 40 / 0.12), 0px 4px 6px -4px oklch(0.35 0.08 40 / 0.07);
360 |   --shadow-lg: 0px 10px 20px -5px oklch(0.35 0.08 40 / 0.14), 0px 6px 10px -6px oklch(0.35 0.08 40 / 0.09);
361 |   --shadow-xl: 0px 15px 30px -8px oklch(0.35 0.08 40 / 0.16), 0px 8px 15px -8px oklch(0.35 0.08 40 / 0.11);
362 |   --shadow-2xl: 0px 25px 50px -12px oklch(0.35 0.08 40 / 0.25);
363 | }
364 | 
365 | /* Nature Theme */
366 | .nature {
367 |   --background: oklch(0.96 0.03 140);
368 |   /* Light Leaf Green */
369 |   --foreground: oklch(0.25 0.06 110);
370 |   /* Dark Forest Green */
371 |   --card: oklch(1.00 0.01 130);
372 |   /* Almost White Green Tint */
373 |   --card-foreground: oklch(0.25 0.06 110);
374 |   /* Dark Forest Green */
375 |   --popover: oklch(1.00 0.01 130);
376 |   /* Almost White Green Tint */
377 |   --popover-foreground: oklch(0.25 0.06 110);
378 |   /* Dark Forest Green */
379 |   --primary: oklch(0.55 0.18 150);
380 |   /* Vibrant Leaf Green */
381 |   --primary-foreground: oklch(0.98 0.01 120);
382 |   /* Very Light Green */
383 |   --secondary: oklch(0.80 0.08 90);
384 |   /* Light Wood Brown */
385 |   --secondary-foreground: oklch(0.25 0.06 110);
386 |   /* Dark Forest Green */
387 |   --muted: oklch(0.92 0.04 135);
388 |   /* Muted Light Green */
389 |   --muted-foreground: oklch(0.45 0.07 115);
390 |   /* Medium Forest Green */
391 |   --accent: oklch(0.75 0.15 220);
392 |   /* Sky Blue */
393 |   --accent-foreground: oklch(0.20 0.05 230);
394 |   /* Dark Blue */
395 |   --destructive: oklch(0.60 0.20 40);
396 |   /* Earthy Red */
397 |   --destructive-foreground: oklch(0.98 0.01 120);
398 |   /* Very Light Green */
399 |   --border: oklch(0.85 0.05 120);
400 |   /* Light Green Border */
401 |   --input: oklch(0.85 0.05 120);
402 |   /* Light Green Border */
403 |   --ring: oklch(0.55 0.18 150);
404 |   /* Vibrant Leaf Green */
405 |   --chart-1: oklch(0.55 0.18 150);
406 |   /* Vibrant Leaf Green */
407 |   --chart-2: oklch(0.75 0.15 220);
408 |   /* Sky Blue */
409 |   --chart-3: oklch(0.65 0.12 80);
410 |   /* Wood Brown */
411 |   --chart-4: oklch(0.80 0.10 60);
412 |   /* Sunlight Yellow */
413 |   --chart-5: oklch(0.70 0.16 350);
414 |   /* Flower Pink */
415 |   --sidebar: oklch(0.90 0.04 130);
416 |   /* Slightly Darker Light Green */
417 |   --sidebar-foreground: oklch(0.25 0.06 110);
418 |   /* Dark Forest Green */
419 |   --sidebar-primary: oklch(0.55 0.18 150);
420 |   /* Vibrant Leaf Green */
421 |   --sidebar-primary-foreground: oklch(0.98 0.01 120);
422 |   /* Very Light Green */
423 |   --sidebar-accent: oklch(0.75 0.15 220);
424 |   /* Sky Blue */
425 |   --sidebar-accent-foreground: oklch(0.20 0.05 230);
426 |   /* Dark Blue */
427 |   --sidebar-border: oklch(0.85 0.05 120);
428 |   /* Light Green Border */
429 |   --sidebar-ring: oklch(0.55 0.18 150);
430 |   /* Vibrant Leaf Green */
431 |   --font-sans: 'Quicksand', sans-serif;
432 |   /* Soft, rounded font */
433 |   --font-serif: 'Gentium Book Basic', serif;
434 |   /* Readable serif */
435 |   --font-mono: 'Fira Code', monospace;
436 |   /* Clear mono */
437 |   --radius: 0.75rem;
438 |   /* Slightly rounded */
439 |   --shadow-2xs: 0px 1px 2px 0px oklch(0.25 0.06 110 / 0.04);
440 |   --shadow-xs: 0px 2px 4px -1px oklch(0.25 0.06 110 / 0.05), 0px 1px 2px -1px oklch(0.25 0.06 110 / 0.03);
441 |   --shadow-sm: 0px 3px 6px -1px oklch(0.25 0.06 110 / 0.07), 0px 2px 4px -2px oklch(0.25 0.06 110 / 0.04);
442 |   --shadow: 0px 4px 8px -2px oklch(0.25 0.06 110 / 0.09), 0px 2px 4px -2px oklch(0.25 0.06 110 / 0.05);
443 |   --shadow-md: 0px 6px 12px -3px oklch(0.25 0.06 110 / 0.11), 0px 4px 6px -4px oklch(0.25 0.06 110 / 0.06);
444 |   --shadow-lg: 0px 10px 20px -5px oklch(0.25 0.06 110 / 0.13), 0px 6px 10px -6px oklch(0.25 0.06 110 / 0.08);
445 |   --shadow-xl: 0px 15px 30px -8px oklch(0.25 0.06 110 / 0.15), 0px 8px 15px -8px oklch(0.25 0.06 110 / 0.10);
446 |   --shadow-2xl: 0px 25px 50px -12px oklch(0.25 0.06 110 / 0.20);
447 | }
448 | 
449 | @theme inline {
450 |   --color-background: var(--background);
451 |   --color-foreground: var(--foreground);
452 |   --color-card: var(--card);
453 |   --color-card-foreground: var(--card-foreground);
454 |   --color-popover: var(--popover);
455 |   --color-popover-foreground: var(--popover-foreground);
456 |   --color-primary: var(--primary);
457 |   --color-primary-foreground: var(--primary-foreground);
458 |   --color-secondary: var(--secondary);
459 |   --color-secondary-foreground: var(--secondary-foreground);
460 |   --color-muted: var(--muted);
461 |   --color-muted-foreground: var(--muted-foreground);
462 |   --color-accent: var(--accent);
463 |   --color-accent-foreground: var(--accent-foreground);
464 |   --color-destructive: var(--destructive);
465 |   --color-destructive-foreground: var(--destructive-foreground);
466 |   --color-border: var(--border);
467 |   --color-input: var(--input);
468 |   --color-ring: var(--ring);
469 |   --color-chart-1: var(--chart-1);
470 |   --color-chart-2: var(--chart-2);
471 |   --color-chart-3: var(--chart-3);
472 |   --color-chart-4: var(--chart-4);
473 |   --color-chart-5: var(--chart-5);
474 |   --color-sidebar: var(--sidebar);
475 |   --color-sidebar-foreground: var(--sidebar-foreground);
476 |   --color-sidebar-primary: var(--sidebar-primary);
477 |   --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
478 |   --color-sidebar-accent: var(--sidebar-accent);
479 |   --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
480 |   --color-sidebar-border: var(--sidebar-border);
481 |   --color-sidebar-ring: var(--sidebar-ring);
482 | 
483 |   --font-sans: var(--font-sans);
484 |   --font-mono: var(--font-mono);
485 |   --font-serif: var(--font-serif);
486 | 
487 |   --radius-sm: calc(var(--radius) - 4px);
488 |   --radius-md: calc(var(--radius) - 2px);
489 |   --radius-lg: var(--radius);
490 |   --radius-xl: calc(var(--radius) + 4px);
491 | 
492 |   --shadow-2xs: var(--shadow-2xs);
493 |   --shadow-xs: var(--shadow-xs);
494 |   --shadow-sm: var(--shadow-sm);
495 |   --shadow: var(--shadow);
496 |   --shadow-md: var(--shadow-md);
497 |   --shadow-lg: var(--shadow-lg);
498 |   --shadow-xl: var(--shadow-xl);
499 |   --shadow-2xl: var(--shadow-2xl);
500 | }
501 | 
502 | @layer base {
503 |   * {
504 |     @apply border-border outline-ring/50;
505 |   }
506 | 
507 |   body {
508 |     @apply bg-background text-foreground;
509 |     letter-spacing: var(--tracking-normal);
510 |   }
511 | 
512 |   /* Cyberpunk heading styles - each heading directly targeted */
513 |   .cyberpunk h1 {
514 |     /* Even brighter Cyan for maximum contrast */
515 |     color: oklch(0.98 0.20 180) !important;
516 |     /* Bolder font for better visibility */
517 |     font-weight: 700 !important;
518 |   }
519 | 
520 |   .cyberpunk h2 {
521 |     /* Even brighter Cyan for maximum contrast */
522 |     color: oklch(0.98 0.20 180) !important;
523 |     /* Bolder font for better visibility */
524 |     font-weight: 700 !important;
525 |   }
526 | 
527 |   .cyberpunk h3 {
528 |     /* Even brighter Cyan for maximum contrast */
529 |     color: oklch(0.98 0.20 180) !important;
530 |     /* Bolder font for better visibility */
531 |     font-weight: 700 !important;
532 |   }
533 | 
534 |   .cyberpunk h4 {
535 |     /* Even brighter Cyan for maximum contrast */
536 |     color: oklch(0.98 0.20 180) !important;
537 |     /* Bolder font for better visibility */
538 |     font-weight: 700 !important;
539 |   }
540 | 
541 |   .cyberpunk h5 {
542 |     /* Even brighter Cyan for maximum contrast */
543 |     color: oklch(0.98 0.20 180) !important;
544 |     /* Bolder font for better visibility */
545 |     font-weight: 700 !important;
546 |   }
547 | 
548 |   .cyberpunk h6 {
549 |     /* Even brighter Cyan for maximum contrast */
550 |     color: oklch(0.98 0.20 180) !important;
551 |     /* Bolder font for better visibility */
552 |     font-weight: 700 !important;
553 |   }
554 | }
555 | 
556 | @layer utilities {
557 | 
558 |   /* Hide scrollbar for Chrome, Safari and Opera */
559 |   .no-scrollbar::-webkit-scrollbar {
560 |     display: none;
561 |   }
562 | 
563 |   /* Hide scrollbar for IE, Edge and Firefox */
564 |   .no-scrollbar {
565 |     -ms-overflow-style: none;
566 |     /* IE and Edge */
567 |     /* Use Firefox-specific scrollbar hiding when supported */
568 |     scrollbar-width: none;
569 |   }
570 | 
571 |   /* KaTeX box styling improvements - targeting actual generated elements */
572 |   .katex .frac-line,
573 |   .katex .overline .overline-line,
574 |   .katex .underline .underline-line,
575 |   .katex .sqrt>.root>.sqrt-line,
576 |   .katex .boxed {
577 |     border-color: currentColor;
578 |   }
579 | 
580 |   /* Specific styling for \boxed{} command output */
581 |   .katex .mord.boxed,
582 |   .katex .minner.boxed,
583 |   .katex .boxed {
584 |     border: 0.04em solid currentColor !important;
585 |     padding: 0.2em 0.4em !important;
586 |     border-radius: 0.2em !important;
587 |     box-sizing: border-box !important;
588 |   }
589 | 
590 |   /* KaTeX font weight inheritance */
591 |   .katex {
592 |     font-weight: inherit;
593 |   }
594 | 
595 |   /* Ensure proper contrast for KaTeX in all themes */
596 |   .katex * {
597 |     color: inherit;
598 |   }
599 | 
600 |   /* Theme-specific KaTeX styling */
601 |   .dark .katex,
602 |   .black .katex,
603 |   .cyberpunk .katex,
604 |   .sunset .katex,
605 |   .nature .katex {
606 |     color: inherit;
607 |   }
608 | 
609 |   /* Handle KaTeX overflow to prevent layout breaking */
610 |   .katex-display {
611 |     overflow-x: auto;
612 |     overflow-y: hidden;
613 |     max-width: 100%;
614 |     padding: 0.5em 0;
615 |     /* Add subtle scrollbar styling */
616 |     scrollbar-width: thin;
617 |     scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
618 |   }
619 | 
620 |   .katex-display::-webkit-scrollbar {
621 |     height: 6px;
622 |   }
623 | 
624 |   .katex-display::-webkit-scrollbar-track {
625 |     background: transparent;
626 |   }
627 | 
628 |   .katex-display::-webkit-scrollbar-thumb {
629 |     background-color: rgba(0, 0, 0, 0.2);
630 |     border-radius: 3px;
631 |   }
632 | 
633 |   .dark .katex-display::-webkit-scrollbar-thumb,
634 |   .black .katex-display::-webkit-scrollbar-thumb {
635 |     background-color: rgba(255, 255, 255, 0.3);
636 |   }
637 | 
638 |   /* Handle inline math overflow */
639 |   .katex {
640 |     max-width: 100%;
641 |     overflow-x: auto;
642 |     overflow-y: hidden;
643 |     display: inline-block;
644 |     white-space: nowrap;
645 |   }
646 | 
647 |   /* Ensure the parent container respects the overflow */
648 |   .katex-html {
649 |     overflow: visible;
650 |   }
651 | 
652 |   /* Prevent math expressions from breaking container bounds */
653 |   p:has(.katex-display),
654 |   div:has(.katex-display) {
655 |     overflow-x: auto;
656 |     max-width: 100%;
657 |   }
658 | 
659 |   /* Ensure message containers handle math overflow properly */
660 |   .group\/message .katex-display {
661 |     margin: 0.5em 0;
662 |   }
663 | 
[TRUNCATED]
```

app/layout.tsx
```
1 | import type { Metadata } from "next";
2 | import { Inter } from "next/font/google";
3 | import { ChatSidebar } from "@/components/chat-sidebar";
4 | import { TopNav } from "@/components/top-nav";
5 | import { Providers } from "./providers";
6 | import "./globals.css";
7 | import Script from "next/script";
8 | import { WebSearchProvider } from "@/lib/context/web-search-context";
9 | import { cn } from "@/lib/utils";
10 | import BuildInfo from "@/components/ui/BuildInfo";
11 | import { IOSInstallPrompt } from "@/components/ios-install-prompt";
12 | 
13 | const inter = Inter({ subsets: ["latin"] });
14 | 
15 | export const metadata: Metadata = {
16 |   metadataBase: new URL("https://www.chatlima.com/"),
17 |   title: "ChatLima",
18 |   description: "ChatLima is a minimalistic MCP client with a good feature set.",
19 |   icons: {
20 |     icon: "/logo.png",
21 |     apple: [
22 |       { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
23 |       { url: "/apple-touch-icon-120x120.png", sizes: "120x120", type: "image/png" },
24 |       { url: "/apple-touch-icon-152x152.png", sizes: "152x152", type: "image/png" },
25 |       { url: "/apple-touch-icon-167x167.png", sizes: "167x167", type: "image/png" },
26 |       { url: "/apple-touch-icon-180x180.png", sizes: "180x180", type: "image/png" },
27 |     ],
28 |   },
29 |   manifest: "/manifest.json",
30 |   appleWebApp: {
31 |     capable: true,
32 |     statusBarStyle: "default",
33 |     title: "ChatLima",
34 |   },
35 |   formatDetection: {
36 |     telephone: false,
37 |   },
38 |   openGraph: {
39 |     siteName: "ChatLima",
40 |     url: "https://www.chatlima.com/",
41 |     images: [
42 |       {
43 |         url: "https://www.chatlima.com/opengraph-image.png",
44 |         width: 1200,
45 |         height: 630,
46 |       },
47 |     ],
48 |   },
49 |   twitter: {
50 |     card: "summary_large_image",
51 |     title: "ChatLima",
52 |     description: "ChatLima is a minimalistic MCP client with a good feature set.",
53 |     images: ["https://www.chatlima.com/twitter-image.png"],
54 |   },
55 |   other: {
56 |     "mobile-web-app-capable": "yes",
57 |     "apple-mobile-web-app-capable": "yes",
58 |     "apple-mobile-web-app-status-bar-style": "default",
59 |     "apple-mobile-web-app-title": "ChatLima",
60 |   },
61 | };
62 | 
63 | export default function RootLayout({
64 |   children,
65 | }: Readonly<{
66 |   children: React.ReactNode;
67 | }>) {
68 |   return (
69 |     <html lang="en" suppressHydrationWarning>
70 |       <head>
71 |         <meta 
72 |           name="viewport" 
73 |           content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" 
74 |         />
75 |       </head>
76 |       <body className={`${inter.className}`}>
77 |         <Providers>
78 |           <WebSearchProvider>
79 |             <div className="flex h-dvh w-full">
80 |               <ChatSidebar />
81 |               <main className="flex-1 flex flex-col">
82 |                 <TopNav />
83 |                 <div className="flex-1 flex justify-center overflow-hidden">
84 |                   {children}
85 |                 </div>
86 |               </main>
87 |             </div>
88 |             <IOSInstallPrompt />
89 |           </WebSearchProvider>
90 |         </Providers>
91 |         <Script defer src="https://cloud.umami.is/script.js" data-website-id="bd3f8736-1562-47e0-917c-c10fde7ef0d2" />
92 |       </body>
93 |     </html>
94 |   );
95 | }
```

app/page.tsx
```
1 | import Chat from "@/components/chat";
2 | 
3 | export default function Page() {
4 |   return <Chat />;
5 | }
```

app/providers.tsx
```
1 | "use client";
2 | 
3 | import { ReactNode, useEffect, useState } from "react";
4 | import { ThemeProvider } from "@/components/theme-provider";
5 | import { SidebarProvider } from "@/components/ui/sidebar";
6 | import { Toaster } from "sonner";
7 | import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
8 | import { useLocalStorage } from "@/lib/hooks/use-local-storage";
9 | import { STORAGE_KEYS } from "@/lib/constants";
10 | import { MCPProvider } from "@/lib/context/mcp-context";
11 | import { ModelProvider } from "@/lib/context/model-context";
12 | import { AnonymousAuth } from "@/components/auth/AnonymousAuth";
13 | 
14 | // Create a client
15 | const queryClient = new QueryClient({
16 |   defaultOptions: {
17 |     queries: {
18 |       staleTime: 1000 * 60 * 5, // 5 minutes
19 |       refetchOnWindowFocus: true,
20 |     },
21 |   },
22 | });
23 | 
24 | export function Providers({ children }: { children: ReactNode }) {
25 |   const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>(
26 |     STORAGE_KEYS.SIDEBAR_STATE,
27 |     true
28 |   );
29 | 
30 |   return (
31 |     <QueryClientProvider client={queryClient}>
32 |       <ThemeProvider
33 |         attribute="class"
34 |         defaultTheme="system"
35 |         enableSystem={true}
36 |         disableTransitionOnChange
37 |         themes={["light", "dark", "black", "sunset", "cyberpunk", "retro", "nature"]}
38 |         storageKey="mcp-theme"
39 |       >
40 |         <MCPProvider>
41 |           <ModelProvider>
42 |             <SidebarProvider defaultOpen={sidebarOpen} open={sidebarOpen} onOpenChange={setSidebarOpen}>
43 |               <AnonymousAuth />
44 |               {children}
45 |               <Toaster position="top-center" richColors />
46 |             </SidebarProvider>
47 |           </ModelProvider>
48 |         </MCPProvider>
49 |       </ThemeProvider>
50 |     </QueryClientProvider>
51 |   );
52 | } 
```

components/api-key-manager.tsx
```
1 | import { useState, useEffect } from "react";
2 | import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
3 | import { Button } from "@/components/ui/button";
4 | import { Input } from "@/components/ui/input";
5 | import { Label } from "@/components/ui/label";
6 | import { toast } from "sonner";
7 | 
8 | // API key configuration
9 | interface ApiKeyConfig {
10 |   name: string;
11 |   key: string;
12 |   storageKey: string;
13 |   label: string;
14 |   placeholder: string;
15 | }
16 | 
17 | // Available API keys configuration
18 | const API_KEYS_CONFIG: ApiKeyConfig[] = [
19 |   {
20 |     name: "OpenAI",
21 |     key: "openai",
22 |     storageKey: "OPENAI_API_KEY",
23 |     label: "OpenAI API Key",
24 |     placeholder: "sk-..."
25 |   },
26 |   {
27 |     name: "Anthropic",
28 |     key: "anthropic",
29 |     storageKey: "ANTHROPIC_API_KEY",
30 |     label: "Anthropic API Key",
31 |     placeholder: "sk-ant-..."
32 |   },
33 |   {
34 |     name: "Groq",
35 |     key: "groq",
36 |     storageKey: "GROQ_API_KEY",
37 |     label: "Groq API Key",
38 |     placeholder: "gsk_..."
39 |   },
40 |   {
41 |     name: "XAI",
42 |     key: "xai",
43 |     storageKey: "XAI_API_KEY",
44 |     label: "XAI API Key",
45 |     placeholder: "xai-..."
46 |   },
47 |   {
48 |     name: "Openrouter",
49 |     key: "openrouter",
50 |     storageKey: "OPENROUTER_API_KEY",
51 |     label: "Openrouter API Key",
52 |     placeholder: "sk-or-..."
53 |   },
54 |   {
55 |     name: "Requesty",
56 |     key: "requesty", 
57 |     storageKey: "REQUESTY_API_KEY",
58 |     label: "Requesty API Key",
59 |     placeholder: "req-..."
60 |   }
61 | ];
62 | 
63 | interface ApiKeyManagerProps {
64 |   open: boolean;
65 |   onOpenChange: (open: boolean) => void;
66 | }
67 | 
68 | export function ApiKeyManager({ open, onOpenChange }: ApiKeyManagerProps) {
69 |   // State to store API keys
70 |   const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
71 | 
72 |   // Load API keys from localStorage on initial mount
73 |   useEffect(() => {
74 |     const storedKeys: Record<string, string> = {};
75 |     
76 |     API_KEYS_CONFIG.forEach(config => {
77 |       const value = localStorage.getItem(config.storageKey);
78 |       if (value) {
79 |         storedKeys[config.key] = value;
80 |       }
81 |     });
82 |     
83 |     setApiKeys(storedKeys);
84 |   }, []);
85 | 
86 |   // Update API key in state
87 |   const handleApiKeyChange = (key: string, value: string) => {
88 |     setApiKeys(prev => ({
89 |       ...prev,
90 |       [key]: value
91 |     }));
92 |   };
93 | 
94 |   // Save API keys to localStorage
95 |   const handleSaveApiKeys = () => {
96 |     try {
97 |       API_KEYS_CONFIG.forEach(config => {
98 |         const value = apiKeys[config.key];
99 |         
100 |         if (value && value.trim()) {
101 |           localStorage.setItem(config.storageKey, value.trim());
102 |         } else {
103 |           localStorage.removeItem(config.storageKey);
104 |         }
105 |       });
106 |       
107 |       toast.success("API keys saved successfully");
108 |       onOpenChange(false);
109 |     } catch (error) {
110 |       console.error("Error saving API keys:", error);
111 |       toast.error("Failed to save API keys");
112 |     }
113 |   };
114 | 
115 |   // Clear all API keys
116 |   const handleClearApiKeys = () => {
117 |     try {
118 |       API_KEYS_CONFIG.forEach(config => {
119 |         localStorage.removeItem(config.storageKey);
120 |       });
121 |       
122 |       setApiKeys({});
123 |       toast.success("All API keys cleared");
124 |     } catch (error) {
125 |       console.error("Error clearing API keys:", error);
126 |       toast.error("Failed to clear API keys");
127 |     }
128 |   };
129 | 
130 |   return (
131 |     <Dialog open={open} onOpenChange={onOpenChange}>
132 |       <DialogContent className="sm:max-w-[500px]">
133 |         <DialogHeader>
134 |           <DialogTitle>API Key Settings</DialogTitle>
135 |           <DialogDescription>
136 |             Enter your own API keys for different AI providers. Keys are stored securely in your browser&apos;s local storage.
137 |           </DialogDescription>
138 |         </DialogHeader>
139 |         
140 |         <div className="grid gap-4 py-4">
141 |           {API_KEYS_CONFIG.map(config => (
142 |             <div key={config.key} className="grid gap-2">
143 |               <Label htmlFor={config.key}>{config.label}</Label>
144 |               <Input
145 |                 id={config.key}
146 |                 type="password"
147 |                 value={apiKeys[config.key] || ""}
148 |                 onChange={(e) => handleApiKeyChange(config.key, e.target.value)}
149 |                 placeholder={config.placeholder}
150 |               />
151 |             </div>
152 |           ))}
153 |         </div>
154 |         
155 |         <DialogFooter className="flex justify-between sm:justify-between">
156 |           <Button
157 |             variant="destructive"
158 |             onClick={handleClearApiKeys}
159 |           >
160 |             Clear All Keys
161 |           </Button>
162 |           <div className="flex gap-2">
163 |             <Button
164 |               variant="outline"
165 |               onClick={() => onOpenChange(false)}
166 |             >
167 |               Cancel
168 |             </Button>
169 |             <Button onClick={handleSaveApiKeys}>
170 |               Save Keys
171 |             </Button>
172 |           </div>
173 |         </DialogFooter>
174 |       </DialogContent>
175 |     </Dialog>
176 |   );
177 | } 
```

components/chat-list.tsx
```
1 | "use client";
2 | 
3 | import { useState, useRef, ChangeEvent, KeyboardEvent, FocusEvent } from "react";
4 | import { useRouter, usePathname } from "next/navigation";
5 | import { MessageSquare, PlusCircle, Trash2, CheckIcon, XIcon, Loader2, Pencil } from "lucide-react";
6 | import {
7 |     SidebarGroupContent,
8 |     SidebarMenuItem,
9 |     SidebarMenuButton,
10 | } from "@/components/ui/sidebar";
11 | import { Button } from "@/components/ui/button";
12 | import { Input } from "@/components/ui/input";
13 | import { cn } from "@/lib/utils";
14 | import Link from "next/link";
15 | import { AnimatePresence, motion } from "motion/react";
16 | import { toast } from "sonner";
17 | import { Skeleton } from "@/components/ui/skeleton";
18 | import {
19 |     Tooltip,
20 |     TooltipContent,
21 |     TooltipProvider,
22 |     TooltipTrigger,
23 | } from "@/components/ui/tooltip";
24 | import { SidebarMenu } from "@/components/ui/sidebar";
25 | 
26 | interface Chat {
27 |     id: string;
28 |     title: string;
29 |     userId: string;
30 |     createdAt: Date;
31 |     updatedAt: Date;
32 |     sharePath?: string | null;
33 | }
34 | 
35 | interface ChatListProps {
36 |     chats: Chat[];
37 |     isLoading: boolean;
38 |     isCollapsed: boolean;
39 |     isUpdatingChatTitle: boolean;
40 |     onNewChat: () => void;
41 |     onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
42 |     onUpdateChatTitle: (params: { chatId: string, title: string }, options: { onSuccess: () => void, onError: () => void }) => void;
43 | }
44 | 
45 | export function ChatList({
46 |     chats,
47 |     isLoading,
48 |     isCollapsed,
49 |     isUpdatingChatTitle,
50 |     onNewChat,
51 |     onDeleteChat,
52 |     onUpdateChatTitle,
53 | }: ChatListProps) {
54 |     const router = useRouter();
55 |     const pathname = usePathname();
56 |     const [searchTerm, setSearchTerm] = useState("");
57 |     const [editingChatId, setEditingChatId] = useState<string | null>(null);
58 |     const [editingChatTitle, setEditingChatTitle] = useState<string>("");
59 |     const inputRef = useRef<HTMLInputElement>(null);
60 | 
61 |     const filteredChats = chats?.filter(chat =>
62 |         chat.title.toLowerCase().includes(searchTerm.toLowerCase())
63 |     ) || [];
64 | 
65 |     const handleStartEdit = (chatId: string, currentTitle: string, e: React.MouseEvent) => {
66 |         e.stopPropagation();
67 |         e.preventDefault();
68 |         setEditingChatId(chatId);
69 |         setEditingChatTitle(currentTitle);
70 |         setTimeout(() => {
71 |             inputRef.current?.focus();
72 |             inputRef.current?.select();
73 |         }, 0);
74 |     };
75 | 
76 |     const handleCancelEdit = () => {
77 |         setEditingChatId(null);
78 |         setEditingChatTitle("");
79 |     };
80 | 
81 |     const handleSaveEdit = () => {
82 |         if (!editingChatId || editingChatTitle.trim() === "") {
83 |             toast.error("Chat title cannot be empty.");
84 |             inputRef.current?.focus();
85 |             return;
86 |         }
87 | 
88 |         onUpdateChatTitle(
89 |             { chatId: editingChatId, title: editingChatTitle.trim() },
90 |             {
91 |                 onSuccess: () => {
92 |                     setEditingChatId(null);
93 |                     setEditingChatTitle("");
94 |                 },
95 |                 onError: () => {
96 |                     inputRef.current?.focus();
97 |                     inputRef.current?.select();
98 |                 }
99 |             }
100 |         );
101 |     };
102 | 
103 |     const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
104 |         setEditingChatTitle(e.target.value);
105 |     };
106 | 
107 |     const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
108 |         if (e.key === 'Enter') {
109 |             e.preventDefault();
110 |             handleSaveEdit();
111 |         } else if (e.key === 'Escape') {
112 |             e.preventDefault();
113 |             handleCancelEdit();
114 |         }
115 |     };
116 | 
117 |     const handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
118 |         if (e.relatedTarget && (e.relatedTarget.id === `save-chat-${editingChatId}` || e.relatedTarget.id === `cancel-chat-${editingChatId}`)) {
119 |             return;
120 |         }
121 |         setTimeout(() => {
122 |             if (editingChatId && document.activeElement !== inputRef.current) {
123 |                 const activeElementId = document.activeElement?.id;
124 |                 if (activeElementId !== `save-chat-${editingChatId}` && activeElementId !== `cancel-chat-${editingChatId}`) {
125 |                     handleCancelEdit();
126 |                 }
127 |             }
128 |         }, 100);
129 |     };
130 | 
131 |     const renderChatSkeletons = () => {
132 |         return Array(3).fill(0).map((_, index) => (
133 |             <SidebarMenuItem key={`skeleton-${index}`}>
134 |                 <div className={`flex items-center gap-2 px-3 py-2 ${isCollapsed ? "justify-center" : ""}`}>
135 |                     <Skeleton className="h-4 w-4 rounded-full" />
136 |                     {!isCollapsed && (
137 |                         <>
138 |                             <Skeleton className="h-4 w-full max-w-[180px]" />
139 |                             <Skeleton className="h-5 w-5 ml-auto rounded-md flex-shrink-0" />
140 |                         </>
141 |                     )}
142 |                 </div>
143 |             </SidebarMenuItem>
144 |         ));
145 |     };
146 | 
147 |     return (
148 |         <>
149 |             {!isCollapsed && (
150 |                 <div className="px-3 pt-1 pb-2 border-b border-border/40">
151 |                     <Button
152 |                         variant="outline"
153 |                         className="w-full mb-2"
154 |                         onClick={onNewChat}
155 |                     >
156 |                         <PlusCircle className="mr-2 h-4 w-4" />
157 |                         New Chat
158 |                     </Button>
159 |                     <Input
160 |                         type="search"
161 |                         placeholder="Search chats..."
162 |                         aria-label="Search chats by title"
163 |                         value={searchTerm}
164 |                         onChange={e => setSearchTerm(e.target.value)}
165 |                         className="w-full"
166 |                     />
167 |                 </div>
168 |             )}
169 |             <SidebarGroupContent className={cn(
170 |                 "overflow-y-auto",
171 |                 isCollapsed ? "overflow-x-hidden overflow-y-hidden" : ""
172 |             )}>
173 |                 {isLoading ? (
174 |                     renderChatSkeletons()
175 |                 ) : filteredChats && filteredChats.length > 0 ? (
176 |                     <AnimatePresence initial={false}>
177 |                         {filteredChats.map((chat) => {
178 |                             const isActive = pathname === `/chat/${chat.id}`;
179 |                             const isEditingThisChat = editingChatId === chat.id;
180 |                             return (
181 |                                 <motion.div
182 |                                     key={chat.id}
183 |                                     initial={{ opacity: 0, height: 0 }}
184 |                                     animate={{ opacity: 1, height: "auto" }}
185 |                                     exit={{ opacity: 0, height: 0 }}
186 |                                     transition={{ duration: 0.2 }}
187 |                                     className="overflow-hidden list-none"
188 |                                 >
189 |                                     <SidebarMenuItem>
190 |                                         {isEditingThisChat ? (
191 |                                             <div className="flex items-center gap-2 px-3 py-2 w-full">
192 |                                                 <Input
193 |                                                     ref={inputRef}
194 |                                                     value={editingChatTitle}
195 |                                                     onChange={handleInputChange}
196 |                                                     onKeyDown={handleInputKeyDown}
197 |                                                     onBlur={handleInputBlur}
198 |                                                     className="h-7 flex-grow px-1 text-sm"
199 |                                                     maxLength={100}
200 |                                                 />
201 |                                                 <Button
202 |                                                     id={`save-chat-${chat.id}`}
203 |                                                     variant="ghost"
204 |                                                     size="icon"
205 |                                                     className="h-6 w-6 text-green-500 hover:text-green-600"
206 |                                                     onClick={handleSaveEdit}
207 |                                                     disabled={isUpdatingChatTitle}
208 |                                                 >
209 |                                                     {isUpdatingChatTitle && editingChatId === chat.id ? (
210 |                                                         <Loader2 className="h-4 w-4 animate-spin" />
211 |                                                     ) : (
212 |                                                         <CheckIcon className="h-4 w-4" />
213 |                                                     )}
214 |                                                 </Button>
215 |                                                 <Button
216 |                                                     id={`cancel-chat-${chat.id}`}
217 |                                                     variant="ghost"
218 |                                                     size="icon"
219 |                                                     className="h-6 w-6 text-red-500 hover:text-red-600"
220 |                                                     onClick={handleCancelEdit}
221 |                                                     disabled={isUpdatingChatTitle}
222 |                                                 >
223 |                                                     <XIcon className="h-4 w-4" />
224 |                                                 </Button>
225 |                                             </div>
226 |                                         ) : (
227 |                                             <>
228 |                                                 {isCollapsed ? (
229 |                                                     <TooltipProvider delayDuration={0}>
230 |                                                         <Tooltip>
231 |                                                             <TooltipTrigger asChild>
232 |                                                                 <SidebarMenuButton
233 |                                                                     onClick={() => router.push(`/chat/${chat.id}`)}
234 |                                                                     isActive={isActive}
235 |                                                                     className={cn(
236 |                                                                         "w-full flex justify-center",
237 |                                                                         isActive && "bg-primary/10 dark:bg-primary/20 text-primary hover:text-primary"
238 |                                                                     )}
239 |                                                                 >
240 |                                                                     <MessageSquare className="h-4 w-4" />
241 |                                                                 </SidebarMenuButton>
242 |                                                             </TooltipTrigger>
243 |                                                             <TooltipContent side="right" sideOffset={5}>
244 |                                                                 <p>{chat.title}</p>
245 |                                                             </TooltipContent>
246 |                                                         </Tooltip>
247 |                                                     </TooltipProvider>
248 |                                                 ) : (
249 |                                                     <TooltipProvider delayDuration={0}>
250 |                                                         <Tooltip>
251 |                                                             <TooltipTrigger asChild>
252 |                                                                 <SidebarMenuButton
253 |                                                                     asChild
254 |                                                                     isActive={isActive}
255 |                                                                     className={cn(
256 |                                                                         "w-full flex justify-start pr-10",
257 |                                                                         isActive && "bg-primary/10 dark:bg-primary/20 text-primary hover:text-primary"
258 |                                                                     )}
259 |                                                                 >
260 |                                                                     <Link href={`/chat/${chat.id}`} className="flex items-center flex-grow overflow-hidden">
261 |                                                                         <span className="truncate max-w-[160px]">
262 |                                                                             {chat.title || `Chat ${chat.id.substring(0, 8)}...`}
263 |                                                                         </span>
264 |                                                                     </Link>
265 |                                                                 </SidebarMenuButton>
266 |                                                             </TooltipTrigger>
267 |                                                             <TooltipContent side="right" sideOffset={5}>
268 |                                                                 <p>{chat.title}</p>
269 |                                                             </TooltipContent>
270 |                                                         </Tooltip>
271 |                                                     </TooltipProvider>
272 |                                                 )}
273 |                                                 {!isCollapsed && (
274 |                                                     <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover/menu-item:opacity-100 group-focus-within/menu-item:opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover/menu-item:opacity-100 sm:group-focus-within/menu-item:opacity-100 opacity-100">
275 |                                                         <Button
276 |                                                             variant="ghost"
277 |                                                             size="icon"
278 |                                                             className="h-6 w-6 hover:text-blue-500"
279 |                                                             onClick={(e) => handleStartEdit(chat.id, chat.title, e)}
280 |                                                             title="Edit title"
281 |                                                         >
282 |                                                             <Pencil className="h-3 w-3" />
283 |                                                         </Button>
284 |                                                         <Button
285 |                                                             variant="ghost"
286 |                                                             size="icon"
287 |                                                             className="h-6 w-6 hover:text-red-500"
288 |                                                             onClick={(e) => onDeleteChat(chat.id, e)}
289 |                                                             title="Delete chat"
290 |                                                         >
291 |                                                             <Trash2 className="h-3 w-3" />
292 |                                                         </Button>
293 |                                                     </div>
294 |                                                 )}
295 |                                             </>
296 |                                         )}
297 |                                     </SidebarMenuItem>
298 |                                 </motion.div>
299 |                             );
300 |                         })}
301 |                     </AnimatePresence>
302 |                 ) : (
303 |                     <SidebarMenu>
304 |                         {searchTerm ? (
305 |                             <SidebarMenuItem className="text-sm text-muted-foreground px-3 py-2 list-none">
306 |                                 {!isCollapsed && "No results found."}
307 |                             </SidebarMenuItem>
308 |                         ) : (
309 |                             <SidebarMenuItem className="text-sm text-muted-foreground px-3 py-2 list-none">
310 |                                 {!isCollapsed && "No chats yet. Start a new one!"}
311 |                             </SidebarMenuItem>
312 |                         )}
313 |                     </SidebarMenu>
314 |                 )}
315 |             </SidebarGroupContent>
316 |         </>
317 |     );
318 | } 
```

components/chat-sidebar.tsx
```
1 | "use client";
2 | 
3 | import { useState, useEffect, useRef } from "react";
4 | import { useRouter, usePathname } from "next/navigation";
5 | import { MessageSquare, PlusCircle, Trash2, ServerIcon, Settings, Sparkles, ChevronsUpDown, Copy, Github, Key, LogOut, Globe, BookOpen } from "lucide-react";
6 | import {
7 |     Sidebar,
8 |     SidebarContent,
9 |     SidebarFooter,
10 |     SidebarGroup,
11 |     SidebarGroupContent,
12 |     SidebarGroupLabel,
13 |     SidebarHeader,
14 |     SidebarMenu,
15 |     SidebarMenuButton,
16 |     SidebarMenuItem,
17 |     SidebarMenuBadge,
18 |     useSidebar
19 | } from "@/components/ui/sidebar";
20 | import { Separator } from "@/components/ui/separator";
21 | import { Button } from "@/components/ui/button";
22 | import { Badge } from "@/components/ui/badge";
23 | import { toast } from "sonner";
24 | import Image from "next/image";
25 | import { MCPServerManager } from "./mcp-server-manager";
26 | import { ApiKeyManager } from "./api-key-manager";
27 | import { ThemeToggle } from "./theme-toggle";
28 | import { useChats } from "@/lib/hooks/use-chats";
29 | import { cn } from "@/lib/utils";
30 | import Link from "next/link";
31 | import {
32 |     DropdownMenu,
33 |     DropdownMenuContent,
34 |     DropdownMenuGroup,
35 |     DropdownMenuItem,
36 |     DropdownMenuLabel,
37 |     DropdownMenuSeparator,
38 |     DropdownMenuTrigger,
39 | } from "@/components/ui/dropdown-menu";
40 | import { Avatar, AvatarFallback } from "@/components/ui/avatar";
41 | import {
42 |     Dialog,
43 |     DialogContent,
44 |     DialogDescription,
45 |     DialogFooter,
46 |     DialogHeader,
47 |     DialogTitle,
48 | } from "@/components/ui/dialog";
49 | import { Input } from "@/components/ui/input";
50 | import { Label } from "@/components/ui/label";
51 | import { useMCP } from "@/lib/context/mcp-context";
52 | import { Skeleton } from "@/components/ui/skeleton";
53 | import { SignInButton } from "@/components/auth/SignInButton";
54 | import { UserAccountMenu } from "@/components/auth/UserAccountMenu";
55 | import { useSession, signOut } from "@/lib/auth-client";
56 | import { useQueryClient } from "@tanstack/react-query";
57 | import { Flame, Sun } from "lucide-react";
58 | import { useWebSearch } from "@/lib/context/web-search-context";
59 | import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
60 | import {
61 |     Tooltip,
62 |     TooltipContent,
63 |     TooltipProvider,
64 |     TooltipTrigger,
65 | } from "@/components/ui/tooltip";
66 | import { ChatList } from "./chat-list";
67 | 
68 | export function ChatSidebar() {
69 |     const router = useRouter();
70 |     const pathname = usePathname();
71 |     const [userId, setUserId] = useState<string | null>(null);
72 |     const [mcpSettingsOpen, setMcpSettingsOpen] = useState(false);
73 |     const [apiKeySettingsOpen, setApiKeySettingsOpen] = useState(false);
74 |     const { state, setOpen, openMobile, setOpenMobile } = useSidebar();
75 |     const isCollapsed = state === "collapsed";
76 | 
77 |     const { data: session, isPending: isSessionLoading } = useSession();
78 |     const authenticatedUserId = session?.user?.id;
79 |     const previousSessionRef = useRef(session);
80 | 
81 |     const queryClient = useQueryClient();
82 | 
83 |     const { mcpServers, setMcpServers, selectedMcpServers, setSelectedMcpServers } = useMCP();
84 |     const { webSearchContextSize, setWebSearchContextSize, webSearchEnabled } = useWebSearch();
85 |     const isAnyOpenRouterModelSelected = true;
86 | 
87 |     const renderChatSkeletons = () => {
88 |         return Array(3).fill(0).map((_, index) => (
89 |             <SidebarMenuItem key={`skeleton-${index}`} className="px-0">
90 |                 <div className={cn(
91 |                     "flex items-center gap-2 px-3 py-2 w-full",
92 |                     isCollapsed ? "justify-center" : "pr-10"
93 |                 )}>
94 |                     <Skeleton className="h-4 w-4 rounded-md flex-shrink-0" />
95 |                     {!isCollapsed && (
96 |                         <>
97 |                             <Skeleton className="h-4 flex-grow max-w-[160px]" />
98 |                             <div className="ml-auto flex items-center gap-1">
99 |                                 <Skeleton className="h-4 w-4 rounded-md" />
100 |                                 <Skeleton className="h-4 w-4 rounded-md" />
101 |                             </div>
102 |                         </>
103 |                     )}
104 |                 </div>
105 |             </SidebarMenuItem>
106 |         ));
107 |     };
108 | 
109 |     useEffect(() => {
110 |         if (!isSessionLoading) {
111 |             if (authenticatedUserId) {
112 |                 setUserId(authenticatedUserId);
113 |             } else {
114 |                 setUserId(null);
115 |             }
116 |         }
117 |     }, [authenticatedUserId, isSessionLoading]);
118 | 
119 |     useEffect(() => {
120 |         const currentSession = session;
121 |         const previousSession = previousSessionRef.current;
122 | 
123 |         if (!previousSession?.user && currentSession?.user?.id) {
124 |             const authenticatedUserId = currentSession.user.id;
125 |             console.log('User logged in (ID):', authenticatedUserId);
126 |             // Log the entire user object for inspection
127 |             console.log('Session User Object:', currentSession.user);
128 |             
129 |             setUserId(authenticatedUserId);
130 |             queryClient.invalidateQueries({ queryKey: ['chats'] });
131 |             queryClient.invalidateQueries({ queryKey: ['chat'] });
132 |         } else if (previousSession?.user && !currentSession?.user) {
133 |             console.log('User logged out.');
134 |             setUserId(null);
135 |             router.push('/');
136 |             queryClient.invalidateQueries({ queryKey: ['chats'] });
137 |             queryClient.invalidateQueries({ queryKey: ['chat'] });
138 |         }
139 | 
140 |         previousSessionRef.current = currentSession;
141 |     }, [session, queryClient, router]);
142 |     
143 |     useEffect(() => {
144 |         // Log anonymous user ID and email for debugging purposes if the user is flagged as anonymous.
145 |         if (!isSessionLoading && session?.user?.isAnonymous === true) {
146 |             // This log will only appear in the developer console.
147 |             console.log('Anonymous User (for debugging): ID=', session.user.id, ', Email=', session.user.email);
148 |         }
149 |     }, [session, isSessionLoading]);
150 | 
151 |     const { chats, isLoading: isChatsLoading, deleteChat, refreshChats, updateChatTitle, isUpdatingChatTitle } = useChats();
152 |     const isLoading = isSessionLoading || (userId === null) || isChatsLoading;
153 | 
154 |     const handleNewChat = () => {
155 |         router.push('/');
156 |         setOpenMobile(false);
157 |     };
158 | 
159 |     const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
160 |         e.stopPropagation();
161 |         e.preventDefault();
162 | 
163 |         deleteChat(chatId);
164 |         
165 |         if (pathname === `/chat/${chatId}`) {
166 |             router.push('/');
167 |         }
168 |     };
169 | 
170 |     const activeServersCount = selectedMcpServers.length;
171 | 
172 |     if (isLoading) {
173 |         return (
174 |             <Sidebar className="shadow-sm bg-background/80 dark:bg-background/40 backdrop-blur-md" collapsible="icon">
175 |                 <SidebarHeader className="p-4 border-b border-border/40">
176 |                     <div className="flex items-center justify-start">
177 |                         <Link href="/" className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${isCollapsed ? "justify-center w-full" : ""}`}>
178 |                             <div className={`flex items-center justify-center rounded-full bg-primary ${isCollapsed ? 'h-6 w-6 flex-shrink-0' : 'h-8 w-8'}`}>
179 |                                 <Image src="/logo.png" alt="ChatLima logo" width={32} height={32} className={`${isCollapsed ? 'h-4 w-4' : 'h-6 w-6'}`} />
180 |                             </div>
181 |                             {!isCollapsed && (
182 |                                 <div className="font-semibold text-lg text-foreground/90">ChatLima</div>
183 |                             )}
184 |                         </Link>
185 |                     </div>
186 |                 </SidebarHeader>
187 |                 
188 |                 <SidebarContent className="flex flex-col h-[calc(100vh-8rem)]">
189 |                     <SidebarGroup className="flex-1 min-h-0">
190 |                         <SidebarGroupLabel className={cn(
191 |                             "px-4 text-xs font-medium text-muted-foreground/80 uppercase tracking-wider",
192 |                             isCollapsed ? "sr-only" : ""
193 |                         )}>
194 |                             Chats
195 |                         </SidebarGroupLabel>
196 |                         {!isCollapsed && (
197 |                             <div className="px-3 pt-1 pb-2 border-b border-border/40">
198 |                                 <Skeleton className="h-9 w-full mb-2" />
199 |                                 <Skeleton className="h-9 w-full" />
200 |                             </div>
201 |                         )}
202 |                         <SidebarGroupContent className={cn(
203 |                             "overflow-y-auto pt-1",
204 |                             isCollapsed ? "overflow-x-hidden overflow-y-hidden" : ""
205 |                         )}>
206 |                             <SidebarMenu>{renderChatSkeletons()}</SidebarMenu>
207 |                         </SidebarGroupContent>
208 |                     </SidebarGroup>
209 |                     
210 |                     <div className="relative my-0">
211 |                         <div className="absolute inset-x-0">
212 |                             <Separator className="w-full h-px bg-border/40" />
213 |                         </div>
214 |                     </div>
215 |                     
216 |                     <SidebarGroup className="flex-shrink-0">
217 |                         <SidebarGroupLabel className={cn(
218 |                             "px-4 pt-0 text-xs font-medium text-muted-foreground/80 uppercase tracking-wider",
219 |                             isCollapsed ? "sr-only" : ""
220 |                         )}>
221 |                             MCP Servers
222 |                         </SidebarGroupLabel>
223 |                         <SidebarGroupContent>
224 |                             <SidebarMenu>
225 |                                 <SidebarMenuItem>
226 |                                     <SidebarMenuButton 
227 |                                         onClick={() => setMcpSettingsOpen(true)}
228 |                                         className={cn(
229 |                                             "w-full flex items-center gap-2 transition-all"
230 |                                         )}
231 |                                         tooltip={isCollapsed ? "MCP Servers" : undefined}
232 |                                     >
233 |                                         <ServerIcon className={cn(
234 |                                             "h-4 w-4 flex-shrink-0",
235 |                                             activeServersCount > 0 ? "text-primary" : "text-muted-foreground"
236 |                                         )} />
237 |                                         {!isCollapsed && (
238 |                                             <span className="flex-grow text-sm text-foreground/80">MCP Servers</span>
239 |                                         )}
240 |                                         {activeServersCount > 0 && !isCollapsed ? (
241 |                                             <Badge 
242 |                                                 variant="secondary" 
243 |                                                 className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-secondary/80"
244 |                                             >
245 |                                                 {activeServersCount}
246 |                                             </Badge>
247 |                                         ) : activeServersCount > 0 && isCollapsed ? (
248 |                                             <SidebarMenuBadge className="bg-secondary/80 text-secondary-foreground">
249 |                                                 {activeServersCount}
250 |                                             </SidebarMenuBadge>
251 |                                         ) : null}
252 |                                     </SidebarMenuButton>
253 |                                 </SidebarMenuItem>
254 |                             </SidebarMenu>
255 |                         </SidebarGroupContent>
256 |                     </SidebarGroup>
257 |                 </SidebarContent>
258 |                 
259 |                 <SidebarFooter className="flex flex-col gap-2 p-3 border-t border-border/40">
260 |                     <Skeleton className="h-10 w-full" />
261 |                     <Skeleton className="h-10 w-full" />
262 |                 </SidebarFooter>
263 |             </Sidebar>
264 |         );
265 |     }
266 | 
267 |     const displayUserId = userId ?? '...';
268 |     const isUserAuthenticated = !!authenticatedUserId;
269 | 
270 |     return (
271 |         <>
272 |             <Sidebar className="shadow-sm bg-background/80 dark:bg-background/40 backdrop-blur-md" collapsible="icon">
273 |                 <SidebarHeader className="p-4 border-b border-border/40">
274 |                     <div className="flex items-center justify-start">
275 |                         <Link href="/" className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${isCollapsed ? "justify-center w-full" : ""}`}>
276 |                             <div className={`flex items-center justify-center rounded-full bg-primary ${isCollapsed ? 'h-6 w-6 flex-shrink-0' : 'h-8 w-8'}`}>
277 |                                 <Image src="/logo.png" alt="ChatLima logo" width={32} height={32} className={`${isCollapsed ? 'h-4 w-4' : 'h-6 w-6'}`} />
278 |                             </div>
279 |                             {!isCollapsed && (
280 |                                 <div className="font-semibold text-lg text-foreground/90">ChatLima</div>
281 |                             )}
282 |                         </Link>
283 |                     </div>
284 |                 </SidebarHeader>
285 |                 
286 |                 <SidebarContent className="flex flex-col h-[calc(100vh-8rem)]">
287 |                     <SidebarGroup className="flex-1 min-h-0">
288 |                         <SidebarGroupLabel className={cn(
289 |                             "px-4 text-xs font-medium text-muted-foreground/80 uppercase tracking-wider",
290 |                             isCollapsed ? "sr-only" : ""
291 |                         )}>
292 |                             Chats
293 |                         </SidebarGroupLabel>
294 |                         <ChatList
295 |                             chats={chats ?? []}
296 |                             isLoading={isChatsLoading} 
297 |                             isCollapsed={isCollapsed}
298 |                             isUpdatingChatTitle={isUpdatingChatTitle}
299 |                             onNewChat={handleNewChat}
300 |                             onDeleteChat={handleDeleteChat}
301 |                             onUpdateChatTitle={updateChatTitle}
302 |                         />
303 |                     </SidebarGroup>
304 |                     
305 |                     <div className="relative my-0">
306 |                         <div className="absolute inset-x-0">
307 |                             <Separator className="w-full h-px bg-border/40" />
308 |                         </div>
309 |                     </div>
310 | 
311 |                     <SidebarGroup className="flex-shrink-0">
312 |                         <SidebarGroupLabel className={cn(
313 |                             "px-4 pt-2 text-xs font-medium text-muted-foreground/80 uppercase tracking-wider",
314 |                             isCollapsed ? "sr-only" : ""
315 |                         )}>
316 |                             Settings
317 |                         </SidebarGroupLabel>
318 |                         <SidebarGroupContent>
319 |                            <SidebarMenu>
320 |                                 <SidebarMenuItem>
321 |                                     <SidebarMenuButton 
322 |                                         onClick={() => setMcpSettingsOpen(true)}
323 |                                         className={cn(
324 |                                             "w-full flex items-center gap-2 transition-all"
325 |                                         )}
326 |                                         tooltip={isCollapsed ? "MCP Servers" : undefined}
327 |                                     >
328 |                                         <ServerIcon className={cn(
329 |                                             "h-4 w-4 flex-shrink-0",
330 |                                             activeServersCount > 0 ? "text-primary" : "text-muted-foreground"
331 |                                         )} />
332 |                                         {!isCollapsed && (
333 |                                             <span className="flex-grow text-sm text-foreground/80">MCP Servers</span>
334 |                                         )}
335 |                                         {activeServersCount > 0 && !isCollapsed ? (
336 |                                             <Badge 
337 |                                                 variant="secondary" 
338 |                                                 className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-secondary/80"
339 |                                             >
340 |                                                 {activeServersCount}
341 |                                             </Badge>
342 |                                         ) : activeServersCount > 0 && isCollapsed ? (
343 |                                             <SidebarMenuBadge className="bg-secondary/80 text-secondary-foreground">
344 |                                                 {activeServersCount}
345 |                                             </SidebarMenuBadge>
346 |                                         ) : null}
347 |                                     </SidebarMenuButton>
348 |                                 </SidebarMenuItem>
349 |                                 <SidebarMenuItem>
350 |                                     <SidebarMenuButton 
351 |                                         onClick={() => setApiKeySettingsOpen(true)}
352 |                                         className={cn(
353 |                                             "w-full flex items-center gap-2 transition-all"
354 |                                         )}
355 |                                         tooltip={isCollapsed ? "API Keys" : undefined}
356 |                                     >
357 |                                         <Key className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
358 |                                         {!isCollapsed && (
359 |                                             <span className="flex-grow text-sm text-foreground/80 text-left">API Keys</span>
360 |                                         )}
361 |                                     </SidebarMenuButton>
362 |                                 </SidebarMenuItem>
363 |                                 <SidebarMenuItem>
364 |                                     <SidebarMenuButton asChild>
365 |                                         <ThemeToggle
366 |                                             className={cn(
367 |                                                 "w-full flex items-center gap-2 transition-all text-sm text-foreground/80",
368 |                                                 isCollapsed ? "justify-center" : "justify-start"
369 |                                             )}
370 |                                             showLabel={!isCollapsed}
371 |                                             labelText={<span className="flex-grow text-left">Theme</span>}
372 |                                         />
373 |                                     </SidebarMenuButton>
374 |                                 </SidebarMenuItem>
375 |                                 {webSearchEnabled && (
376 |                                     <SidebarMenuItem>
377 |                                         <DropdownMenu>
378 |                                             <TooltipProvider>
379 |                                                 <Tooltip>
380 |                                                     <DropdownMenuTrigger asChild>
381 |                                                         <TooltipTrigger asChild>
382 |                                                             <SidebarMenuButton
383 |                                                                 className={cn(
384 |                                                                     "w-full flex items-center gap-2 transition-all",
385 |                                                                     "hover:bg-secondary/50 active:bg-secondary/70",
386 |                                                                     isCollapsed ? "justify-center" : ""
387 |                                                                 )}
388 |                                                             >
389 |                                                                 <Globe className={cn(
390 |                                                                     "h-4 w-4 flex-shrink-0",
391 |                                                                     webSearchEnabled ? "text-primary" : "text-muted-foreground"
392 |                                                                 )} />
393 |                                                                 {!isCollapsed && (
394 |                                                                     <span className="text-sm text-foreground/80 flex-grow text-left">
395 |                                                                         Search Context ({webSearchContextSize.charAt(0).toUpperCase() + webSearchContextSize.slice(1)}) 
396 |                                                                     </span>
397 |                                                                 )}
398 |                                                             </SidebarMenuButton>
399 |                                                         </TooltipTrigger>
400 |                                                     </DropdownMenuTrigger>
401 |                                                     {isCollapsed && (
402 |                                                         <TooltipContent side="right" sideOffset={5}>
403 |                                                             Web Search Context: {webSearchContextSize.charAt(0).toUpperCase() + webSearchContextSize.slice(1)}
404 |                                                         </TooltipContent>
405 |                                                     )}
406 |                                                 </Tooltip>
407 |                                             </TooltipProvider>
408 |                                             <DropdownMenuContent 
409 |                                                 align="end" 
410 |                                                 side={isCollapsed ? "right" : "bottom"} 
411 |                                                 sideOffset={8} 
412 |                                                 className="min-w-[120px]"
413 |                                             >
414 |                                                 <DropdownMenuLabel>Search Context Size</DropdownMenuLabel>
415 |                                                 <DropdownMenuSeparator />
416 |                                                 <DropdownMenuItem 
417 |                                                     onClick={() => setWebSearchContextSize('low')}
418 |                                                     className={cn(webSearchContextSize === 'low' && "bg-secondary")}
419 |                                                 >
420 |                                                     Low
421 |                                                 </DropdownMenuItem>
422 |                                                 <DropdownMenuItem 
423 |                                                     onClick={() => setWebSearchContextSize('medium')}
424 |                                                     className={cn(webSearchContextSize === 'medium' && "bg-secondary")}
425 |                                                 >
426 |                                                     Medium
427 |                                                 </DropdownMenuItem>
428 |                                                 <DropdownMenuItem 
429 |                                                     onClick={() => setWebSearchContextSize('high')}
430 |                                                     className={cn(webSearchContextSize === 'high' && "bg-secondary")}
431 |                                                 >
432 |                                                     High
433 |                                                 </DropdownMenuItem>
434 |                                             </DropdownMenuContent>
435 |                                         </DropdownMenu>
436 |                                     </SidebarMenuItem>
437 |                                 )}
438 |                            </SidebarMenu>
439 |                         </SidebarGroupContent>
440 |                     </SidebarGroup>
441 |                 </SidebarContent>
442 |                 
443 |                 <SidebarFooter className="flex flex-col gap-2 p-3 border-t border-border/40">
444 |                     
445 | 
446 |                     {isSessionLoading ? (
447 |                         <div className="flex items-center gap-2 px-3 py-2 mt-2">
448 |                             <Skeleton className="h-8 w-8 rounded-full" />
449 |                             {!isCollapsed && <Skeleton className="h-4 w-24" />}
450 |                         </div>
451 |                     ) : session?.user?.isAnonymous === true ? (
452 |                         <div className={cn(
453 |                             "flex items-center mt-2", 
454 |                             isCollapsed ? "justify-center px-1 py-2" : "px-3 py-2 gap-2" 
455 |                         )}>
456 |                             <SignInButton isCollapsed={isCollapsed} />
457 |                         </div>
458 |                     ) : (
459 |                         <div className={cn(
460 |                             "flex items-center mt-2", 
461 |                             isCollapsed ? "justify-center px-1 py-2" : "px-3 py-2" 
462 |                         )}>
463 |                             <UserAccountMenu />
464 |                         </div>
465 |                     )}
466 | 
467 |                     <div className={cn(
468 |                         "flex items-center justify-center py-2",
469 |                         isCollapsed ? "flex-col gap-2" : "gap-3"
470 |                     )}>
471 |                         <TooltipProvider>
472 |                             <Tooltip>
473 |                                 <TooltipTrigger asChild>
474 |                                     <Link
475 |                                         href="https://chatlima-docs.netlify.app/"
476 |                                         target="_blank"
477 |                                         rel="noopener noreferrer"
478 |                                         className="flex items-center justify-center w-8 h-8 text-muted-foreground/70 hover:text-muted-foreground transition-colors rounded-md hover:bg-secondary/50"
479 |                                     >
480 |                                         <BookOpen className="h-4 w-4" />
481 |                                     </Link>
482 |                                 </TooltipTrigger>
483 |                                 <TooltipContent side="top" sideOffset={5}>
484 |                                     Documentation
485 |                                 </TooltipContent>
486 |                             </Tooltip>
487 |                         </TooltipProvider>
488 | 
489 |                         <TooltipProvider>
490 |                             <Tooltip>
491 |                                 <TooltipTrigger asChild>
492 |                                     <Link 
493 |                                         href="https://github.com/brooksy4503/chatlima" 
494 |                                         target="_blank" 
495 |                                         rel="noopener noreferrer"
496 |                                         className="flex items-center justify-center w-8 h-8 text-muted-foreground/70 hover:text-muted-foreground transition-colors rounded-md hover:bg-secondary/50"
497 |                                     >
498 |                                         <Github className="h-4 w-4" />
499 |                                     </Link>
500 |                                 </TooltipTrigger>
501 |                                 <TooltipContent side="top" sideOffset={5}>
502 |                                     ChatLima on GitHub
503 |                                 </TooltipContent>
504 |                             </Tooltip>
505 |                         </TooltipProvider>
506 |                     </div>
507 |                 </SidebarFooter>
508 |             </Sidebar>
509 | 
510 |             <MCPServerManager
511 |                 servers={mcpServers}
512 |                 onServersChange={setMcpServers}
513 |                 selectedServers={selectedMcpServers}
514 |                 onSelectedServersChange={setSelectedMcpServers}
515 |                 open={mcpSettingsOpen}
516 |                 onOpenChange={setMcpSettingsOpen}
517 |             />
518 | 
519 |             <ApiKeyManager
520 |                 open={apiKeySettingsOpen}
521 |                 onOpenChange={setApiKeySettingsOpen}
522 |             />
523 |         </>
524 |     );
525 | }
```

components/chat.tsx
```
1 | "use client";
2 | 
3 | import { defaultModel, type modelID, MODELS } from "@/ai/providers";
4 | import { Message, useChat } from "@ai-sdk/react";
5 | import { useState, useEffect, useMemo, useCallback } from "react";
6 | import { Textarea } from "./textarea";
7 | import { ProjectOverview } from "./project-overview";
8 | import { Messages } from "./messages";
9 | import { toast } from "sonner";
10 | import { useRouter, useParams } from "next/navigation";
11 | import { useQuery, useQueryClient } from "@tanstack/react-query";
12 | import { convertToUIMessages } from "@/lib/chat-store";
13 | import { type Message as DBMessage } from "@/lib/db/schema";
14 | import { nanoid } from "nanoid";
15 | import { useMCP } from "@/lib/context/mcp-context";
16 | import { useSession } from "@/lib/auth-client";
17 | import { useWebSearch } from "@/lib/context/web-search-context";
18 | import { useModel } from "@/lib/context/model-context";
19 | 
20 | // Type for chat data from DB
21 | interface ChatData {
22 |   id: string;
23 |   messages: DBMessage[];
24 |   createdAt: string;
25 |   updatedAt: string;
26 | }
27 | 
28 | export default function Chat() {
29 |   const router = useRouter();
30 |   const params = useParams();
31 |   const chatId = params?.id as string | undefined;
32 |   const queryClient = useQueryClient();
33 |   const { data: session, isPending: isSessionLoading } = useSession();
34 |   
35 |   const { 
36 |     webSearchEnabled, 
37 |     setWebSearchEnabled, 
38 |     webSearchContextSize, 
39 |     setWebSearchContextSize 
40 |   } = useWebSearch();
41 |   
42 |   const { mcpServersForApi } = useMCP();
43 |   
44 |   const { selectedModel, setSelectedModel } = useModel();
45 |   const [userId, setUserId] = useState<string | null>(null);
46 |   const [generatedChatId, setGeneratedChatId] = useState<string>("");
47 |   const [isMounted, setIsMounted] = useState(false);
48 | 
49 |   useEffect(() => {
50 |     setIsMounted(true);
51 |   }, []);
52 | 
53 |   useEffect(() => {
54 |     if (isMounted && !isSessionLoading) {
55 |       if (session?.user?.id) {
56 |         setUserId(session.user.id);
57 |       } else {
58 |         setUserId(null);
59 |       }
60 |     }
61 |   }, [isMounted, isSessionLoading, session]);
62 |   
63 |   useEffect(() => {
64 |     if (isMounted && !isSessionLoading && !session && chatId && params?.id) {
65 |       console.log("User logged out while on chat page, redirecting to home.");
66 |       toast.info("You have been logged out.");
67 |       router.push('/'); 
68 |     }
69 |   }, [isMounted, session, isSessionLoading, chatId, router, params]);
70 |   
71 |   useEffect(() => {
72 |     if (!chatId) {
73 |       setGeneratedChatId(nanoid());
74 |     }
75 |   }, [chatId]);
76 |   
77 |   const { data: chatData, isLoading: isLoadingChat } = useQuery({
78 |     queryKey: ['chat', chatId],
79 |     queryFn: async ({ queryKey }) => {
80 |       const [_, chatId] = queryKey;
81 |       if (!chatId) return null;
82 |       
83 |       try {
84 |         const response = await fetch(`/api/chats/${chatId}`);
85 |         
86 |         if (!response.ok) {
87 |           throw new Error('Failed to load chat');
88 |         }
89 |         
90 |         const data = await response.json();
91 |         return data as ChatData;
92 |       } catch (error) {
93 |         console.error('Error loading chat history:', error);
94 |         toast.error('Failed to load chat history');
95 |         throw error;
96 |       }
97 |     },
98 |     enabled: 
99 |       !!chatId && 
100 |       !(isMounted && !isSessionLoading && !session && chatId && params?.id),
101 |     retry: 1,
102 |     staleTime: 1000 * 60 * 5,
103 |     refetchOnWindowFocus: false
104 |   });
105 |   
106 |   const initialMessages = useMemo(() => {
107 |     if (!chatData || !chatData.messages || chatData.messages.length === 0) {
108 |       return [];
109 |     }
110 |     
111 |     const uiMessages = convertToUIMessages(chatData.messages);
112 |     return uiMessages.map(msg => ({
113 |       id: msg.id,
114 |       role: msg.role as Message['role'],
115 |       content: msg.content,
116 |       parts: msg.parts,
117 |       hasWebSearch: msg.hasWebSearch,
118 |     } as Message & { hasWebSearch?: boolean }));
119 |   }, [chatData]);
120 |   
121 |   // Function to get API keys from localStorage
122 |   const getClientApiKeys = () => {
123 |     if (typeof window === 'undefined') return {};
124 |     
125 |     const apiKeys: Record<string, string> = {};
126 |     const keyNames = [
127 |       'OPENAI_API_KEY',
128 |       'ANTHROPIC_API_KEY', 
129 |       'GROQ_API_KEY',
130 |       'XAI_API_KEY',
131 |       'OPENROUTER_API_KEY',
132 |       'REQUESTY_API_KEY'
133 |     ];
134 |     
135 |     keyNames.forEach(keyName => {
136 |       const value = localStorage.getItem(keyName);
137 |       if (value) {
138 |         apiKeys[keyName] = value;
139 |       }
140 |     });
141 |     
142 |     return apiKeys;
143 |   };
144 | 
145 |   const { messages, input, handleInputChange, handleSubmit, status, stop } =
146 |     useChat({
147 |       id: chatId || generatedChatId,
148 |       initialMessages,
149 |       maxSteps: 20,
150 |       body: {
151 |         selectedModel,
152 |         mcpServers: mcpServersForApi,
153 |         chatId: chatId || generatedChatId,
154 |         webSearch: {
155 |           enabled: webSearchEnabled,
156 |           contextSize: webSearchContextSize,
157 |         },
158 |         apiKeys: getClientApiKeys()
159 |       },
160 |       experimental_throttle: 500,
161 |       onFinish: (message) => {
162 |         queryClient.invalidateQueries({ queryKey: ['chats'] });
163 |         queryClient.invalidateQueries({ queryKey: ['chat', chatId || generatedChatId] });
164 |         if (!chatId && generatedChatId) {
165 |           if (window.location.pathname !== `/chat/${generatedChatId}`) {
166 |              router.push(`/chat/${generatedChatId}`, { scroll: false }); 
167 |           }
168 |         }
169 |       },
170 |       onError: (error) => {
171 |         let errorMessage = "An error occurred, please try again later."; // Default message
172 |         let errorCode = "UNKNOWN_ERROR";
173 |         let errorDetails = "No additional details available.";
174 | 
175 |         try {
176 |           // The error.message from the Vercel AI SDK is now expected to be a JSON string.
177 |           const parsedBody = JSON.parse(error.message);
178 | 
179 |           // Check for the structure from getErrorMessage (nested error object)
180 |           if (parsedBody.error && typeof parsedBody.error === 'object' && parsedBody.error.code) {
181 |             const apiErrorObject = parsedBody.error;
182 |             errorMessage = apiErrorObject.message || errorMessage;
183 |             errorCode = apiErrorObject.code || errorCode;
184 |             errorDetails = apiErrorObject.details || errorDetails;
185 |           } 
186 |           // Check for the flatter structure (e.g., from direct 429 response)
187 |           else if (typeof parsedBody.error === 'string' && parsedBody.message) {
188 |             errorMessage = parsedBody.message; // Use the detailed message from the API
189 |             if (parsedBody.error === "Message limit reached") {
190 |               errorCode = "MESSAGE_LIMIT_REACHED";
191 |               // Optionally, capture other details like limit and remaining
192 |               const details: any = {};
193 |               if (typeof parsedBody.limit !== 'undefined') details.limit = parsedBody.limit;
194 |               if (typeof parsedBody.remaining !== 'undefined') details.remaining = parsedBody.remaining;
195 |               if (Object.keys(details).length > 0) errorDetails = JSON.stringify(details);
196 | 
197 |             } else {
198 |               // For other flat errors, we might not have a specific code yet
199 |               // but we have the detailed message.
200 |               // errorCode remains UNKNOWN_ERROR or could be set to a generic API_ERROR
201 |             }
202 |           }
203 |           // Fallback for other JSON structures or if parsing was incomplete
204 |           else if (parsedBody.message) {
205 |             errorMessage = parsedBody.message;
206 |           }
207 |            else {
208 |             // If parsing was successful but structure is unrecognized
209 |             // and errorMessage hasn't been updated from a recognized structure.
210 |              if (error.message && error.message.length > 0 && errorMessage === "An error occurred, please try again later.") {
211 |                  errorMessage = error.message; // use raw JSON string if no better message found
212 |             }
213 |             console.warn("Received JSON error message with unrecognized structure:", error.message);
214 |           }
215 |         } catch (e) {
216 |           // If parsing fails, it means error.message was not a JSON string.
217 |           // Use the raw error.message if available.
218 |           if (error.message && error.message.length > 0) {
219 |             errorMessage = error.message;
220 |           }
221 |           console.warn("Failed to parse error message as JSON:", e, "Raw error message:", error.message);
222 |         }
223 | 
224 |         // Log the detailed error for debugging
225 |         console.error(`Chat Error [Code: ${errorCode}]: ${errorMessage}`, { details: errorDetails, originalError: error });
226 | 
227 |         // Display user-friendly toast messages based on error code
228 |         let toastMessage = errorMessage;
229 |         switch (errorCode) {
230 |           case "AUTHENTICATION_REQUIRED":
231 |             toastMessage = "Authentication required. Please log in to continue.";
232 |             // Optionally, redirect to login or prompt user
233 |             // router.push('/login'); 
234 |             break;
235 |           case "MESSAGE_LIMIT_REACHED":
236 |             // The message from the backend (now correctly assigned to errorMessage) is descriptive.
237 |             // toastMessage will use this errorMessage.
238 |             break;
239 |           case "INSUFFICIENT_CREDITS":
240 |             toastMessage = "You have insufficient credits. Please top up your account.";
241 |             break;
242 |           case "RATE_LIMIT_EXCEEDED":
243 |             toastMessage = "Too many requests. Please wait a moment and try again.";
244 |             break;
245 |           case "LLM_PROVIDER_ERROR":
246 |             toastMessage = "The AI model provider is experiencing issues. Please try a different model or try again later.";
247 |             break;
248 |           case "MODEL_INIT_FAILED":
249 |             toastMessage = "Failed to initialize the selected AI model. Please try another model.";
250 |             break;
251 |           case "STREAM_ERROR": // Generic stream error from backend
252 |             toastMessage = "A problem occurred while getting the response. Please try again.";
253 |             break;
254 |           // Add more cases as new error codes are defined in the backend
255 |           default:
256 |             // For UNKNOWN_ERROR or other unhandled codes, use the errorMessage as is (or a generic one)
257 |             if (!errorMessage || errorMessage === "An error occurred, please try again later.") {
258 |                 toastMessage = "An unexpected issue occurred. Please try again.";
259 |             }
260 |             break;
261 |         }
262 | 
263 |         toast.error(
264 |           toastMessage,
265 |           { 
266 |             position: "top-center", 
267 |             richColors: true,
268 |             description: errorCode !== "UNKNOWN_ERROR" && errorMessage !== toastMessage ? errorMessage : undefined,
269 |             duration: 8000 // Longer duration for errors
270 |           }
271 |         );
272 |       },
273 |     });
274 |     
275 |   const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
276 |     e.preventDefault();
277 |     
278 |     handleSubmit(e);
279 |   }, [handleSubmit]);
280 | 
281 |   const isLoading = status === "streaming" || status === "submitted" || isLoadingChat;
282 | 
283 |   const isOpenRouterModel = selectedModel.startsWith("openrouter/");
284 | 
285 |   // Enhance messages with hasWebSearch property for assistant messages when web search was enabled
286 |   const enhancedMessages = useMemo(() => {
287 |     return messages.map((message, index) => {
288 |       // Check if this is an assistant message and if web search was enabled for the preceding user message
289 |       if (message.role === 'assistant' && index > 0) {
290 |         const previousMessage = messages[index - 1];
291 |         // If the previous message was from user and web search was enabled, mark this assistant message
292 |         if (previousMessage.role === 'user' && webSearchEnabled && isOpenRouterModel) {
293 |           return {
294 |             ...message,
295 |             hasWebSearch: true
296 |           } as Message & { hasWebSearch?: boolean };
297 |         }
298 |       }
299 |       return {
300 |         ...message,
301 |         hasWebSearch: (message as any).hasWebSearch || false
302 |       } as Message & { hasWebSearch?: boolean };
303 |     });
304 |   }, [messages, webSearchEnabled, isOpenRouterModel]);
305 | 
306 |   return (
307 |     <div className="h-full flex flex-col justify-between w-full max-w-3xl mx-auto px-4 sm:px-6 md:py-4">
308 |       {/* Main content area: Either ProjectOverview or Messages */}
309 |       <div className="flex-1 overflow-y-auto min-h-0 pb-2">
310 |         {messages.length === 0 && !isLoadingChat ? (
311 |           <div className="max-w-3xl mx-auto w-full pt-4 sm:pt-8">
312 |             <ProjectOverview />
313 |           </div>
314 |         ) : (
315 |           <Messages messages={enhancedMessages} isLoading={isLoading} status={status} />
316 |         )}
317 |       </div>
318 | 
319 |       {/* Input area: Always rendered at the bottom */}
320 |       <div className="mt-2 w-full max-w-3xl mx-auto mb-4 sm:mb-auto shrink-0">
321 |         {/* Conditionally render ProjectOverview above input only when no messages and not loading */}
322 |         {messages.length === 0 && !isLoadingChat && (
323 |           <div className="max-w-3xl mx-auto w-full mb-4 sm:hidden"> {/* Hidden on sm+, shown on mobile */}
324 |             {/* Maybe a condensed overview or nothing here if ProjectOverview is too large */}
325 |           </div>
326 |         )}
327 |         <form onSubmit={handleFormSubmit} className="mt-2">
328 |           <Textarea
329 |             selectedModel={selectedModel}
330 |             setSelectedModel={setSelectedModel}
331 |             handleInputChange={handleInputChange}
332 |             input={input}
333 |             isLoading={isLoading}
334 |             status={status}
335 |             stop={stop}
336 |           />
337 |         </form>
338 |       </div>
339 |     </div>
340 |   );
341 | }
```

components/checkout-button.tsx
```
1 | 'use client';
2 | 
3 | import { useAuth } from '@/hooks/useAuth';
4 | import { Button } from '@/components/ui/button';
5 | import { useRouter } from 'next/navigation';
6 | import { CreditCard } from 'lucide-react';
7 | 
8 | export const CheckoutButton = () => {
9 |   const { user, isAnonymous, isAuthenticated } = useAuth();
10 |   const router = useRouter();
11 | 
12 |   const handleCheckout = () => {
13 |     if (isAnonymous || !isAuthenticated) {
14 |       // Guide anonymous users to sign in first
15 |       router.push('/api/auth/sign-in/google');
16 |     } else {
17 |       // Redirect authenticated users to the Polar checkout page
18 |       // The slug 'ai-usage' must match the one defined in lib/auth.ts
19 |       window.location.href = '/api/auth/checkout/ai-usage';
20 |     }
21 |   };
22 | 
23 |   return (
24 |     <Button onClick={handleCheckout} className="w-full">
25 |       <CreditCard className="mr-2 h-4 w-4" />
26 |       {isAnonymous || !isAuthenticated ? 'Sign In to Purchase Credits' : 'Purchase More Credits'}
27 |     </Button>
28 |   );
29 | }; 
```

components/citation.tsx
```
1 | "use client";
2 | 
3 | import { useState } from "react";
4 | import { motion, AnimatePresence } from "motion/react";
5 | import { cn } from "@/lib/utils";
6 | import { ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
7 | 
8 | interface Citation {
9 |   url: string;
10 |   title: string;
11 |   content?: string;
12 |   startIndex: number;
13 |   endIndex: number;
14 | }
15 | 
16 | interface CitationProps {
17 |   citations: Citation[];
18 | }
19 | 
20 | export function Citations({ citations }: CitationProps) {
21 |   const [isExpanded, setIsExpanded] = useState(false);
22 | 
23 |   if (!citations?.length) return null;
24 | 
25 |   return (
26 |     <div className="mt-2">
27 |       <button
28 |         onClick={() => setIsExpanded(!isExpanded)}
29 |         className={cn(
30 |           "flex items-center gap-1.5 text-xs text-muted-foreground/70",
31 |           "hover:text-muted-foreground transition-colors"
32 |         )}
33 |       >
34 |         {isExpanded ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
35 |         <span>{citations.length} citation{citations.length > 1 ? 's' : ''}</span>
36 |       </button>
37 | 
38 |       <AnimatePresence initial={false}>
39 |         {isExpanded && (
40 |           <motion.div
41 |             className="mt-2 space-y-2"
42 |             initial={{ height: 0, opacity: 0 }}
43 |             animate={{ height: "auto", opacity: 1 }}
44 |             exit={{ height: 0, opacity: 0 }}
45 |             transition={{ duration: 0.2, ease: "easeInOut" }}
46 |           >
47 |             {citations.map((citation, index) => (
48 |               <div
49 |                 key={index}
50 |                 className="text-sm border border-border/30 rounded-lg p-3 bg-muted/10"
51 |               >
52 |                 <div className="flex items-start justify-between gap-2">
53 |                   <a
54 |                     href={citation.url}
55 |                     target="_blank"
56 |                     rel="noopener noreferrer"
57 |                     className="text-primary hover:underline flex items-center gap-1"
58 |                   >
59 |                     {citation.title}
60 |                     <ExternalLinkIcon size={12} className="inline" />
61 |                   </a>
62 |                 </div>
63 |                 {citation.content && (
64 |                   <p className="mt-1.5 text-xs text-muted-foreground line-clamp-3">
65 |                     {citation.content}
66 |                   </p>
67 |                 )}
68 |               </div>
69 |             ))}
70 |           </motion.div>
71 |         )}
72 |       </AnimatePresence>
73 |     </div>
74 |   );
75 | } 
```

components/copy-button.tsx
```
1 | import { CheckIcon, CopyIcon } from "lucide-react";
2 | import { cn } from "@/lib/utils";
3 | import { useCopy } from "@/lib/hooks/use-copy";
4 | import { Button } from "./ui/button";
5 | 
6 | interface CopyButtonProps {
7 |   text: string;
8 |   className?: string;
9 | }
10 | 
11 | export function CopyButton({ text, className }: CopyButtonProps) {
12 |   const { copied, copy } = useCopy();
13 | 
14 |   return (
15 |     <Button
16 |       variant="ghost"
17 |       size="sm"
18 |       className={cn(
19 |         "transition-opacity opacity-0 group-hover/message:opacity-100 gap-1.5",
20 |         // Always visible on touch devices (mobile) where hover doesn't work
21 |         "sm:opacity-0 sm:group-hover/message:opacity-100 opacity-100",
22 |         className
23 |       )}
24 |       onClick={() => copy(text)}
25 |       title="Copy to clipboard"
26 |     >
27 |       {copied ? (
28 |         <>
29 |           <CheckIcon className="h-4 w-4" />
30 |           <span className="text-xs">Copied!</span>
31 |         </>
32 |       ) : (
33 |         <>
34 |           <CopyIcon className="h-4 w-4" />
35 |           <span className="text-xs">Copy</span>
36 |         </>
37 |       )}
38 |     </Button>
39 |   );
40 | } 
```

components/deploy-button.tsx
```
1 | import Link from "next/link";
2 | 
3 | export const DeployButton = () => (
4 |   <Link
5 |     href={`https://vercel.com/new/clone?project-name=Vercel+x+xAI+Chatbot&repository-name=ai-sdk-starter-xai&repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fai-sdk-starter-xai&demo-title=Vercel+x+xAI+Chatbot&demo-url=https%3A%2F%2Fai-sdk-starter-xai.labs.vercel.dev%2F&demo-description=A+simple+chatbot+application+built+with+Next.js+that+uses+xAI+via+the+AI+SDK+and+the+Vercel+Marketplace&products=%5B%7B%22type%22:%22integration%22,%22protocol%22:%22ai%22,%22productSlug%22:%22grok%22,%22integrationSlug%22:%22xai%22%7D%5D`}
6 |     target="_blank"
7 |     rel="noopener noreferrer"
8 |     className="inline-flex items-center gap-2 ml-2 bg-black text-white text-sm px-3 py-1.5 rounded-md hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
9 |   >
10 |     <svg
11 |       data-testid="geist-icon"
12 |       height={14}
13 |       strokeLinejoin="round"
14 |       viewBox="0 0 16 16"
15 |       width={14}
16 |       style={{ color: "currentcolor" }}
17 |     >
18 |       <path
19 |         fillRule="evenodd"
20 |         clipRule="evenodd"
21 |         d="M8 1L16 15H0L8 1Z"
22 |         fill="currentColor"
23 |       />
24 |     </svg>
25 |     Deploy
26 |   </Link>
27 | );
```

components/icons.tsx
```
1 | import Link from "next/link";
2 | import * as React from "react";
3 | import type { SVGProps } from "react";
4 | 
5 | export const VercelIcon = ({ size = 17 }) => {
6 |   return (
7 |     <svg
8 |       height={size}
9 |       strokeLinejoin="round"
10 |       viewBox="0 0 16 16"
11 |       width={size}
12 |       style={{ color: "currentcolor" }}
13 |     >
14 |       <title>Vercel Icon</title>
15 |       <path
16 |         fillRule="evenodd"
17 |         clipRule="evenodd"
18 |         d="M8 1L16 15H0L8 1Z"
19 |         fill="currentColor"
20 |       />
21 |     </svg>
22 |   );
23 | };
24 | 
25 | export const SpinnerIcon = ({ size = 16 }: { size?: number }) => (
26 |   <svg
27 |     height={size}
28 |     strokeLinejoin="round"
29 |     viewBox="0 0 16 16"
30 |     width={size}
31 |     style={{ color: "currentcolor" }}
32 |   >
33 |     <title>Spinner Icon</title>
34 |     <g clipPath="url(#clip0_2393_1490)">
35 |       <path d="M8 0V4" stroke="currentColor" strokeWidth="1.5" />
36 |       <path
37 |         opacity="0.5"
38 |         d="M8 16V12"
39 |         stroke="currentColor"
40 |         strokeWidth="1.5"
41 |       />
42 |       <path
43 |         opacity="0.9"
44 |         d="M3.29773 1.52783L5.64887 4.7639"
45 |         stroke="currentColor"
46 |         strokeWidth="1.5"
47 |       />
48 |       <path
49 |         opacity="0.1"
50 |         d="M12.7023 1.52783L10.3511 4.7639"
51 |         stroke="currentColor"
52 |         strokeWidth="1.5"
53 |       />
54 |       <path
55 |         opacity="0.4"
56 |         d="M12.7023 14.472L10.3511 11.236"
57 |         stroke="currentColor"
58 |         strokeWidth="1.5"
59 |       />
60 |       <path
61 |         opacity="0.6"
62 |         d="M3.29773 14.472L5.64887 11.236"
63 |         stroke="currentColor"
64 |         strokeWidth="1.5"
65 |       />
66 |       <path
67 |         opacity="0.2"
68 |         d="M15.6085 5.52783L11.8043 6.7639"
69 |         stroke="currentColor"
70 |         strokeWidth="1.5"
71 |       />
72 |       <path
73 |         opacity="0.7"
74 |         d="M0.391602 10.472L4.19583 9.23598"
75 |         stroke="currentColor"
76 |         strokeWidth="1.5"
77 |       />
78 |       <path
79 |         opacity="0.3"
80 |         d="M15.6085 10.4722L11.8043 9.2361"
81 |         stroke="currentColor"
82 |         strokeWidth="1.5"
83 |       />
84 |       <path
85 |         opacity="0.8"
86 |         d="M0.391602 5.52783L4.19583 6.7639"
87 |         stroke="currentColor"
88 |         strokeWidth="1.5"
89 |       />
90 |     </g>
91 |     <defs>
92 |       <clipPath id="clip0_2393_1490">
93 |         <rect width="16" height="16" fill="white" />
94 |       </clipPath>
95 |     </defs>
96 |   </svg>
97 | );
98 | 
99 | export const Github = (props: SVGProps<SVGSVGElement>) => (
100 |   <svg
101 |     viewBox="0 0 256 250"
102 |     width="1em"
103 |     height="1em"
104 |     fill="currentColor"
105 |     xmlns="http://www.w3.org/2000/svg"
106 |     preserveAspectRatio="xMidYMid"
107 |     {...props}
108 |   >
109 |     <title>GitHub Icon</title>
110 |     <path d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46 6.397 1.185 8.746-2.777 8.746-6.158 0-3.052-.12-13.135-.174-23.83-35.61 7.742-43.124-15.103-43.124-15.103-5.823-14.795-14.213-18.73-14.213-18.73-11.613-7.944.876-7.78.876-7.78 12.853.902 19.621 13.19 19.621 13.19 11.417 19.568 29.945 13.911 37.249 10.64 1.149-8.272 4.466-13.92 8.127-17.116-28.431-3.236-58.318-14.212-58.318-63.258 0-13.975 5-25.394 13.188-34.358-1.329-3.224-5.71-16.242 1.24-33.874 0 0 10.749-3.44 35.21 13.121 10.21-2.836 21.16-4.258 32.038-4.307 10.878.049 21.837 1.47 32.066 4.307 24.431-16.56 35.165-13.12 35.165-13.12 6.967 17.63 2.584 30.65 1.255 33.873 8.207 8.964 13.173 20.383 13.173 34.358 0 49.163-29.944 59.988-58.447 63.157 4.591 3.972 8.682 11.762 8.682 23.704 0 17.126-.148 30.91-.148 35.126 0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128.002 256 57.307 198.691 0 128.001 0Zm-80.06 182.34c-.282.636-1.283.827-2.194.39-.929-.417-1.45-1.284-1.15-1.922.276-.655 1.279-.838 2.205-.399.93.418 1.46 1.293 1.139 1.931Zm6.296 5.618c-.61.566-1.804.303-2.614-.591-.837-.892-.994-2.086-.375-2.66.63-.566 1.787-.301 2.626.591.838.903 1 2.088.363 2.66Zm4.32 7.188c-.785.545-2.067.034-2.86-1.104-.784-1.138-.784-2.503.017-3.05.795-.547 2.058-.055 2.861 1.075.782 1.157.782 2.522-.019 3.08Zm7.304 8.325c-.701.774-2.196.566-3.29-.49-1.119-1.032-1.43-2.496-.726-3.27.71-.776 2.213-.558 3.315.49 1.11 1.03 1.45 2.505.701 3.27Zm9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033-1.448-.439-2.395-1.613-2.103-2.626.301-1.01 1.747-1.484 3.207-1.028 1.446.436 2.396 1.602 2.095 2.622Zm10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95-1.53.034-2.769-.82-2.786-1.86 0-1.065 1.202-1.932 2.733-1.958 1.522-.03 2.768.818 2.768 1.868Zm10.555-.405c.182 1.03-.875 2.088-2.387 2.37-1.485.271-2.861-.365-3.05-1.386-.184-1.056.893-2.114 2.376-2.387 1.514-.263 2.868.356 3.061 1.403Z" />
111 |   </svg>
112 | );
113 | 
114 | export function StarButton() {
115 |   return (
116 |     <Link
117 |       href="https://github.com/vercel-labs/ai-sdk-preview-reasoning"
118 |       target="_blank"
119 |       rel="noopener noreferrer"
120 |       className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-700 dark:hover:text-zinc-300"
121 |     >
122 |       <Github className="size-4" />
123 |       <span className="hidden sm:inline">Star on GitHub</span>
124 |     </Link>
125 |   );
126 | }
127 | 
128 | export const XAiIcon = ({ size = 16 }) => {
129 |   return (
130 |     <svg
131 |       xmlns="http://www.w3.org/2000/svg"
132 |       height={size}
133 |       version="1.1"
134 |       viewBox="0 0 438.7 481.4"
135 |     >
136 |       <title>xAI Icon</title>
137 |       <path d="M355.5,155.1l8.3,326.4h66.6l8.3-445.2-83.2,118.8ZM438.7,0h-101.6l-159.4,227.6,50.8,72.5L438.7,0ZM0,481.4h101.6l50.8-72.5-50.8-72.5L0,481.4ZM0,155.1l228.5,326.4h101.6L101.6,155.1H0Z" />
138 |     </svg>
139 |   );
140 | };
```

components/input.tsx
```
1 | import { ArrowUp } from "lucide-react";
2 | import { Input as ShadcnInput } from "./ui/input";
3 | 
4 | interface InputProps {
5 |   input: string;
6 |   handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
7 |   isLoading: boolean;
8 |   status: string;
9 |   stop: () => void;
10 | }
11 | 
12 | export const Input = ({
13 |   input,
14 |   handleInputChange,
15 |   isLoading,
16 |   status,
17 |   stop,
18 | }: InputProps) => {
19 |   return (
20 |     <div className="relative w-full">
21 |       <ShadcnInput
22 |         className="bg-secondary py-6 w-full rounded-xl pr-12"
23 |         value={input}
24 |         autoFocus
25 |         placeholder={"Say something..."}
26 |         onChange={handleInputChange}
27 |       />
28 |       {status === "streaming" || status === "submitted" ? (
29 |         <button
30 |           type="button"
31 |           onClick={stop}
32 |           className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 bg-black hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
33 |         >
34 |           <div className="animate-spin h-4 w-4">
35 |             <svg className="h-4 w-4 text-white" viewBox="0 0 24 24">
36 |               <circle
37 |                 className="opacity-25"
38 |                 cx="12"
39 |                 cy="12"
40 |                 r="10"
41 |                 stroke="currentColor"
42 |                 strokeWidth="4"
43 |                 fill="none"
44 |               />
45 |               <path
46 |                 className="opacity-75"
47 |                 fill="currentColor"
48 |                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
49 |               />
50 |             </svg>
51 |           </div>
52 |         </button>
53 |       ) : (
54 |         <button
55 |           type="submit"
56 |           disabled={isLoading || !input.trim()}
57 |           className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 bg-black hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
58 |         >
59 |           <ArrowUp className="h-4 w-4 text-white" />
60 |         </button>
61 |       )}
62 |     </div>
63 |   );
64 | };
```

components/ios-install-prompt.tsx
```
1 | 'use client';
2 | 
3 | import { useState, useEffect } from 'react';
4 | import { X, Share, Plus } from 'lucide-react';
5 | import { Button } from '@/components/ui/button';
6 | import { Card, CardContent } from '@/components/ui/card';
7 | 
8 | interface IOSInstallPromptProps {
9 |   onDismiss?: () => void;
10 | }
11 | 
12 | export function IOSInstallPrompt({ onDismiss }: IOSInstallPromptProps) {
13 |   const [isVisible, setIsVisible] = useState(false);
14 |   const [isIOS, setIsIOS] = useState(false);
15 |   const [isStandalone, setIsStandalone] = useState(false);
16 | 
17 |   useEffect(() => {
18 |     // Check if running on iOS
19 |     const userAgent = navigator.userAgent.toLowerCase();
20 |     const isiOS = /iphone|ipad|ipod/.test(userAgent);
21 |     setIsIOS(isiOS);
22 | 
23 |     // Check if already running in standalone mode
24 |     const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
25 |                            (window.navigator as any).standalone === true;
26 |     setIsStandalone(isStandaloneMode);
27 | 
28 |     // Check if user has previously dismissed the prompt
29 |     const dismissed = localStorage.getItem('chatlima-ios-install-dismissed');
30 |     
31 |     // Only show if: iOS Safari, not in standalone mode, not previously dismissed
32 |     if (isiOS && !isStandaloneMode && !dismissed) {
33 |       // Show after a short delay to ensure user has interacted with the page
34 |       const timer = setTimeout(() => {
35 |         setIsVisible(true);
36 |       }, 3000);
37 |       
38 |       return () => clearTimeout(timer);
39 |     }
40 |   }, []);
41 | 
42 |   const handleDismiss = () => {
43 |     setIsVisible(false);
44 |     localStorage.setItem('chatlima-ios-install-dismissed', 'true');
45 |     onDismiss?.();
46 |   };
47 | 
48 |   const handleNeverShow = () => {
49 |     setIsVisible(false);
50 |     localStorage.setItem('chatlima-ios-install-dismissed', 'permanent');
51 |     onDismiss?.();
52 |   };
53 | 
54 |   if (!isVisible || !isIOS || isStandalone) {
55 |     return null;
56 |   }
57 | 
58 |   return (
59 |     <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
60 |       <Card className="shadow-lg border-2">
61 |         <CardContent className="p-4">
62 |           <div className="flex items-start justify-between mb-3">
63 |             <div className="flex items-center gap-2">
64 |               <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
65 |                 <span className="text-white text-sm font-bold">CL</span>
66 |               </div>
67 |               <div>
68 |                 <h3 className="font-semibold text-sm">Add to Home Screen</h3>
69 |                 <p className="text-xs text-muted-foreground">Quick access to ChatLima</p>
70 |               </div>
71 |             </div>
72 |             <Button
73 |               variant="ghost"
74 |               size="sm"
75 |               onClick={handleDismiss}
76 |               className="h-6 w-6 p-0"
77 |             >
78 |               <X className="h-4 w-4" />
79 |             </Button>
80 |           </div>
81 |           
82 |           <div className="space-y-2 mb-3">
83 |             <div className="flex items-center gap-2 text-xs">
84 |               <span className="w-4 h-4 border rounded flex items-center justify-center">1</span>
85 |               <span>Tap the</span>
86 |               <Share className="h-4 w-4" />
87 |               <span>Share button below</span>
88 |             </div>
89 |             <div className="flex items-center gap-2 text-xs">
90 |               <span className="w-4 h-4 border rounded flex items-center justify-center">2</span>
91 |               <span>Select</span>
92 |               <div className="flex items-center gap-1 px-1 py-0.5 bg-muted rounded text-xs">
93 |                 <Plus className="h-3 w-3" />
94 |                 <span>Add to Home Screen</span>
95 |               </div>
96 |             </div>
97 |           </div>
98 |           
99 |           <div className="flex gap-2">
100 |             <Button
101 |               variant="outline"
102 |               size="sm"
103 |               onClick={handleNeverShow}
104 |               className="text-xs flex-1"
105 |             >
106 |               Don&apos;t show again
107 |             </Button>
108 |             <Button
109 |               size="sm"
110 |               onClick={handleDismiss}
111 |               className="text-xs flex-1"
112 |             >
113 |               Got it
114 |             </Button>
115 |           </div>
116 |         </CardContent>
117 |       </Card>
118 |     </div>
119 |   );
120 | } 
```

components/markdown.tsx
```
1 | import Link from "next/link";
2 | import React, { memo } from "react";
3 | import ReactMarkdown, { type Components } from "react-markdown";
4 | import remarkGfm from "remark-gfm";
5 | import remarkMath from "remark-math";
6 | import rehypeKatex from "rehype-katex";
7 | import "katex/dist/katex.min.css";
8 | import { cn } from "@/lib/utils";
9 | 
10 | const components: Partial<Components> = {
11 |   pre: ({ children, ...props }) => (
12 |     <pre className="overflow-x-auto max-w-full rounded-lg bg-zinc-100 dark:bg-zinc-800/50 black:bg-zinc-800/50 p-2.5 my-1.5 text-sm whitespace-pre-wrap break-words" {...props}>
13 |       {children}
14 |     </pre>
15 |   ),
16 |   code: ({ children, className, ...props }: React.HTMLProps<HTMLElement> & { className?: string }) => {
17 |     const match = /language-(\w+)/.exec(className || '');
18 |     const isInline = !match && !className;
19 | 
20 |     if (isInline) {
21 |       return (
22 |         <code
23 |           className="px-1 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/50 black:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 black:text-zinc-300 text-[0.9em] font-mono"
24 |           {...props}
25 |         >
26 |           {children}
27 |         </code>
28 |       );
29 |     }
30 |     return (
31 |       <code className={cn("block font-mono text-sm whitespace-pre-wrap break-words max-w-full", className)} {...props}>
32 |         {children}
33 |       </code>
34 |     );
35 |   },
36 |   ol: ({ node, children, ...props }) => (
37 |     <ol className="list-decimal list-outside ml-4 space-y-0.5 my-1.5" {...props}>
38 |       {children}
39 |     </ol>
40 |   ),
41 |   ul: ({ node, children, ...props }) => (
42 |     <ul className="list-disc list-outside ml-4 space-y-0.5 my-1.5" {...props}>
43 |       {children}
44 |     </ul>
45 |   ),
46 |   li: ({ node, children, ...props }) => (
47 |     <li className="leading-normal" {...props}>
48 |       {children}
49 |     </li>
50 |   ),
51 |   p: ({ node, children, ...props }) => (
52 |     <p className="leading-relaxed my-1" {...props}>
53 |       {children}
54 |     </p>
55 |   ),
56 |   strong: ({ node, children, ...props }) => (
57 |     <strong className="font-semibold" {...props}>
58 |       {children}
59 |     </strong>
60 |   ),
61 |   em: ({ node, children, ...props }) => (
62 |     <em className="italic" {...props}>
63 |       {children}
64 |     </em>
65 |   ),
66 |   blockquote: ({ node, children, ...props }) => (
67 |     <blockquote
68 |       className="border-l-2 border-zinc-200 dark:border-zinc-700 black:border-zinc-700 pl-3 my-1.5 italic text-zinc-600 dark:text-zinc-400 black:text-zinc-400"
69 |       {...props}
70 |     >
71 |       {children}
72 |     </blockquote>
73 |   ),
74 |   a: ({ node, href, children, ...props }) => {
75 |     const isInternal = href && (href.startsWith("/") || href.startsWith("#"));
76 |     if (isInternal) {
77 |       return (
78 |         <Link href={href} {...props}>
79 |           {children}
80 |         </Link>
81 |       );
82 |     }
83 |     return (
84 |       <a
85 |         href={href}
86 |         target="_blank"
87 |         rel="noopener noreferrer"
88 |         {...props}
89 |         className="text-blue-500 hover:underline hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 black:text-blue-400 black:hover:text-blue-300 transition-colors"
90 |       >
91 |         {children}
92 |       </a>
93 |     );
94 |   },
95 |   h1: ({ node, children, ...props }) => (
96 |     <h1
97 |       className="text-2xl font-semibold mt-3 mb-1.5 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100"
98 |       {...props}
99 |     >
100 |       {children}
101 |     </h1>
102 |   ),
103 |   h2: ({ node, children, ...props }) => (
104 |     <h2
105 |       className="text-xl font-semibold mt-2.5 mb-1.5 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100"
106 |       {...props}
107 |     >
108 |       {children}
109 |     </h2>
110 |   ),
111 |   h3: ({ node, children, ...props }) => (
112 |     <h3
113 |       className="text-lg font-semibold mt-2 mb-1 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100"
114 |       {...props}
115 |     >
116 |       {children}
117 |     </h3>
118 |   ),
119 |   h4: ({ node, children, ...props }) => (
120 |     <h4
121 |       className="text-base font-semibold mt-2 mb-1 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100"
122 |       {...props}
123 |     >
124 |       {children}
125 |     </h4>
126 |   ),
127 |   h5: ({ node, children, ...props }) => (
128 |     <h5
129 |       className="text-sm font-semibold mt-2 mb-1 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100"
130 |       {...props}
131 |     >
132 |       {children}
133 |     </h5>
134 |   ),
135 |   h6: ({ node, children, ...props }) => (
136 |     <h6
137 |       className="text-xs font-semibold mt-2 mb-0.5 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100"
138 |       {...props}
139 |     >
140 |       {children}
141 |     </h6>
142 |   ),
143 |   table: ({ node, children, ...props }) => (
144 |     <div className="my-1.5 overflow-x-auto">
145 |       <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700 black:divide-zinc-700" {...props}>
146 |         {children}
147 |       </table>
148 |     </div>
149 |   ),
150 |   thead: ({ node, children, ...props }) => (
151 |     <thead className="bg-zinc-50 dark:bg-zinc-800/50 black:bg-zinc-800/50" {...props}>
152 |       {children}
153 |     </thead>
154 |   ),
155 |   tbody: ({ node, children, ...props }) => (
156 |     <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700 black:divide-zinc-700 bg-white dark:bg-transparent black:bg-transparent" {...props}>
157 |       {children}
158 |     </tbody>
159 |   ),
160 |   tr: ({ node, children, ...props }) => (
161 |     <tr className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30 black:hover:bg-zinc-800/30" {...props}>
162 |       {children}
163 |     </tr>
164 |   ),
165 |   th: ({ node, children, ...props }) => (
166 |     <th
167 |       className="px-3 py-1.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 black:text-zinc-400 uppercase tracking-wider"
168 |       {...props}
169 |     >
170 |       {children}
171 |     </th>
172 |   ),
173 |   td: ({ node, children, ...props }) => (
174 |     <td className="px-3 py-1.5 text-sm" {...props}>
175 |       {children}
176 |     </td>
177 |   ),
178 |   hr: ({ node, ...props }) => (
179 |     <hr className="my-1.5 border-zinc-200 dark:border-zinc-700 black:border-zinc-700" {...props} />
180 |   ),
181 | };
182 | 
183 | const remarkPlugins = [remarkGfm, remarkMath];
184 | const rehypePlugins = [rehypeKatex];
185 | 
186 | // Preprocesses markdown to convert \(...\) to $...$ and \[...\] to $...$
187 | function preprocessMathDelimiters(markdown: string): string {
188 |   // Convert block math: \[...\] => $...$
189 |   markdown = markdown.replace(/\\\[([\s\S]+?)\\\]/g, (match, p1) => `$${p1}$`);
190 |   // Convert inline math: \(...\) => $...$
191 |   markdown = markdown.replace(/\\\(([\s\S]+?)\\\)/g, (match, p1) => `${p1}You are a senior developer. You produce optimized, maintainable code that follows best practices. 

Your task is to review the current codebase and fix the current issues.

Current Issue:
<issue>
{{MESSAGE}}
</issue>

Rules:
- Keep your suggestions concise and focused. Avoid unnecessary explanations or fluff. 
- Your output should be a series of specific, actionable changes.

When approaching this task:
1. Carefully review the provided code.
2. Identify the area thats raising this issue or error and provide a fix.
3. Consider best practices for the specific programming language used.

For each suggested change, provide:
1. A short description of the change (one line maximum).
2. The modified code block.

Use the following format for your output:

[Short Description]
```[language]:[path/to/file]
[code block]
```

Begin fixing the codebase provide your solutions.

My current codebase:
<current_codebase>
);
192 |   return markdown;
193 | }
194 | 
195 | const NonMemoizedMarkdown = ({ children }: { children: string }) => {
196 |   const processed = preprocessMathDelimiters(children);
197 |   return (
198 |     <div className="overflow-x-auto max-w-full">
199 |       <ReactMarkdown 
200 |         remarkPlugins={remarkPlugins} 
201 |         rehypePlugins={rehypePlugins}
202 |         components={components}
203 |       >
204 |         {processed}
205 |       </ReactMarkdown>
206 |     </div>
207 |   );
208 | };
209 | 
210 | export const Markdown = memo(
211 |   NonMemoizedMarkdown,
212 |   (prevProps, nextProps) => prevProps.children === nextProps.children,
213 | );
```

components/mcp-server-manager.tsx
```
1 | "use client";
2 | 
3 | import { useState } from "react";
4 | import {
5 |     Dialog,
6 |     DialogContent,
7 |     DialogDescription,
8 |     DialogHeader,
9 |     DialogTitle
10 | } from "./ui/dialog";
11 | import { Button } from "./ui/button";
12 | import { Input } from "./ui/input";
13 | import { Label } from "./ui/label";
14 | import {
15 |     PlusCircle,
16 |     ServerIcon,
17 |     X,
18 |     Terminal,
19 |     Globe,
20 |     ExternalLink,
21 |     Trash2,
22 |     CheckCircle,
23 |     Plus,
24 |     Cog,
25 |     Edit2,
26 |     Eye,
27 |     EyeOff
28 | } from "lucide-react";
29 | import { toast } from "sonner";
30 | import {
31 |     Accordion,
32 |     AccordionContent,
33 |     AccordionItem,
34 |     AccordionTrigger
35 | } from "./ui/accordion";
36 | import { KeyValuePair, MCPServer } from "@/lib/context/mcp-context";
37 | 
38 | // Default template for a new MCP server
39 | const INITIAL_NEW_SERVER: Omit<MCPServer, 'id'> = {
40 |     name: '',
41 |     title: '',
42 |     url: '',
43 |     type: 'sse',
44 |     command: 'node',
45 |     args: [],
46 |     env: [],
47 |     headers: []
48 | };
49 | 
50 | interface MCPServerManagerProps {
51 |     servers: MCPServer[];
52 |     onServersChange: (servers: MCPServer[]) => void;
53 |     selectedServers: string[];
54 |     onSelectedServersChange: (serverIds: string[]) => void;
55 |     open: boolean;
56 |     onOpenChange: (open: boolean) => void;
57 | }
58 | 
59 | // Check if a key name might contain sensitive information
60 | const isSensitiveKey = (key: string): boolean => {
61 |     const sensitivePatterns = [
62 |         /key/i, 
63 |         /token/i, 
64 |         /secret/i, 
65 |         /password/i, 
66 |         /pass/i,
67 |         /auth/i,
68 |         /credential/i
69 |     ];
70 |     return sensitivePatterns.some(pattern => pattern.test(key));
71 | };
72 | 
73 | // Mask a sensitive value
74 | const maskValue = (value: string): string => {
75 |     if (!value) return '';
76 |     if (value.length < 8) return '••••••';
77 |     return value.substring(0, 3) + '•'.repeat(Math.min(10, value.length - 4)) + value.substring(value.length - 1);
78 | };
79 | 
80 | export const MCPServerManager = ({
81 |     servers,
82 |     onServersChange,
83 |     selectedServers,
84 |     onSelectedServersChange,
85 |     open,
86 |     onOpenChange
87 | }: MCPServerManagerProps) => {
88 |     const [newServer, setNewServer] = useState<Omit<MCPServer, 'id'>>(INITIAL_NEW_SERVER);
89 |     const [view, setView] = useState<'list' | 'add'>('list');
90 |     const [newEnvVar, setNewEnvVar] = useState<KeyValuePair>({ key: '', value: '' });
91 |     const [newHeader, setNewHeader] = useState<KeyValuePair>({ key: '', value: '' });
92 |     const [editingServerId, setEditingServerId] = useState<string | null>(null);
93 |     const [showSensitiveEnvValues, setShowSensitiveEnvValues] = useState<Record<number, boolean>>({});
94 |     const [showSensitiveHeaderValues, setShowSensitiveHeaderValues] = useState<Record<number, boolean>>({});
95 |     const [editingEnvIndex, setEditingEnvIndex] = useState<number | null>(null);
96 |     const [editingHeaderIndex, setEditingHeaderIndex] = useState<number | null>(null);
97 |     const [editedEnvValue, setEditedEnvValue] = useState<string>('');
98 |     const [editedHeaderValue, setEditedHeaderValue] = useState<string>('');
99 | 
100 |     const resetAndClose = () => {
101 |         setView('list');
102 |         setNewServer(INITIAL_NEW_SERVER);
103 |         setNewEnvVar({ key: '', value: '' });
104 |         setNewHeader({ key: '', value: '' });
105 |         setShowSensitiveEnvValues({});
106 |         setShowSensitiveHeaderValues({});
107 |         setEditingEnvIndex(null);
108 |         setEditingHeaderIndex(null);
109 |         onOpenChange(false);
110 |     };
111 | 
112 |     const addServer = () => {
113 |         if (!newServer.name) {
114 |             toast.error("Server name is required");
115 |             return;
116 |         }
117 | 
118 |         if (newServer.type === 'sse' && !newServer.url) {
119 |             toast.error("Server URL is required for SSE transport");
120 |             return;
121 |         }
122 | 
123 |         if (newServer.type === 'streamable-http' && !newServer.url) {
124 |             toast.error("Server URL is required for Streamable HTTP transport");
125 |             return;
126 |         }
127 | 
128 |         if (newServer.type === 'stdio' && (!newServer.command || !newServer.args?.length)) {
129 |             toast.error("Command and at least one argument are required for stdio transport");
130 |             return;
131 |         }
132 | 
133 |         const id = crypto.randomUUID();
134 |         const updatedServers = [...servers, { ...newServer, id }];
135 |         onServersChange(updatedServers);
136 | 
137 |         toast.success(`Added MCP server: ${newServer.name}`);
138 |         setView('list');
139 |         setNewServer(INITIAL_NEW_SERVER);
140 |         setNewEnvVar({ key: '', value: '' });
141 |         setNewHeader({ key: '', value: '' });
142 |         setShowSensitiveEnvValues({});
143 |         setShowSensitiveHeaderValues({});
144 |     };
145 | 
146 |     const removeServer = (id: string, e: React.MouseEvent) => {
147 |         e.stopPropagation();
148 |         const updatedServers = servers.filter(server => server.id !== id);
149 |         onServersChange(updatedServers);
150 | 
151 |         // If the removed server was selected, remove it from selected servers
152 |         if (selectedServers.includes(id)) {
153 |             onSelectedServersChange(selectedServers.filter(serverId => serverId !== id));
154 |         }
155 | 
156 |         toast.success("Server removed");
157 |     };
158 | 
159 |     const toggleServer = (id: string) => {
160 |         if (selectedServers.includes(id)) {
161 |             // Remove from selected servers
162 |             onSelectedServersChange(selectedServers.filter(serverId => serverId !== id));
163 |             const server = servers.find(s => s.id === id);
164 |             if (server) {
165 |                 toast.success(`Disabled MCP server: ${server.name}`);
166 |             }
167 |         } else {
168 |             // Add to selected servers
169 |             onSelectedServersChange([...selectedServers, id]);
170 |             const server = servers.find(s => s.id === id);
171 |             if (server) {
172 |                 toast.success(`Enabled MCP server: ${server.name}`);
173 |             }
174 |         }
175 |     };
176 | 
177 |     const clearAllServers = () => {
178 |         if (selectedServers.length > 0) {
179 |             onSelectedServersChange([]);
180 |             toast.success("All MCP servers disabled");
181 |             resetAndClose();
182 |         }
183 |     };
184 | 
185 |     const handleArgsChange = (value: string) => {
186 |         try {
187 |             // Try to parse as JSON if it starts with [ (array)
188 |             const argsArray = value.trim().startsWith('[')
189 |                 ? JSON.parse(value)
190 |                 : value.split(' ').filter(Boolean);
191 | 
192 |             setNewServer({ ...newServer, args: argsArray });
193 |         } catch (error) {
194 |             // If parsing fails, just split by spaces
195 |             setNewServer({ ...newServer, args: value.split(' ').filter(Boolean) });
196 |         }
197 |     };
198 | 
199 |     const addEnvVar = () => {
200 |         if (!newEnvVar.key) return;
201 | 
202 |         setNewServer({
203 |             ...newServer,
204 |             env: [...(newServer.env || []), { ...newEnvVar }]
205 |         });
206 | 
207 |         setNewEnvVar({ key: '', value: '' });
208 |     };
209 | 
210 |     const removeEnvVar = (index: number) => {
211 |         const updatedEnv = [...(newServer.env || [])];
212 |         updatedEnv.splice(index, 1);
213 |         setNewServer({ ...newServer, env: updatedEnv });
214 |         
215 |         // Clean up visibility state for this index
216 |         const updatedVisibility = { ...showSensitiveEnvValues };
217 |         delete updatedVisibility[index];
218 |         setShowSensitiveEnvValues(updatedVisibility);
219 |         
220 |         // If currently editing this value, cancel editing
221 |         if (editingEnvIndex === index) {
222 |             setEditingEnvIndex(null);
223 |         }
224 |     };
225 | 
226 |     const startEditEnvValue = (index: number, value: string) => {
227 |         setEditingEnvIndex(index);
228 |         setEditedEnvValue(value);
229 |     };
230 | 
231 |     const saveEditedEnvValue = () => {
232 |         if (editingEnvIndex !== null) {
233 |             const updatedEnv = [...(newServer.env || [])];
234 |             updatedEnv[editingEnvIndex] = {
235 |                 ...updatedEnv[editingEnvIndex],
236 |                 value: editedEnvValue
237 |             };
238 |             setNewServer({ ...newServer, env: updatedEnv });
239 |             setEditingEnvIndex(null);
240 |         }
241 |     };
242 | 
243 |     const addHeader = () => {
244 |         if (!newHeader.key) return;
245 | 
246 |         setNewServer({
247 |             ...newServer,
248 |             headers: [...(newServer.headers || []), { ...newHeader }]
249 |         });
250 | 
251 |         setNewHeader({ key: '', value: '' });
252 |     };
253 | 
254 |     const removeHeader = (index: number) => {
255 |         const updatedHeaders = [...(newServer.headers || [])];
256 |         updatedHeaders.splice(index, 1);
257 |         setNewServer({ ...newServer, headers: updatedHeaders });
258 |         
259 |         // Clean up visibility state for this index
260 |         const updatedVisibility = { ...showSensitiveHeaderValues };
261 |         delete updatedVisibility[index];
262 |         setShowSensitiveHeaderValues(updatedVisibility);
263 |         
264 |         // If currently editing this value, cancel editing
265 |         if (editingHeaderIndex === index) {
266 |             setEditingHeaderIndex(null);
267 |         }
268 |     };
269 | 
270 |     const startEditHeaderValue = (index: number, value: string) => {
271 |         setEditingHeaderIndex(index);
272 |         setEditedHeaderValue(value);
273 |     };
274 | 
275 |     const saveEditedHeaderValue = () => {
276 |         if (editingHeaderIndex !== null) {
277 |             const updatedHeaders = [...(newServer.headers || [])];
278 |             updatedHeaders[editingHeaderIndex] = {
279 |                 ...updatedHeaders[editingHeaderIndex],
280 |                 value: editedHeaderValue
281 |             };
282 |             setNewServer({ ...newServer, headers: updatedHeaders });
283 |             setEditingHeaderIndex(null);
284 |         }
285 |     };
286 | 
287 |     const toggleSensitiveEnvValue = (index: number) => {
288 |         setShowSensitiveEnvValues(prev => ({
289 |             ...prev,
290 |             [index]: !prev[index]
291 |         }));
292 |     };
293 | 
294 |     const toggleSensitiveHeaderValue = (index: number) => {
295 |         setShowSensitiveHeaderValues(prev => ({
296 |             ...prev,
297 |             [index]: !prev[index]
298 |         }));
299 |     };
300 | 
301 |     const hasAdvancedConfig = (server: MCPServer) => {
302 |         return (server.env && server.env.length > 0) ||
303 |             (server.headers && server.headers.length > 0);
304 |     };
305 | 
306 |     // Editing support
307 |     const startEditing = (server: MCPServer) => {
308 |         setEditingServerId(server.id);
309 |         setNewServer({
310 |             name: server.name,
311 |             title: server.title,
312 |             url: server.url,
313 |             type: server.type,
314 |             command: server.command,
315 |             args: server.args,
316 |             env: server.env,
317 |             headers: server.headers
318 |         });
319 |         setView('add');
320 |         // Reset sensitive value visibility states
321 |         setShowSensitiveEnvValues({});
322 |         setShowSensitiveHeaderValues({});
323 |         setEditingEnvIndex(null);
324 |         setEditingHeaderIndex(null);
325 |     };
326 | 
327 |     const handleFormCancel = () => {
328 |         if (view === 'add') {
329 |             setView('list');
330 |             setEditingServerId(null);
331 |             setNewServer(INITIAL_NEW_SERVER);
332 |             setShowSensitiveEnvValues({});
333 |             setShowSensitiveHeaderValues({});
334 |             setEditingEnvIndex(null);
335 |             setEditingHeaderIndex(null);
336 |         } else {
337 |             resetAndClose();
338 |         }
339 |     };
340 | 
341 |     const updateServer = () => {
342 |         if (!newServer.name) {
343 |             toast.error("Server name is required");
344 |             return;
345 |         }
346 |         if (newServer.type === 'sse' && !newServer.url) {
347 |             toast.error("Server URL is required for SSE transport");
348 |             return;
349 |         }
350 |         if (newServer.type === 'streamable-http' && !newServer.url) {
351 |             toast.error("Server URL is required for Streamable HTTP transport");
352 |             return;
353 |         }
354 |         if (newServer.type === 'stdio' && (!newServer.command || !newServer.args?.length)) {
355 |             toast.error("Command and at least one argument are required for stdio transport");
356 |             return;
357 |         }
358 |         const updated = servers.map(s =>
359 |             s.id === editingServerId ? { ...newServer, id: editingServerId! } : s
360 |         );
361 |         onServersChange(updated);
362 |         toast.success(`Updated MCP server: ${newServer.name}`);
363 |         setView('list');
364 |         setEditingServerId(null);
365 |         setNewServer(INITIAL_NEW_SERVER);
366 |         setShowSensitiveEnvValues({});
367 |         setShowSensitiveHeaderValues({});
368 |     };
369 | 
370 |     return (
371 |         <Dialog open={open} onOpenChange={onOpenChange}>
372 |             <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-hidden flex flex-col">
373 |                 <DialogHeader>
374 |                     <DialogTitle className="flex items-center gap-2">
375 |                         <ServerIcon className="h-5 w-5 text-primary" />
376 |                         MCP Server Configuration
377 |                     </DialogTitle>
378 |                     <DialogDescription>
379 |                         Connect to Model Context Protocol servers to access additional AI tools.
380 |                         {selectedServers.length > 0 && (
381 |                             <span className="block mt-1 text-xs font-medium text-primary">
382 |                                 {selectedServers.length} server{selectedServers.length !== 1 ? 's' : ''} currently active
383 |                             </span>
384 |                         )}
385 |                     </DialogDescription>
386 |                 </DialogHeader>
387 | 
388 |                 {view === 'list' ? (
389 |                     <div className="flex-1 overflow-hidden flex flex-col">
390 |                         {servers.length > 0 ? (
391 |                             <div className="flex-1 overflow-hidden flex flex-col">
392 |                                 <div className="flex-1 overflow-hidden flex flex-col">
393 |                                     <div className="flex items-center justify-between mb-3">
394 |                                         <h3 className="text-sm font-medium">Available Servers</h3>
395 |                                         <span className="text-xs text-muted-foreground">
396 |                                             Select multiple servers to combine their tools
397 |                                         </span>
398 |                                     </div>
399 |                                     <div className="overflow-y-auto pr-1 flex-1 gap-2.5 flex flex-col pb-16">
400 |                                         {servers
401 |                                             .sort((a, b) => {
402 |                                                 const aActive = selectedServers.includes(a.id);
403 |                                                 const bActive = selectedServers.includes(b.id);
404 |                                                 if (aActive && !bActive) return -1;
405 |                                                 if (!aActive && bActive) return 1;
406 |                                                 return 0;
407 |                                             })
408 |                                             .map((server) => {
409 |                                             const isActive = selectedServers.includes(server.id);
410 |                                             return (
411 |                                                 <div
412 |                                                     key={server.id}
413 |                                                     className={`
414 |                             relative flex flex-col p-3.5 rounded-xl transition-colors
415 |                             border ${isActive
416 |                                                             ? 'border-primary bg-primary/10'
417 |                                                             : 'border-border hover:border-primary/30 hover:bg-primary/5'}
418 |                           `}
419 |                                                 >
420 |                                                     {/* Server Header with Type Badge and Delete Button */}
421 |                                                     <div className="flex items-center justify-between mb-2">
422 |                                                         <div className="flex items-center gap-2">
423 |                                                             {server.type === 'sse' ? (
424 |                                                                 <Globe className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'} flex-shrink-0`} />
425 |                                                             ) : (
426 |                                                                 <Terminal className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'} flex-shrink-0`} />
427 |                                                             )}
428 |                                                             <h4 className="text-sm font-medium truncate max-w-[220px]">{server.name}</h4>
429 |                                                             {hasAdvancedConfig(server) && (
430 |                                                                 <span className="flex-shrink-0">
431 |                                                                     <Cog className="h-3 w-3 text-muted-foreground" />
432 |                                                                 </span>
433 |                                                             )}
434 |                                                         </div>
435 |                                                         <div className="flex items-center gap-2">
436 |                                                             <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
437 |                                                                 {server.type.toUpperCase()}
438 |                                                             </span>
439 |                                                             <button
440 |                                                                 onClick={(e) => removeServer(server.id, e)}
441 |                                                                 className="p-1 rounded-full hover:bg-muted/70"
442 |                                                                 aria-label="Remove server"
443 |                                                             >
444 |                                                                 <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
445 |                                                             </button>
446 |                                                             <button
447 |                                                                 onClick={() => startEditing(server)}
448 |                                                                 className="p-1 rounded-full hover:bg-muted/50"
449 |                                                                 aria-label="Edit server"
450 |                                                             >
451 |                                                                 <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
452 |                                                             </button>
453 |                                                         </div>
454 |                                                     </div>
455 | 
456 |                                                     {/* Server Details */}
457 |                                                     <p className="text-xs text-muted-foreground mb-2.5 truncate">
458 |                                                         {server.type === 'sse' || server.type === 'streamable-http'
459 |                                                             ? server.url
460 |                                                             : `${server.command} ${server.args?.join(' ')}`
461 |                                                         }
462 |                                                     </p>
463 | 
464 |                                                     {/* Action Button */}
465 |                                                     <Button
466 |                                                         size="sm"
467 |                                                         className="w-full gap-1.5 hover:text-black hover:dark:text-white rounded-lg"
468 |                                                         variant={isActive ? "default" : "outline"}
469 |                                                         onClick={() => toggleServer(server.id)}
470 |                                                     >
471 |                                                         {isActive && <CheckCircle className="h-3.5 w-3.5" />}
472 |                                                         {isActive ? "Active" : "Enable Server"}
473 |                                                     </Button>
474 |                                                 </div>
475 |                                             );
476 |                                         })}
477 |                                     </div>
478 |                                 </div>
479 |                             </div>
480 |                         ) : (
481 |                             <div className="flex-1 py-8 pb-16 flex flex-col items-center justify-center space-y-4">
482 |                                 <div className="rounded-full p-3 bg-primary/10">
483 |                                     <ServerIcon className="h-7 w-7 text-primary" />
484 |                                 </div>
485 |                                 <div className="text-center space-y-1">
486 |                                     <h3 className="text-base font-medium">No MCP Servers Added</h3>
487 |                                     <p className="text-sm text-muted-foreground max-w-[300px]">
488 |                                         Add your first MCP server to access additional AI tools
489 |                                     </p>
490 |                                 </div>
491 |                                 <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-4">
492 |                                     <a
493 |                                         href="https://modelcontextprotocol.io"
494 |                                         target="_blank"
495 |                                         rel="noopener noreferrer"
496 |                                         className="flex items-center gap-1 hover:text-primary transition-colors"
497 |                                     >
498 |                                         Learn about MCP
499 |                                         <ExternalLink className="h-3 w-3" />
500 |                                     </a>
501 |                                 </div>
502 |                             </div>
503 |                         )}
504 |                     </div>
505 |                 ) : (
506 |                     <div className="space-y-4 overflow-y-auto px-1 py-0.5 mb-14 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
507 |                         <h3 className="text-sm font-medium">{editingServerId ? "Edit MCP Server" : "Add New MCP Server"}</h3>
508 |                         <div className="space-y-4">
509 |                             <div className="grid gap-1.5">
510 |                                 <Label htmlFor="name">
511 |                                     Server Name
512 |                                 </Label>
513 |                                 <Input
514 |                                     id="name"
515 |                                     value={newServer.name}
516 |                                     onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
517 |                                     placeholder="My MCP Server"
518 |                                     className="relative z-0"
519 |                                 />
520 |                                 <p className="text-xs text-muted-foreground">
521 |                                     Unique identifier for this server
522 |                                 </p>
523 |                             </div>
524 | 
525 |                             <div className="grid gap-1.5">
526 |                                 <Label htmlFor="title">
527 |                                     Display Title (Optional)
528 |                                 </Label>
529 |                                 <Input
530 |                                     id="title"
531 |                                     value={newServer.title || ''}
532 |                                     onChange={(e) => setNewServer({ ...newServer, title: e.target.value })}
533 |                                     placeholder="File System Access"
534 |                                     className="relative z-0"
535 |                                 />
536 |                                 <p className="text-xs text-muted-foreground">
537 |                                     Human-friendly name for UI display
538 |                                 </p>
539 |                             </div>
540 | 
541 |                             <div className="grid gap-1.5">
542 |                                 <Label htmlFor="transport-type">
543 |                                     Transport Type
544 |                                 </Label>
545 |                                 <div className="space-y-2">
546 |                                     <p className="text-xs text-muted-foreground">Choose how to connect to your MCP server:</p>
547 |                                     <div className="grid gap-2 grid-cols-2">
548 |                                         <button
549 |                                             type="button"
550 |                                             onClick={() => setNewServer({ ...newServer, type: 'sse' })}
551 |                                             className={`flex items-center gap-2 p-3 rounded-md text-left border transition-all ${
552 |                                                 newServer.type === 'sse' 
553 |                                                     ? 'border-primary bg-primary/10 ring-1 ring-primary' 
554 |                                                     : 'border-border hover:border-border/80 hover:bg-muted/50'
555 |                                             }`}
556 |                                         >
557 |                                             <Globe className={`h-5 w-5 shrink-0 ${newServer.type === 'sse' ? 'text-primary' : ''}`} />
558 |                                             <div>
559 |                                                 <p className="font-medium">SSE</p>
560 |                                                 <p className="text-xs text-muted-foreground">Server-Sent Events</p>
561 |                                             </div>
562 |                                         </button>
563 |                                         
564 |                                         <button
565 |                                             type="button"
566 |                                             onClick={() => setNewServer({ ...newServer, type: 'stdio' })}
567 |                                             className={`flex items-center gap-2 p-3 rounded-md text-left border transition-all ${
568 |                                                 newServer.type === 'stdio' 
569 |                                                     ? 'border-primary bg-primary/10 ring-1 ring-primary' 
570 |                                                     : 'border-border hover:border-border/80 hover:bg-muted/50'
571 |                                             }`}
572 |                                         >
573 |                                             <Terminal className={`h-5 w-5 shrink-0 ${newServer.type === 'stdio' ? 'text-primary' : ''}`} />
574 |                                             <div>
575 |                                                 <p className="font-medium">stdio</p>
576 |                                                 <p className="text-xs text-muted-foreground">Standard I/O</p>
577 |                                             </div>
578 |                                         </button>
579 |                                     </div>
580 |                                     <button
581 |                                         type="button"
582 |                                         onClick={() => setNewServer({ ...newServer, type: 'streamable-http' })}
583 |                                         className={`flex items-center gap-2 p-3 rounded-md text-left border transition-all col-span-2 ${
584 |                                             newServer.type === 'streamable-http' 
585 |                                                 ? 'border-primary bg-primary/10 ring-1 ring-primary' 
586 |                                                 : 'border-border hover:border-border/80 hover:bg-muted/50'
587 |                                         }`}
588 |                                     >
589 |                                         <Globe className={`h-5 w-5 shrink-0 ${newServer.type === 'streamable-http' ? 'text-primary' : ''}`} />
590 |                                         <div>
591 |                                             <p className="font-medium">Streamable HTTP</p>
592 |                                             <p className="text-xs text-muted-foreground">Streamable HTTP Server</p>
593 |                                         </div>
594 |                                     </button>
595 |                                 </div>
596 |                             </div>
597 | 
598 |                             {newServer.type === 'sse' || newServer.type === 'streamable-http' ? (
599 |                                 <div className="grid gap-1.5">
600 |                                     <Label htmlFor="url">
601 |                                         Server URL
602 |                                     </Label>
603 |                                     <Input
604 |                                         id="url"
605 |                                         value={newServer.url}
606 |                                         onChange={(e) => setNewServer({ ...newServer, url: e.target.value })}
607 |                                         placeholder={newServer.type === 'streamable-http' ? "https://mcp.example.com/token/mcp" : "https://mcp.example.com/token/sse"}
608 |                                         className="relative z-0"
609 |                                     />
610 |                                     <p className="text-xs text-muted-foreground">
611 |                                         Full URL to the {newServer.type === 'sse' ? 'SSE' : 'Streamable HTTP'} endpoint of the MCP server
612 |                                     </p>
613 |                                 </div>
614 |                             ) : (
615 |                                 <>
616 |                                     <div className="grid gap-1.5">
617 |                                         <Label htmlFor="command">
618 |                                             Command
619 |                                         </Label>
620 |                                         <Input
621 |                                             id="command"
622 |                                             value={newServer.command}
623 |                                             onChange={(e) => setNewServer({ ...newServer, command: e.target.value })}
624 |                                             placeholder="node"
625 |                                             className="relative z-0"
626 |                                         />
627 |                                         <p className="text-xs text-muted-foreground">
628 |                                             Executable to run (e.g., node, python)
629 |                                         </p>
630 |                                     </div>
631 |                                     <div className="grid gap-1.5">
632 |                                         <Label htmlFor="args">
633 |                                             Arguments
634 |                                         </Label>
635 |                                         <Input
636 |                                             id="args"
637 |                                             value={newServer.args?.join(' ') || ''}
638 |                                             onChange={(e) => handleArgsChange(e.target.value)}
639 |                                             placeholder="src/mcp-server.js --port 3001"
640 |                                             className="relative z-0"
641 |                                         />
642 |                                         <p className="text-xs text-muted-foreground">
643 |                                             Space-separated arguments or JSON array
644 |                                         </p>
645 |                                     </div>
646 |                                 </>
647 |                             )}
648 | 
649 |                             {/* Advanced Configuration */}
650 |                             <Accordion type="single" collapsible className="w-full">
651 |                                 <AccordionItem value="env-vars">
652 |                                     <AccordionTrigger className="text-sm py-2">
653 |                                         Environment Variables
654 |                                     </AccordionTrigger>
655 |                                     <AccordionContent>
656 |                                         <div className="space-y-3">
657 |                                             <div className="flex items-end gap-2">
658 |                                                 <div className="flex-1">
659 |                                                     <Label htmlFor="env-key" className="text-xs mb-1 block">
660 |                                                         Key
661 |                                                     </Label>
662 |                                                     <Input
663 |                                                         id="env-key"
664 |                                                         value={newEnvVar.key}
665 |                                                         onChange={(e) => setNewEnvVar({ ...newEnvVar, key: e.target.value })}
666 |                                                         placeholder="API_KEY"
667 |                                                         className="h-8 relative z-0"
668 |                                                     />
669 |                                                 </div>
670 |                                                 <div className="flex-1">
671 |                                                     <Label htmlFor="env-value" className="text-xs mb-1 block">
672 |                                                         Value
673 |                                                     </Label>
674 |                                                     <Input
675 |                                                         id="env-value"
676 |                                                         value={newEnvVar.value}
677 |                                                         onChange={(e) => setNewEnvVar({ ...newEnvVar, value: e.target.value })}
678 |                                                         placeholder="your-secret-key"
679 |                                                         className="h-8 relative z-0"
680 |                                                         type="text"
681 |                                                     />
682 |                                                 </div>
683 |                                                 <Button
684 |                                                     type="button"
685 |                                                     variant="outline"
686 |                                                     size="sm"
687 |                                                     onClick={addEnvVar}
688 |                                                     disabled={!newEnvVar.key}
689 |                                                     className="h-8 mt-1"
690 |                                                 >
691 |                                                     <Plus className="h-3.5 w-3.5" />
692 |                                                 </Button>
693 |                                             </div>
694 | 
695 |                                             {newServer.env && newServer.env.length > 0 ? (
696 |                                                 <div className="border rounded-md divide-y">
697 |                                                     {newServer.env.map((env, index) => (
698 |                                                         <div key={index} className="flex items-center justify-between p-2 text-sm">
699 |                                                             <div className="flex-1 flex items-center gap-1 truncate">
700 |                                                                 <span className="font-mono text-xs">{env.key}</span>
701 |                                                                 <span className="mx-2 text-muted-foreground">=</span>
702 |                                                                 
703 |                                                                 {editingEnvIndex === index ? (
704 |                                                                     <div className="flex gap-1 flex-1">
705 |                                                                         <Input
706 |                                                                             className="h-6 text-xs py-1 px-2"
707 |                                                                             value={editedEnvValue}
708 |                                                                             onChange={(e) => setEditedEnvValue(e.target.value)}
709 |                                                                             onKeyDown={(e) => e.key === 'Enter' && saveEditedEnvValue()}
710 |                                                                             autoFocus
711 |                                                                         />
712 |                                                                         <Button 
713 |                                                                             size="sm" 
714 |                                                                             className="h-6 px-2"
715 |                                                                             onClick={saveEditedEnvValue}
716 |                                                                         >
717 |                                                                             Save
718 |                                                                         </Button>
719 |                                                                     </div>
720 |                                                                 ) : (
721 |                                                                     <>
722 |                                                                         <span className="text-xs text-muted-foreground truncate">
723 |                                                                             {isSensitiveKey(env.key) && !showSensitiveEnvValues[index] 
724 |                                                                                 ? maskValue(env.value) 
725 |                                                                                 : env.value}
726 |                                                                         </span>
727 |                                                                         <span className="flex ml-1 gap-1">
728 |                                                                             {isSensitiveKey(env.key) && (
729 |                                                                                 <button
730 |                                                                                     onClick={() => toggleSensitiveEnvValue(index)}
731 |                                                                                     className="p-1 hover:bg-muted/50 rounded-full"
732 |                                                                                 >
733 |                                                                                     {showSensitiveEnvValues[index] ? (
734 |                                                                                         <EyeOff className="h-3 w-3 text-muted-foreground" />
735 |                                                                                     ) : (
736 |                                                                                         <Eye className="h-3 w-3 text-muted-foreground" />
737 |                                                                                     )}
738 |                                                                                 </button>
739 |                                                                             )}
740 |                                                                             <button
741 |                                                                                 onClick={() => startEditEnvValue(index, env.value)}
742 |                                                                                 className="p-1 hover:bg-muted/50 rounded-full"
743 |                                                                             >
744 |                                                                                 <Edit2 className="h-3 w-3 text-muted-foreground" />
745 |                                                                             </button>
746 |                                                                         </span>
747 |                                                                     </>
748 |                                                                 )}
749 |                                                             </div>
750 |                                                             <Button
751 |                                                                 type="button"
752 |                                                                 variant="ghost"
753 |                                                                 size="sm"
754 |                                                                 onClick={() => removeEnvVar(index)}
755 |                                                                 className="h-6 w-6 p-0 ml-2"
756 |                                                             >
757 |                                                                 <X className="h-3 w-3" />
758 |                                                             </Button>
759 |                                                         </div>
760 |                                                     ))}
761 |                                                 </div>
762 |                                             ) : (
763 |                                                 <p className="text-xs text-muted-foreground text-center py-2">
764 |                                                     No environment variables added
765 |                                                 </p>
766 |                                             )}
767 |                                             <p className="text-xs text-muted-foreground">
768 |                                                 Environment variables will be passed to the MCP server process.
769 |                                             </p>
770 |                                         </div>
771 |                                     </AccordionContent>
772 |                                 </AccordionItem>
773 | 
774 |                                 <AccordionItem value="headers">
775 |                                     <AccordionTrigger className="text-sm py-2">
776 |                                         {newServer.type === 'sse' || newServer.type === 'streamable-http' ? 'HTTP Headers' : 'Additional Configuration'}
777 |                                     </AccordionTrigger>
778 |                                     <AccordionContent>
779 |                                         <div className="space-y-3">
780 |                                             <div className="flex items-end gap-2">
781 |                                                 <div className="flex-1">
782 |                                                     <Label htmlFor="header-key" className="text-xs mb-1 block">
783 |                                                         Key
784 |                                                     </Label>
785 |                                                     <Input
786 |                                                         id="header-key"
787 |                                                         value={newHeader.key}
788 |                                                         onChange={(e) => setNewHeader({ ...newHeader, key: e.target.value })}
789 |                                                         placeholder="Authorization"
790 |                                                         className="h-8 relative z-0"
791 |                                                     />
792 |                                                 </div>
793 |                                                 <div className="flex-1">
794 |                                                     <Label htmlFor="header-value" className="text-xs mb-1 block">
795 |                                                         Value
796 |                                                     </Label>
797 |                                                     <Input
798 |                                                         id="header-value"
799 |                                                         value={newHeader.value}
800 |                                                         onChange={(e) => setNewHeader({ ...newHeader, value: e.target.value })}
801 |                                                         placeholder="Bearer token123"
802 |                                                         className="h-8 relative z-0"
803 |                                                     />
804 |                                                 </div>
805 |                                                 <Button
806 |                                                     type="button"
807 |                                                     variant="outline"
808 |                                                     size="sm"
809 |                                                     onClick={addHeader}
810 |                                                     disabled={!newHeader.key}
811 |                                                     className="h-8 mt-1"
812 |                                                 >
813 |                                                     <Plus className="h-3.5 w-3.5" />
814 |                                                 </Button>
815 |                                             </div>
816 | 
817 |                                             {newServer.headers && newServer.headers.length > 0 ? (
818 |                                                 <div className="border rounded-md divide-y">
819 |                                                     {newServer.headers.map((header, index) => (
820 |                                                         <div key={index} className="flex items-center justify-between p-2 text-sm">
821 |                                                             <div className="flex-1 flex items-center gap-1 truncate">
822 |                                                                 <span className="font-mono text-xs">{header.key}</span>
823 |                                                                 <span className="mx-2 text-muted-foreground">:</span>
824 |                                                                 
825 |                                                                 {editingHeaderIndex === index ? (
826 |                                                                     <div className="flex gap-1 flex-1">
827 |                                                                         <Input
828 |                                                                             className="h-6 text-xs py-1 px-2"
829 |                                                                             value={editedHeaderValue}
830 |                                                                             onChange={(e) => setEditedHeaderValue(e.target.value)}
831 |                                                                             onKeyDown={(e) => e.key === 'Enter' && saveEditedHeaderValue()}
832 |                                                                             autoFocus
833 |                                                                         />
834 |                                                                         <Button 
835 |                                                                             size="sm" 
836 |                                                                             className="h-6 px-2"
837 |                                                                             onClick={saveEditedHeaderValue}
838 |                                                                         >
839 |                                                                             Save
840 |                                                                         </Button>
841 |                                                                     </div>
842 |                                                                 ) : (
843 |                                                                     <>
844 |                                                                         <span className="text-xs text-muted-foreground truncate">
845 |                                                                             {isSensitiveKey(header.key) && !showSensitiveHeaderValues[index] 
846 |                                                                                 ? maskValue(header.value) 
847 |                                                                                 : header.value}
848 |                                                                         </span>
849 |                                                                         <span className="flex ml-1 gap-1">
850 |                                                                             {isSensitiveKey(header.key) && (
851 |                                                                                 <button
852 |                                                                                     onClick={() => toggleSensitiveHeaderValue(index)}
853 |                                                                                     className="p-1 hover:bg-muted/50 rounded-full"
854 |                                                                                 >
855 |                                                                                     {showSensitiveHeaderValues[index] ? (
856 |                                                                                         <EyeOff className="h-3 w-3 text-muted-foreground" />
857 |                                                                                     ) : (
858 |                                                                                         <Eye className="h-3 w-3 text-muted-foreground" />
859 |                                                                                     )}
860 |                                                                                 </button>
861 |                                                                             )}
862 |                                                                             <button
863 |                                                                                 onClick={() => startEditHeaderValue(index, header.value)}
864 |                                                                                 className="p-1 hover:bg-muted/50 rounded-full"
865 |                                                                             >
866 |                                                                                 <Edit2 className="h-3 w-3 text-muted-foreground" />
867 |                                                                             </button>
868 |                                                                         </span>
869 |                                                                     </>
870 |                                                                 )}
871 |                                                             </div>
872 |                                                             <Button
873 |                                                                 type="button"
874 |                                                                 variant="ghost"
875 |                                                                 size="sm"
876 |                                                                 onClick={() => removeHeader(index)}
877 |                                                                 className="h-6 w-6 p-0 ml-2"
878 |                                                             >
879 |                                                                 <X className="h-3 w-3" />
880 |                                                             </Button>
881 |                                                         </div>
882 |                                                     ))}
883 |                                                 </div>
884 |                                             ) : (
885 |                                                 <p className="text-xs text-muted-foreground text-center py-2">
886 |                                                     No {newServer.type === 'sse' || newServer.type === 'streamable-http' ? 'headers' : 'additional configuration'} added
887 |                                                 </p>
888 |                                             )}
889 |                                             <p className="text-xs text-muted-foreground">
890 |                                                 {newServer.type === 'sse' || newServer.type === 'streamable-http'
891 |                                                     ? `HTTP headers will be sent with requests to the ${newServer.type === 'sse' ? 'SSE' : 'Streamable HTTP'} endpoint.`
892 |                                                     : 'Additional configuration parameters for the stdio transport.'}
893 |                                             </p>
894 |                                         </div>
895 |                                     </AccordionContent>
896 |                                 </AccordionItem>
897 |                             </Accordion>
898 |                         </div>
899 |                     </div>
900 |                 )}
901 | 
902 |                 {/* Persistent fixed footer with buttons */}
903 |                 <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex justify-between z-10">
904 |                     {view === 'list' ? (
905 |                         <>
906 |                             <Button
907 |                                 variant="outline"
908 |                                 onClick={clearAllServers}
909 |                                 size="sm"
910 |                                 className="gap-1.5 hover:text-black hover:dark:text-white"
911 |                                 disabled={selectedServers.length === 0}
912 |                             >
913 |                                 <X className="h-3.5 w-3.5" />
914 |                                 Disable All
915 |                             </Button>
916 |                             <Button
917 |                                 onClick={() => setView('add')}
918 |                                 size="sm"
919 |                                 className="gap-1.5"
920 |                             >
921 |                                 <PlusCircle className="h-3.5 w-3.5" />
922 |                                 Add Server
[TRUNCATED]
```

components/message.tsx
```
1 | "use client";
2 | 
3 | import type { Message as TMessage } from "ai";
4 | import { AnimatePresence, motion } from "motion/react";
5 | import { memo, useCallback, useEffect, useState } from "react";
6 | import equal from "fast-deep-equal";
7 | import { Markdown } from "./markdown";
8 | import { cn } from "@/lib/utils";
9 | import { ChevronDownIcon, ChevronUpIcon, LightbulbIcon, BrainIcon } from "lucide-react";
10 | import { SpinnerIcon } from "./icons";
11 | import { ToolInvocation } from "./tool-invocation";
12 | import { CopyButton } from "./copy-button";
13 | import { Citations } from "./citation";
14 | import type { TextUIPart, ToolInvocationUIPart } from "@/lib/types";
15 | import type { ReasoningUIPart, SourceUIPart, FileUIPart, StepStartUIPart } from "@ai-sdk/ui-utils";
16 | import { WebSearchSuggestion } from "./web-search-suggestion";
17 | 
18 | interface ReasoningPart {
19 |   type: "reasoning";
20 |   reasoning: string;
21 |   details: Array<{ type: "text"; text: string }>;
22 | }
23 | 
24 | interface ReasoningMessagePartProps {
25 |   part: ReasoningUIPart;
26 |   isReasoning: boolean;
27 | }
28 | 
29 | export function ReasoningMessagePart({
30 |   part,
31 |   isReasoning,
32 | }: ReasoningMessagePartProps) {
33 |   const [isExpanded, setIsExpanded] = useState(false);
34 | 
35 |   const memoizedSetIsExpanded = useCallback((value: boolean) => {
36 |     setIsExpanded(value);
37 |   }, []);
38 | 
39 |   useEffect(() => {
40 |     memoizedSetIsExpanded(isReasoning);
41 |   }, [isReasoning, memoizedSetIsExpanded]);
42 | 
43 |   return (
44 |     <div className="flex flex-col mb-2 group">
45 |       {isReasoning ? (
46 |         <div className={cn(
47 |           "flex items-center gap-2.5 rounded-full py-1.5 px-3",
48 |           "bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300",
49 |           "border border-indigo-200/50 dark:border-indigo-700/20 w-fit"
50 |         )}>
51 |           <div className="animate-spin h-3.5 w-3.5">
52 |             <SpinnerIcon />
53 |           </div>
54 |           <div className="text-xs font-medium tracking-tight">Thinking...</div>
55 |         </div>
56 |       ) : (
57 |         <button 
58 |           onClick={() => setIsExpanded(!isExpanded)}
59 |           className={cn(
60 |             "flex items-center justify-between w-full",
61 |             "rounded-md py-2 px-3 mb-0.5",
62 |             "bg-muted/50 border border-border/60 hover:border-border/80",
63 |             "transition-all duration-150 cursor-pointer",
64 |             isExpanded ? "bg-muted border-primary/20" : ""
65 |           )}
66 |         >
67 |           <div className="flex items-center gap-2.5">
68 |             <div className={cn(
69 |               "flex items-center justify-center w-6 h-6 rounded-full",
70 |               "bg-amber-50 dark:bg-amber-900/20",
71 |               "text-amber-600 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-700/30",
72 |             )}>
73 |               <LightbulbIcon className="h-3.5 w-3.5" />
74 |             </div>
75 |             <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
76 |               Reasoning
77 |               <span className="text-xs text-muted-foreground font-normal">
78 |                 (click to {isExpanded ? "hide" : "view"})
79 |               </span>
80 |             </div>
81 |           </div>
82 |           <div className={cn(
83 |             "flex items-center justify-center",
84 |             "rounded-full p-0.5 w-5 h-5",
85 |             "text-muted-foreground hover:text-foreground",
86 |             "bg-background/80 border border-border/50",
87 |             "transition-colors",
88 |           )}>
89 |             {isExpanded ? (
90 |               <ChevronDownIcon className="h-3 w-3" />
91 |             ) : (
92 |               <ChevronUpIcon className="h-3 w-3" />
93 |             )}
94 |           </div>
95 |         </button>
96 |       )}
97 | 
98 |       <AnimatePresence initial={false}>
99 |         {isExpanded && (
100 |           <motion.div
101 |             key="reasoning"
102 |             className={cn(
103 |               "text-sm text-muted-foreground flex flex-col gap-2",
104 |               "pl-3.5 ml-0.5 mt-1",
105 |               "border-l border-amber-200/50 dark:border-amber-700/30"
106 |             )}
107 |             initial={{ height: 0, opacity: 0 }}
108 |             animate={{ height: "auto", opacity: 1 }}
109 |             exit={{ height: 0, opacity: 0 }}
110 |             transition={{ duration: 0.2, ease: "easeInOut" }}
111 |           >
112 |             <div className="text-xs text-muted-foreground/70 pl-1 font-medium">
113 |               The assistant&apos;s thought process:
114 |             </div>
115 |             {part.details.map((detail, detailIndex) =>
116 |               detail.type === "text" ? (
117 |                 <div key={detailIndex} className="px-2 py-1.5 bg-muted/10 rounded-md border border-border/30">
118 |                   <Markdown>{detail.text}</Markdown>
119 |                 </div>
120 |               ) : (
121 |                 "<redacted>"
122 |               ),
123 |             )}
124 |           </motion.div>
125 |         )}
126 |       </AnimatePresence>
127 |     </div>
128 |   );
129 | }
130 | 
131 | interface MessageProps {
132 |   message: TMessage & {
133 |     parts?: Array<TextUIPart | ToolInvocationUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
134 |     hasWebSearch?: boolean;
135 |   };
136 |   isLoading: boolean;
137 |   status: "error" | "submitted" | "streaming" | "ready";
138 |   isLatestMessage: boolean;
139 | }
140 | 
141 | const PurePreviewMessage = ({
142 |   message,
143 |   isLatestMessage,
144 |   status,
145 |   isLoading,
146 | }: MessageProps) => {
147 |   // Create a string with all text parts for copy functionality
148 |   const getMessageText = () => {
149 |     if (!message.parts) return "";
150 |     return message.parts
151 |       .filter(part => part.type === "text")
152 |       .map(part => (part.type === "text" ? part.text : ""))
153 |       .join("\n\n");
154 |   };
155 | 
156 |   // Check if message has web search results - use hasWebSearch flag if available, otherwise detect from parts
157 |   const hasWebSearchResults = message.hasWebSearch || message.parts?.some(part => 
158 |     (part.type === "text" && (part as TextUIPart).citations && (part as TextUIPart).citations!.length > 0) ||
159 |     (part.type === "tool-invocation" && (part as ToolInvocationUIPart).toolInvocation.toolName === "web_search")
160 |   );
161 |   
162 | 
163 | 
164 |   // Only show copy button if the message is from the assistant or user, and not currently streaming
165 |   const shouldShowCopyButton = (message.role === "assistant" || message.role === "user") && (!isLatestMessage || status !== "streaming");
166 | 
167 |   return (
168 |     <AnimatePresence key={message.id}>
169 |       <motion.div
170 |         className={cn(
171 |           "w-full mx-auto px-4 group/message",
172 |           message.role === "assistant" ? "mb-8" : "mb-6"
173 |         )}
174 |         initial={{ y: 5, opacity: 0 }}
175 |         animate={{ y: 0, opacity: 1 }}
176 |         key={`message-${message.id}`}
177 |         data-role={message.role}
178 |       >
179 |         <div
180 |           className={cn(
181 |             "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
182 |             "group-data-[role=user]/message:w-fit",
183 |           )}
184 |         >
185 |           <div className="flex flex-col w-full space-y-3">
186 |             {message.parts?.map((part, i) => {
187 |               switch (part.type) {
188 |                 case "text":
189 |                   const textPart = part as TextUIPart;
190 |                   return (
191 |                     <motion.div
192 |                       initial={{ y: 5, opacity: 0 }}
193 |                       animate={{ y: 0, opacity: 1 }}
194 |                       key={`message-${message.id}-part-${i}`}
195 |                       className="flex flex-row gap-2 items-start w-full"
196 |                     >
197 |                       <div
198 |                         className={cn("flex flex-col gap-3 w-full", {
199 |                           "bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl flex items-center gap-2":
200 |                             message.role === "user",
201 |                         })}
202 |                       >
203 |                         <Markdown>{textPart.text}</Markdown>
204 |                         {textPart.citations && <Citations citations={textPart.citations} />}
205 |                         {message.role === 'user' && shouldShowCopyButton && (
206 |                           <CopyButton text={getMessageText()} className="ml-auto" />
207 |                         )}
208 |                       </div>
209 |                     </motion.div>
210 |                   );
211 |                 case "tool-invocation":
212 |                   const toolPart = part as ToolInvocationUIPart;
213 |                   const { toolName, state, args } = toolPart.toolInvocation;
214 |                   const result = 'result' in toolPart.toolInvocation ? toolPart.toolInvocation.result : null;
215 |                   
216 |                   return (
217 |                     <ToolInvocation
218 |                       key={`message-${message.id}-part-${i}`}
219 |                       toolName={toolName}
220 |                       state={state}
221 |                       args={args}
222 |                       result={result}
223 |                       isLatestMessage={isLatestMessage}
224 |                       status={status}
225 |                     />
226 |                   );
227 |                 case "reasoning":
228 |                   const reasoningPart = part as ReasoningUIPart;
229 |                   return (
230 |                     <ReasoningMessagePart
231 |                       key={`message-${message.id}-${i}`}
232 |                       part={reasoningPart}
233 |                       isReasoning={
234 |                         (message.parts &&
235 |                           status === "streaming" &&
236 |                           i === message.parts.length - 1) ??
237 |                         false
238 |                       }
239 |                     />
240 |                   );
241 |                 default:
242 |                   return null;
243 |               }
244 |             })}
245 |             
246 |             {/* Web Search Suggestion - only for assistant messages with web search results and when not streaming */}
247 |             {message.role === 'assistant' && hasWebSearchResults && status !== "streaming" && (
248 |               <WebSearchSuggestion 
249 |                 messageId={message.id} 
250 |                 hasWebSearchResults={hasWebSearchResults}
251 |               />
252 |             )}
253 |             
254 |             {message.role === 'assistant' && shouldShowCopyButton && (
255 |               <div className="flex justify-start mt-2">
256 |                 <CopyButton text={getMessageText()} />
257 |               </div>
258 |             )}
259 |           </div>
260 |         </div>
261 |       </motion.div>
262 |     </AnimatePresence>
263 |   );
264 | };
265 | 
266 | export const Message = memo(PurePreviewMessage, (prevProps, nextProps) => {
267 |   if (prevProps.status !== nextProps.status) return false;
268 |   if (prevProps.message.annotations !== nextProps.message.annotations)
269 |     return false;
270 |   if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
271 |   return true;
272 | });
```

components/messages.tsx
```
1 | import type { Message as TMessage } from "ai";
2 | import { Message } from "./message";
3 | import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom";
4 | 
5 | export const Messages = ({
6 |   messages,
7 |   isLoading,
8 |   status,
9 | }: {
10 |   messages: (TMessage & { hasWebSearch?: boolean })[];
11 |   isLoading: boolean;
12 |   status: "error" | "submitted" | "streaming" | "ready";
13 | }) => {
14 |   const [containerRef, endRef] = useScrollToBottom();
15 |   
16 |   return (
17 |     <div
18 |       className="h-full overflow-y-auto no-scrollbar"
19 |       ref={containerRef}
20 |     >
21 |       <div className="max-w-lg sm:max-w-3xl mx-auto py-4">
22 |         {messages.map((m, i) => (
23 |           <Message
24 |             key={i}
25 |             isLatestMessage={i === messages.length - 1}
26 |             isLoading={isLoading}
27 |             message={{
28 |               ...m,
29 |               hasWebSearch: m.hasWebSearch
30 |             }}
31 |             status={status}
32 |           />
33 |         ))}
34 |         <div className="h-1" ref={endRef} />
35 |       </div>
36 |     </div>
37 |   );
38 | };
```

components/model-picker.tsx
```
1 | "use client";
2 | import { MODELS, modelDetails, type modelID, defaultModel } from "@/ai/providers";
3 | import {
4 |   Popover,
5 |   PopoverContent,
6 |   PopoverTrigger,
7 | } from "./ui/popover";
8 | import { cn } from "@/lib/utils";
9 | import { Sparkles, Zap, Info, Bolt, Code, Brain, Lightbulb, Image, Gauge, Rocket, Bot, ChevronDown, Check } from "lucide-react";
10 | import { useState, useRef, useEffect, useMemo, useCallback } from "react";
11 | import { useCredits } from "@/hooks/useCredits";
12 | import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
13 | import { useAuth } from "@/hooks/useAuth";
14 | import { Input } from "./ui/input";
15 | import { Button } from "./ui/button";
16 | 
17 | interface ModelPickerProps {
18 |   selectedModel: modelID;
19 |   setSelectedModel: (model: modelID) => void;
20 |   onModelSelected?: () => void;
21 | }
22 | 
23 | export const ModelPicker = ({ selectedModel, setSelectedModel, onModelSelected }: ModelPickerProps) => {
24 |   const [hoveredModel, setHoveredModel] = useState<modelID | null>(null);
25 |   const [searchTerm, setSearchTerm] = useState("");
26 |   const [isOpen, setIsOpen] = useState(false);
27 |   const [keyboardFocusedIndex, setKeyboardFocusedIndex] = useState<number>(-1);
28 |   const searchInputRef = useRef<HTMLInputElement>(null);
29 |   const modelListRef = useRef<HTMLDivElement>(null);
30 |   const { user } = useAuth();
31 |   const { canAccessPremiumModels, loading: creditsLoading } = useCredits(undefined, user?.id);
32 |   
33 |   // Function to get the appropriate icon for each provider
34 |   const getProviderIcon = (provider: string) => {
35 |     switch (provider.toLowerCase()) {
36 |       case 'anthropic':
37 |         return <Zap className="h-3 w-3 text-orange-600" />;
38 |       case 'openai':
39 |         return <Zap className="h-3 w-3 text-green-500" />;
40 |       case 'google':
41 |         return <Zap className="h-3 w-3 text-red-500" />;
42 |       case 'groq':
43 |         return <Zap className="h-3 w-3 text-blue-500" />;
44 |       case 'xai':
45 |         return <Zap className="h-3 w-3 text-yellow-500" />;
46 |       case 'openrouter':
47 |         return <Zap className="h-3 w-3 text-purple-500" />;
48 |       default:
49 |         return <Zap className="h-3 w-3 text-blue-500" />;
50 |     }
51 |   };
52 |   
53 |   // Function to get capability icon
54 |   const getCapabilityIcon = (capability: string) => {
55 |     switch (capability.toLowerCase()) {
56 |       case 'code':
57 |         return <Code className="h-2.5 w-2.5" />;
58 |       case 'reasoning':
59 |         return <Brain className="h-2.5 w-2.5" />;
60 |       case 'research':
61 |         return <Lightbulb className="h-2.5 w-2.5" />;
62 |       case 'vision':
63 |         return <Image className="h-2.5 w-2.5" />;
64 |       case 'fast':
65 |       case 'rapid':
66 |         return <Bolt className="h-2.5 w-2.5" />;
67 |       case 'efficient':
68 |       case 'compact':
69 |         return <Gauge className="h-2.5 w-2.5" />;
70 |       case 'creative':
71 |       case 'balance':
72 |         return <Rocket className="h-2.5 w-2.5" />;
73 |       case 'agentic':
74 |         return <Bot className="h-2.5 w-2.5" />;
75 |       default:
76 |         return <Info className="h-2.5 w-2.5" />;
77 |     }
78 |   };
79 |   
80 |   // Get capability badge color
81 |   const getCapabilityColor = (capability: string) => {
82 |     switch (capability.toLowerCase()) {
83 |       case 'code':
84 |         return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
85 |       case 'reasoning':
86 |       case 'research':
87 |         return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
88 |       case 'vision':
89 |         return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
90 |       case 'fast':
91 |       case 'rapid':
92 |         return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
93 |       case 'efficient':
94 |       case 'compact':
95 |         return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
96 |       case 'creative':
97 |       case 'balance':
98 |         return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300";
99 |       case 'agentic':
100 |         return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300";
101 |       default:
102 |         return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
103 |     }
104 |   };
105 |   
106 |   // Filter and sort models based on search term - memoized to prevent re-renders
107 |   const filteredAndSortedModels = useMemo(() => {
108 |     return [...MODELS]
109 |       .filter((id) => {
110 |         const modelId = id as modelID;
111 |         const model = modelDetails[modelId];
112 |         const searchLower = searchTerm.toLowerCase();
113 |         return (
114 |           model.name.toLowerCase().includes(searchLower) ||
115 |           model.provider.toLowerCase().includes(searchLower) ||
116 |           model.capabilities.some(cap => cap.toLowerCase().includes(searchLower))
117 |         );
118 |       })
119 |       .sort((idA, idB) => {
120 |         const nameA = modelDetails[idA].name;
121 |         const nameB = modelDetails[idB].name;
122 |         return nameA.localeCompare(nameB);
123 |       });
124 |   }, [searchTerm]);
125 | 
126 |   // Reset keyboard focus when search term changes
127 |   useEffect(() => {
128 |     setKeyboardFocusedIndex(-1);
129 |   }, [searchTerm]);
130 | 
131 |   // Set initial keyboard focus when picker opens
132 |   useEffect(() => {
133 |     if (isOpen && filteredAndSortedModels.length > 0) {
134 |       const selectedIndex = filteredAndSortedModels.findIndex(id => id === selectedModel);
135 |       setKeyboardFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
136 |     }
137 |   }, [isOpen, filteredAndSortedModels, selectedModel]);
138 | 
139 |   // Get current model details to display
140 |   const keyboardFocusedModel = keyboardFocusedIndex >= 0 && keyboardFocusedIndex < filteredAndSortedModels.length 
141 |     ? filteredAndSortedModels[keyboardFocusedIndex] as modelID 
142 |     : null;
143 |   
144 |   // Separate display logic: button always shows selected model, details panel shows hovered/focused model
145 |   const detailsPanelModelId = keyboardFocusedModel || hoveredModel || selectedModel;
146 |   const detailsPanelModelDetails = modelDetails[detailsPanelModelId];
147 |   
148 |   // Main button always shows the selected model (no layout flipping)
149 |   const selectedModelDetails = modelDetails[selectedModel];
150 |   const isModelUnavailable = creditsLoading ? false : (!canAccessPremiumModels() && selectedModelDetails.premium);
151 | 
152 |   // Handle model change - memoized to prevent re-renders
153 |   const handleModelChange = useCallback((modelId: string) => {
154 |     if ((MODELS as string[]).includes(modelId)) {
155 |       const typedModelId = modelId as modelID;
156 |       setSelectedModel(typedModelId);
157 |       setIsOpen(false);
158 |       setSearchTerm("");
159 |       setKeyboardFocusedIndex(-1);
160 |       onModelSelected?.();
161 |     }
162 |   }, [setSelectedModel, onModelSelected]);
163 | 
164 |   // Handle opening the popover - memoized to prevent re-renders
165 |   const handleOpenChange = useCallback((open: boolean) => {
166 |     setIsOpen(open);
167 |     if (!open) {
168 |       setSearchTerm("");
169 |       setKeyboardFocusedIndex(-1);
170 |     } else {
171 |       // Focus search input when opening
172 |       setTimeout(() => {
173 |         searchInputRef.current?.focus();
174 |       }, 100);
175 |     }
176 |   }, []);
177 | 
178 |   // Handle search input change - memoized to prevent re-renders
179 |   const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
180 |     setSearchTerm(e.target.value);
181 |   }, []);
182 | 
183 |   // Handle keyboard navigation
184 |   const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
185 |     if (!isOpen) return;
186 | 
187 |     switch (e.key) {
188 |       case 'ArrowDown':
189 |         e.preventDefault();
190 |         setKeyboardFocusedIndex(prev => {
191 |           const newIndex = prev < filteredAndSortedModels.length - 1 ? prev + 1 : 0;
192 |           // Scroll to keep focused item visible
193 |           setTimeout(() => {
194 |             const focusedElement = modelListRef.current?.children[newIndex] as HTMLElement;
195 |             if (focusedElement) {
196 |               focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
197 |             }
198 |           }, 0);
199 |           return newIndex;
200 |         });
201 |         break;
202 |       case 'ArrowUp':
203 |         e.preventDefault();
204 |         setKeyboardFocusedIndex(prev => {
205 |           const newIndex = prev > 0 ? prev - 1 : filteredAndSortedModels.length - 1;
206 |           // Scroll to keep focused item visible
207 |           setTimeout(() => {
208 |             const focusedElement = modelListRef.current?.children[newIndex] as HTMLElement;
209 |             if (focusedElement) {
210 |               focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
211 |             }
212 |           }, 0);
213 |           return newIndex;
214 |         });
215 |         break;
216 |       case 'Enter':
217 |         e.preventDefault();
218 |         if (keyboardFocusedIndex >= 0 && keyboardFocusedIndex < filteredAndSortedModels.length) {
219 |           const selectedModelId = filteredAndSortedModels[keyboardFocusedIndex];
220 |           const model = modelDetails[selectedModelId as modelID];
221 |           const isUnavailable = creditsLoading ? false : (model.premium && !canAccessPremiumModels());
222 |           if (!isUnavailable) {
223 |             handleModelChange(selectedModelId);
224 |           }
225 |         }
226 |         break;
227 |       case 'Escape':
228 |         setSearchTerm('');
229 |         setIsOpen(false);
230 |         break;
231 |     }
232 |   }, [isOpen, filteredAndSortedModels, keyboardFocusedIndex, creditsLoading, canAccessPremiumModels, handleModelChange]);
233 | 
234 |   return (
235 |     <TooltipProvider>
236 |       <Popover open={isOpen} onOpenChange={handleOpenChange}>
237 |         <Tooltip>
238 |           <TooltipTrigger asChild>
239 |             <PopoverTrigger asChild>
240 |               <Button
241 |                 variant="outline"
242 |                 role="combobox"
243 |                 aria-expanded={isOpen}
244 |                 className={cn(
245 |                   "max-w-[200px] sm:max-w-fit sm:w-56 px-2 sm:px-3 h-8 sm:h-9 rounded-full justify-between",
246 |                   "border-primary/20 bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20",
247 |                   "transition-all duration-200 ring-offset-background focus:ring-2 focus:ring-primary/30 focus:ring-offset-2",
248 |                   "text-foreground hover:text-foreground font-normal",
249 |                   isModelUnavailable && "opacity-50"
250 |                 )}
251 |               >
252 |                 <div className="flex items-center gap-1 sm:gap-2 min-w-0">
253 |                   {getProviderIcon(selectedModelDetails.provider)}
254 |                   <span className="text-xs font-medium truncate">{selectedModelDetails.name}</span>
255 |                 </div>
256 |                 <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
257 |               </Button>
258 |             </PopoverTrigger>
259 |           </TooltipTrigger>
260 |           <TooltipContent side="bottom" className="max-w-xs">
261 |             {isModelUnavailable ? (
262 |               <p>This model requires premium access. Please check your credits.</p>
263 |             ) : (
264 |               <p>Select an AI model for this conversation. Each model has different capabilities and costs.</p>
265 |             )}
266 |           </TooltipContent>
267 |         </Tooltip>
268 |         
269 |         <PopoverContent 
270 |           className="w-[320px] sm:w-[480px] md:w-[680px] p-0 bg-background/95 dark:bg-muted/95 backdrop-blur-sm border-border/80 max-h-[400px] overflow-hidden" 
271 |           align="start"
272 |         >
273 |           {/* Search input */}
274 |           <div className="px-3 pt-3 pb-2 border-b border-border/40">
275 |             <Input
276 |               ref={searchInputRef}
277 |               type="search"
278 |               placeholder="Search models... (Use ↑↓ arrow keys to navigate, Enter to select)"
279 |               aria-label="Search models by name, provider, or capability"
280 |               value={searchTerm}
281 |               onChange={handleSearchChange}
282 |               onKeyDown={handleKeyDown}
283 |               className="w-full h-8"
284 |             />
285 |           </div>
286 | 
287 |           <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[320px_1fr] items-start max-h-[340px] overflow-hidden">
288 |             {/* Model selector column */}
289 |             <div className="sm:border-r border-border/40 bg-muted/20 p-0 pr-1 overflow-y-auto max-h-[340px]">
290 |               <div ref={modelListRef} className="space-y-1 p-1">
291 |                 {filteredAndSortedModels.length > 0 ? (
292 |                   filteredAndSortedModels.map((id, index) => {
293 |                     const modelId = id as modelID;
294 |                     const model = modelDetails[modelId];
295 |                     const isUnavailable = creditsLoading ? false : (model.premium && !canAccessPremiumModels());
296 |                     const isSelected = selectedModel === id;
297 |                     const isKeyboardFocused = keyboardFocusedIndex === index;
298 |                     
299 |                     const modelItem = (
300 |                       <div
301 |                         key={id}
302 |                         className={cn(
303 |                           "!px-2 sm:!px-3 py-1.5 sm:py-2 cursor-pointer rounded-md text-xs transition-colors duration-150",
304 |                           "hover:bg-accent hover:text-accent-foreground",
305 |                           "focus:bg-accent focus:text-accent-foreground focus:outline-none",
306 |                           isSelected && "!bg-primary/15 !text-foreground font-medium",
307 |                           isKeyboardFocused && "!bg-accent !text-accent-foreground ring-2 ring-primary/30",
308 |                           isUnavailable && "opacity-50 cursor-not-allowed"
309 |                         )}
310 |                         onClick={() => {
311 |                           if (!isUnavailable) {
312 |                             handleModelChange(id);
313 |                           }
314 |                         }}
315 |                         onMouseEnter={() => {
316 |                           setHoveredModel(modelId);
317 |                           setKeyboardFocusedIndex(-1); // Clear keyboard focus when using mouse
318 |                         }}
319 |                         onMouseLeave={() => setHoveredModel(null)}
320 |                       >
321 |                         <div className="flex flex-col gap-0.5">
322 |                           <div className="flex items-center gap-1.5">
323 |                             {getProviderIcon(model.provider)}
324 |                             <span className="font-medium truncate">{model.name}</span>
325 |                             {model.premium && (
326 |                               <Sparkles className="h-3 w-3 text-yellow-500 ml-1 flex-shrink-0" />
327 |                             )}
328 |                             {isSelected && <Check className="h-3 w-3 ml-auto text-primary" />}
329 |                           </div>
330 |                           <span className="text-[10px] sm:text-xs text-muted-foreground">
331 |                             {model.provider}
332 |                           </span>
333 |                         </div>
334 |                       </div>
335 |                     );
336 | 
337 |                     if (isUnavailable && !creditsLoading) {
338 |                       return (
339 |                         <TooltipProvider key={`${id}-tooltip`} delayDuration={300}>
340 |                           <Tooltip>
341 |                             <TooltipTrigger asChild>{modelItem}</TooltipTrigger>
342 |                             <TooltipContent className="max-w-xs">
343 |                               <p className="text-xs">This is a premium model. Credits are required to use it.</p>
344 |                             </TooltipContent>
345 |                           </Tooltip>
346 |                         </TooltipProvider>
347 |                       );
348 |                     }
349 |                     return modelItem;
350 |                   })
351 |                 ) : (
352 |                   <div className="px-2 sm:px-3 py-2 text-xs text-muted-foreground">
353 |                     No models found.
354 |                   </div>
355 |                 )}
356 |               </div>
357 |             </div>
358 |             
359 |             {/* Model details column - hidden on smallest screens, visible on sm+ */}
360 |             <div className="sm:block hidden p-2 sm:p-3 md:p-4 flex-col overflow-y-auto max-h-[340px] min-h-[340px]">
361 |               <div>
362 |                 <div className="flex items-center gap-2 mb-1">
363 |                   {getProviderIcon(detailsPanelModelDetails.provider)}
364 |                   <h3 className="text-sm font-semibold">{detailsPanelModelDetails.name}</h3>
365 |                   {detailsPanelModelDetails.premium && (
366 |                     <Sparkles className="h-4 w-4 text-yellow-500 ml-1 flex-shrink-0" />
367 |                   )}
368 |                 </div>
369 |                 <div className="text-xs text-muted-foreground mb-1">
370 |                   Provider: <span className="font-medium">{detailsPanelModelDetails.provider}</span>
371 |                 </div>
372 |                 
373 |                 {/* Capability badges */}
374 |                 <div className="flex flex-wrap gap-1 mt-2 mb-3">
375 |                   {detailsPanelModelDetails.capabilities.map((capability) => (
376 |                     <span 
377 |                       key={capability}
378 |                       className={cn(
379 |                         "inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium",
380 |                         getCapabilityColor(capability)
381 |                       )}
382 |                     >
383 |                       {getCapabilityIcon(capability)}
384 |                       <span>{capability}</span>
385 |                     </span>
386 |                   ))}
387 |                 </div>
388 |                 
389 |                 <div className="text-xs text-foreground/90 leading-relaxed mb-3 hidden md:block">
390 |                   {detailsPanelModelDetails.description}
391 |                 </div>
392 |               </div>
393 |               
394 |               <div className="bg-muted/40 rounded-md p-2 hidden md:block">
395 |                 <div className="text-[10px] text-muted-foreground flex justify-between items-center">
396 |                   <span>API Version:</span>
397 |                   <code className="bg-background/80 px-2 py-0.5 rounded text-[10px] font-mono">
398 |                     {detailsPanelModelDetails.apiVersion}
399 |                   </code>
400 |                 </div>
401 |               </div>
402 |             </div>
403 |             
404 |             {/* Condensed model details for mobile only */}
405 |             <div className="p-3 sm:hidden border-t border-border/30">
406 |               <div className="flex flex-wrap gap-1 mb-2">
407 |                 {detailsPanelModelDetails.capabilities.slice(0, 4).map((capability) => (
408 |                   <span 
409 |                     key={capability}
410 |                     className={cn(
411 |                       "inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium",
412 |                       getCapabilityColor(capability)
413 |                     )}
414 |                   >
415 |                     {getCapabilityIcon(capability)}
416 |                     <span>{capability}</span>
417 |                   </span>
418 |                 ))}
419 |                 {detailsPanelModelDetails.capabilities.length > 4 && (
420 |                   <span className="text-[10px] text-muted-foreground">+{detailsPanelModelDetails.capabilities.length - 4} more</span>
421 |                 )}
422 |               </div>
423 |             </div>
424 |           </div>
425 |         </PopoverContent>
426 |       </Popover>
427 |     </TooltipProvider>
428 |   );
429 | };
```

components/project-overview.tsx
```
1 | import NextLink from "next/link";
2 | export const ProjectOverview = () => {
3 |   return (
4 |     <div className="flex flex-col items-center justify-end">
5 |       <h1 className="text-3xl font-semibold mb-4">ChatLima</h1>
6 |     </div>
7 |   );
8 | };
9 | 
10 | const Link = ({
11 |   children,
12 |   href,
13 | }: {
14 |   children: React.ReactNode;
15 |   href: string;
16 | }) => {
17 |   return (
18 |     <NextLink
19 |       target="_blank"
20 |       className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-75"
21 |       href={href}
22 |     >
23 |       {children}
24 |     </NextLink>
25 |   );
26 | };
```

components/suggested-prompts.tsx
```
1 | "use client";
2 | 
3 | import { motion } from "motion/react";
4 | import { Button } from "./ui/button";
5 | import { memo } from "react";
6 | 
7 | interface SuggestedPromptsProps {
8 |   sendMessage: (input: string) => void;
9 | }
10 | 
11 | function PureSuggestedPrompts({ sendMessage }: SuggestedPromptsProps) {
12 |   const suggestedActions = [
13 |     {
14 |       title: "What are the advantages",
15 |       label: "of using Next.js?",
16 |       action: "What are the advantages of using Next.js?",
17 |     },
18 |     {
19 |       title: "What is the weather",
20 |       label: "in San Francisco?",
21 |       action: "What is the weather in San Francisco?",
22 |     },
23 |   ];
24 | 
25 |   return (
26 |     <div
27 |       data-testid="suggested-actions"
28 |       className="grid sm:grid-cols-2 gap-2 w-full"
29 |     >
30 |       {suggestedActions.map((suggestedAction, index) => (
31 |         <motion.div
32 |           initial={{ opacity: 0, y: 20 }}
33 |           animate={{ opacity: 1, y: 0 }}
34 |           exit={{ opacity: 0, y: 20 }}
35 |           transition={{ delay: 0.05 * index }}
36 |           key={`suggested-action-${suggestedAction.title}-${index}`}
37 |           className={index > 1 ? "hidden sm:block" : "block"}
38 |         >
39 |           <Button
40 |             variant="ghost"
41 |             onClick={async () => {
42 |               sendMessage(suggestedAction.action);
43 |             }}
44 |             className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
45 |           >
46 |             <span className="font-medium">{suggestedAction.title}</span>
47 |             <span className="text-muted-foreground">
48 |               {suggestedAction.label}
49 |             </span>
50 |           </Button>
51 |         </motion.div>
52 |       ))}
53 |     </div>
54 |   );
55 | }
56 | 
57 | export const SuggestedPrompts = memo(PureSuggestedPrompts, () => true);
```

components/textarea.tsx
```
1 | import { modelID } from "@/ai/providers";
2 | import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
3 | import { ArrowUp, Loader2, Globe, AlertCircle } from "lucide-react";
4 | import { ModelPicker } from "./model-picker";
5 | import { useRef } from "react";
6 | import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
7 | import { useWebSearch } from "@/lib/context/web-search-context";
8 | import { useAuth } from "@/hooks/useAuth";
9 | import { WEB_SEARCH_COST } from "@/lib/tokenCounter";
10 | 
11 | interface InputProps {
12 |   input: string;
13 |   handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
14 |   isLoading: boolean;
15 |   status: string;
16 |   stop: () => void;
17 |   selectedModel: modelID;
18 |   setSelectedModel: (model: modelID) => void;
19 | }
20 | 
21 | export const Textarea = ({
22 |   input,
23 |   handleInputChange,
24 |   isLoading,
25 |   status,
26 |   stop,
27 |   selectedModel,
28 |   setSelectedModel,
29 | }: InputProps) => {
30 |   const isStreaming = status === "streaming" || status === "submitted";
31 |   const iconButtonRef = useRef<HTMLButtonElement>(null);
32 |   const textareaRef = useRef<HTMLTextAreaElement>(null);
33 | 
34 |   const { webSearchEnabled, setWebSearchEnabled } = useWebSearch();
35 |   const { user } = useAuth();
36 | 
37 |   const handleWebSearchToggle = () => {
38 |     setWebSearchEnabled(!webSearchEnabled);
39 |   };
40 | 
41 |   // Check if user has enough credits for web search (5 credits minimum)
42 |   // Use a more resilient check that handles temporary null values during hot reload
43 |   const userCredits = user?.credits ?? 0;
44 |   const hasEnoughCreditsForWebSearch = user?.hasCredits !== false && userCredits >= WEB_SEARCH_COST;
45 |   const isAnonymousUser = !user || user?.isAnonymous;
46 |   // Only allow web search if user has sufficient credits and is not anonymous
47 |   const canUseWebSearch = !isAnonymousUser && hasEnoughCreditsForWebSearch;
48 | 
49 |   // Calculate estimated cost
50 |   const getEstimatedCost = () => {
51 |     const baseCost = 1; // Base cost for any message
52 |     const webSearchCost = webSearchEnabled ? WEB_SEARCH_COST : 0;
53 |     return baseCost + webSearchCost;
54 |   };
55 | 
56 |   const estimatedCost = getEstimatedCost();
57 |   const shouldShowCostWarning = webSearchEnabled && canUseWebSearch && input.trim();
58 | 
59 |   // Focus textarea after model selection
60 |   const handleModelSelected = () => {
61 |     setTimeout(() => {
62 |       textareaRef.current?.focus();
63 |     }, 100);
64 |   };
65 | 
66 |   // Determine tooltip message based on credit status
67 |   const getWebSearchTooltipMessage = () => {
68 |     if (isAnonymousUser) {
69 |       return "Sign in and purchase credits to enable Web Search";
70 |     }
71 |     if (!hasEnoughCreditsForWebSearch) {
72 |       return "Purchase credits to enable Web Search";
73 |     }
74 |     return webSearchEnabled ? 'Disable web search' : 'Enable web search';
75 |   };
76 | 
77 |   return (
78 |     <div className="relative w-full">
79 |       <ShadcnTextarea
80 |         ref={textareaRef}
81 |         className="resize-y bg-background/50 dark:bg-muted/50 backdrop-blur-sm w-full rounded-2xl pr-12 pt-4 pb-16 border-input focus-visible:ring-ring placeholder:text-muted-foreground"
82 |         value={input}
83 |         autoFocus
84 |         placeholder="Send a message..."
85 |         onChange={handleInputChange}
86 |         onKeyDown={(e) => {
87 |           if (e.key === "Enter" && !e.shiftKey && !isLoading && input.trim()) {
88 |             e.preventDefault();
89 |             e.currentTarget.form?.requestSubmit();
90 |           }
91 |         }}
92 |         style={{
93 |           maxHeight: '200px',
94 |           overflowY: 'auto'
95 |         }}
96 |       />
97 |       
98 |       {/* Cost visibility warning */}
99 |       {shouldShowCostWarning && (
100 |         <div className="absolute top-2 right-14 z-10">
101 |           <Tooltip>
102 |             <TooltipTrigger asChild>
103 |               <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs px-2 py-1 rounded-full border border-amber-200 dark:border-amber-700/30">
104 |                 <AlertCircle className="h-3 w-3" />
105 |                 <span className="font-medium">{estimatedCost} credits</span>
106 |               </div>
107 |             </TooltipTrigger>
108 |             <TooltipContent side="top" sideOffset={8}>
109 |               <div className="text-xs">
110 |                 <div>Estimated cost: {estimatedCost} credits</div>
111 |                 <div className="text-muted-foreground">Base: 1 credit + Web Search: {WEB_SEARCH_COST} credits</div>
112 |               </div>
113 |             </TooltipContent>
114 |           </Tooltip>
115 |         </div>
116 |       )}
117 | 
118 |       <div className="absolute left-2 bottom-2 z-10">
119 |         <div className="flex items-center gap-2">
120 |           <ModelPicker
121 |             setSelectedModel={setSelectedModel}
122 |             selectedModel={selectedModel}
123 |             onModelSelected={handleModelSelected}
124 |           />
125 |           {selectedModel.startsWith("openrouter/") && (
126 |             <div className="relative flex items-center">
127 |               <Tooltip>
128 |                 <TooltipTrigger asChild>
129 |                   <button
130 |                     type="button"
131 |                     ref={iconButtonRef}
132 |                     aria-label={webSearchEnabled ? "Disable web search" : "Enable web search"}
133 |                     onClick={handleWebSearchToggle}
134 |                     disabled={!canUseWebSearch}
135 |                     className={`h-8 w-8 flex items-center justify-center rounded-full border transition-colors duration-150 ${
136 |                       !canUseWebSearch 
137 |                         ? 'bg-muted border-muted text-muted-foreground cursor-not-allowed opacity-50' 
138 |                         : webSearchEnabled 
139 |                           ? 'bg-primary text-primary-foreground border-primary shadow' 
140 |                           : 'bg-background border-border text-muted-foreground hover:bg-accent'
141 |                     } focus:outline-none focus:ring-2 focus:ring-primary/30`}
142 |                   >
143 |                     <Globe className="h-5 w-5" />
144 |                   </button>
145 |                 </TooltipTrigger>
146 |                 <TooltipContent sideOffset={8}>
147 |                   {getWebSearchTooltipMessage()}
148 |                 </TooltipContent>
149 |               </Tooltip>
150 |             </div>
151 |           )}
152 |         </div>
153 |       </div>
154 |       <button
155 |         type={isStreaming ? "button" : "submit"}
156 |         onClick={isStreaming ? stop : undefined}
157 |         disabled={(!isStreaming && !input.trim()) || (isStreaming && status === "submitted")}
158 |         className="absolute right-2 bottom-2 rounded-full p-2 bg-primary hover:bg-primary/90 disabled:bg-muted/60 disabled:border disabled:border-border disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
159 |       >
160 |         {isStreaming ? (
161 |           <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
162 |         ) : (
163 |           <ArrowUp className={`h-4 w-4 ${(!isStreaming && !input.trim()) ? 'text-muted-foreground' : 'text-primary-foreground'}`} />
164 |         )}
165 |       </button>
166 |     </div>
167 |   );
168 | };
```

components/theme-provider.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import { ThemeProvider as NextThemesProvider } from "next-themes"
5 | import { type ThemeProviderProps } from "next-themes"
6 | 
7 | export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
8 |   return (
9 |     <NextThemesProvider {...props}>
10 |       {children}
11 |     </NextThemesProvider>
12 |   );
13 | } 
```

components/theme-toggle.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import { CircleDashed, Flame, Sun, TerminalSquare, CassetteTape, Leaf } from "lucide-react"
5 | import { useTheme } from "next-themes"
6 | import { Button } from "./ui/button"
7 | import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
8 | import { cn } from "@/lib/utils"
9 | 
10 | // Add a 'trigger' prop to the interface
11 | interface ThemeToggleProps extends Omit<React.ComponentProps<typeof Button>, 'asChild'> {
12 |   trigger?: React.ReactNode;
13 |   showLabel?: boolean;
14 |   labelText?: React.ReactNode;
15 | }
16 | 
17 | export function ThemeToggle({ className, trigger, showLabel, labelText, ...props }: ThemeToggleProps) {
18 |   const { setTheme, theme, resolvedTheme } = useTheme()
19 | 
20 |   // Determine the icon to display
21 |   let IconComponent;
22 |   const iconClassName = "h-4 w-4 flex-shrink-0 text-muted-foreground";
23 | 
24 |   // Use `theme` if it's one of the explicit themes we set
25 |   // Otherwise, rely on `resolvedTheme` which handles 'system' or initial undefined `theme`
26 |   const activeTheme = (theme && theme !== 'system') ? theme : resolvedTheme;
27 | 
28 |   switch (activeTheme) {
29 |     case "light":
30 |       IconComponent = <Sun className={iconClassName} />;
31 |       break;
32 |     case "dark":
33 |       IconComponent = <Flame className={iconClassName} />;
34 |       break;
35 |     case "black":
36 |       IconComponent = <CircleDashed className={iconClassName} />;
37 |       break;
38 |     case "sunset":
39 |       IconComponent = <Sun className={iconClassName} />; // Using Sun for sunset
40 |       break;
41 |     case "cyberpunk":
42 |       IconComponent = <TerminalSquare className={iconClassName} />;
43 |       break;
44 |     case "retro":
45 |       IconComponent = <CassetteTape className={iconClassName} />;
46 |       break;
47 |     case "nature":
48 |       IconComponent = <Leaf className={iconClassName} />;
49 |       break;
50 |     default:
51 |       // Fallback if activeTheme is somehow still not recognized
52 |       IconComponent = <Flame className={iconClassName} />; // Default to Flame
53 |   }
54 | 
55 |   // Conditionally render the trigger or the default button
56 |   const TriggerComponent = trigger ? (
57 |     <DropdownMenuTrigger asChild={true}>{trigger}</DropdownMenuTrigger>
58 |   ) : (
59 |     <DropdownMenuTrigger asChild={!showLabel || !labelText}>
60 |       {showLabel && labelText ? (
61 |         <div className={cn("flex items-center gap-2", className)}>
62 |           {IconComponent}
63 |           {labelText}
64 |         </div>
65 |       ) : (
66 |         <Button
67 |           variant="ghost"
68 |           size="icon"
69 |           className={cn("rounded-md", className)}
70 |           {...props}
71 |         >
72 |           {IconComponent}
73 |           <span className="sr-only">Toggle theme</span>
74 |         </Button>
75 |       )}
76 |     </DropdownMenuTrigger>
77 |   );
78 | 
79 |   return (
80 |     <DropdownMenu>
81 |       {TriggerComponent}
82 |       <DropdownMenuContent align="end">
83 |         <DropdownMenuItem onSelect={() => setTheme("dark")}>
84 |           <Flame className="mr-2 h-4 w-4" />
85 |           <span>Dark</span>
86 |         </DropdownMenuItem>
87 |         <DropdownMenuItem onSelect={() => setTheme("light")}>
88 |           <Sun className="mr-2 h-4 w-4" />
89 |           <span>Light</span>
90 |         </DropdownMenuItem>
91 |         <DropdownMenuItem onSelect={() => setTheme("black")}>
92 |           <CircleDashed className="mr-2 h-4 w-4" />
93 |           <span>Black</span>
94 |         </DropdownMenuItem>
95 |         <DropdownMenuItem onSelect={() => setTheme("sunset")}>
96 |           <Sun className="mr-2 h-4 w-4" />
97 |           <span>Sunset</span>
98 |         </DropdownMenuItem>
99 |         <DropdownMenuItem onSelect={() => setTheme("cyberpunk")}>
100 |           <TerminalSquare className="mr-2 h-4 w-4" />
101 |           <span>Cyberpunk</span>
102 |         </DropdownMenuItem>
103 |         <DropdownMenuItem onSelect={() => setTheme("retro")}>
104 |           <CassetteTape className="mr-2 h-4 w-4" />
105 |           <span>Retro</span>
106 |         </DropdownMenuItem>
107 |         <DropdownMenuItem onSelect={() => setTheme("nature")}>
108 |           <Leaf className="mr-2 h-4 w-4" />
109 |           <span>Nature</span>
110 |         </DropdownMenuItem>
111 |       </DropdownMenuContent>
112 |     </DropdownMenu>
113 |   )
114 | }
```

components/tool-invocation.tsx
```
1 | "use client";
2 | 
3 | import { useState } from "react";
4 | import { motion, AnimatePresence } from "motion/react";
5 | import {
6 |   ChevronDownIcon,
7 |   ChevronUpIcon,
8 |   Loader2,
9 |   CheckCircle2,
10 |   TerminalSquare,
11 |   Code,
12 |   ArrowRight,
13 |   Circle,
14 | } from "lucide-react";
15 | import { cn } from "@/lib/utils";
16 | 
17 | interface ToolInvocationProps {
18 |   toolName: string;
19 |   state: string;
20 |   args: any;
21 |   result: any;
22 |   isLatestMessage: boolean;
23 |   status: string;
24 | }
25 | 
26 | export function ToolInvocation({
27 |   toolName,
28 |   state,
29 |   args,
30 |   result,
31 |   isLatestMessage,
32 |   status,
33 | }: ToolInvocationProps) {
34 |   const [isExpanded, setIsExpanded] = useState(false);
35 | 
36 |   const variants = {
37 |     collapsed: {
38 |       height: 0,
39 |       opacity: 0,
40 |     },
41 |     expanded: {
42 |       height: "auto",
43 |       opacity: 1,
44 |     },
45 |   };
46 | 
47 |   const getStatusIcon = () => {
48 |     if (state === "call") {
49 |       if (isLatestMessage && status !== "ready") {
50 |         return <Loader2 className="animate-spin h-3.5 w-3.5 text-primary/70" />;
51 |       }
52 |       return <Circle className="h-3.5 w-3.5 fill-muted-foreground/10 text-muted-foreground/70" />;
53 |     }
54 |     return <CheckCircle2 size={14} className="text-primary/90" />;
55 |   };
56 | 
57 |   const getStatusClass = () => {
58 |     if (state === "call") {
59 |       if (isLatestMessage && status !== "ready") {
60 |         return "text-primary";
61 |       }
62 |       return "text-muted-foreground";
63 |     }
64 |     return "text-primary";
65 |   };
66 | 
67 |   const formatContent = (content: any): string => {
68 |     try {
69 |       if (typeof content === "string") {
70 |         try {
71 |           const parsed = JSON.parse(content);
72 |           return JSON.stringify(parsed, null, 2);
73 |         } catch {
74 |           return content;
75 |         }
76 |       }
77 |       return JSON.stringify(content, null, 2);
78 |     } catch {
79 |       return String(content);
80 |     }
81 |   };
82 | 
83 |   return (
84 |     <div className={cn(
85 |       "flex flex-col mb-2 rounded-md border border-border/50 overflow-hidden",
86 |       "bg-gradient-to-b from-background to-muted/30 backdrop-blur-sm",
87 |       "transition-all duration-200 hover:border-border/80 group"
88 |     )}>
89 |       <div 
90 |         className={cn(
91 |           "flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors",
92 |           "hover:bg-muted/20"
93 |         )}
94 |         onClick={() => setIsExpanded(!isExpanded)}
95 |       >
96 |         <div className="flex items-center justify-center rounded-full w-5 h-5 bg-primary/5 text-primary">
97 |           <TerminalSquare className="h-3.5 w-3.5" />
98 |         </div>
99 |         <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground flex-1">
100 |           <span className="text-foreground font-semibold tracking-tight">{toolName}</span>
101 |           <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
102 |           <span className={cn("font-medium", getStatusClass())}>
103 |             {state === "call" ? (isLatestMessage && status !== "ready" ? "Running" : "Waiting") : "Completed"}
104 |           </span>
105 |         </div>
106 |         <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity sm:opacity-70 sm:group-hover:opacity-100 opacity-100">
107 |           {getStatusIcon()}
108 |           <div className="bg-muted/30 rounded-full p-0.5 border border-border/30">
109 |             {isExpanded ? (
110 |               <ChevronUpIcon className="h-3 w-3 text-foreground/70" />
111 |             ) : (
112 |               <ChevronDownIcon className="h-3 w-3 text-foreground/70" />
113 |             )}
114 |           </div>
115 |         </div>
116 |       </div>
117 | 
118 |       <AnimatePresence initial={false}>
119 |         {isExpanded && (
120 |           <motion.div
121 |             initial="collapsed"
122 |             animate="expanded"
123 |             exit="collapsed"
124 |             variants={variants}
125 |             transition={{ duration: 0.2 }}
126 |             className="space-y-2 px-3 pb-3"
127 |           >
128 |             {!!args && (
129 |               <div className="space-y-1.5">
130 |                 <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 pt-1.5">
131 |                   <Code className="h-3 w-3" />
132 |                   <span className="font-medium">Arguments</span>
133 |                 </div>
134 |                 <pre className={cn(
135 |                   "text-xs font-mono p-2.5 rounded-md overflow-x-auto",
136 |                   "border border-border/40 bg-muted/10"
137 |                 )}>
138 |                   {formatContent(args)}
139 |                 </pre>
140 |               </div>
141 |             )}
142 |             
143 |             {!!result && (
144 |               <div className="space-y-1.5">
145 |                 <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
146 |                   <ArrowRight className="h-3 w-3" />
147 |                   <span className="font-medium">Result</span>
148 |                 </div>
149 |                 <pre className={cn(
150 |                   "text-xs font-mono p-2.5 rounded-md overflow-x-auto max-h-[300px] overflow-y-auto",
151 |                   "border border-border/40 bg-muted/10"
152 |                 )}>
153 |                   {formatContent(result)}
154 |                 </pre>
155 |               </div>
156 |             )}
157 |           </motion.div>
158 |         )}
159 |       </AnimatePresence>
160 |     </div>
161 |   );
162 | } 
```

components/top-nav.tsx
```
1 | "use client";
2 | 
3 | import { useRouter } from "next/navigation";
4 | import { PlusCircle } from "lucide-react";
5 | import { Button } from "@/components/ui/button";
6 | import { SidebarTrigger } from "@/components/ui/sidebar";
7 | import Image from "next/image";
8 | 
9 | export function TopNav() {
10 |   const router = useRouter();
11 | 
12 |   const handleNewChat = () => {
13 |     router.push('/');
14 |   };
15 | 
16 |   return (
17 |     <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40 px-4 py-2 flex items-center gap-2">
18 |       <SidebarTrigger>
19 |         <button className="flex items-center justify-center h-8 w-8 bg-muted hover:bg-accent rounded-md transition-colors">
20 |           <Image src="/logo.png" alt="ChatLima logo" width={16} height={16} />
21 |         </button>
22 |       </SidebarTrigger>
23 |       <Button
24 |         variant="ghost"
25 |         size="icon"
26 |         className="flex items-center justify-center h-8 w-8 bg-muted hover:bg-accent rounded-md transition-colors"
27 |         onClick={handleNewChat}
28 |         title="New Chat"
29 |       >
30 |         <PlusCircle className="h-4 w-4" />
31 |       </Button>
32 |     </nav>
33 |   );
34 | } 
```

components/web-search-suggestion.tsx
```
1 | "use client";
2 | 
3 | import { useState, useEffect } from "react";
4 | import { X, Lightbulb, Globe } from "lucide-react";
5 | import { useWebSearch } from "@/lib/context/web-search-context";
6 | import { WEB_SEARCH_COST } from "@/lib/tokenCounter";
7 | import { motion, AnimatePresence } from "framer-motion";
8 | 
9 | interface WebSearchSuggestionProps {
10 |   messageId: string;
11 |   hasWebSearchResults?: boolean;
12 | }
13 | 
14 | export function WebSearchSuggestion({ messageId, hasWebSearchResults }: WebSearchSuggestionProps) {
15 |   const [dismissed, setDismissed] = useState(false);
16 |   const [showSuggestion, setShowSuggestion] = useState(false);
17 |   const { webSearchEnabled, setWebSearchEnabled } = useWebSearch();
18 | 
19 |   // Show suggestion only if:
20 |   // 1. Web search is currently enabled
21 |   // 2. Message has web search results (indicates this was a web search response)
22 |   // 3. User hasn't dismissed it
23 |   useEffect(() => {
24 |     if (webSearchEnabled && hasWebSearchResults && !dismissed) {
25 |       setShowSuggestion(true);
26 |     } else {
27 |       setShowSuggestion(false);
28 |     }
29 |   }, [webSearchEnabled, hasWebSearchResults, dismissed, messageId]);
30 | 
31 |   // Reset dismissed state when web search is toggled back on
32 |   useEffect(() => {
33 |     if (!webSearchEnabled) {
34 |       setDismissed(false);
35 |     }
36 |   }, [webSearchEnabled]);
37 | 
38 |   const handleDisableWebSearch = () => {
39 |     setWebSearchEnabled(false);
40 |     setDismissed(true);
41 |   };
42 | 
43 |   const handleDismiss = () => {
44 |     setDismissed(true);
45 |   };
46 | 
47 |   if (!showSuggestion) return null;
48 | 
49 |   return (
50 |     <AnimatePresence>
51 |       <motion.div
52 |         key={`suggestion-${messageId}`}
53 |         initial={{ opacity: 0, y: 10, scale: 0.95 }}
54 |         animate={{ opacity: 1, y: 0, scale: 1 }}
55 |         exit={{ opacity: 0, y: -10, scale: 0.95 }}
56 |         transition={{ duration: 0.3, ease: "easeInOut" }}
57 |         className="mt-3 p-3 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-700/40 rounded-lg"
58 |       >
59 |         <div className="flex items-start gap-3">
60 |           <div className="flex-shrink-0 mt-0.5">
61 |             <div className="p-1 bg-blue-100 dark:bg-blue-800/40 rounded-full">
62 |               <Lightbulb className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
63 |             </div>
64 |           </div>
65 |           
66 |           <div className="flex-1 min-w-0">
67 |             <div className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
68 |               Save credits on follow-up questions
69 |             </div>
70 |             <div className="text-xs text-blue-700 dark:text-blue-200 mb-3 leading-relaxed">
71 |               Follow-up questions about these results don&apos;t need web search. 
72 |               Disable it to save {WEB_SEARCH_COST} credits per message.
73 |             </div>
74 |             
75 |             <div className="flex items-center gap-2">
76 |               <button
77 |                 onClick={handleDisableWebSearch}
78 |                 className="inline-flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-full transition-colors duration-150 font-medium"
79 |               >
80 |                 <Globe className="h-3 w-3" />
81 |                 Disable Web Search
82 |               </button>
83 |               <button
84 |                 onClick={handleDismiss}
85 |                 className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-150"
86 |               >
87 |                 Keep enabled
88 |               </button>
89 |             </div>
90 |           </div>
91 |           
92 |           <button
93 |             onClick={handleDismiss}
94 |             className="flex-shrink-0 p-1 text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300 transition-colors duration-150"
95 |             aria-label="Dismiss suggestion"
96 |           >
97 |             <X className="h-3.5 w-3.5" />
98 |           </button>
99 |         </div>
100 |       </motion.div>
101 |     </AnimatePresence>
102 |   );
103 | } 
```

drizzle/0000_supreme_rocket_raccoon.sql
```
1 | CREATE TABLE "chats" (
2 | 	"id" text PRIMARY KEY NOT NULL,
3 | 	"title" text DEFAULT 'New Chat' NOT NULL,
4 | 	"created_at" timestamp DEFAULT now() NOT NULL,
5 | 	"updated_at" timestamp DEFAULT now() NOT NULL
6 | );
7 | --> statement-breakpoint
8 | CREATE TABLE "messages" (
9 | 	"id" text PRIMARY KEY NOT NULL,
10 | 	"chat_id" text NOT NULL,
11 | 	"content" text NOT NULL,
12 | 	"role" text NOT NULL,
13 | 	"created_at" timestamp DEFAULT now() NOT NULL
14 | );
15 | --> statement-breakpoint
16 | ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;
```

drizzle/0001_curious_paper_doll.sql
```
1 | CREATE TABLE "users" (
2 | 	"id" text PRIMARY KEY NOT NULL,
3 | 	"client_id" text NOT NULL,
4 | 	"created_at" timestamp DEFAULT now() NOT NULL,
5 | 	"updated_at" timestamp DEFAULT now() NOT NULL,
6 | 	CONSTRAINT "users_client_id_unique" UNIQUE("client_id")
7 | );
8 | --> statement-breakpoint
9 | ALTER TABLE "chats" ADD COLUMN "user_id" text;--> statement-breakpoint
10 | ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
```

drizzle/0002_free_cobalt_man.sql
```
1 | CREATE TABLE "steps" (
2 | 	"id" text PRIMARY KEY NOT NULL,
3 | 	"message_id" text NOT NULL,
4 | 	"step_type" text NOT NULL,
5 | 	"text" text,
6 | 	"reasoning" text,
7 | 	"finish_reason" text,
8 | 	"created_at" timestamp DEFAULT now() NOT NULL,
9 | 	"tool_calls" json,
10 | 	"tool_results" json
11 | );
12 | --> statement-breakpoint
13 | ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
14 | DROP TABLE "users" CASCADE;--> statement-breakpoint
15 | ALTER TABLE "chats" DROP CONSTRAINT "chats_user_id_users_id_fk";
16 | --> statement-breakpoint
17 | ALTER TABLE "chats" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
18 | ALTER TABLE "messages" ADD COLUMN "reasoning" text;--> statement-breakpoint
19 | ALTER TABLE "messages" ADD COLUMN "tool_calls" json;--> statement-breakpoint
20 | ALTER TABLE "messages" ADD COLUMN "tool_results" json;--> statement-breakpoint
21 | ALTER TABLE "messages" ADD COLUMN "has_tool_use" boolean DEFAULT false;--> statement-breakpoint
22 | ALTER TABLE "steps" ADD CONSTRAINT "steps_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
```

drizzle/0003_oval_energizer.sql
```
1 | ALTER TABLE "steps" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
2 | DROP TABLE "steps" CASCADE;--> statement-breakpoint
3 | ALTER TABLE "messages" ALTER COLUMN "tool_calls" SET DATA TYPE jsonb;--> statement-breakpoint
4 | ALTER TABLE "messages" ALTER COLUMN "tool_results" SET DATA TYPE jsonb;--> statement-breakpoint
5 | ALTER TABLE "messages" ADD COLUMN "step_type" text;--> statement-breakpoint
6 | ALTER TABLE "messages" ADD COLUMN "finish_reason" text;--> statement-breakpoint
7 | ALTER TABLE "messages" DROP COLUMN "has_tool_use";
```

drizzle/0004_tense_ricochet.sql
```
1 | ALTER TABLE "messages" DROP COLUMN "reasoning";--> statement-breakpoint
2 | ALTER TABLE "messages" DROP COLUMN "tool_calls";--> statement-breakpoint
3 | ALTER TABLE "messages" DROP COLUMN "tool_results";--> statement-breakpoint
4 | ALTER TABLE "messages" DROP COLUMN "step_type";--> statement-breakpoint
5 | ALTER TABLE "messages" DROP COLUMN "finish_reason";
```

drizzle/0005_early_payback.sql
```
1 | ALTER TABLE "messages" ADD COLUMN "parts" json NOT NULL;--> statement-breakpoint
2 | ALTER TABLE "messages" DROP COLUMN "content";
```

drizzle/0007_update_verification_table.sql
```
1 | ALTER TABLE "verificationToken" RENAME TO "verification";--> statement-breakpoint
2 | ALTER TABLE "verification" RENAME COLUMN "expires" TO "expiresAt";--> statement-breakpoint
3 | ALTER TABLE "verification" DROP CONSTRAINT "verificationToken_token_unique";--> statement-breakpoint
4 | ALTER TABLE "verification" DROP CONSTRAINT "verificationToken_identifier_token_pk";--> statement-breakpoint
5 | ALTER TABLE "verification" ADD COLUMN "id" text PRIMARY KEY NOT NULL;--> statement-breakpoint
6 | ALTER TABLE "verification" ADD COLUMN "value" text NOT NULL;--> statement-breakpoint
7 | ALTER TABLE "verification" DROP COLUMN "token";
```

drizzle/0008_alter_accounts_expiresat_type.sql
```
1 | ALTER TABLE "account" ALTER COLUMN "expires_at" SET DATA TYPE timestamp USING to_timestamp(expires_at);
```

drizzle/0009_alter_users_emailverified_type.sql
```
1 | ALTER TABLE "user" ALTER COLUMN "emailVerified" SET DATA TYPE boolean USING ("emailVerified" IS NOT NULL);
```

drizzle/0010_optimal_jane_foster.sql
```
1 | -- ALTER TABLE "account" RENAME COLUMN "expires_at" TO "access_token_expires_at"; -- Already applied by previous push
2 | ALTER TABLE "account" ALTER COLUMN "access_token_expires_at" SET DATA TYPE integer USING EXTRACT(epoch FROM "access_token_expires_at")::integer;
```

drizzle/0011_fixed_cerebro.sql
```
1 | -- ALTER TABLE "account" DROP CONSTRAINT "account_providerId_accountId_pk"; --> statement-breakpoint -- Already dropped by previous push
2 | ALTER TABLE "account" ADD COLUMN "id" text PRIMARY KEY NOT NULL;
```

drizzle/0012_tearful_misty_knight.sql
```
1 | ALTER TABLE "account" ALTER COLUMN "access_token_expires_at" SET DATA TYPE timestamp USING to_timestamp("access_token_expires_at");
```

drizzle/0013_special_whirlwind.sql
```
1 | ALTER TABLE "account" ALTER COLUMN "providerType" DROP NOT NULL;
```

drizzle/0014_fair_praxagora.sql
```
1 | ALTER TABLE "session" RENAME COLUMN "expires" TO "expiresAt";
```

drizzle/0015_remarkable_owl.sql
```
1 | -- First add the column as nullable
2 | ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "token" text;
3 | -- Then update existing records to use the sessionToken value
4 | UPDATE "session" SET "token" = "sessionToken" WHERE "token" IS NULL;
5 | -- Finally make the column NOT NULL if needed
6 | ALTER TABLE "session" ALTER COLUMN "token" SET NOT NULL;
```

drizzle/0016_cooing_lester.sql
```
1 | ALTER TABLE "session" DROP COLUMN "token";
```

drizzle/0017_past_bromley.sql
```
1 | DO $ 
2 | BEGIN
3 |     IF NOT EXISTS (
4 |         SELECT 1
5 |         FROM information_schema.columns
6 |         WHERE table_name = 'messages' AND column_name = 'has_web_search'
7 |     ) THEN
8 |         ALTER TABLE "messages" ADD COLUMN "has_web_search" boolean DEFAULT false;
9 |     END IF;
10 | END $;--> statement-breakpoint
11 | 
12 | DO $ 
13 | BEGIN
14 |     IF NOT EXISTS (
15 |         SELECT 1
16 |         FROM information_schema.columns
17 |         WHERE table_name = 'messages' AND column_name = 'web_search_context_size'
18 |     ) THEN
19 |         ALTER TABLE "messages" ADD COLUMN "web_search_context_size" text DEFAULT 'medium';
20 |     END IF;
21 | END $;
```

drizzle/0018_conscious_dragon_man.sql
```
1 | DO $ 
2 | BEGIN
3 |     IF NOT EXISTS (
4 |         SELECT 1
5 |         FROM information_schema.tables
6 |         WHERE table_name = 'polar_usage_events'
7 |     ) THEN
8 |         CREATE TABLE "polar_usage_events" (
9 |             "id" text PRIMARY KEY NOT NULL,
10 |             "user_id" text NOT NULL,
11 |             "polar_customer_id" text,
12 |             "event_name" text NOT NULL,
13 |             "event_payload" json NOT NULL,
14 |             "created_at" timestamp DEFAULT now() NOT NULL
15 |         );
16 |         
17 |         ALTER TABLE "polar_usage_events" ADD CONSTRAINT "polar_usage_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
18 |     END IF;
19 | END $;
```

drizzle/0018_manual_polar_events.sql
```
1 | -- Migration manually applied via Neon MCP
2 | -- This file is a placeholder to track that the polarUsageEvents table was created
3 | 
4 | -- CREATE TABLE was executed directly via Neon API
```

drizzle/0020_rainy_rockslide.sql
```
1 | ALTER TABLE "user" ADD COLUMN "isAnonymous" boolean DEFAULT false;
```

drizzle/0021_aberrant_baron_zemo.sql
```
1 | ALTER TABLE "user" ADD COLUMN "metadata" json;
```

hooks/use-mobile.ts
```
1 | import { useEffect, useState } from "react";
2 | 
3 | const MOBILE_BREAKPOINT = 768;
4 | 
5 | export const useIsMobile = () => {
6 |   const [isMobile, setIsMobile] = useState(false);
7 | 
8 |   useEffect(() => {
9 |     const checkDevice = () => {
10 |       setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
11 |     };
12 | 
13 |     checkDevice();
14 |     window.addEventListener("resize", checkDevice);
15 | 
16 |     return () => {
17 |       window.removeEventListener("resize", checkDevice);
18 |     };
19 |   }, []);
20 | 
21 |   return isMobile;
22 | };
23 | 
24 | export const useIsTouchDevice = () => {
25 |   const [isTouchDevice, setIsTouchDevice] = useState(false);
26 | 
27 |   useEffect(() => {
28 |     const checkTouchDevice = () => {
29 |       // Check if device supports touch and doesn't support hover (typical mobile/tablet)
30 |       const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
31 |       const hasHover = window.matchMedia('(hover: hover)').matches;
32 |       setIsTouchDevice(hasTouch && !hasHover);
33 |     };
34 | 
35 |     checkTouchDevice();
36 | 
37 |     // Listen for media query changes
38 |     const hoverQuery = window.matchMedia('(hover: hover)');
39 |     const pointerQuery = window.matchMedia('(pointer: coarse)');
40 | 
41 |     const handleChange = () => checkTouchDevice();
42 |     hoverQuery.addEventListener('change', handleChange);
43 |     pointerQuery.addEventListener('change', handleChange);
44 | 
45 |     return () => {
46 |       hoverQuery.removeEventListener('change', handleChange);
47 |       pointerQuery.removeEventListener('change', handleChange);
48 |     };
49 |   }, []);
50 | 
51 |   return isTouchDevice;
52 | };
```

hooks/useAuth.ts
```
1 | import { useEffect, useState, useCallback } from 'react';
2 | import { signIn, signOut, useSession } from '@/lib/auth-client';
3 | 
4 | type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'unauthenticated';
5 | 
6 | interface AuthUser {
7 |     id: string;
8 |     name?: string | null;
9 |     email?: string | null;
10 |     image?: string | null;
11 |     isAnonymous?: boolean;
12 |     messageLimit?: number;
13 |     messageRemaining?: number;
14 |     hasSubscription?: boolean;
15 |     credits?: number;
16 |     hasCredits?: boolean;
17 |     usedCredits?: boolean;
18 | }
19 | 
20 | export function useAuth() {
21 |     const { data: session, isPending } = useSession();
22 |     const [status, setStatus] = useState<AuthStatus>('loading');
23 |     const [user, setUser] = useState<AuthUser | null>(null);
24 |     const [error, setError] = useState<Error | null>(null);
25 | 
26 |     useEffect(() => {
27 |         if (isPending) {
28 |             setStatus('loading');
29 |             return;
30 |         }
31 | 
32 |         try {
33 |             if (session && session.user) {
34 |                 // If we have a user with ID, we're authenticated in some form
35 |                 if (session.user.id) {
36 |                     const isAnonymous = (session.user as any).isAnonymous === true;
37 | 
38 |                     setUser({
39 |                         id: session.user.id,
40 |                         name: session.user.name || null,
41 |                         email: session.user.email || null,
42 |                         image: session.user.image || null,
43 |                         isAnonymous: isAnonymous,
44 |                         // These values would be fetched separately from an API endpoint
45 |                         messageLimit: isAnonymous ? 10 : 20,
46 |                         messageRemaining: 0, // Would be updated via API
47 |                         hasSubscription: !!(session.user as any)?.metadata?.hasSubscription,
48 |                     });
49 | 
50 |                     setStatus(isAnonymous ? 'anonymous' : 'authenticated');
51 |                 } else {
52 |                     setStatus('unauthenticated');
53 |                     setUser(null);
54 |                 }
55 |             } else {
56 |                 // No session means not authenticated
57 |                 setStatus('unauthenticated');
58 |                 setUser(null);
59 |             }
60 |             setError(null);
61 |         } catch (err) {
62 |             setError(err instanceof Error ? err : new Error(String(err)));
63 |             setStatus('unauthenticated');
64 |             setUser(null);
65 |         }
66 |     }, [session, isPending]);
67 | 
68 |     // Get message usage data
69 |     const refreshMessageUsage = useCallback(async () => {
70 |         try {
71 |             const response = await fetch('/api/usage/messages');
72 |             if (response.ok) {
73 |                 const data = await response.json();
74 |                 setUser(prev => prev ? {
75 |                     ...prev,
76 |                     messageLimit: data.limit,
77 |                     messageRemaining: data.remaining,
78 |                     credits: data.credits,
79 |                     hasCredits: data.hasCredits,
80 |                     usedCredits: data.usedCredits
81 |                 } : null);
82 |             }
83 |         } catch (err) {
84 |             console.error('Failed to fetch message usage:', err);
85 |         }
86 |     }, []);
87 | 
88 |     // Auto-fetch credit information when user is available (for both authenticated and anonymous users)
89 |     useEffect(() => {
90 |         if (user && user.credits === undefined && (status === 'authenticated' || status === 'anonymous')) {
91 |             refreshMessageUsage();
92 |         }
93 |     }, [user?.id, status]); // Removed refreshMessageUsage from dependency array to prevent re-runs during hot reload
94 | 
95 |     // Sign in with Google
96 |     const handleSignIn = async () => {
97 |         try {
98 |             // Use Better Auth client to sign in with Google
99 |             await signIn.social({
100 |                 provider: 'google',
101 |                 callbackURL: window.location.origin
102 |             });
103 |         } catch (err) {
104 |             setError(err instanceof Error ? err : new Error(String(err)));
105 |         }
106 |     };
107 | 
108 |     // Sign out
109 |     const handleSignOut = async () => {
110 |         try {
111 |             // Use Better Auth client to sign out
112 |             await signOut();
113 | 
114 |             // Refresh the page to get new anonymous session
115 |             window.location.reload();
116 |         } catch (err) {
117 |             setError(err instanceof Error ? err : new Error(String(err)));
118 |         }
119 |     };
120 | 
121 | 
122 | 
123 |     return {
124 |         status,
125 |         user,
126 |         error,
127 |         signIn: handleSignIn,
128 |         signOut: handleSignOut,
129 |         refreshMessageUsage,
130 |         isLoading: status === 'loading',
131 |         isAuthenticated: status === 'authenticated',
132 |         isAnonymous: status === 'anonymous',
133 |     };
134 | } 
```

hooks/useCredits.ts
```
1 | import { useState, useEffect } from 'react';
2 | 
3 | /**
4 |  * Hook to get and manage a user's credits
5 |  * 
6 |  * @param polarCustomerId The customer's ID in Polar system (legacy) - deprecated, kept for compatibility
7 |  * @param userId The user's ID in our application (used as external ID in Polar)
8 |  * @returns Object containing the user's credits status and related functions
9 |  */
10 | export function useCredits(polarCustomerId?: string, userId?: string) {
11 |     const [credits, setCredits] = useState<number | null>(null);
12 |     const [loading, setLoading] = useState<boolean>(false);
13 |     const [error, setError] = useState<Error | null>(null);
14 | 
15 |     // Function to fetch credits via API endpoint
16 |     const fetchCredits = async () => {
17 |         // If no userId is provided, we can't fetch credits
18 |         if (!userId) {
19 |             console.log('[DEBUG] useCredits: No userId provided, setting credits to null');
20 |             setCredits(null);
21 |             return;
22 |         }
23 | 
24 |         console.log(`[DEBUG] useCredits: Fetching credits for userId: ${userId}`);
25 |         setLoading(true);
26 |         setError(null);
27 | 
28 |         try {
29 |             const response = await fetch('/api/credits');
30 | 
31 |             if (!response.ok) {
32 |                 throw new Error(`Failed to fetch credits: ${response.status}`);
33 |             }
34 | 
35 |             const data = await response.json();
36 |             console.log(`[DEBUG] useCredits: API response:`, data);
37 | 
38 |             if (data.error) {
39 |                 throw new Error(data.error);
40 |             }
41 | 
42 |             console.log(`[DEBUG] useCredits: Setting credits to: ${data.credits}`);
43 |             setCredits(data.credits);
44 |         } catch (err) {
45 |             console.error('Error fetching credits:', err);
46 |             setError(err instanceof Error ? err : new Error('Failed to fetch credits'));
47 |             setCredits(null);
48 |         } finally {
49 |             setLoading(false);
50 |         }
51 |     };
52 | 
53 |     // Fetch credits on mount and when IDs change
54 |     useEffect(() => {
55 |         fetchCredits();
56 |     }, [polarCustomerId, userId]);
57 | 
58 |     // Helper function to format credits display with thousands separator
59 |     const formattedCredits = credits !== null
60 |         ? credits.toLocaleString()
61 |         : 'Unknown';
62 | 
63 |     // Function to check if user has sufficient credits for an operation
64 |     const hasSufficientCredits = (requiredAmount: number = 1): boolean => {
65 |         if (credits === null) return true; // Allow if credits unknown
66 |         return credits >= requiredAmount;
67 |     };
68 | 
69 |     // Function to check if user can access premium models
70 |     const canAccessPremiumModels = (): boolean => {
71 |         const canAccess = credits !== null && credits > 0;
72 |         // console.log(`[DEBUG] canAccessPremiumModels: credits=${credits}, canAccess=${canAccess}`);
73 |         return canAccess;
74 |     };
75 | 
76 |     return {
77 |         credits,
78 |         formattedCredits,
79 |         loading,
80 |         error,
81 |         fetchCredits,
82 |         hasSufficientCredits,
83 |         canAccessPremiumModels,
84 |     };
85 | } 
```

lib/auth-client.ts
```
1 | "use client";
2 | 
3 | import { createAuthClient } from "better-auth/react"; // Use the React adapter
4 | import { anonymousClient } from "better-auth/client/plugins";
5 | 
6 | export const { signIn, signOut, useSession } = createAuthClient({
7 |     plugins: [
8 |         anonymousClient()
9 |     ]
10 | }); 
```

lib/auth.ts
```
1 | import { betterAuth } from 'better-auth';
2 | import { drizzleAdapter } from 'better-auth/adapters/drizzle';
3 | import { anonymous } from 'better-auth/plugins';
4 | import { db } from './db/index'; // Assuming your Drizzle instance is exported from here
5 | import * as schema from './db/schema'; // Assuming your full Drizzle schema is exported here
6 | import { Polar } from '@polar-sh/sdk';
7 | import { polar as polarPlugin } from '@polar-sh/better-auth';
8 | import { count, eq, and, gte } from 'drizzle-orm';
9 | import { getRemainingCreditsByExternalId } from './polar';
10 | 
11 | // Dynamic Google OAuth configuration based on environment
12 | const getGoogleOAuthConfig = () => {
13 |     const isProduction = process.env.NODE_ENV === 'production' &&
14 |         process.env.VERCEL_ENV === 'production';
15 | 
16 |     if (isProduction) {
17 |         // Production OAuth app
18 |         if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_PROD) {
19 |             throw new Error('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID_PROD environment variable');
20 |         }
21 |         if (!process.env.GOOGLE_CLIENT_SECRET_PROD) {
22 |             throw new Error('Missing GOOGLE_CLIENT_SECRET_PROD environment variable');
23 |         }
24 |         const config = {
25 |             clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_PROD,
26 |             clientSecret: process.env.GOOGLE_CLIENT_SECRET_PROD,
27 |         };
28 |         console.log('🔐 Using PRODUCTION Google OAuth client:', config.clientId);
29 |         return config;
30 |     } else {
31 |         // Development/Preview OAuth app
32 |         if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_DEV) {
33 |             throw new Error('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID_DEV environment variable');
34 |         }
35 |         if (!process.env.GOOGLE_CLIENT_SECRET_DEV) {
36 |             throw new Error('Missing GOOGLE_CLIENT_SECRET_DEV environment variable');
37 |         }
38 |         const config = {
39 |             clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_DEV,
40 |             clientSecret: process.env.GOOGLE_CLIENT_SECRET_DEV,
41 |         };
42 |         console.log('🔐 Using DEVELOPMENT Google OAuth client:', config.clientId);
43 |         return config;
44 |     }
45 | };
46 | 
47 | if (!process.env.AUTH_SECRET) {
48 |     throw new Error('Missing AUTH_SECRET environment variable');
49 | }
50 | if (!process.env.POLAR_ACCESS_TOKEN) {
51 |     throw new Error('Missing POLAR_ACCESS_TOKEN environment variable');
52 | }
53 | if (!process.env.POLAR_PRODUCT_ID) {
54 |     throw new Error('Missing POLAR_PRODUCT_ID environment variable');
55 | }
56 | if (!process.env.SUCCESS_URL) {
57 |     throw new Error('Missing SUCCESS_URL environment variable');
58 | }
59 | 
60 | // Polar server environment configuration
61 | // Use POLAR_SERVER_ENV if explicitly set, otherwise default to sandbox for safety
62 | const polarServerEnv = process.env.POLAR_SERVER_ENV === "production" ? "production" : "sandbox";
63 | 
64 | const polarClient = new Polar({
65 |     accessToken: process.env.POLAR_ACCESS_TOKEN,
66 |     server: polarServerEnv,
67 | });
68 | 
69 | // Dynamic trusted origins based on environment
70 | const getTrustedOrigins = () => {
71 |     const origins = [
72 |         'http://localhost:3000',
73 |         'https://www.chatlima.com',
74 |         'https://preview.chatlima.com'
75 |     ];
76 | 
77 |     // Add Vercel preview URLs
78 |     if (process.env.VERCEL_URL) {
79 |         origins.push(`https://${process.env.VERCEL_URL}`);
80 |     }
81 | 
82 |     // Add any Vercel deployment URLs (for preview deployments)
83 |     if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
84 |         origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
85 |     }
86 | 
87 |     // Allow all *.vercel.app domains for previews
88 |     origins.push('https://*.vercel.app');
89 | 
90 |     // Add any custom preview domain if specified
91 |     if (process.env.PREVIEW_DOMAIN) {
92 |         origins.push(`https://${process.env.PREVIEW_DOMAIN}`);
93 |         origins.push(`https://*.${process.env.PREVIEW_DOMAIN}`);
94 |     }
95 | 
96 |     console.log('🔐 Auth trusted origins configured:', origins);
97 | 
98 |     return origins;
99 | };
100 | 
101 | export const auth = betterAuth({
102 |     database: drizzleAdapter(db, {
103 |         provider: "pg",
104 |         // Explicitly pass the schema tables using the standard names
105 |         schema: {
106 |             user: schema.users,       // Use the exported const 'users'
107 |             account: schema.accounts, // Use the exported const 'accounts'
108 |             session: schema.sessions, // Use the exported const 'sessions'
109 |             verification: schema.verification // Updated from verificationTokens
110 |         },
111 |         // We might need to explicitly pass the schema tables here later
112 |         // schema: { ...schema } 
113 |         // Or potentially use this flag if table names are standard plurals
114 |         // usePlural: true
115 |     }),
116 |     secret: process.env.AUTH_SECRET,
117 |     sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
118 |     // Add session field mapping based on documentation
119 |     session: {
120 |         fields: {
121 |             token: "sessionToken" // Map internal token to sessionToken column
122 |             // If your expires column was different, you'd map expiresAt here too
123 |         }
124 |     },
125 |     trustedOrigins: getTrustedOrigins(),
126 |     socialProviders: {
127 |         google: {
128 |             ...getGoogleOAuthConfig(),
129 |             // Set higher message limit for authenticated users
130 |             onAccountCreated: async ({ user }: { user: any }) => {
131 |                 const oauthConfig = getGoogleOAuthConfig();
132 |                 console.log('[Google Provider] onAccountCreated: Triggered for user', user.id, 'using client:', oauthConfig.clientId);
133 |                 // Update user metadata to add higher message limit
134 |                 await db.update(schema.users)
135 |                     .set({
136 |                         metadata: {
137 |                             ...user.metadata,
138 |                             messageLimit: 20 // 20 messages per day for Google signed-in users
139 |                         }
140 |                     })
141 |                     .where(eq(schema.users.id, user.id));
142 | 
143 |                 return user;
144 |             }
145 |         },
146 |     },
147 |     plugins: [
148 |         anonymous({
149 |             emailDomainName: "anonymous.chatlima.com", // Use a proper domain for anonymous users
150 |             onLinkAccount: async ({ anonymousUser, newUser }) => {
151 |                 console.log('--- Anonymous Plugin onLinkAccount Fired ---');
152 |                 console.log('Anonymous User:', JSON.stringify(anonymousUser, null, 2));
153 |                 console.log('New User:', JSON.stringify(newUser, null, 2));
154 | 
155 |                 console.log('Linking anonymous user to authenticated user', {
156 |                     anonymousId: anonymousUser.user?.id,
157 |                     newUserId: newUser.user?.id
158 |                 });
159 |                 // Optional: Migrate any data from anonymousUser to newUser here
160 | 
161 |                 // ***** MOVED POLAR CUSTOMER CREATION LOGIC HERE *****
162 |                 const userForPolar = newUser.user; // Get the actual user object
163 | 
164 |                 // Ensure we have a valid user object and it's not anonymous
165 |                 // (though after linking, newUser.user should be the authenticated one)
166 |                 if (userForPolar && userForPolar.id && !userForPolar.isAnonymous) {
167 |                     console.log('[onLinkAccount] Processing Polar customer for authenticated user:', userForPolar.id, 'Email:', userForPolar.email);
168 |                     try {
169 |                         let polarCustomer;
170 |                         try {
171 |                             // Attempt to fetch customer by externalId (userForPolar.id from your app)
172 |                             polarCustomer = await polarClient.customers.getExternal({ externalId: userForPolar.id });
173 |                             console.log('[onLinkAccount] Found existing Polar customer by externalId:', polarCustomer.id, 'for user:', userForPolar.id);
174 | 
175 |                             // Optional: If found, ensure email matches or update if necessary
176 |                             if (polarCustomer.email !== userForPolar.email && userForPolar.email) {
177 |                                 console.log(`[onLinkAccount] Polar customer ${polarCustomer.id} has email ${polarCustomer.email}, app user has ${userForPolar.email}. Updating Polar customer's email.`);
178 |                                 await polarClient.customers.updateExternal({
179 |                                     externalId: userForPolar.id,
180 |                                     customerUpdateExternalID: { email: userForPolar.email, name: userForPolar.name }
181 |                                 });
182 |                                 console.log('[onLinkAccount] Polar customer email updated for externalId:', userForPolar.id);
183 |                             }
184 | 
185 |                         } catch (error: any) {
186 |                             if (error.name === 'ResourceNotFound' || error.statusCode === 404 || (error.response && error.response.status === 404)) {
187 |                                 console.log('[onLinkAccount] No Polar customer found with externalId:', userForPolar.id, '. Attempting to create.');
188 | 
189 |                                 try {
190 |                                     polarCustomer = await polarClient.customers.create({
191 |                                         email: userForPolar.email,
192 |                                         name: userForPolar.name,
193 |                                         externalId: userForPolar.id
194 |                                     });
195 |                                     console.log('[onLinkAccount] Polar customer created successfully:', polarCustomer.id, 'with externalId:', userForPolar.id);
196 |                                 } catch (createError: any) {
197 |                                     console.error('[onLinkAccount] Failed to create Polar customer for user:', userForPolar.id, '. Create Error:', createError);
198 |                                     if (createError.response && createError.response.data) {
199 |                                         console.error('[onLinkAccount] Polar API error details:', createError.response.data);
200 |                                     }
201 |                                 }
202 |                             } else {
203 |                                 console.error('[onLinkAccount] Error fetching Polar customer by externalId for user:', userForPolar.id, 'Fetch Error:', error);
204 |                                 if (error.response && error.response.data) {
205 |                                     console.error('[onLinkAccount] Polar API error details:', error.response.data);
206 |                                 }
207 |                             }
208 |                         }
209 |                     } catch (error) {
210 |                         console.error('[onLinkAccount] Unhandled error in Polar processing for user:', userForPolar.id, 'Error:', error);
211 |                     }
212 |                 } else {
213 |                     console.log('[onLinkAccount] Skipping Polar customer processing for user:', userForPolar?.id, 'isAnonymous:', userForPolar?.isAnonymous);
214 |                 }
215 |             },
216 |         }),
217 |         polarPlugin({
218 |             client: polarClient,
219 |             createCustomerOnSignUp: false,
220 |             // onAccountCreated: async ({ user }: { user: { id: string, email: string, name?: string, isAnonymous?: boolean } }) => {
221 |             //     console.log('[Polar Plugin] onAccountCreated: Triggered for user', user.id); // THIS WAS NOT FIRING
222 |             //     // ...  previous logic commented out as it's moved ...
223 |             //     return user;
224 |             // },
225 |             enableCustomerPortal: true,
226 |             checkout: {
227 |                 enabled: true,
228 |                 products: [
229 |                     {
230 |                         productId: process.env.POLAR_PRODUCT_ID || '',
231 |                         slug: 'ai-usage',
232 |                         // Remove name and description as they're not part of the expected type
233 |                     }
234 |                 ],
235 |                 successUrl: process.env.SUCCESS_URL,
236 |             },
237 |             webhooks: {
238 |                 secret: process.env.POLAR_WEBHOOK_SECRET || '', // Use empty string if not set yet
239 |                 onPayload: async (payload) => {
240 |                     console.log('Polar webhook received:', payload.type);
241 |                 },
242 |                 // Add specific event handlers
243 |                 onSubscriptionCreated: async (payload) => {
244 |                     console.log('Subscription created:', payload.data.id);
245 |                     // Credits will be managed by Polar meter
246 |                 },
247 |                 onOrderCreated: async (payload) => {
248 |                     console.log('Order created:', payload.data.id);
249 |                 },
250 |                 onSubscriptionCanceled: async (payload) => {
251 |                     console.log('Subscription canceled:', payload.data.id);
252 |                 },
253 |                 onSubscriptionRevoked: async (payload) => {
254 |                     console.log('Subscription revoked:', payload.data.id);
255 |                 }
256 |             },
257 |         }),
258 |     ],
259 |     // session: { ... } // Potentially configure session strategy if needed
260 | });
261 | 
262 | // Helper to check if user has reached their daily message or credit limit
263 | export async function checkMessageLimit(userId: string, isAnonymous: boolean): Promise<{
264 |     hasReachedLimit: boolean;
265 |     limit: number;
266 |     remaining: number;
267 |     credits?: number | null;
268 |     usedCredits?: boolean;
269 | }> {
270 |     try {
271 |         // 1. Check Polar credits (for authenticated users only)
272 |         if (!isAnonymous) {
273 |             const credits = await getRemainingCreditsByExternalId(userId);
274 |             if (typeof credits === 'number') {
275 |                 // If user has negative credits, block them
276 |                 if (credits < 0) {
277 |                     return {
278 |                         hasReachedLimit: true,
279 |                         limit: 0,
280 |                         remaining: 0,
281 |                         credits,
282 |                         usedCredits: true
283 |                     };
284 |                 }
285 |                 // If user has positive credits, allow usage and show credits left
286 |                 if (credits > 0) {
287 |                     return {
288 |                         hasReachedLimit: false,
289 |                         limit: 250, // Soft cap for display, actual limit is credits
290 |                         remaining: credits,
291 |                         credits,
292 |                         usedCredits: true
293 |                     };
294 |                 }
295 |                 // If credits === 0, fall through to daily message limit
296 |             }
297 |         }
298 | 
299 |         // 2. If no credits (or anonymous), use daily message limit
300 |         // Get user info
301 |         const user = await db.query.users.findFirst({
302 |             where: eq(schema.users.id, userId)
303 |         });
304 | 
305 |         // Set daily limits
306 |         let messageLimit = isAnonymous ? 10 : 20;
307 |         if (!isAnonymous && user) {
308 |             messageLimit = (user as any).metadata?.messageLimit || 20;
309 |         }
310 | 
311 |         // Count today's messages for this user
312 |         const startOfDay = new Date();
313 |         startOfDay.setHours(0, 0, 0, 0);
314 | 
315 |         const messageCount = await db.select({ count: count() })
316 |             .from(schema.messages)
317 |             .innerJoin(schema.chats, eq(schema.chats.id, schema.messages.chatId))
318 |             .where(
319 |                 and(
320 |                     eq(schema.chats.userId, userId),
321 |                     gte(schema.messages.createdAt, startOfDay),
322 |                     eq(schema.messages.role, 'user')
323 |                 )
324 |             )
325 |             .execute()
326 |             .then(result => result[0]?.count || 0);
327 | 
328 |         return {
329 |             hasReachedLimit: messageCount >= messageLimit,
330 |             limit: messageLimit,
331 |             remaining: Math.max(0, messageLimit - messageCount),
332 |             credits: 0,
333 |             usedCredits: false
334 |         };
335 |     } catch (error) {
336 |         console.error('Error checking message limit:', error);
337 |         // Default to allowing messages if there's an error
338 |         return { hasReachedLimit: false, limit: 10, remaining: 10 };
339 |     }
340 | }
```

lib/chat-store.ts
```
1 | import { db } from "./db";
2 | import { chats, messages, type Chat, type Message, MessageRole, type MessagePart, type DBMessage } from "./db/schema";
3 | import { eq, desc, and } from "drizzle-orm";
4 | import { nanoid } from "nanoid";
5 | import { generateTitle } from "@/app/actions";
6 | import type { TextUIPart, ToolInvocationUIPart, WebSearchCitation } from "./types";
7 | import type { ReasoningUIPart, SourceUIPart, FileUIPart, StepStartUIPart } from "@ai-sdk/ui-utils";
8 | 
9 | type AIMessage = {
10 |   role: string;
11 |   content: string | any[];
12 |   id?: string;
13 |   parts?: Array<TextUIPart | ToolInvocationUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
14 |   hasWebSearch?: boolean;
15 |   webSearchContextSize?: 'low' | 'medium' | 'high';
16 | };
17 | 
18 | type UIMessage = {
19 |   id: string;
20 |   role: string;
21 |   content: string;
22 |   parts: Array<TextUIPart | ToolInvocationUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
23 |   createdAt?: Date;
24 |   hasWebSearch?: boolean;
25 |   webSearchContextSize?: 'low' | 'medium' | 'high';
26 | };
27 | 
28 | type SaveChatParams = {
29 |   id?: string;
30 |   userId: string;
31 |   messages?: any[];
32 |   title?: string;
33 |   selectedModel?: string;
34 |   apiKeys?: Record<string, string>;
35 | };
36 | 
37 | type ChatWithMessages = Chat & {
38 |   messages: Message[];
39 | };
40 | 
41 | export async function saveMessages({
42 |   messages: dbMessages,
43 | }: {
44 |   messages: Array<DBMessage>;
45 | }) {
46 |   try {
47 |     if (dbMessages.length > 0) {
48 |       const chatId = dbMessages[0].chatId;
49 | 
50 |       // First delete any existing messages for this chat
51 |       await db
52 |         .delete(messages)
53 |         .where(eq(messages.chatId, chatId));
54 | 
55 |       // Then insert the new messages
56 |       return await db.insert(messages).values(dbMessages);
57 |     }
58 |     return null;
59 |   } catch (error) {
60 |     console.error('Failed to save messages in database', error);
61 |     throw error;
62 |   }
63 | }
64 | 
65 | // Function to convert AI messages to DB format
66 | export function convertToDBMessages(aiMessages: AIMessage[], chatId: string): DBMessage[] {
67 |   return aiMessages.map(msg => {
68 |     // Use existing id or generate a new one
69 |     const messageId = msg.id || nanoid();
70 | 
71 |     // If msg has parts, use them directly
72 |     if (msg.parts) {
73 |       return {
74 |         id: messageId,
75 |         chatId,
76 |         role: msg.role,
77 |         parts: msg.parts,
78 |         hasWebSearch: msg.hasWebSearch || false,
79 |         webSearchContextSize: msg.webSearchContextSize || 'medium',
80 |         createdAt: new Date()
81 |       };
82 |     }
83 | 
84 |     // Otherwise, convert content to parts
85 |     let parts: Array<TextUIPart | ToolInvocationUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
86 | 
87 |     if (typeof msg.content === 'string') {
88 |       parts = [{ type: 'text', text: msg.content } as TextUIPart];
89 |     } else if (Array.isArray(msg.content)) {
90 |       if (msg.content.every(item => typeof item === 'object' && item !== null)) {
91 |         // Content is already in parts-like format
92 |         parts = msg.content as Array<TextUIPart | ToolInvocationUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
93 |       } else {
94 |         // Content is an array but not in parts format
95 |         parts = [{ type: 'text', text: JSON.stringify(msg.content) } as TextUIPart];
96 |       }
97 |     } else {
98 |       // Default case
99 |       parts = [{ type: 'text', text: String(msg.content) } as TextUIPart];
100 |     }
101 | 
102 |     return {
103 |       id: messageId,
104 |       chatId,
105 |       role: msg.role,
106 |       parts,
107 |       hasWebSearch: msg.hasWebSearch || false,
108 |       webSearchContextSize: msg.webSearchContextSize || 'medium',
109 |       createdAt: new Date()
110 |     };
111 |   });
112 | }
113 | 
114 | // Convert DB messages to UI format
115 | export function convertToUIMessages(dbMessages: Array<Message>): Array<UIMessage> {
116 |   return dbMessages.map((message) => ({
117 |     id: message.id,
118 |     parts: message.parts as Array<TextUIPart | ToolInvocationUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>,
119 |     role: message.role as string,
120 |     content: getTextContent(message), // For backward compatibility
121 |     createdAt: message.createdAt,
122 |     hasWebSearch: message.hasWebSearch || false,
123 |     webSearchContextSize: (message.webSearchContextSize || 'medium') as 'low' | 'medium' | 'high'
124 |   }));
125 | }
126 | 
127 | export async function saveChat({ id, userId, messages: aiMessages, title, selectedModel, apiKeys }: SaveChatParams) {
128 |   // Generate a new ID if one wasn't provided
129 |   const chatId = id || nanoid();
130 | 
131 |   // Check if title is provided, if not generate one
132 |   let chatTitle = title;
133 | 
134 |   // Generate title if messages are provided and no title is specified
135 |   if (aiMessages && aiMessages.length > 0) {
136 |     const hasEnoughMessages = aiMessages.length >= 2 &&
137 |       aiMessages.some(m => m.role === 'user') &&
138 |       aiMessages.some(m => m.role === 'assistant');
139 | 
140 |     if (!chatTitle || chatTitle === 'New Chat' || chatTitle === undefined) {
141 |       if (hasEnoughMessages) {
142 |         try {
143 |           // Use AI to generate a meaningful title based on conversation
144 |           chatTitle = await generateTitle(aiMessages, selectedModel, apiKeys);
145 |         } catch (error) {
146 |           console.error('Error generating title:', error);
147 |           // Fallback to basic title extraction if AI title generation fails
148 |           const firstUserMessage = aiMessages.find(m => m.role === 'user');
149 |           if (firstUserMessage) {
150 |             // Check for parts first (new format)
151 |             if (firstUserMessage.parts && Array.isArray(firstUserMessage.parts)) {
152 |               const textParts = firstUserMessage.parts.filter((p: MessagePart) => p.type === 'text' && p.text);
153 |               if (textParts.length > 0) {
154 |                 chatTitle = textParts[0].text?.slice(0, 50) || 'New Chat';
155 |                 if ((textParts[0].text?.length || 0) > 50) {
156 |                   chatTitle += '...';
157 |                 }
158 |               } else {
159 |                 chatTitle = 'New Chat';
160 |               }
161 |             }
162 |             // Fallback to content (old format)
163 |             else if (typeof firstUserMessage.content === 'string') {
164 |               chatTitle = firstUserMessage.content.slice(0, 50);
165 |               if (firstUserMessage.content.length > 50) {
166 |                 chatTitle += '...';
167 |               }
168 |             } else {
169 |               chatTitle = 'New Chat';
170 |             }
171 |           } else {
172 |             chatTitle = 'New Chat';
173 |           }
174 |         }
175 |       } else {
176 |         // Not enough messages for AI title, use first message
177 |         const firstUserMessage = aiMessages.find(m => m.role === 'user');
178 |         if (firstUserMessage) {
179 |           // Check for parts first (new format)
180 |           if (firstUserMessage.parts && Array.isArray(firstUserMessage.parts)) {
181 |             const textParts = firstUserMessage.parts.filter((p: MessagePart) => p.type === 'text' && p.text);
182 |             if (textParts.length > 0) {
183 |               chatTitle = textParts[0].text?.slice(0, 50) || 'New Chat';
184 |               if ((textParts[0].text?.length || 0) > 50) {
185 |                 chatTitle += '...';
186 |               }
187 |             } else {
188 |               chatTitle = 'New Chat';
189 |             }
190 |           }
191 |           // Fallback to content (old format)
192 |           else if (typeof firstUserMessage.content === 'string') {
193 |             chatTitle = firstUserMessage.content.slice(0, 50);
194 |             if (firstUserMessage.content.length > 50) {
195 |               chatTitle += '...';
196 |             }
197 |           } else {
198 |             chatTitle = 'New Chat';
199 |           }
200 |         } else {
201 |           chatTitle = 'New Chat';
202 |         }
203 |       }
204 |     }
205 |   } else {
206 |     chatTitle = chatTitle || 'New Chat';
207 |   }
208 | 
209 |   // Check if chat already exists
210 |   const existingChat = await db.query.chats.findFirst({
211 |     where: and(
212 |       eq(chats.id, chatId),
213 |       eq(chats.userId, userId)
214 |     ),
215 |   });
216 | 
217 |   if (existingChat) {
218 |     // Update existing chat
219 |     await db
220 |       .update(chats)
221 |       .set({
222 |         title: chatTitle,
223 |         updatedAt: new Date()
224 |       })
225 |       .where(and(
226 |         eq(chats.id, chatId),
227 |         eq(chats.userId, userId)
228 |       ));
229 |   } else {
230 |     // Create new chat
231 |     await db.insert(chats).values({
232 |       id: chatId,
233 |       userId,
234 |       title: chatTitle,
235 |       createdAt: new Date(),
236 |       updatedAt: new Date()
237 |     });
238 |   }
239 | 
240 |   return { id: chatId };
241 | }
242 | 
243 | // Helper to get just the text content for display
244 | export function getTextContent(message: Message): string {
245 |   try {
246 |     const parts = message.parts as MessagePart[];
247 |     return parts
248 |       .filter(part => part.type === 'text' && part.text)
249 |       .map(part => part.text)
250 |       .join('\n');
251 |   } catch (e) {
252 |     // If parsing fails, return empty string
253 |     return '';
254 |   }
255 | }
256 | 
257 | export async function getChats(userId: string) {
258 |   return await db.query.chats.findMany({
259 |     where: eq(chats.userId, userId),
260 |     orderBy: [desc(chats.updatedAt)]
261 |   });
262 | }
263 | 
264 | export async function getChatById(id: string, userId: string): Promise<ChatWithMessages | null> {
265 |   const chat = await db.query.chats.findFirst({
266 |     where: and(
267 |       eq(chats.id, id),
268 |       eq(chats.userId, userId)
269 |     ),
270 |   });
271 | 
272 |   if (!chat) return null;
273 | 
274 |   const chatMessages = await db.query.messages.findMany({
275 |     where: eq(messages.chatId, id),
276 |     orderBy: [messages.createdAt]
277 |   });
278 | 
279 |   return {
280 |     ...chat,
281 |     messages: chatMessages
282 |   };
283 | }
284 | 
285 | export async function deleteChat(id: string, userId: string) {
286 |   await db.delete(chats).where(
287 |     and(
288 |       eq(chats.id, id),
289 |       eq(chats.userId, userId)
290 |     )
291 |   );
292 | } 
```

lib/constants.ts
```
1 | /**
2 |  * Constants used throughout the application
3 |  */
4 | 
5 | // Local storage keys
6 | export const STORAGE_KEYS = {
7 |   MCP_SERVERS: "mcpServers",
8 |   SELECTED_MCP_SERVERS: "selectedMcpServers",
9 |   SIDEBAR_STATE: "sidebarState",
10 |   WEB_SEARCH: "webSearch"
11 | } as const; 
```

lib/polar.ts
```
1 | import { db } from './db';
2 | import { polarUsageEvents } from './db/schema';
3 | import { Polar } from '@polar-sh/sdk';
4 | import { nanoid } from 'nanoid';
5 | 
6 | // Polar server environment configuration
7 | // Use POLAR_SERVER_ENV if explicitly set, otherwise default to sandbox for safety
8 | const polarServerEnv = process.env.POLAR_SERVER_ENV === "production" ? "production" : "sandbox";
9 | 
10 | // Initialize Polar SDK client
11 | const polarClient = new Polar({
12 |     accessToken: process.env.POLAR_ACCESS_TOKEN as string,
13 |     server: polarServerEnv,
14 | });
15 | 
16 | /**
17 |  * Reports AI usage to Polar and logs it in the local database
18 |  * 
19 |  * @param userId The ID of the user in your local database
20 |  * @param tokenCount The number of completion tokens consumed
21 |  * @param polarCustomerId Optional - The customer's ID in the Polar system (deprecated, will be replaced by external_id)
22 |  * @param additionalProperties Optional - Any additional properties to include in the event payload
23 |  * @returns A promise that resolves when both the Polar API call and DB insertion are complete
24 |  */
25 | export async function reportAIUsage(
26 |     userId: string,
27 |     creditsToConsume: number, // Use the actual credits to consume, not hardcoded 1
28 |     polarCustomerId?: string,
29 |     additionalProperties: Record<string, any> = {}
30 | ) {
31 |     const eventName = 'message.processed'; // Changed from 'ai-usage'
32 |     const eventPayload = {
33 |         credits_consumed: creditsToConsume, // Use the actual credits passed in
34 |         ...additionalProperties
35 |     };
36 | 
37 |     try {
38 |         // 1. Try to get the customer by external ID first (using userId as external ID)
39 |         let customerId = polarCustomerId;
40 | 
41 |         if (!customerId) {
42 |             try {
43 |                 const customer = await getCustomerByExternalId(userId);
44 |                 if (customer) {
45 |                     customerId = customer.id;
46 |                 }
47 |             } catch (externalIdError) {
48 |                 console.warn(`Could not find Polar customer with external ID ${userId}:`, externalIdError);
49 |                 // Continue with regular flow, we'll try the map or just log locally
50 |             }
51 |         }
52 | 
53 |         // 2. Report to Polar (if we have a customer ID)
54 |         if (customerId) {
55 |             await polarClient.events.ingest({
56 |                 events: [
57 |                     {
58 |                         name: eventName,
59 |                         customerId: customerId,
60 |                         metadata: eventPayload
61 |                     }
62 |                 ]
63 |             });
64 |         }
65 | 
66 |         // 3. Log the event in our database regardless
67 |         try {
68 |             await db.insert(polarUsageEvents).values({
69 |                 id: nanoid(),
70 |                 userId,
71 |                 polarCustomerId: customerId, // Use the potentially found customerId from external ID
72 |                 eventName,
73 |                 eventPayload,
74 |                 createdAt: new Date()
75 |             });
76 |         } catch (dbError: any) {
77 |             // Check for foreign key constraint violation
78 |             if (dbError.code === '23503' && dbError.constraint?.includes('user_id')) {
79 |                 console.warn(`User ${userId} not found in database. Skipping usage tracking in DB.`);
80 |                 // Still return success since we reported to Polar if applicable
81 |                 return { success: true, userExistsInDB: false };
82 |             }
83 |             // Rethrow other database errors
84 |             throw dbError;
85 |         }
86 | 
87 |         return { success: true, userExistsInDB: true };
88 |     } catch (error) {
89 |         console.error('Error reporting AI usage to Polar:', error);
90 |         throw error;
91 |     }
92 | }
93 | 
94 | /**
95 |  * Gets a user's remaining credits from Polar using their external ID (app user ID)
96 |  * 
97 |  * @param userId The user's ID in our application (used as external ID in Polar)
98 |  * @returns A promise that resolves to the number of credits remaining, or null if there was an error
99 |  */
100 | export async function getRemainingCreditsByExternalId(userId: string): Promise<number | null> {
101 |     try {
102 |         console.log(`[DEBUG] Attempting to get credits for external ID: ${userId}`);
103 | 
104 |         // First try to get the customer state by external ID
105 |         const customerState = await polarClient.customers.getStateExternal({
106 |             externalId: userId
107 |         });
108 | 
109 |         console.log(`[DEBUG] Customer state response:`, JSON.stringify(customerState, null, 2));
110 | 
111 |         if (!customerState) {
112 |             console.log(`[DEBUG] No customer state found for external ID: ${userId}`);
113 |             return null;
114 |         }
115 | 
116 |         // Look for AI usage meter in the customer state
117 |         // The meter data is in activeMeters, not meters
118 |         const activeMeters = (customerState as any).activeMeters || [];
119 |         console.log(`[DEBUG] Found ${activeMeters.length} active meters for user ${userId}`);
120 | 
121 |         // Search for the correct "Message Credits Used" meter among active meters
122 |         for (const meter of activeMeters) {
123 |             console.log(`[DEBUG] Active meter:`, JSON.stringify(meter, null, 2));
124 | 
125 |             // Try to get the full meter details to check the name
126 |             if (meter.meterId) {
127 |                 try {
128 |                     const meterDetails = await polarClient.meters.get({
129 |                         id: meter.meterId
130 |                     });
131 |                     console.log(`[DEBUG] Meter details for ${meter.meterId}:`, JSON.stringify(meterDetails, null, 2));
132 | 
133 |                     if (meterDetails?.name === 'Message Credits Used') {
134 |                         const balance = meter.balance || 0;
135 |                         console.log(`[DEBUG] Found 'Message Credits Used' active meter with balance: ${balance}`);
136 |                         return balance;
137 |                     }
138 |                 } catch (meterError) {
139 |                     console.warn(`[DEBUG] Failed to get meter details for ${meter.meterId}:`, meterError);
140 |                 }
141 |             }
142 | 
143 |             // Fallback: check if the meter object has the nested structure
144 |             if (meter?.meter?.name === 'Message Credits Used') {
145 |                 const balance = meter.balance || 0;
146 |                 console.log(`[DEBUG] Found 'Message Credits Used' active meter with balance: ${balance}`);
147 |                 return balance;
148 |             }
149 |         }
150 | 
151 |         // Fallback: also check the legacy meters array (just in case)
152 |         const meters = (customerState as any).meters || [];
153 |         console.log(`[DEBUG] Found ${meters.length} legacy meters for user ${userId}`);
154 | 
155 |         for (const meter of meters) {
156 |             console.log(`[DEBUG] Legacy Meter:`, JSON.stringify(meter, null, 2));
157 |             if (meter?.meter?.name === 'Message Credits Used') {
158 |                 const balance = meter.balance || 0;
159 |                 console.log(`[DEBUG] Found 'Message Credits Used' meter with balance: ${balance}`);
160 |                 return balance;
161 |             }
162 |         }
163 | 
164 |         console.log(`[DEBUG] No active meters or legacy 'Message Credits Used' meter found`);
165 |         return null;
166 |     } catch (error) {
167 |         console.error(`Error getting credits for external ID ${userId}:`, error);
168 |         return null;
169 |     }
170 | }
171 | 
172 | /**
173 |  * Gets a user's remaining credits from Polar
174 |  * 
175 |  * @param polarCustomerId The customer's ID in the Polar system
176 |  * @returns A promise that resolves to the number of credits remaining, or null if there was an error
177 |  */
178 | export async function getRemainingCredits(polarCustomerId: string): Promise<number | null> {
179 |     try {
180 |         // Get the customer meters response - use 'any' to bypass type checking
181 |         // since the Polar SDK types may vary by version
182 |         const response: any = await polarClient.customerMeters.list({
183 |             customerId: polarCustomerId
184 |         });
185 | 
186 |         // Try to handle both paginated and non-paginated responses safely
187 |         const processResult = async (data: any): Promise<number | null> => {
188 |             // Check if data contains meters directly
189 |             if (Array.isArray(data)) {
190 |                 for (const meter of data) {
191 |                     if (meter?.meter?.name === 'Message Credits Used') { // New check
192 |                         return meter.balance || meter.remaining || 0;
193 |                     }
194 |                 }
195 |             }
196 | 
197 |             // Check if the data has nested items
198 |             if (data?.items && Array.isArray(data.items)) {
199 |                 for (const meter of data.items) {
200 |                     if (meter?.meter?.name === 'Message Credits Used') { // New check
201 |                         return meter.balance || meter.remaining || 0;
202 |                     }
203 |                 }
204 |             }
205 | 
206 |             return null;
207 |         };
208 | 
209 |         // First try to process the direct response
210 |         let result = await processResult(response);
211 |         if (result !== null) return result;
212 | 
213 |         // If that doesn't work, try to handle the paginated response
214 |         // by getting the first page explicitly
215 |         try {
216 |             // Attempt to get first page if the response is paginated
217 |             if (typeof response.next === 'function') {
218 |                 const firstPage = await response.next();
219 |                 if (firstPage?.value) {
220 |                     result = await processResult(firstPage.value);
221 |                     if (result !== null) return result;
222 |                 }
223 |             }
224 |         } catch (err) {
225 |             // Silently ignore pagination errors
226 |             console.warn('Error processing paginated response', err);
227 |         }
228 | 
229 |         console.warn(`No 'Message Credits Used' meter found for customer ${polarCustomerId}`); // Updated warning
230 |         return null;
231 |     } catch (error) {
232 |         console.error('Error getting remaining credits from Polar:', error);
233 |         return null;
234 |     }
235 | }
236 | 
237 | /**
238 |  * Gets a customer by their external ID (app user ID)
239 |  * 
240 |  * @param externalId The external ID (your app's user ID)
241 |  * @returns The customer object or null if not found
242 |  */
243 | export async function getCustomerByExternalId(externalId: string) {
244 |     try {
245 |         const customer = await polarClient.customers.getExternal({
246 |             externalId: externalId
247 |         });
248 |         return customer;
249 |     } catch (error) {
250 |         // If the customer doesn't exist, return null instead of throwing
251 |         if ((error as any)?.statusCode === 404) {
252 |             return null;
253 |         }
254 |         // Otherwise re-throw the error
255 |         throw error;
256 |     }
257 | }
258 | 
259 | /**
260 |  * Gets a customer by their email address
261 |  * 
262 |  * @param email The customer's email address
263 |  * @returns The customer object or null if not found
264 |  */
265 | export async function getCustomerByEmail(email: string) {
266 |     try {
267 |         console.log(`[getCustomerByEmail] Searching for customer with email: ${email}`);
268 | 
269 |         const response = await polarClient.customers.list({
270 |             email: email,
271 |             limit: 1
272 |         });
273 | 
274 |         console.log(`[getCustomerByEmail] Response type:`, typeof response);
275 | 
276 |         // Handle the paginated response - try direct iteration first
277 |         try {
278 |             for await (const customerResponse of response) {
279 |                 console.log(`[getCustomerByEmail] Raw iteration response:`, JSON.stringify(customerResponse, null, 2));
280 | 
281 |                 // The response might be wrapped in a result object
282 |                 const responseAny = customerResponse as any;
283 |                 if (responseAny.result && responseAny.result.items && Array.isArray(responseAny.result.items) && responseAny.result.items.length > 0) {
284 |                     const customer = responseAny.result.items[0];
285 |                     console.log(`[getCustomerByEmail] Found customer via result.items:`, JSON.stringify(customer, null, 2));
286 |                     return customer;
287 |                 }
288 | 
289 |                 // If it's already a customer object
290 |                 if (responseAny.id && responseAny.email) {
291 |                     console.log(`[getCustomerByEmail] Found customer directly:`, JSON.stringify(responseAny, null, 2));
292 |                     return responseAny;
293 |                 }
294 |             }
295 |         } catch (iterError) {
296 |             console.log(`[getCustomerByEmail] Iteration failed:`, iterError);
297 | 
298 |             // Fallback: Try to access response as any to bypass type checking
299 |             try {
300 |                 const responseAny = response as any;
301 |                 console.log(`[getCustomerByEmail] Response (as any):`, JSON.stringify(responseAny, null, 2));
302 | 
303 |                 // Check if response has result.items structure
304 |                 if (responseAny.result && responseAny.result.items && Array.isArray(responseAny.result.items) && responseAny.result.items.length > 0) {
305 |                     const customer = responseAny.result.items[0];
306 |                     console.log(`[getCustomerByEmail] Found customer via result.items fallback:`, JSON.stringify(customer, null, 2));
307 |                     return customer;
308 |                 }
309 | 
310 |                 // Check if response has items directly
311 |                 if (responseAny.items && Array.isArray(responseAny.items) && responseAny.items.length > 0) {
312 |                     const customer = responseAny.items[0];
313 |                     console.log(`[getCustomerByEmail] Found customer via items array:`, JSON.stringify(customer, null, 2));
314 |                     return customer;
315 |                 }
316 | 
317 |                 // Check if response has data
318 |                 if (responseAny.data && Array.isArray(responseAny.data) && responseAny.data.length > 0) {
319 |                     const customer = responseAny.data[0];
320 |                     console.log(`[getCustomerByEmail] Found customer via data array:`, JSON.stringify(customer, null, 2));
321 |                     return customer;
322 |                 }
323 |             } catch (fallbackError) {
324 |                 console.log(`[getCustomerByEmail] Fallback failed:`, fallbackError);
325 |             }
326 |         }
327 | 
328 |         console.log(`[getCustomerByEmail] No customer found with email: ${email}`);
329 |         return null;
330 |     } catch (error) {
331 |         console.error('Error getting customer by email:', error);
332 |         return null;
333 |     }
334 | }
335 | 
336 | /**
337 |  * Updates an existing customer's external ID
338 |  * 
339 |  * @param customerId The customer's ID in Polar
340 |  * @param externalId The external ID to set
341 |  * @returns The updated customer or null if failed
342 |  */
343 | export async function updateCustomerExternalId(customerId: string, externalId: string) {
344 |     try {
345 |         const updatedCustomer = await polarClient.customers.update({
346 |             id: customerId,
347 |             customerUpdate: {
348 |                 externalId: externalId
349 |             }
350 |         });
351 |         return updatedCustomer;
352 |     } catch (error) {
353 |         console.error('Error updating customer external ID:', error);
354 |         throw error;
355 |     }
356 | }
357 | 
358 | /**
359 |  * Creates or updates a customer in Polar using external ID
360 |  * 
361 |  * @param userId The ID of the user in your local database (will be used as external_id)
362 |  * @param email The user's email
363 |  * @param name Optional - The user's name
364 |  * @param metadata Optional - Any additional metadata to include
365 |  * @returns The created or updated customer
366 |  */
367 | export async function createOrUpdateCustomerWithExternalId(
368 |     userId: string,
369 |     email: string,
370 |     name?: string,
371 |     metadata: Record<string, any> = {}
372 | ) {
373 |     try {
374 |         // First check if the customer already exists with this external ID
375 |         const existingCustomer = await getCustomerByExternalId(userId);
376 | 
377 |         if (existingCustomer) {
378 |             // Customer exists, update them
379 |             const updatedCustomer = await polarClient.customers.updateExternal({
380 |                 externalId: userId,
381 |                 customerUpdateExternalID: {
382 |                     email: email,
383 |                     name: name,
384 |                     metadata: metadata
385 |                 }
386 |             });
387 |             return updatedCustomer;
388 |         } else {
389 |             // Customer doesn't exist, create them
390 |             const newCustomer = await polarClient.customers.create({
391 |                 email: email,
392 |                 name: name,
393 |                 externalId: userId,
394 |                 metadata: metadata
395 |             });
396 |             return newCustomer;
397 |         }
398 |     } catch (error) {
399 |         console.error('Error creating/updating customer with external ID:', error);
400 |         throw error;
401 |     }
402 | }
403 | 
404 | /**
405 |  * Helper to associate a Polar customer ID with a user
406 |  * 
407 |  * @param userId The ID of the user in your local database
408 |  * @param polarCustomerId The customer's ID in the Polar system
409 |  */
410 | export async function associatePolarCustomer(userId: string, polarCustomerId: string) {
411 |     try {
412 |         // This would typically update your User model to store the Polar customer ID
413 |         // For now, we'll just log a usage event to record the association
414 |         await db.insert(polarUsageEvents).values({
415 |             id: nanoid(),
416 |             userId,
417 |             polarCustomerId,
418 |             eventName: 'polar-customer-association',
419 |             eventPayload: {
420 |                 associated: true,
421 |                 timestamp: new Date().toISOString()
422 |             },
423 |             createdAt: new Date()
424 |         });
425 |         return { success: true };
426 |     } catch (dbError: any) {
427 |         // Check for foreign key constraint violation
428 |         if (dbError.code === '23503' && dbError.constraint?.includes('user_id')) {
429 |             console.warn(`User ${userId} not found in database. Cannot associate Polar customer.`);
430 |             return { success: false, reason: 'user_not_found' };
431 |         }
432 |         // Rethrow other database errors
433 |         console.error('Error associating Polar customer:', dbError);
434 |         throw dbError;
435 |     }
436 | }
437 | 
```

lib/types.ts
```
1 | import type { ReasoningUIPart, SourceUIPart, FileUIPart, StepStartUIPart } from "@ai-sdk/ui-utils";
2 | 
3 | export interface WebSearchCitation {
4 |     url: string;
5 |     title: string;
6 |     content?: string;
7 |     startIndex: number;
8 |     endIndex: number;
9 | }
10 | 
11 | export interface TextUIPart {
12 |     type: "text";
13 |     text: string;
14 |     citations?: WebSearchCitation[];
15 | }
16 | 
17 | export interface ToolInvocationUIPart {
18 |     type: "tool-invocation";
19 |     toolInvocation: {
20 |         toolName: string;
21 |         state: string;
22 |         args: any;
23 |         result?: any;
24 |     };
25 | }
26 | 
27 | export type MessagePart = TextUIPart | ToolInvocationUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart; 
```

lib/utils.ts
```
1 | import { clsx, type ClassValue } from "clsx"
2 | import { twMerge } from "tailwind-merge"
3 | 
4 | export function cn(...inputs: ClassValue[]) {
5 |   return twMerge(clsx(inputs))
6 | }
```

public/manifest.json
```
1 | {
2 |     "name": "ChatLima",
3 |     "short_name": "ChatLima",
4 |     "description": "AI-powered chat interface with MCP support",
5 |     "start_url": "/",
6 |     "display": "standalone",
7 |     "background_color": "#ffffff",
8 |     "theme_color": "#000000",
9 |     "orientation": "portrait-primary",
10 |     "scope": "/",
11 |     "lang": "en",
12 |     "icons": [
13 |         {
14 |             "src": "/apple-touch-icon-120x120.png",
15 |             "sizes": "120x120",
16 |             "type": "image/png",
17 |             "purpose": "any maskable"
18 |         },
19 |         {
20 |             "src": "/apple-touch-icon-152x152.png",
21 |             "sizes": "152x152",
22 |             "type": "image/png",
23 |             "purpose": "any maskable"
24 |         },
25 |         {
26 |             "src": "/apple-touch-icon-167x167.png",
27 |             "sizes": "167x167",
28 |             "type": "image/png",
29 |             "purpose": "any maskable"
30 |         },
31 |         {
32 |             "src": "/apple-touch-icon-180x180.png",
33 |             "sizes": "180x180",
34 |             "type": "image/png",
35 |             "purpose": "any maskable"
36 |         },
37 |         {
38 |             "src": "/apple-touch-icon.png",
39 |             "sizes": "180x180",
40 |             "type": "image/png",
41 |             "purpose": "any maskable"
42 |         }
43 |     ]
44 | }
```

releases/RELEASE_NOTES_v0.10.0.md
```
1 | # 🚀 ChatLima v0.10.0 - Enhanced Model Support & Navigation
2 | 
3 | ## 🎯 What's New
4 | - **New Mistral Models**: Added support for the latest Mistral Magistral Small and Medium 2506 models
5 | - **Enhanced Model Descriptions**: Detailed capabilities and use-case information for better model selection
6 | - **Improved Post-Checkout Navigation**: Better user flow after successful checkout completion
7 | - **Enhanced Mathematical Rendering**: Improved KaTeX styling for consistent mathematical expressions across themes
8 | 
9 | ## 🤖 AI Model Enhancements
10 | - **Mistral Magistral Small 2506**: Fast and efficient model for everyday tasks with cost-effective performance
11 | - **Mistral Magistral Medium 2506**: Balanced model offering enhanced capabilities for complex reasoning tasks
12 | - Comprehensive model descriptions help users choose the right model for their specific needs
13 | - Updated model selection interface with clear capability indicators
14 | 
15 | ## 🎨 User Experience Improvements
16 | - **Better Checkout Flow**: Post-purchase navigation now redirects to home page for improved user orientation
17 | - **Enhanced Mathematical Display**: Upgraded KaTeX styling ensures consistent mathematical notation rendering
18 | - **Theme Consistency**: Mathematical expressions now display properly across light and dark themes
19 | - **Improved Visual Hierarchy**: Better styling consistency throughout the application
20 | 
21 | ## 🔧 Technical Improvements
22 | - Added new model configurations with proper metadata and pricing information
23 | - Enhanced CSS styling for mathematical content rendering
24 | - Improved navigation logic for better user flow management
25 | - Updated model selection components with expanded capability descriptions
26 | 
27 | ## 📈 Benefits
28 | - **More Model Choices**: Access to latest Mistral models for diverse use cases
29 | - **Better Decision Making**: Comprehensive model descriptions help users select optimal models
30 | - **Smoother User Journey**: Improved post-checkout experience reduces confusion
31 | - **Enhanced Readability**: Better mathematical content display improves technical discussions
32 | - **Consistent Theming**: Unified visual experience across all interface elements
33 | 
34 | ## 🔄 Migration Notes
35 | - New models are immediately available in the model selection interface
36 | - No breaking changes to existing functionality
37 | - Enhanced styling is automatically applied to all mathematical content
38 | - Existing model preferences remain unchanged and fully functional
39 | 
40 | ## 🚀 Deployment
41 | - Standard deployment process with automatic model availability
42 | - No additional configuration required for new models
43 | - Enhanced styling takes effect immediately after deployment
44 | - All existing user data and preferences remain intact
45 | 
46 | ---
47 | 
48 | **Full Changelog**: [v0.9.1...v0.10.0](https://github.com/brooksy4503/chatlima/compare/v0.9.1...v0.10.0) 
```

releases/RELEASE_NOTES_v0.11.0.md
```
1 | # 🚀 ChatLima v0.11.0 - Polar Integration & Enhanced Features
2 | 
3 | ## 🎯 What's New
4 | - **Polar Integration**: Complete integration with Polar billing platform for customer management and payments
5 | - **Paid Web Search**: New premium web search feature with credit-based billing and usage tracking
6 | - **Dynamic Environment Configuration**: Environment-based Polar server configuration for seamless production deployment
7 | - **Customer Portal Access**: Direct access to Polar customer portal for subscription and billing management
8 | - **Enhanced Testing Infrastructure**: Comprehensive Playwright testing suite with multiple configuration options
9 | - **Smart Title Generation**: Dynamic model selection for AI-powered conversation title generation
10 | - **Improved Credit Management**: Enhanced credit validation with better user experience and error handling
11 | 
12 | ## 🔧 Technical Implementation
13 | - **Polar SDK Integration**: Full integration with Polar billing platform using environment-based configuration
14 | - **Web Search Billing**: Backend credit validation and surcharge system for paid web search functionality
15 | - **Enhanced OAuth Configuration**: Dynamic Google OAuth setup with improved logging and error handling
16 | - **Customer Management**: Advanced customer retrieval and creation logic with fallback mechanisms
17 | - **Credit Exposure**: Frontend access to user credit balance for better UX and transparency
18 | - **Testing Suite**: Added comprehensive Playwright testing scripts with local and CI configurations
19 | - **API Route Enhancements**: New customer portal API route and improved existing endpoints
20 | 
21 | ## 🛡️ Security & Privacy
22 | - **Environment-Based Configuration**: Secure Polar server environment selection based on deployment context
23 | - **Enhanced OAuth Security**: Improved Google OAuth client configuration with detailed logging
24 | - **Credit Validation**: Robust credit checking with proper error handling and user feedback
25 | - **Customer Data Protection**: Secure customer management with proper API integration patterns
26 | 
27 | ## 📈 Benefits
28 | - **Streamlined Billing**: Direct integration with Polar for seamless payment and subscription management
29 | - **Premium Features**: Monetized web search capabilities with transparent credit-based pricing
30 | - **Better User Experience**: Clear credit balance visibility and improved error messaging
31 | - **Development Quality**: Comprehensive testing infrastructure for better code reliability
32 | - **Operational Excellence**: Environment-aware configuration for smooth production deployments
33 | - **Customer Self-Service**: Direct portal access for users to manage their billing and subscriptions
34 | 
35 | ## 🔄 Migration Notes
36 | - **Polar Configuration**: New environment variables required for Polar integration
37 |   - Configure Polar environment settings based on deployment context
38 |   - Update customer management workflows to use new Polar API integration
39 | - **Web Search Credits**: New credit deduction system for web search features
40 |   - Existing users will see new web search billing in their account
41 |   - Credit validation now includes web search cost calculations
42 | - **Testing Infrastructure**: New Playwright configuration files added
43 |   - Development teams should update their testing workflows
44 |   - New test scripts available for comprehensive UI testing
45 | - **API Changes**: Enhanced API routes with improved error handling
46 |   - Existing integrations remain compatible
47 |   - New customer portal functionality available immediately
48 | 
49 | ## 🚀 Deployment
50 | - **Environment Variables**: Ensure Polar configuration environment variables are set
51 | - **Database Updates**: No schema changes required for this release
52 | - **Testing**: Run new Playwright test suite to validate deployment
53 | - **Customer Portal**: New portal access will be available immediately after deployment
54 | - **Web Search**: Paid web search features activate automatically with credit system
55 | 
56 | ## 🆕 New Features Detail
57 | - **Polar Customer Portal**: Users can access billing portal directly from account menu
58 | - **Web Search Billing**: Transparent credit usage for premium web search functionality
59 | - **Dynamic Title Generation**: Improved conversation titles using advanced AI models
60 | - **Enhanced Credit UI**: Real-time credit balance display and usage tracking
61 | - **Testing Scripts**: Multiple Playwright configurations for different testing scenarios
62 | - **Environment Awareness**: Automatic Polar environment selection for production/development
63 | 
64 | ---
65 | 
66 | **Full Changelog**: [v0.10.0...v0.11.0](https://github.com/brooksy4503/chatlima/compare/v0.10.0...v0.11.0) 
```

releases/RELEASE_NOTES_v0.12.0.md
```
1 | # 🚀 ChatLima v0.12.0 - Polar Production Checkout Integration
2 | 
3 | ## 🎯 What's New
4 | - **Production Checkout System**: Complete Polar checkout integration with user-friendly purchase flow
5 | - **Smart User Flow Handling**: Seamless experience for both anonymous and authenticated users
6 | - **Integrated Purchase Interface**: Checkout button directly accessible from user account menu
7 | - **Comprehensive Error Handling**: Dedicated error pages for failed, canceled, and problematic transactions
8 | - **Credit Purchase Workflow**: Streamlined process for users to purchase AI usage credits
9 | - **Enhanced User Experience**: Context-aware messaging and intuitive purchase flow
10 | 
11 | ## 🔧 Technical Implementation
12 | - **CheckoutButton Component**: Reusable React component with intelligent user state detection
13 | - **Dual User Flow Logic**: Automatic handling of anonymous users (redirect to sign-in) vs authenticated users (direct checkout)
14 | - **Error Page Framework**: Complete error handling with detailed error states and recovery options
15 | - **User Menu Integration**: Seamless integration of purchase functionality into existing user interface
16 | - **Production Environment**: Full migration to Polar production environment with proper security configurations
17 | - **Webhook Integration**: Backend webhook handling for real-time credit updates after successful purchases
18 | 
19 | ## 🛡️ Security & Privacy
20 | - **Production Environment**: Secure Polar production environment configuration
21 | - **Authenticated Checkout**: Proper user authentication verification before checkout access
22 | - **Secure Payment Processing**: All payment processing handled securely through Polar platform
23 | - **Error Information Protection**: Safe error handling that doesn't expose sensitive checkout data
24 | - **Environment Variable Security**: Production keys and secrets properly configured in deployment environment
25 | 
26 | ## 📈 Benefits
27 | - **Simplified Credit Purchase**: Users can purchase credits directly from the application interface
28 | - **Improved User Onboarding**: Anonymous users guided through sign-up process for credit purchases
29 | - **Better Error Recovery**: Clear error messages with actionable recovery options
30 | - **Seamless Integration**: Native checkout experience without external redirects
31 | - **Real-time Updates**: Immediate credit balance updates after successful purchases
32 | - **Enhanced Accessibility**: Intuitive interface accessible to users of all technical levels
33 | 
34 | ## 🔄 Migration Notes
35 | - **Environment Configuration**: Production Polar environment variables now active
36 |   - All checkout functionality now uses production Polar endpoints
37 |   - Webhook endpoints configured for production credit updates
38 | - **User Interface Updates**: New checkout button integrated into user account menu
39 |   - Existing users will see new "Purchase More Credits" option in account menu
40 |   - Anonymous users will see "Sign In to Purchase Credits" with guided flow
41 | - **Error Handling**: New error pages for checkout failures
42 |   - Users experiencing checkout issues will be directed to helpful error pages
43 |   - Recovery options provided for failed or canceled transactions
44 | 
45 | ## 🚀 Deployment
46 | - **Environment Variables**: Production Polar configuration active
47 | - **Component Integration**: New checkout components deployed and integrated
48 | - **Error Pages**: Checkout error handling pages now available at `/checkout/error`
49 | - **User Menu Updates**: Enhanced account menu with integrated purchase functionality
50 | - **Webhook Verification**: Production webhook endpoints for credit updates confirmed active
51 | 
52 | ## 🆕 New Features Detail
53 | - **Smart Checkout Button**: Context-aware button that adapts to user authentication state
54 |   - Anonymous users: "Sign In to Purchase Credits" with Google OAuth flow
55 |   - Authenticated users: "Purchase More Credits" with direct checkout access
56 | - **Comprehensive Error Handling**: Dedicated error page with specific error state handling
57 |   - Canceled transactions: User-friendly messaging with retry options
58 |   - Failed payments: Clear error explanation with troubleshooting guidance
59 |   - General errors: Helpful recovery options and support contact information
60 | - **Seamless User Flow**: Integrated purchase experience within the application
61 |   - No external redirects or confusing navigation
62 |   - Clear calls-to-action and intuitive user interface
63 |   - Immediate access to purchased credits after successful payment
64 | 
65 | ## 🐛 Bug Fixes
66 | - **Checkout Flow Reliability**: Improved error handling and user feedback
67 | - **Authentication State Management**: Better handling of anonymous vs authenticated user scenarios
68 | - **UI Consistency**: Consistent styling and messaging across checkout flow
69 | 
70 | ---
71 | 
72 | **Full Changelog**: [v0.11.0...v0.12.0](https://github.com/brooksy4503/chatlima/compare/v0.11.0...v0.12.0) 
```

releases/RELEASE_NOTES_v0.12.1.md
```
1 | # 🔐 ChatLima v0.12.1 - Web Search Security & Credit Validation Fix
2 | 
3 | ## 🎯 What's Fixed
4 | - **Enhanced Web Search Security**: Implemented robust server-side validation for web search feature access
5 | - **Credit Validation Improvements**: Strengthened credit checking to prevent unauthorized feature usage
6 | - **Anonymous User Protection**: Added proper blocking for anonymous users attempting to access premium features
7 | - **Security Logging**: Enhanced monitoring and logging for unauthorized access attempts
8 | 
9 | ## 🔧 Technical Fixes
10 | - **Server-Side Validation**: Complete overhaul of web search authorization logic
11 |   - Server now determines web search eligibility instead of relying on client requests
12 |   - Prevents potential security bypasses through client-side manipulation
13 | - **Anonymous User Blocking**: Explicit prevention of web search access for non-authenticated users
14 | - **Credit Verification**: Enhanced credit checking before allowing premium feature access
15 | - **Security Incident Logging**: Improved logging for tracking unauthorized access attempts
16 | - **Authorization Flow**: Streamlined permission checking with proper error responses
17 | 
18 | ## 🛡️ Security Improvements
19 | - **Access Control**: Strict server-side enforcement of web search feature permissions
20 | - **Credit Protection**: Prevents users with insufficient credits from accessing premium features
21 | - **Anonymous User Safety**: Clear boundaries preventing anonymous users from accessing paid features
22 | - **Audit Trail**: Enhanced logging for security monitoring and incident response
23 | - **Input Validation**: Improved validation of user requests to prevent unauthorized actions
24 | 
25 | ## 🐛 Critical Bug Fixes
26 | - **Web Search Authorization**: Fixed potential security vulnerability where unauthorized users could access web search
27 | - **Credit Validation**: Resolved issue where credit checks could be bypassed
28 | - **User State Verification**: Enhanced user authentication state validation
29 | - **Request Processing**: Improved handling of unauthorized feature access attempts
30 | 
31 | ## 📈 Impact
32 | - **Improved Security**: Significantly enhanced protection against unauthorized feature access
33 | - **Better Credit Management**: More accurate and secure credit usage tracking
34 | - **Enhanced User Experience**: Clear error messages for users attempting unauthorized actions
35 | - **Reduced Security Risk**: Eliminated potential vectors for premium feature bypass
36 | - **Better Monitoring**: Improved visibility into security-related events
37 | 
38 | ## 🔄 Changes
39 | - **API Route Updates**: Modified `/api/chat/route.ts` with enhanced security checks
40 | - **Authorization Logic**: Completely rewritten web search permission validation
41 | - **Error Handling**: Improved error responses for unauthorized access attempts
42 | - **Logging Infrastructure**: Enhanced security event logging and monitoring
43 | 
44 | ---
45 | 
46 | **Full Changelog**: [v0.12.0...v0.12.1](https://github.com/brooksy4503/chatlima/compare/v0.12.0...v0.12.1) 
```

releases/RELEASE_NOTES_v0.13.0.md
```
1 | # 📱 ChatLima v0.13.0 - iOS Homescreen Shortcut Support
2 | 
3 | ## 🎯 What's New
4 | - **iOS Homescreen Integration**: Complete iOS homescreen shortcut functionality with native app-like experience
5 | - **Apple Touch Icons**: High-quality branded icons optimized for all iOS device sizes and configurations
6 | - **Smart Installation Prompt**: Intelligent iOS detection with contextual "Add to Home Screen" suggestions
7 | - **Enhanced Mobile Experience**: Comprehensive iOS-specific styling and touch optimizations
8 | - **Progressive Web Enhancement**: Web app manifest and meta tags for standalone display mode
9 | - **Mobile UI Improvements**: Enhanced chat interface and typography optimized for mobile devices
10 | 
11 | ## 🔧 Technical Implementation
12 | - **Apple Touch Icon Assets**: Complete icon set for all iOS devices and screen densities
13 |   - 180x180px for iPhone 6 Plus and newer devices
14 |   - 167x167px for iPad Pro with Retina display
15 |   - 152x152px for standard iPad Retina display
16 |   - 120x120px for iPhone Retina display
17 |   - Optimized PNG format with no transparency for perfect iOS integration
18 | - **Web App Manifest**: Comprehensive `manifest.json` with proper metadata and standalone display configuration
19 | - **iOS Detection Component**: Smart `ios-install-prompt.tsx` component with user preference memory and installation status detection
20 | - **Meta Tag Enhancements**: Complete iOS-specific meta tag implementation for optimal homescreen experience
21 | - **CSS Mobile Optimization**: Enhanced styling for iOS Safari and homescreen app mode with safe area support
22 | 
23 | ## 🛡️ Mobile Experience & UX
24 | - **Native App Feel**: When launched from home screen, ChatLima opens without browser chrome for seamless experience
25 | - **Safe Area Support**: Proper handling for notched devices (iPhone X and newer) with appropriate padding and layout
26 | - **Touch Optimization**: Improved touch targets and interactions specifically designed for mobile use
27 | - **Enhanced Typography**: Better mobile typography and spacing for improved readability on smaller screens
28 | - **Smooth Scrolling**: Optimized scrolling behavior and performance for mobile devices
29 | - **Installation Memory**: User dismissal preferences saved to avoid annoying repeated prompts
30 | 
31 | ## 📈 Benefits
32 | - **Quick Access**: Users can launch ChatLima directly from iOS home screen like a native app
33 | - **Improved Engagement**: Easier access encourages more frequent usage on mobile devices
34 | - **Better Mobile UX**: Comprehensive mobile optimizations improve overall user experience
35 | - **Reduced Friction**: No need to open Safari and navigate to website each time
36 | - **Native Integration**: Proper iOS integration with branded icons and standalone display
37 | - **Future-Proof Foundation**: Groundwork laid for potential PWA features and offline functionality
38 | 
39 | ## 🔄 Migration Notes
40 | - **Automatic Availability**: iOS homescreen functionality is automatically available to all users on compatible devices
41 | - **No Configuration Required**: All necessary assets and configurations deployed automatically
42 | - **Backward Compatibility**: All existing functionality remains unchanged for non-iOS users
43 | - **Progressive Enhancement**: iOS users get enhanced experience while maintaining compatibility
44 | - **Asset Optimization**: New icon assets added without affecting site performance
45 | - **Component Integration**: iOS install prompt integrated seamlessly into existing UI
46 | 
47 | ## 🚀 Deployment
48 | - **Icon Assets**: All Apple touch icon variants deployed to public directory
49 | - **Manifest Configuration**: Web app manifest active with proper metadata
50 | - **Meta Tag Integration**: iOS-specific meta tags added to application layout
51 | - **Component Activation**: iOS installation prompt component deployed and active
52 | - **CSS Enhancements**: Mobile-optimized styling deployed across all components
53 | - **Documentation**: Implementation plan and guidelines added to project documentation
54 | 
55 | ## 🆕 New Features Detail
56 | - **Smart iOS Detection**: Automatic detection of iOS Safari users with contextual prompting
57 |   - Detects device type and browser for targeted user experience
58 |   - Checks if already added to home screen to avoid duplicate prompts
59 |   - Respects user dismissal preferences with localStorage persistence
60 | - **Progressive Installation Prompt**: Non-intrusive "Add to Home Screen" suggestions
61 |   - Appears only for eligible iOS users at appropriate moments
62 |   - Clear instructions and value proposition for homescreen installation
63 |   - Easy dismissal with memory to avoid repeated interruptions
64 | - **Standalone App Mode**: Complete standalone display experience when launched from home screen
65 |   - No browser address bar or navigation controls
66 |   - Proper status bar styling and safe area handling
67 |   - Native app-like navigation and interaction patterns
68 | - **Enhanced Mobile Interface**: Comprehensive mobile UI improvements
69 |   - Better chat component responsiveness and touch handling
70 |   - Improved textarea component styling for mobile input
71 |   - Enhanced markdown rendering optimized for mobile screens
72 | 
73 | ## 🐛 Bug Fixes & Improvements
74 | - **Mobile Responsiveness**: Improved layout handling across all mobile screen sizes
75 | - **Touch Interaction**: Better touch target sizing and interaction feedback
76 | - **Typography Enhancement**: Optimized text rendering and spacing for mobile devices
77 | - **Asset Loading**: Efficient loading of mobile-specific assets and configurations
78 | - **Component Styling**: Enhanced styling consistency across chat and input components
79 | 
80 | ---
81 | 
82 | **Full Changelog**: [v0.12.1...v0.13.0](https://github.com/brooksy4503/chatlima/compare/v0.12.1...v0.13.0) 
```

releases/RELEASE_NOTES_v0.14.0.md
```
1 | # 🚀 ChatLima v0.14.0 - Enhanced AI Model Portfolio
2 | 
3 | ## 🎯 What's New
4 | 
5 | - **Google Gemini 2.5 Pro & Flash Models**: Access to Google's latest state-of-the-art AI models with superior reasoning, coding, and multimodal capabilities
6 | - **MiniMax M1 Model Family**: New large-scale reasoning models with extended context support (up to 1 million tokens) and high-efficiency inference
7 | - **Enhanced Model Selection**: Four new premium AI models expanding ChatLima's capabilities across different use cases and performance requirements
8 | - **Advanced Reasoning Features**: Built-in thinking capabilities in Gemini 2.5 Flash for improved accuracy and nuanced context handling
9 | 
10 | ## 🔧 Technical Implementation
11 | 
12 | - Added Google Gemini 2.5 Pro and Flash model integrations via OpenRouter
13 | - Implemented MiniMax M1 and M1 Extended models with hybrid Mixture-of-Experts (MoE) architecture
14 | - Enhanced `ai/providers.ts` with comprehensive model configurations and capability mappings
15 | - Added detailed model descriptions showcasing advanced reasoning, coding, mathematics, and scientific task capabilities
16 | - Updated model selection interface with proper provider attribution following naming conventions
17 | 
18 | ### New Models Added:
19 | 
20 | #### Google Models (via OpenRouter)
21 | - **Google Gemini 2.5 Pro**: Premium model for advanced reasoning, coding, mathematics, and scientific tasks
22 | - **Google Gemini 2.5 Flash**: Workhorse model with built-in thinking capabilities for balanced performance and cost
23 | 
24 | #### MiniMax Models (via OpenRouter)  
25 | - **MiniMax M1**: Large-scale reasoning model with 456B total parameters and 45.9B active per token
26 | - **MiniMax M1 Extended**: Extended context variant processing up to 128,000 tokens
27 | 
28 | ## 🛡️ Security & Privacy
29 | 
30 | - All new models inherit existing API key management and user authentication protections
31 | - Maintained secure provider integration patterns with proper headers and referrer policies
32 | - No changes to existing security or privacy implementations
33 | 
34 | ## 📈 Benefits
35 | 
36 | - **Expanded Choice**: Users now have access to 4 additional cutting-edge AI models
37 | - **Performance Optimization**: Different models optimized for various tasks (speed vs. quality vs. context length)
38 | - **Cost Flexibility**: Mix of premium and standard pricing tiers to match user needs and budgets
39 | - **Advanced Capabilities**: Enhanced reasoning, longer context windows, and specialized task performance
40 | 
41 | ### Model Capabilities Overview:
42 | - **Advanced Reasoning**: All new models excel at complex logical tasks
43 | - **Long Context Support**: Gemini 2.5 Pro/Flash and MiniMax M1 support up to 1 million tokens
44 | - **Multimodal Processing**: Gemini models support text, image, and mixed content
45 | - **Software Engineering**: Optimized for coding and technical documentation tasks
46 | - **Mathematical Reasoning**: Enhanced capabilities for mathematical and scientific problem-solving
47 | 
48 | ## 🔄 Migration Notes
49 | 
50 | - **No Breaking Changes**: All existing functionality remains unchanged
51 | - **Automatic Availability**: New models are immediately available in the model selection interface
52 | - **Backward Compatibility**: Existing chats and configurations continue to work seamlessly
53 | 
54 | ## 🚀 Deployment
55 | 
56 | ### Environment Considerations:
57 | - No new environment variables required
58 | - Existing OpenRouter API key provides access to all new models
59 | - Models are enabled by default for users with appropriate access levels
60 | 
61 | ### Model Access:
62 | - **Gemini 2.5 Flash**: Available to all users (premium: false)
63 | - **Gemini 2.5 Pro**: Premium model requiring credits or subscription
64 | - **MiniMax M1 Models**: Premium models requiring credits or subscription
65 | 
66 | ## 📊 Model Comparison
67 | 
68 | | Model | Context Length | Strengths | Pricing Tier |
69 | |-------|---------------|-----------|--------------|
70 | | Gemini 2.5 Pro | 1M tokens | Top-tier reasoning, scientific tasks | Premium |
71 | | Gemini 2.5 Flash | 1M tokens | Built-in thinking, balanced performance | Standard |
72 | | MiniMax M1 | 1M tokens | Extended context, high efficiency | Premium |
73 | | MiniMax M1 Extended | 128K tokens | Long context, reasoning | Premium |
74 | 
75 | ## 🔍 Technical Details
76 | 
77 | ### Architecture Improvements:
78 | - Enhanced model metadata system with comprehensive capability tracking
79 | - Improved provider integration with consistent naming patterns
80 | - Advanced model configuration supporting specialized features like thinking modes
81 | 
82 | ### Performance Considerations:
83 | - Models are loaded on-demand to maintain application responsiveness
84 | - Optimized API integration patterns for efficient model switching
85 | - Maintained compatibility with existing rate limiting and usage tracking
86 | 
87 | ---
88 | 
89 | **Repository**: [https://github.com/brooksy4503/chatlima](https://github.com/brooksy4503/chatlima)
90 | **Full Changelog**: [v0.13.0...v0.14.0](https://github.com/brooksy4503/chatlima/compare/v0.13.0...v0.14.0) 
```

releases/RELEASE_NOTES_v0.16.0.md
```
1 | # 🚀 ChatLima v0.16.0 - Enhanced Model Selection & Mobile Experience
2 | 
3 | ## 🎯 What's New
4 | 
5 | - **Advanced Model Picker Search**: Intelligent search functionality across all AI models with real-time filtering by name, provider, and capabilities
6 | - **Enhanced Mobile Experience**: Comprehensive mobile UI improvements with touch-optimized interactions and responsive design
7 | - **Intelligent Keyboard Navigation**: Full keyboard support for model selection with arrow key navigation and auto-scroll
8 | - **Touch-Friendly Interface**: Optimized touch targets and mobile-first design patterns throughout the application
9 | 
10 | ## 🔧 Technical Implementation
11 | 
12 | ### Model Picker Search System
13 | - **Real-time Filtering**: Instant search across model names, providers, and capabilities
14 | - **Smart Keyboard Navigation**: Arrow key navigation with visual focus indicators and auto-scroll
15 | - **Performance Optimization**: Memoized filtering and sorting to prevent unnecessary re-renders
16 | - **Accessibility**: Full keyboard support with Enter to select and Escape to cancel
17 | 
18 | ### Mobile Experience Enhancements
19 | - **Enhanced Mobile Detection**: Improved `useIsMobile` hook with better breakpoint handling
20 | - **Touch Device Detection**: New `useIsTouchDevice` hook for precise touch interaction handling
21 | - **Safe Area Support**: Proper iOS safe area handling for notched devices
22 | - **Mobile-First Responsive Design**: Comprehensive mobile-first CSS with proper touch targets
23 | 
24 | ### Key Features Added:
25 | - **Search Input**: Dedicated search field with placeholder guidance
26 | - **Visual Focus Indicators**: Clear keyboard focus highlighting with ring indicators
27 | - **Provider Icons**: Color-coded provider icons for better visual organization
28 | - **Capability Badges**: Interactive capability tags with icons and colors
29 | - **Touch Optimization**: Minimum 44px touch targets for mobile accessibility
30 | 
31 | ## 🛡️ Mobile UX & Accessibility
32 | 
33 | - **Safe Area Handling**: Proper support for iPhone notches and Android navigation
34 | - **Touch Target Optimization**: All interactive elements meet 44px minimum size requirements
35 | - **Improved Touch Interactions**: Enhanced hover states for touch devices
36 | - **Keyboard Accessibility**: Full keyboard navigation support for all interactive elements
37 | - **Screen Reader Support**: Proper ARIA labels and semantic HTML structure
38 | 
39 | ## 📈 Benefits
40 | 
41 | ### Enhanced User Experience
42 | - **Faster Model Discovery**: Search through 30+ AI models instantly by name or capability
43 | - **Improved Mobile Usability**: Native-like mobile experience with proper touch handling
44 | - **Better Accessibility**: Full keyboard navigation and screen reader support
45 | - **Visual Clarity**: Clear visual hierarchy with provider icons and capability badges
46 | 
47 | ### Performance Improvements
48 | - **Optimized Rendering**: Memoized components prevent unnecessary re-renders
49 | - **Smart Filtering**: Efficient search algorithms with case-insensitive matching
50 | - **Responsive Design**: Mobile-first approach reduces layout shift and improves load times
51 | 
52 | ### Developer Experience
53 | - **Cleaner Code**: Improved component architecture with better separation of concerns
54 | - **Enhanced Hooks**: More robust mobile detection and touch device handling
55 | - **Better CSS Organization**: Mobile-first CSS with proper responsive patterns
56 | 
57 | ## 🔄 Migration Notes
58 | 
59 | - **No Breaking Changes**: All existing functionality remains unchanged
60 | - **Automatic Availability**: New search and mobile improvements are immediately available
61 | - **Backward Compatibility**: Existing keyboard shortcuts and interactions continue to work
62 | - **Progressive Enhancement**: Mobile improvements gracefully degrade on older devices
63 | 
64 | ## 🚀 Mobile-First Enhancements
65 | 
66 | ### iOS Optimizations
67 | - **Safe Area Support**: Proper handling of notched devices (iPhone X and newer)
68 | - **Touch Callout Control**: Disabled unwanted touch callouts while preserving input functionality
69 | - **Momentum Scrolling**: Smooth scrolling behavior optimized for iOS Safari
70 | - **Homescreen App Support**: Enhanced PWA capabilities for iOS homescreen shortcuts
71 | 
72 | ### Android Optimizations
73 | - **Touch Target Compliance**: All buttons meet Android accessibility guidelines
74 | - **Material Design Patterns**: Consistent with Android design language
75 | - **Gesture Support**: Improved touch and swipe interactions
76 | 
77 | ### Cross-Platform Mobile Features
78 | - **Responsive Typography**: Better text scaling and readability on small screens
79 | - **Adaptive Layouts**: Components automatically adjust for mobile constraints
80 | - **Touch-Friendly Spacing**: Increased padding and margins for easier interaction
81 | 
82 | ## 📊 Technical Specifications
83 | 
84 | | Feature | Implementation | Benefits |
85 | |---------|---------------|----------|
86 | | Model Search | Real-time filtering with memoization | Instant results, no performance impact |
87 | | Keyboard Navigation | Arrow keys + Enter/Escape | Full accessibility compliance |
88 | | Mobile Detection | Multi-criteria device detection | Accurate mobile/desktop differentiation |
89 | | Touch Targets | Minimum 44px size enforcement | Meets WCAG 2.1 AA standards |
90 | | Safe Areas | CSS env() variables | Proper iPhone notch handling |
91 | 
92 | ## 🎨 UI/UX Improvements
93 | 
94 | ### Visual Enhancements
95 | - **Provider Color Coding**: Each AI provider has distinct color identity
96 | - **Capability Icons**: Visual indicators for model capabilities (Code, Reasoning, Vision, etc.)
97 | - **Focus Indicators**: Clear visual feedback for keyboard navigation
98 | - **Responsive Spacing**: Adaptive margins and padding for different screen sizes
99 | 
100 | ### Interaction Improvements
101 | - **Smart Search**: Search by provider name, model name, or capability
102 | - **Auto-scroll**: Keyboard navigation keeps focused items visible
103 | - **Touch Feedback**: Immediate visual response to touch interactions
104 | - **Gesture Support**: Swipe and touch gestures for mobile navigation
105 | 
106 | ## 🔍 Search Capabilities
107 | 
108 | The new model picker search supports:
109 | - **Model Names**: "GPT-4", "Claude", "Gemini", etc.
110 | - **Provider Names**: "OpenAI", "Anthropic", "Google", etc.
111 | - **Capabilities**: "coding", "reasoning", "vision", "fast", etc.
112 | - **Partial Matches**: Type "reason" to find all reasoning-capable models
113 | - **Case Insensitive**: Search works regardless of capitalization
114 | 
115 | ## 🚀 Performance Metrics
116 | 
117 | - **Search Response Time**: <50ms for real-time filtering
118 | - **Mobile Load Time**: 15% improvement on mobile devices
119 | - **Touch Response**: <100ms for all touch interactions
120 | - **Keyboard Navigation**: Instant focus changes with smooth scrolling
121 | 
122 | ---
123 | 
124 | **Repository**: [https://github.com/brooksy4503/chatlima](https://github.com/brooksy4503/chatlima)
125 | **Full Changelog**: [v0.14.0...v0.16.0](https://github.com/brooksy4503/chatlima/compare/v0.14.0...v0.16.0) 
```

releases/RELEASE_NOTES_v0.16.1.md
```
1 | # 🚀 ChatLima v0.16.1 - Enhanced Accessibility & Visual Polish
2 | 
3 | ## 🎯 What's New
4 | 
5 | - **Improved ModelPicker Accessibility**: Enhanced text color and contrast for better visibility across all themes
6 | - **Refined Visual Consistency**: Updated hover and focus states for consistent user interaction feedback
7 | - **Better Foreground Visibility**: Optimized text colors to ensure maximum readability in both light and dark modes
8 | 
9 | ## 🔧 Technical Implementation
10 | 
11 | ### ModelPicker Component Enhancements
12 | - **Text Color Optimization**: Changed from `text-primary dark:text-primary-foreground` to `text-foreground hover:text-foreground` for better theme consistency
13 | - **Improved Hover States**: Updated from `hover:text-primary` to `hover:text-accent-foreground` for better visual feedback
14 | - **Enhanced Focus Indicators**: Refined focus states to use `focus:text-accent-foreground` for consistent accessibility
15 | - **Selection State Polish**: Updated selected item styling to use `text-foreground` for optimal contrast
16 | 
17 | ### Accessibility Improvements
18 | - **Better Color Contrast**: Enhanced text visibility across all theme variants
19 | - **Consistent Focus States**: Unified focus indication patterns throughout the component
20 | - **Theme-Aware Colors**: Improved color selection that works seamlessly in light and dark modes
21 | - **Visual Feedback**: Enhanced hover and focus states for better user interaction clarity
22 | 
23 | ## 🛡️ Accessibility & Visual Consistency
24 | 
25 | - **WCAG Compliance**: Improved color contrast ratios for better accessibility standards
26 | - **Theme Consistency**: Colors now properly adapt to both light and dark theme variants
27 | - **Focus Visibility**: Enhanced keyboard navigation with clearer visual indicators
28 | - **Hover Feedback**: More intuitive hover states that provide immediate visual response
29 | 
30 | ## 📈 Benefits
31 | 
32 | ### Enhanced User Experience
33 | - **Better Readability**: Improved text visibility reduces eye strain and enhances usability
34 | - **Consistent Interactions**: Unified hover and focus states create predictable user interactions
35 | - **Theme Harmony**: Colors that work seamlessly across all theme variants
36 | - **Accessibility Compliance**: Better support for users with visual impairments
37 | 
38 | ### Visual Polish
39 | - **Professional Appearance**: Refined color choices create a more polished interface
40 | - **Reduced Visual Noise**: Consistent color usage eliminates distracting inconsistencies
41 | - **Better Focus Management**: Clear visual indicators help users understand their current selection
42 | - **Enhanced Usability**: Improved visual feedback makes the interface more intuitive
43 | 
44 | ## 🔄 Migration Notes
45 | 
46 | - **No Breaking Changes**: All existing functionality remains unchanged
47 | - **Automatic Improvements**: Visual enhancements are immediately available to all users
48 | - **Backward Compatibility**: No configuration changes required
49 | - **Theme Compatibility**: Improvements work across all existing theme configurations
50 | 
51 | ## 🎨 Visual Improvements
52 | 
53 | ### Color System Enhancements
54 | - **Foreground Text**: Consistent use of `text-foreground` for optimal readability
55 | - **Accent Colors**: Proper use of `text-accent-foreground` for interactive states
56 | - **Hover States**: Unified hover styling with `hover:text-accent-foreground`
57 | - **Focus Indicators**: Clear focus states using consistent accent colors
58 | 
59 | ### Theme Adaptability
60 | - **Light Mode**: Enhanced contrast and readability in light theme
61 | - **Dark Mode**: Improved visibility and consistency in dark theme
62 | - **High Contrast**: Better support for high contrast accessibility modes
63 | - **Custom Themes**: Improved compatibility with custom theme configurations
64 | 
65 | ## 🚀 Technical Details
66 | 
67 | ### Component Updates
68 | - **File Modified**: [`components/model-picker.tsx`](mdc:chatlima/components/model-picker.tsx)
69 | - **Lines Changed**: Updated text color classes for trigger and option elements
70 | - **Impact**: Improved accessibility and visual consistency across the component
71 | - **Testing**: Verified across all theme variants and accessibility modes
72 | 
73 | ### CSS Class Changes
74 | ```diff
75 | - "text-primary dark:text-primary-foreground font-normal"
76 | + "text-foreground hover:text-foreground font-normal"
77 | 
78 | - "hover:bg-primary/10 hover:text-primary"
79 | + "hover:bg-accent hover:text-accent-foreground"
80 | 
81 | - "focus:bg-primary/10 focus:text-primary focus:outline-none"
82 | + "focus:bg-accent focus:text-accent-foreground focus:outline-none"
83 | 
84 | - isSelected && "!bg-primary/15 !text-primary font-medium"
85 | + isSelected && "!bg-primary/15 !text-foreground font-medium"
86 | 
87 | - isKeyboardFocused && "!bg-primary/20 !text-primary ring-2 ring-primary/30"
88 | + isKeyboardFocused && "!bg-accent !text-accent-foreground ring-2 ring-primary/30"
89 | ```
90 | 
91 | ## 📊 Accessibility Improvements
92 | 
93 | | Aspect | Before | After | Benefit |
94 | |--------|--------|-------|---------|
95 | | Text Contrast | Variable across themes | Consistent foreground colors | Better readability |
96 | | Hover States | Primary color focus | Accent color system | Unified interaction patterns |
97 | | Focus Indicators | Mixed color usage | Consistent accent colors | Clearer navigation feedback |
98 | | Theme Adaptation | Manual color overrides | Semantic color tokens | Automatic theme compatibility |
99 | 
100 | ## 🎯 User Impact
101 | 
102 | ### Immediate Benefits
103 | - **Better Visibility**: Text is more readable across all theme configurations
104 | - **Consistent Experience**: Unified interaction patterns throughout the model picker
105 | - **Accessibility**: Improved support for users with visual accessibility needs
106 | - **Professional Polish**: More refined and consistent visual appearance
107 | 
108 | ### Long-term Value
109 | - **Maintainability**: Semantic color usage makes future theme updates easier
110 | - **Scalability**: Consistent patterns can be applied to other components
111 | - **Accessibility Compliance**: Better foundation for meeting accessibility standards
112 | - **User Satisfaction**: Improved visual consistency enhances overall user experience
113 | 
114 | ---
115 | 
116 | **Repository**: [https://github.com/brooksy4503/chatlima](https://github.com/brooksy4503/chatlima)
117 | **Full Changelog**: [v0.16.0...v0.16.1](https://github.com/brooksy4503/chatlima/compare/v0.16.0...v0.16.1) 
```

releases/RELEASE_NOTES_v0.17.0.md
```
1 | # 🚀 ChatLima v0.17.0 - Latest MCP Spec Implementation
2 | 
3 | ## 🎯 What's New
4 | 
5 | - **MCP 1.13.0 Support**: Upgraded to the latest Model Context Protocol specification with full compatibility
6 | - **Enhanced Protocol Headers**: Implemented required `MCP-Protocol-Version` header for HTTP transport
7 | - **Server Metadata Support**: Added `title` and `_meta` fields for better MCP server organization and display
8 | - **Improved Server Management**: Enhanced MCP Server Manager UI with display titles and better user experience
9 | - **New AI Model**: Added **Google Gemini 2.5 Flash Lite Preview 06-17** - a lightweight reasoning model optimized for ultra-low latency and cost efficiency
10 | - **Future-Ready Architecture**: Prepared foundation for advanced MCP features like resource links and elicitation
11 | 
12 | ## 🔧 Technical Implementation
13 | 
14 | ### Core MCP Upgrades
15 | - **SDK Upgrade**: Updated `@modelcontextprotocol/sdk` from 1.12.0 to 1.13.0
16 | - **Protocol Compliance**: Added mandatory `MCP-Protocol-Version: 2025-06-18` header for HTTP transport
17 | - **Breaking Change Handling**: Implemented proper header spreading to maintain backward compatibility
18 | - **Enhanced Interfaces**: Extended `MCPServer` interface with optional `title` and `_meta` fields
19 | 
20 | ### API Route Enhancements
21 | - **StreamableHTTP Transport**: Updated `app/api/chat/route.ts` with proper protocol version headers
22 | - **Header Management**: Improved header handling to ensure existing custom headers are preserved
23 | - **Error Resilience**: Maintained compatibility with existing MCP server configurations
24 | 
25 | ### UI/UX Improvements
26 | - **Server Manager**: Added display title field in `components/mcp-server-manager.tsx`
27 | - **Better Labeling**: Clear distinction between server ID (name) and display title
28 | - **User Guidance**: Added helpful placeholder text and descriptions for server configuration
29 | 
30 | ### Context & State Management
31 | - **MCP Context**: Enhanced `lib/context/mcp-context.tsx` with new metadata fields
32 | - **API Processing**: Updated server processing logic to handle title and metadata
33 | - **Type Safety**: Maintained full TypeScript support with proper interface extensions
34 | 
35 | ### AI Model Expansion
36 | - **Google Gemini 2.5 Flash Lite Preview**: Added latest lightweight reasoning model from Google
37 | - **Ultra-Low Latency**: Optimized for speed with improved throughput and faster token generation
38 | - **Cost Efficiency**: Premium performance at reduced computational cost
39 | - **Reasoning Capabilities**: Supports both speed-optimized and reasoning-enabled modes
40 | 
41 | ## 🛡️ Security & Compliance
42 | 
43 | - **Protocol Compliance**: Full adherence to MCP 1.13.0 specification requirements
44 | - **Header Security**: Proper header handling prevents injection vulnerabilities
45 | - **Backward Compatibility**: Existing MCP server configurations continue to work seamlessly
46 | - **Future-Proofing**: Ready for upcoming MCP security features like Resource Indicators (RFC 8707)
47 | 
48 | ## 📈 Benefits
49 | 
50 | ### For Users
51 | - **Better Organization**: Server titles make it easier to identify and manage MCP servers
52 | - **Improved Reliability**: Enhanced protocol compliance reduces connection issues
53 | - **New AI Model Choice**: Access to Google's latest Gemini 2.5 Flash Lite Preview with ultra-fast response times
54 | - **Cost-Effective AI**: High-quality reasoning capabilities at reduced computational cost
55 | - **Future Features**: Foundation laid for advanced MCP capabilities like interactive workflows
56 | 
57 | ### For Developers
58 | - **Latest Standards**: Access to cutting-edge MCP protocol features
59 | - **Enhanced Debugging**: Better server identification and metadata for troubleshooting
60 | - **Extensibility**: Prepared for implementing resource links, elicitation, and context-aware completions
61 | 
62 | ### For System Administrators
63 | - **Easier Management**: Clear server titles and descriptions for better organization
64 | - **Monitoring Ready**: Metadata fields enable better monitoring and analytics
65 | - **Scalability**: Improved architecture supports larger MCP server deployments
66 | 
67 | ## 🔄 Migration Notes
68 | 
69 | ### Automatic Upgrades
70 | - **Seamless Transition**: Existing MCP server configurations work without changes
71 | - **No Breaking Changes**: All current functionality preserved
72 | - **Backward Compatibility**: Older MCP servers continue to function normally
73 | 
74 | ### Optional Enhancements
75 | - **Server Titles**: Users can now add display titles to their MCP servers for better organization
76 | - **Metadata Support**: Optional `_meta` fields available for advanced server configurations
77 | - **Enhanced UI**: New server manager interface provides better configuration experience
78 | 
79 | ### For Advanced Users
80 | - **Protocol Headers**: HTTP-based MCP servers now include proper protocol version headers
81 | - **Future Features**: Codebase prepared for implementing resource links and elicitation capabilities
82 | - **Development Ready**: Full MCP 1.13.0 specification support for custom server development
83 | 
84 | ## 🚀 Deployment
85 | 
86 | ### Production Deployment
87 | ```bash
88 | # Verify build
89 | pnpm run build
90 | 
91 | # Deploy to production
92 | vercel deploy --prod
93 | ```
94 | 
95 | ### Environment Considerations
96 | - **No New Variables**: No additional environment variables required
97 | - **Existing Configs**: All current MCP server configurations remain valid
98 | - **Performance**: No performance impact from the upgrade
99 | 
100 | ### Verification Steps
101 | 1. **Test MCP Connections**: Verify existing MCP servers still connect properly
102 | 2. **UI Functionality**: Check MCP Server Manager displays correctly
103 | 3. **Protocol Compliance**: Confirm HTTP MCP servers receive proper headers
104 | 4. **Error Handling**: Ensure graceful handling of any connection issues
105 | 
106 | ## 📚 Documentation
107 | 
108 | - **Comprehensive Upgrade Guide**: Added detailed `MCP_UPGRADE_GUIDE.md` with step-by-step instructions
109 | - **Technical Details**: Complete documentation of all changes and breaking changes
110 | - **Migration Checklist**: Easy-to-follow checklist for developers implementing MCP features
111 | - **Future Roadmap**: Outlined upcoming MCP features and implementation plans
112 | 
113 | ## 🔧 Developer Experience
114 | 
115 | ### New Features Available
116 | - **Enhanced Server Configuration**: Better server management with titles and metadata
117 | - **Protocol Compliance**: Full MCP 1.13.0 specification support
118 | - **Future-Ready**: Prepared for implementing advanced MCP features
119 | 
120 | ### Technical Improvements
121 | - **Type Safety**: Enhanced TypeScript interfaces for better development experience
122 | - **Error Handling**: Improved error messages and debugging capabilities
123 | - **Code Organization**: Better separation of concerns in MCP-related code
124 | 
125 | ## 🎉 Looking Forward
126 | 
127 | This release establishes ChatLima as a cutting-edge MCP-compatible platform, ready for the next generation of AI tool integration. The foundation is now in place for implementing advanced features like:
128 | 
129 | - **Resource Links**: Direct linking to files and resources from tool outputs
130 | - **Interactive Workflows**: User confirmation and input collection via elicitation
131 | - **Context-Aware Completions**: Smarter auto-completion based on conversation context
132 | - **Enhanced Security**: Resource Indicators and advanced authentication
133 | 
134 | ---
135 | 
136 | **Full Changelog**: [v0.16.1...v0.17.0](https://github.com/brooksy4503/chatlima/compare/v0.16.1...v0.17.0)
137 | 
138 | **🔗 Links**
139 | - [GitHub Release](https://github.com/brooksy4503/chatlima/releases/tag/v0.17.0)
140 | - [MCP 1.13.0 Specification](https://modelcontextprotocol.io/specification/2025-06-18/changelog)
141 | - [MCP Upgrade Guide](https://github.com/brooksy4503/chatlima/blob/main/MCP_UPGRADE_GUIDE.md)
142 | 
143 | **🙏 Acknowledgments**
144 | Special thanks to the Model Context Protocol team for the excellent specification and SDK updates that make this integration possible. 
```

releases/RELEASE_NOTES_v0.17.1.md
```
1 | # 🚀 ChatLima v0.17.1 - Model Picker Premium Access Fix
2 | 
3 | ## 🎯 What's New
4 | 
5 | - **🔧 Critical Bug Fix**: Fixed premium model access checking in the Model Picker component
6 | - **✅ Improved Reliability**: Premium models now correctly respect user subscription status
7 | - **🎯 Enhanced UX**: Users can now properly access premium models when they have valid subscriptions
8 | 
9 | ## 🐛 Bug Fix Details
10 | 
11 | ### Issue Resolved
12 | Fixed a critical bug in the Model Picker component where premium model access was incorrectly evaluated. The `canAccessPremiumModels` function was being referenced as a variable instead of being called as a function, causing inconsistent behavior in premium model availability.
13 | 
14 | ### Technical Fix
15 | - **File**: `components/model-picker.tsx`
16 | - **Change**: Updated three instances where `canAccessPremiumModels` was used as a variable to properly call it as `canAccessPremiumModels()`
17 | - **Impact**: Premium models now correctly show as available or unavailable based on actual user subscription status
18 | 
19 | ### Affected Areas
20 | 1. **Model Unavailability Check**: Fixed main display logic that determines if a model should be shown as unavailable
21 | 2. **Keyboard Navigation**: Fixed Enter key handling to properly check premium access before model selection
22 | 3. **Model List Rendering**: Fixed visual state rendering for premium models in the dropdown list
23 | 
24 | ## 🔧 Technical Implementation
25 | 
26 | ### Code Changes
27 | ```typescript
28 | // Before (incorrect)
29 | const isModelUnavailable = creditsLoading ? false : (!canAccessPremiumModels && currentModelDetails.premium);
30 | 
31 | // After (fixed)
32 | const isModelUnavailable = creditsLoading ? false : (!canAccessPremiumModels() && currentModelDetails.premium);
33 | ```
34 | 
35 | ### Function Call Corrections
36 | - **Line 145**: Fixed model unavailability calculation for display
37 | - **Line 216**: Fixed keyboard navigation premium access check
38 | - **Line 290**: Fixed model list item rendering premium access check
39 | 
40 | ## 🛡️ Security & Privacy
41 | 
42 | - **Access Control**: Ensures premium models are only accessible to authorized users
43 | - **Subscription Validation**: Proper function calls now correctly validate user subscription status
44 | - **Data Protection**: Prevents unauthorized access to premium AI models and capabilities
45 | 
46 | ## 📈 Benefits
47 | 
48 | ### For Users
49 | - **Reliable Access**: Premium subscribers can now consistently access all premium models
50 | - **Clear Feedback**: Model availability status now accurately reflects subscription status
51 | - **Seamless Experience**: No more confusing model availability states
52 | 
53 | ### For Free Users
54 | - **Consistent Blocking**: Free users see consistent messaging about premium model access
55 | - **Clear Upgrade Path**: Better understanding of which models require premium subscription
56 | - **No False Positives**: Eliminates cases where premium models appeared available but weren't
57 | 
58 | ### For Premium Subscribers
59 | - **Full Access**: Complete and reliable access to all premium AI models
60 | - **Expected Behavior**: Model picker now works as intended for premium features
61 | - **Value Realization**: Can fully utilize their premium subscription benefits
62 | 
63 | ## 🔄 Migration Notes
64 | 
65 | ### Automatic Fix
66 | - **No User Action Required**: This is a code-level fix that applies automatically
67 | - **No Configuration Changes**: Existing user settings and preferences remain unchanged
68 | - **Immediate Effect**: Fix takes effect immediately upon deployment
69 | 
70 | ### Impact Assessment
71 | - **Breaking Changes**: None - this is a pure bug fix
72 | - **Data Migration**: Not required
73 | - **User Experience**: Only positive improvements to model access reliability
74 | 
75 | ## 🚀 Deployment
76 | 
77 | ### Safe Production Deployment
78 | ```bash
79 | # Verify current state
80 | git status
81 | 
82 | # Confirm version bump
83 | git log --oneline -3
84 | 
85 | # Deploy to production
86 | vercel deploy --prod
87 | ```
88 | 
89 | ### Verification Checklist
90 | - [ ] Premium users can access all premium models
91 | - [ ] Free users see consistent premium model blocking
92 | - [ ] Model picker displays correct availability states
93 | - [ ] Keyboard navigation respects premium access rules
94 | - [ ] No console errors related to model access
95 | 
96 | ## 🧪 Testing Scenarios
97 | 
98 | ### For Premium Users
99 | 1. Open model picker
100 | 2. Verify all premium models are available and selectable
101 | 3. Confirm no "upgrade required" messaging for premium models
102 | 4. Test keyboard navigation through premium models
103 | 
104 | ### For Free Users
105 | 1. Open model picker
106 | 2. Verify premium models show as requiring upgrade
107 | 3. Confirm premium models cannot be selected
108 | 4. Test that upgrade prompts appear correctly
109 | 
110 | ## 📊 Impact Analysis
111 | 
112 | ### Before Fix
113 | - Premium model access was inconsistent
114 | - Function reference instead of function call caused logic errors
115 | - Users experienced unpredictable model availability
116 | 
117 | ### After Fix
118 | - Reliable premium model access based on actual subscription status
119 | - Consistent user experience across all model selection methods
120 | - Proper enforcement of subscription-based feature access
121 | 
122 | ## 🎯 Quality Assurance
123 | 
124 | ### Code Quality
125 | - **Function Calls**: Proper function invocation ensures correct logic execution
126 | - **Consistency**: All three instances of the access check now use the same pattern
127 | - **Type Safety**: Maintained TypeScript compatibility and type checking
128 | 
129 | ### User Experience
130 | - **Predictability**: Model availability now matches user expectations
131 | - **Reliability**: Consistent behavior across different interaction methods
132 | - **Clarity**: Clear distinction between available and premium-only models
133 | 
134 | ---
135 | 
136 | **Full Changelog**: [v0.17.0...v0.17.1](https://github.com/brooksy4503/chatlima/compare/v0.17.0...v0.17.1)
137 | 
138 | **🔗 Links**
139 | - [GitHub Release](https://github.com/brooksy4503/chatlima/releases/tag/v0.17.1)
140 | - [Model Picker Component](https://github.com/brooksy4503/chatlima/blob/main/components/model-picker.tsx)
141 | 
142 | **🙏 Acknowledgments**
143 | Thank you to users who reported inconsistent premium model access behavior, helping us identify and resolve this critical issue. 
```

releases/RELEASE_NOTES_v0.17.2.md
```
1 | # 🚀 ChatLima v0.17.2 - Model Picker UI Fix
2 | 
3 | ## 🎯 What's New
4 | - **Fixed Model Picker UI Glitch**: Resolved an annoying layout issue where the model picker button would visually "flip" or change content when hovering over different models in the dropdown
5 | - **Improved User Experience**: The model picker now maintains a stable, consistent display while still showing detailed information about hovered models
6 | 
7 | ## 🔧 Technical Implementation
8 | - **Separated Display Logic**: Split the display logic to ensure the main button always shows the selected model, while the details panel shows the hovered/focused model
9 | - **Prevented Layout Flipping**: Updated [components/model-picker.tsx](mdc:chatlima/components/model-picker.tsx) to use separate state variables for button display vs. details panel content
10 | - **Enhanced Stability**: The main button now consistently shows `selectedModelDetails` instead of switching between different model states during user interaction
11 | 
12 | ## 🛡️ Security & Privacy
13 | - No security or privacy changes in this release
14 | 
15 | ## 📈 Benefits
16 | - **Better UX**: Users no longer experience confusing visual changes when browsing available models
17 | - **Improved Accessibility**: More predictable interface behavior for users navigating with keyboard or mouse
18 | - **Reduced Cognitive Load**: Stable button display reduces visual distraction during model selection
19 | 
20 | ## 🔄 Migration Notes
21 | - No breaking changes or migration required
22 | - Existing model selections and preferences remain unchanged
23 | 
24 | ## 🚀 Deployment
25 | - Standard deployment process
26 | - No environment changes required
27 | - No database migrations needed
28 | 
29 | ## 📋 Technical Details
30 | The fix involved updating the component's display logic:
31 | - **Before**: Single `displayModelId` variable caused button content to change during hover
32 | - **After**: Separate `selectedModelDetails` (for button) and `detailsPanelModelDetails` (for info panel)
33 | 
34 | This ensures the button always shows the currently selected model while the details panel can independently show information about hovered models.
35 | 
36 | ---
37 | 
38 | **Full Changelog**: [v0.17.1...v0.17.2](https://github.com/brooksy4503/chatlima/compare/v0.17.1...v0.17.2) 
```

releases/RELEASE_NOTES_v0.18.0.md
```
1 | # 🚀 ChatLima v0.18.0 - MASSIVE Model Library Expansion
2 | 
3 | ## 🎯 What's New
4 | - **🚀 MASSIVE MODEL EXPANSION**: Added **53 total enabled models** - The largest model library expansion in ChatLima history!
5 | - **🏢 Multi-Provider Coverage**: Models available through OpenRouter, Requesty, OpenAI, Anthropic, Groq, and X AI
6 | - **🤖 Leading AI Companies**: Now featuring models from OpenAI, Anthropic, Google, Meta, Mistral, DeepSeek, X AI, Qwen, MiniMax, and more
7 | - **⚡ Advanced Client Instantiation**: Completely rebuilt dynamic client creation with optimized helper functions
8 | - **📚 Complete Model Details**: All models include comprehensive descriptions, capabilities, and usage guidelines
9 | 
10 | ### 🎯 Model Expansion by Provider:
11 | 
12 | #### **OpenAI Models** (9 total)
13 | - **GPT-4.1 Series**: Full, Mini, Nano (OpenRouter & Requesty)
14 | - **GPT-4O Series**: Full & Mini (Requesty)  
15 | - **O4 Mini High** (OpenRouter)
16 | 
17 | #### **Anthropic Claude Models** (6 total)
18 | - **Claude 3.5 Sonnet** (OpenRouter & Requesty)
19 | - **Claude 3.7 Sonnet** (OpenRouter & Requesty, plus thinking variant)
20 | - **Claude 4 Series**: Sonnet & Opus (OpenRouter), Sonnet 20250514 (Requesty)
21 | 
22 | #### **Google Gemini Models** (13 total)  
23 | - **Gemini 2.5 Flash Series**: Preview, Preview with thinking, 05-20 variants, Lite Preview
24 | - **Gemini 2.5 Pro Series**: Preview 03-25, Preview 06-05, Full Pro
25 | - Available through both OpenRouter and Requesty
26 | 
27 | #### **DeepSeek Models** (8 total)
28 | - **DeepSeek R1 Series**: Original, 0528, Qwen3-8B variants
29 | - **DeepSeek V3 & Chat**: Latest versions with reasoning capabilities
30 | - **DeepSeek Reasoner**: Advanced reasoning model
31 | 
32 | #### **X AI Grok Models** (4 total)
33 | - **Grok 3 Beta**: Cutting-edge reasoning model
34 | - **Grok 3 Mini Beta**: Compact version with high reasoning variant
35 | 
36 | #### **Meta Llama Models** (3 total)
37 | - **Llama 4 Maverick**: Latest flagship
38 | - **Llama 3.1 70B & 3.3 70B Instruct**: Instruction-tuned variants
39 | 
40 | #### **Mistral Models** (5 total)
41 | - **Magistral Series**: Small & Medium 2506 (with thinking variant)
42 | - **Mistral Medium 3 & Small 3.1**: Latest versions
43 | 
44 | #### **Specialized Models** (5 total)
45 | - **Qwen QWQ Series**: 32B reasoning models
46 | - **MiniMax M1**: Extended context reasoning models  
47 | - **SentientAGI Dobby**: Crypto-focused fine-tuned model
48 | 
49 | ## 🔧 Technical Implementation
50 | - **Enhanced Provider System**: Updated [ai/providers.ts](mdc:chatlima/ai/providers.ts) with new model definitions and client routing
51 | - **Dynamic Client Creation**: Implemented optimized helper functions for better performance and maintainability
52 | - **Model Details Registry**: Extended `modelDetails` configuration with comprehensive information for all new models
53 | - **Provider Consistency**: Following [established naming convention][[memory:5531379627541588756]] with provider prefixes (OpenAI GPT-4.1, etc.)
54 | - **Improved Error Handling**: Enhanced fallback logic for unsupported model scenarios
55 | 
56 | ### Technical Highlights:
57 | - **GPT-4.1**: Flagship model excelling in instruction following, software engineering, and long-context reasoning with 1M token context
58 | - **GPT-4.1 Mini**: Balanced performance and speed for various tasks with coding and instruction following capabilities  
59 | - **GPT-4.1 Nano**: Fastest and cheapest in the series, designed for classification and autocompletion with exceptional performance
60 | 
61 | ## 🛡️ Security & Privacy
62 | - **Multi-Provider Access**: Enhanced redundancy through multiple provider options reduces single points of failure
63 | - **Secure Client Instantiation**: Improved client creation logic maintains secure API handling practices
64 | - **Model Capability Transparency**: Clear documentation of each model's capabilities helps users make informed security decisions
65 | 
66 | ## 📈 Benefits
67 | - **🎯 Unprecedented Choice**: Users now have access to **53 total AI models** from 9+ leading AI companies
68 | - **💰 Cost Optimization**: Models ranging from ultra-fast/cheap (GPT-4.1 Nano) to premium flagship models
69 | - **⚡ Performance Scaling**: From lightweight reasoning to massive context windows (up to 1M tokens)
70 | - **🛡️ Provider Redundancy**: Multiple provider access (6 providers) ensures exceptional availability and reliability  
71 | - **🧠 Specialized Capabilities**: Models optimized for coding, reasoning, multimodal tasks, creativity, crypto, and more
72 | - **🌍 Global Coverage**: Multilingual models supporting 20+ languages including English, German, French, Spanish, Hindi, Thai
73 | - **🔧 Developer-Focused**: Models specifically tuned for IDE integration, agents, and enterprise knowledge retrieval
74 | 
75 | ## 🎯 Model Capabilities Overview
76 | 
77 | ### 🚀 **Flagship Models**
78 | - **OpenAI GPT-4.1**: 1M token context, enterprise-grade reasoning, software engineering excellence
79 | - **Anthropic Claude 4 Opus**: Advanced reasoning, agentic tasks, long-context operations
80 | - **Google Gemini 2.5 Pro**: State-of-the-art performance, complex coding, multimodal understanding
81 | - **MiniMax M1**: 456B parameters, hybrid MoE architecture, extended context reasoning
82 | 
83 | ### ⚡ **Speed & Efficiency Champions**  
84 | - **GPT-4.1 Nano**: Ultra-fast, 1M context, cost-effective classification/autocompletion
85 | - **Gemini 2.5 Flash Lite**: Ultra-low latency, improved throughput, lightweight reasoning
86 | - **DeepSeek Chat V3**: Efficient performance, balanced capabilities
87 | 
88 | ### 🧠 **Reasoning Specialists**
89 | - **DeepSeek R1 Series**: Open-source reasoning on par with o1, transparent thinking tokens  
90 | - **Mistral Magistral Medium**: Multi-step problem solving, legal research, financial forecasting
91 | - **Grok 3 Beta**: Cutting-edge reasoning with X AI's latest innovations
92 | - **Qwen QWQ 32B**: Fast reasoning with efficiency focus
93 | 
94 | ### 🎨 **Multimodal & Creative Models**
95 | - **Gemini 2.5 Flash**: Built-in thinking, audio/video/image processing
96 | - **Claude 3.7 Sonnet**: Hybrid reasoning, visual processing, creative tasks
97 | - **GPT-4O**: Advanced multimodal capabilities with reasoning integration
98 | 
99 | ### 🌍 **Multilingual & Specialized**
100 | - **Llama 3.3 70B Instruct**: 8 languages, 128k context, conversational dialogue
101 | - **SentientAGI Dobby**: Crypto-focused, personal freedom advocacy, 131k context
102 | - **Magistral Small**: 20+ languages, enhanced instruction following
103 | 
104 | ## 🔄 Migration Notes
105 | - **No Breaking Changes**: All existing models and configurations remain fully functional
106 | - **Backward Compatible**: Existing user preferences and model selections are preserved
107 | - **Seamless Upgrade**: New models are immediately available in the model picker without configuration changes
108 | - **Note**: GPT-4.1 models do not support web search functionality (by design for optimal performance)
109 | 
110 | ## 🚀 Deployment
111 | - **Automatic Deployment**: Changes deploy automatically via GitHub integration
112 | - **No Environment Changes**: No new environment variables or configuration required
113 | - **No Database Changes**: No database migrations needed
114 | - **Immediate Availability**: New models become available immediately after deployment
115 | 
116 | ## 📋 Development Improvements
117 | - **Cleaner Code Structure**: Refactored model retrieval logic for better maintainability
118 | - **Performance Optimization**: Enhanced client creation reduces initialization overhead  
119 | - **Better Error Handling**: Improved fallback mechanisms for unsupported scenarios
120 | - **Documentation**: Comprehensive model descriptions for better user understanding
121 | 
122 | ## 🌟 Looking Forward
123 | This **MASSIVE expansion transforms ChatLima into the most comprehensive AI model platform available**, offering users an unprecedented **53 models from 9+ leading AI companies**. From OpenAI's flagship GPT-4.1 to Anthropic's Claude 4, Google's Gemini 2.5, Meta's Llama 4, and cutting-edge models from DeepSeek, X AI, Mistral, and more - ChatLima now provides unmatched choice, performance, and flexibility.
124 | 
125 | **ChatLima v0.18.0 sets a new standard for AI chat applications**, positioning users at the forefront of AI innovation with access to the latest and most advanced models through multiple reliable providers. Whether you need lightning-fast responses, deep reasoning, multimodal capabilities, or specialized tasks - ChatLima has the perfect model for every use case.
126 | 
127 | 🎯 **The future of AI is now accessible in one platform - ChatLima v0.18.0!**
128 | 
129 | ---
130 | 
131 | **Full Changelog**: [v0.17.2...v0.18.0](https://github.com/brooksy4503/chatlima/compare/v0.17.2...v0.18.0) 
```

releases/RELEASE_NOTES_v0.3.0.md
```
1 | # 🚀 ChatLima v0.3.0 - SEO & Sitemap Implementation
2 | 
3 | ## 🎯 What's New
4 | 
5 | ### 📍 Dynamic Sitemap Generation
6 | - **New Feature**: Added `/sitemap.xml` route with intelligent content generation
7 | - **Production-Only**: Sitemap is only available on production domain (`chatlima.com`) for security
8 | - **SEO Optimized**: Includes proper XML structure with `lastmod`, `changefreq`, and `priority` attributes
9 | - **Privacy-First**: Excludes private user content (chats, API endpoints, authentication pages)
10 | - **Extensible**: Easy-to-maintain structure for adding future public pages
11 | 
12 | ### 🤖 Enhanced Robots.txt
13 | - **Environment-Aware**: Different rules for production vs development environments
14 | - **Privacy Protection**: Explicitly disallows crawling of user chat content and sensitive endpoints
15 | - **Production Ready**: Allows search engine crawling of public pages while protecting user privacy
16 | - **Development Safe**: Completely disallows crawling in non-production environments
17 | 
18 | ## 🔧 Technical Implementation
19 | 
20 | ### Sitemap Features
21 | - Dynamic base URL detection using request headers
22 | - Proper XML formatting following sitemap protocol standards
23 | - 24-hour caching for optimal performance
24 | - Structured for easy addition of future pages (docs, pricing, about, etc.)
25 | 
26 | ### Robots.txt Features
27 | - Environment detection based on domain
28 | - Comprehensive crawl rules protecting user privacy
29 | - Sitemap reference for search engines
30 | - 1-hour caching for efficient delivery
31 | 
32 | ## 🛡️ Security & Privacy
33 | 
34 | - **User Privacy**: Chat content and user-specific pages are completely excluded from search indexing
35 | - **API Protection**: All API endpoints are disallowed from crawling
36 | - **Authentication Security**: Auth-related pages are protected from indexing
37 | - **Development Safety**: Non-production environments block all crawling
38 | 
39 | ## 📈 SEO Benefits
40 | 
41 | - **Search Engine Discovery**: Proper sitemap helps search engines find and index public content
42 | - **Crawl Efficiency**: Robots.txt guides search engines to relevant content while avoiding private areas
43 | - **Performance**: Caching headers ensure efficient delivery of SEO files
44 | - **Standards Compliance**: Follows official sitemap and robots.txt protocols
45 | 
46 | ## 🔄 Migration Notes
47 | 
48 | - No breaking changes in this release
49 | - New routes are automatically available: `/sitemap.xml` and `/robots.txt`
50 | - No database migrations required
51 | - No configuration changes needed
52 | 
53 | ## 🚀 Deployment
54 | 
55 | This release is ready for production deployment with no additional setup required. The sitemap and robots.txt will automatically adapt to your deployment environment.
56 | 
57 | ---
58 | 
59 | **Full Changelog**: [v0.2.0...v0.3.0](https://github.com/your-username/chatlima/compare/v0.2.0...v0.3.0)
60 | 
61 | ## 👥 Contributors
62 | 
63 | Thanks to all contributors who made this release possible!
64 | 
65 | ---
66 | 
67 | *For questions or issues, please open a GitHub issue or reach out to the maintainers.* 
```

releases/RELEASE_NOTES_v0.3.1.md
```
1 | # 🚀 ChatLima v0.3.1 - Documentation Link Update
2 | 
3 | ## 🎯 What's New
4 | - Added a new link to the documentation website.
5 | 
6 | ## 🔧 Technical Implementation
7 | - Updated relevant files to include the new documentation link.
8 | 
9 | ## 🛡️ Security & Privacy
10 | - No security or privacy related changes in this update.
11 | 
12 | ## 📈 Benefits
13 | - Improved access to documentation for users.
14 | 
15 | ## 🔄 Migration Notes
16 | - No breaking changes.
17 | - No configuration changes required.
18 | - No database migrations needed.
19 | 
20 | ## 🚀 Deployment
21 | - Standard deployment procedures apply.
22 | - No special environment considerations.
23 | - No special setup requirements.
24 | 
25 | ---
26 | 
27 | **Full Changelog**: [v0.3.0...v0.3.1](https://github.com/brooksy4503/chatlima/compare/v0.3.0...v0.3.1) 
```

releases/RELEASE_NOTES_v0.4.0.md
```
1 | # 🚀 ChatLima v0.4.0 - Support for DeepSeek R1 0528
2 | 
3 | ## 🎯 What's New
4 | - Added support for the DeepSeek R1 0528 model.
5 | - Users can now select DeepSeek R1 0528 for chat interactions.
6 | - Enhanced model selection capabilities in the UI.
7 | 
8 | ## 🔧 Technical Implementation
9 | - Integrated DeepSeek R1 0528 API.
10 | - Updated model provider logic to include DeepSeek.
11 | - Modified chat interface to accommodate new model options.
12 | - New API route for DeepSeek interactions (if applicable, specify route).
13 | 
14 | ## 🛡️ Security & Privacy
15 | - Ensured secure API key management for DeepSeek.
16 | - Maintained existing privacy standards with the new model integration.
17 | - No changes to user data handling.
18 | 
19 | ## 📈 Benefits
20 | - Access to a new, powerful language model.
21 | - Potentially improved response quality and capabilities.
22 | - More options for users to tailor their chat experience.
23 | 
24 | ## 🔄 Migration Notes
25 | - No breaking changes.
26 | - Ensure DeepSeek API key is configured in environment variables if self-hosting.
27 | - No database migrations needed.
28 | 
29 | ## 🚀 Deployment
30 | - Standard deployment process.
31 | - Verify DeepSeek API connectivity in the production environment.
32 | - Ensure `.env` includes `DEEPSEEK_API_KEY` (or similar).
33 | 
34 | ---
35 | 
36 | **Full Changelog**: [v0.3.1...v0.4.0](https://github.com/brooksy4503/chatlima/compare/v0.3.1...v0.4.0) 
```

releases/RELEASE_NOTES_v0.4.1.md
```
1 | # 🚀 ChatLima v0.4.1 - Model Updates and Refinements
2 | 
3 | ## 🎯 What's New
4 | - Added new DeepSeek R1 0528 model to disabled servers list for specific configurations.
5 | - Updated DeepSeek R1 0528 model description and capabilities for better user understanding.
6 | 
7 | ## 🔧 Technical Implementation
8 | - Refactored model descriptions for Grok models These models can use Tool Calling (MCP Servers).
9 | - Enhanced error handling in the chat API for clearer responses and improved debugging.
10 | 
11 | ---
12 | 
13 | **Full Changelog**: [v0.4.0...v0.4.1](https://github.com/username/chatlima/compare/v0.4.0...v0.4.1) 
```

releases/RELEASE_NOTES_v0.5.0.md
```
1 | # 🚀 ChatLima v0.5.0 - Premium Access Control & Enhanced Model Management
2 | 
3 | ## 🎯 What's New
4 | - **Premium Model Access Control**: Introduced intelligent credit checking system for premium AI models
5 | - **Enhanced Model Management**: Added new "DeepSeek R1 0528 Qwen3 8B" model with proper access controls
6 | - **Improved User Experience**: Better feedback and access control throughout the application
7 | - **Smart Model Picker**: Real-time premium access validation in model selection interface
8 | 
9 | ## 🔧 Technical Implementation
10 | - Added premium flag support to model definitions for fine-grained access control
11 | - Implemented credit checking logic in chat API (`/api/chat`) for premium model usage
12 | - Enhanced model picker component with real-time premium access validation
13 | - Updated chat API to include new DeepSeek R1 model in server-specific disabled lists
14 | - Improved error handling and user feedback mechanisms across the platform
15 | 
16 | ## 🛡️ Security & Privacy
17 | - Robust access control prevents unauthorized use of premium models
18 | - Server-side validation ensures credit requirements are properly enforced
19 | - Enhanced error handling provides clear feedback without exposing sensitive system details
20 | 
21 | ## 📈 Benefits
22 | - **Better User Experience**: Clear feedback when premium models require credits
23 | - **Resource Management**: Prevents accidental usage of premium models without sufficient credits
24 | - **Improved Performance**: Optimized model access validation reduces unnecessary API calls
25 | - **Enhanced Accessibility**: Better model availability management across different server configurations
26 | 
27 | ## 🔄 Migration Notes
28 | - No breaking changes in this release
29 | - Existing chat sessions and model preferences are preserved
30 | - Premium model access is now properly validated - users may need sufficient credits to access certain models
31 | 
32 | ## 🚀 Deployment
33 | - Standard deployment process applies
34 | - No database migrations required
35 | - Environment variables remain unchanged
36 | - Ensure credit system is properly configured for premium model access
37 | 
38 | ## 🎨 User Interface Enhancements
39 | - Model picker now shows real-time premium access status
40 | - Improved error messages for better user guidance
41 | - Enhanced visual feedback for model availability
42 | 
43 | ---
44 | 
45 | **Full Changelog**: [v0.4.1...v0.5.0](https://github.com/brooksy4503/chatlima/compare/v0.4.1...v0.5.0) 
```

releases/RELEASE_NOTES_v0.5.1.md
```
1 | # 🚀 ChatLima v0.5.1 - Debugging & Traceability Enhancements
2 | 
3 | ## 🎯 What's New
4 | - Enhanced debugging capabilities in credits API and user credits tracking
5 | - Improved error traceability across session validation and credit management
6 | - Better development experience with comprehensive logging for troubleshooting
7 | - Cleaner repository structure with updated .gitignore configurations
8 | 
9 | ## 🔧 Technical Implementation
10 | - **Enhanced Debugging Logs**: Added comprehensive debug logging to credits API endpoints for better issue diagnosis
11 | - **useCredits Hook Improvements**: Enhanced the useCredits hook with detailed error tracking and session validation logs
12 | - **Repository Cleanup**: Added documentation directory to .gitignore to maintain cleaner version control
13 | - **Error Handling**: Improved error handling and logging in credit fetching operations for better debugging
14 | 
15 | ## 🛡️ Security & Privacy
16 | - Enhanced session validation logging helps identify potential authentication issues
17 | - Improved credit system monitoring maintains better financial security oversight
18 | - Debug logs are structured to avoid exposing sensitive user information
19 | 
20 | ## 📈 Benefits
21 | - **Developer Experience**: Faster debugging and issue resolution with detailed logging
22 | - **System Reliability**: Better monitoring of credit operations reduces financial discrepancies
23 | - **Troubleshooting**: Enhanced traceability makes it easier to identify and fix issues
24 | - **Maintenance**: Cleaner repository structure improves long-term maintainability
25 | 
26 | ## 🔄 Migration Notes
27 | - No breaking changes in this patch release
28 | - Existing functionality remains fully compatible
29 | - Debug logs are automatically enabled - no configuration changes required
30 | - .gitignore updates are automatically applied
31 | 
32 | ## 🚀 Deployment
33 | - Standard deployment process applies
34 | - No additional setup or configuration required
35 | - Compatible with all existing environments
36 | - Debug logging works in both development and production environments
37 | 
38 | ## 🔍 Technical Details
39 | - **Files Enhanced**: Credits API routes, useCredits hook implementation
40 | - **Logging Scope**: Session validation, credit fetching, error handling
41 | - **Development**: Improved .gitignore for documentation directories
42 | - **Monitoring**: Better visibility into credit system operations
43 | 
44 | ---
45 | 
46 | **Full Changelog**: [v0.5.0...v0.5.1](https://github.com/brooksy4503/chatlima/compare/v0.5.0...v0.5.1) 
```

releases/RELEASE_NOTES_v0.5.2.md
```
1 | # 🚀 ChatLima v0.5.2 - Enhanced Credit Management & Error Handling
2 | 
3 | ## 🎯 What's New
4 | - **Improved Credit Balance Checks**: Enhanced validation to prevent negative credit balance issues
5 | - **Better Error Handling**: More robust error handling in chat API for better user experience
6 | - **Enhanced Token Usage Tracking**: Refined credit deduction logic for more accurate billing
7 | - **Cleaner Codebase**: Updated .gitignore for better project management
8 | 
9 | ## 🔧 Technical Implementation
10 | - **Credit Management Overhaul**: Implemented comprehensive checks for negative credit balances in chat API
11 | - **Enhanced Credit Fetching Logic**: Improved credit retrieval mechanisms with better error handling
12 | - **Refined Token Usage Tracking**: Updated credit deduction logic to ensure accurate reporting and user feedback
13 | - **Project Maintenance**: Added Aider-related files to .gitignore for better development workflow management
14 | 
15 | ## 🛡️ Security & Privacy
16 | - **Credit Validation**: Strengthened credit balance validation to prevent unauthorized usage
17 | - **Error Response Security**: Improved error handling to avoid exposing sensitive information
18 | - **User Session Protection**: Enhanced session validation for better security
19 | 
20 | ## 📈 Benefits
21 | - **Improved User Experience**: Better error messages and feedback when credit issues occur
22 | - **More Accurate Billing**: Enhanced token tracking ensures users are charged correctly
23 | - **Reduced Support Issues**: Better error handling prevents common credit-related problems
24 | - **Development Efficiency**: Cleaner project structure with improved .gitignore management
25 | 
26 | ## 🔄 Migration Notes
27 | - No breaking changes in this patch release
28 | - All existing functionality remains compatible
29 | - Credit management improvements are automatically applied
30 | 
31 | ## 🚀 Deployment
32 | - Standard deployment process applies
33 | - No special configuration changes required
34 | - Enhanced error handling will automatically improve user experience
35 | 
36 | ---
37 | 
38 | **Full Changelog**: [v0.5.1...v0.5.2](https://github.com/brooksy4503/chatlima/compare/v0.5.1...v0.5.2) 
```

releases/RELEASE_NOTES_v0.6.0.md
```
1 | # 🚀 ChatLima v0.6.0 - OpenRouter Pricing Analysis Tool
2 | 
3 | ## 🎯 What's New
4 | 
5 | - **📊 Real-time Pricing Analysis**: New developer tool to analyze OpenRouter model costs in real-time
6 | - **💰 Cost Planning Dashboard**: Calculate estimated costs for different user scenarios (anonymous vs Google users)
7 | - **📈 Data-Driven Insights**: Token estimates based on actual ChatLima usage data from 1,254 real API requests
8 | - **🎯 Model Comparison**: Side-by-side cost analysis for all ChatLima-configured models
9 | - **📋 Formatted Reports**: Clean table output with daily/monthly cost projections
10 | 
11 | ## 🔧 Technical Implementation
12 | 
13 | ### New Scripts Added:
14 | - **`scripts/openrouter-pricing-analysis.ts`**: Main pricing analysis tool with real-time API integration
15 | - **`scripts/analyze-openrouter-data.py`**: Python script for analyzing historical usage data
16 | - **`scripts/README.md`**: Comprehensive documentation for developer tools
17 | 
18 | ### Enhanced Package Configuration:
19 | - Added `tsx` dependency for TypeScript script execution
20 | - New npm script: `pricing:analysis` for easy tool execution
21 | - Updated package.json with real-world token estimates
22 | 
23 | ### Key Technical Features:
24 | - Direct OpenRouter API integration for live pricing data
25 | - TypeScript implementation with proper error handling
26 | - Configurable token estimates based on actual usage patterns
27 | - Support for both npm and direct execution methods
28 | 
29 | ## 🛡️ Security & Privacy
30 | 
31 | - **🔐 API Key Protection**: Secure handling of OpenRouter API credentials via environment variables
32 | - **🎯 Developer-Only Tool**: Scripts are designed for development/analysis use only, not user-facing
33 | - **📊 Privacy-First Data Analysis**: Historical usage analysis uses aggregated, anonymized data
34 | 
35 | ## 📈 Benefits
36 | 
37 | ### For Developers:
38 | - **💡 Informed Decision Making**: Choose cost-effective models based on real data
39 | - **📊 Budget Forecasting**: Accurate monthly cost projections for different usage scenarios
40 | - **🔍 Real-time Monitoring**: Track pricing changes and model performance
41 | - **⚡ Quick Analysis**: Run pricing analysis in seconds with simple npm command
42 | 
43 | ### For Business:
44 | - **💰 Cost Optimization**: Identify most cost-effective models for different use cases
45 | - **📈 Scalability Planning**: Understand cost implications of user growth
46 | - **🎯 Model Strategy**: Data-driven model selection for optimal cost/performance ratio
47 | 
48 | ### For Users:
49 | - **🚀 Better Performance**: Optimized model selection based on cost-effectiveness analysis
50 | - **💚 Sustainable Service**: Enhanced cost management supports long-term service sustainability
51 | 
52 | ## 📊 Data-Driven Accuracy
53 | 
54 | ### Real Usage Analysis:
55 | - Analyzed **1,254 actual ChatLima requests** from OpenRouter API
56 | - **Input tokens**: 2,701 average (based on real avg: 2,251 + 20% buffer)
57 | - **Output tokens**: 441 average (based on real avg: 368 + 20% buffer)
58 | - **More accurate projections**: ~$0.003/request vs previous overestimates
59 | 
60 | ### Model Coverage:
61 | - Analysis covers all ChatLima-configured models
62 | - Real-time pricing from OpenRouter API
63 | - Cost comparison across 30+ AI models
64 | 
65 | ## 🔄 Migration Notes
66 | 
67 | ### For Developers:
68 | - No breaking changes to existing functionality
69 | - New optional tool requires OpenRouter API key in `.env` file
70 | - Scripts are completely separate from main application code
71 | 
72 | ### Environment Setup:
73 | ```bash
74 | # Add to your .env file (for developers only)
75 | OPENROUTER_API_KEY=your_api_key_here
76 | ```
77 | 
78 | ### New Commands Available:
79 | ```bash
80 | # Run pricing analysis
81 | pnpm run pricing:analysis
82 | 
83 | # Analyze historical data (if you have CSV exports)
84 | python scripts/analyze-openrouter-data.py /path/to/data.csv
85 | ```
86 | 
87 | ## 🚀 Deployment
88 | 
89 | ### Development Environment:
90 | 1. Ensure OpenRouter API key is configured in `.env`
91 | 2. Install dependencies: `pnpm install`
92 | 3. Run analysis: `pnpm run pricing:analysis`
93 | 
94 | ### Production Considerations:
95 | - Scripts are development-only tools
96 | - No impact on production application
97 | - No new environment variables required for production deployment
98 | 
99 | ## 🎯 Usage Examples
100 | 
101 | ### Quick Cost Analysis:
102 | ```bash
103 | pnpm run pricing:analysis
104 | ```
105 | 
106 | ### Expected Output:
107 | - Detailed pricing table for all models
108 | - Daily/monthly cost estimates
109 | - Most/least expensive model identification
110 | - Price comparison ratios
111 | 
112 | ### Use Cases:
113 | - **Pre-deployment**: Cost planning for new features
114 | - **Model Selection**: Choose optimal models for specific scenarios
115 | - **Budget Planning**: Monthly cost forecasting
116 | - **Performance Monitoring**: Track pricing trends over time
117 | 
118 | ## 🔮 Future Enhancements
119 | 
120 | - Automated pricing alerts for significant changes
121 | - Historical pricing trend analysis
122 | - Integration with usage monitoring
123 | - Cost optimization recommendations
124 | 
125 | ---
126 | 
127 | **Full Changelog**: [v0.5.2...v0.6.0](https://github.com/brooksy4503/chatlima/compare/v0.5.2...v0.6.0)
128 | 
129 | ## 🙏 Acknowledgments
130 | 
131 | This release includes pricing analysis based on real ChatLima usage data, providing developers with accurate, data-driven insights for cost optimization and model selection. 
```

releases/RELEASE_NOTES_v0.8.0.md
```
1 | # 🚀 ChatLima v0.8.0 - Requesty Provider & Enhanced Model Selection
2 | 
3 | ## 🎯 What's New
4 | - **New AI Provider**: Introduced Requesty as a new AI provider option alongside OpenRouter, Anthropic, OpenAI, Groq, and X AI
5 | - **7 New Requesty Models**: Access popular AI models through Requesty's infrastructure:
6 |   - `requesty/openai/gpt-4o` - OpenAI's advanced GPT-4O model
7 |   - `requesty/openai/gpt-4o-mini` - Efficient GPT-4O Mini variant  
8 |   - `requesty/anthropic/claude-3.5-sonnet` - Anthropic's Claude 3.5 Sonnet
9 |   - `requesty/anthropic/claude-3.7-sonnet` - Latest Claude 3.7 Sonnet
10 |   - `requesty/google/gemini-2.5-flash-preview` - Google's Gemini 2.5 Flash
11 |   - `requesty/meta-llama/llama-3.1-70b-instruct` - Meta's Llama 3.1 70B
12 |   - `requesty/anthropic/claude-sonnet-4-20250514` - Claude Sonnet 4 (May 2025)
13 | - **New OpenRouter Model**: Added `google/gemini-2.5-pro-preview` - Google's state-of-the-art AI model for advanced reasoning, coding, mathematics, and scientific tasks
14 | - **Enhanced Model Diversity**: Users now have access to 8 additional high-quality AI models across multiple providers
15 | 
16 | ## 🔧 Technical Implementation
17 | - Integrated `@requesty/ai-sdk` package (version ^0.0.7) for Requesty provider support
18 | - Added Requesty client configuration with proper API key management and headers
19 | - Updated `ai/providers.ts` with comprehensive Requesty model definitions
20 | - Enhanced model metadata with detailed capabilities, pricing tiers, and web search support
21 | - Maintained consistent provider architecture for seamless integration
22 | - Added proper error handling and API key fallback mechanisms
23 | 
24 | ## 🛡️ Security & Privacy
25 | - Implemented secure API key management for Requesty provider through environment variables
26 | - Added proper request headers including HTTP-Referer and X-Title for provider identification
27 | - Maintained existing security protocols across all provider integrations
28 | - Ensured consistent authentication flow for new provider
29 | 
30 | ## 📈 Benefits
31 | - **Expanded Choice**: Users can now choose from 8 additional AI models based on their specific needs
32 | - **Provider Redundancy**: Multiple providers offer increased reliability and availability
33 | - **Cost Options**: Mix of premium and standard models provides flexibility for different use cases
34 | - **Performance Variety**: Access to models optimized for different tasks (reasoning, coding, efficiency)
35 | - **Future-Proofing**: Establishes foundation for easy addition of more Requesty models
36 | 
37 | ## 🔄 Migration Notes
38 | - **No Breaking Changes**: Existing users continue to use their current models without any changes
39 | - **Automatic Detection**: New Requesty models are automatically available in the model picker
40 | - **API Key Setup**: Users wanting to use Requesty models need to add `REQUESTY_API_KEY` to their environment variables
41 | - **Backward Compatibility**: All existing OpenRouter, Anthropic, OpenAI, Groq, and X AI models remain fully functional
42 | 
43 | ## 🚀 Deployment
44 | - No special deployment requirements - changes are backward compatible
45 | - New models become available immediately after deployment
46 | - Users can start using Requesty models by adding their API key to environment variables
47 | - All existing functionality remains unchanged
48 | 
49 | ## 🎯 Model Highlights
50 | 
51 | ### Requesty Provider Models:
52 | - **GPT-4O Series**: Advanced OpenAI models with reasoning and multimodal capabilities
53 | - **Claude Series**: Anthropic's latest models including Claude 3.5, 3.7, and Sonnet 4
54 | - **Gemini 2.5 Flash**: Google's fast and efficient model optimized for speed
55 | - **Llama 3.1 70B**: Meta's open-source model for instruction following
56 | 
57 | ### OpenRouter Addition:
58 | - **Gemini 2.5 Pro Preview**: Google's flagship model for advanced reasoning and scientific tasks
59 | 
60 | ---
61 | 
62 | **Full Changelog**: [v0.7.0...v0.8.0](https://github.com/brooksy4503/chatlima/compare/v0.7.0...v0.8.0) 
```

releases/RELEASE_NOTES_v0.9.0.md
```
1 | # 🚀 ChatLima v0.9.0 - Enhanced API Key Management
2 | 
3 | ## 🎯 What's New
4 | - **Dynamic API Key Management**: Runtime API key overrides for all AI providers
5 | - **Enhanced Client Creation**: New helper functions for creating clients with custom API keys
6 | - **Improved UI Experience**: Better API key settings interface in the chat and sidebar components
7 | - **Flexible Provider Configuration**: Support for per-request API key customization
8 | 
9 | ## 🔧 Technical Implementation
10 | - Added new provider helper functions supporting runtime API key overrides
11 | - Introduced dynamic client creation utilities for flexible API key management
12 | - Enhanced chat and sidebar components with new API key management features
13 | - Improved user interface for API key configuration and settings
14 | - Streamlined provider initialization with dynamic configuration support
15 | 
16 | ## 🛡️ Security & Privacy
17 | - Enhanced API key handling with secure runtime management
18 | - Improved isolation of API key configurations per request
19 | - Better protection of user-provided API keys through dynamic handling
20 | - Secure client creation patterns for API key management
21 | 
22 | ## 📈 Benefits
23 | - **User Flexibility**: Users can now provide their own API keys for any supported provider
24 | - **Cost Control**: Better control over API usage and costs with custom keys
25 | - **Provider Independence**: Reduced dependency on system-wide API key configurations
26 | - **Enhanced UX**: Streamlined interface for managing API keys across different providers
27 | 
28 | ## 🔄 Migration Notes
29 | - No breaking changes in this release
30 | - Existing API key configurations remain fully compatible
31 | - New dynamic features are additive and optional
32 | - All existing provider integrations continue to work unchanged
33 | 
34 | ## 🚀 Deployment
35 | - Standard deployment process applies
36 | - No additional configuration required
37 | - New features are automatically available after deployment
38 | - Backward compatibility maintained for all existing functionality
39 | 
40 | ---
41 | 
42 | **Full Changelog**: [v0.8.0...v0.9.0](https://github.com/brooksy4503/chatlima/compare/v0.8.0...v0.9.0) 
```

releases/RELEASE_NOTES_v0.9.1.md
```
1 | # 🚀 ChatLima v0.9.1 - Smart Credit Validation
2 | 
3 | ## 🎯 What's New
4 | - **Smart Credit Validation**: Intelligent credit checking that bypasses validation when users provide their own API keys
5 | - **Enhanced User Experience**: Users with personal API keys now get seamless access without credit deductions
6 | - **Flexible Payment Model**: Automatic detection of user-provided API keys to optimize credit usage
7 | 
8 | ## 🔧 Technical Implementation
9 | - Added `isUsingOwnApiKey()` helper function to detect when users are using personal API keys
10 | - Enhanced credit validation logic in chat route to conditionally bypass credit checks
11 | - Improved request handling with intelligent API key detection
12 | - Streamlined credit deduction process for better user experience
13 | - Updated chat route logic with 72 insertions and 36 deletions for robust implementation
14 | 
15 | ## 🛡️ Security & Privacy
16 | - Secure API key detection without exposing sensitive information
17 | - Improved credit validation logic that maintains security while enhancing flexibility
18 | - Safe handling of user-provided API keys during validation process
19 | 
20 | ## 📈 Benefits
21 | - **Cost Efficiency**: Users with personal API keys avoid unnecessary credit deductions
22 | - **Better UX**: Seamless experience for users who provide their own API keys
23 | - **Smart Resource Management**: Automatic optimization of credit usage based on API key source
24 | - **Enhanced Flexibility**: System adapts to different user configurations automatically
25 | 
26 | ## 🔄 Migration Notes
27 | - No breaking changes in this patch release
28 | - Existing credit validation continues to work for users without personal API keys
29 | - New logic is additive and automatically detects the optimal validation path
30 | - All existing functionality remains fully compatible
31 | 
32 | ## 🚀 Deployment
33 | - Standard deployment process applies
34 | - No additional configuration required
35 | - Changes are automatically active after deployment
36 | - Backward compatibility maintained for all user scenarios
37 | 
38 | ---
39 | 
40 | **Full Changelog**: [v0.9.0...v0.9.1](https://github.com/brooksy4503/chatlima/compare/v0.9.0...v0.9.1) 
```

scripts/analyze-openrouter-data.py
```
1 | #!/usr/bin/env python3
2 | 
3 | """
4 | OpenRouter Data Analysis Script
5 | 
6 | This script analyzes the OpenRouter activity CSV to determine realistic token estimates
7 | for the pricing analysis tool.
8 | 
9 | Usage: python scripts/analyze-openrouter-data.py /path/to/openrouter_activity.csv
10 | """
11 | 
12 | import csv
13 | import statistics
14 | import sys
15 | from collections import defaultdict
16 | 
17 | def analyze_openrouter_data(csv_file_path):
18 |     """Analyze OpenRouter CSV data to extract token usage statistics."""
19 |     
20 |     data = []
21 |     app_stats = defaultdict(list)
22 |     model_stats = defaultdict(list)
23 |     
24 |     print("🔍 Analyzing OpenRouter activity data...")
25 |     print("=" * 50)
26 |     
27 |     # Read and parse CSV data
28 |     with open(csv_file_path, 'r') as file:
29 |         reader = csv.DictReader(file)
30 |         for row in reader:
31 |             # Filter for actual completion data (exclude cancelled/failed)
32 |             if (row['tokens_prompt'] and row['tokens_completion'] and 
33 |                 row['cancelled'] == 'false' and 
34 |                 int(row['tokens_prompt']) > 0 and 
35 |                 int(row['tokens_completion']) > 0):
36 |                 
37 |                 prompt_tokens = int(row['tokens_prompt'])
38 |                 completion_tokens = int(row['tokens_completion'])
39 |                 app_name = row['app_name']
40 |                 model = row['model_permaslug']
41 |                 cost = float(row['cost_total']) if row['cost_total'] else 0
42 |                 
43 |                 data.append({
44 |                     'prompt_tokens': prompt_tokens,
45 |                     'completion_tokens': completion_tokens,
46 |                     'total_tokens': prompt_tokens + completion_tokens,
47 |                     'app_name': app_name,
48 |                     'model': model,
49 |                     'cost': cost
50 |                 })
51 |                 
52 |                 app_stats[app_name].append({
53 |                     'prompt': prompt_tokens,
54 |                     'completion': completion_tokens,
55 |                     'total': prompt_tokens + completion_tokens
56 |                 })
57 |                 
58 |                 model_stats[model].append({
59 |                     'prompt': prompt_tokens,
60 |                     'completion': completion_tokens,
61 |                     'total': prompt_tokens + completion_tokens,
62 |                     'cost': cost
63 |                 })
64 |     
65 |     if not data:
66 |         print("❌ No valid data found in CSV file!")
67 |         return
68 |     
69 |     print(f"📊 Analyzed {len(data)} valid API requests")
70 |     print()
71 |     
72 |     # Overall statistics
73 |     prompt_tokens = [d['prompt_tokens'] for d in data]
74 |     completion_tokens = [d['completion_tokens'] for d in data]
75 |     total_tokens = [d['total_tokens'] for d in data]
76 |     costs = [d['cost'] for d in data if d['cost'] > 0]
77 |     
78 |     print("📈 OVERALL TOKEN STATISTICS")
79 |     print("-" * 30)
80 |     print(f"Prompt Tokens:")
81 |     print(f"  • Average: {statistics.mean(prompt_tokens):,.0f}")
82 |     print(f"  • Median:  {statistics.median(prompt_tokens):,.0f}")
83 |     print(f"  • Min:     {min(prompt_tokens):,.0f}")
84 |     print(f"  • Max:     {max(prompt_tokens):,.0f}")
85 |     print()
86 |     
87 |     print(f"Completion Tokens:")
88 |     print(f"  • Average: {statistics.mean(completion_tokens):,.0f}")
89 |     print(f"  • Median:  {statistics.median(completion_tokens):,.0f}")
90 |     print(f"  • Min:     {min(completion_tokens):,.0f}")
91 |     print(f"  • Max:     {max(completion_tokens):,.0f}")
92 |     print()
93 |     
94 |     print(f"Total Tokens:")
95 |     print(f"  • Average: {statistics.mean(total_tokens):,.0f}")
96 |     print(f"  • Median:  {statistics.median(total_tokens):,.0f}")
97 |     print()
98 |     
99 |     if costs:
100 |         print(f"Cost per Request:")
101 |         print(f"  • Average: ${statistics.mean(costs):.6f}")
102 |         print(f"  • Median:  ${statistics.median(costs):.6f}")
103 |         print(f"  • Total:   ${sum(costs):.4f}")
104 |         print()
105 |     
106 |     # App-specific statistics (ChatLima focus)
107 |     print("🎯 APP-SPECIFIC STATISTICS")
108 |     print("-" * 30)
109 |     for app_name, requests in app_stats.items():
110 |         if len(requests) >= 5:  # Only show apps with significant usage
111 |             prompts = [r['prompt'] for r in requests]
112 |             completions = [r['completion'] for r in requests]
113 |             
114 |             print(f"{app_name} ({len(requests)} requests):")
115 |             print(f"  • Avg Prompt: {statistics.mean(prompts):,.0f} tokens")
116 |             print(f"  • Avg Completion: {statistics.mean(completions):,.0f} tokens")
117 |             print(f"  • Median Prompt: {statistics.median(prompts):,.0f} tokens")
118 |             print(f"  • Median Completion: {statistics.median(completions):,.0f} tokens")
119 |             print()
120 |     
121 |     # Model-specific statistics for high-usage models
122 |     print("🤖 TOP MODELS BY USAGE")
123 |     print("-" * 30)
124 |     model_usage = [(model, len(requests)) for model, requests in model_stats.items()]
125 |     model_usage.sort(key=lambda x: x[1], reverse=True)
126 |     
127 |     for model, count in model_usage[:10]:  # Top 10 models
128 |         requests = model_stats[model]
129 |         prompts = [r['prompt'] for r in requests]
130 |         completions = [r['completion'] for r in requests]
131 |         model_costs = [r['cost'] for r in requests if r['cost'] > 0]
132 |         
133 |         print(f"{model} ({count} requests):")
134 |         print(f"  • Avg Prompt: {statistics.mean(prompts):,.0f} tokens")
135 |         print(f"  • Avg Completion: {statistics.mean(completions):,.0f} tokens")
136 |         if model_costs:
137 |             print(f"  • Avg Cost: ${statistics.mean(model_costs):.6f}")
138 |         print()
139 |     
140 |     # ChatLima-specific recommendations
141 |     chatlima_data = [d for d in data if d['app_name'] == 'ChatLima']
142 |     if chatlima_data:
143 |         print("🎯 CHATLIMA-SPECIFIC RECOMMENDATIONS")
144 |         print("-" * 40)
145 |         
146 |         chatlima_prompts = [d['prompt_tokens'] for d in chatlima_data]
147 |         chatlima_completions = [d['completion_tokens'] for d in chatlima_data]
148 |         
149 |         avg_prompt = statistics.mean(chatlima_prompts)
150 |         avg_completion = statistics.mean(chatlima_completions)
151 |         median_prompt = statistics.median(chatlima_prompts)
152 |         median_completion = statistics.median(chatlima_completions)
153 |         
154 |         print(f"Based on {len(chatlima_data)} ChatLima requests:")
155 |         print()
156 |         print(f"📊 Current estimates in script: 5000 input, 3000 output")
157 |         print(f"📈 Actual averages: {avg_prompt:.0f} input, {avg_completion:.0f} output")
158 |         print(f"📉 Actual medians: {median_prompt:.0f} input, {median_completion:.0f} output")
159 |         print()
160 |         
161 |         # Recommendations
162 |         recommended_input = max(int(avg_prompt * 1.2), int(median_prompt * 1.5))  # 20% buffer on average or 50% on median
163 |         recommended_output = max(int(avg_completion * 1.2), int(median_completion * 1.5))
164 |         
165 |         print("💡 RECOMMENDED ESTIMATES:")
166 |         print(f"   ESTIMATED_INPUT_TOKENS = {recommended_input}")
167 |         print(f"   ESTIMATED_OUTPUT_TOKENS = {recommended_output}")
168 |         print()
169 |         print("🔍 These estimates include a buffer for realistic usage scenarios")
170 |         
171 |         # Cost impact analysis
172 |         chatlima_costs = [d['cost'] for d in chatlima_data if d['cost'] > 0]
173 |         if chatlima_costs:
174 |             avg_cost_per_request = statistics.mean(chatlima_costs)
175 |             daily_cost_anon = avg_cost_per_request * 10
176 |             daily_cost_google = avg_cost_per_request * 20
177 |             monthly_cost_anon = daily_cost_anon * 30
178 |             monthly_cost_google = daily_cost_google * 30
179 |             
180 |             print()
181 |             print("💰 ACTUAL COST ANALYSIS (ChatLima):")
182 |             print(f"   Average cost per request: ${avg_cost_per_request:.6f}")
183 |             print(f"   Anonymous users (10/day): ${daily_cost_anon:.6f}/day, ${monthly_cost_anon:.4f}/month")
184 |             print(f"   Google users (20/day): ${daily_cost_google:.6f}/day, ${monthly_cost_google:.4f}/month")
185 | 
186 | if __name__ == "__main__":
187 |     if len(sys.argv) != 2:
188 |         print("Usage: python scripts/analyze-openrouter-data.py /path/to/openrouter_activity.csv")
189 |         sys.exit(1)
190 |     
191 |     csv_file_path = sys.argv[1]
192 |     try:
193 |         analyze_openrouter_data(csv_file_path)
194 |     except FileNotFoundError:
195 |         print(f"❌ Error: Could not find file {csv_file_path}")
196 |         sys.exit(1)
197 |     except Exception as e:
198 |         print(f"❌ Error: {e}")
199 |         sys.exit(1) 
```

scripts/debug-polar-api.ts
```
1 | #!/usr/bin/env tsx
2 | 
3 | /**
4 |  * Polar API Debug Tool (TypeScript version)
5 |  * 
6 |  * This script helps debug Polar API connection issues by testing:
7 |  * - Environment variables
8 |  * - API connectivity
9 |  * - Customer lookup
10 |  * - Credits retrieval
11 |  * - Token validation
12 |  */
13 | 
14 | import 'dotenv/config';
15 | import { Polar } from '@polar-sh/sdk';
16 | 
17 | // Colors for console output
18 | const colors = {
19 |     red: '\x1b[31m',
20 |     green: '\x1b[32m',
21 |     yellow: '\x1b[33m',
22 |     blue: '\x1b[34m',
23 |     magenta: '\x1b[35m',
24 |     cyan: '\x1b[36m',
25 |     reset: '\x1b[0m',
26 |     bold: '\x1b[1m'
27 | };
28 | 
29 | function log(color: string, message: string) {
30 |     console.log(`${color}${message}${colors.reset}`);
31 | }
32 | 
33 | function section(title: string) {
34 |     console.log(`\n${colors.bold}${colors.cyan}=== ${title} ===${colors.reset}`);
35 | }
36 | 
37 | async function main() {
38 |     log(colors.bold, '🔍 Polar API Debug Tool (TypeScript)');
39 |     log(colors.blue, 'Testing your local Polar API configuration...\n');
40 | 
41 |     // 1. Load environment variables from .env.local
42 |     const dotenv = await import('dotenv');
43 |     dotenv.config({ path: '.env.local' });
44 | 
45 |     // 2. Check Environment Variables
46 |     section('Environment Variables');
47 | 
48 |     const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;
49 |     const polarServerEnv = process.env.POLAR_SERVER_ENV;
50 |     const polarProductId = process.env.POLAR_PRODUCT_ID;
51 | 
52 |     log(colors.yellow, `POLAR_ACCESS_TOKEN: ${polarAccessToken ? '✓ Set' : '✗ Not set'}`);
53 |     if (polarAccessToken) {
54 |         log(colors.blue, `  Length: ${polarAccessToken.length} characters`);
55 |         log(colors.blue, `  Starts with: ${polarAccessToken.substring(0, 10)}...`);
56 |         log(colors.blue, `  Ends with: ...${polarAccessToken.substring(polarAccessToken.length - 10)}`);
57 |     }
58 | 
59 |     log(colors.yellow, `POLAR_SERVER_ENV: ${polarServerEnv || 'Not set (defaults to sandbox)'}`);
60 |     log(colors.yellow, `POLAR_PRODUCT_ID: ${polarProductId ? '✓ Set' : '✗ Not set'}`);
61 | 
62 |     const actualEnv = polarServerEnv === "production" ? "production" : "sandbox";
63 |     log(colors.magenta, `Computed environment: ${actualEnv}`);
64 | 
65 |     if (!polarAccessToken) {
66 |         log(colors.red, '❌ POLAR_ACCESS_TOKEN is required. Please set it in .env.local');
67 |         return;
68 |     }
69 | 
70 |     // 3. Initialize Polar Client
71 |     section('Polar Client Initialization');
72 | 
73 |     let polarClient: Polar;
74 |     try {
75 |         polarClient = new Polar({
76 |             accessToken: polarAccessToken,
77 |             server: actualEnv as "production" | "sandbox",
78 |         });
79 |         log(colors.green, `✓ Polar client initialized for ${actualEnv} environment`);
80 |     } catch (error: any) {
81 |         log(colors.red, `❌ Failed to initialize Polar client: ${error.message}`);
82 |         return;
83 |     }
84 | 
85 |     // 4. Test Basic API Connectivity
86 |     section('API Connectivity Test');
87 | 
88 |     try {
89 |         // Try to list products (this should work with any valid token)
90 |         const products = await polarClient.products.list({ limit: 1 });
91 |         log(colors.green, '✓ Basic API connectivity successful');
92 | 
93 |         // Check if we can iterate (test pagination)
94 |         let productCount = 0;
95 |         for await (const product of products) {
96 |             productCount++;
97 |             if (productCount >= 1) break; // Just test first product
98 |         }
99 |         log(colors.green, `✓ API pagination working (found ${productCount} products)`);
100 | 
101 |     } catch (error: any) {
102 |         log(colors.red, `❌ Basic API connectivity failed:`);
103 |         log(colors.red, `   Status: ${error.statusCode || 'Unknown'}`);
104 |         log(colors.red, `   Message: ${error.message}`);
105 |         log(colors.red, `   Body: ${error.body || 'No body'}`);
106 | 
107 |         if (error.statusCode === 401) {
108 |             log(colors.yellow, '⚠️  401 Unauthorized - Your token may be:');
109 |             log(colors.yellow, '   • Expired');
110 |             log(colors.yellow, '   • Invalid');
111 |             log(colors.yellow, '   • For wrong environment (sandbox token used in production)');
112 |         }
113 |         return;
114 |     }
115 | 
116 |     // 5. Test Customer Operations
117 |     section('Customer Operations Test');
118 | 
119 |     // Test user ID (you can replace this with a real user ID for more specific testing)
120 |     const testUserId = 'test-user-id-' + Date.now();
121 | 
122 |     try {
123 |         // Test customer creation
124 |         log(colors.blue, `Testing customer creation with external ID: ${testUserId}`);
125 |         const testCustomer = await polarClient.customers.create({
126 |             email: `test-${Date.now()}@example.com`,
127 |             name: 'Test User',
128 |             externalId: testUserId
129 |         });
130 |         log(colors.green, `✓ Customer creation successful: ${testCustomer.id}`);
131 | 
132 |         // Test customer lookup by external ID
133 |         log(colors.blue, 'Testing customer lookup by external ID...');
134 |         const foundCustomer = await polarClient.customers.getExternal({
135 |             externalId: testUserId
136 |         });
137 |         log(colors.green, `✓ Customer lookup successful: ${foundCustomer.id}`);
138 | 
139 |         // Test customer state retrieval
140 |         log(colors.blue, 'Testing customer state retrieval...');
141 |         const customerState = await polarClient.customers.getStateExternal({
142 |             externalId: testUserId
143 |         });
144 |         log(colors.green, `✓ Customer state retrieval successful`);
145 |         log(colors.blue, `   Active meters: ${(customerState as any).activeMeters?.length || 0}`);
146 |         log(colors.blue, `   Legacy meters: ${(customerState as any).meters?.length || 0}`);
147 | 
148 |         // Clean up test customer
149 |         try {
150 |             await polarClient.customers.delete({ id: testCustomer.id });
151 |             log(colors.green, '✓ Test customer cleaned up');
152 |         } catch (cleanupError: any) {
153 |             log(colors.yellow, `⚠️  Could not clean up test customer: ${cleanupError.message}`);
154 |         }
155 | 
156 |     } catch (error: any) {
157 |         log(colors.red, `❌ Customer operations failed:`);
158 |         log(colors.red, `   Status: ${error.statusCode || 'Unknown'}`);
159 |         log(colors.red, `   Message: ${error.message}`);
160 |         log(colors.red, `   Body: ${error.body || 'No body'}`);
161 | 
162 |         if (error.statusCode === 401) {
163 |             log(colors.yellow, '⚠️  This confirms the 401 error you\'re seeing in your app');
164 |         }
165 |     }
166 | 
167 |     // 6. Test with Real User (if provided)
168 |     const realUserId = process.argv[2];
169 |     if (realUserId) {
170 |         section(`Real User Test (ID: ${realUserId})`);
171 | 
172 |         try {
173 |             log(colors.blue, `Looking up customer with external ID: ${realUserId}`);
174 |             const customer = await polarClient.customers.getExternal({
175 |                 externalId: realUserId
176 |             });
177 |             log(colors.green, `✓ Found customer: ${customer.id} (${customer.email})`);
178 | 
179 |             log(colors.blue, 'Getting customer state...');
180 |             const customerState = await polarClient.customers.getStateExternal({
181 |                 externalId: realUserId
182 |             });
183 | 
184 |             log(colors.green, '✓ Customer state retrieved successfully');
185 |             log(colors.blue, `   Active meters: ${(customerState as any).activeMeters?.length || 0}`);
186 | 
187 |             // Look for credits
188 |             const activeMeters = (customerState as any).activeMeters || [];
189 |             let creditsFound = false;
190 | 
191 |             for (const meter of activeMeters) {
192 |                 if (meter.meterId) {
193 |                     try {
194 |                         const meterDetails = await polarClient.meters.get({ id: meter.meterId });
195 |                         if (meterDetails?.name === 'Message Credits Used') {
196 |                             log(colors.green, `✓ Found credits meter: ${meter.balance || 0} credits`);
197 |                             creditsFound = true;
198 |                         }
199 |                     } catch (meterError: any) {
200 |                         log(colors.yellow, `⚠️  Could not get meter details: ${meterError.message}`);
201 |                     }
202 |                 }
203 |             }
204 | 
205 |             if (!creditsFound) {
206 |                 log(colors.yellow, '⚠️  No "Message Credits Used" meter found for this user');
207 |             }
208 | 
209 |         } catch (error: any) {
210 |             log(colors.red, `❌ Real user test failed:`);
211 |             log(colors.red, `   Status: ${error.statusCode || 'Unknown'}`);
212 |             log(colors.red, `   Message: ${error.message}`);
213 |             log(colors.red, `   Body: ${error.body || 'No body'}`);
214 |         }
215 |     }
216 | 
217 |     // 7. Replicate Your App's Logic
218 |     section('App Logic Replication');
219 | 
220 |     log(colors.blue, 'Testing the exact same logic as your getRemainingCreditsByExternalId function...');
221 | 
222 |     if (realUserId) {
223 |         try {
224 |             // This replicates the exact logic in lib/polar.ts
225 |             console.log(`[DEBUG] Attempting to get credits for external ID: ${realUserId}`);
226 | 
227 |             const customerState = await polarClient.customers.getStateExternal({
228 |                 externalId: realUserId
229 |             });
230 | 
231 |             console.log(`[DEBUG] Customer state response:`, JSON.stringify(customerState, null, 2));
232 | 
233 |             if (!customerState) {
234 |                 console.log(`[DEBUG] No customer state found for external ID: ${realUserId}`);
235 |                 log(colors.yellow, '⚠️  No customer state found');
236 |             } else {
237 |                 const activeMeters = (customerState as any).activeMeters || [];
238 |                 console.log(`[DEBUG] Found ${activeMeters.length} active meters for user ${realUserId}`);
239 | 
240 |                 // Search for the correct "Message Credits Used" meter among active meters
241 |                 for (const meter of activeMeters) {
242 |                     console.log(`[DEBUG] Active meter:`, JSON.stringify(meter, null, 2));
243 | 
244 |                     // Try to get the full meter details to check the name
245 |                     if (meter.meterId) {
246 |                         try {
247 |                             const meterDetails = await polarClient.meters.get({
248 |                                 id: meter.meterId
249 |                             });
250 |                             console.log(`[DEBUG] Meter details for ${meter.meterId}:`, JSON.stringify(meterDetails, null, 2));
251 | 
252 |                             if (meterDetails?.name === 'Message Credits Used') {
253 |                                 const balance = meter.balance || 0;
254 |                                 console.log(`[DEBUG] Found 'Message Credits Used' active meter with balance: ${balance}`);
255 |                                 log(colors.green, `✓ Credits found using app logic: ${balance}`);
256 |                                 break;
257 |                             }
258 |                         } catch (meterError: any) {
259 |                             console.warn(`[DEBUG] Failed to get meter details for ${meter.meterId}:`, meterError);
260 |                         }
261 |                     }
262 |                 }
263 |             }
264 |         } catch (error: any) {
265 |             log(colors.red, `❌ App logic replication failed:`);
266 |             log(colors.red, `   This is the EXACT same error as in your app!`);
267 |             log(colors.red, `   Status: ${error.statusCode || 'Unknown'}`);
268 |             log(colors.red, `   Message: ${error.message}`);
269 |             log(colors.red, `   Body: ${error.body || 'No body'}`);
270 |         }
271 |     }
272 | 
273 |     // 8. Environment Comparison
274 |     section('Environment Analysis');
275 | 
276 |     log(colors.blue, 'Current configuration:');
277 |     log(colors.blue, `  • Environment: ${actualEnv}`);
278 |     log(colors.blue, `  • Token length: ${polarAccessToken.length}`);
279 |     log(colors.blue, `  • Node.js version: ${process.version}`);
280 |     log(colors.blue, `  • Platform: ${process.platform}`);
281 |     log(colors.blue, `  • Working directory: ${process.cwd()}`);
282 | 
283 |     log(colors.yellow, '\nNext steps:');
284 |     log(colors.yellow, '1. Compare this output with your production logs');
285 |     log(colors.yellow, '2. If basic API connectivity fails, check your token in Polar dashboard');
286 |     log(colors.yellow, '3. If customer operations fail, verify token permissions');
287 |     log(colors.yellow, '4. Run with a real user ID: npx tsx scripts/debug-polar-api.ts YOUR_USER_ID');
288 | 
289 |     log(colors.green, '\n✅ Debug script completed');
290 | }
291 | 
292 | main().catch(error => {
293 |     log(colors.red, `\n💥 Script failed with error: ${error.message}`);
294 |     console.error(error);
295 |     process.exit(1);
296 | }); 
```

scripts/openrouter-pricing-analysis.ts
```
1 | #!/usr/bin/env tsx
2 | 
3 | /**
4 |  * OpenRouter Pricing Analysis Tool
5 |  * 
6 |  * This developer-only script fetches pricing information for all OpenRouter models
7 |  * configured in the application and calculates estimated costs for different user types.
8 |  * 
9 |  * Usage: npx tsx scripts/openrouter-pricing-analysis.ts
10 |  */
11 | 
12 | import dotenv from 'dotenv';
13 | 
14 | // Load environment variables
15 | dotenv.config();
16 | 
17 | interface OpenRouterModel {
18 |     id: string;
19 |     name: string;
20 |     description: string;
21 |     context_length: number;
22 |     architecture: {
23 |         modality: string;
24 |         tokenizer: string;
25 |         instruct_type: string;
26 |     };
27 |     pricing: {
28 |         prompt: string;  // Price per token for input
29 |         completion: string;  // Price per token for output
30 |         image?: string;  // Price per image (if applicable)
31 |         request?: string;  // Price per request (if applicable)
32 |     };
33 |     top_provider: {
34 |         context_length: number;
35 |         max_completion_tokens: number | null;
36 |         is_moderated: boolean;
37 |     };
38 |     per_request_limits: {
39 |         prompt_tokens: string;
40 |         completion_tokens: string;
41 |     } | null;
42 | }
43 | 
44 | interface PricingAnalysis {
45 |     modelId: string;
46 |     displayName: string;
47 |     inputPricePerToken: number;
48 |     outputPricePerToken: number;
49 |     estimatedInputTokens: number;
50 |     estimatedOutputTokens: number;
51 |     costPerMessage: number;
52 |     costAnonDaily: number;  // 10 messages per day
53 |     costGoogleDaily: number;  // 20 messages per day
54 |     costAnonMonthly: number;  // 10 * 30 days
55 |     costGoogleMonthly: number;  // 20 * 30 days
56 | }
57 | 
58 | // Extract OpenRouter model IDs from our configuration
59 | const openRouterModels = [
60 |     'anthropic/claude-3.5-sonnet',
61 |     'anthropic/claude-3.7-sonnet',
62 |     'anthropic/claude-3.7-sonnet:thinking',
63 |     'deepseek/deepseek-chat-v3-0324',
64 |     'deepseek/deepseek-r1',
65 |     'deepseek/deepseek-r1-0528',
66 |     'deepseek/deepseek-r1-0528-qwen3-8b',
67 |     'google/gemini-2.5-flash-preview',
68 |     'google/gemini-2.5-flash-preview:thinking',
69 |     'google/gemini-2.5-flash-preview-05-20',
70 |     'google/gemini-2.5-flash-preview-05-20:thinking',
71 |     'google/gemini-2.5-pro-preview-03-25',
72 |     'openai/gpt-4.1',
73 |     'openai/gpt-4.1-mini',
74 |     'x-ai/grok-3-beta',
75 |     'x-ai/grok-3-mini-beta',
76 |     'mistralai/mistral-medium-3',
77 |     'mistralai/mistral-small-3.1-24b-instruct',
78 |     'meta-llama/llama-4-maverick',
79 |     'openai/o4-mini-high',
80 |     'qwen/qwq-32b',
81 |     'qwen/qwen3-235b-a22b',
82 |     'anthropic/claude-sonnet-4',
83 |     'anthropic/claude-opus-4'
84 | ];
85 | 
86 | // Model display names mapping
87 | const modelDisplayNames: Record<string, string> = {
88 |     'anthropic/claude-3.5-sonnet': 'Claude 3.5 Sonnet',
89 |     'anthropic/claude-3.7-sonnet': 'Claude 3.7 Sonnet',
90 |     'anthropic/claude-3.7-sonnet:thinking': 'Claude 3.7 Sonnet (thinking)',
91 |     'deepseek/deepseek-chat-v3-0324': 'DeepSeek Chat V3',
92 |     'deepseek/deepseek-r1': 'DeepSeek R1',
93 |     'deepseek/deepseek-r1-0528': 'DeepSeek R1 (0528)',
94 |     'deepseek/deepseek-r1-0528-qwen3-8b': 'DeepSeek R1 0528 Qwen3 8B',
95 |     'google/gemini-2.5-flash-preview': 'Gemini 2.5 Flash Preview',
96 |     'google/gemini-2.5-flash-preview:thinking': 'Gemini 2.5 Flash Preview (thinking)',
97 |     'google/gemini-2.5-flash-preview-05-20': 'Gemini 2.5 Flash Preview (05-20)',
98 |     'google/gemini-2.5-flash-preview-05-20:thinking': 'Gemini 2.5 Flash Preview (05-20, thinking)',
99 |     'google/gemini-2.5-pro-preview-03-25': 'Gemini 2.5 Pro Preview (03-25)',
100 |     'openai/gpt-4.1': 'GPT-4.1',
101 |     'openai/gpt-4.1-mini': 'GPT-4.1 Mini',
102 |     'x-ai/grok-3-beta': 'Grok 3 Beta',
103 |     'x-ai/grok-3-mini-beta': 'Grok 3 Mini Beta',
104 |     'mistralai/mistral-medium-3': 'Mistral Medium 3',
105 |     'mistralai/mistral-small-3.1-24b-instruct': 'Mistral Small 3.1 24B',
106 |     'meta-llama/llama-4-maverick': 'Llama 4 Maverick',
107 |     'openai/o4-mini-high': 'O4 Mini High',
108 |     'qwen/qwq-32b': 'Qwen QWQ 32B',
109 |     'qwen/qwen3-235b-a22b': 'Qwen3 235B A22B',
110 |     'anthropic/claude-sonnet-4': 'Claude 4 Sonnet',
111 |     'anthropic/claude-opus-4': 'Claude 4 Opus'
112 | };
113 | 
114 | async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
115 |     const apiKey = process.env.OPENROUTER_API_KEY;
116 | 
117 |     if (!apiKey) {
118 |         throw new Error('OPENROUTER_API_KEY not found in environment variables');
119 |     }
120 | 
121 |     console.log('🔍 Fetching OpenRouter model data...');
122 | 
123 |     const response = await fetch('https://openrouter.ai/api/v1/models', {
124 |         headers: {
125 |             'Authorization': `Bearer ${apiKey}`,
126 |             'Content-Type': 'application/json',
127 |         },
128 |     });
129 | 
130 |     if (!response.ok) {
131 |         throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
132 |     }
133 | 
134 |     const data = await response.json();
135 |     return data.data;
136 | }
137 | 
138 | function calculatePricing(models: OpenRouterModel[]): PricingAnalysis[] {
139 |     // Estimated tokens per message (based on actual ChatLima usage data)
140 |     const ESTIMATED_INPUT_TOKENS = 2701;  // User prompt + context (avg: 2251 + 20% buffer)
141 |     const ESTIMATED_OUTPUT_TOKENS = 441;  // AI response (avg: 368 + 20% buffer)
142 | 
143 |     const analyses: PricingAnalysis[] = [];
144 | 
145 |     for (const model of models) {
146 |         if (!openRouterModels.includes(model.id)) {
147 |             continue; // Skip models not in our configuration
148 |         }
149 | 
150 |         const inputPricePerToken = parseFloat(model.pricing.prompt);
151 |         const outputPricePerToken = parseFloat(model.pricing.completion);
152 | 
153 |         const inputCost = (ESTIMATED_INPUT_TOKENS * inputPricePerToken) / 1000000; // Convert from per-million to actual
154 |         const outputCost = (ESTIMATED_OUTPUT_TOKENS * outputPricePerToken) / 1000000;
155 |         const costPerMessage = inputCost + outputCost;
156 | 
157 |         analyses.push({
158 |             modelId: model.id,
159 |             displayName: modelDisplayNames[model.id] || model.name,
160 |             inputPricePerToken,
161 |             outputPricePerToken,
162 |             estimatedInputTokens: ESTIMATED_INPUT_TOKENS,
163 |             estimatedOutputTokens: ESTIMATED_OUTPUT_TOKENS,
164 |             costPerMessage,
165 |             costAnonDaily: costPerMessage * 10,  // 10 messages per day for anon
166 |             costGoogleDaily: costPerMessage * 20, // 20 messages per day for Google users
167 |             costAnonMonthly: costPerMessage * 10 * 30,  // Monthly cost for anon
168 |             costGoogleMonthly: costPerMessage * 20 * 30, // Monthly cost for Google users
169 |         });
170 |     }
171 | 
172 |     // Sort by cost per message (descending - most expensive first)
173 |     return analyses.sort((a, b) => b.costPerMessage - a.costPerMessage);
174 | }
175 | 
176 | function formatCurrency(amount: number): string {
177 |     return `${amount.toFixed(6)}`;
178 | }
179 | 
180 | function displayPricingTable(analyses: PricingAnalysis[]): void {
181 |     console.log('\n📊 OpenRouter Model Pricing Analysis');
182 |     console.log('=====================================\n');
183 | 
184 |     // Table header
185 |     console.log('Model'.padEnd(35) +
186 |         'Input/M'.padEnd(12) +
187 |         'Output/M'.padEnd(12) +
188 |         'Per Msg'.padEnd(12) +
189 |         'Anon Daily'.padEnd(12) +
190 |         'Google Daily'.padEnd(14) +
191 |         'Anon Monthly'.padEnd(14) +
192 |         'Google Monthly');
193 |     console.log('-'.repeat(35 + 12 + 12 + 12 + 12 + 14 + 14 + 14));
194 | 
195 |     // Table rows
196 |     for (const analysis of analyses) {
197 |         console.log(
198 |             analysis.displayName.substring(0, 34).padEnd(35) +
199 |             formatCurrency(analysis.inputPricePerToken).padEnd(12) +
200 |             formatCurrency(analysis.outputPricePerToken).padEnd(12) +
201 |             formatCurrency(analysis.costPerMessage).padEnd(12) +
202 |             formatCurrency(analysis.costAnonDaily).padEnd(12) +
203 |             formatCurrency(analysis.costGoogleDaily).padEnd(14) +
204 |             formatCurrency(analysis.costAnonMonthly).padEnd(14) +
205 |             formatCurrency(analysis.costGoogleMonthly)
206 |         );
207 |     }
208 | 
209 |     console.log('\n💡 Notes:');
210 |     console.log(`• Input/Output pricing is per million tokens`);
211 |     console.log(`• Per message estimate: ${analyses[0]?.estimatedInputTokens || 500} input + ${analyses[0]?.estimatedOutputTokens || 300} output tokens`);
212 |     console.log('• Anonymous users: 10 messages/day limit');
213 |     console.log('• Google users: 20 messages/day limit');
214 |     console.log('• Monthly estimates assume 30 days');
215 | }
216 | 
217 | function displayCostSummary(analyses: PricingAnalysis[]): void {
218 |     if (analyses.length === 0) return;
219 | 
220 |     const mostExpensive = analyses[0];
221 |     const cheapest = analyses[analyses.length - 1];
222 | 
223 |     console.log('\n💰 Cost Summary');
224 |     console.log('===============\n');
225 | 
226 |     console.log('🔥 MOST EXPENSIVE MODEL:');
227 |     console.log(`   ${mostExpensive.displayName}`);
228 |     console.log(`   Anonymous users (10 msg/day): ${formatCurrency(mostExpensive.costAnonDaily)}/day, ${formatCurrency(mostExpensive.costAnonMonthly)}/month`);
229 |     console.log(`   Google users (20 msg/day): ${formatCurrency(mostExpensive.costGoogleDaily)}/day, ${formatCurrency(mostExpensive.costGoogleMonthly)}/month`);
230 | 
231 |     console.log('\n💚 CHEAPEST MODEL:');
232 |     console.log(`   ${cheapest.displayName}`);
233 |     console.log(`   Anonymous users (10 msg/day): ${formatCurrency(cheapest.costAnonDaily)}/day, ${formatCurrency(cheapest.costAnonMonthly)}/month`);
234 |     console.log(`   Google users (20 msg/day): ${formatCurrency(cheapest.costGoogleDaily)}/day, ${formatCurrency(cheapest.costGoogleMonthly)}/month`);
235 | 
236 |     const ratio = mostExpensive.costPerMessage / cheapest.costPerMessage;
237 |     console.log(`\n📈 Price Difference: Most expensive is ${ratio.toFixed(1)}x more costly than cheapest`);
238 | }
239 | 
240 | async function main(): Promise<void> {
241 |     try {
242 |         console.log('🚀 OpenRouter Pricing Analysis Tool');
243 |         console.log('===================================\n');
244 | 
245 |         const models = await fetchOpenRouterModels();
246 |         console.log(`✅ Fetched ${models.length} total models from OpenRouter`);
247 | 
248 |         const analyses = calculatePricing(models);
249 |         console.log(`📋 Analyzing ${analyses.length} models configured in ChatLima`);
250 | 
251 |         displayPricingTable(analyses);
252 |         displayCostSummary(analyses);
253 | 
254 |         console.log('\n✨ Analysis complete!');
255 | 
256 |     } catch (error) {
257 |         console.error('❌ Error:', error instanceof Error ? error.message : String(error));
258 |         process.exit(1);
259 |     }
260 | }
261 | 
262 | // Run the script
263 | if (require.main === module) {
264 |     main();
265 | } 
```

tests/auth.local.setup.ts
```
1 | import { test as setup, expect } from '@playwright/test';
2 | 
3 | const authFile = 'playwright/.auth/local-user.json';
4 | 
5 | setup('authenticate locally', async ({ page }) => {
6 |     console.log('🔐 Starting local authentication setup...');
7 | 
8 |     // Go to local ChatLima
9 |     await page.goto('/', { waitUntil: 'networkidle' });
10 | 
11 |     // Take a screenshot to see what we're dealing with
12 |     await page.screenshot({ path: 'playwright-report/local-auth-step-1-initial-load.png' });
13 | 
14 |     // Check what page we're on
15 |     const title = await page.title();
16 |     console.log(`📄 Page title: "${title}"`);
17 | 
18 |     // Wait for the page to stabilize
19 |     await page.waitForTimeout(2000);
20 | 
21 |     // Check if we have ChatLima interface
22 |     const chatLimaHeading = page.locator('h1:has-text("ChatLima")');
23 |     const signInButton = page.getByRole('button', { name: 'Sign in with Google' });
24 | 
25 |     // Verify we have the ChatLima interface
26 |     await expect(chatLimaHeading).toBeVisible();
27 |     console.log('✅ ChatLima interface detected on localhost');
28 | 
29 |     // Check if we need to sign in
30 |     if (await signInButton.isVisible()) {
31 |         console.log('🔑 Sign in button available - for local testing, we can continue with anonymous user');
32 |         console.log('💡 Local development typically supports anonymous users out of the box');
33 |     } else {
34 |         console.log('✅ Already authenticated or anonymous access available');
35 |     }
36 | 
37 |     // Wait for the interface to settle
38 |     await page.waitForTimeout(2000);
39 | 
40 |     // Save authentication state (anonymous state for local)
41 |     await page.context().storageState({ path: authFile });
42 | 
43 |     console.log('💾 Local authentication state saved to:', authFile);
44 |     console.log('✨ Local authentication setup completed');
45 | }); 
```

tests/auth.setup.ts
```
1 | import { test as setup, expect } from '@playwright/test';
2 | 
3 | const authFile = 'playwright/.auth/user.json';
4 | 
5 | setup('authenticate', async ({ page }) => {
6 |     console.log('🔐 Starting authentication setup...');
7 | 
8 |     // Go to ChatLima
9 |     await page.goto('https://preview.chatlima.com/', { waitUntil: 'networkidle' });
10 | 
11 |     // Take a screenshot to see what we're dealing with
12 |     await page.screenshot({ path: 'playwright-report/auth-step-1-initial-load.png' });
13 | 
14 |     // Check what page we're on
15 |     const title = await page.title();
16 |     console.log(`📄 Page title: "${title}"`);
17 | 
18 |     if (title.includes('Login – Vercel')) {
19 |         console.log('🚫 Detected Vercel login page - this means the preview site requires authentication');
20 |         console.log('💡 You may need to set up proper preview authentication or use a different URL');
21 | 
22 |         // Let's try to continue anyway and see if we can get past it
23 |         await page.waitForTimeout(3000);
24 |     }
25 | 
26 |     // Wait for the page to stabilize
27 |     await page.waitForTimeout(2000);
28 | 
29 |     // Check if we have ChatLima interface
30 |     const chatLimaHeading = page.locator('h1:has-text("ChatLima")');
31 |     const signInButton = page.getByRole('button', { name: 'Sign in with Google' });
32 | 
33 |     if (await chatLimaHeading.isVisible()) {
34 |         console.log('✅ ChatLima interface detected');
35 | 
36 |         // Check if we need to sign in
37 |         if (await signInButton.isVisible()) {
38 |             console.log('🔑 Sign in required - attempting Google authentication');
39 | 
40 |             // Click the Google sign in button
41 |             await signInButton.click();
42 | 
43 |             // Handle the authentication flow
44 |             try {
45 |                 // Wait for either Google OAuth or redirect back
46 |                 await page.waitForURL(/accounts\.google\.com|preview\.chatlima\.com/, { timeout: 10000 });
47 | 
48 |                 if (page.url().includes('accounts.google.com')) {
49 |                     console.log('🌐 Redirected to Google OAuth');
50 | 
51 |                     // Fill in Google credentials if environment variables are set
52 |                     if (process.env.TEST_GOOGLE_EMAIL && process.env.TEST_GOOGLE_PASSWORD) {
53 |                         console.log('🤖 Using automated Google authentication');
54 | 
55 |                         // Fill email
56 |                         await page.fill('input[type="email"]', process.env.TEST_GOOGLE_EMAIL);
57 |                         await page.click('#identifierNext');
58 | 
59 |                         // Wait for password field and fill it
60 |                         await page.waitForSelector('input[type="password"]', { timeout: 5000 });
61 |                         await page.fill('input[type="password"]', process.env.TEST_GOOGLE_PASSWORD);
62 |                         await page.click('#passwordNext');
63 |                     } else {
64 |                         console.log('👤 Manual authentication required - waiting for user to complete sign in...');
65 |                         console.log('⏳ Please sign in manually in the browser. Waiting up to 60 seconds...');
66 |                     }
67 | 
68 |                     // Wait to be redirected back to ChatLima
69 |                     await page.waitForURL(/preview\.chatlima\.com/, { timeout: 60000 });
70 |                     console.log('🔄 Redirected back to ChatLima');
71 |                 }
72 |             } catch (error) {
73 |                 console.log('⚠️ Authentication flow error:', error);
74 |                 console.log('🔄 Continuing with current state...');
75 |             }
76 |         } else {
77 |             console.log('✅ Already authenticated or anonymous access available');
78 |         }
79 | 
80 |         // Wait for the interface to settle
81 |         await page.waitForTimeout(3000);
82 | 
83 |         // Verify we have the ChatLima interface
84 |         await expect(chatLimaHeading).toBeVisible();
85 |         console.log('✅ ChatLima interface confirmed');
86 | 
87 |     } else {
88 |         console.log('❌ ChatLima interface not detected');
89 |         console.log('🔍 Current URL:', page.url());
90 |         console.log('📄 Current title:', await page.title());
91 | 
92 |         // Take a screenshot for debugging
93 |         await page.screenshot({ path: 'playwright-report/auth-step-final-error.png' });
94 | 
95 |         // Instead of failing, let's save whatever state we have
96 |         console.log('⚠️ Proceeding with current state (may be unauthenticated)');
97 |     }
98 | 
99 |     // Save authentication state (even if partial)
100 |     await page.context().storageState({ path: authFile });
101 | 
102 |     console.log('💾 Authentication state saved to:', authFile);
103 |     console.log('✨ Authentication setup completed');
104 | }); 
```

tests/chatlima-anonymous-test.spec.ts
```
1 | import { test, expect } from '@playwright/test';
2 | 
3 | test.describe('ChatLima Anonymous User Test', () => {
4 |     test('should work with anonymous authentication', async ({ page }) => {
5 |         // Step 1: Navigate to ChatLima (using baseURL from config)
6 |         await page.goto('/');
7 | 
8 |         // Wait for page to load
9 |         await expect(page).toHaveTitle('ChatLima');
10 | 
11 |         // Since ChatLima supports anonymous users, we should be able to use it without signing in
12 |         // Wait for the interface to load
13 |         await page.waitForLoadState('networkidle');
14 | 
15 |         // Step 2: Check if message input is available (anonymous users should be able to chat)
16 |         const messageInput = page.getByRole('textbox', { name: 'Send a message...' });
17 |         await expect(messageInput).toBeVisible();
18 | 
19 |         // Step 3: Click on the model selector dropdown
20 |         await page.getByRole('combobox').first().click();
21 | 
22 |         // Step 4: Select DeepSeek Chat V3 0324 model (if available for anonymous users)
23 |         const deepSeekOption = page.getByRole('option', { name: 'DeepSeek Chat V3 0324' });
24 |         if (await deepSeekOption.isVisible()) {
25 |             await deepSeekOption.click();
26 | 
27 |             // Verify the model is selected (check the combobox specifically)
28 |             await expect(page.getByRole('combobox').filter({ hasText: 'DeepSeek Chat V3 0324' })).toBeVisible();
29 |             console.log('✅ DeepSeek model selected');
30 |         } else {
31 |             console.log('💡 DeepSeek model not available, testing with default model');
32 |             // Close the dropdown by clicking somewhere else
33 |             await page.click('h1:has-text("ChatLima")');
34 |         }
35 | 
36 |         // Step 5: Type test message in the input field
37 |         const testMessage = 'Hello! This is a test message from an anonymous user. Can you respond with a simple greeting?';
38 |         await messageInput.fill(testMessage);
39 | 
40 |         // Step 6: Check if send button is enabled
41 |         const sendButton = page.getByRole('button').filter({ hasText: '' }).nth(1);
42 |         await expect(sendButton).toBeEnabled();
43 | 
44 |         // Step 7: Click the send button
45 |         await sendButton.click();
46 | 
47 |         // Step 8: Wait for and verify response is received
48 |         // Wait for the user message to appear
49 |         await expect(page.getByText(testMessage)).toBeVisible();
50 | 
51 |         // Wait for AI response (anonymous users might have limited functionality)
52 |         await page.waitForFunction(() => {
53 |             const messages = document.querySelectorAll('p');
54 |             return messages.length >= 2; // At least user message + AI response
55 |         }, { timeout: 30000 });
56 | 
57 |         // Step 9: Verify chat appears in sidebar (if available for anonymous users)
58 |         try {
59 |             await expect(page.getByText('Simple Greeting Request')).toBeVisible({ timeout: 5000 });
60 |             console.log('✅ Chat sidebar working for anonymous users');
61 |         } catch {
62 |             console.log('💡 Chat sidebar not available for anonymous users - this is expected');
63 |         }
64 | 
65 |         // Step 10: Verify messages are displayed
66 |         const allParagraphs = page.locator('p');
67 |         await expect(allParagraphs).toHaveCount(2, { timeout: 30000 });
68 | 
69 |         // Verify user message is displayed
70 |         await expect(page.getByText(testMessage)).toBeVisible();
71 | 
72 |         // Verify AI response is displayed (should contain some response text)
73 |         const aiResponse = allParagraphs.nth(1);
74 |         const responseText = await aiResponse.textContent();
75 |         console.log('🤖 AI Response received:', responseText?.substring(0, 100) + '...');
76 | 
77 |         // Just verify that we got some response that's different from the user message
78 |         await expect(aiResponse).not.toHaveText(testMessage);
79 |         await expect(aiResponse).toContainText(/.+/); // At least some text
80 | 
81 |         console.log('✅ Anonymous user test completed successfully!');
82 |         console.log('- Anonymous access working');
83 |         console.log('- Message sent successfully');
84 |         console.log('- Response received from AI');
85 |         console.log('- Interface functioning for anonymous users');
86 |     });
87 | 
88 |     test('should have proper interface elements for anonymous users', async ({ page }) => {
89 |         // Navigate to ChatLima (using baseURL from config)
90 |         await page.goto('/');
91 | 
92 |         // Check if ChatLima interface is loaded
93 |         await expect(page.getByRole('heading', { name: 'ChatLima' })).toBeVisible();
94 | 
95 |         // Verify input field is ready
96 |         await expect(page.getByRole('textbox', { name: 'Send a message...' })).toBeVisible();
97 | 
98 |         // Check if model selector is available
99 |         await expect(page.getByRole('combobox').first()).toBeVisible();
100 | 
101 |         // Check if sign in button is visible (optional for anonymous users)
102 |         const signInButton = page.getByRole('button', { name: 'Sign in with Google' });
103 |         if (await signInButton.isVisible()) {
104 |             console.log('✅ Sign in option available for upgrading');
105 |         } else {
106 |             console.log('💡 No sign in button visible - anonymous mode working directly');
107 |         }
108 | 
109 |         console.log('✅ Anonymous user interface test completed!');
110 |     });
111 | }); 
```

tests/chatlima-deepseek-test.spec.ts
```
1 | import { test, expect } from '@playwright/test';
2 | 
3 | test.describe('ChatLima DeepSeek Model Test', () => {
4 |     test('should select DeepSeek Chat V3 0324 model, send message, and receive response', async ({ page }) => {
5 |         // Step 1: Navigate to ChatLima (using baseURL from config)
6 |         await page.goto('/');
7 | 
8 |         // Wait for page to load
9 |         await expect(page).toHaveTitle('ChatLima');
10 | 
11 |         // Step 2: Click on the model selector dropdown
12 |         await page.getByRole('combobox').first().click();
13 | 
14 |         // Step 3: Select DeepSeek Chat V3 0324 model
15 |         await page.getByRole('option', { name: 'DeepSeek Chat V3 0324' }).click();
16 | 
17 |         // Verify the model is selected - target the combobox specifically
18 |         await expect(page.getByRole('combobox').getByText('DeepSeek Chat V3 0324')).toBeVisible();
19 | 
20 |         // Step 4: Type test message in the input field
21 |         const testMessage = 'Hello! This is a test message. Can you respond with a simple greeting?';
22 |         await page.getByRole('textbox', { name: 'Send a message...' }).fill(testMessage);
23 | 
24 |         // Step 5: Click the send button - target the submit button with ArrowUp icon
25 |         const sendButton = page.locator('button[type="submit"]');
26 |         await sendButton.click();
27 | 
28 |         // Step 6: Wait for and verify response is received
29 |         // Wait for the user message to appear
30 |         await expect(page.getByText(testMessage)).toBeVisible();
31 | 
32 |         // Wait for AI response with more robust approach
33 |         await page.waitForFunction(() => {
34 |             // Look for multiple message elements in the chat
35 |             const chatMessages = document.querySelectorAll('[data-role="user"], [data-role="assistant"], .message, [class*="message"]');
36 |             if (chatMessages.length >= 2) return true;
37 | 
38 |             // Fallback: look for paragraphs that might contain messages
39 |             const paragraphs = document.querySelectorAll('p');
40 |             return paragraphs.length >= 2;
41 |         }, { timeout: 45000 });
42 | 
43 |         // Wait for streaming to complete - look for submit button to be enabled again
44 |         await expect(sendButton).toBeEnabled({ timeout: 30000 });
45 | 
46 |         // Step 7: Verify chat appears in sidebar (with more flexible text matching)
47 |         const chatTitle = page.locator('text=/Simple Greeting|Test|Chat|Hello/i').first();
48 |         await expect(chatTitle).toBeVisible({ timeout: 10000 });
49 | 
50 |         // Step 8: Verify both messages are displayed
51 |         const allParagraphs = page.locator('p');
52 |         await expect(allParagraphs).toHaveCount(2, { timeout: 30000 });
53 | 
54 |         // Verify user message is displayed
55 |         await expect(page.getByText(testMessage)).toBeVisible();
56 | 
57 |         // Verify AI response is displayed (should contain greeting-like text)
58 |         const aiResponse = allParagraphs.nth(1);
59 |         await expect(aiResponse).toContainText(/hello|hi|thanks|great|day|greeting/i);
60 | 
61 |         // Verify copy buttons are present - wait for streaming to complete first
62 |         await expect(page.getByRole('button', { name: 'Copy' })).toHaveCount(2, { timeout: 10000 });
63 | 
64 |         // Additional verification: Ensure the model is still selected - target combobox specifically
65 |         await expect(page.getByRole('combobox').getByText('DeepSeek Chat V3 0324')).toBeVisible();
66 | 
67 |         console.log('✅ Test completed successfully!');
68 |         console.log('- Model selected: DeepSeek Chat V3 0324');
69 |         console.log('- Message sent successfully');
70 |         console.log('- Response received from AI');
71 |         console.log('- Chat created in sidebar');
72 |         console.log('- Both messages displayed correctly');
73 |     });
74 | 
75 |     test('should handle model selection and maintain state', async ({ page }) => {
76 |         // Navigate to ChatLima (using baseURL from config)
77 |         await page.goto('/');
78 | 
79 |         // Open model selector
80 |         await page.getByRole('combobox').first().click();
81 | 
82 |         // Verify DeepSeek model is available
83 |         await expect(page.getByRole('option', { name: 'DeepSeek Chat V3 0324' })).toBeVisible();
84 | 
85 |         // Select the model
86 |         await page.getByRole('option', { name: 'DeepSeek Chat V3 0324' }).click();
87 | 
88 |         // Verify model persists after selection - target combobox specifically
89 |         await expect(page.getByRole('combobox').getByText('DeepSeek Chat V3 0324')).toBeVisible();
90 | 
91 |         // Verify input field is ready
92 |         await expect(page.getByRole('textbox', { name: 'Send a message...' })).toBeVisible();
93 | 
94 |         // Verify send button starts disabled - target the submit button
95 |         const sendButton = page.locator('button[type="submit"]');
96 |         await expect(sendButton).toBeDisabled();
97 | 
98 |         // Type a message to enable send button
99 |         await page.getByRole('textbox', { name: 'Send a message...' }).fill('test');
100 |         await expect(sendButton).toBeEnabled();
101 |     });
102 | }); 
```

.cursor/rules/feature-branch-creation-workflow.mdc
```
1 | ---
2 | description: 
3 | globs: 
4 | alwaysApply: false
5 | ---
6 | # Feature Branch Creation Workflow
7 | 
8 | This rule provides a standardized workflow for creating new feature branches in the ChatLima project, ensuring consistent naming conventions, proper setup, and clear documentation.
9 | 
10 | ## 🌟 Branch Creation Process
11 | 
12 | ### 1. Pre-Creation Planning
13 | Before creating a new feature branch:
14 | - Define the feature scope and requirements
15 | - Choose an appropriate branch naming convention
16 | - Ensure you're starting from the latest main branch
17 | - Check for any conflicting features in development
18 | 
19 | ### 2. Branch Naming Convention
20 | Use descriptive, kebab-case names that clearly identify the feature:
21 | 
22 | ```bash
23 | # Feature branches (new functionality)
24 | feature/auth-integration
25 | feature/polar-payment-system
26 | feature/chat-history-export
27 | feature/user-dashboard-redesign
28 | 
29 | # Bug fix branches
30 | fix/credit-deduction-bug
31 | fix/negative-balance-blocking
32 | fix/auth-session-timeout
33 | 
34 | # Enhancement branches
35 | enhance/ui-accessibility
36 | enhance/performance-optimization
37 | enhance/mobile-responsiveness
38 | 
39 | # Documentation branches
40 | docs/api-documentation
41 | docs/deployment-guide
42 | docs/user-manual-update
43 | ```
44 | 
45 | ### 3. Create and Setup Feature Branch
46 | 
47 | #### Quick Setup Commands:
48 | ```bash
49 | # Ensure you're on main and up to date
50 | git checkout main
51 | git pull origin main
52 | 
53 | # Create and switch to new feature branch
54 | git checkout -b feature/your-feature-name
55 | 
56 | # Push the new branch to remote and set upstream
57 | git push -u origin feature/your-feature-name
58 | ```
59 | 
60 | #### Alternative Step-by-Step:
61 | ```bash
62 | # 1. Switch to main branch
63 | git checkout main
64 | 
65 | # 2. Pull latest changes
66 | git pull origin main
67 | 
68 | # 3. Create new branch from main
69 | git branch feature/your-feature-name
70 | 
71 | # 4. Switch to the new branch
72 | git checkout feature/your-feature-name
73 | 
74 | # 5. Push to remote and set upstream tracking
75 | git push -u origin feature/your-feature-name
76 | ```
77 | 
78 | ### 4. Initial Branch Setup
79 | 
80 | #### Create Feature Documentation
81 | Create a brief feature plan (optional but recommended):
82 | 
83 | ```bash
84 | # Create a feature plan file (optional)
85 | touch docs/features/your-feature-name.md
86 | ```
87 | 
88 | #### Feature Plan Template:
89 | ```markdown
90 | # Feature: [Feature Name]
91 | 
92 | ## 🎯 Overview
93 | Brief description of what this feature does and why it's needed.
94 | 
95 | ## 📋 Requirements
96 | - [ ] Requirement 1
97 | - [ ] Requirement 2
98 | - [ ] Requirement 3
99 | 
100 | ## 🏗️ Implementation Plan
101 | 1. Step 1: Component/API design
102 | 2. Step 2: Core functionality
103 | 3. Step 3: UI/UX implementation
104 | 4. Step 4: Testing and validation
105 | 5. Step 5: Documentation
106 | 
107 | ## 📁 Files to Modify/Create
108 | - `app/api/new-endpoint/route.ts`
109 | - `components/NewComponent.tsx`
110 | - `lib/new-utility.ts`
111 | 
112 | ## 🧪 Testing Strategy
113 | - Unit tests for core functions
114 | - Integration tests for API endpoints
115 | - E2E tests for user workflows
116 | 
117 | ## 📝 Notes
118 | Any additional notes, considerations, or dependencies.
119 | ```
120 | 
121 | ### 5. Development Workflow
122 | 
123 | #### Regular Commits
124 | Follow conventional commit messages:
125 | ```bash
126 | # Feature commits
127 | git commit -m "feat: add user authentication middleware"
128 | git commit -m "feat(api): implement payment processing endpoint"
129 | 
130 | # Fix commits
131 | git commit -m "fix: resolve credit deduction for Google users"
132 | git commit -m "fix(ui): correct mobile navigation alignment"
133 | 
134 | # Enhancement commits
135 | git commit -m "enhance: improve database query performance"
136 | git commit -m "enhance(ux): add loading states to buttons"
137 | 
138 | # Documentation commits
139 | git commit -m "docs: add API endpoint documentation"
140 | git commit -m "docs: update deployment instructions"
141 | ```
142 | 
143 | #### Regular Pushes
144 | Push your work regularly to keep the remote branch updated:
145 | ```bash
146 | # Push current branch changes
147 | git push
148 | 
149 | # Or explicitly push to origin
150 | git push origin feature/your-feature-name
151 | ```
152 | 
153 | ### 6. Keep Branch Updated
154 | 
155 | #### Sync with Main Regularly
156 | ```bash
157 | # Method 1: Merge main into feature branch
158 | git checkout feature/your-feature-name
159 | git pull origin main
160 | 
161 | # Method 2: Rebase feature branch onto main (cleaner history)
162 | git checkout feature/your-feature-name
163 | git rebase main
164 | 
165 | # If conflicts occur during rebase:
166 | # 1. Resolve conflicts in affected files
167 | # 2. Stage resolved files: git add .
168 | # 3. Continue rebase: git rebase --continue
169 | ```
170 | 
171 | ### 7. Safe Vercel Deployment Testing
172 | 
173 | #### ⚠️ CRITICAL: Vercel CLI Safety Rules
174 | **NEVER run Vercel setup commands while on feature branches!**
175 | 
176 | The Vercel CLI has dangerous behavior during initial setup:
177 | - `--prod=false` flag gets **ignored** during first-time setup
178 | - "Set up and deploy" process defaults to **production deployment**
179 | - This can accidentally deploy untested feature branches to production
180 | 
181 | #### Safe Deployment Workflow:
182 | ```bash
183 | # ❌ DANGEROUS - Don't do this on feature branches
184 | vercel --prod=false  # This can still deploy to production!
185 | 
186 | # ✅ SAFE - Proper testing workflow
187 | # 1. Setup project on main branch first (one-time only)
188 | git checkout main
189 | vercel link  # Setup only, no deployment
190 | 
191 | # 2. Switch to feature branch for testing  
192 | git checkout feature/your-feature-name
193 | 
194 | # 3. Deploy as preview only
195 | vercel deploy  # Always creates preview deployment
196 | 
197 | # 4. Test thoroughly on preview URL
198 | # 5. Never use --prod unless ready for production release
199 | ```
200 | 
201 | #### Emergency Production Revert:
202 | If you accidentally deploy a feature branch to production:
203 | ```bash
204 | # 1. Switch to safe main branch immediately
205 | git checkout main
206 | git stash  # if you have uncommitted changes
207 | 
208 | # 2. Deploy main to restore production
209 | vercel deploy --prod
210 | 
211 | # 3. Create proper preview for testing
212 | git checkout feature/your-feature-name
213 | git stash pop  # restore changes if stashed
214 | vercel deploy  # Preview only
215 | ```
216 | 
217 | #### Vercel Best Practices:
218 | - **Always use `vercel deploy`** for feature branch testing
219 | - **Only use `vercel deploy --prod`** for production releases
220 | - **Setup projects on main branch** before working on features
221 | - **Test on preview URLs first** before any production deployment
222 | - **Use Git integration** - let Vercel auto-create previews from pushed branches
223 | 
224 | ## 📋 Branch Management Commands
225 | 
226 | ### Useful Git Commands
227 | ```bash
228 | # Check current branch and status
229 | git status
230 | 
231 | # List all branches (local and remote)
232 | git branch -a
233 | 
234 | # Check branch tracking information
235 | git branch -vv
236 | 
237 | # See commits unique to your branch
238 | git log main..HEAD --oneline
239 | 
240 | # See what files have changed
241 | git diff --name-only main
242 | 
243 | # Stash current work temporarily
244 | git stash
245 | git stash pop  # restore stashed work
246 | 
247 | # Delete local branch (if no longer needed)
248 | git branch -d feature/branch-name
249 | 
250 | # Delete remote branch
251 | git push origin --delete feature/branch-name
252 | ```
253 | 
254 | ### Branch Information
255 | ```bash
256 | # See commit history for current branch
257 | git log --oneline -10
258 | 
259 | # See detailed diff with main
260 | git diff main
261 | 
262 | # Check if branch is ahead/behind main
263 | git status -uno
264 | ```
265 | 
266 | ## 🎯 Best Practices
267 | 
268 | ### Naming Guidelines:
269 | - Use descriptive names that explain the feature
270 | - Keep names concise but clear
271 | - Use kebab-case (hyphens between words)
272 | - Include the type prefix (feature/, fix/, enhance/, docs/)
273 | - Avoid abbreviations that might be unclear
274 | 
275 | ### Development Guidelines:
276 | - Make small, focused commits with clear messages
277 | - Test your changes regularly
278 | - Keep the branch updated with main to avoid large conflicts
279 | - Document complex changes as you go
280 | - Consider creating draft PRs early for feedback
281 | 
282 | ### Project-Specific Considerations:
283 | For ChatLima specifically, consider these areas when creating branches:
284 | - **Authentication**: Features related to [auth-schema.ts](mdc:chatlima/auth-schema.ts)
285 | - **API Routes**: New endpoints in [app/api/](mdc:chatlima/app/api)
286 | - **Database**: Changes requiring [drizzle/](mdc:chatlima/drizzle) migrations
287 | - **UI Components**: New components in [components/](mdc:chatlima/components)
288 | - **AI Integration**: Features in [ai/](mdc:chatlima/ai) directory
289 | - **Payment System**: Polar integration features
290 | - **Credit System**: User credit and usage tracking
291 | 
292 | ### File Organization:
293 | - Keep related changes in logical commits
294 | - Update relevant configuration files ([next.config.ts](mdc:chatlima/next.config.ts), [tsconfig.json](mdc:chatlima/tsconfig.json))
295 | - Add new dependencies to [package.json](mdc:chatlima/package.json) as needed
296 | - Update [README.md](mdc:chatlima/README.md) if the feature affects setup or usage
297 | 
298 | ## 🚨 Important Reminders
299 | 
300 | - Always start from an updated main branch
301 | - Use descriptive branch names that clearly indicate the feature
302 | - Push branches to remote early to enable collaboration
303 | - Keep feature branches focused on a single feature or fix
304 | - Regularly sync with main to avoid integration conflicts
305 | - Document complex features as you develop them
306 | - Consider the impact on existing functionality
307 | - Test thoroughly before requesting reviews
308 | 
309 | ## 🔄 Integration with Release Workflow
310 | 
311 | This workflow is designed to work seamlessly with the [feature-release-workflow.mdc](mdc:chatlima/feature-release-workflow.mdc):
312 | 
313 | 1. **Create branch** using this workflow
314 | 2. **Develop feature** following the guidelines here
315 | 3. **Merge and release** using the feature release workflow
316 | 
317 | ### Ready for Release Checklist:
318 | - [ ] Feature is complete and tested
319 | - [ ] Branch is up to date with main
320 | - [ ] All commits have clear messages
321 | - [ ] Documentation is updated
322 | - [ ] No merge conflicts with main
323 | - [ ] Feature has been tested in development environment
324 | - [ ] Ready to follow the [feature-release-workflow.mdc](mdc:chatlima/feature-release-workflow.mdc)
```

.cursor/rules/feature-release-workflow.mdc
```
1 | ---
2 | description: 
3 | globs: 
4 | alwaysApply: false
5 | ---
6 | # Feature Release Workflow
7 | 
8 | This rule provides a complete workflow for releasing new features in the ChatLima project, from merging feature branches to creating GitHub release notes.
9 | 
10 | ## 🔄 Complete Release Process
11 | 
12 | ### 1. Pre-Release Checks
13 | Before starting the release process:
14 | - Ensure all tests pass
15 | - Verify the feature branch is up to date with main
16 | - Check that [package.json](mdc:chatlima/chatlima/chatlima/package.json) reflects the current version
17 | - Review recent commits with `git log --oneline -10`
18 | 
19 | ### 2. Merge Feature Branch
20 | ```bash
21 | # Switch to main branch
22 | git checkout main
23 | 
24 | # Pull latest changes
25 | git pull origin main
26 | 
27 | # Merge feature branch (replace 'feature/branch-name' with actual branch)
28 | git merge feature/branch-name
29 | 
30 | # Delete the feature branch locally
31 | git branch -d feature/branch-name
32 | 
33 | # Delete the feature branch remotely
34 | git push origin --delete feature/branch-name
35 | ```
36 | 
37 | ### 3. Version Increment
38 | Use npm version to automatically update [package.json](mdc:chatlima/chatlima/chatlima/package.json) and create a git tag:
39 | 
40 | ```bash
41 | # For patch releases (0.3.0 -> 0.3.1)
42 | npm version patch
43 | 
44 | # For minor releases (0.3.0 -> 0.4.0)
45 | npm version minor
46 | 
47 | # For major releases (0.3.0 -> 1.0.0)
48 | npm version major
49 | ```
50 | 
51 | This command:
52 | - Updates the version in [package.json](mdc:chatlima/chatlima/chatlima/package.json)
53 | - Creates a git commit with the version change
54 | - Creates a git tag (e.g., v0.3.1)
55 | 
56 | ### 4. Push Changes
57 | ```bash
58 | # Push commits and tags to remote
59 | git push origin main --tags
60 | ```
61 | 
62 | ### 5. Create Release Notes
63 | Generate comprehensive release notes following this structure:
64 | 
65 | #### Template Structure:
66 | ```markdown
67 | # 🚀 ChatLima v[VERSION] - [FEATURE_NAME]
68 | 
69 | ## 🎯 What's New
70 | - List major features added
71 | - Highlight user-facing improvements
72 | - Note any new capabilities
73 | 
74 | ## 🔧 Technical Implementation
75 | - Detail technical changes
76 | - Mention new routes, APIs, or components
77 | - Include performance improvements
78 | 
79 | ## 🛡️ Security & Privacy
80 | - Highlight security enhancements
81 | - Note privacy protections
82 | - Mention any security-related changes
83 | 
84 | ## 📈 Benefits
85 | - Explain user benefits
86 | - Note SEO, performance, or UX improvements
87 | - Highlight business value
88 | 
89 | ## 🔄 Migration Notes
90 | - List any breaking changes (if any)
91 | - Note required configuration changes
92 | - Mention database migrations needed
93 | 
94 | ## 🚀 Deployment
95 | - Deployment instructions
96 | - Environment considerations
97 | - Any special setup requirements
98 | 
99 | ---
100 | 
101 | **Full Changelog**: [v[PREV_VERSION]...v[NEW_VERSION]](https://github.com/username/chatlima/compare/v[PREV_VERSION]...v[NEW_VERSION])
102 | ```
103 | 
104 | #### Save Release Notes
105 | Create a file named `RELEASE_NOTES_v[VERSION].md` in the `releases/` folder for reference.
106 | 
107 | ### 6. Production Deployment
108 | 
109 | #### 🔄 Automatic Deployment (GitHub Integration)
110 | With GitHub integration enabled, Vercel automatically handles deployments:
111 | 
112 | ```bash
113 | # ✅ AUTOMATIC - Normal deployment workflow
114 | # 1. Ensure you're on main branch with merged changes
115 | git checkout main
116 | git pull origin main
117 | 
118 | # 2. Verify everything is ready for production
119 | npm run build  # Test build locally
120 | npm run test   # Run all tests
121 | 
122 | # 3. Push to main triggers automatic production deployment
123 | git push origin main  # This automatically deploys to production via GitHub integration
124 | 
125 | # 4. Monitor deployment
126 | # Check Vercel dashboard for deployment status
127 | # Verify production URL once deployment completes
128 | ```
129 | 
130 | #### 🔧 Manual Deployment (Optional)
131 | Manual deployment is only needed for special cases:
132 | 
133 | ```bash
134 | # When you need to deploy without pushing to git
135 | vercel deploy --prod  # Explicit production deployment
136 | 
137 | # Or for testing local changes before commit
138 | vercel deploy  # Preview deployment
139 | ```
140 | 
141 | #### Production Deployment Checklist:
142 | - [ ] All tests passing
143 | - [ ] Feature thoroughly tested on preview deployments
144 | - [ ] Environment variables configured for production
145 | - [ ] Database migrations completed (if applicable)
146 | - [ ] Monitoring and error tracking enabled
147 | - [ ] GitHub integration properly configured
148 | 
149 | #### Emergency Rollback:
150 | If issues are discovered after production deployment:
151 | ```bash
152 | # Option 1: Rollback via git (triggers auto-deployment)
153 | git checkout main
154 | git reset --hard HEAD~1  # Go back one commit
155 | git push origin main --force  # Auto-deploys previous version
156 | 
157 | # Option 2: Manual rollback (if needed)
158 | vercel deploy --prod  # Deploy specific version manually
159 | ```
160 | 
161 | ### 7. GitHub Release Creation
162 | 1. Go to GitHub repository → Releases → "Create a new release"
163 | 2. Select the version tag created by `npm version`
164 | 3. Copy content from the release notes file
165 | 4. Set release title: "v[VERSION] - [FEATURE_NAME]"
166 | 5. Mark as "Latest release" if it's the newest version
167 | 6. Publish the release
168 | 
169 | ## 📋 Quick Reference Commands
170 | 
171 | ```bash
172 | # Complete release workflow
173 | git checkout main
174 | git pull origin main
175 | git merge feature/[branch-name]
176 | npm version [patch|minor|major]
177 | git push origin main --tags
178 | git branch -d feature/[branch-name]
179 | git push origin --delete feature/[branch-name]
180 | ```
181 | 
182 | ## 🎯 Best Practices
183 | 
184 | ### Version Selection Guidelines:
185 | - **Patch** (0.3.0 → 0.3.1): Bug fixes, small improvements, security patches
186 | - **Minor** (0.3.0 → 0.4.0): New features, significant improvements, new capabilities
187 | - **Major** (0.3.0 → 1.0.0): Breaking changes, major rewrites, API changes
188 | 
189 | ### Release Notes Guidelines:
190 | - Use emojis for visual appeal and categorization
191 | - Focus on user benefits, not just technical details
192 | - Include migration instructions for any breaking changes
193 | - Highlight security and privacy improvements
194 | - Keep technical details accessible to non-developers
195 | - Reference relevant files using [filename](mdc:chatlima/chatlima/chatlima/filename) format
196 | 
197 | ### File References:
198 | - Version information: [package.json](mdc:chatlima/chatlima/chatlima/package.json)
199 | - Previous release notes: Look for existing `RELEASE_NOTES_v*.md` files in the `releases/` folder
200 | - Implementation details: Check [app/](mdc:chatlima/chatlima/chatlima/app) directory for new routes
201 | - Configuration: [next.config.ts](mdc:chatlima/chatlima/chatlima/next.config.ts), [tsconfig.json](mdc:chatlima/chatlima/chatlima/tsconfig.json)
202 | 
203 | ## 🚨 Important Notes
204 | 
205 | - Always test the feature thoroughly before merging
206 | - Ensure the production environment can handle new features
207 | - Keep release notes user-focused while including technical details
208 | - Tag releases consistently for easy tracking
209 | - Delete feature branches after successful merge to keep repository clean
210 | - Use descriptive commit messages for the version bump commits
```

.cursor/rules/quick-branch-commands.mdc
```
1 | ---
2 | description: 
3 | globs: 
4 | alwaysApply: false
5 | ---
6 | # Quick Branch Commands Reference
7 | 
8 | Quick reference for common feature branch operations in ChatLima.
9 | 
10 | ## 🚀 Create New Feature Branch
11 | ```bash
12 | # One-liner to create and setup a new feature branch
13 | git checkout main && git pull origin main && git checkout -b feature/your-feature-name && git push -u origin feature/your-feature-name
14 | ```
15 | 
16 | ## 📋 Common Branch Types
17 | 
18 | ### Feature Branch
19 | ```bash
20 | git checkout -b feature/new-auth-system
21 | git checkout -b feature/polar-integration
22 | git checkout -b feature/chat-export
23 | ```
24 | 
25 | ### Bug Fix Branch
26 | ```bash
27 | git checkout -b fix/credit-deduction-bug
28 | git checkout -b fix/auth-session-timeout
29 | ```
30 | 
31 | ### Enhancement Branch
32 | ```bash
33 | git checkout -b enhance/mobile-ui
34 | git checkout -b enhance/performance-optimization
35 | ```
36 | 
37 | ## 🔄 Daily Workflow Commands
38 | 
39 | ### Start Working
40 | ```bash
41 | git checkout feature/your-branch
42 | git pull origin main  # sync with main
43 | ```
44 | 
45 | ### Save Progress
46 | ```bash
47 | git add .
48 | git commit -m "feat: implement core functionality"
49 | git push
50 | ```
51 | 
52 | ### End of Day
53 | ```bash
54 | git add .
55 | git commit -m "wip: work in progress on feature"
56 | git push
57 | ```
58 | 
59 | ## 🛠️ Branch Management
60 | 
61 | ### Check Status
62 | ```bash
63 | git status                    # current status
64 | git branch -a                 # all branches
65 | git log main..HEAD --oneline  # commits unique to branch
66 | ```
67 | 
68 | ### Sync with Main
69 | ```bash
70 | git pull origin main          # merge main into current branch
71 | # OR
72 | git rebase main              # rebase current branch onto main
73 | ```
74 | 
75 | ### Clean Up
76 | ```bash
77 | git branch -d feature/old-branch      # delete local branch
78 | git push origin --delete feature/old-branch  # delete remote branch
79 | ```
80 | 
81 | ## 🚀 Vercel Deployment Commands
82 | 
83 | ### ⚠️ CRITICAL SAFETY WARNING
84 | **NEVER run Vercel setup while on feature branches!**
85 | 
86 | ### Safe Testing Workflow
87 | ```bash
88 | # ✅ Setup project (one-time, on main branch)
89 | git checkout main
90 | vercel link  # Setup only, no deployment
91 | 
92 | # ✅ Test feature branch safely
93 | git checkout feature/your-branch
94 | vercel deploy  # Always creates preview deployment
95 | 
96 | # ✅ Production deployment (only when ready)
97 | git checkout main
98 | vercel deploy --prod  # Explicit production deployment
99 | ```
100 | 
101 | ### Emergency Commands
102 | ```bash
103 | # 🚨 If you accidentally deployed feature branch to production
104 | git checkout main
105 | git stash  # if needed
106 | vercel deploy --prod  # Restore safe production
107 | 
108 | # Then create proper preview
109 | git checkout feature/your-branch  
110 | git stash pop  # if needed
111 | vercel deploy  # Preview only
112 | ```
113 | 
114 | ### Deployment Status
115 | ```bash
116 | vercel ls                    # List all deployments
117 | vercel logs --follow        # Monitor deployment logs
118 | vercel inspect [URL]        # Get deployment details
119 | ```
120 | 
121 | ## 📝 Commit Message Templates
122 | 
123 | ```bash
124 | # Feature commits
125 | git commit -m "feat: add user authentication"
126 | git commit -m "feat(api): implement payment endpoint"
127 | 
128 | # Bug fixes
129 | git commit -m "fix: resolve credit deduction issue"
130 | git commit -m "fix(ui): correct mobile navigation"
131 | 
132 | # Enhancements
133 | git commit -m "enhance: improve query performance"
134 | git commit -m "enhance(ux): add loading states"
135 | ```
136 | 
137 | For complete workflow details, see [feature-branch-creation-workflow.mdc](mdc:chatlima/feature-branch-creation-workflow.mdc)
```

app/robots.txt/route.ts
```
1 | import { NextRequest, NextResponse } from 'next/server'
2 | 
3 | export async function GET(request: NextRequest) {
4 |     const host = request.headers.get('host')
5 |     const protocol = request.headers.get('x-forwarded-proto') || 'https'
6 |     const baseUrl = `${protocol}://${host}`
7 | 
8 |     // Check if we're in production (chatlima.com)
9 |     const isProduction = host?.includes('chatlima.com')
10 | 
11 |     let robotsContent: string
12 | 
13 |     if (isProduction) {
14 |         // Production robots.txt - allow crawling with restrictions
15 |         robotsContent = `User-agent: *
16 | Allow: /
17 | Disallow: /api/
18 | Disallow: /chat/
19 | Disallow: /checkout/
20 | Disallow: /auth/
21 | Crawl-delay: 1
22 | 
23 | # Protect user privacy - no crawling of chat content
24 | User-agent: *
25 | Disallow: /chat/*
26 | 
27 | # Allow access to public pages
28 | Allow: /$
29 | Allow: /docs
30 | Allow: /docs/*
31 | 
32 | Sitemap: https://www.chatlima.com/sitemap.xml`
33 |     } else {
34 |         // Development/staging - disallow all crawling
35 |         robotsContent = `User-agent: *
36 | Disallow: /
37 | 
38 | # Development environment - no crawling allowed`
39 |     }
40 | 
41 |     return new NextResponse(robotsContent, {
42 |         headers: {
43 |             'Content-Type': 'text/plain',
44 |             'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
45 |         },
46 |     })
47 | } 
```

app/sitemap.xml/route.ts
```
1 | import { NextRequest, NextResponse } from 'next/server'
2 | 
3 | export async function GET(request: NextRequest) {
4 |     const host = request.headers.get('host')
5 |     const protocol = request.headers.get('x-forwarded-proto') || 'https'
6 |     const baseUrl = `${protocol}://${host}`
7 | 
8 |     // Only generate sitemap for production
9 |     const isProduction = host?.includes('chatlima.com')
10 | 
11 |     if (!isProduction) {
12 |         return new NextResponse('Sitemap not available in development', {
13 |             status: 404,
14 |             headers: { 'Content-Type': 'text/plain' }
15 |         })
16 |     }
17 | 
18 |     const currentDate = new Date().toISOString()
19 | 
20 |     // Define static pages to include in sitemap
21 |     const staticPages = [
22 |         {
23 |             url: '/',
24 |             lastmod: currentDate,
25 |             changefreq: 'daily',
26 |             priority: '1.0'
27 |         }
28 |         // Future pages can be added here:
29 |         // {
30 |         //     url: '/about',
31 |         //     lastmod: currentDate,
32 |         //     changefreq: 'monthly',
33 |         //     priority: '0.8'
34 |         // },
35 |         // {
36 |         //     url: '/pricing',
37 |         //     lastmod: currentDate,
38 |         //     changefreq: 'weekly',
39 |         //     priority: '0.9'
40 |         // }
41 |     ]
42 | 
43 |     const urlEntries = staticPages.map(page => `    <url>
44 |         <loc>${baseUrl}${page.url}</loc>
45 |         <lastmod>${page.lastmod}</lastmod>
46 |         <changefreq>${page.changefreq}</changefreq>
47 |         <priority>${page.priority}</priority>
48 |     </url>`).join('\n')
49 | 
50 |     const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
51 | <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
52 | ${urlEntries}
53 | </urlset>`
54 | 
55 |     return new NextResponse(sitemapXml, {
56 |         headers: {
57 |             'Content-Type': 'application/xml',
58 |             'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
59 |         },
60 |     })
61 | } 
```

components/auth/AnonymousAuth.tsx
```
1 | "use client";
2 | 
3 | import { useEffect, useState } from 'react';
4 | import { signIn, useSession } from '@/lib/auth-client';
5 | 
6 | export function AnonymousAuth() {
7 |   const { data: session, isPending } = useSession();
8 |   const [error, setError] = useState<string | null>(null);
9 | 
10 |   useEffect(() => {
11 |     // Only try to sign in anonymously if:
12 |     // 1. We're not already signing in
13 |     // 2. Session is not pending (loading)
14 |     // 3. There's no active session
15 |     if (!isPending && !session) {
16 |       const attemptSignIn = async () => {
17 |         console.log("Attempting anonymous sign-in (simplified logic)...");
18 |         try {
19 |           // Try the standard way first
20 |           const { data, error } = await signIn.anonymous();
21 |           console.log("Standard anonymous sign-in initiated/checked.");
22 |           if (error) {
23 |             setError("Failed to sign in anonymously. Please try again.");
24 |           } else if (data?.user) {
25 |             // @ts-expect-error TODO: Fix this type error
26 |             if (window.rudderanalytics) {
27 |               // @ts-expect-error TODO: Fix this type error
28 |               window.rudderanalytics.identify(data.user.id, { // Use optional chaining
29 |                 isAnonymous: true,
30 |               });
31 |             }
32 |           }
33 |         } catch (error: any) {
34 |           // Ignore the specific error for already being signed in anonymously
35 |           if (error?.message?.includes('ANONYMOUS_USERS_CANNOT_SIGN_IN_AGAIN') || error?.message?.includes('already signed in anonymously')) {
36 |             console.log("Already signed in anonymously or attempt blocked by backend.");
37 |           } else {
38 |             console.error("Standard anonymous sign-in failed:", error);
39 |             // No fallback - rely solely on the standard method
40 |           }
41 |         }
42 |       };
43 | 
44 |       attemptSignIn();
45 |     }
46 |   }, [session, isPending]);
47 | 
48 |   // This component doesn't render anything - it just handles the authentication logic
49 |   return null;
50 | } 
```

components/auth/SignInButton.tsx
```
1 | "use client";
2 | 
3 | import { signIn } from "@/lib/auth-client";
4 | import { Button } from "@/components/ui/button";
5 | import { LogIn } from "lucide-react";
6 | import { cn } from "@/lib/utils";
7 | 
8 | interface SignInButtonProps {
9 |   isCollapsed?: boolean;
10 | }
11 | 
12 | export function SignInButton({ isCollapsed }: SignInButtonProps) {
13 |   const handleSignIn = async () => {
14 |     try {
15 |       await signIn.social({
16 |         provider: "google",
17 |       });
18 |     } catch (error) {
19 |       console.error("Sign-in error:", error);
20 |     }
21 |   };
22 | 
23 |   return (
24 |     <Button 
25 |       onClick={handleSignIn}
26 |       className={cn(
27 |         "bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors duration-200 ease-in-out shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50",
28 |         isCollapsed ? "w-auto h-auto p-2 aspect-square rounded-lg" : "w-full py-2 px-4 rounded-lg"
29 |       )}
30 |       title={isCollapsed ? "Sign in with Google" : undefined}
31 |     >
32 |       <LogIn className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
33 |       {!isCollapsed && <span>Sign in with Google</span>}
34 |     </Button>
35 |   );
36 | } 
```

components/auth/UserAccountMenu.tsx
```
1 | "use client";
2 | 
3 | import { signOut, useSession } from "@/lib/auth-client";
4 | import { Button } from "@/components/ui/button";
5 | import { 
6 |   DropdownMenu, 
7 |   DropdownMenuContent, 
8 |   DropdownMenuItem, 
9 |   DropdownMenuLabel, 
10 |   DropdownMenuSeparator, 
11 |   DropdownMenuTrigger 
12 | } from "@/components/ui/dropdown-menu";
13 | import { LogOut, User, Settings, LayoutDashboard } from "lucide-react";
14 | import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
15 | import { CheckoutButton } from "@/components/checkout-button";
16 | 
17 | export function UserAccountMenu() {
18 |   const { data: session } = useSession();
19 | 
20 |   if (!session?.user) return null;
21 | 
22 |   const handleSignOut = async () => {
23 |     try {
24 |       await signOut({});
25 |     } catch (error) {
26 |       console.error("Sign-out error:", error);
27 |     }
28 |   };
29 | 
30 |   const userInitials = session.user.name
31 |     ? session.user.name
32 |         .split(' ')
33 |         .map(name => name[0])
34 |         .join('')
35 |         .toUpperCase()
36 |     : session.user.email?.[0]?.toUpperCase() || 'U';
37 | 
38 |   return (
39 |     <DropdownMenu>
40 |       <DropdownMenuTrigger asChild>
41 |         <Button variant="ghost" className="relative h-8 w-8 rounded-full">
42 |           <Avatar className="h-8 w-8">
43 |             <AvatarImage 
44 |               src={session.user.image || ''} 
45 |               alt={session.user.name || 'User'} 
46 |             />
47 |             <AvatarFallback>{userInitials}</AvatarFallback>
48 |           </Avatar>
49 |         </Button>
50 |       </DropdownMenuTrigger>
51 |       <DropdownMenuContent className="w-56" align="end" forceMount>
52 |         <DropdownMenuLabel className="font-normal">
53 |           <div className="flex flex-col space-y-1">
54 |             <p className="text-sm font-medium leading-none">{session.user.name}</p>
55 |             <p className="text-xs leading-none text-muted-foreground">
56 |               {session.user.email}
57 |             </p>
58 |           </div>
59 |         </DropdownMenuLabel>
60 |         <DropdownMenuSeparator />
61 |         
62 |         <div className="p-2">
63 |           <CheckoutButton />
64 |         </div>
65 |         
66 |         <DropdownMenuSeparator />
67 |         <DropdownMenuItem asChild>
68 |           <a href="/api/portal" target="_blank" rel="noopener noreferrer">
69 |             <LayoutDashboard className="mr-2 h-4 w-4" />
70 |             <span>Customer Portal</span>
71 |           </a>
72 |         </DropdownMenuItem>
73 |         <DropdownMenuSeparator />
74 |         <DropdownMenuItem onClick={handleSignOut}>
75 |           <LogOut className="mr-2 h-4 w-4" />
76 |           <span>Log out</span>
77 |         </DropdownMenuItem>
78 |       </DropdownMenuContent>
79 |     </DropdownMenu>
80 |   );
81 | } 
```

components/ui/BuildInfo.tsx
```
1 | export default function BuildInfo() {
2 |   const commit = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown';
3 |     const url = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL || 'unknown';
4 | 
5 |   return (
6 |     <div style={{ fontSize: 12, color: '#888', textAlign: 'center', padding: '8px 0' }}>
7 |       <span>Commit: {commit} | URL: {url}</span>
8 |     </div>
9 |   );
10 | } 
```

components/ui/accordion.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as AccordionPrimitive from "@radix-ui/react-accordion"
5 | import { ChevronDownIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function Accordion({
10 |   ...props
11 | }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
12 |   return <AccordionPrimitive.Root data-slot="accordion" {...props} />
13 | }
14 | 
15 | function AccordionItem({
16 |   className,
17 |   ...props
18 | }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
19 |   return (
20 |     <AccordionPrimitive.Item
21 |       data-slot="accordion-item"
22 |       className={cn("mb-1", className)}
23 |       {...props}
24 |     />
25 |   )
26 | }
27 | 
28 | function AccordionTrigger({
29 |   className,
30 |   children,
31 |   ...props
32 | }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
33 |   return (
34 |     <AccordionPrimitive.Header className="flex">
35 |       <AccordionPrimitive.Trigger
36 |         data-slot="accordion-trigger"
37 |         className={cn(
38 |           "focus-visible:ring-ring/30 flex flex-1 items-center justify-between py-3 text-left text-sm font-medium transition-all outline-none focus-visible:ring-2 rounded-md disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
39 |           className
40 |         )}
41 |         {...props}
42 |       >
43 |         {children}
44 |         <ChevronDownIcon className="text-muted-foreground/70 size-3.5 shrink-0 transition-transform duration-200" />
45 |       </AccordionPrimitive.Trigger>
46 |     </AccordionPrimitive.Header>
47 |   )
48 | }
49 | 
50 | function AccordionContent({
51 |   className,
52 |   children,
53 |   ...props
54 | }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
55 |   return (
56 |     <AccordionPrimitive.Content
57 |       data-slot="accordion-content"
58 |       className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
59 |       {...props}
60 |     >
61 |       <div className={cn("py-2 pl-1", className)}>{children}</div>
62 |     </AccordionPrimitive.Content>
63 |   )
64 | }
65 | 
66 | export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
```

components/ui/avatar.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as AvatarPrimitive from "@radix-ui/react-avatar"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Avatar({
9 |   className,
10 |   ...props
11 | }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
12 |   return (
13 |     <AvatarPrimitive.Root
14 |       data-slot="avatar"
15 |       className={cn(
16 |         "relative flex size-8 shrink-0 overflow-hidden rounded-full",
17 |         className
18 |       )}
19 |       {...props}
20 |     />
21 |   )
22 | }
23 | 
24 | function AvatarImage({
25 |   className,
26 |   ...props
27 | }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
28 |   return (
29 |     <AvatarPrimitive.Image
30 |       data-slot="avatar-image"
31 |       className={cn("aspect-square size-full", className)}
32 |       {...props}
33 |     />
34 |   )
35 | }
36 | 
37 | function AvatarFallback({
38 |   className,
39 |   ...props
40 | }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
41 |   return (
42 |     <AvatarPrimitive.Fallback
43 |       data-slot="avatar-fallback"
44 |       className={cn(
45 |         "bg-muted flex size-full items-center justify-center rounded-full",
46 |         className
47 |       )}
48 |       {...props}
49 |     />
50 |   )
51 | }
52 | 
53 | export { Avatar, AvatarImage, AvatarFallback }
```

components/ui/badge.tsx
```
1 | import * as React from "react"
2 | import { Slot } from "@radix-ui/react-slot"
3 | import { cva, type VariantProps } from "class-variance-authority"
4 | 
5 | import { cn } from "@/lib/utils"
6 | 
7 | const badgeVariants = cva(
8 |   "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
9 |   {
10 |     variants: {
11 |       variant: {
12 |         default:
13 |           "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
14 |         secondary:
15 |           "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
16 |         destructive:
17 |           "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
18 |         outline:
19 |           "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
20 |       },
21 |     },
22 |     defaultVariants: {
23 |       variant: "default",
24 |     },
25 |   }
26 | )
27 | 
28 | function Badge({
29 |   className,
30 |   variant,
31 |   asChild = false,
32 |   ...props
33 | }: React.ComponentProps<"span"> &
34 |   VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
35 |   const Comp = asChild ? Slot : "span"
36 | 
37 |   return (
38 |     <Comp
39 |       data-slot="badge"
40 |       className={cn(badgeVariants({ variant }), className)}
41 |       {...props}
42 |     />
43 |   )
44 | }
45 | 
46 | export { Badge, badgeVariants }
```

components/ui/button.tsx
```
1 | import * as React from "react"
2 | import { Slot } from "@radix-ui/react-slot"
3 | import { cva, type VariantProps } from "class-variance-authority"
4 | 
5 | import { cn } from "@/lib/utils"
6 | 
7 | const buttonVariants = cva(
8 |   "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
9 |   {
10 |     variants: {
11 |       variant: {
12 |         default:
13 |           "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
14 |         destructive:
15 |           "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
16 |         outline:
17 |           "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
18 |         secondary:
19 |           "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
20 |         ghost:
21 |           "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
22 |         link: "text-primary underline-offset-4 hover:underline",
23 |       },
24 |       size: {
25 |         default: "h-9 px-4 py-2 has-[>svg]:px-3",
26 |         sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
27 |         lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
28 |         icon: "size-9",
29 |       },
30 |     },
31 |     defaultVariants: {
32 |       variant: "default",
33 |       size: "default",
34 |     },
35 |   }
36 | )
37 | 
38 | function Button({
39 |   className,
40 |   variant,
41 |   size,
42 |   asChild = false,
43 |   ...props
44 | }: React.ComponentProps<"button"> &
45 |   VariantProps<typeof buttonVariants> & {
46 |     asChild?: boolean
47 |   }) {
48 |   const Comp = asChild ? Slot : "button"
49 | 
50 |   return (
51 |     <Comp
52 |       data-slot="button"
53 |       className={cn(buttonVariants({ variant, size, className }))}
54 |       {...props}
55 |     />
56 |   )
57 | }
58 | 
59 | export { Button, buttonVariants }
```

components/ui/card.tsx
```
1 | import * as React from "react"
2 | 
3 | import { cn } from "@/lib/utils"
4 | 
5 | const Card = React.forwardRef<
6 |   HTMLDivElement,
7 |   React.HTMLAttributes<HTMLDivElement>
8 | >(({ className, ...props }, ref) => (
9 |   <div
10 |     ref={ref}
11 |     className={cn(
12 |       "rounded-lg border bg-card text-card-foreground shadow-sm",
13 |       className
14 |     )}
15 |     {...props}
16 |   />
17 | ))
18 | Card.displayName = "Card"
19 | 
20 | const CardHeader = React.forwardRef<
21 |   HTMLDivElement,
22 |   React.HTMLAttributes<HTMLDivElement>
23 | >(({ className, ...props }, ref) => (
24 |   <div
25 |     ref={ref}
26 |     className={cn("flex flex-col space-y-1.5 p-6", className)}
27 |     {...props}
28 |   />
29 | ))
30 | CardHeader.displayName = "CardHeader"
31 | 
32 | const CardTitle = React.forwardRef<
33 |   HTMLParagraphElement,
34 |   React.HTMLAttributes<HTMLHeadingElement>
35 | >(({ className, ...props }, ref) => (
36 |   <h3
37 |     ref={ref}
38 |     className={cn(
39 |       "text-2xl font-semibold leading-none tracking-tight",
40 |       className
41 |     )}
42 |     {...props}
43 |   />
44 | ))
45 | CardTitle.displayName = "CardTitle"
46 | 
47 | const CardDescription = React.forwardRef<
48 |   HTMLParagraphElement,
49 |   React.HTMLAttributes<HTMLParagraphElement>
50 | >(({ className, ...props }, ref) => (
51 |   <p
52 |     ref={ref}
53 |     className={cn("text-sm text-muted-foreground", className)}
54 |     {...props}
55 |   />
56 | ))
57 | CardDescription.displayName = "CardDescription"
58 | 
59 | const CardContent = React.forwardRef<
60 |   HTMLDivElement,
61 |   React.HTMLAttributes<HTMLDivElement>
62 | >(({ className, ...props }, ref) => (
63 |   <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
64 | ))
65 | CardContent.displayName = "CardContent"
66 | 
67 | const CardFooter = React.forwardRef<
68 |   HTMLDivElement,
69 |   React.HTMLAttributes<HTMLDivElement>
70 | >(({ className, ...props }, ref) => (
71 |   <div
72 |     ref={ref}
73 |     className={cn("flex items-center p-6 pt-0", className)}
74 |     {...props}
75 |   />
76 | ))
77 | CardFooter.displayName = "CardFooter"
78 | 
79 | export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } 
```

components/ui/dialog.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as DialogPrimitive from "@radix-ui/react-dialog"
5 | import { XIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function Dialog({
10 |   ...props
11 | }: React.ComponentProps<typeof DialogPrimitive.Root>) {
12 |   return <DialogPrimitive.Root data-slot="dialog" {...props} />
13 | }
14 | 
15 | function DialogTrigger({
16 |   ...props
17 | }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
18 |   return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
19 | }
20 | 
21 | function DialogPortal({
22 |   ...props
23 | }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
24 |   return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
25 | }
26 | 
27 | function DialogClose({
28 |   ...props
29 | }: React.ComponentProps<typeof DialogPrimitive.Close>) {
30 |   return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
31 | }
32 | 
33 | function DialogOverlay({
34 |   className,
35 |   ...props
36 | }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
37 |   return (
38 |     <DialogPrimitive.Overlay
39 |       data-slot="dialog-overlay"
40 |       className={cn(
41 |         "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
42 |         className
43 |       )}
44 |       {...props}
45 |     />
46 |   )
47 | }
48 | 
49 | function DialogContent({
50 |   className,
51 |   children,
52 |   ...props
53 | }: React.ComponentProps<typeof DialogPrimitive.Content>) {
54 |   return (
55 |     <DialogPortal data-slot="dialog-portal">
56 |       <DialogOverlay />
57 |       <DialogPrimitive.Content
58 |         data-slot="dialog-content"
59 |         className={cn(
60 |           "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
61 |           className
62 |         )}
63 |         {...props}
64 |       >
65 |         {children}
66 |         <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
67 |           <XIcon />
68 |           <span className="sr-only">Close</span>
69 |         </DialogPrimitive.Close>
70 |       </DialogPrimitive.Content>
71 |     </DialogPortal>
72 |   )
73 | }
74 | 
75 | function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
76 |   return (
77 |     <div
78 |       data-slot="dialog-header"
79 |       className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
80 |       {...props}
81 |     />
82 |   )
83 | }
84 | 
85 | function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
86 |   return (
87 |     <div
88 |       data-slot="dialog-footer"
89 |       className={cn(
90 |         "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
91 |         className
92 |       )}
93 |       {...props}
94 |     />
95 |   )
96 | }
97 | 
98 | function DialogTitle({
99 |   className,
100 |   ...props
101 | }: React.ComponentProps<typeof DialogPrimitive.Title>) {
102 |   return (
103 |     <DialogPrimitive.Title
104 |       data-slot="dialog-title"
105 |       className={cn("text-lg leading-none font-semibold", className)}
106 |       {...props}
107 |     />
108 |   )
109 | }
110 | 
111 | function DialogDescription({
112 |   className,
113 |   ...props
114 | }: React.ComponentProps<typeof DialogPrimitive.Description>) {
115 |   return (
116 |     <DialogPrimitive.Description
117 |       data-slot="dialog-description"
118 |       className={cn("text-muted-foreground text-sm", className)}
119 |       {...props}
120 |     />
121 |   )
122 | }
123 | 
124 | export {
125 |   Dialog,
126 |   DialogClose,
127 |   DialogContent,
128 |   DialogDescription,
129 |   DialogFooter,
130 |   DialogHeader,
131 |   DialogOverlay,
132 |   DialogPortal,
133 |   DialogTitle,
134 |   DialogTrigger,
135 | }
```

components/ui/dropdown-menu.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
5 | import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function DropdownMenu({
10 |   ...props
11 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
12 |   return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
13 | }
14 | 
15 | function DropdownMenuPortal({
16 |   ...props
17 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
18 |   return (
19 |     <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
20 |   )
21 | }
22 | 
23 | function DropdownMenuTrigger({
24 |   ...props
25 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
26 |   return (
27 |     <DropdownMenuPrimitive.Trigger
28 |       data-slot="dropdown-menu-trigger"
29 |       {...props}
30 |     />
31 |   )
32 | }
33 | 
34 | function DropdownMenuContent({
35 |   className,
36 |   sideOffset = 4,
37 |   ...props
38 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
39 |   return (
40 |     <DropdownMenuPrimitive.Portal>
41 |       <DropdownMenuPrimitive.Content
42 |         data-slot="dropdown-menu-content"
43 |         sideOffset={sideOffset}
44 |         className={cn(
45 |           "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
46 |           className
47 |         )}
48 |         {...props}
49 |       />
50 |     </DropdownMenuPrimitive.Portal>
51 |   )
52 | }
53 | 
54 | function DropdownMenuGroup({
55 |   ...props
56 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
57 |   return (
58 |     <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
59 |   )
60 | }
61 | 
62 | function DropdownMenuItem({
63 |   className,
64 |   inset,
65 |   variant = "default",
66 |   ...props
67 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
68 |   inset?: boolean
69 |   variant?: "default" | "destructive"
70 | }) {
71 |   return (
72 |     <DropdownMenuPrimitive.Item
73 |       data-slot="dropdown-menu-item"
74 |       data-inset={inset}
75 |       data-variant={variant}
76 |       className={cn(
77 |         "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
78 |         className
79 |       )}
80 |       {...props}
81 |     />
82 |   )
83 | }
84 | 
85 | function DropdownMenuCheckboxItem({
86 |   className,
87 |   children,
88 |   checked,
89 |   ...props
90 | }: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
91 |   return (
92 |     <DropdownMenuPrimitive.CheckboxItem
93 |       data-slot="dropdown-menu-checkbox-item"
94 |       className={cn(
95 |         "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
96 |         className
97 |       )}
98 |       checked={checked}
99 |       {...props}
100 |     >
101 |       <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
102 |         <DropdownMenuPrimitive.ItemIndicator>
103 |           <CheckIcon className="size-4" />
104 |         </DropdownMenuPrimitive.ItemIndicator>
105 |       </span>
106 |       {children}
107 |     </DropdownMenuPrimitive.CheckboxItem>
108 |   )
109 | }
110 | 
111 | function DropdownMenuRadioGroup({
112 |   ...props
113 | }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
114 |   return (
115 |     <DropdownMenuPrimitive.RadioGroup
116 |       data-slot="dropdown-menu-radio-group"
117 |       {...props}
118 |     />
119 |   )
120 | }
121 | 
122 | function DropdownMenuRadioItem({
123 |   className,
124 |   children,
125 |   ...props
126 | }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
127 |   return (
128 |     <DropdownMenuPrimitive.RadioItem
129 |       data-slot="dropdown-menu-radio-item"
130 |       className={cn(
131 |         "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
132 |         className
133 |       )}
134 |       {...props}
135 |     >
136 |       <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
137 |         <DropdownMenuPrimitive.ItemIndicator>
138 |           <CircleIcon className="size-2 fill-current" />
139 |         </DropdownMenuPrimitive.ItemIndicator>
140 |       </span>
141 |       {children}
142 |     </DropdownMenuPrimitive.RadioItem>
143 |   )
144 | }
145 | 
146 | function DropdownMenuLabel({
147 |   className,
148 |   inset,
149 |   ...props
150 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
151 |   inset?: boolean
152 | }) {
153 |   return (
154 |     <DropdownMenuPrimitive.Label
155 |       data-slot="dropdown-menu-label"
156 |       data-inset={inset}
157 |       className={cn(
158 |         "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
159 |         className
160 |       )}
161 |       {...props}
162 |     />
163 |   )
164 | }
165 | 
166 | function DropdownMenuSeparator({
167 |   className,
168 |   ...props
169 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
170 |   return (
171 |     <DropdownMenuPrimitive.Separator
172 |       data-slot="dropdown-menu-separator"
173 |       className={cn("bg-border -mx-1 my-1 h-px", className)}
174 |       {...props}
175 |     />
176 |   )
177 | }
178 | 
179 | function DropdownMenuShortcut({
180 |   className,
181 |   ...props
182 | }: React.ComponentProps<"span">) {
183 |   return (
184 |     <span
185 |       data-slot="dropdown-menu-shortcut"
186 |       className={cn(
187 |         "text-muted-foreground ml-auto text-xs tracking-widest",
188 |         className
189 |       )}
190 |       {...props}
191 |     />
192 |   )
193 | }
194 | 
195 | function DropdownMenuSub({
196 |   ...props
197 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
198 |   return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
199 | }
200 | 
201 | function DropdownMenuSubTrigger({
202 |   className,
203 |   inset,
204 |   children,
205 |   ...props
206 | }: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
207 |   inset?: boolean
208 | }) {
209 |   return (
210 |     <DropdownMenuPrimitive.SubTrigger
211 |       data-slot="dropdown-menu-sub-trigger"
212 |       data-inset={inset}
213 |       className={cn(
214 |         "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
215 |         className
216 |       )}
217 |       {...props}
218 |     >
219 |       {children}
220 |       <ChevronRightIcon className="ml-auto size-4" />
221 |     </DropdownMenuPrimitive.SubTrigger>
222 |   )
223 | }
224 | 
225 | function DropdownMenuSubContent({
226 |   className,
227 |   ...props
228 | }: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
229 |   return (
230 |     <DropdownMenuPrimitive.SubContent
231 |       data-slot="dropdown-menu-sub-content"
232 |       className={cn(
233 |         "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
234 |         className
235 |       )}
236 |       {...props}
237 |     />
238 |   )
239 | }
240 | 
241 | export {
242 |   DropdownMenu,
243 |   DropdownMenuPortal,
244 |   DropdownMenuTrigger,
245 |   DropdownMenuContent,
246 |   DropdownMenuGroup,
247 |   DropdownMenuLabel,
248 |   DropdownMenuItem,
249 |   DropdownMenuCheckboxItem,
250 |   DropdownMenuRadioGroup,
251 |   DropdownMenuRadioItem,
252 |   DropdownMenuSeparator,
253 |   DropdownMenuShortcut,
254 |   DropdownMenuSub,
255 |   DropdownMenuSubTrigger,
256 |   DropdownMenuSubContent,
257 | }
```

components/ui/input.tsx
```
1 | import * as React from "react"
2 | 
3 | import { cn } from "@/lib/utils"
4 | 
5 | function Input({ className, type, ...props }: React.ComponentProps<"input">) {
6 |   return (
7 |     <input
8 |       type={type}
9 |       data-slot="input"
10 |       className={cn(
11 |         "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
12 |         "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
13 |         "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
14 |         className
15 |       )}
16 |       {...props}
17 |     />
18 |   )
19 | }
20 | 
21 | export { Input }
```

components/ui/label.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as LabelPrimitive from "@radix-ui/react-label"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Label({
9 |   className,
10 |   ...props
11 | }: React.ComponentProps<typeof LabelPrimitive.Root>) {
12 |   return (
13 |     <LabelPrimitive.Root
14 |       data-slot="label"
15 |       className={cn(
16 |         "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
17 |         className
18 |       )}
19 |       {...props}
20 |     />
21 |   )
22 | }
23 | 
24 | export { Label }
```

components/ui/popover.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as PopoverPrimitive from "@radix-ui/react-popover"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Popover({
9 |   ...props
10 | }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
11 |   return <PopoverPrimitive.Root data-slot="popover" {...props} />
12 | }
13 | 
14 | function PopoverTrigger({
15 |   ...props
16 | }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
17 |   return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
18 | }
19 | 
20 | function PopoverContent({
21 |   className,
22 |   align = "center",
23 |   sideOffset = 4,
24 |   ...props
25 | }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
26 |   return (
27 |     <PopoverPrimitive.Portal>
28 |       <PopoverPrimitive.Content
29 |         data-slot="popover-content"
30 |         align={align}
31 |         sideOffset={sideOffset}
32 |         className={cn(
33 |           "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
34 |           className
35 |         )}
36 |         {...props}
37 |       />
38 |     </PopoverPrimitive.Portal>
39 |   )
40 | }
41 | 
42 | function PopoverAnchor({
43 |   ...props
44 | }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
45 |   return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
46 | }
47 | 
48 | export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
```

components/ui/scroll-area.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function ScrollArea({
9 |   className,
10 |   children,
11 |   ...props
12 | }: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
13 |   return (
14 |     <ScrollAreaPrimitive.Root
15 |       data-slot="scroll-area"
16 |       className={cn("relative", className)}
17 |       {...props}
18 |     >
19 |       <ScrollAreaPrimitive.Viewport
20 |         data-slot="scroll-area-viewport"
21 |         className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
22 |       >
23 |         {children}
24 |       </ScrollAreaPrimitive.Viewport>
25 |       <ScrollBar />
26 |       <ScrollAreaPrimitive.Corner />
27 |     </ScrollAreaPrimitive.Root>
28 |   )
29 | }
30 | 
31 | function ScrollBar({
32 |   className,
33 |   orientation = "vertical",
34 |   ...props
35 | }: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
36 |   return (
37 |     <ScrollAreaPrimitive.ScrollAreaScrollbar
38 |       data-slot="scroll-area-scrollbar"
39 |       orientation={orientation}
40 |       className={cn(
41 |         "flex touch-none p-px transition-colors select-none",
42 |         orientation === "vertical" &&
43 |           "h-full w-2.5 border-l border-l-transparent",
44 |         orientation === "horizontal" &&
45 |           "h-2.5 flex-col border-t border-t-transparent",
46 |         className
47 |       )}
48 |       {...props}
49 |     >
50 |       <ScrollAreaPrimitive.ScrollAreaThumb
51 |         data-slot="scroll-area-thumb"
52 |         className="bg-border relative flex-1 rounded-full"
53 |       />
54 |     </ScrollAreaPrimitive.ScrollAreaScrollbar>
55 |   )
56 | }
57 | 
58 | export { ScrollArea, ScrollBar }
```

components/ui/select.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as SelectPrimitive from "@radix-ui/react-select"
5 | import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function Select({
10 |   ...props
11 | }: React.ComponentProps<typeof SelectPrimitive.Root>) {
12 |   return <SelectPrimitive.Root data-slot="select" {...props} />
13 | }
14 | 
15 | function SelectGroup({
16 |   ...props
17 | }: React.ComponentProps<typeof SelectPrimitive.Group>) {
18 |   return <SelectPrimitive.Group data-slot="select-group" {...props} />
19 | }
20 | 
21 | function SelectValue({
22 |   ...props
23 | }: React.ComponentProps<typeof SelectPrimitive.Value>) {
24 |   return <SelectPrimitive.Value data-slot="select-value" {...props} />
25 | }
26 | 
27 | function SelectTrigger({
28 |   className,
29 |   children,
30 |   ...props
31 | }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
32 |   return (
33 |     <SelectPrimitive.Trigger
34 |       data-slot="select-trigger"
35 |       className={cn(
36 |         "text-muted-foreground data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-9 w-fit items-center justify-between gap-2 rounded-md bg-transparent px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none hover:bg-secondary data-[state=open]:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
37 |         className
38 |       )}
39 |       {...props}
40 |     >
41 |       {children}
42 |       <SelectPrimitive.Icon asChild>
43 |         <ChevronDownIcon className="size-4 opacity-50" />
44 |       </SelectPrimitive.Icon>
45 |     </SelectPrimitive.Trigger>
46 |   )
47 | }
48 | 
49 | function SelectContent({
50 |   className,
51 |   children,
52 |   position = "popper",
53 |   ...props
54 | }: React.ComponentProps<typeof SelectPrimitive.Content>) {
55 |   return (
56 |     <SelectPrimitive.Portal>
57 |       <SelectPrimitive.Content
58 |         data-slot="select-content"
59 |         className={cn(
60 |           "bg-secondary text-secondary-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
61 |           position === "popper" &&
62 |             "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
63 |           className
64 |         )}
65 |         position={position}
66 |         {...props}
67 |       >
68 |         <SelectScrollUpButton />
69 |         <SelectPrimitive.Viewport
70 |           className={cn(
71 |             "p-1",
72 |             position === "popper" &&
73 |               "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
74 |           )}
75 |         >
76 |           {children}
77 |         </SelectPrimitive.Viewport>
78 |         <SelectScrollDownButton />
79 |       </SelectPrimitive.Content>
80 |     </SelectPrimitive.Portal>
81 |   )
82 | }
83 | 
84 | function SelectLabel({
85 |   className,
86 |   ...props
87 | }: React.ComponentProps<typeof SelectPrimitive.Label>) {
88 |   return (
89 |     <SelectPrimitive.Label
90 |       data-slot="select-label"
91 |       className={cn("px-2 py-1.5 text-sm font-medium", className)}
92 |       {...props}
93 |     />
94 |   )
95 | }
96 | 
97 | function SelectItem({
98 |   className,
99 |   children,
100 |   ...props
101 | }: React.ComponentProps<typeof SelectPrimitive.Item>) {
102 |   return (
103 |     <SelectPrimitive.Item
104 |       data-slot="select-item"
105 |       className={cn(
106 |         "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
107 |         className
108 |       )}
109 |       {...props}
110 |     >
111 |       <span className="absolute right-2 flex size-3.5 items-center justify-center">
112 |         <SelectPrimitive.ItemIndicator>
113 |           <CheckIcon className="size-4" />
114 |         </SelectPrimitive.ItemIndicator>
115 |       </span>
116 |       <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
117 |     </SelectPrimitive.Item>
118 |   )
119 | }
120 | 
121 | function SelectSeparator({
122 |   className,
123 |   ...props
124 | }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
125 |   return (
126 |     <SelectPrimitive.Separator
127 |       data-slot="select-separator"
128 |       className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
129 |       {...props}
130 |     />
131 |   )
132 | }
133 | 
134 | function SelectScrollUpButton({
135 |   className,
136 |   ...props
137 | }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
138 |   return (
139 |     <SelectPrimitive.ScrollUpButton
140 |       data-slot="select-scroll-up-button"
141 |       className={cn(
142 |         "flex cursor-default items-center justify-center py-1",
143 |         className
144 |       )}
145 |       {...props}
146 |     >
147 |       <ChevronUpIcon className="size-4" />
148 |     </SelectPrimitive.ScrollUpButton>
149 |   )
150 | }
151 | 
152 | function SelectScrollDownButton({
153 |   className,
154 |   ...props
155 | }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
156 |   return (
157 |     <SelectPrimitive.ScrollDownButton
158 |       data-slot="select-scroll-down-button"
159 |       className={cn(
160 |         "flex cursor-default items-center justify-center py-1",
161 |         className
162 |       )}
163 |       {...props}
164 |     >
165 |       <ChevronDownIcon className="size-4" />
166 |     </SelectPrimitive.ScrollDownButton>
167 |   )
168 | }
169 | 
170 | export {
171 |   Select,
172 |   SelectContent,
173 |   SelectGroup,
174 |   SelectItem,
175 |   SelectLabel,
176 |   SelectScrollDownButton,
177 |   SelectScrollUpButton,
178 |   SelectSeparator,
179 |   SelectTrigger,
180 |   SelectValue,
181 | }
```

components/ui/separator.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as SeparatorPrimitive from "@radix-ui/react-separator"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Separator({
9 |   className,
10 |   orientation = "horizontal",
11 |   decorative = true,
12 |   ...props
13 | }: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
14 |   return (
15 |     <SeparatorPrimitive.Root
16 |       data-slot="separator-root"
17 |       decorative={decorative}
18 |       orientation={orientation}
19 |       className={cn(
20 |         "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
21 |         className
22 |       )}
23 |       {...props}
24 |     />
25 |   )
26 | }
27 | 
28 | export { Separator }
```

components/ui/sheet.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as SheetPrimitive from "@radix-ui/react-dialog"
5 | import { XIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | 
9 | function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
10 |   return <SheetPrimitive.Root data-slot="sheet" {...props} />
11 | }
12 | 
13 | function SheetTrigger({
14 |   ...props
15 | }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
16 |   return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
17 | }
18 | 
19 | function SheetClose({
20 |   ...props
21 | }: React.ComponentProps<typeof SheetPrimitive.Close>) {
22 |   return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
23 | }
24 | 
25 | function SheetPortal({
26 |   ...props
27 | }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
28 |   return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
29 | }
30 | 
31 | function SheetOverlay({
32 |   className,
33 |   ...props
34 | }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
35 |   return (
36 |     <SheetPrimitive.Overlay
37 |       data-slot="sheet-overlay"
38 |       className={cn(
39 |         "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
40 |         className
41 |       )}
42 |       {...props}
43 |     />
44 |   )
45 | }
46 | 
47 | function SheetContent({
48 |   className,
49 |   children,
50 |   side = "right",
51 |   ...props
52 | }: React.ComponentProps<typeof SheetPrimitive.Content> & {
53 |   side?: "top" | "right" | "bottom" | "left"
54 | }) {
55 |   return (
56 |     <SheetPortal>
57 |       <SheetOverlay />
58 |       <SheetPrimitive.Content
59 |         data-slot="sheet-content"
60 |         className={cn(
61 |           "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
62 |           side === "right" &&
63 |             "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
64 |           side === "left" &&
65 |             "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
66 |           side === "top" &&
67 |             "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
68 |           side === "bottom" &&
69 |             "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
70 |           className
71 |         )}
72 |         {...props}
73 |       >
74 |         {children}
75 |         <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
76 |           <XIcon className="size-4" />
77 |           <span className="sr-only">Close</span>
78 |         </SheetPrimitive.Close>
79 |       </SheetPrimitive.Content>
80 |     </SheetPortal>
81 |   )
82 | }
83 | 
84 | function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
85 |   return (
86 |     <div
87 |       data-slot="sheet-header"
88 |       className={cn("flex flex-col gap-1.5 p-4", className)}
89 |       {...props}
90 |     />
91 |   )
92 | }
93 | 
94 | function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
95 |   return (
96 |     <div
97 |       data-slot="sheet-footer"
98 |       className={cn("mt-auto flex flex-col gap-2 p-4", className)}
99 |       {...props}
100 |     />
101 |   )
102 | }
103 | 
104 | function SheetTitle({
105 |   className,
106 |   ...props
107 | }: React.ComponentProps<typeof SheetPrimitive.Title>) {
108 |   return (
109 |     <SheetPrimitive.Title
110 |       data-slot="sheet-title"
111 |       className={cn("text-foreground font-semibold", className)}
112 |       {...props}
113 |     />
114 |   )
115 | }
116 | 
117 | function SheetDescription({
118 |   className,
119 |   ...props
120 | }: React.ComponentProps<typeof SheetPrimitive.Description>) {
121 |   return (
122 |     <SheetPrimitive.Description
123 |       data-slot="sheet-description"
124 |       className={cn("text-muted-foreground text-sm", className)}
125 |       {...props}
126 |     />
127 |   )
128 | }
129 | 
130 | export {
131 |   Sheet,
132 |   SheetTrigger,
133 |   SheetClose,
134 |   SheetContent,
135 |   SheetHeader,
136 |   SheetFooter,
137 |   SheetTitle,
138 |   SheetDescription,
139 | }
```

components/ui/sidebar.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import { Slot } from "@radix-ui/react-slot"
5 | import { VariantProps, cva } from "class-variance-authority"
6 | import { PanelLeftIcon } from "lucide-react"
7 | 
8 | import { useIsMobile } from "@/hooks/use-mobile"
9 | import { cn } from "@/lib/utils"
10 | import { Button } from "@/components/ui/button"
11 | import { Input } from "@/components/ui/input"
12 | import { Separator } from "@/components/ui/separator"
13 | import {
14 |   Sheet,
15 |   SheetContent,
16 |   SheetDescription,
17 |   SheetHeader,
18 |   SheetTitle,
19 | } from "@/components/ui/sheet"
20 | import { Skeleton } from "@/components/ui/skeleton"
21 | import {
22 |   Tooltip,
23 |   TooltipContent,
24 |   TooltipProvider,
25 |   TooltipTrigger,
26 | } from "@/components/ui/tooltip"
27 | 
28 | const SIDEBAR_COOKIE_NAME = "sidebar_state"
29 | const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
30 | const SIDEBAR_WIDTH = "16rem"
31 | const SIDEBAR_WIDTH_MOBILE = "18rem"
32 | const SIDEBAR_WIDTH_ICON = "3rem"
33 | const SIDEBAR_KEYBOARD_SHORTCUT = "b"
34 | 
35 | type SidebarContextProps = {
36 |   state: "expanded" | "collapsed"
37 |   open: boolean
38 |   setOpen: (open: boolean) => void
39 |   openMobile: boolean
40 |   setOpenMobile: (open: boolean) => void
41 |   isMobile: boolean
42 |   toggleSidebar: () => void
43 | }
44 | 
45 | const SidebarContext = React.createContext<SidebarContextProps | null>(null)
46 | 
47 | function useSidebar() {
48 |   const context = React.useContext(SidebarContext)
49 |   if (!context) {
50 |     throw new Error("useSidebar must be used within a SidebarProvider.")
51 |   }
52 | 
53 |   return context
54 | }
55 | 
56 | function SidebarProvider({
57 |   defaultOpen = true,
58 |   open: openProp,
59 |   onOpenChange: setOpenProp,
60 |   className,
61 |   style,
62 |   children,
63 |   ...props
64 | }: React.ComponentProps<"div"> & {
65 |   defaultOpen?: boolean
66 |   open?: boolean
67 |   onOpenChange?: (open: boolean) => void
68 | }) {
69 |   const isMobile = useIsMobile()
70 |   const [openMobile, setOpenMobile] = React.useState(false)
71 | 
72 |   // This is the internal state of the sidebar.
73 |   // We use openProp and setOpenProp for control from outside the component.
74 |   const [_open, _setOpen] = React.useState(defaultOpen)
75 |   const open = openProp ?? _open
76 |   const setOpen = React.useCallback(
77 |     (value: boolean | ((value: boolean) => boolean)) => {
78 |       const openState = typeof value === "function" ? value(open) : value
79 |       if (setOpenProp) {
80 |         setOpenProp(openState)
81 |       } else {
82 |         _setOpen(openState)
83 |       }
84 | 
85 |       // This sets the cookie to keep the sidebar state.
86 |       document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
87 |     },
88 |     [setOpenProp, open]
89 |   )
90 | 
91 |   // Helper to toggle the sidebar.
92 |   const toggleSidebar = React.useCallback(() => {
93 |     return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
94 |   }, [isMobile, setOpen, setOpenMobile])
95 | 
96 |   // Adds a keyboard shortcut to toggle the sidebar.
97 |   React.useEffect(() => {
98 |     const handleKeyDown = (event: KeyboardEvent) => {
99 |       if (
100 |         event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
101 |         (event.metaKey || event.ctrlKey)
102 |       ) {
103 |         event.preventDefault()
104 |         toggleSidebar()
105 |       }
106 |     }
107 | 
108 |     window.addEventListener("keydown", handleKeyDown)
109 |     return () => window.removeEventListener("keydown", handleKeyDown)
110 |   }, [toggleSidebar])
111 | 
112 |   // We add a state so that we can do data-state="expanded" or "collapsed".
113 |   // This makes it easier to style the sidebar with Tailwind classes.
114 |   const state = open ? "expanded" : "collapsed"
115 | 
116 |   const contextValue = React.useMemo<SidebarContextProps>(
117 |     () => ({
118 |       state,
119 |       open,
120 |       setOpen,
121 |       isMobile,
122 |       openMobile,
123 |       setOpenMobile,
124 |       toggleSidebar,
125 |     }),
126 |     [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
127 |   )
128 | 
129 |   return (
130 |     <SidebarContext.Provider value={contextValue}>
131 |       <TooltipProvider delayDuration={0}>
132 |         <div
133 |           data-slot="sidebar-wrapper"
134 |           style={
135 |             {
136 |               "--sidebar-width": SIDEBAR_WIDTH,
137 |               "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
138 |               ...style,
139 |             } as React.CSSProperties
140 |           }
141 |           className={cn(
142 |             "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
143 |             className
144 |           )}
145 |           {...props}
146 |         >
147 |           {children}
148 |         </div>
149 |       </TooltipProvider>
150 |     </SidebarContext.Provider>
151 |   )
152 | }
153 | 
154 | function Sidebar({
155 |   side = "left",
156 |   variant = "sidebar",
157 |   collapsible = "offcanvas",
158 |   className,
159 |   children,
160 |   ...props
161 | }: React.ComponentProps<"div"> & {
162 |   side?: "left" | "right"
163 |   variant?: "sidebar" | "floating" | "inset"
164 |   collapsible?: "offcanvas" | "icon" | "none"
165 | }) {
166 |   const { isMobile, state, openMobile, setOpenMobile } = useSidebar()
167 | 
168 |   if (collapsible === "none") {
169 |     return (
170 |       <div
171 |         data-slot="sidebar"
172 |         className={cn(
173 |           "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
174 |           className
175 |         )}
176 |         {...props}
177 |       >
178 |         {children}
179 |       </div>
180 |     )
181 |   }
182 | 
183 |   if (isMobile) {
184 |     return (
185 |       <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
186 |         <SheetContent
187 |           data-sidebar="sidebar"
188 |           data-slot="sidebar"
189 |           data-mobile="true"
190 |           className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
191 |           style={
192 |             {
193 |               "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
194 |             } as React.CSSProperties
195 |           }
196 |           side={side}
197 |         >
198 |           <SheetHeader className="sr-only">
199 |             <SheetTitle>Sidebar</SheetTitle>
200 |             <SheetDescription>Displays the mobile sidebar.</SheetDescription>
201 |           </SheetHeader>
202 |           <div className="flex h-full w-full flex-col">{children}</div>
203 |         </SheetContent>
204 |       </Sheet>
205 |     )
206 |   }
207 | 
208 |   return (
209 |     <div
210 |       className="group peer text-sidebar-foreground hidden md:block"
211 |       data-state={state}
212 |       data-collapsible={state === "collapsed" ? collapsible : ""}
213 |       data-variant={variant}
214 |       data-side={side}
215 |       data-slot="sidebar"
216 |     >
217 |       {/* This is what handles the sidebar gap on desktop */}
218 |       <div
219 |         data-slot="sidebar-gap"
220 |         className={cn(
221 |           "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
222 |           "group-data-[collapsible=offcanvas]:w-0",
223 |           "group-data-[side=right]:rotate-180",
224 |           variant === "floating" || variant === "inset"
225 |             ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
226 |             : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
227 |         )}
228 |       />
229 |       <div
230 |         data-slot="sidebar-container"
231 |         className={cn(
232 |           "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
233 |           side === "left"
234 |             ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
235 |             : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
236 |           // Adjust the padding for floating and inset variants.
237 |           variant === "floating" || variant === "inset"
238 |             ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
239 |             : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
240 |           className
241 |         )}
242 |         {...props}
243 |       >
244 |         <div
245 |           data-sidebar="sidebar"
246 |           data-slot="sidebar-inner"
247 |           className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
248 |         >
249 |           {children}
250 |         </div>
251 |       </div>
252 |     </div>
253 |   )
254 | }
255 | 
256 | function SidebarTrigger({
257 |   className,
258 |   onClick,
259 |   ...props
260 | }: React.ComponentProps<typeof Button>) {
261 |   const { toggleSidebar } = useSidebar()
262 | 
263 |   return (
264 |     <Button
265 |       data-sidebar="trigger"
266 |       data-slot="sidebar-trigger"
267 |       variant="ghost"
268 |       size="icon"
269 |       className={cn("size-7", className)}
270 |       onClick={(event) => {
271 |         onClick?.(event)
272 |         toggleSidebar()
273 |       }}
274 |       {...props}
275 |     >
276 |       <PanelLeftIcon />
277 |       <span className="sr-only">Toggle Sidebar</span>
278 |     </Button>
279 |   )
280 | }
281 | 
282 | function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
283 |   const { toggleSidebar } = useSidebar()
284 | 
285 |   return (
286 |     <button
287 |       data-sidebar="rail"
288 |       data-slot="sidebar-rail"
289 |       aria-label="Toggle Sidebar"
290 |       tabIndex={-1}
291 |       onClick={toggleSidebar}
292 |       title="Toggle Sidebar"
293 |       className={cn(
294 |         "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
295 |         "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
296 |         "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
297 |         "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
298 |         "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
299 |         "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
300 |         className
301 |       )}
302 |       {...props}
303 |     />
304 |   )
305 | }
306 | 
307 | function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
308 |   return (
309 |     <main
310 |       data-slot="sidebar-inset"
311 |       className={cn(
312 |         "bg-background relative flex w-full flex-1 flex-col",
313 |         "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
314 |         className
315 |       )}
316 |       {...props}
317 |     />
318 |   )
319 | }
320 | 
321 | function SidebarInput({
322 |   className,
323 |   ...props
324 | }: React.ComponentProps<typeof Input>) {
325 |   return (
326 |     <Input
327 |       data-slot="sidebar-input"
328 |       data-sidebar="input"
329 |       className={cn("bg-background h-8 w-full shadow-none", className)}
330 |       {...props}
331 |     />
332 |   )
333 | }
334 | 
335 | function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
336 |   return (
337 |     <div
338 |       data-slot="sidebar-header"
339 |       data-sidebar="header"
340 |       className={cn("flex flex-col gap-2 p-2", className)}
341 |       {...props}
342 |     />
343 |   )
344 | }
345 | 
346 | function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
347 |   return (
348 |     <div
349 |       data-slot="sidebar-footer"
350 |       data-sidebar="footer"
351 |       className={cn("flex flex-col gap-2 p-2", className)}
352 |       {...props}
353 |     />
354 |   )
355 | }
356 | 
357 | function SidebarSeparator({
358 |   className,
359 |   ...props
360 | }: React.ComponentProps<typeof Separator>) {
361 |   return (
362 |     <Separator
363 |       data-slot="sidebar-separator"
364 |       data-sidebar="separator"
365 |       className={cn("bg-sidebar-border mx-2 w-auto", className)}
366 |       {...props}
367 |     />
368 |   )
369 | }
370 | 
371 | function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
372 |   return (
373 |     <div
374 |       data-slot="sidebar-content"
375 |       data-sidebar="content"
376 |       className={cn(
377 |         "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
378 |         className
379 |       )}
380 |       {...props}
381 |     />
382 |   )
383 | }
384 | 
385 | function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
386 |   return (
387 |     <div
388 |       data-slot="sidebar-group"
389 |       data-sidebar="group"
390 |       className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
391 |       {...props}
392 |     />
393 |   )
394 | }
395 | 
396 | function SidebarGroupLabel({
397 |   className,
398 |   asChild = false,
399 |   ...props
400 | }: React.ComponentProps<"div"> & { asChild?: boolean }) {
401 |   const Comp = asChild ? Slot : "div"
402 | 
403 |   return (
404 |     <Comp
405 |       data-slot="sidebar-group-label"
406 |       data-sidebar="group-label"
407 |       className={cn(
408 |         "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
409 |         "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
410 |         className
411 |       )}
412 |       {...props}
413 |     />
414 |   )
415 | }
416 | 
417 | function SidebarGroupAction({
418 |   className,
419 |   asChild = false,
420 |   ...props
421 | }: React.ComponentProps<"button"> & { asChild?: boolean }) {
422 |   const Comp = asChild ? Slot : "button"
423 | 
424 |   return (
425 |     <Comp
426 |       data-slot="sidebar-group-action"
427 |       data-sidebar="group-action"
428 |       className={cn(
429 |         "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
430 |         // Increases the hit area of the button on mobile.
431 |         "after:absolute after:-inset-2 md:after:hidden",
432 |         "group-data-[collapsible=icon]:hidden",
433 |         className
434 |       )}
435 |       {...props}
436 |     />
437 |   )
438 | }
439 | 
440 | function SidebarGroupContent({
441 |   className,
442 |   ...props
443 | }: React.ComponentProps<"div">) {
444 |   return (
445 |     <div
446 |       data-slot="sidebar-group-content"
447 |       data-sidebar="group-content"
448 |       className={cn("w-full text-sm", className)}
449 |       {...props}
450 |     />
451 |   )
452 | }
453 | 
454 | function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
455 |   return (
456 |     <ul
457 |       data-slot="sidebar-menu"
458 |       data-sidebar="menu"
459 |       className={cn("flex w-full min-w-0 flex-col gap-1", className)}
460 |       {...props}
461 |     />
462 |   )
463 | }
464 | 
465 | function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
466 |   return (
467 |     <li
468 |       data-slot="sidebar-menu-item"
469 |       data-sidebar="menu-item"
470 |       className={cn("group/menu-item relative", className)}
471 |       {...props}
472 |     />
473 |   )
474 | }
475 | 
476 | const sidebarMenuButtonVariants = cva(
477 |   "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
478 |   {
479 |     variants: {
480 |       variant: {
481 |         default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
482 |         outline:
483 |           "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
484 |       },
485 |       size: {
486 |         default: "h-8 text-sm",
487 |         sm: "h-7 text-xs",
488 |         lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
489 |       },
490 |     },
491 |     defaultVariants: {
492 |       variant: "default",
493 |       size: "default",
494 |     },
495 |   }
496 | )
497 | 
498 | function SidebarMenuButton({
499 |   asChild = false,
500 |   isActive = false,
501 |   variant = "default",
502 |   size = "default",
503 |   tooltip,
504 |   className,
505 |   ...props
506 | }: React.ComponentProps<"button"> & {
507 |   asChild?: boolean
508 |   isActive?: boolean
509 |   tooltip?: string | React.ComponentProps<typeof TooltipContent>
510 | } & VariantProps<typeof sidebarMenuButtonVariants>) {
511 |   const Comp = asChild ? Slot : "button"
512 |   const { isMobile, state } = useSidebar()
513 | 
514 |   const button = (
515 |     <Comp
516 |       data-slot="sidebar-menu-button"
517 |       data-sidebar="menu-button"
518 |       data-size={size}
519 |       data-active={isActive}
520 |       className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
521 |       {...props}
522 |     />
523 |   )
524 | 
525 |   if (!tooltip) {
526 |     return button
527 |   }
528 | 
529 |   if (typeof tooltip === "string") {
530 |     tooltip = {
531 |       children: tooltip,
532 |     }
533 |   }
534 | 
535 |   return (
536 |     <Tooltip>
537 |       <TooltipTrigger asChild>{button}</TooltipTrigger>
538 |       <TooltipContent
539 |         side="right"
540 |         align="center"
541 |         hidden={state !== "collapsed" || isMobile}
542 |         {...tooltip}
543 |       />
544 |     </Tooltip>
545 |   )
546 | }
547 | 
548 | function SidebarMenuAction({
549 |   className,
550 |   asChild = false,
551 |   showOnHover = false,
552 |   ...props
553 | }: React.ComponentProps<"button"> & {
554 |   asChild?: boolean
555 |   showOnHover?: boolean
556 | }) {
557 |   const Comp = asChild ? Slot : "button"
558 | 
559 |   return (
560 |     <Comp
561 |       data-slot="sidebar-menu-action"
562 |       data-sidebar="menu-action"
563 |       className={cn(
564 |         "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
565 |         // Increases the hit area of the button on mobile.
566 |         "after:absolute after:-inset-2 md:after:hidden",
567 |         "peer-data-[size=sm]/menu-button:top-1",
568 |         "peer-data-[size=default]/menu-button:top-1.5",
569 |         "peer-data-[size=lg]/menu-button:top-2.5",
570 |         "group-data-[collapsible=icon]:hidden",
571 |         showOnHover &&
572 |           "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
573 |         className
574 |       )}
575 |       {...props}
576 |     />
577 |   )
578 | }
579 | 
580 | function SidebarMenuBadge({
581 |   className,
582 |   ...props
583 | }: React.ComponentProps<"div">) {
584 |   return (
585 |     <div
586 |       data-slot="sidebar-menu-badge"
587 |       data-sidebar="menu-badge"
588 |       className={cn(
589 |         "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
590 |         "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
591 |         "peer-data-[size=sm]/menu-button:top-1",
592 |         "peer-data-[size=default]/menu-button:top-1.5",
593 |         "peer-data-[size=lg]/menu-button:top-2.5",
594 |         "group-data-[collapsible=icon]:hidden",
595 |         className
596 |       )}
597 |       {...props}
598 |     />
599 |   )
600 | }
601 | 
602 | function SidebarMenuSkeleton({
603 |   className,
604 |   showIcon = false,
605 |   ...props
606 | }: React.ComponentProps<"div"> & {
607 |   showIcon?: boolean
608 | }) {
609 |   // Random width between 50 to 90%.
610 |   const width = React.useMemo(() => {
611 |     return `${Math.floor(Math.random() * 40) + 50}%`
612 |   }, [])
613 | 
614 |   return (
615 |     <div
616 |       data-slot="sidebar-menu-skeleton"
617 |       data-sidebar="menu-skeleton"
618 |       className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
619 |       {...props}
620 |     >
621 |       {showIcon && (
622 |         <Skeleton
623 |           className="size-4 rounded-md"
624 |           data-sidebar="menu-skeleton-icon"
625 |         />
626 |       )}
627 |       <Skeleton
628 |         className="h-4 max-w-(--skeleton-width) flex-1"
629 |         data-sidebar="menu-skeleton-text"
630 |         style={
631 |           {
632 |             "--skeleton-width": width,
633 |           } as React.CSSProperties
634 |         }
635 |       />
636 |     </div>
637 |   )
638 | }
639 | 
640 | function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
641 |   return (
642 |     <ul
643 |       data-slot="sidebar-menu-sub"
644 |       data-sidebar="menu-sub"
645 |       className={cn(
646 |         "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
647 |         "group-data-[collapsible=icon]:hidden",
648 |         className
649 |       )}
650 |       {...props}
651 |     />
652 |   )
653 | }
654 | 
655 | function SidebarMenuSubItem({
656 |   className,
657 |   ...props
658 | }: React.ComponentProps<"li">) {
659 |   return (
660 |     <li
661 |       data-slot="sidebar-menu-sub-item"
662 |       data-sidebar="menu-sub-item"
663 |       className={cn("group/menu-sub-item relative", className)}
664 |       {...props}
665 |     />
666 |   )
667 | }
668 | 
669 | function SidebarMenuSubButton({
670 |   asChild = false,
671 |   size = "md",
672 |   isActive = false,
673 |   className,
674 |   ...props
675 | }: React.ComponentProps<"a"> & {
676 |   asChild?: boolean
677 |   size?: "sm" | "md"
678 |   isActive?: boolean
679 | }) {
680 |   const Comp = asChild ? Slot : "a"
681 | 
682 |   return (
683 |     <Comp
684 |       data-slot="sidebar-menu-sub-button"
685 |       data-sidebar="menu-sub-button"
686 |       data-size={size}
687 |       data-active={isActive}
688 |       className={cn(
689 |         "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
690 |         "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
691 |         size === "sm" && "text-xs",
692 |         size === "md" && "text-sm",
693 |         "group-data-[collapsible=icon]:hidden",
694 |         className
695 |       )}
696 |       {...props}
697 |     />
698 |   )
699 | }
700 | 
701 | export {
702 |   Sidebar,
703 |   SidebarContent,
704 |   SidebarFooter,
705 |   SidebarGroup,
706 |   SidebarGroupAction,
707 |   SidebarGroupContent,
708 |   SidebarGroupLabel,
709 |   SidebarHeader,
710 |   SidebarInput,
711 |   SidebarInset,
712 |   SidebarMenu,
713 |   SidebarMenuAction,
714 |   SidebarMenuBadge,
715 |   SidebarMenuButton,
716 |   SidebarMenuItem,
717 |   SidebarMenuSkeleton,
718 |   SidebarMenuSub,
719 |   SidebarMenuSubButton,
720 |   SidebarMenuSubItem,
721 |   SidebarProvider,
722 |   SidebarRail,
723 |   SidebarSeparator,
724 |   SidebarTrigger,
725 |   useSidebar,
726 | }
```

components/ui/skeleton.tsx
```
1 | import { cn } from "@/lib/utils"
2 | 
3 | function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
4 |   return (
5 |     <div
6 |       data-slot="skeleton"
7 |       className={cn("bg-accent animate-pulse rounded-md", className)}
8 |       {...props}
9 |     />
10 |   )
11 | }
12 | 
13 | export { Skeleton }
```

components/ui/sonner.tsx
```
1 | "use client"
2 | 
3 | import { useTheme } from "next-themes"
4 | import { Toaster as Sonner, ToasterProps } from "sonner"
5 | 
6 | const Toaster = ({ ...props }: ToasterProps) => {
7 |   const { theme = "system" } = useTheme()
8 | 
9 |   return (
10 |     <Sonner
11 |       theme={theme as ToasterProps["theme"]}
12 |       className="toaster group"
13 |       style={
14 |         {
15 |           "--normal-bg": "var(--popover)",
16 |           "--normal-text": "var(--popover-foreground)",
17 |           "--normal-border": "var(--border)",
18 |         } as React.CSSProperties
19 |       }
20 |       {...props}
21 |     />
22 |   )
23 | }
24 | 
25 | export { Toaster }
```

components/ui/switch.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as SwitchPrimitive from "@radix-ui/react-switch"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Switch({
9 |   className,
10 |   ...props
11 | }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
12 |   return (
13 |     <SwitchPrimitive.Root
14 |       data-slot="switch"
15 |       className={cn(
16 |         "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
17 |         className
18 |       )}
19 |       {...props}
20 |     >
21 |       <SwitchPrimitive.Thumb
22 |         data-slot="switch-thumb"
23 |         className={cn(
24 |           "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
25 |         )}
26 |       />
27 |     </SwitchPrimitive.Root>
28 |   )
29 | }
30 | 
31 | export { Switch }
```

components/ui/text-morph.tsx
```
1 | 'use client';
2 | import { cn } from '@/lib/utils';
3 | import { AnimatePresence, motion, Transition, Variants } from 'motion/react';
4 | import { useMemo, useId } from 'react';
5 | 
6 | export type TextMorphProps = {
7 |   children: string;
8 |   as?: React.ElementType;
9 |   className?: string;
10 |   style?: React.CSSProperties;
11 |   variants?: Variants;
12 |   transition?: Transition;
13 | };
14 | 
15 | export function TextMorph({
16 |   children,
17 |   as: Component = 'p',
18 |   className,
19 |   style,
20 |   variants,
21 |   transition,
22 | }: TextMorphProps) {
23 |   const uniqueId = useId();
24 | 
25 |   const characters = useMemo(() => {
26 |     const charCounts: Record<string, number> = {};
27 | 
28 |     return children.split('').map((char) => {
29 |       const lowerChar = char.toLowerCase();
30 |       charCounts[lowerChar] = (charCounts[lowerChar] || 0) + 1;
31 | 
32 |       return {
33 |         id: `${uniqueId}-${lowerChar}${charCounts[lowerChar]}`,
34 |         label: char === ' ' ? '\u00A0' : char,
35 |       };
36 |     });
37 |   }, [children, uniqueId]);
38 | 
39 |   const defaultVariants: Variants = {
40 |     initial: { opacity: 0 },
41 |     animate: { opacity: 1 },
42 |     exit: { opacity: 0 },
43 |   };
44 | 
45 |   const defaultTransition: Transition = {
46 |     type: 'spring',
47 |     stiffness: 280,
48 |     damping: 18,
49 |     mass: 0.3,
50 |   };
51 | 
52 |   return (
53 |     <Component className={cn(className)} aria-label={children} style={style}>
54 |       <AnimatePresence mode='popLayout' initial={false}>
55 |         {characters.map((character) => (
56 |           <motion.span
57 |             key={character.id}
58 |             layoutId={character.id}
59 |             className='inline-block'
60 |             aria-hidden='true'
61 |             initial='initial'
62 |             animate='animate'
63 |             exit='exit'
64 |             variants={variants || defaultVariants}
65 |             transition={transition || defaultTransition}
66 |           >
67 |             {character.label}
68 |           </motion.span>
69 |         ))}
70 |       </AnimatePresence>
71 |     </Component>
72 |   );
73 | }
```

components/ui/textarea.tsx
```
1 | import * as React from "react"
2 | 
3 | import { cn } from "@/lib/utils"
4 | 
5 | function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
6 |   return (
7 |     <textarea
8 |       data-slot="textarea"
9 |       className={cn(
10 |         "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
11 |         className
12 |       )}
13 |       {...props}
14 |     />
15 |   )
16 | }
17 | 
18 | export { Textarea }
```

components/ui/tooltip.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as TooltipPrimitive from "@radix-ui/react-tooltip"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function TooltipProvider({
9 |   delayDuration = 0,
10 |   ...props
11 | }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
12 |   return (
13 |     <TooltipPrimitive.Provider
14 |       data-slot="tooltip-provider"
15 |       delayDuration={delayDuration}
16 |       {...props}
17 |     />
18 |   )
19 | }
20 | 
21 | function Tooltip({
22 |   ...props
23 | }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
24 |   return (
25 |     <TooltipProvider>
26 |       <TooltipPrimitive.Root data-slot="tooltip" {...props} />
27 |     </TooltipProvider>
28 |   )
29 | }
30 | 
31 | function TooltipTrigger({
32 |   ...props
33 | }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
34 |   return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
35 | }
36 | 
37 | function TooltipContent({
38 |   className,
39 |   sideOffset = 0,
40 |   children,
41 |   ...props
42 | }: React.ComponentProps<typeof TooltipPrimitive.Content>) {
43 |   return (
44 |     <TooltipPrimitive.Portal>
45 |       <TooltipPrimitive.Content
46 |         data-slot="tooltip-content"
47 |         sideOffset={sideOffset}
48 |         className={cn(
49 |           "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
50 |           className
51 |         )}
52 |         {...props}
53 |       >
54 |         {children}
55 |         <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
56 |       </TooltipPrimitive.Content>
57 |     </TooltipPrimitive.Portal>
58 |   )
59 | }
60 | 
61 | export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

drizzle/migrations/0003_add_web_search.sql
```
1 | -- Add web search columns to messages table
2 | ALTER TABLE messages
3 | ADD COLUMN has_web_search boolean DEFAULT false,
4 | ADD COLUMN web_search_context_size text DEFAULT 'medium';
5 | 
6 | -- Update existing messages to have default values
7 | UPDATE messages 
8 | SET has_web_search = false,
9 |     web_search_context_size = 'medium'
10 | WHERE has_web_search IS NULL; 
```

drizzle/meta/0001_snapshot.json
```
1 | {
2 |   "id": "c25dbd1f-846e-4ca4-b2f3-d24f70977d6f",
3 |   "prevId": "70cfd958-05b3-4673-81b2-be05beb0a237",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.chats": {
8 |       "name": "chats",
9 |       "schema": "",
10 |       "columns": {
11 |         "id": {
12 |           "name": "id",
13 |           "type": "text",
14 |           "primaryKey": true,
15 |           "notNull": true
16 |         },
17 |         "user_id": {
18 |           "name": "user_id",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": false
22 |         },
23 |         "title": {
24 |           "name": "title",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true,
28 |           "default": "'New Chat'"
29 |         },
30 |         "created_at": {
31 |           "name": "created_at",
32 |           "type": "timestamp",
33 |           "primaryKey": false,
34 |           "notNull": true,
35 |           "default": "now()"
36 |         },
37 |         "updated_at": {
38 |           "name": "updated_at",
39 |           "type": "timestamp",
40 |           "primaryKey": false,
41 |           "notNull": true,
42 |           "default": "now()"
43 |         }
44 |       },
45 |       "indexes": {},
46 |       "foreignKeys": {
47 |         "chats_user_id_users_id_fk": {
48 |           "name": "chats_user_id_users_id_fk",
49 |           "tableFrom": "chats",
50 |           "tableTo": "users",
51 |           "columnsFrom": [
52 |             "user_id"
53 |           ],
54 |           "columnsTo": [
55 |             "id"
56 |           ],
57 |           "onDelete": "cascade",
58 |           "onUpdate": "no action"
59 |         }
60 |       },
61 |       "compositePrimaryKeys": {},
62 |       "uniqueConstraints": {},
63 |       "policies": {},
64 |       "checkConstraints": {},
65 |       "isRLSEnabled": false
66 |     },
67 |     "public.messages": {
68 |       "name": "messages",
69 |       "schema": "",
70 |       "columns": {
71 |         "id": {
72 |           "name": "id",
73 |           "type": "text",
74 |           "primaryKey": true,
75 |           "notNull": true
76 |         },
77 |         "chat_id": {
78 |           "name": "chat_id",
79 |           "type": "text",
80 |           "primaryKey": false,
81 |           "notNull": true
82 |         },
83 |         "content": {
84 |           "name": "content",
85 |           "type": "text",
86 |           "primaryKey": false,
87 |           "notNull": true
88 |         },
89 |         "role": {
90 |           "name": "role",
91 |           "type": "text",
92 |           "primaryKey": false,
93 |           "notNull": true
94 |         },
95 |         "created_at": {
96 |           "name": "created_at",
97 |           "type": "timestamp",
98 |           "primaryKey": false,
99 |           "notNull": true,
100 |           "default": "now()"
101 |         }
102 |       },
103 |       "indexes": {},
104 |       "foreignKeys": {
105 |         "messages_chat_id_chats_id_fk": {
106 |           "name": "messages_chat_id_chats_id_fk",
107 |           "tableFrom": "messages",
108 |           "tableTo": "chats",
109 |           "columnsFrom": [
110 |             "chat_id"
111 |           ],
112 |           "columnsTo": [
113 |             "id"
114 |           ],
115 |           "onDelete": "cascade",
116 |           "onUpdate": "no action"
117 |         }
118 |       },
119 |       "compositePrimaryKeys": {},
120 |       "uniqueConstraints": {},
121 |       "policies": {},
122 |       "checkConstraints": {},
123 |       "isRLSEnabled": false
124 |     },
125 |     "public.users": {
126 |       "name": "users",
127 |       "schema": "",
128 |       "columns": {
129 |         "id": {
130 |           "name": "id",
131 |           "type": "text",
132 |           "primaryKey": true,
133 |           "notNull": true
134 |         },
135 |         "client_id": {
136 |           "name": "client_id",
137 |           "type": "text",
138 |           "primaryKey": false,
139 |           "notNull": true
140 |         },
141 |         "created_at": {
142 |           "name": "created_at",
143 |           "type": "timestamp",
144 |           "primaryKey": false,
145 |           "notNull": true,
146 |           "default": "now()"
147 |         },
148 |         "updated_at": {
149 |           "name": "updated_at",
150 |           "type": "timestamp",
151 |           "primaryKey": false,
152 |           "notNull": true,
153 |           "default": "now()"
154 |         }
155 |       },
156 |       "indexes": {},
157 |       "foreignKeys": {},
158 |       "compositePrimaryKeys": {},
159 |       "uniqueConstraints": {
160 |         "users_client_id_unique": {
161 |           "name": "users_client_id_unique",
162 |           "nullsNotDistinct": false,
163 |           "columns": [
164 |             "client_id"
165 |           ]
166 |         }
167 |       },
168 |       "policies": {},
169 |       "checkConstraints": {},
170 |       "isRLSEnabled": false
171 |     }
172 |   },
173 |   "enums": {},
174 |   "schemas": {},
175 |   "sequences": {},
176 |   "roles": {},
177 |   "policies": {},
178 |   "views": {},
179 |   "_meta": {
180 |     "columns": {},
181 |     "schemas": {},
182 |     "tables": {}
183 |   }
184 | }
```

drizzle/meta/0002_snapshot.json
```
1 | {
2 |   "id": "9ea87331-4108-40dd-8ac1-32fb1d2f1149",
3 |   "prevId": "c25dbd1f-846e-4ca4-b2f3-d24f70977d6f",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.chats": {
8 |       "name": "chats",
9 |       "schema": "",
10 |       "columns": {
11 |         "id": {
12 |           "name": "id",
13 |           "type": "text",
14 |           "primaryKey": true,
15 |           "notNull": true
16 |         },
17 |         "user_id": {
18 |           "name": "user_id",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "title": {
24 |           "name": "title",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true,
28 |           "default": "'New Chat'"
29 |         },
30 |         "created_at": {
31 |           "name": "created_at",
32 |           "type": "timestamp",
33 |           "primaryKey": false,
34 |           "notNull": true,
35 |           "default": "now()"
36 |         },
37 |         "updated_at": {
38 |           "name": "updated_at",
39 |           "type": "timestamp",
40 |           "primaryKey": false,
41 |           "notNull": true,
42 |           "default": "now()"
43 |         }
44 |       },
45 |       "indexes": {},
46 |       "foreignKeys": {},
47 |       "compositePrimaryKeys": {},
48 |       "uniqueConstraints": {},
49 |       "policies": {},
50 |       "checkConstraints": {},
51 |       "isRLSEnabled": false
52 |     },
53 |     "public.messages": {
54 |       "name": "messages",
55 |       "schema": "",
56 |       "columns": {
57 |         "id": {
58 |           "name": "id",
59 |           "type": "text",
60 |           "primaryKey": true,
61 |           "notNull": true
62 |         },
63 |         "chat_id": {
64 |           "name": "chat_id",
65 |           "type": "text",
66 |           "primaryKey": false,
67 |           "notNull": true
68 |         },
69 |         "content": {
70 |           "name": "content",
71 |           "type": "text",
72 |           "primaryKey": false,
73 |           "notNull": true
74 |         },
75 |         "role": {
76 |           "name": "role",
77 |           "type": "text",
78 |           "primaryKey": false,
79 |           "notNull": true
80 |         },
81 |         "created_at": {
82 |           "name": "created_at",
83 |           "type": "timestamp",
84 |           "primaryKey": false,
85 |           "notNull": true,
86 |           "default": "now()"
87 |         },
88 |         "reasoning": {
89 |           "name": "reasoning",
90 |           "type": "text",
91 |           "primaryKey": false,
92 |           "notNull": false
93 |         },
94 |         "tool_calls": {
95 |           "name": "tool_calls",
96 |           "type": "json",
97 |           "primaryKey": false,
98 |           "notNull": false
99 |         },
100 |         "tool_results": {
101 |           "name": "tool_results",
102 |           "type": "json",
103 |           "primaryKey": false,
104 |           "notNull": false
105 |         },
106 |         "has_tool_use": {
107 |           "name": "has_tool_use",
108 |           "type": "boolean",
109 |           "primaryKey": false,
110 |           "notNull": false,
111 |           "default": false
112 |         }
113 |       },
114 |       "indexes": {},
115 |       "foreignKeys": {
116 |         "messages_chat_id_chats_id_fk": {
117 |           "name": "messages_chat_id_chats_id_fk",
118 |           "tableFrom": "messages",
119 |           "tableTo": "chats",
120 |           "columnsFrom": [
121 |             "chat_id"
122 |           ],
123 |           "columnsTo": [
124 |             "id"
125 |           ],
126 |           "onDelete": "cascade",
127 |           "onUpdate": "no action"
128 |         }
129 |       },
130 |       "compositePrimaryKeys": {},
131 |       "uniqueConstraints": {},
132 |       "policies": {},
133 |       "checkConstraints": {},
134 |       "isRLSEnabled": false
135 |     },
136 |     "public.steps": {
137 |       "name": "steps",
138 |       "schema": "",
139 |       "columns": {
140 |         "id": {
141 |           "name": "id",
142 |           "type": "text",
143 |           "primaryKey": true,
144 |           "notNull": true
145 |         },
146 |         "message_id": {
147 |           "name": "message_id",
148 |           "type": "text",
149 |           "primaryKey": false,
150 |           "notNull": true
151 |         },
152 |         "step_type": {
153 |           "name": "step_type",
154 |           "type": "text",
155 |           "primaryKey": false,
156 |           "notNull": true
157 |         },
158 |         "text": {
159 |           "name": "text",
160 |           "type": "text",
161 |           "primaryKey": false,
162 |           "notNull": false
163 |         },
164 |         "reasoning": {
165 |           "name": "reasoning",
166 |           "type": "text",
167 |           "primaryKey": false,
168 |           "notNull": false
169 |         },
170 |         "finish_reason": {
171 |           "name": "finish_reason",
172 |           "type": "text",
173 |           "primaryKey": false,
174 |           "notNull": false
175 |         },
176 |         "created_at": {
177 |           "name": "created_at",
178 |           "type": "timestamp",
179 |           "primaryKey": false,
180 |           "notNull": true,
181 |           "default": "now()"
182 |         },
183 |         "tool_calls": {
184 |           "name": "tool_calls",
185 |           "type": "json",
186 |           "primaryKey": false,
187 |           "notNull": false
188 |         },
189 |         "tool_results": {
190 |           "name": "tool_results",
191 |           "type": "json",
192 |           "primaryKey": false,
193 |           "notNull": false
194 |         }
195 |       },
196 |       "indexes": {},
197 |       "foreignKeys": {
198 |         "steps_message_id_messages_id_fk": {
199 |           "name": "steps_message_id_messages_id_fk",
200 |           "tableFrom": "steps",
201 |           "tableTo": "messages",
202 |           "columnsFrom": [
203 |             "message_id"
204 |           ],
205 |           "columnsTo": [
206 |             "id"
207 |           ],
208 |           "onDelete": "cascade",
209 |           "onUpdate": "no action"
210 |         }
211 |       },
212 |       "compositePrimaryKeys": {},
213 |       "uniqueConstraints": {},
214 |       "policies": {},
215 |       "checkConstraints": {},
216 |       "isRLSEnabled": false
217 |     }
218 |   },
219 |   "enums": {},
220 |   "schemas": {},
221 |   "sequences": {},
222 |   "roles": {},
223 |   "policies": {},
224 |   "views": {},
225 |   "_meta": {
226 |     "columns": {},
227 |     "schemas": {},
228 |     "tables": {}
229 |   }
230 | }
```

drizzle/meta/0003_snapshot.json
```
1 | {
2 |   "id": "4d2bf069-17f7-4848-a16e-ce008e47d268",
3 |   "prevId": "9ea87331-4108-40dd-8ac1-32fb1d2f1149",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.chats": {
8 |       "name": "chats",
9 |       "schema": "",
10 |       "columns": {
11 |         "id": {
12 |           "name": "id",
13 |           "type": "text",
14 |           "primaryKey": true,
15 |           "notNull": true
16 |         },
17 |         "user_id": {
18 |           "name": "user_id",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "title": {
24 |           "name": "title",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true,
28 |           "default": "'New Chat'"
29 |         },
30 |         "created_at": {
31 |           "name": "created_at",
32 |           "type": "timestamp",
33 |           "primaryKey": false,
34 |           "notNull": true,
35 |           "default": "now()"
36 |         },
37 |         "updated_at": {
38 |           "name": "updated_at",
39 |           "type": "timestamp",
40 |           "primaryKey": false,
41 |           "notNull": true,
42 |           "default": "now()"
43 |         }
44 |       },
45 |       "indexes": {},
46 |       "foreignKeys": {},
47 |       "compositePrimaryKeys": {},
48 |       "uniqueConstraints": {},
49 |       "policies": {},
50 |       "checkConstraints": {},
51 |       "isRLSEnabled": false
52 |     },
53 |     "public.messages": {
54 |       "name": "messages",
55 |       "schema": "",
56 |       "columns": {
57 |         "id": {
58 |           "name": "id",
59 |           "type": "text",
60 |           "primaryKey": true,
61 |           "notNull": true
62 |         },
63 |         "chat_id": {
64 |           "name": "chat_id",
65 |           "type": "text",
66 |           "primaryKey": false,
67 |           "notNull": true
68 |         },
69 |         "content": {
70 |           "name": "content",
71 |           "type": "text",
72 |           "primaryKey": false,
73 |           "notNull": true
74 |         },
75 |         "role": {
76 |           "name": "role",
77 |           "type": "text",
78 |           "primaryKey": false,
79 |           "notNull": true
80 |         },
81 |         "created_at": {
82 |           "name": "created_at",
83 |           "type": "timestamp",
84 |           "primaryKey": false,
85 |           "notNull": true,
86 |           "default": "now()"
87 |         },
88 |         "reasoning": {
89 |           "name": "reasoning",
90 |           "type": "text",
91 |           "primaryKey": false,
92 |           "notNull": false
93 |         },
94 |         "tool_calls": {
95 |           "name": "tool_calls",
96 |           "type": "jsonb",
97 |           "primaryKey": false,
98 |           "notNull": false
99 |         },
100 |         "tool_results": {
101 |           "name": "tool_results",
102 |           "type": "jsonb",
103 |           "primaryKey": false,
104 |           "notNull": false
105 |         },
106 |         "step_type": {
107 |           "name": "step_type",
108 |           "type": "text",
109 |           "primaryKey": false,
110 |           "notNull": false
111 |         },
112 |         "finish_reason": {
113 |           "name": "finish_reason",
114 |           "type": "text",
115 |           "primaryKey": false,
116 |           "notNull": false
117 |         }
118 |       },
119 |       "indexes": {},
120 |       "foreignKeys": {
121 |         "messages_chat_id_chats_id_fk": {
122 |           "name": "messages_chat_id_chats_id_fk",
123 |           "tableFrom": "messages",
124 |           "tableTo": "chats",
125 |           "columnsFrom": [
126 |             "chat_id"
127 |           ],
128 |           "columnsTo": [
129 |             "id"
130 |           ],
131 |           "onDelete": "cascade",
132 |           "onUpdate": "no action"
133 |         }
134 |       },
135 |       "compositePrimaryKeys": {},
136 |       "uniqueConstraints": {},
137 |       "policies": {},
138 |       "checkConstraints": {},
139 |       "isRLSEnabled": false
140 |     }
141 |   },
142 |   "enums": {},
143 |   "schemas": {},
144 |   "sequences": {},
145 |   "roles": {},
146 |   "policies": {},
147 |   "views": {},
148 |   "_meta": {
149 |     "columns": {},
150 |     "schemas": {},
151 |     "tables": {}
152 |   }
153 | }
```

drizzle/meta/0004_snapshot.json
```
1 | {
2 |   "id": "6369cdc2-8254-4270-a54d-6765b2b04c1a",
3 |   "prevId": "4d2bf069-17f7-4848-a16e-ce008e47d268",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.chats": {
8 |       "name": "chats",
9 |       "schema": "",
10 |       "columns": {
11 |         "id": {
12 |           "name": "id",
13 |           "type": "text",
14 |           "primaryKey": true,
15 |           "notNull": true
16 |         },
17 |         "user_id": {
18 |           "name": "user_id",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "title": {
24 |           "name": "title",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true,
28 |           "default": "'New Chat'"
29 |         },
30 |         "created_at": {
31 |           "name": "created_at",
32 |           "type": "timestamp",
33 |           "primaryKey": false,
34 |           "notNull": true,
35 |           "default": "now()"
36 |         },
37 |         "updated_at": {
38 |           "name": "updated_at",
39 |           "type": "timestamp",
40 |           "primaryKey": false,
41 |           "notNull": true,
42 |           "default": "now()"
43 |         }
44 |       },
45 |       "indexes": {},
46 |       "foreignKeys": {},
47 |       "compositePrimaryKeys": {},
48 |       "uniqueConstraints": {},
49 |       "policies": {},
50 |       "checkConstraints": {},
51 |       "isRLSEnabled": false
52 |     },
53 |     "public.messages": {
54 |       "name": "messages",
55 |       "schema": "",
56 |       "columns": {
57 |         "id": {
58 |           "name": "id",
59 |           "type": "text",
60 |           "primaryKey": true,
61 |           "notNull": true
62 |         },
63 |         "chat_id": {
64 |           "name": "chat_id",
65 |           "type": "text",
66 |           "primaryKey": false,
67 |           "notNull": true
68 |         },
69 |         "content": {
70 |           "name": "content",
71 |           "type": "text",
72 |           "primaryKey": false,
73 |           "notNull": true
74 |         },
75 |         "role": {
76 |           "name": "role",
77 |           "type": "text",
78 |           "primaryKey": false,
79 |           "notNull": true
80 |         },
81 |         "created_at": {
82 |           "name": "created_at",
83 |           "type": "timestamp",
84 |           "primaryKey": false,
85 |           "notNull": true,
86 |           "default": "now()"
87 |         }
88 |       },
89 |       "indexes": {},
90 |       "foreignKeys": {
91 |         "messages_chat_id_chats_id_fk": {
92 |           "name": "messages_chat_id_chats_id_fk",
93 |           "tableFrom": "messages",
94 |           "tableTo": "chats",
95 |           "columnsFrom": [
96 |             "chat_id"
97 |           ],
98 |           "columnsTo": [
99 |             "id"
100 |           ],
101 |           "onDelete": "cascade",
102 |           "onUpdate": "no action"
103 |         }
104 |       },
105 |       "compositePrimaryKeys": {},
106 |       "uniqueConstraints": {},
107 |       "policies": {},
108 |       "checkConstraints": {},
109 |       "isRLSEnabled": false
110 |     }
111 |   },
112 |   "enums": {},
113 |   "schemas": {},
114 |   "sequences": {},
115 |   "roles": {},
116 |   "policies": {},
117 |   "views": {},
118 |   "_meta": {
119 |     "columns": {},
120 |     "schemas": {},
121 |     "tables": {}
122 |   }
123 | }
```

drizzle/meta/0005_snapshot.json
```
1 | {
2 |   "id": "938dd39c-9206-4289-a8ce-f2a81656b4fe",
3 |   "prevId": "6369cdc2-8254-4270-a54d-6765b2b04c1a",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.chats": {
8 |       "name": "chats",
9 |       "schema": "",
10 |       "columns": {
11 |         "id": {
12 |           "name": "id",
13 |           "type": "text",
14 |           "primaryKey": true,
15 |           "notNull": true
16 |         },
17 |         "user_id": {
18 |           "name": "user_id",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "title": {
24 |           "name": "title",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true,
28 |           "default": "'New Chat'"
29 |         },
30 |         "created_at": {
31 |           "name": "created_at",
32 |           "type": "timestamp",
33 |           "primaryKey": false,
34 |           "notNull": true,
35 |           "default": "now()"
36 |         },
37 |         "updated_at": {
38 |           "name": "updated_at",
39 |           "type": "timestamp",
40 |           "primaryKey": false,
41 |           "notNull": true,
42 |           "default": "now()"
43 |         }
44 |       },
45 |       "indexes": {},
46 |       "foreignKeys": {},
47 |       "compositePrimaryKeys": {},
48 |       "uniqueConstraints": {},
49 |       "policies": {},
50 |       "checkConstraints": {},
51 |       "isRLSEnabled": false
52 |     },
53 |     "public.messages": {
54 |       "name": "messages",
55 |       "schema": "",
56 |       "columns": {
57 |         "id": {
58 |           "name": "id",
59 |           "type": "text",
60 |           "primaryKey": true,
61 |           "notNull": true
62 |         },
63 |         "chat_id": {
64 |           "name": "chat_id",
65 |           "type": "text",
66 |           "primaryKey": false,
67 |           "notNull": true
68 |         },
69 |         "parts": {
70 |           "name": "parts",
71 |           "type": "json",
72 |           "primaryKey": false,
73 |           "notNull": true
74 |         },
75 |         "role": {
76 |           "name": "role",
77 |           "type": "text",
78 |           "primaryKey": false,
79 |           "notNull": true
80 |         },
81 |         "created_at": {
82 |           "name": "created_at",
83 |           "type": "timestamp",
84 |           "primaryKey": false,
85 |           "notNull": true,
86 |           "default": "now()"
87 |         }
88 |       },
89 |       "indexes": {},
90 |       "foreignKeys": {
91 |         "messages_chat_id_chats_id_fk": {
92 |           "name": "messages_chat_id_chats_id_fk",
93 |           "tableFrom": "messages",
94 |           "tableTo": "chats",
95 |           "columnsFrom": [
96 |             "chat_id"
97 |           ],
98 |           "columnsTo": [
99 |             "id"
100 |           ],
101 |           "onDelete": "cascade",
102 |           "onUpdate": "no action"
103 |         }
104 |       },
105 |       "compositePrimaryKeys": {},
106 |       "uniqueConstraints": {},
107 |       "policies": {},
108 |       "checkConstraints": {},
109 |       "isRLSEnabled": false
110 |     }
111 |   },
112 |   "enums": {},
113 |   "schemas": {},
114 |   "sequences": {},
115 |   "roles": {},
116 |   "policies": {},
117 |   "views": {},
118 |   "_meta": {
119 |     "columns": {},
120 |     "schemas": {},
121 |     "tables": {}
122 |   }
123 | }
```

drizzle/meta/0007_snapshot.json
```
1 | {
2 |   "id": "9087da5d-3025-460b-97e6-0b0ad3fd23ea",
3 |   "prevId": "4de2adbb-fa3b-460b-869b-a98b906c9f77",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.account": {
8 |       "name": "account",
9 |       "schema": "",
10 |       "columns": {
11 |         "userId": {
12 |           "name": "userId",
13 |           "type": "text",
14 |           "primaryKey": false,
15 |           "notNull": true
16 |         },
17 |         "providerId": {
18 |           "name": "providerId",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "accountId": {
24 |           "name": "accountId",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true
28 |         },
29 |         "providerType": {
30 |           "name": "providerType",
31 |           "type": "text",
32 |           "primaryKey": false,
33 |           "notNull": true
34 |         },
35 |         "access_token": {
36 |           "name": "access_token",
37 |           "type": "text",
38 |           "primaryKey": false,
39 |           "notNull": false
40 |         },
41 |         "refresh_token": {
42 |           "name": "refresh_token",
43 |           "type": "text",
44 |           "primaryKey": false,
45 |           "notNull": false
46 |         },
47 |         "expires_at": {
48 |           "name": "expires_at",
49 |           "type": "integer",
50 |           "primaryKey": false,
51 |           "notNull": false
52 |         },
53 |         "token_type": {
54 |           "name": "token_type",
55 |           "type": "text",
56 |           "primaryKey": false,
57 |           "notNull": false
58 |         },
59 |         "scope": {
60 |           "name": "scope",
61 |           "type": "text",
62 |           "primaryKey": false,
63 |           "notNull": false
64 |         },
65 |         "id_token": {
66 |           "name": "id_token",
67 |           "type": "text",
68 |           "primaryKey": false,
69 |           "notNull": false
70 |         },
71 |         "session_state": {
72 |           "name": "session_state",
73 |           "type": "text",
74 |           "primaryKey": false,
75 |           "notNull": false
76 |         },
77 |         "createdAt": {
78 |           "name": "createdAt",
79 |           "type": "timestamp",
80 |           "primaryKey": false,
81 |           "notNull": true,
82 |           "default": "now()"
83 |         },
84 |         "updatedAt": {
85 |           "name": "updatedAt",
86 |           "type": "timestamp",
87 |           "primaryKey": false,
88 |           "notNull": true,
89 |           "default": "now()"
90 |         }
91 |       },
92 |       "indexes": {},
93 |       "foreignKeys": {
94 |         "account_userId_user_id_fk": {
95 |           "name": "account_userId_user_id_fk",
96 |           "tableFrom": "account",
97 |           "tableTo": "user",
98 |           "columnsFrom": [
99 |             "userId"
100 |           ],
101 |           "columnsTo": [
102 |             "id"
103 |           ],
104 |           "onDelete": "cascade",
105 |           "onUpdate": "no action"
106 |         }
107 |       },
108 |       "compositePrimaryKeys": {
109 |         "account_providerId_accountId_pk": {
110 |           "name": "account_providerId_accountId_pk",
111 |           "columns": [
112 |             "providerId",
113 |             "accountId"
114 |           ]
115 |         }
116 |       },
117 |       "uniqueConstraints": {},
118 |       "policies": {},
119 |       "checkConstraints": {},
120 |       "isRLSEnabled": false
121 |     },
122 |     "public.chats": {
123 |       "name": "chats",
124 |       "schema": "",
125 |       "columns": {
126 |         "id": {
127 |           "name": "id",
128 |           "type": "text",
129 |           "primaryKey": true,
130 |           "notNull": true
131 |         },
132 |         "user_id": {
133 |           "name": "user_id",
134 |           "type": "text",
135 |           "primaryKey": false,
136 |           "notNull": true
137 |         },
138 |         "title": {
139 |           "name": "title",
140 |           "type": "text",
141 |           "primaryKey": false,
142 |           "notNull": true,
143 |           "default": "'New Chat'"
144 |         },
145 |         "created_at": {
146 |           "name": "created_at",
147 |           "type": "timestamp",
148 |           "primaryKey": false,
149 |           "notNull": true,
150 |           "default": "now()"
151 |         },
152 |         "updated_at": {
153 |           "name": "updated_at",
154 |           "type": "timestamp",
155 |           "primaryKey": false,
156 |           "notNull": true,
157 |           "default": "now()"
158 |         }
159 |       },
160 |       "indexes": {},
161 |       "foreignKeys": {},
162 |       "compositePrimaryKeys": {},
163 |       "uniqueConstraints": {},
164 |       "policies": {},
165 |       "checkConstraints": {},
166 |       "isRLSEnabled": false
167 |     },
168 |     "public.messages": {
169 |       "name": "messages",
170 |       "schema": "",
171 |       "columns": {
172 |         "id": {
173 |           "name": "id",
174 |           "type": "text",
175 |           "primaryKey": true,
176 |           "notNull": true
177 |         },
178 |         "chat_id": {
179 |           "name": "chat_id",
180 |           "type": "text",
181 |           "primaryKey": false,
182 |           "notNull": true
183 |         },
184 |         "role": {
185 |           "name": "role",
186 |           "type": "text",
187 |           "primaryKey": false,
188 |           "notNull": true
189 |         },
190 |         "parts": {
191 |           "name": "parts",
192 |           "type": "json",
193 |           "primaryKey": false,
194 |           "notNull": true
195 |         },
196 |         "created_at": {
197 |           "name": "created_at",
198 |           "type": "timestamp",
199 |           "primaryKey": false,
200 |           "notNull": true,
201 |           "default": "now()"
202 |         }
203 |       },
204 |       "indexes": {},
205 |       "foreignKeys": {
206 |         "messages_chat_id_chats_id_fk": {
207 |           "name": "messages_chat_id_chats_id_fk",
208 |           "tableFrom": "messages",
209 |           "tableTo": "chats",
210 |           "columnsFrom": [
211 |             "chat_id"
212 |           ],
213 |           "columnsTo": [
214 |             "id"
215 |           ],
216 |           "onDelete": "cascade",
217 |           "onUpdate": "no action"
218 |         }
219 |       },
220 |       "compositePrimaryKeys": {},
221 |       "uniqueConstraints": {},
222 |       "policies": {},
223 |       "checkConstraints": {},
224 |       "isRLSEnabled": false
225 |     },
226 |     "public.session": {
227 |       "name": "session",
228 |       "schema": "",
229 |       "columns": {
230 |         "id": {
231 |           "name": "id",
232 |           "type": "text",
233 |           "primaryKey": true,
234 |           "notNull": true
235 |         },
236 |         "sessionToken": {
237 |           "name": "sessionToken",
238 |           "type": "text",
239 |           "primaryKey": false,
240 |           "notNull": true
241 |         },
242 |         "userId": {
243 |           "name": "userId",
244 |           "type": "text",
245 |           "primaryKey": false,
246 |           "notNull": true
247 |         },
248 |         "expires": {
249 |           "name": "expires",
250 |           "type": "timestamp",
251 |           "primaryKey": false,
252 |           "notNull": true
253 |         },
254 |         "ipAddress": {
255 |           "name": "ipAddress",
256 |           "type": "text",
257 |           "primaryKey": false,
258 |           "notNull": false
259 |         },
260 |         "userAgent": {
261 |           "name": "userAgent",
262 |           "type": "text",
263 |           "primaryKey": false,
264 |           "notNull": false
265 |         },
266 |         "createdAt": {
267 |           "name": "createdAt",
268 |           "type": "timestamp",
269 |           "primaryKey": false,
270 |           "notNull": true,
271 |           "default": "now()"
272 |         },
273 |         "updatedAt": {
274 |           "name": "updatedAt",
275 |           "type": "timestamp",
276 |           "primaryKey": false,
277 |           "notNull": true,
278 |           "default": "now()"
279 |         }
280 |       },
281 |       "indexes": {},
282 |       "foreignKeys": {
283 |         "session_userId_user_id_fk": {
284 |           "name": "session_userId_user_id_fk",
285 |           "tableFrom": "session",
286 |           "tableTo": "user",
287 |           "columnsFrom": [
288 |             "userId"
289 |           ],
290 |           "columnsTo": [
291 |             "id"
292 |           ],
293 |           "onDelete": "cascade",
294 |           "onUpdate": "no action"
295 |         }
296 |       },
297 |       "compositePrimaryKeys": {},
298 |       "uniqueConstraints": {
299 |         "session_sessionToken_unique": {
300 |           "name": "session_sessionToken_unique",
301 |           "nullsNotDistinct": false,
302 |           "columns": [
303 |             "sessionToken"
304 |           ]
305 |         }
306 |       },
307 |       "policies": {},
308 |       "checkConstraints": {},
309 |       "isRLSEnabled": false
310 |     },
311 |     "public.user": {
312 |       "name": "user",
313 |       "schema": "",
314 |       "columns": {
315 |         "id": {
316 |           "name": "id",
317 |           "type": "text",
318 |           "primaryKey": true,
319 |           "notNull": true
320 |         },
321 |         "name": {
322 |           "name": "name",
323 |           "type": "text",
324 |           "primaryKey": false,
325 |           "notNull": false
326 |         },
327 |         "email": {
328 |           "name": "email",
329 |           "type": "text",
330 |           "primaryKey": false,
331 |           "notNull": true
332 |         },
333 |         "emailVerified": {
334 |           "name": "emailVerified",
335 |           "type": "timestamp",
336 |           "primaryKey": false,
337 |           "notNull": false
338 |         },
339 |         "image": {
340 |           "name": "image",
341 |           "type": "text",
342 |           "primaryKey": false,
343 |           "notNull": false
344 |         },
345 |         "createdAt": {
346 |           "name": "createdAt",
347 |           "type": "timestamp",
348 |           "primaryKey": false,
349 |           "notNull": true,
350 |           "default": "now()"
351 |         },
352 |         "updatedAt": {
353 |           "name": "updatedAt",
354 |           "type": "timestamp",
355 |           "primaryKey": false,
356 |           "notNull": true,
357 |           "default": "now()"
358 |         }
359 |       },
360 |       "indexes": {},
361 |       "foreignKeys": {},
362 |       "compositePrimaryKeys": {},
363 |       "uniqueConstraints": {
364 |         "user_email_unique": {
365 |           "name": "user_email_unique",
366 |           "nullsNotDistinct": false,
367 |           "columns": [
368 |             "email"
369 |           ]
370 |         }
371 |       },
372 |       "policies": {},
373 |       "checkConstraints": {},
374 |       "isRLSEnabled": false
375 |     },
376 |     "public.verification": {
377 |       "name": "verification",
378 |       "schema": "",
379 |       "columns": {
380 |         "id": {
381 |           "name": "id",
382 |           "type": "text",
383 |           "primaryKey": true,
384 |           "notNull": true
385 |         },
386 |         "identifier": {
387 |           "name": "identifier",
388 |           "type": "text",
389 |           "primaryKey": false,
390 |           "notNull": true
391 |         },
392 |         "value": {
393 |           "name": "value",
394 |           "type": "text",
395 |           "primaryKey": false,
396 |           "notNull": true
397 |         },
398 |         "expiresAt": {
399 |           "name": "expiresAt",
400 |           "type": "timestamp",
401 |           "primaryKey": false,
402 |           "notNull": true
403 |         },
404 |         "createdAt": {
405 |           "name": "createdAt",
406 |           "type": "timestamp",
407 |           "primaryKey": false,
408 |           "notNull": true,
409 |           "default": "now()"
410 |         },
411 |         "updatedAt": {
412 |           "name": "updatedAt",
413 |           "type": "timestamp",
414 |           "primaryKey": false,
415 |           "notNull": true,
416 |           "default": "now()"
417 |         }
418 |       },
419 |       "indexes": {},
420 |       "foreignKeys": {},
421 |       "compositePrimaryKeys": {},
422 |       "uniqueConstraints": {},
423 |       "policies": {},
424 |       "checkConstraints": {},
425 |       "isRLSEnabled": false
426 |     }
427 |   },
428 |   "enums": {},
429 |   "schemas": {},
430 |   "sequences": {},
431 |   "roles": {},
432 |   "policies": {},
433 |   "views": {},
434 |   "_meta": {
435 |     "columns": {},
436 |     "schemas": {},
437 |     "tables": {}
438 |   }
439 | }
```

drizzle/meta/0008_snapshot.json
```
1 | {
2 |   "id": "f788fcaf-9e85-4b3d-af1f-2fd486b7755a",
3 |   "prevId": "9087da5d-3025-460b-97e6-0b0ad3fd23ea",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.account": {
8 |       "name": "account",
9 |       "schema": "",
10 |       "columns": {
11 |         "userId": {
12 |           "name": "userId",
13 |           "type": "text",
14 |           "primaryKey": false,
15 |           "notNull": true
16 |         },
17 |         "providerId": {
18 |           "name": "providerId",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "accountId": {
24 |           "name": "accountId",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true
28 |         },
29 |         "providerType": {
30 |           "name": "providerType",
31 |           "type": "text",
32 |           "primaryKey": false,
33 |           "notNull": true
34 |         },
35 |         "access_token": {
36 |           "name": "access_token",
37 |           "type": "text",
38 |           "primaryKey": false,
39 |           "notNull": false
40 |         },
41 |         "refresh_token": {
42 |           "name": "refresh_token",
43 |           "type": "text",
44 |           "primaryKey": false,
45 |           "notNull": false
46 |         },
47 |         "expires_at": {
48 |           "name": "expires_at",
49 |           "type": "timestamp",
50 |           "primaryKey": false,
51 |           "notNull": false
52 |         },
53 |         "token_type": {
54 |           "name": "token_type",
55 |           "type": "text",
56 |           "primaryKey": false,
57 |           "notNull": false
58 |         },
59 |         "scope": {
60 |           "name": "scope",
61 |           "type": "text",
62 |           "primaryKey": false,
63 |           "notNull": false
64 |         },
65 |         "id_token": {
66 |           "name": "id_token",
67 |           "type": "text",
68 |           "primaryKey": false,
69 |           "notNull": false
70 |         },
71 |         "session_state": {
72 |           "name": "session_state",
73 |           "type": "text",
74 |           "primaryKey": false,
75 |           "notNull": false
76 |         },
77 |         "createdAt": {
78 |           "name": "createdAt",
79 |           "type": "timestamp",
80 |           "primaryKey": false,
81 |           "notNull": true,
82 |           "default": "now()"
83 |         },
84 |         "updatedAt": {
85 |           "name": "updatedAt",
86 |           "type": "timestamp",
87 |           "primaryKey": false,
88 |           "notNull": true,
89 |           "default": "now()"
90 |         }
91 |       },
92 |       "indexes": {},
93 |       "foreignKeys": {
94 |         "account_userId_user_id_fk": {
95 |           "name": "account_userId_user_id_fk",
96 |           "tableFrom": "account",
97 |           "tableTo": "user",
98 |           "columnsFrom": [
99 |             "userId"
100 |           ],
101 |           "columnsTo": [
102 |             "id"
103 |           ],
104 |           "onDelete": "cascade",
105 |           "onUpdate": "no action"
106 |         }
107 |       },
108 |       "compositePrimaryKeys": {
109 |         "account_providerId_accountId_pk": {
110 |           "name": "account_providerId_accountId_pk",
111 |           "columns": [
112 |             "providerId",
113 |             "accountId"
114 |           ]
115 |         }
116 |       },
117 |       "uniqueConstraints": {},
118 |       "policies": {},
119 |       "checkConstraints": {},
120 |       "isRLSEnabled": false
121 |     },
122 |     "public.chats": {
123 |       "name": "chats",
124 |       "schema": "",
125 |       "columns": {
126 |         "id": {
127 |           "name": "id",
128 |           "type": "text",
129 |           "primaryKey": true,
130 |           "notNull": true
131 |         },
132 |         "user_id": {
133 |           "name": "user_id",
134 |           "type": "text",
135 |           "primaryKey": false,
136 |           "notNull": true
137 |         },
138 |         "title": {
139 |           "name": "title",
140 |           "type": "text",
141 |           "primaryKey": false,
142 |           "notNull": true,
143 |           "default": "'New Chat'"
144 |         },
145 |         "created_at": {
146 |           "name": "created_at",
147 |           "type": "timestamp",
148 |           "primaryKey": false,
149 |           "notNull": true,
150 |           "default": "now()"
151 |         },
152 |         "updated_at": {
153 |           "name": "updated_at",
154 |           "type": "timestamp",
155 |           "primaryKey": false,
156 |           "notNull": true,
157 |           "default": "now()"
158 |         }
159 |       },
160 |       "indexes": {},
161 |       "foreignKeys": {},
162 |       "compositePrimaryKeys": {},
163 |       "uniqueConstraints": {},
164 |       "policies": {},
165 |       "checkConstraints": {},
166 |       "isRLSEnabled": false
167 |     },
168 |     "public.messages": {
169 |       "name": "messages",
170 |       "schema": "",
171 |       "columns": {
172 |         "id": {
173 |           "name": "id",
174 |           "type": "text",
175 |           "primaryKey": true,
176 |           "notNull": true
177 |         },
178 |         "chat_id": {
179 |           "name": "chat_id",
180 |           "type": "text",
181 |           "primaryKey": false,
182 |           "notNull": true
183 |         },
184 |         "role": {
185 |           "name": "role",
186 |           "type": "text",
187 |           "primaryKey": false,
188 |           "notNull": true
189 |         },
190 |         "parts": {
191 |           "name": "parts",
192 |           "type": "json",
193 |           "primaryKey": false,
194 |           "notNull": true
195 |         },
196 |         "created_at": {
197 |           "name": "created_at",
198 |           "type": "timestamp",
199 |           "primaryKey": false,
200 |           "notNull": true,
201 |           "default": "now()"
202 |         }
203 |       },
204 |       "indexes": {},
205 |       "foreignKeys": {
206 |         "messages_chat_id_chats_id_fk": {
207 |           "name": "messages_chat_id_chats_id_fk",
208 |           "tableFrom": "messages",
209 |           "tableTo": "chats",
210 |           "columnsFrom": [
211 |             "chat_id"
212 |           ],
213 |           "columnsTo": [
214 |             "id"
215 |           ],
216 |           "onDelete": "cascade",
217 |           "onUpdate": "no action"
218 |         }
219 |       },
220 |       "compositePrimaryKeys": {},
221 |       "uniqueConstraints": {},
222 |       "policies": {},
223 |       "checkConstraints": {},
224 |       "isRLSEnabled": false
225 |     },
226 |     "public.session": {
227 |       "name": "session",
228 |       "schema": "",
229 |       "columns": {
230 |         "id": {
231 |           "name": "id",
232 |           "type": "text",
233 |           "primaryKey": true,
234 |           "notNull": true
235 |         },
236 |         "sessionToken": {
237 |           "name": "sessionToken",
238 |           "type": "text",
239 |           "primaryKey": false,
240 |           "notNull": true
241 |         },
242 |         "userId": {
243 |           "name": "userId",
244 |           "type": "text",
245 |           "primaryKey": false,
246 |           "notNull": true
247 |         },
248 |         "expires": {
249 |           "name": "expires",
250 |           "type": "timestamp",
251 |           "primaryKey": false,
252 |           "notNull": true
253 |         },
254 |         "ipAddress": {
255 |           "name": "ipAddress",
256 |           "type": "text",
257 |           "primaryKey": false,
258 |           "notNull": false
259 |         },
260 |         "userAgent": {
261 |           "name": "userAgent",
262 |           "type": "text",
263 |           "primaryKey": false,
264 |           "notNull": false
265 |         },
266 |         "createdAt": {
267 |           "name": "createdAt",
268 |           "type": "timestamp",
269 |           "primaryKey": false,
270 |           "notNull": true,
271 |           "default": "now()"
272 |         },
273 |         "updatedAt": {
274 |           "name": "updatedAt",
275 |           "type": "timestamp",
276 |           "primaryKey": false,
277 |           "notNull": true,
278 |           "default": "now()"
279 |         }
280 |       },
281 |       "indexes": {},
282 |       "foreignKeys": {
283 |         "session_userId_user_id_fk": {
284 |           "name": "session_userId_user_id_fk",
285 |           "tableFrom": "session",
286 |           "tableTo": "user",
287 |           "columnsFrom": [
288 |             "userId"
289 |           ],
290 |           "columnsTo": [
291 |             "id"
292 |           ],
293 |           "onDelete": "cascade",
294 |           "onUpdate": "no action"
295 |         }
296 |       },
297 |       "compositePrimaryKeys": {},
298 |       "uniqueConstraints": {
299 |         "session_sessionToken_unique": {
300 |           "name": "session_sessionToken_unique",
301 |           "nullsNotDistinct": false,
302 |           "columns": [
303 |             "sessionToken"
304 |           ]
305 |         }
306 |       },
307 |       "policies": {},
308 |       "checkConstraints": {},
309 |       "isRLSEnabled": false
310 |     },
311 |     "public.user": {
312 |       "name": "user",
313 |       "schema": "",
314 |       "columns": {
315 |         "id": {
316 |           "name": "id",
317 |           "type": "text",
318 |           "primaryKey": true,
319 |           "notNull": true
320 |         },
321 |         "name": {
322 |           "name": "name",
323 |           "type": "text",
324 |           "primaryKey": false,
325 |           "notNull": false
326 |         },
327 |         "email": {
328 |           "name": "email",
329 |           "type": "text",
330 |           "primaryKey": false,
331 |           "notNull": true
332 |         },
333 |         "emailVerified": {
334 |           "name": "emailVerified",
335 |           "type": "timestamp",
336 |           "primaryKey": false,
337 |           "notNull": false
338 |         },
339 |         "image": {
340 |           "name": "image",
341 |           "type": "text",
342 |           "primaryKey": false,
343 |           "notNull": false
344 |         },
345 |         "createdAt": {
346 |           "name": "createdAt",
347 |           "type": "timestamp",
348 |           "primaryKey": false,
349 |           "notNull": true,
350 |           "default": "now()"
351 |         },
352 |         "updatedAt": {
353 |           "name": "updatedAt",
354 |           "type": "timestamp",
355 |           "primaryKey": false,
356 |           "notNull": true,
357 |           "default": "now()"
358 |         }
359 |       },
360 |       "indexes": {},
361 |       "foreignKeys": {},
362 |       "compositePrimaryKeys": {},
363 |       "uniqueConstraints": {
364 |         "user_email_unique": {
365 |           "name": "user_email_unique",
366 |           "nullsNotDistinct": false,
367 |           "columns": [
368 |             "email"
369 |           ]
370 |         }
371 |       },
372 |       "policies": {},
373 |       "checkConstraints": {},
374 |       "isRLSEnabled": false
375 |     },
376 |     "public.verification": {
377 |       "name": "verification",
378 |       "schema": "",
379 |       "columns": {
380 |         "id": {
381 |           "name": "id",
382 |           "type": "text",
383 |           "primaryKey": true,
384 |           "notNull": true
385 |         },
386 |         "identifier": {
387 |           "name": "identifier",
388 |           "type": "text",
389 |           "primaryKey": false,
390 |           "notNull": true
391 |         },
392 |         "value": {
393 |           "name": "value",
394 |           "type": "text",
395 |           "primaryKey": false,
396 |           "notNull": true
397 |         },
398 |         "expiresAt": {
399 |           "name": "expiresAt",
400 |           "type": "timestamp",
401 |           "primaryKey": false,
402 |           "notNull": true
403 |         },
404 |         "createdAt": {
405 |           "name": "createdAt",
406 |           "type": "timestamp",
407 |           "primaryKey": false,
408 |           "notNull": true,
409 |           "default": "now()"
410 |         },
411 |         "updatedAt": {
412 |           "name": "updatedAt",
413 |           "type": "timestamp",
414 |           "primaryKey": false,
415 |           "notNull": true,
416 |           "default": "now()"
417 |         }
418 |       },
419 |       "indexes": {},
420 |       "foreignKeys": {},
421 |       "compositePrimaryKeys": {},
422 |       "uniqueConstraints": {},
423 |       "policies": {},
424 |       "checkConstraints": {},
425 |       "isRLSEnabled": false
426 |     }
427 |   },
428 |   "enums": {},
429 |   "schemas": {},
430 |   "sequences": {},
431 |   "roles": {},
432 |   "policies": {},
433 |   "views": {},
434 |   "_meta": {
435 |     "columns": {},
436 |     "schemas": {},
437 |     "tables": {}
438 |   }
439 | }
```

drizzle/meta/0009_snapshot.json
```
1 | {
2 |   "id": "d5e332a3-33c2-458b-9413-fb800ae031fb",
3 |   "prevId": "f788fcaf-9e85-4b3d-af1f-2fd486b7755a",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.account": {
8 |       "name": "account",
9 |       "schema": "",
10 |       "columns": {
11 |         "userId": {
12 |           "name": "userId",
13 |           "type": "text",
14 |           "primaryKey": false,
15 |           "notNull": true
16 |         },
17 |         "providerId": {
18 |           "name": "providerId",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "accountId": {
24 |           "name": "accountId",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true
28 |         },
29 |         "providerType": {
30 |           "name": "providerType",
31 |           "type": "text",
32 |           "primaryKey": false,
33 |           "notNull": true
34 |         },
35 |         "access_token": {
36 |           "name": "access_token",
37 |           "type": "text",
38 |           "primaryKey": false,
39 |           "notNull": false
40 |         },
41 |         "refresh_token": {
42 |           "name": "refresh_token",
43 |           "type": "text",
44 |           "primaryKey": false,
45 |           "notNull": false
46 |         },
47 |         "expires_at": {
48 |           "name": "expires_at",
49 |           "type": "timestamp",
50 |           "primaryKey": false,
51 |           "notNull": false
52 |         },
53 |         "token_type": {
54 |           "name": "token_type",
55 |           "type": "text",
56 |           "primaryKey": false,
57 |           "notNull": false
58 |         },
59 |         "scope": {
60 |           "name": "scope",
61 |           "type": "text",
62 |           "primaryKey": false,
63 |           "notNull": false
64 |         },
65 |         "id_token": {
66 |           "name": "id_token",
67 |           "type": "text",
68 |           "primaryKey": false,
69 |           "notNull": false
70 |         },
71 |         "session_state": {
72 |           "name": "session_state",
73 |           "type": "text",
74 |           "primaryKey": false,
75 |           "notNull": false
76 |         },
77 |         "createdAt": {
78 |           "name": "createdAt",
79 |           "type": "timestamp",
80 |           "primaryKey": false,
81 |           "notNull": true,
82 |           "default": "now()"
83 |         },
84 |         "updatedAt": {
85 |           "name": "updatedAt",
86 |           "type": "timestamp",
87 |           "primaryKey": false,
88 |           "notNull": true,
89 |           "default": "now()"
90 |         }
91 |       },
92 |       "indexes": {},
93 |       "foreignKeys": {
94 |         "account_userId_user_id_fk": {
95 |           "name": "account_userId_user_id_fk",
96 |           "tableFrom": "account",
97 |           "tableTo": "user",
98 |           "columnsFrom": [
99 |             "userId"
100 |           ],
101 |           "columnsTo": [
102 |             "id"
103 |           ],
104 |           "onDelete": "cascade",
105 |           "onUpdate": "no action"
106 |         }
107 |       },
108 |       "compositePrimaryKeys": {
109 |         "account_providerId_accountId_pk": {
110 |           "name": "account_providerId_accountId_pk",
111 |           "columns": [
112 |             "providerId",
113 |             "accountId"
114 |           ]
115 |         }
116 |       },
117 |       "uniqueConstraints": {},
118 |       "policies": {},
119 |       "checkConstraints": {},
120 |       "isRLSEnabled": false
121 |     },
122 |     "public.chats": {
123 |       "name": "chats",
124 |       "schema": "",
125 |       "columns": {
126 |         "id": {
127 |           "name": "id",
128 |           "type": "text",
129 |           "primaryKey": true,
130 |           "notNull": true
131 |         },
132 |         "user_id": {
133 |           "name": "user_id",
134 |           "type": "text",
135 |           "primaryKey": false,
136 |           "notNull": true
137 |         },
138 |         "title": {
139 |           "name": "title",
140 |           "type": "text",
141 |           "primaryKey": false,
142 |           "notNull": true,
143 |           "default": "'New Chat'"
144 |         },
145 |         "created_at": {
146 |           "name": "created_at",
147 |           "type": "timestamp",
148 |           "primaryKey": false,
149 |           "notNull": true,
150 |           "default": "now()"
151 |         },
152 |         "updated_at": {
153 |           "name": "updated_at",
154 |           "type": "timestamp",
155 |           "primaryKey": false,
156 |           "notNull": true,
157 |           "default": "now()"
158 |         }
159 |       },
160 |       "indexes": {},
161 |       "foreignKeys": {},
162 |       "compositePrimaryKeys": {},
163 |       "uniqueConstraints": {},
164 |       "policies": {},
165 |       "checkConstraints": {},
166 |       "isRLSEnabled": false
167 |     },
168 |     "public.messages": {
169 |       "name": "messages",
170 |       "schema": "",
171 |       "columns": {
172 |         "id": {
173 |           "name": "id",
174 |           "type": "text",
175 |           "primaryKey": true,
176 |           "notNull": true
177 |         },
178 |         "chat_id": {
179 |           "name": "chat_id",
180 |           "type": "text",
181 |           "primaryKey": false,
182 |           "notNull": true
183 |         },
184 |         "role": {
185 |           "name": "role",
186 |           "type": "text",
187 |           "primaryKey": false,
188 |           "notNull": true
189 |         },
190 |         "parts": {
191 |           "name": "parts",
192 |           "type": "json",
193 |           "primaryKey": false,
194 |           "notNull": true
195 |         },
196 |         "created_at": {
197 |           "name": "created_at",
198 |           "type": "timestamp",
199 |           "primaryKey": false,
200 |           "notNull": true,
201 |           "default": "now()"
202 |         }
203 |       },
204 |       "indexes": {},
205 |       "foreignKeys": {
206 |         "messages_chat_id_chats_id_fk": {
207 |           "name": "messages_chat_id_chats_id_fk",
208 |           "tableFrom": "messages",
209 |           "tableTo": "chats",
210 |           "columnsFrom": [
211 |             "chat_id"
212 |           ],
213 |           "columnsTo": [
214 |             "id"
215 |           ],
216 |           "onDelete": "cascade",
217 |           "onUpdate": "no action"
218 |         }
219 |       },
220 |       "compositePrimaryKeys": {},
221 |       "uniqueConstraints": {},
222 |       "policies": {},
223 |       "checkConstraints": {},
224 |       "isRLSEnabled": false
225 |     },
226 |     "public.session": {
227 |       "name": "session",
228 |       "schema": "",
229 |       "columns": {
230 |         "id": {
231 |           "name": "id",
232 |           "type": "text",
233 |           "primaryKey": true,
234 |           "notNull": true
235 |         },
236 |         "sessionToken": {
237 |           "name": "sessionToken",
238 |           "type": "text",
239 |           "primaryKey": false,
240 |           "notNull": true
241 |         },
242 |         "userId": {
243 |           "name": "userId",
244 |           "type": "text",
245 |           "primaryKey": false,
246 |           "notNull": true
247 |         },
248 |         "expires": {
249 |           "name": "expires",
250 |           "type": "timestamp",
251 |           "primaryKey": false,
252 |           "notNull": true
253 |         },
254 |         "ipAddress": {
255 |           "name": "ipAddress",
256 |           "type": "text",
257 |           "primaryKey": false,
258 |           "notNull": false
259 |         },
260 |         "userAgent": {
261 |           "name": "userAgent",
262 |           "type": "text",
263 |           "primaryKey": false,
264 |           "notNull": false
265 |         },
266 |         "createdAt": {
267 |           "name": "createdAt",
268 |           "type": "timestamp",
269 |           "primaryKey": false,
270 |           "notNull": true,
271 |           "default": "now()"
272 |         },
273 |         "updatedAt": {
274 |           "name": "updatedAt",
275 |           "type": "timestamp",
276 |           "primaryKey": false,
277 |           "notNull": true,
278 |           "default": "now()"
279 |         }
280 |       },
281 |       "indexes": {},
282 |       "foreignKeys": {
283 |         "session_userId_user_id_fk": {
284 |           "name": "session_userId_user_id_fk",
285 |           "tableFrom": "session",
286 |           "tableTo": "user",
287 |           "columnsFrom": [
288 |             "userId"
289 |           ],
290 |           "columnsTo": [
291 |             "id"
292 |           ],
293 |           "onDelete": "cascade",
294 |           "onUpdate": "no action"
295 |         }
296 |       },
297 |       "compositePrimaryKeys": {},
298 |       "uniqueConstraints": {
299 |         "session_sessionToken_unique": {
300 |           "name": "session_sessionToken_unique",
301 |           "nullsNotDistinct": false,
302 |           "columns": [
303 |             "sessionToken"
304 |           ]
305 |         }
306 |       },
307 |       "policies": {},
308 |       "checkConstraints": {},
309 |       "isRLSEnabled": false
310 |     },
311 |     "public.user": {
312 |       "name": "user",
313 |       "schema": "",
314 |       "columns": {
315 |         "id": {
316 |           "name": "id",
317 |           "type": "text",
318 |           "primaryKey": true,
319 |           "notNull": true
320 |         },
321 |         "name": {
322 |           "name": "name",
323 |           "type": "text",
324 |           "primaryKey": false,
325 |           "notNull": false
326 |         },
327 |         "email": {
328 |           "name": "email",
329 |           "type": "text",
330 |           "primaryKey": false,
331 |           "notNull": true
332 |         },
333 |         "emailVerified": {
334 |           "name": "emailVerified",
335 |           "type": "boolean",
336 |           "primaryKey": false,
337 |           "notNull": false
338 |         },
339 |         "image": {
340 |           "name": "image",
341 |           "type": "text",
342 |           "primaryKey": false,
343 |           "notNull": false
344 |         },
345 |         "createdAt": {
346 |           "name": "createdAt",
347 |           "type": "timestamp",
348 |           "primaryKey": false,
349 |           "notNull": true,
350 |           "default": "now()"
351 |         },
352 |         "updatedAt": {
353 |           "name": "updatedAt",
354 |           "type": "timestamp",
355 |           "primaryKey": false,
356 |           "notNull": true,
357 |           "default": "now()"
358 |         }
359 |       },
360 |       "indexes": {},
361 |       "foreignKeys": {},
362 |       "compositePrimaryKeys": {},
363 |       "uniqueConstraints": {
364 |         "user_email_unique": {
365 |           "name": "user_email_unique",
366 |           "nullsNotDistinct": false,
367 |           "columns": [
368 |             "email"
369 |           ]
370 |         }
371 |       },
372 |       "policies": {},
373 |       "checkConstraints": {},
374 |       "isRLSEnabled": false
375 |     },
376 |     "public.verification": {
377 |       "name": "verification",
378 |       "schema": "",
379 |       "columns": {
380 |         "id": {
381 |           "name": "id",
382 |           "type": "text",
383 |           "primaryKey": true,
384 |           "notNull": true
385 |         },
386 |         "identifier": {
387 |           "name": "identifier",
388 |           "type": "text",
389 |           "primaryKey": false,
390 |           "notNull": true
391 |         },
392 |         "value": {
393 |           "name": "value",
394 |           "type": "text",
395 |           "primaryKey": false,
396 |           "notNull": true
397 |         },
398 |         "expiresAt": {
399 |           "name": "expiresAt",
400 |           "type": "timestamp",
401 |           "primaryKey": false,
402 |           "notNull": true
403 |         },
404 |         "createdAt": {
405 |           "name": "createdAt",
406 |           "type": "timestamp",
407 |           "primaryKey": false,
408 |           "notNull": true,
409 |           "default": "now()"
410 |         },
411 |         "updatedAt": {
412 |           "name": "updatedAt",
413 |           "type": "timestamp",
414 |           "primaryKey": false,
415 |           "notNull": true,
416 |           "default": "now()"
417 |         }
418 |       },
419 |       "indexes": {},
420 |       "foreignKeys": {},
421 |       "compositePrimaryKeys": {},
422 |       "uniqueConstraints": {},
423 |       "policies": {},
424 |       "checkConstraints": {},
425 |       "isRLSEnabled": false
426 |     }
427 |   },
428 |   "enums": {},
429 |   "schemas": {},
430 |   "sequences": {},
431 |   "roles": {},
432 |   "policies": {},
433 |   "views": {},
434 |   "_meta": {
435 |     "columns": {},
436 |     "schemas": {},
437 |     "tables": {}
438 |   }
439 | }
```

drizzle/meta/0010_snapshot.json
```
1 | {
2 |   "id": "fdd5cf50-77dd-4cd6-ad47-24c0efb4c8e4",
3 |   "prevId": "d5e332a3-33c2-458b-9413-fb800ae031fb",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.account": {
8 |       "name": "account",
9 |       "schema": "",
10 |       "columns": {
11 |         "userId": {
12 |           "name": "userId",
13 |           "type": "text",
14 |           "primaryKey": false,
15 |           "notNull": true
16 |         },
17 |         "providerId": {
18 |           "name": "providerId",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "accountId": {
24 |           "name": "accountId",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true
28 |         },
29 |         "providerType": {
30 |           "name": "providerType",
31 |           "type": "text",
32 |           "primaryKey": false,
33 |           "notNull": true
34 |         },
35 |         "access_token": {
36 |           "name": "access_token",
37 |           "type": "text",
38 |           "primaryKey": false,
39 |           "notNull": false
40 |         },
41 |         "refresh_token": {
42 |           "name": "refresh_token",
43 |           "type": "text",
44 |           "primaryKey": false,
45 |           "notNull": false
46 |         },
47 |         "access_token_expires_at": {
48 |           "name": "access_token_expires_at",
49 |           "type": "integer",
50 |           "primaryKey": false,
51 |           "notNull": false
52 |         },
53 |         "token_type": {
54 |           "name": "token_type",
55 |           "type": "text",
56 |           "primaryKey": false,
57 |           "notNull": false
58 |         },
59 |         "scope": {
60 |           "name": "scope",
61 |           "type": "text",
62 |           "primaryKey": false,
63 |           "notNull": false
64 |         },
65 |         "id_token": {
66 |           "name": "id_token",
67 |           "type": "text",
68 |           "primaryKey": false,
69 |           "notNull": false
70 |         },
71 |         "session_state": {
72 |           "name": "session_state",
73 |           "type": "text",
74 |           "primaryKey": false,
75 |           "notNull": false
76 |         },
77 |         "createdAt": {
78 |           "name": "createdAt",
79 |           "type": "timestamp",
80 |           "primaryKey": false,
81 |           "notNull": true,
82 |           "default": "now()"
83 |         },
84 |         "updatedAt": {
85 |           "name": "updatedAt",
86 |           "type": "timestamp",
87 |           "primaryKey": false,
88 |           "notNull": true,
89 |           "default": "now()"
90 |         }
91 |       },
92 |       "indexes": {},
93 |       "foreignKeys": {
94 |         "account_userId_user_id_fk": {
95 |           "name": "account_userId_user_id_fk",
96 |           "tableFrom": "account",
97 |           "tableTo": "user",
98 |           "columnsFrom": [
99 |             "userId"
100 |           ],
101 |           "columnsTo": [
102 |             "id"
103 |           ],
104 |           "onDelete": "cascade",
105 |           "onUpdate": "no action"
106 |         }
107 |       },
108 |       "compositePrimaryKeys": {
109 |         "account_providerId_accountId_pk": {
110 |           "name": "account_providerId_accountId_pk",
111 |           "columns": [
112 |             "providerId",
113 |             "accountId"
114 |           ]
115 |         }
116 |       },
117 |       "uniqueConstraints": {},
118 |       "policies": {},
119 |       "checkConstraints": {},
120 |       "isRLSEnabled": false
121 |     },
122 |     "public.chats": {
123 |       "name": "chats",
124 |       "schema": "",
125 |       "columns": {
126 |         "id": {
127 |           "name": "id",
128 |           "type": "text",
129 |           "primaryKey": true,
130 |           "notNull": true
131 |         },
132 |         "user_id": {
133 |           "name": "user_id",
134 |           "type": "text",
135 |           "primaryKey": false,
136 |           "notNull": true
137 |         },
138 |         "title": {
139 |           "name": "title",
140 |           "type": "text",
141 |           "primaryKey": false,
142 |           "notNull": true,
143 |           "default": "'New Chat'"
144 |         },
145 |         "created_at": {
146 |           "name": "created_at",
147 |           "type": "timestamp",
148 |           "primaryKey": false,
149 |           "notNull": true,
150 |           "default": "now()"
151 |         },
152 |         "updated_at": {
153 |           "name": "updated_at",
154 |           "type": "timestamp",
155 |           "primaryKey": false,
156 |           "notNull": true,
157 |           "default": "now()"
158 |         }
159 |       },
160 |       "indexes": {},
161 |       "foreignKeys": {},
162 |       "compositePrimaryKeys": {},
163 |       "uniqueConstraints": {},
164 |       "policies": {},
165 |       "checkConstraints": {},
166 |       "isRLSEnabled": false
167 |     },
168 |     "public.messages": {
169 |       "name": "messages",
170 |       "schema": "",
171 |       "columns": {
172 |         "id": {
173 |           "name": "id",
174 |           "type": "text",
175 |           "primaryKey": true,
176 |           "notNull": true
177 |         },
178 |         "chat_id": {
179 |           "name": "chat_id",
180 |           "type": "text",
181 |           "primaryKey": false,
182 |           "notNull": true
183 |         },
184 |         "role": {
185 |           "name": "role",
186 |           "type": "text",
187 |           "primaryKey": false,
188 |           "notNull": true
189 |         },
190 |         "parts": {
191 |           "name": "parts",
192 |           "type": "json",
193 |           "primaryKey": false,
194 |           "notNull": true
195 |         },
196 |         "created_at": {
197 |           "name": "created_at",
198 |           "type": "timestamp",
199 |           "primaryKey": false,
200 |           "notNull": true,
201 |           "default": "now()"
202 |         }
203 |       },
204 |       "indexes": {},
205 |       "foreignKeys": {
206 |         "messages_chat_id_chats_id_fk": {
207 |           "name": "messages_chat_id_chats_id_fk",
208 |           "tableFrom": "messages",
209 |           "tableTo": "chats",
210 |           "columnsFrom": [
211 |             "chat_id"
212 |           ],
213 |           "columnsTo": [
214 |             "id"
215 |           ],
216 |           "onDelete": "cascade",
217 |           "onUpdate": "no action"
218 |         }
219 |       },
220 |       "compositePrimaryKeys": {},
221 |       "uniqueConstraints": {},
222 |       "policies": {},
223 |       "checkConstraints": {},
224 |       "isRLSEnabled": false
225 |     },
226 |     "public.session": {
227 |       "name": "session",
228 |       "schema": "",
229 |       "columns": {
230 |         "id": {
231 |           "name": "id",
232 |           "type": "text",
233 |           "primaryKey": true,
234 |           "notNull": true
235 |         },
236 |         "sessionToken": {
237 |           "name": "sessionToken",
238 |           "type": "text",
239 |           "primaryKey": false,
240 |           "notNull": true
241 |         },
242 |         "userId": {
243 |           "name": "userId",
244 |           "type": "text",
245 |           "primaryKey": false,
246 |           "notNull": true
247 |         },
248 |         "expires": {
249 |           "name": "expires",
250 |           "type": "timestamp",
251 |           "primaryKey": false,
252 |           "notNull": true
253 |         },
254 |         "ipAddress": {
255 |           "name": "ipAddress",
256 |           "type": "text",
257 |           "primaryKey": false,
258 |           "notNull": false
259 |         },
260 |         "userAgent": {
261 |           "name": "userAgent",
262 |           "type": "text",
263 |           "primaryKey": false,
264 |           "notNull": false
265 |         },
266 |         "createdAt": {
267 |           "name": "createdAt",
268 |           "type": "timestamp",
269 |           "primaryKey": false,
270 |           "notNull": true,
271 |           "default": "now()"
272 |         },
273 |         "updatedAt": {
274 |           "name": "updatedAt",
275 |           "type": "timestamp",
276 |           "primaryKey": false,
277 |           "notNull": true,
278 |           "default": "now()"
279 |         }
280 |       },
281 |       "indexes": {},
282 |       "foreignKeys": {
283 |         "session_userId_user_id_fk": {
284 |           "name": "session_userId_user_id_fk",
285 |           "tableFrom": "session",
286 |           "tableTo": "user",
287 |           "columnsFrom": [
288 |             "userId"
289 |           ],
290 |           "columnsTo": [
291 |             "id"
292 |           ],
293 |           "onDelete": "cascade",
294 |           "onUpdate": "no action"
295 |         }
296 |       },
297 |       "compositePrimaryKeys": {},
298 |       "uniqueConstraints": {
299 |         "session_sessionToken_unique": {
300 |           "name": "session_sessionToken_unique",
301 |           "nullsNotDistinct": false,
302 |           "columns": [
303 |             "sessionToken"
304 |           ]
305 |         }
306 |       },
307 |       "policies": {},
308 |       "checkConstraints": {},
309 |       "isRLSEnabled": false
310 |     },
311 |     "public.user": {
312 |       "name": "user",
313 |       "schema": "",
314 |       "columns": {
315 |         "id": {
316 |           "name": "id",
317 |           "type": "text",
318 |           "primaryKey": true,
319 |           "notNull": true
320 |         },
321 |         "name": {
322 |           "name": "name",
323 |           "type": "text",
324 |           "primaryKey": false,
325 |           "notNull": false
326 |         },
327 |         "email": {
328 |           "name": "email",
329 |           "type": "text",
330 |           "primaryKey": false,
331 |           "notNull": true
332 |         },
333 |         "emailVerified": {
334 |           "name": "emailVerified",
335 |           "type": "boolean",
336 |           "primaryKey": false,
337 |           "notNull": false
338 |         },
339 |         "image": {
340 |           "name": "image",
341 |           "type": "text",
342 |           "primaryKey": false,
343 |           "notNull": false
344 |         },
345 |         "createdAt": {
346 |           "name": "createdAt",
347 |           "type": "timestamp",
348 |           "primaryKey": false,
349 |           "notNull": true,
350 |           "default": "now()"
351 |         },
352 |         "updatedAt": {
353 |           "name": "updatedAt",
354 |           "type": "timestamp",
355 |           "primaryKey": false,
356 |           "notNull": true,
357 |           "default": "now()"
358 |         }
359 |       },
360 |       "indexes": {},
361 |       "foreignKeys": {},
362 |       "compositePrimaryKeys": {},
363 |       "uniqueConstraints": {
364 |         "user_email_unique": {
365 |           "name": "user_email_unique",
366 |           "nullsNotDistinct": false,
367 |           "columns": [
368 |             "email"
369 |           ]
370 |         }
371 |       },
372 |       "policies": {},
373 |       "checkConstraints": {},
374 |       "isRLSEnabled": false
375 |     },
376 |     "public.verification": {
377 |       "name": "verification",
378 |       "schema": "",
379 |       "columns": {
380 |         "id": {
381 |           "name": "id",
382 |           "type": "text",
383 |           "primaryKey": true,
384 |           "notNull": true
385 |         },
386 |         "identifier": {
387 |           "name": "identifier",
388 |           "type": "text",
389 |           "primaryKey": false,
390 |           "notNull": true
391 |         },
392 |         "value": {
393 |           "name": "value",
394 |           "type": "text",
395 |           "primaryKey": false,
396 |           "notNull": true
397 |         },
398 |         "expiresAt": {
399 |           "name": "expiresAt",
400 |           "type": "timestamp",
401 |           "primaryKey": false,
402 |           "notNull": true
403 |         },
404 |         "createdAt": {
405 |           "name": "createdAt",
406 |           "type": "timestamp",
407 |           "primaryKey": false,
408 |           "notNull": true,
409 |           "default": "now()"
410 |         },
411 |         "updatedAt": {
412 |           "name": "updatedAt",
413 |           "type": "timestamp",
414 |           "primaryKey": false,
415 |           "notNull": true,
416 |           "default": "now()"
417 |         }
418 |       },
419 |       "indexes": {},
420 |       "foreignKeys": {},
421 |       "compositePrimaryKeys": {},
422 |       "uniqueConstraints": {},
423 |       "policies": {},
424 |       "checkConstraints": {},
425 |       "isRLSEnabled": false
426 |     }
427 |   },
428 |   "enums": {},
429 |   "schemas": {},
430 |   "sequences": {},
431 |   "roles": {},
432 |   "policies": {},
433 |   "views": {},
434 |   "_meta": {
435 |     "columns": {},
436 |     "schemas": {},
437 |     "tables": {}
438 |   }
439 | }
```

drizzle/meta/0011_snapshot.json
```
1 | {
2 |   "id": "4ef58c27-a246-4ea7-ba8e-331168d0d555",
3 |   "prevId": "fdd5cf50-77dd-4cd6-ad47-24c0efb4c8e4",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.account": {
8 |       "name": "account",
9 |       "schema": "",
10 |       "columns": {
11 |         "id": {
12 |           "name": "id",
13 |           "type": "text",
14 |           "primaryKey": true,
15 |           "notNull": true
16 |         },
17 |         "userId": {
18 |           "name": "userId",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "providerId": {
24 |           "name": "providerId",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true
28 |         },
29 |         "accountId": {
30 |           "name": "accountId",
31 |           "type": "text",
32 |           "primaryKey": false,
33 |           "notNull": true
34 |         },
35 |         "providerType": {
36 |           "name": "providerType",
37 |           "type": "text",
38 |           "primaryKey": false,
39 |           "notNull": true
40 |         },
41 |         "access_token": {
42 |           "name": "access_token",
43 |           "type": "text",
44 |           "primaryKey": false,
45 |           "notNull": false
46 |         },
47 |         "refresh_token": {
48 |           "name": "refresh_token",
49 |           "type": "text",
50 |           "primaryKey": false,
51 |           "notNull": false
52 |         },
53 |         "access_token_expires_at": {
54 |           "name": "access_token_expires_at",
55 |           "type": "integer",
56 |           "primaryKey": false,
57 |           "notNull": false
58 |         },
59 |         "token_type": {
60 |           "name": "token_type",
61 |           "type": "text",
62 |           "primaryKey": false,
63 |           "notNull": false
64 |         },
65 |         "scope": {
66 |           "name": "scope",
67 |           "type": "text",
68 |           "primaryKey": false,
69 |           "notNull": false
70 |         },
71 |         "id_token": {
72 |           "name": "id_token",
73 |           "type": "text",
74 |           "primaryKey": false,
75 |           "notNull": false
76 |         },
77 |         "session_state": {
78 |           "name": "session_state",
79 |           "type": "text",
80 |           "primaryKey": false,
81 |           "notNull": false
82 |         },
83 |         "createdAt": {
84 |           "name": "createdAt",
85 |           "type": "timestamp",
86 |           "primaryKey": false,
87 |           "notNull": true,
88 |           "default": "now()"
89 |         },
90 |         "updatedAt": {
91 |           "name": "updatedAt",
92 |           "type": "timestamp",
93 |           "primaryKey": false,
94 |           "notNull": true,
95 |           "default": "now()"
96 |         }
97 |       },
98 |       "indexes": {},
99 |       "foreignKeys": {
100 |         "account_userId_user_id_fk": {
101 |           "name": "account_userId_user_id_fk",
102 |           "tableFrom": "account",
103 |           "tableTo": "user",
104 |           "columnsFrom": [
105 |             "userId"
106 |           ],
107 |           "columnsTo": [
108 |             "id"
109 |           ],
110 |           "onDelete": "cascade",
111 |           "onUpdate": "no action"
112 |         }
113 |       },
114 |       "compositePrimaryKeys": {},
115 |       "uniqueConstraints": {},
116 |       "policies": {},
117 |       "checkConstraints": {},
118 |       "isRLSEnabled": false
119 |     },
120 |     "public.chats": {
121 |       "name": "chats",
122 |       "schema": "",
123 |       "columns": {
124 |         "id": {
125 |           "name": "id",
126 |           "type": "text",
127 |           "primaryKey": true,
128 |           "notNull": true
129 |         },
130 |         "user_id": {
131 |           "name": "user_id",
132 |           "type": "text",
133 |           "primaryKey": false,
134 |           "notNull": true
135 |         },
136 |         "title": {
137 |           "name": "title",
138 |           "type": "text",
139 |           "primaryKey": false,
140 |           "notNull": true,
141 |           "default": "'New Chat'"
142 |         },
143 |         "created_at": {
144 |           "name": "created_at",
145 |           "type": "timestamp",
146 |           "primaryKey": false,
147 |           "notNull": true,
148 |           "default": "now()"
149 |         },
150 |         "updated_at": {
151 |           "name": "updated_at",
152 |           "type": "timestamp",
153 |           "primaryKey": false,
154 |           "notNull": true,
155 |           "default": "now()"
156 |         }
157 |       },
158 |       "indexes": {},
159 |       "foreignKeys": {},
160 |       "compositePrimaryKeys": {},
161 |       "uniqueConstraints": {},
162 |       "policies": {},
163 |       "checkConstraints": {},
164 |       "isRLSEnabled": false
165 |     },
166 |     "public.messages": {
167 |       "name": "messages",
168 |       "schema": "",
169 |       "columns": {
170 |         "id": {
171 |           "name": "id",
172 |           "type": "text",
173 |           "primaryKey": true,
174 |           "notNull": true
175 |         },
176 |         "chat_id": {
177 |           "name": "chat_id",
178 |           "type": "text",
179 |           "primaryKey": false,
180 |           "notNull": true
181 |         },
182 |         "role": {
183 |           "name": "role",
184 |           "type": "text",
185 |           "primaryKey": false,
186 |           "notNull": true
187 |         },
188 |         "parts": {
189 |           "name": "parts",
190 |           "type": "json",
191 |           "primaryKey": false,
192 |           "notNull": true
193 |         },
194 |         "created_at": {
195 |           "name": "created_at",
196 |           "type": "timestamp",
197 |           "primaryKey": false,
198 |           "notNull": true,
199 |           "default": "now()"
200 |         }
201 |       },
202 |       "indexes": {},
203 |       "foreignKeys": {
204 |         "messages_chat_id_chats_id_fk": {
205 |           "name": "messages_chat_id_chats_id_fk",
206 |           "tableFrom": "messages",
207 |           "tableTo": "chats",
208 |           "columnsFrom": [
209 |             "chat_id"
210 |           ],
211 |           "columnsTo": [
212 |             "id"
213 |           ],
214 |           "onDelete": "cascade",
215 |           "onUpdate": "no action"
216 |         }
217 |       },
218 |       "compositePrimaryKeys": {},
219 |       "uniqueConstraints": {},
220 |       "policies": {},
221 |       "checkConstraints": {},
222 |       "isRLSEnabled": false
223 |     },
224 |     "public.session": {
225 |       "name": "session",
226 |       "schema": "",
227 |       "columns": {
228 |         "id": {
229 |           "name": "id",
230 |           "type": "text",
231 |           "primaryKey": true,
232 |           "notNull": true
233 |         },
234 |         "sessionToken": {
235 |           "name": "sessionToken",
236 |           "type": "text",
237 |           "primaryKey": false,
238 |           "notNull": true
239 |         },
240 |         "userId": {
241 |           "name": "userId",
242 |           "type": "text",
243 |           "primaryKey": false,
244 |           "notNull": true
245 |         },
246 |         "expires": {
247 |           "name": "expires",
248 |           "type": "timestamp",
249 |           "primaryKey": false,
250 |           "notNull": true
251 |         },
252 |         "ipAddress": {
253 |           "name": "ipAddress",
254 |           "type": "text",
255 |           "primaryKey": false,
256 |           "notNull": false
257 |         },
258 |         "userAgent": {
259 |           "name": "userAgent",
260 |           "type": "text",
261 |           "primaryKey": false,
262 |           "notNull": false
263 |         },
264 |         "createdAt": {
265 |           "name": "createdAt",
266 |           "type": "timestamp",
267 |           "primaryKey": false,
268 |           "notNull": true,
269 |           "default": "now()"
270 |         },
271 |         "updatedAt": {
272 |           "name": "updatedAt",
273 |           "type": "timestamp",
274 |           "primaryKey": false,
275 |           "notNull": true,
276 |           "default": "now()"
277 |         }
278 |       },
279 |       "indexes": {},
280 |       "foreignKeys": {
281 |         "session_userId_user_id_fk": {
282 |           "name": "session_userId_user_id_fk",
283 |           "tableFrom": "session",
284 |           "tableTo": "user",
285 |           "columnsFrom": [
286 |             "userId"
287 |           ],
288 |           "columnsTo": [
289 |             "id"
290 |           ],
291 |           "onDelete": "cascade",
292 |           "onUpdate": "no action"
293 |         }
294 |       },
295 |       "compositePrimaryKeys": {},
296 |       "uniqueConstraints": {
297 |         "session_sessionToken_unique": {
298 |           "name": "session_sessionToken_unique",
299 |           "nullsNotDistinct": false,
300 |           "columns": [
301 |             "sessionToken"
302 |           ]
303 |         }
304 |       },
305 |       "policies": {},
306 |       "checkConstraints": {},
307 |       "isRLSEnabled": false
308 |     },
309 |     "public.user": {
310 |       "name": "user",
311 |       "schema": "",
312 |       "columns": {
313 |         "id": {
314 |           "name": "id",
315 |           "type": "text",
316 |           "primaryKey": true,
317 |           "notNull": true
318 |         },
319 |         "name": {
320 |           "name": "name",
321 |           "type": "text",
322 |           "primaryKey": false,
323 |           "notNull": false
324 |         },
325 |         "email": {
326 |           "name": "email",
327 |           "type": "text",
328 |           "primaryKey": false,
329 |           "notNull": true
330 |         },
331 |         "emailVerified": {
332 |           "name": "emailVerified",
333 |           "type": "boolean",
334 |           "primaryKey": false,
335 |           "notNull": false
336 |         },
337 |         "image": {
338 |           "name": "image",
339 |           "type": "text",
340 |           "primaryKey": false,
341 |           "notNull": false
342 |         },
343 |         "createdAt": {
344 |           "name": "createdAt",
345 |           "type": "timestamp",
346 |           "primaryKey": false,
347 |           "notNull": true,
348 |           "default": "now()"
349 |         },
350 |         "updatedAt": {
351 |           "name": "updatedAt",
352 |           "type": "timestamp",
353 |           "primaryKey": false,
354 |           "notNull": true,
355 |           "default": "now()"
356 |         }
357 |       },
358 |       "indexes": {},
359 |       "foreignKeys": {},
360 |       "compositePrimaryKeys": {},
361 |       "uniqueConstraints": {
362 |         "user_email_unique": {
363 |           "name": "user_email_unique",
364 |           "nullsNotDistinct": false,
365 |           "columns": [
366 |             "email"
367 |           ]
368 |         }
369 |       },
370 |       "policies": {},
371 |       "checkConstraints": {},
372 |       "isRLSEnabled": false
373 |     },
374 |     "public.verification": {
375 |       "name": "verification",
376 |       "schema": "",
377 |       "columns": {
378 |         "id": {
379 |           "name": "id",
380 |           "type": "text",
381 |           "primaryKey": true,
382 |           "notNull": true
383 |         },
384 |         "identifier": {
385 |           "name": "identifier",
386 |           "type": "text",
387 |           "primaryKey": false,
388 |           "notNull": true
389 |         },
390 |         "value": {
391 |           "name": "value",
392 |           "type": "text",
393 |           "primaryKey": false,
394 |           "notNull": true
395 |         },
396 |         "expiresAt": {
397 |           "name": "expiresAt",
398 |           "type": "timestamp",
399 |           "primaryKey": false,
400 |           "notNull": true
401 |         },
402 |         "createdAt": {
403 |           "name": "createdAt",
404 |           "type": "timestamp",
405 |           "primaryKey": false,
406 |           "notNull": true,
407 |           "default": "now()"
408 |         },
409 |         "updatedAt": {
410 |           "name": "updatedAt",
411 |           "type": "timestamp",
412 |           "primaryKey": false,
413 |           "notNull": true,
414 |           "default": "now()"
415 |         }
416 |       },
417 |       "indexes": {},
418 |       "foreignKeys": {},
419 |       "compositePrimaryKeys": {},
420 |       "uniqueConstraints": {},
421 |       "policies": {},
422 |       "checkConstraints": {},
423 |       "isRLSEnabled": false
424 |     }
425 |   },
426 |   "enums": {},
427 |   "schemas": {},
428 |   "sequences": {},
429 |   "roles": {},
430 |   "policies": {},
431 |   "views": {},
432 |   "_meta": {
433 |     "columns": {},
434 |     "schemas": {},
435 |     "tables": {}
436 |   }
437 | }
```

drizzle/meta/0012_snapshot.json
```
1 | {
2 |   "id": "6350274c-a300-465c-9e77-b7b8f0ea0621",
3 |   "prevId": "4ef58c27-a246-4ea7-ba8e-331168d0d555",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.account": {
8 |       "name": "account",
9 |       "schema": "",
10 |       "columns": {
11 |         "id": {
12 |           "name": "id",
13 |           "type": "text",
14 |           "primaryKey": true,
15 |           "notNull": true
16 |         },
17 |         "userId": {
18 |           "name": "userId",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "providerId": {
24 |           "name": "providerId",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true
28 |         },
29 |         "accountId": {
30 |           "name": "accountId",
31 |           "type": "text",
32 |           "primaryKey": false,
33 |           "notNull": true
34 |         },
35 |         "providerType": {
36 |           "name": "providerType",
37 |           "type": "text",
38 |           "primaryKey": false,
39 |           "notNull": true
40 |         },
41 |         "access_token": {
42 |           "name": "access_token",
43 |           "type": "text",
44 |           "primaryKey": false,
45 |           "notNull": false
46 |         },
47 |         "refresh_token": {
48 |           "name": "refresh_token",
49 |           "type": "text",
50 |           "primaryKey": false,
51 |           "notNull": false
52 |         },
53 |         "access_token_expires_at": {
54 |           "name": "access_token_expires_at",
55 |           "type": "timestamp",
56 |           "primaryKey": false,
57 |           "notNull": false
58 |         },
59 |         "token_type": {
60 |           "name": "token_type",
61 |           "type": "text",
62 |           "primaryKey": false,
63 |           "notNull": false
64 |         },
65 |         "scope": {
66 |           "name": "scope",
67 |           "type": "text",
68 |           "primaryKey": false,
69 |           "notNull": false
70 |         },
71 |         "id_token": {
72 |           "name": "id_token",
73 |           "type": "text",
74 |           "primaryKey": false,
75 |           "notNull": false
76 |         },
77 |         "session_state": {
78 |           "name": "session_state",
79 |           "type": "text",
80 |           "primaryKey": false,
81 |           "notNull": false
82 |         },
83 |         "createdAt": {
84 |           "name": "createdAt",
85 |           "type": "timestamp",
86 |           "primaryKey": false,
87 |           "notNull": true,
88 |           "default": "now()"
89 |         },
90 |         "updatedAt": {
91 |           "name": "updatedAt",
92 |           "type": "timestamp",
93 |           "primaryKey": false,
94 |           "notNull": true,
95 |           "default": "now()"
96 |         }
97 |       },
98 |       "indexes": {},
99 |       "foreignKeys": {
100 |         "account_userId_user_id_fk": {
101 |           "name": "account_userId_user_id_fk",
102 |           "tableFrom": "account",
103 |           "tableTo": "user",
104 |           "columnsFrom": [
105 |             "userId"
106 |           ],
107 |           "columnsTo": [
108 |             "id"
109 |           ],
110 |           "onDelete": "cascade",
111 |           "onUpdate": "no action"
112 |         }
113 |       },
114 |       "compositePrimaryKeys": {},
115 |       "uniqueConstraints": {},
116 |       "policies": {},
117 |       "checkConstraints": {},
118 |       "isRLSEnabled": false
119 |     },
120 |     "public.chats": {
121 |       "name": "chats",
122 |       "schema": "",
123 |       "columns": {
124 |         "id": {
125 |           "name": "id",
126 |           "type": "text",
127 |           "primaryKey": true,
128 |           "notNull": true
129 |         },
130 |         "user_id": {
131 |           "name": "user_id",
132 |           "type": "text",
133 |           "primaryKey": false,
134 |           "notNull": true
135 |         },
136 |         "title": {
137 |           "name": "title",
138 |           "type": "text",
139 |           "primaryKey": false,
140 |           "notNull": true,
141 |           "default": "'New Chat'"
142 |         },
143 |         "created_at": {
144 |           "name": "created_at",
145 |           "type": "timestamp",
146 |           "primaryKey": false,
147 |           "notNull": true,
148 |           "default": "now()"
149 |         },
150 |         "updated_at": {
151 |           "name": "updated_at",
152 |           "type": "timestamp",
153 |           "primaryKey": false,
154 |           "notNull": true,
155 |           "default": "now()"
156 |         }
157 |       },
158 |       "indexes": {},
159 |       "foreignKeys": {},
160 |       "compositePrimaryKeys": {},
161 |       "uniqueConstraints": {},
162 |       "policies": {},
163 |       "checkConstraints": {},
164 |       "isRLSEnabled": false
165 |     },
166 |     "public.messages": {
167 |       "name": "messages",
168 |       "schema": "",
169 |       "columns": {
170 |         "id": {
171 |           "name": "id",
172 |           "type": "text",
173 |           "primaryKey": true,
174 |           "notNull": true
175 |         },
176 |         "chat_id": {
177 |           "name": "chat_id",
178 |           "type": "text",
179 |           "primaryKey": false,
180 |           "notNull": true
181 |         },
182 |         "role": {
183 |           "name": "role",
184 |           "type": "text",
185 |           "primaryKey": false,
186 |           "notNull": true
187 |         },
188 |         "parts": {
189 |           "name": "parts",
190 |           "type": "json",
191 |           "primaryKey": false,
192 |           "notNull": true
193 |         },
194 |         "created_at": {
195 |           "name": "created_at",
196 |           "type": "timestamp",
197 |           "primaryKey": false,
198 |           "notNull": true,
199 |           "default": "now()"
200 |         }
201 |       },
202 |       "indexes": {},
203 |       "foreignKeys": {
204 |         "messages_chat_id_chats_id_fk": {
205 |           "name": "messages_chat_id_chats_id_fk",
206 |           "tableFrom": "messages",
207 |           "tableTo": "chats",
208 |           "columnsFrom": [
209 |             "chat_id"
210 |           ],
211 |           "columnsTo": [
212 |             "id"
213 |           ],
214 |           "onDelete": "cascade",
215 |           "onUpdate": "no action"
216 |         }
217 |       },
218 |       "compositePrimaryKeys": {},
219 |       "uniqueConstraints": {},
220 |       "policies": {},
221 |       "checkConstraints": {},
222 |       "isRLSEnabled": false
223 |     },
224 |     "public.session": {
225 |       "name": "session",
226 |       "schema": "",
227 |       "columns": {
228 |         "id": {
229 |           "name": "id",
230 |           "type": "text",
231 |           "primaryKey": true,
232 |           "notNull": true
233 |         },
234 |         "sessionToken": {
235 |           "name": "sessionToken",
236 |           "type": "text",
237 |           "primaryKey": false,
238 |           "notNull": true
239 |         },
240 |         "userId": {
241 |           "name": "userId",
242 |           "type": "text",
243 |           "primaryKey": false,
244 |           "notNull": true
245 |         },
246 |         "expires": {
247 |           "name": "expires",
248 |           "type": "timestamp",
249 |           "primaryKey": false,
250 |           "notNull": true
251 |         },
252 |         "ipAddress": {
253 |           "name": "ipAddress",
254 |           "type": "text",
255 |           "primaryKey": false,
256 |           "notNull": false
257 |         },
258 |         "userAgent": {
259 |           "name": "userAgent",
260 |           "type": "text",
261 |           "primaryKey": false,
262 |           "notNull": false
263 |         },
264 |         "createdAt": {
265 |           "name": "createdAt",
266 |           "type": "timestamp",
267 |           "primaryKey": false,
268 |           "notNull": true,
269 |           "default": "now()"
270 |         },
271 |         "updatedAt": {
272 |           "name": "updatedAt",
273 |           "type": "timestamp",
274 |           "primaryKey": false,
275 |           "notNull": true,
276 |           "default": "now()"
277 |         }
278 |       },
279 |       "indexes": {},
280 |       "foreignKeys": {
281 |         "session_userId_user_id_fk": {
282 |           "name": "session_userId_user_id_fk",
283 |           "tableFrom": "session",
284 |           "tableTo": "user",
285 |           "columnsFrom": [
286 |             "userId"
287 |           ],
288 |           "columnsTo": [
289 |             "id"
290 |           ],
291 |           "onDelete": "cascade",
292 |           "onUpdate": "no action"
293 |         }
294 |       },
295 |       "compositePrimaryKeys": {},
296 |       "uniqueConstraints": {
297 |         "session_sessionToken_unique": {
298 |           "name": "session_sessionToken_unique",
299 |           "nullsNotDistinct": false,
300 |           "columns": [
301 |             "sessionToken"
302 |           ]
303 |         }
304 |       },
305 |       "policies": {},
306 |       "checkConstraints": {},
307 |       "isRLSEnabled": false
308 |     },
309 |     "public.user": {
310 |       "name": "user",
311 |       "schema": "",
312 |       "columns": {
313 |         "id": {
314 |           "name": "id",
315 |           "type": "text",
316 |           "primaryKey": true,
317 |           "notNull": true
318 |         },
319 |         "name": {
320 |           "name": "name",
321 |           "type": "text",
322 |           "primaryKey": false,
323 |           "notNull": false
324 |         },
325 |         "email": {
326 |           "name": "email",
327 |           "type": "text",
328 |           "primaryKey": false,
329 |           "notNull": true
330 |         },
331 |         "emailVerified": {
332 |           "name": "emailVerified",
333 |           "type": "boolean",
334 |           "primaryKey": false,
335 |           "notNull": false
336 |         },
337 |         "image": {
338 |           "name": "image",
339 |           "type": "text",
340 |           "primaryKey": false,
341 |           "notNull": false
342 |         },
343 |         "createdAt": {
344 |           "name": "createdAt",
345 |           "type": "timestamp",
346 |           "primaryKey": false,
347 |           "notNull": true,
348 |           "default": "now()"
349 |         },
350 |         "updatedAt": {
351 |           "name": "updatedAt",
352 |           "type": "timestamp",
353 |           "primaryKey": false,
354 |           "notNull": true,
355 |           "default": "now()"
356 |         }
357 |       },
358 |       "indexes": {},
359 |       "foreignKeys": {},
360 |       "compositePrimaryKeys": {},
361 |       "uniqueConstraints": {
362 |         "user_email_unique": {
363 |           "name": "user_email_unique",
364 |           "nullsNotDistinct": false,
365 |           "columns": [
366 |             "email"
367 |           ]
368 |         }
369 |       },
370 |       "policies": {},
371 |       "checkConstraints": {},
372 |       "isRLSEnabled": false
373 |     },
374 |     "public.verification": {
375 |       "name": "verification",
376 |       "schema": "",
377 |       "columns": {
378 |         "id": {
379 |           "name": "id",
380 |           "type": "text",
381 |           "primaryKey": true,
382 |           "notNull": true
383 |         },
384 |         "identifier": {
385 |           "name": "identifier",
386 |           "type": "text",
387 |           "primaryKey": false,
388 |           "notNull": true
389 |         },
390 |         "value": {
391 |           "name": "value",
392 |           "type": "text",
393 |           "primaryKey": false,
394 |           "notNull": true
395 |         },
396 |         "expiresAt": {
397 |           "name": "expiresAt",
398 |           "type": "timestamp",
399 |           "primaryKey": false,
400 |           "notNull": true
401 |         },
402 |         "createdAt": {
403 |           "name": "createdAt",
404 |           "type": "timestamp",
405 |           "primaryKey": false,
406 |           "notNull": true,
407 |           "default": "now()"
408 |         },
409 |         "updatedAt": {
410 |           "name": "updatedAt",
411 |           "type": "timestamp",
412 |           "primaryKey": false,
413 |           "notNull": true,
414 |           "default": "now()"
415 |         }
416 |       },
417 |       "indexes": {},
418 |       "foreignKeys": {},
419 |       "compositePrimaryKeys": {},
420 |       "uniqueConstraints": {},
421 |       "policies": {},
422 |       "checkConstraints": {},
423 |       "isRLSEnabled": false
424 |     }
425 |   },
426 |   "enums": {},
427 |   "schemas": {},
428 |   "sequences": {},
429 |   "roles": {},
430 |   "policies": {},
431 |   "views": {},
432 |   "_meta": {
433 |     "columns": {},
434 |     "schemas": {},
435 |     "tables": {}
436 |   }
437 | }
```

drizzle/meta/0013_snapshot.json
```
1 | {
2 |   "id": "4ef24ae6-b05a-4092-b1cb-82965b233c4e",
3 |   "prevId": "6350274c-a300-465c-9e77-b7b8f0ea0621",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.account": {
8 |       "name": "account",
9 |       "schema": "",
10 |       "columns": {
11 |         "id": {
12 |           "name": "id",
13 |           "type": "text",
14 |           "primaryKey": true,
15 |           "notNull": true
16 |         },
17 |         "userId": {
18 |           "name": "userId",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "providerId": {
24 |           "name": "providerId",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true
28 |         },
29 |         "accountId": {
30 |           "name": "accountId",
31 |           "type": "text",
32 |           "primaryKey": false,
33 |           "notNull": true
34 |         },
35 |         "providerType": {
36 |           "name": "providerType",
37 |           "type": "text",
38 |           "primaryKey": false,
39 |           "notNull": false
40 |         },
41 |         "access_token": {
42 |           "name": "access_token",
43 |           "type": "text",
44 |           "primaryKey": false,
45 |           "notNull": false
46 |         },
47 |         "refresh_token": {
48 |           "name": "refresh_token",
49 |           "type": "text",
50 |           "primaryKey": false,
51 |           "notNull": false
52 |         },
53 |         "access_token_expires_at": {
54 |           "name": "access_token_expires_at",
55 |           "type": "timestamp",
56 |           "primaryKey": false,
57 |           "notNull": false
58 |         },
59 |         "token_type": {
60 |           "name": "token_type",
61 |           "type": "text",
62 |           "primaryKey": false,
63 |           "notNull": false
64 |         },
65 |         "scope": {
66 |           "name": "scope",
67 |           "type": "text",
68 |           "primaryKey": false,
69 |           "notNull": false
70 |         },
71 |         "id_token": {
72 |           "name": "id_token",
73 |           "type": "text",
74 |           "primaryKey": false,
75 |           "notNull": false
76 |         },
77 |         "session_state": {
78 |           "name": "session_state",
79 |           "type": "text",
80 |           "primaryKey": false,
81 |           "notNull": false
82 |         },
83 |         "createdAt": {
84 |           "name": "createdAt",
85 |           "type": "timestamp",
86 |           "primaryKey": false,
87 |           "notNull": true,
88 |           "default": "now()"
89 |         },
90 |         "updatedAt": {
91 |           "name": "updatedAt",
92 |           "type": "timestamp",
93 |           "primaryKey": false,
94 |           "notNull": true,
95 |           "default": "now()"
96 |         }
97 |       },
98 |       "indexes": {},
99 |       "foreignKeys": {
100 |         "account_userId_user_id_fk": {
101 |           "name": "account_userId_user_id_fk",
102 |           "tableFrom": "account",
103 |           "tableTo": "user",
104 |           "columnsFrom": [
105 |             "userId"
106 |           ],
107 |           "columnsTo": [
108 |             "id"
109 |           ],
110 |           "onDelete": "cascade",
111 |           "onUpdate": "no action"
112 |         }
113 |       },
114 |       "compositePrimaryKeys": {},
115 |       "uniqueConstraints": {},
116 |       "policies": {},
117 |       "checkConstraints": {},
118 |       "isRLSEnabled": false
119 |     },
120 |     "public.chats": {
121 |       "name": "chats",
122 |       "schema": "",
123 |       "columns": {
124 |         "id": {
125 |           "name": "id",
126 |           "type": "text",
127 |           "primaryKey": true,
128 |           "notNull": true
129 |         },
130 |         "user_id": {
131 |           "name": "user_id",
132 |           "type": "text",
133 |           "primaryKey": false,
134 |           "notNull": true
135 |         },
136 |         "title": {
137 |           "name": "title",
138 |           "type": "text",
139 |           "primaryKey": false,
140 |           "notNull": true,
141 |           "default": "'New Chat'"
142 |         },
143 |         "created_at": {
144 |           "name": "created_at",
145 |           "type": "timestamp",
146 |           "primaryKey": false,
147 |           "notNull": true,
148 |           "default": "now()"
149 |         },
150 |         "updated_at": {
151 |           "name": "updated_at",
152 |           "type": "timestamp",
153 |           "primaryKey": false,
154 |           "notNull": true,
155 |           "default": "now()"
156 |         }
157 |       },
158 |       "indexes": {},
159 |       "foreignKeys": {},
160 |       "compositePrimaryKeys": {},
161 |       "uniqueConstraints": {},
162 |       "policies": {},
163 |       "checkConstraints": {},
164 |       "isRLSEnabled": false
165 |     },
166 |     "public.messages": {
167 |       "name": "messages",
168 |       "schema": "",
169 |       "columns": {
170 |         "id": {
171 |           "name": "id",
172 |           "type": "text",
173 |           "primaryKey": true,
174 |           "notNull": true
175 |         },
176 |         "chat_id": {
177 |           "name": "chat_id",
178 |           "type": "text",
179 |           "primaryKey": false,
180 |           "notNull": true
181 |         },
182 |         "role": {
183 |           "name": "role",
184 |           "type": "text",
185 |           "primaryKey": false,
186 |           "notNull": true
187 |         },
188 |         "parts": {
189 |           "name": "parts",
190 |           "type": "json",
191 |           "primaryKey": false,
192 |           "notNull": true
193 |         },
194 |         "created_at": {
195 |           "name": "created_at",
196 |           "type": "timestamp",
197 |           "primaryKey": false,
198 |           "notNull": true,
199 |           "default": "now()"
200 |         }
201 |       },
202 |       "indexes": {},
203 |       "foreignKeys": {
204 |         "messages_chat_id_chats_id_fk": {
205 |           "name": "messages_chat_id_chats_id_fk",
206 |           "tableFrom": "messages",
207 |           "tableTo": "chats",
208 |           "columnsFrom": [
209 |             "chat_id"
210 |           ],
211 |           "columnsTo": [
212 |             "id"
213 |           ],
214 |           "onDelete": "cascade",
215 |           "onUpdate": "no action"
216 |         }
217 |       },
218 |       "compositePrimaryKeys": {},
219 |       "uniqueConstraints": {},
220 |       "policies": {},
221 |       "checkConstraints": {},
222 |       "isRLSEnabled": false
223 |     },
224 |     "public.session": {
225 |       "name": "session",
226 |       "schema": "",
227 |       "columns": {
228 |         "id": {
229 |           "name": "id",
230 |           "type": "text",
231 |           "primaryKey": true,
232 |           "notNull": true
233 |         },
234 |         "sessionToken": {
235 |           "name": "sessionToken",
236 |           "type": "text",
237 |           "primaryKey": false,
238 |           "notNull": true
239 |         },
240 |         "userId": {
241 |           "name": "userId",
242 |           "type": "text",
243 |           "primaryKey": false,
244 |           "notNull": true
245 |         },
246 |         "expires": {
247 |           "name": "expires",
248 |           "type": "timestamp",
249 |           "primaryKey": false,
250 |           "notNull": true
251 |         },
252 |         "ipAddress": {
253 |           "name": "ipAddress",
254 |           "type": "text",
255 |           "primaryKey": false,
256 |           "notNull": false
257 |         },
258 |         "userAgent": {
259 |           "name": "userAgent",
260 |           "type": "text",
261 |           "primaryKey": false,
262 |           "notNull": false
263 |         },
264 |         "createdAt": {
265 |           "name": "createdAt",
266 |           "type": "timestamp",
267 |           "primaryKey": false,
268 |           "notNull": true,
269 |           "default": "now()"
270 |         },
271 |         "updatedAt": {
272 |           "name": "updatedAt",
273 |           "type": "timestamp",
274 |           "primaryKey": false,
275 |           "notNull": true,
276 |           "default": "now()"
277 |         }
278 |       },
279 |       "indexes": {},
280 |       "foreignKeys": {
281 |         "session_userId_user_id_fk": {
282 |           "name": "session_userId_user_id_fk",
283 |           "tableFrom": "session",
284 |           "tableTo": "user",
285 |           "columnsFrom": [
286 |             "userId"
287 |           ],
288 |           "columnsTo": [
289 |             "id"
290 |           ],
291 |           "onDelete": "cascade",
292 |           "onUpdate": "no action"
293 |         }
294 |       },
295 |       "compositePrimaryKeys": {},
296 |       "uniqueConstraints": {
297 |         "session_sessionToken_unique": {
298 |           "name": "session_sessionToken_unique",
299 |           "nullsNotDistinct": false,
300 |           "columns": [
301 |             "sessionToken"
302 |           ]
303 |         }
304 |       },
305 |       "policies": {},
306 |       "checkConstraints": {},
307 |       "isRLSEnabled": false
308 |     },
309 |     "public.user": {
310 |       "name": "user",
311 |       "schema": "",
312 |       "columns": {
313 |         "id": {
314 |           "name": "id",
315 |           "type": "text",
316 |           "primaryKey": true,
317 |           "notNull": true
318 |         },
319 |         "name": {
320 |           "name": "name",
321 |           "type": "text",
322 |           "primaryKey": false,
323 |           "notNull": false
324 |         },
325 |         "email": {
326 |           "name": "email",
327 |           "type": "text",
328 |           "primaryKey": false,
329 |           "notNull": true
330 |         },
331 |         "emailVerified": {
332 |           "name": "emailVerified",
333 |           "type": "boolean",
334 |           "primaryKey": false,
335 |           "notNull": false
336 |         },
337 |         "image": {
338 |           "name": "image",
339 |           "type": "text",
340 |           "primaryKey": false,
341 |           "notNull": false
342 |         },
343 |         "createdAt": {
344 |           "name": "createdAt",
345 |           "type": "timestamp",
346 |           "primaryKey": false,
347 |           "notNull": true,
348 |           "default": "now()"
349 |         },
350 |         "updatedAt": {
351 |           "name": "updatedAt",
352 |           "type": "timestamp",
353 |           "primaryKey": false,
354 |           "notNull": true,
355 |           "default": "now()"
356 |         }
357 |       },
358 |       "indexes": {},
359 |       "foreignKeys": {},
360 |       "compositePrimaryKeys": {},
361 |       "uniqueConstraints": {
362 |         "user_email_unique": {
363 |           "name": "user_email_unique",
364 |           "nullsNotDistinct": false,
365 |           "columns": [
366 |             "email"
367 |           ]
368 |         }
369 |       },
370 |       "policies": {},
371 |       "checkConstraints": {},
372 |       "isRLSEnabled": false
373 |     },
374 |     "public.verification": {
375 |       "name": "verification",
376 |       "schema": "",
377 |       "columns": {
378 |         "id": {
379 |           "name": "id",
380 |           "type": "text",
381 |           "primaryKey": true,
382 |           "notNull": true
383 |         },
384 |         "identifier": {
385 |           "name": "identifier",
386 |           "type": "text",
387 |           "primaryKey": false,
388 |           "notNull": true
389 |         },
390 |         "value": {
391 |           "name": "value",
392 |           "type": "text",
393 |           "primaryKey": false,
394 |           "notNull": true
395 |         },
396 |         "expiresAt": {
397 |           "name": "expiresAt",
398 |           "type": "timestamp",
399 |           "primaryKey": false,
400 |           "notNull": true
401 |         },
402 |         "createdAt": {
403 |           "name": "createdAt",
404 |           "type": "timestamp",
405 |           "primaryKey": false,
406 |           "notNull": true,
407 |           "default": "now()"
408 |         },
409 |         "updatedAt": {
410 |           "name": "updatedAt",
411 |           "type": "timestamp",
412 |           "primaryKey": false,
413 |           "notNull": true,
414 |           "default": "now()"
415 |         }
416 |       },
417 |       "indexes": {},
418 |       "foreignKeys": {},
419 |       "compositePrimaryKeys": {},
420 |       "uniqueConstraints": {},
421 |       "policies": {},
422 |       "checkConstraints": {},
423 |       "isRLSEnabled": false
424 |     }
425 |   },
426 |   "enums": {},
427 |   "schemas": {},
428 |   "sequences": {},
429 |   "roles": {},
430 |   "policies": {},
431 |   "views": {},
432 |   "_meta": {
433 |     "columns": {},
434 |     "schemas": {},
435 |     "tables": {}
436 |   }
437 | }
```

drizzle/meta/0014_snapshot.json
```
1 | {
2 |   "id": "d2513b02-d436-451c-bb84-36298852a621",
3 |   "prevId": "4ef24ae6-b05a-4092-b1cb-82965b233c4e",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.account": {
8 |       "name": "account",
9 |       "schema": "",
10 |       "columns": {
11 |         "id": {
12 |           "name": "id",
13 |           "type": "text",
14 |           "primaryKey": true,
15 |           "notNull": true
16 |         },
17 |         "userId": {
18 |           "name": "userId",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "providerId": {
24 |           "name": "providerId",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true
28 |         },
29 |         "accountId": {
30 |           "name": "accountId",
31 |           "type": "text",
32 |           "primaryKey": false,
33 |           "notNull": true
34 |         },
35 |         "providerType": {
36 |           "name": "providerType",
37 |           "type": "text",
38 |           "primaryKey": false,
39 |           "notNull": false
40 |         },
41 |         "access_token": {
42 |           "name": "access_token",
43 |           "type": "text",
44 |           "primaryKey": false,
45 |           "notNull": false
46 |         },
47 |         "refresh_token": {
48 |           "name": "refresh_token",
49 |           "type": "text",
50 |           "primaryKey": false,
51 |           "notNull": false
52 |         },
53 |         "access_token_expires_at": {
54 |           "name": "access_token_expires_at",
55 |           "type": "timestamp",
56 |           "primaryKey": false,
57 |           "notNull": false
58 |         },
59 |         "token_type": {
60 |           "name": "token_type",
61 |           "type": "text",
62 |           "primaryKey": false,
63 |           "notNull": false
64 |         },
65 |         "scope": {
66 |           "name": "scope",
67 |           "type": "text",
68 |           "primaryKey": false,
69 |           "notNull": false
70 |         },
71 |         "id_token": {
72 |           "name": "id_token",
73 |           "type": "text",
74 |           "primaryKey": false,
75 |           "notNull": false
76 |         },
77 |         "session_state": {
78 |           "name": "session_state",
79 |           "type": "text",
80 |           "primaryKey": false,
81 |           "notNull": false
82 |         },
83 |         "createdAt": {
84 |           "name": "createdAt",
85 |           "type": "timestamp",
86 |           "primaryKey": false,
87 |           "notNull": true,
88 |           "default": "now()"
89 |         },
90 |         "updatedAt": {
91 |           "name": "updatedAt",
92 |           "type": "timestamp",
93 |           "primaryKey": false,
94 |           "notNull": true,
95 |           "default": "now()"
96 |         }
97 |       },
98 |       "indexes": {},
99 |       "foreignKeys": {
100 |         "account_userId_user_id_fk": {
101 |           "name": "account_userId_user_id_fk",
102 |           "tableFrom": "account",
103 |           "tableTo": "user",
104 |           "columnsFrom": [
105 |             "userId"
106 |           ],
107 |           "columnsTo": [
108 |             "id"
109 |           ],
110 |           "onDelete": "cascade",
111 |           "onUpdate": "no action"
112 |         }
113 |       },
114 |       "compositePrimaryKeys": {},
115 |       "uniqueConstraints": {},
116 |       "policies": {},
117 |       "checkConstraints": {},
118 |       "isRLSEnabled": false
119 |     },
120 |     "public.chats": {
121 |       "name": "chats",
122 |       "schema": "",
123 |       "columns": {
124 |         "id": {
125 |           "name": "id",
126 |           "type": "text",
127 |           "primaryKey": true,
128 |           "notNull": true
129 |         },
130 |         "user_id": {
131 |           "name": "user_id",
132 |           "type": "text",
133 |           "primaryKey": false,
134 |           "notNull": true
135 |         },
136 |         "title": {
137 |           "name": "title",
138 |           "type": "text",
139 |           "primaryKey": false,
140 |           "notNull": true,
141 |           "default": "'New Chat'"
142 |         },
143 |         "created_at": {
144 |           "name": "created_at",
145 |           "type": "timestamp",
146 |           "primaryKey": false,
147 |           "notNull": true,
148 |           "default": "now()"
149 |         },
150 |         "updated_at": {
151 |           "name": "updated_at",
152 |           "type": "timestamp",
153 |           "primaryKey": false,
154 |           "notNull": true,
155 |           "default": "now()"
156 |         }
157 |       },
158 |       "indexes": {},
159 |       "foreignKeys": {},
160 |       "compositePrimaryKeys": {},
161 |       "uniqueConstraints": {},
162 |       "policies": {},
163 |       "checkConstraints": {},
164 |       "isRLSEnabled": false
165 |     },
166 |     "public.messages": {
167 |       "name": "messages",
168 |       "schema": "",
169 |       "columns": {
170 |         "id": {
171 |           "name": "id",
172 |           "type": "text",
173 |           "primaryKey": true,
174 |           "notNull": true
175 |         },
176 |         "chat_id": {
177 |           "name": "chat_id",
178 |           "type": "text",
179 |           "primaryKey": false,
180 |           "notNull": true
181 |         },
182 |         "role": {
183 |           "name": "role",
184 |           "type": "text",
185 |           "primaryKey": false,
186 |           "notNull": true
187 |         },
188 |         "parts": {
189 |           "name": "parts",
190 |           "type": "json",
191 |           "primaryKey": false,
192 |           "notNull": true
193 |         },
194 |         "created_at": {
195 |           "name": "created_at",
196 |           "type": "timestamp",
197 |           "primaryKey": false,
198 |           "notNull": true,
199 |           "default": "now()"
200 |         }
201 |       },
202 |       "indexes": {},
203 |       "foreignKeys": {
204 |         "messages_chat_id_chats_id_fk": {
205 |           "name": "messages_chat_id_chats_id_fk",
206 |           "tableFrom": "messages",
207 |           "tableTo": "chats",
208 |           "columnsFrom": [
209 |             "chat_id"
210 |           ],
211 |           "columnsTo": [
212 |             "id"
213 |           ],
214 |           "onDelete": "cascade",
215 |           "onUpdate": "no action"
216 |         }
217 |       },
218 |       "compositePrimaryKeys": {},
219 |       "uniqueConstraints": {},
220 |       "policies": {},
221 |       "checkConstraints": {},
222 |       "isRLSEnabled": false
223 |     },
224 |     "public.session": {
225 |       "name": "session",
226 |       "schema": "",
227 |       "columns": {
228 |         "id": {
229 |           "name": "id",
230 |           "type": "text",
231 |           "primaryKey": true,
232 |           "notNull": true
233 |         },
234 |         "sessionToken": {
235 |           "name": "sessionToken",
236 |           "type": "text",
237 |           "primaryKey": false,
238 |           "notNull": true
239 |         },
240 |         "userId": {
241 |           "name": "userId",
242 |           "type": "text",
243 |           "primaryKey": false,
244 |           "notNull": true
245 |         },
246 |         "expiresAt": {
247 |           "name": "expiresAt",
248 |           "type": "timestamp",
249 |           "primaryKey": false,
250 |           "notNull": true
251 |         },
252 |         "ipAddress": {
253 |           "name": "ipAddress",
254 |           "type": "text",
255 |           "primaryKey": false,
256 |           "notNull": false
257 |         },
258 |         "userAgent": {
259 |           "name": "userAgent",
260 |           "type": "text",
261 |           "primaryKey": false,
262 |           "notNull": false
263 |         },
264 |         "createdAt": {
265 |           "name": "createdAt",
266 |           "type": "timestamp",
267 |           "primaryKey": false,
268 |           "notNull": true,
269 |           "default": "now()"
270 |         },
271 |         "updatedAt": {
272 |           "name": "updatedAt",
273 |           "type": "timestamp",
274 |           "primaryKey": false,
275 |           "notNull": true,
276 |           "default": "now()"
277 |         }
278 |       },
279 |       "indexes": {},
280 |       "foreignKeys": {
281 |         "session_userId_user_id_fk": {
282 |           "name": "session_userId_user_id_fk",
283 |           "tableFrom": "session",
284 |           "tableTo": "user",
285 |           "columnsFrom": [
286 |             "userId"
287 |           ],
288 |           "columnsTo": [
289 |             "id"
290 |           ],
291 |           "onDelete": "cascade",
292 |           "onUpdate": "no action"
293 |         }
294 |       },
295 |       "compositePrimaryKeys": {},
296 |       "uniqueConstraints": {
297 |         "session_sessionToken_unique": {
298 |           "name": "session_sessionToken_unique",
299 |           "nullsNotDistinct": false,
300 |           "columns": [
301 |             "sessionToken"
302 |           ]
303 |         }
304 |       },
305 |       "policies": {},
306 |       "checkConstraints": {},
307 |       "isRLSEnabled": false
308 |     },
309 |     "public.user": {
310 |       "name": "user",
311 |       "schema": "",
312 |       "columns": {
313 |         "id": {
314 |           "name": "id",
315 |           "type": "text",
316 |           "primaryKey": true,
317 |           "notNull": true
318 |         },
319 |         "name": {
320 |           "name": "name",
321 |           "type": "text",
322 |           "primaryKey": false,
323 |           "notNull": false
324 |         },
325 |         "email": {
326 |           "name": "email",
327 |           "type": "text",
328 |           "primaryKey": false,
329 |           "notNull": true
330 |         },
331 |         "emailVerified": {
332 |           "name": "emailVerified",
333 |           "type": "boolean",
334 |           "primaryKey": false,
335 |           "notNull": false
336 |         },
337 |         "image": {
338 |           "name": "image",
339 |           "type": "text",
340 |           "primaryKey": false,
341 |           "notNull": false
342 |         },
343 |         "createdAt": {
344 |           "name": "createdAt",
345 |           "type": "timestamp",
346 |           "primaryKey": false,
347 |           "notNull": true,
348 |           "default": "now()"
349 |         },
350 |         "updatedAt": {
351 |           "name": "updatedAt",
352 |           "type": "timestamp",
353 |           "primaryKey": false,
354 |           "notNull": true,
355 |           "default": "now()"
356 |         }
357 |       },
358 |       "indexes": {},
359 |       "foreignKeys": {},
360 |       "compositePrimaryKeys": {},
361 |       "uniqueConstraints": {
362 |         "user_email_unique": {
363 |           "name": "user_email_unique",
364 |           "nullsNotDistinct": false,
365 |           "columns": [
366 |             "email"
367 |           ]
368 |         }
369 |       },
370 |       "policies": {},
371 |       "checkConstraints": {},
372 |       "isRLSEnabled": false
373 |     },
374 |     "public.verification": {
375 |       "name": "verification",
376 |       "schema": "",
377 |       "columns": {
378 |         "id": {
379 |           "name": "id",
380 |           "type": "text",
381 |           "primaryKey": true,
382 |           "notNull": true
383 |         },
384 |         "identifier": {
385 |           "name": "identifier",
386 |           "type": "text",
387 |           "primaryKey": false,
388 |           "notNull": true
389 |         },
390 |         "value": {
391 |           "name": "value",
392 |           "type": "text",
393 |           "primaryKey": false,
394 |           "notNull": true
395 |         },
396 |         "expiresAt": {
397 |           "name": "expiresAt",
398 |           "type": "timestamp",
399 |           "primaryKey": false,
400 |           "notNull": true
401 |         },
402 |         "createdAt": {
403 |           "name": "createdAt",
404 |           "type": "timestamp",
405 |           "primaryKey": false,
406 |           "notNull": true,
407 |           "default": "now()"
408 |         },
409 |         "updatedAt": {
410 |           "name": "updatedAt",
411 |           "type": "timestamp",
412 |           "primaryKey": false,
413 |           "notNull": true,
414 |           "default": "now()"
415 |         }
416 |       },
417 |       "indexes": {},
418 |       "foreignKeys": {},
419 |       "compositePrimaryKeys": {},
420 |       "uniqueConstraints": {},
421 |       "policies": {},
422 |       "checkConstraints": {},
423 |       "isRLSEnabled": false
424 |     }
425 |   },
426 |   "enums": {},
427 |   "schemas": {},
428 |   "sequences": {},
429 |   "roles": {},
430 |   "policies": {},
431 |   "views": {},
432 |   "_meta": {
433 |     "columns": {},
434 |     "schemas": {},
435 |     "tables": {}
436 |   }
437 | }
```

drizzle/meta/0015_snapshot.json
```
1 | {
2 |   "id": "2cd75274-edb9-4ed2-ae8e-ad0a5a73b276",
3 |   "prevId": "d2513b02-d436-451c-bb84-36298852a621",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.account": {
8 |       "name": "account",
9 |       "schema": "",
10 |       "columns": {
11 |         "id": {
12 |           "name": "id",
13 |           "type": "text",
14 |           "primaryKey": true,
15 |           "notNull": true
16 |         },
17 |         "userId": {
18 |           "name": "userId",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "providerId": {
24 |           "name": "providerId",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true
28 |         },
29 |         "accountId": {
30 |           "name": "accountId",
31 |           "type": "text",
32 |           "primaryKey": false,
33 |           "notNull": true
34 |         },
35 |         "providerType": {
36 |           "name": "providerType",
37 |           "type": "text",
38 |           "primaryKey": false,
39 |           "notNull": false
40 |         },
41 |         "access_token": {
42 |           "name": "access_token",
43 |           "type": "text",
44 |           "primaryKey": false,
45 |           "notNull": false
46 |         },
47 |         "refresh_token": {
48 |           "name": "refresh_token",
49 |           "type": "text",
50 |           "primaryKey": false,
51 |           "notNull": false
52 |         },
53 |         "access_token_expires_at": {
54 |           "name": "access_token_expires_at",
55 |           "type": "timestamp",
56 |           "primaryKey": false,
57 |           "notNull": false
58 |         },
59 |         "token_type": {
60 |           "name": "token_type",
61 |           "type": "text",
62 |           "primaryKey": false,
63 |           "notNull": false
64 |         },
65 |         "scope": {
66 |           "name": "scope",
67 |           "type": "text",
68 |           "primaryKey": false,
69 |           "notNull": false
70 |         },
71 |         "id_token": {
72 |           "name": "id_token",
73 |           "type": "text",
74 |           "primaryKey": false,
75 |           "notNull": false
76 |         },
77 |         "session_state": {
78 |           "name": "session_state",
79 |           "type": "text",
80 |           "primaryKey": false,
81 |           "notNull": false
82 |         },
83 |         "createdAt": {
84 |           "name": "createdAt",
85 |           "type": "timestamp",
86 |           "primaryKey": false,
87 |           "notNull": true,
88 |           "default": "now()"
89 |         },
90 |         "updatedAt": {
91 |           "name": "updatedAt",
92 |           "type": "timestamp",
93 |           "primaryKey": false,
94 |           "notNull": true,
95 |           "default": "now()"
96 |         }
97 |       },
98 |       "indexes": {},
99 |       "foreignKeys": {
100 |         "account_userId_user_id_fk": {
101 |           "name": "account_userId_user_id_fk",
102 |           "tableFrom": "account",
103 |           "tableTo": "user",
104 |           "columnsFrom": [
105 |             "userId"
106 |           ],
107 |           "columnsTo": [
108 |             "id"
109 |           ],
110 |           "onDelete": "cascade",
111 |           "onUpdate": "no action"
112 |         }
113 |       },
114 |       "compositePrimaryKeys": {},
115 |       "uniqueConstraints": {},
116 |       "policies": {},
117 |       "checkConstraints": {},
118 |       "isRLSEnabled": false
119 |     },
120 |     "public.chats": {
121 |       "name": "chats",
122 |       "schema": "",
123 |       "columns": {
124 |         "id": {
125 |           "name": "id",
126 |           "type": "text",
127 |           "primaryKey": true,
128 |           "notNull": true
129 |         },
130 |         "user_id": {
131 |           "name": "user_id",
132 |           "type": "text",
133 |           "primaryKey": false,
134 |           "notNull": true
135 |         },
136 |         "title": {
137 |           "name": "title",
138 |           "type": "text",
139 |           "primaryKey": false,
140 |           "notNull": true,
141 |           "default": "'New Chat'"
142 |         },
143 |         "created_at": {
144 |           "name": "created_at",
145 |           "type": "timestamp",
146 |           "primaryKey": false,
147 |           "notNull": true,
148 |           "default": "now()"
149 |         },
150 |         "updated_at": {
151 |           "name": "updated_at",
152 |           "type": "timestamp",
153 |           "primaryKey": false,
154 |           "notNull": true,
155 |           "default": "now()"
156 |         }
157 |       },
158 |       "indexes": {},
159 |       "foreignKeys": {},
160 |       "compositePrimaryKeys": {},
161 |       "uniqueConstraints": {},
162 |       "policies": {},
163 |       "checkConstraints": {},
164 |       "isRLSEnabled": false
165 |     },
166 |     "public.messages": {
167 |       "name": "messages",
168 |       "schema": "",
169 |       "columns": {
170 |         "id": {
171 |           "name": "id",
172 |           "type": "text",
173 |           "primaryKey": true,
174 |           "notNull": true
175 |         },
176 |         "chat_id": {
177 |           "name": "chat_id",
178 |           "type": "text",
179 |           "primaryKey": false,
180 |           "notNull": true
181 |         },
182 |         "role": {
183 |           "name": "role",
184 |           "type": "text",
185 |           "primaryKey": false,
186 |           "notNull": true
187 |         },
188 |         "parts": {
189 |           "name": "parts",
190 |           "type": "json",
191 |           "primaryKey": false,
192 |           "notNull": true
193 |         },
194 |         "created_at": {
195 |           "name": "created_at",
196 |           "type": "timestamp",
197 |           "primaryKey": false,
198 |           "notNull": true,
199 |           "default": "now()"
200 |         }
201 |       },
202 |       "indexes": {},
203 |       "foreignKeys": {
204 |         "messages_chat_id_chats_id_fk": {
205 |           "name": "messages_chat_id_chats_id_fk",
206 |           "tableFrom": "messages",
207 |           "tableTo": "chats",
208 |           "columnsFrom": [
209 |             "chat_id"
210 |           ],
211 |           "columnsTo": [
212 |             "id"
213 |           ],
214 |           "onDelete": "cascade",
215 |           "onUpdate": "no action"
216 |         }
217 |       },
218 |       "compositePrimaryKeys": {},
219 |       "uniqueConstraints": {},
220 |       "policies": {},
221 |       "checkConstraints": {},
222 |       "isRLSEnabled": false
223 |     },
224 |     "public.session": {
225 |       "name": "session",
226 |       "schema": "",
227 |       "columns": {
228 |         "id": {
229 |           "name": "id",
230 |           "type": "text",
231 |           "primaryKey": true,
232 |           "notNull": true
233 |         },
234 |         "sessionToken": {
235 |           "name": "sessionToken",
236 |           "type": "text",
237 |           "primaryKey": false,
238 |           "notNull": true
239 |         },
240 |         "token": {
241 |           "name": "token",
242 |           "type": "text",
243 |           "primaryKey": false,
244 |           "notNull": true
245 |         },
246 |         "userId": {
247 |           "name": "userId",
248 |           "type": "text",
249 |           "primaryKey": false,
250 |           "notNull": true
251 |         },
252 |         "expiresAt": {
253 |           "name": "expiresAt",
254 |           "type": "timestamp",
255 |           "primaryKey": false,
256 |           "notNull": true
257 |         },
258 |         "ipAddress": {
259 |           "name": "ipAddress",
260 |           "type": "text",
261 |           "primaryKey": false,
262 |           "notNull": false
263 |         },
264 |         "userAgent": {
265 |           "name": "userAgent",
266 |           "type": "text",
267 |           "primaryKey": false,
268 |           "notNull": false
269 |         },
270 |         "createdAt": {
271 |           "name": "createdAt",
272 |           "type": "timestamp",
273 |           "primaryKey": false,
274 |           "notNull": true,
275 |           "default": "now()"
276 |         },
277 |         "updatedAt": {
278 |           "name": "updatedAt",
279 |           "type": "timestamp",
280 |           "primaryKey": false,
281 |           "notNull": true,
282 |           "default": "now()"
283 |         }
284 |       },
285 |       "indexes": {},
286 |       "foreignKeys": {
287 |         "session_userId_user_id_fk": {
288 |           "name": "session_userId_user_id_fk",
289 |           "tableFrom": "session",
290 |           "tableTo": "user",
291 |           "columnsFrom": [
292 |             "userId"
293 |           ],
294 |           "columnsTo": [
295 |             "id"
296 |           ],
297 |           "onDelete": "cascade",
298 |           "onUpdate": "no action"
299 |         }
300 |       },
301 |       "compositePrimaryKeys": {},
302 |       "uniqueConstraints": {
303 |         "session_sessionToken_unique": {
304 |           "name": "session_sessionToken_unique",
305 |           "nullsNotDistinct": false,
306 |           "columns": [
307 |             "sessionToken"
308 |           ]
309 |         }
310 |       },
311 |       "policies": {},
312 |       "checkConstraints": {},
313 |       "isRLSEnabled": false
314 |     },
315 |     "public.user": {
316 |       "name": "user",
317 |       "schema": "",
318 |       "columns": {
319 |         "id": {
320 |           "name": "id",
321 |           "type": "text",
322 |           "primaryKey": true,
323 |           "notNull": true
324 |         },
325 |         "name": {
326 |           "name": "name",
327 |           "type": "text",
328 |           "primaryKey": false,
329 |           "notNull": false
330 |         },
331 |         "email": {
332 |           "name": "email",
333 |           "type": "text",
334 |           "primaryKey": false,
335 |           "notNull": true
336 |         },
337 |         "emailVerified": {
338 |           "name": "emailVerified",
339 |           "type": "boolean",
340 |           "primaryKey": false,
341 |           "notNull": false
342 |         },
343 |         "image": {
344 |           "name": "image",
345 |           "type": "text",
346 |           "primaryKey": false,
347 |           "notNull": false
348 |         },
349 |         "createdAt": {
350 |           "name": "createdAt",
351 |           "type": "timestamp",
352 |           "primaryKey": false,
353 |           "notNull": true,
354 |           "default": "now()"
355 |         },
356 |         "updatedAt": {
357 |           "name": "updatedAt",
358 |           "type": "timestamp",
359 |           "primaryKey": false,
360 |           "notNull": true,
361 |           "default": "now()"
362 |         }
363 |       },
364 |       "indexes": {},
365 |       "foreignKeys": {},
366 |       "compositePrimaryKeys": {},
367 |       "uniqueConstraints": {
368 |         "user_email_unique": {
369 |           "name": "user_email_unique",
370 |           "nullsNotDistinct": false,
371 |           "columns": [
372 |             "email"
373 |           ]
374 |         }
375 |       },
376 |       "policies": {},
377 |       "checkConstraints": {},
378 |       "isRLSEnabled": false
379 |     },
380 |     "public.verification": {
381 |       "name": "verification",
382 |       "schema": "",
383 |       "columns": {
384 |         "id": {
385 |           "name": "id",
386 |           "type": "text",
387 |           "primaryKey": true,
388 |           "notNull": true
389 |         },
390 |         "identifier": {
391 |           "name": "identifier",
392 |           "type": "text",
393 |           "primaryKey": false,
394 |           "notNull": true
395 |         },
396 |         "value": {
397 |           "name": "value",
398 |           "type": "text",
399 |           "primaryKey": false,
400 |           "notNull": true
401 |         },
402 |         "expiresAt": {
403 |           "name": "expiresAt",
404 |           "type": "timestamp",
405 |           "primaryKey": false,
406 |           "notNull": true
407 |         },
408 |         "createdAt": {
409 |           "name": "createdAt",
410 |           "type": "timestamp",
411 |           "primaryKey": false,
412 |           "notNull": true,
413 |           "default": "now()"
414 |         },
415 |         "updatedAt": {
416 |           "name": "updatedAt",
417 |           "type": "timestamp",
418 |           "primaryKey": false,
419 |           "notNull": true,
420 |           "default": "now()"
421 |         }
422 |       },
423 |       "indexes": {},
424 |       "foreignKeys": {},
425 |       "compositePrimaryKeys": {},
426 |       "uniqueConstraints": {},
427 |       "policies": {},
428 |       "checkConstraints": {},
429 |       "isRLSEnabled": false
430 |     }
431 |   },
432 |   "enums": {},
433 |   "schemas": {},
434 |   "sequences": {},
435 |   "roles": {},
436 |   "policies": {},
437 |   "views": {},
438 |   "_meta": {
439 |     "columns": {},
440 |     "schemas": {},
441 |     "tables": {}
442 |   }
443 | }
```

drizzle/meta/0016_snapshot.json
```
1 | {
2 |   "id": "da03ebe3-30b6-465a-bb23-18f70f0e8cb2",
3 |   "prevId": "2cd75274-edb9-4ed2-ae8e-ad0a5a73b276",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.account": {
8 |       "name": "account",
9 |       "schema": "",
10 |       "columns": {
11 |         "id": {
12 |           "name": "id",
13 |           "type": "text",
14 |           "primaryKey": true,
15 |           "notNull": true
16 |         },
17 |         "userId": {
18 |           "name": "userId",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "providerId": {
24 |           "name": "providerId",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true
28 |         },
29 |         "accountId": {
30 |           "name": "accountId",
31 |           "type": "text",
32 |           "primaryKey": false,
33 |           "notNull": true
34 |         },
35 |         "providerType": {
36 |           "name": "providerType",
37 |           "type": "text",
38 |           "primaryKey": false,
39 |           "notNull": false
40 |         },
41 |         "access_token": {
42 |           "name": "access_token",
43 |           "type": "text",
44 |           "primaryKey": false,
45 |           "notNull": false
46 |         },
47 |         "refresh_token": {
48 |           "name": "refresh_token",
49 |           "type": "text",
50 |           "primaryKey": false,
51 |           "notNull": false
52 |         },
53 |         "access_token_expires_at": {
54 |           "name": "access_token_expires_at",
55 |           "type": "timestamp",
56 |           "primaryKey": false,
57 |           "notNull": false
58 |         },
59 |         "token_type": {
60 |           "name": "token_type",
61 |           "type": "text",
62 |           "primaryKey": false,
63 |           "notNull": false
64 |         },
65 |         "scope": {
66 |           "name": "scope",
67 |           "type": "text",
68 |           "primaryKey": false,
69 |           "notNull": false
70 |         },
71 |         "id_token": {
72 |           "name": "id_token",
73 |           "type": "text",
74 |           "primaryKey": false,
75 |           "notNull": false
76 |         },
77 |         "session_state": {
78 |           "name": "session_state",
79 |           "type": "text",
80 |           "primaryKey": false,
81 |           "notNull": false
82 |         },
83 |         "createdAt": {
84 |           "name": "createdAt",
85 |           "type": "timestamp",
86 |           "primaryKey": false,
87 |           "notNull": true,
88 |           "default": "now()"
89 |         },
90 |         "updatedAt": {
91 |           "name": "updatedAt",
92 |           "type": "timestamp",
93 |           "primaryKey": false,
94 |           "notNull": true,
95 |           "default": "now()"
96 |         }
97 |       },
98 |       "indexes": {},
99 |       "foreignKeys": {
100 |         "account_userId_user_id_fk": {
101 |           "name": "account_userId_user_id_fk",
102 |           "tableFrom": "account",
103 |           "tableTo": "user",
104 |           "columnsFrom": [
105 |             "userId"
106 |           ],
107 |           "columnsTo": [
108 |             "id"
109 |           ],
110 |           "onDelete": "cascade",
111 |           "onUpdate": "no action"
112 |         }
113 |       },
114 |       "compositePrimaryKeys": {},
115 |       "uniqueConstraints": {},
116 |       "policies": {},
117 |       "checkConstraints": {},
118 |       "isRLSEnabled": false
119 |     },
120 |     "public.chats": {
121 |       "name": "chats",
122 |       "schema": "",
123 |       "columns": {
124 |         "id": {
125 |           "name": "id",
126 |           "type": "text",
127 |           "primaryKey": true,
128 |           "notNull": true
129 |         },
130 |         "user_id": {
131 |           "name": "user_id",
132 |           "type": "text",
133 |           "primaryKey": false,
134 |           "notNull": true
135 |         },
136 |         "title": {
137 |           "name": "title",
138 |           "type": "text",
139 |           "primaryKey": false,
140 |           "notNull": true,
141 |           "default": "'New Chat'"
142 |         },
143 |         "created_at": {
144 |           "name": "created_at",
145 |           "type": "timestamp",
146 |           "primaryKey": false,
147 |           "notNull": true,
148 |           "default": "now()"
149 |         },
150 |         "updated_at": {
151 |           "name": "updated_at",
152 |           "type": "timestamp",
153 |           "primaryKey": false,
154 |           "notNull": true,
155 |           "default": "now()"
156 |         }
157 |       },
158 |       "indexes": {},
159 |       "foreignKeys": {},
160 |       "compositePrimaryKeys": {},
161 |       "uniqueConstraints": {},
162 |       "policies": {},
163 |       "checkConstraints": {},
164 |       "isRLSEnabled": false
165 |     },
166 |     "public.messages": {
167 |       "name": "messages",
168 |       "schema": "",
169 |       "columns": {
170 |         "id": {
171 |           "name": "id",
172 |           "type": "text",
173 |           "primaryKey": true,
174 |           "notNull": true
175 |         },
176 |         "chat_id": {
177 |           "name": "chat_id",
178 |           "type": "text",
179 |           "primaryKey": false,
180 |           "notNull": true
181 |         },
182 |         "role": {
183 |           "name": "role",
184 |           "type": "text",
185 |           "primaryKey": false,
186 |           "notNull": true
187 |         },
188 |         "parts": {
189 |           "name": "parts",
190 |           "type": "json",
191 |           "primaryKey": false,
192 |           "notNull": true
193 |         },
194 |         "created_at": {
195 |           "name": "created_at",
196 |           "type": "timestamp",
197 |           "primaryKey": false,
198 |           "notNull": true,
199 |           "default": "now()"
200 |         }
201 |       },
202 |       "indexes": {},
203 |       "foreignKeys": {
204 |         "messages_chat_id_chats_id_fk": {
205 |           "name": "messages_chat_id_chats_id_fk",
206 |           "tableFrom": "messages",
207 |           "tableTo": "chats",
208 |           "columnsFrom": [
209 |             "chat_id"
210 |           ],
211 |           "columnsTo": [
212 |             "id"
213 |           ],
214 |           "onDelete": "cascade",
215 |           "onUpdate": "no action"
216 |         }
217 |       },
218 |       "compositePrimaryKeys": {},
219 |       "uniqueConstraints": {},
220 |       "policies": {},
221 |       "checkConstraints": {},
222 |       "isRLSEnabled": false
223 |     },
224 |     "public.session": {
225 |       "name": "session",
226 |       "schema": "",
227 |       "columns": {
228 |         "id": {
229 |           "name": "id",
230 |           "type": "text",
231 |           "primaryKey": true,
232 |           "notNull": true
233 |         },
234 |         "sessionToken": {
235 |           "name": "sessionToken",
236 |           "type": "text",
237 |           "primaryKey": false,
238 |           "notNull": true
239 |         },
240 |         "userId": {
241 |           "name": "userId",
242 |           "type": "text",
243 |           "primaryKey": false,
244 |           "notNull": true
245 |         },
246 |         "expiresAt": {
247 |           "name": "expiresAt",
248 |           "type": "timestamp",
249 |           "primaryKey": false,
250 |           "notNull": true
251 |         },
252 |         "ipAddress": {
253 |           "name": "ipAddress",
254 |           "type": "text",
255 |           "primaryKey": false,
256 |           "notNull": false
257 |         },
258 |         "userAgent": {
259 |           "name": "userAgent",
260 |           "type": "text",
261 |           "primaryKey": false,
262 |           "notNull": false
263 |         },
264 |         "createdAt": {
265 |           "name": "createdAt",
266 |           "type": "timestamp",
267 |           "primaryKey": false,
268 |           "notNull": true,
269 |           "default": "now()"
270 |         },
271 |         "updatedAt": {
272 |           "name": "updatedAt",
273 |           "type": "timestamp",
274 |           "primaryKey": false,
275 |           "notNull": true,
276 |           "default": "now()"
277 |         }
278 |       },
279 |       "indexes": {},
280 |       "foreignKeys": {
281 |         "session_userId_user_id_fk": {
282 |           "name": "session_userId_user_id_fk",
283 |           "tableFrom": "session",
284 |           "tableTo": "user",
285 |           "columnsFrom": [
286 |             "userId"
287 |           ],
288 |           "columnsTo": [
289 |             "id"
290 |           ],
291 |           "onDelete": "cascade",
292 |           "onUpdate": "no action"
293 |         }
294 |       },
295 |       "compositePrimaryKeys": {},
296 |       "uniqueConstraints": {
297 |         "session_sessionToken_unique": {
298 |           "name": "session_sessionToken_unique",
299 |           "nullsNotDistinct": false,
300 |           "columns": [
301 |             "sessionToken"
302 |           ]
303 |         }
304 |       },
305 |       "policies": {},
306 |       "checkConstraints": {},
307 |       "isRLSEnabled": false
308 |     },
309 |     "public.user": {
310 |       "name": "user",
311 |       "schema": "",
312 |       "columns": {
313 |         "id": {
314 |           "name": "id",
315 |           "type": "text",
316 |           "primaryKey": true,
317 |           "notNull": true
318 |         },
319 |         "name": {
320 |           "name": "name",
321 |           "type": "text",
322 |           "primaryKey": false,
323 |           "notNull": false
324 |         },
325 |         "email": {
326 |           "name": "email",
327 |           "type": "text",
328 |           "primaryKey": false,
329 |           "notNull": true
330 |         },
331 |         "emailVerified": {
332 |           "name": "emailVerified",
333 |           "type": "boolean",
334 |           "primaryKey": false,
335 |           "notNull": false
336 |         },
337 |         "image": {
338 |           "name": "image",
339 |           "type": "text",
340 |           "primaryKey": false,
341 |           "notNull": false
342 |         },
343 |         "createdAt": {
344 |           "name": "createdAt",
345 |           "type": "timestamp",
346 |           "primaryKey": false,
347 |           "notNull": true,
348 |           "default": "now()"
349 |         },
350 |         "updatedAt": {
351 |           "name": "updatedAt",
352 |           "type": "timestamp",
353 |           "primaryKey": false,
354 |           "notNull": true,
355 |           "default": "now()"
356 |         }
357 |       },
358 |       "indexes": {},
359 |       "foreignKeys": {},
360 |       "compositePrimaryKeys": {},
361 |       "uniqueConstraints": {
362 |         "user_email_unique": {
363 |           "name": "user_email_unique",
364 |           "nullsNotDistinct": false,
365 |           "columns": [
366 |             "email"
367 |           ]
368 |         }
369 |       },
370 |       "policies": {},
371 |       "checkConstraints": {},
372 |       "isRLSEnabled": false
373 |     },
374 |     "public.verification": {
375 |       "name": "verification",
376 |       "schema": "",
377 |       "columns": {
378 |         "id": {
379 |           "name": "id",
380 |           "type": "text",
381 |           "primaryKey": true,
382 |           "notNull": true
383 |         },
384 |         "identifier": {
385 |           "name": "identifier",
386 |           "type": "text",
387 |           "primaryKey": false,
388 |           "notNull": true
389 |         },
390 |         "value": {
391 |           "name": "value",
392 |           "type": "text",
393 |           "primaryKey": false,
394 |           "notNull": true
395 |         },
396 |         "expiresAt": {
397 |           "name": "expiresAt",
398 |           "type": "timestamp",
399 |           "primaryKey": false,
400 |           "notNull": true
401 |         },
402 |         "createdAt": {
403 |           "name": "createdAt",
404 |           "type": "timestamp",
405 |           "primaryKey": false,
406 |           "notNull": true,
407 |           "default": "now()"
408 |         },
409 |         "updatedAt": {
410 |           "name": "updatedAt",
411 |           "type": "timestamp",
412 |           "primaryKey": false,
413 |           "notNull": true,
414 |           "default": "now()"
415 |         }
416 |       },
417 |       "indexes": {},
418 |       "foreignKeys": {},
419 |       "compositePrimaryKeys": {},
420 |       "uniqueConstraints": {},
421 |       "policies": {},
422 |       "checkConstraints": {},
423 |       "isRLSEnabled": false
424 |     }
425 |   },
426 |   "enums": {},
427 |   "schemas": {},
428 |   "sequences": {},
429 |   "roles": {},
430 |   "policies": {},
431 |   "views": {},
432 |   "_meta": {
433 |     "columns": {},
434 |     "schemas": {},
435 |     "tables": {}
436 |   }
437 | }
```

drizzle/meta/0017_snapshot.json
```
1 | {
2 |   "id": "61e759b3-9bac-47fe-9476-3811e7d3cb98",
3 |   "prevId": "da03ebe3-30b6-465a-bb23-18f70f0e8cb2",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.account": {
8 |       "name": "account",
9 |       "schema": "",
10 |       "columns": {
11 |         "id": {
12 |           "name": "id",
13 |           "type": "text",
14 |           "primaryKey": true,
15 |           "notNull": true
16 |         },
17 |         "userId": {
18 |           "name": "userId",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "providerId": {
24 |           "name": "providerId",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true
28 |         },
29 |         "accountId": {
30 |           "name": "accountId",
31 |           "type": "text",
32 |           "primaryKey": false,
33 |           "notNull": true
34 |         },
35 |         "providerType": {
36 |           "name": "providerType",
37 |           "type": "text",
38 |           "primaryKey": false,
39 |           "notNull": false
40 |         },
41 |         "access_token": {
42 |           "name": "access_token",
43 |           "type": "text",
44 |           "primaryKey": false,
45 |           "notNull": false
46 |         },
47 |         "refresh_token": {
48 |           "name": "refresh_token",
49 |           "type": "text",
50 |           "primaryKey": false,
51 |           "notNull": false
52 |         },
53 |         "access_token_expires_at": {
54 |           "name": "access_token_expires_at",
55 |           "type": "timestamp",
56 |           "primaryKey": false,
57 |           "notNull": false
58 |         },
59 |         "token_type": {
60 |           "name": "token_type",
61 |           "type": "text",
62 |           "primaryKey": false,
63 |           "notNull": false
64 |         },
65 |         "scope": {
66 |           "name": "scope",
67 |           "type": "text",
68 |           "primaryKey": false,
69 |           "notNull": false
70 |         },
71 |         "id_token": {
72 |           "name": "id_token",
73 |           "type": "text",
74 |           "primaryKey": false,
75 |           "notNull": false
76 |         },
77 |         "session_state": {
78 |           "name": "session_state",
79 |           "type": "text",
80 |           "primaryKey": false,
81 |           "notNull": false
82 |         },
83 |         "createdAt": {
84 |           "name": "createdAt",
85 |           "type": "timestamp",
86 |           "primaryKey": false,
87 |           "notNull": true,
88 |           "default": "now()"
89 |         },
90 |         "updatedAt": {
91 |           "name": "updatedAt",
92 |           "type": "timestamp",
93 |           "primaryKey": false,
94 |           "notNull": true,
95 |           "default": "now()"
96 |         }
97 |       },
98 |       "indexes": {},
99 |       "foreignKeys": {
100 |         "account_userId_user_id_fk": {
101 |           "name": "account_userId_user_id_fk",
102 |           "tableFrom": "account",
103 |           "tableTo": "user",
104 |           "columnsFrom": [
105 |             "userId"
106 |           ],
107 |           "columnsTo": [
108 |             "id"
109 |           ],
110 |           "onDelete": "cascade",
111 |           "onUpdate": "no action"
112 |         }
113 |       },
114 |       "compositePrimaryKeys": {},
115 |       "uniqueConstraints": {},
116 |       "policies": {},
117 |       "checkConstraints": {},
118 |       "isRLSEnabled": false
119 |     },
120 |     "public.chats": {
121 |       "name": "chats",
122 |       "schema": "",
123 |       "columns": {
124 |         "id": {
125 |           "name": "id",
126 |           "type": "text",
127 |           "primaryKey": true,
128 |           "notNull": true
129 |         },
130 |         "user_id": {
131 |           "name": "user_id",
132 |           "type": "text",
133 |           "primaryKey": false,
134 |           "notNull": true
135 |         },
136 |         "title": {
137 |           "name": "title",
138 |           "type": "text",
139 |           "primaryKey": false,
140 |           "notNull": true,
141 |           "default": "'New Chat'"
142 |         },
143 |         "created_at": {
144 |           "name": "created_at",
145 |           "type": "timestamp",
146 |           "primaryKey": false,
147 |           "notNull": true,
148 |           "default": "now()"
149 |         },
150 |         "updated_at": {
151 |           "name": "updated_at",
152 |           "type": "timestamp",
153 |           "primaryKey": false,
154 |           "notNull": true,
155 |           "default": "now()"
156 |         }
157 |       },
158 |       "indexes": {},
159 |       "foreignKeys": {},
160 |       "compositePrimaryKeys": {},
161 |       "uniqueConstraints": {},
162 |       "policies": {},
163 |       "checkConstraints": {},
164 |       "isRLSEnabled": false
165 |     },
166 |     "public.messages": {
167 |       "name": "messages",
168 |       "schema": "",
169 |       "columns": {
170 |         "id": {
171 |           "name": "id",
172 |           "type": "text",
173 |           "primaryKey": true,
174 |           "notNull": true
175 |         },
176 |         "chat_id": {
177 |           "name": "chat_id",
178 |           "type": "text",
179 |           "primaryKey": false,
180 |           "notNull": true
181 |         },
182 |         "role": {
183 |           "name": "role",
184 |           "type": "text",
185 |           "primaryKey": false,
186 |           "notNull": true
187 |         },
188 |         "parts": {
189 |           "name": "parts",
190 |           "type": "json",
191 |           "primaryKey": false,
192 |           "notNull": true
193 |         },
194 |         "has_web_search": {
195 |           "name": "has_web_search",
196 |           "type": "boolean",
197 |           "primaryKey": false,
198 |           "notNull": false,
199 |           "default": false
200 |         },
201 |         "web_search_context_size": {
202 |           "name": "web_search_context_size",
203 |           "type": "text",
204 |           "primaryKey": false,
205 |           "notNull": false,
206 |           "default": "'medium'"
207 |         },
208 |         "created_at": {
209 |           "name": "created_at",
210 |           "type": "timestamp",
211 |           "primaryKey": false,
212 |           "notNull": true,
213 |           "default": "now()"
214 |         }
215 |       },
216 |       "indexes": {},
217 |       "foreignKeys": {
218 |         "messages_chat_id_chats_id_fk": {
219 |           "name": "messages_chat_id_chats_id_fk",
220 |           "tableFrom": "messages",
221 |           "tableTo": "chats",
222 |           "columnsFrom": [
223 |             "chat_id"
224 |           ],
225 |           "columnsTo": [
226 |             "id"
227 |           ],
228 |           "onDelete": "cascade",
229 |           "onUpdate": "no action"
230 |         }
231 |       },
232 |       "compositePrimaryKeys": {},
233 |       "uniqueConstraints": {},
234 |       "policies": {},
235 |       "checkConstraints": {},
236 |       "isRLSEnabled": false
237 |     },
238 |     "public.session": {
239 |       "name": "session",
240 |       "schema": "",
241 |       "columns": {
242 |         "id": {
243 |           "name": "id",
244 |           "type": "text",
245 |           "primaryKey": true,
246 |           "notNull": true
247 |         },
248 |         "sessionToken": {
249 |           "name": "sessionToken",
250 |           "type": "text",
251 |           "primaryKey": false,
252 |           "notNull": true
253 |         },
254 |         "userId": {
255 |           "name": "userId",
256 |           "type": "text",
257 |           "primaryKey": false,
258 |           "notNull": true
259 |         },
260 |         "expiresAt": {
261 |           "name": "expiresAt",
262 |           "type": "timestamp",
263 |           "primaryKey": false,
264 |           "notNull": true
265 |         },
266 |         "ipAddress": {
267 |           "name": "ipAddress",
268 |           "type": "text",
269 |           "primaryKey": false,
270 |           "notNull": false
271 |         },
272 |         "userAgent": {
273 |           "name": "userAgent",
274 |           "type": "text",
275 |           "primaryKey": false,
276 |           "notNull": false
277 |         },
278 |         "createdAt": {
279 |           "name": "createdAt",
280 |           "type": "timestamp",
281 |           "primaryKey": false,
282 |           "notNull": true,
283 |           "default": "now()"
284 |         },
285 |         "updatedAt": {
286 |           "name": "updatedAt",
287 |           "type": "timestamp",
288 |           "primaryKey": false,
289 |           "notNull": true,
290 |           "default": "now()"
291 |         }
292 |       },
293 |       "indexes": {},
294 |       "foreignKeys": {
295 |         "session_userId_user_id_fk": {
296 |           "name": "session_userId_user_id_fk",
297 |           "tableFrom": "session",
298 |           "tableTo": "user",
299 |           "columnsFrom": [
300 |             "userId"
301 |           ],
302 |           "columnsTo": [
303 |             "id"
304 |           ],
305 |           "onDelete": "cascade",
306 |           "onUpdate": "no action"
307 |         }
308 |       },
309 |       "compositePrimaryKeys": {},
310 |       "uniqueConstraints": {
311 |         "session_sessionToken_unique": {
312 |           "name": "session_sessionToken_unique",
313 |           "nullsNotDistinct": false,
314 |           "columns": [
315 |             "sessionToken"
316 |           ]
317 |         }
318 |       },
319 |       "policies": {},
320 |       "checkConstraints": {},
321 |       "isRLSEnabled": false
322 |     },
323 |     "public.user": {
324 |       "name": "user",
325 |       "schema": "",
326 |       "columns": {
327 |         "id": {
328 |           "name": "id",
329 |           "type": "text",
330 |           "primaryKey": true,
331 |           "notNull": true
332 |         },
333 |         "name": {
334 |           "name": "name",
335 |           "type": "text",
336 |           "primaryKey": false,
337 |           "notNull": false
338 |         },
339 |         "email": {
340 |           "name": "email",
341 |           "type": "text",
342 |           "primaryKey": false,
343 |           "notNull": true
344 |         },
345 |         "emailVerified": {
346 |           "name": "emailVerified",
347 |           "type": "boolean",
348 |           "primaryKey": false,
349 |           "notNull": false
350 |         },
351 |         "image": {
352 |           "name": "image",
353 |           "type": "text",
354 |           "primaryKey": false,
355 |           "notNull": false
356 |         },
357 |         "createdAt": {
358 |           "name": "createdAt",
359 |           "type": "timestamp",
360 |           "primaryKey": false,
361 |           "notNull": true,
362 |           "default": "now()"
363 |         },
364 |         "updatedAt": {
365 |           "name": "updatedAt",
366 |           "type": "timestamp",
367 |           "primaryKey": false,
368 |           "notNull": true,
369 |           "default": "now()"
370 |         }
371 |       },
372 |       "indexes": {},
373 |       "foreignKeys": {},
374 |       "compositePrimaryKeys": {},
375 |       "uniqueConstraints": {
376 |         "user_email_unique": {
377 |           "name": "user_email_unique",
378 |           "nullsNotDistinct": false,
379 |           "columns": [
380 |             "email"
381 |           ]
382 |         }
383 |       },
384 |       "policies": {},
385 |       "checkConstraints": {},
386 |       "isRLSEnabled": false
387 |     },
388 |     "public.verification": {
389 |       "name": "verification",
390 |       "schema": "",
391 |       "columns": {
392 |         "id": {
393 |           "name": "id",
394 |           "type": "text",
395 |           "primaryKey": true,
396 |           "notNull": true
397 |         },
398 |         "identifier": {
399 |           "name": "identifier",
400 |           "type": "text",
401 |           "primaryKey": false,
402 |           "notNull": true
403 |         },
404 |         "value": {
405 |           "name": "value",
406 |           "type": "text",
407 |           "primaryKey": false,
408 |           "notNull": true
409 |         },
410 |         "expiresAt": {
411 |           "name": "expiresAt",
412 |           "type": "timestamp",
413 |           "primaryKey": false,
414 |           "notNull": true
415 |         },
416 |         "createdAt": {
417 |           "name": "createdAt",
418 |           "type": "timestamp",
419 |           "primaryKey": false,
420 |           "notNull": true,
421 |           "default": "now()"
422 |         },
423 |         "updatedAt": {
424 |           "name": "updatedAt",
425 |           "type": "timestamp",
426 |           "primaryKey": false,
427 |           "notNull": true,
428 |           "default": "now()"
429 |         }
430 |       },
431 |       "indexes": {},
432 |       "foreignKeys": {},
433 |       "compositePrimaryKeys": {},
434 |       "uniqueConstraints": {},
435 |       "policies": {},
436 |       "checkConstraints": {},
437 |       "isRLSEnabled": false
438 |     }
439 |   },
440 |   "enums": {},
441 |   "schemas": {},
442 |   "sequences": {},
443 |   "roles": {},
444 |   "policies": {},
445 |   "views": {},
446 |   "_meta": {
447 |     "columns": {},
448 |     "schemas": {},
449 |     "tables": {}
450 |   }
451 | }
```

drizzle/meta/0018_snapshot.json
```
1 | {
2 |   "id": "c741bfd3-0d05-404f-9322-fc979c372bbd",
3 |   "prevId": "61e759b3-9bac-47fe-9476-3811e7d3cb98",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.account": {
8 |       "name": "account",
9 |       "schema": "",
10 |       "columns": {
11 |         "id": {
12 |           "name": "id",
13 |           "type": "text",
14 |           "primaryKey": true,
15 |           "notNull": true
16 |         },
17 |         "userId": {
18 |           "name": "userId",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "providerId": {
24 |           "name": "providerId",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true
28 |         },
29 |         "accountId": {
30 |           "name": "accountId",
31 |           "type": "text",
32 |           "primaryKey": false,
33 |           "notNull": true
34 |         },
35 |         "providerType": {
36 |           "name": "providerType",
37 |           "type": "text",
38 |           "primaryKey": false,
39 |           "notNull": false
40 |         },
41 |         "access_token": {
42 |           "name": "access_token",
43 |           "type": "text",
44 |           "primaryKey": false,
45 |           "notNull": false
46 |         },
47 |         "refresh_token": {
48 |           "name": "refresh_token",
49 |           "type": "text",
50 |           "primaryKey": false,
51 |           "notNull": false
52 |         },
53 |         "access_token_expires_at": {
54 |           "name": "access_token_expires_at",
55 |           "type": "timestamp",
56 |           "primaryKey": false,
57 |           "notNull": false
58 |         },
59 |         "token_type": {
60 |           "name": "token_type",
61 |           "type": "text",
62 |           "primaryKey": false,
63 |           "notNull": false
64 |         },
65 |         "scope": {
66 |           "name": "scope",
67 |           "type": "text",
68 |           "primaryKey": false,
69 |           "notNull": false
70 |         },
71 |         "id_token": {
72 |           "name": "id_token",
73 |           "type": "text",
74 |           "primaryKey": false,
75 |           "notNull": false
76 |         },
77 |         "session_state": {
78 |           "name": "session_state",
79 |           "type": "text",
80 |           "primaryKey": false,
81 |           "notNull": false
82 |         },
83 |         "createdAt": {
84 |           "name": "createdAt",
85 |           "type": "timestamp",
86 |           "primaryKey": false,
87 |           "notNull": true,
88 |           "default": "now()"
89 |         },
90 |         "updatedAt": {
91 |           "name": "updatedAt",
92 |           "type": "timestamp",
93 |           "primaryKey": false,
94 |           "notNull": true,
95 |           "default": "now()"
96 |         }
97 |       },
98 |       "indexes": {},
99 |       "foreignKeys": {
100 |         "account_userId_user_id_fk": {
101 |           "name": "account_userId_user_id_fk",
102 |           "tableFrom": "account",
103 |           "tableTo": "user",
104 |           "columnsFrom": [
105 |             "userId"
106 |           ],
107 |           "columnsTo": [
108 |             "id"
109 |           ],
110 |           "onDelete": "cascade",
111 |           "onUpdate": "no action"
112 |         }
113 |       },
114 |       "compositePrimaryKeys": {},
115 |       "uniqueConstraints": {},
116 |       "policies": {},
117 |       "checkConstraints": {},
118 |       "isRLSEnabled": false
119 |     },
120 |     "public.chats": {
121 |       "name": "chats",
122 |       "schema": "",
123 |       "columns": {
124 |         "id": {
125 |           "name": "id",
126 |           "type": "text",
127 |           "primaryKey": true,
128 |           "notNull": true
129 |         },
130 |         "user_id": {
131 |           "name": "user_id",
132 |           "type": "text",
133 |           "primaryKey": false,
134 |           "notNull": true
135 |         },
136 |         "title": {
137 |           "name": "title",
138 |           "type": "text",
139 |           "primaryKey": false,
140 |           "notNull": true,
141 |           "default": "'New Chat'"
142 |         },
143 |         "created_at": {
144 |           "name": "created_at",
145 |           "type": "timestamp",
146 |           "primaryKey": false,
147 |           "notNull": true,
148 |           "default": "now()"
149 |         },
150 |         "updated_at": {
151 |           "name": "updated_at",
152 |           "type": "timestamp",
153 |           "primaryKey": false,
154 |           "notNull": true,
155 |           "default": "now()"
156 |         }
157 |       },
158 |       "indexes": {},
159 |       "foreignKeys": {},
160 |       "compositePrimaryKeys": {},
161 |       "uniqueConstraints": {},
162 |       "policies": {},
163 |       "checkConstraints": {},
164 |       "isRLSEnabled": false
165 |     },
166 |     "public.messages": {
167 |       "name": "messages",
168 |       "schema": "",
169 |       "columns": {
170 |         "id": {
171 |           "name": "id",
172 |           "type": "text",
173 |           "primaryKey": true,
174 |           "notNull": true
175 |         },
176 |         "chat_id": {
177 |           "name": "chat_id",
178 |           "type": "text",
179 |           "primaryKey": false,
180 |           "notNull": true
181 |         },
182 |         "role": {
183 |           "name": "role",
184 |           "type": "text",
185 |           "primaryKey": false,
186 |           "notNull": true
187 |         },
188 |         "parts": {
189 |           "name": "parts",
190 |           "type": "json",
191 |           "primaryKey": false,
192 |           "notNull": true
193 |         },
194 |         "has_web_search": {
195 |           "name": "has_web_search",
196 |           "type": "boolean",
197 |           "primaryKey": false,
198 |           "notNull": false,
199 |           "default": false
200 |         },
201 |         "web_search_context_size": {
202 |           "name": "web_search_context_size",
203 |           "type": "text",
204 |           "primaryKey": false,
205 |           "notNull": false,
206 |           "default": "'medium'"
207 |         },
208 |         "created_at": {
209 |           "name": "created_at",
210 |           "type": "timestamp",
211 |           "primaryKey": false,
212 |           "notNull": true,
213 |           "default": "now()"
214 |         }
215 |       },
216 |       "indexes": {},
217 |       "foreignKeys": {
218 |         "messages_chat_id_chats_id_fk": {
219 |           "name": "messages_chat_id_chats_id_fk",
220 |           "tableFrom": "messages",
221 |           "tableTo": "chats",
222 |           "columnsFrom": [
223 |             "chat_id"
224 |           ],
225 |           "columnsTo": [
226 |             "id"
227 |           ],
228 |           "onDelete": "cascade",
229 |           "onUpdate": "no action"
230 |         }
231 |       },
232 |       "compositePrimaryKeys": {},
233 |       "uniqueConstraints": {},
234 |       "policies": {},
235 |       "checkConstraints": {},
236 |       "isRLSEnabled": false
237 |     },
238 |     "public.polar_usage_events": {
239 |       "name": "polar_usage_events",
240 |       "schema": "",
241 |       "columns": {
242 |         "id": {
243 |           "name": "id",
244 |           "type": "text",
245 |           "primaryKey": true,
246 |           "notNull": true
247 |         },
248 |         "user_id": {
249 |           "name": "user_id",
250 |           "type": "text",
251 |           "primaryKey": false,
252 |           "notNull": true
253 |         },
254 |         "polar_customer_id": {
255 |           "name": "polar_customer_id",
256 |           "type": "text",
257 |           "primaryKey": false,
258 |           "notNull": false
259 |         },
260 |         "event_name": {
261 |           "name": "event_name",
262 |           "type": "text",
263 |           "primaryKey": false,
264 |           "notNull": true
265 |         },
266 |         "event_payload": {
267 |           "name": "event_payload",
268 |           "type": "json",
269 |           "primaryKey": false,
270 |           "notNull": true
271 |         },
272 |         "created_at": {
273 |           "name": "created_at",
274 |           "type": "timestamp",
275 |           "primaryKey": false,
276 |           "notNull": true,
277 |           "default": "now()"
278 |         }
279 |       },
280 |       "indexes": {},
281 |       "foreignKeys": {
282 |         "polar_usage_events_user_id_user_id_fk": {
283 |           "name": "polar_usage_events_user_id_user_id_fk",
284 |           "tableFrom": "polar_usage_events",
285 |           "tableTo": "user",
286 |           "columnsFrom": [
287 |             "user_id"
288 |           ],
289 |           "columnsTo": [
290 |             "id"
291 |           ],
292 |           "onDelete": "cascade",
293 |           "onUpdate": "no action"
294 |         }
295 |       },
296 |       "compositePrimaryKeys": {},
297 |       "uniqueConstraints": {},
298 |       "policies": {},
299 |       "checkConstraints": {},
300 |       "isRLSEnabled": false
301 |     },
302 |     "public.session": {
303 |       "name": "session",
304 |       "schema": "",
305 |       "columns": {
306 |         "id": {
307 |           "name": "id",
308 |           "type": "text",
309 |           "primaryKey": true,
310 |           "notNull": true
311 |         },
312 |         "sessionToken": {
313 |           "name": "sessionToken",
314 |           "type": "text",
315 |           "primaryKey": false,
316 |           "notNull": true
317 |         },
318 |         "userId": {
319 |           "name": "userId",
320 |           "type": "text",
321 |           "primaryKey": false,
322 |           "notNull": true
323 |         },
324 |         "expiresAt": {
325 |           "name": "expiresAt",
326 |           "type": "timestamp",
327 |           "primaryKey": false,
328 |           "notNull": true
329 |         },
330 |         "ipAddress": {
331 |           "name": "ipAddress",
332 |           "type": "text",
333 |           "primaryKey": false,
334 |           "notNull": false
335 |         },
336 |         "userAgent": {
337 |           "name": "userAgent",
338 |           "type": "text",
339 |           "primaryKey": false,
340 |           "notNull": false
341 |         },
342 |         "createdAt": {
343 |           "name": "createdAt",
344 |           "type": "timestamp",
345 |           "primaryKey": false,
346 |           "notNull": true,
347 |           "default": "now()"
348 |         },
349 |         "updatedAt": {
350 |           "name": "updatedAt",
351 |           "type": "timestamp",
352 |           "primaryKey": false,
353 |           "notNull": true,
354 |           "default": "now()"
355 |         }
356 |       },
357 |       "indexes": {},
358 |       "foreignKeys": {
359 |         "session_userId_user_id_fk": {
360 |           "name": "session_userId_user_id_fk",
361 |           "tableFrom": "session",
362 |           "tableTo": "user",
363 |           "columnsFrom": [
364 |             "userId"
365 |           ],
366 |           "columnsTo": [
367 |             "id"
368 |           ],
369 |           "onDelete": "cascade",
370 |           "onUpdate": "no action"
371 |         }
372 |       },
373 |       "compositePrimaryKeys": {},
374 |       "uniqueConstraints": {
375 |         "session_sessionToken_unique": {
376 |           "name": "session_sessionToken_unique",
377 |           "nullsNotDistinct": false,
378 |           "columns": [
379 |             "sessionToken"
380 |           ]
381 |         }
382 |       },
383 |       "policies": {},
384 |       "checkConstraints": {},
385 |       "isRLSEnabled": false
386 |     },
387 |     "public.user": {
388 |       "name": "user",
389 |       "schema": "",
390 |       "columns": {
391 |         "id": {
392 |           "name": "id",
393 |           "type": "text",
394 |           "primaryKey": true,
395 |           "notNull": true
396 |         },
397 |         "name": {
398 |           "name": "name",
399 |           "type": "text",
400 |           "primaryKey": false,
401 |           "notNull": false
402 |         },
403 |         "email": {
404 |           "name": "email",
405 |           "type": "text",
406 |           "primaryKey": false,
407 |           "notNull": true
408 |         },
409 |         "emailVerified": {
410 |           "name": "emailVerified",
411 |           "type": "boolean",
412 |           "primaryKey": false,
413 |           "notNull": false
414 |         },
415 |         "image": {
416 |           "name": "image",
417 |           "type": "text",
418 |           "primaryKey": false,
419 |           "notNull": false
420 |         },
421 |         "createdAt": {
422 |           "name": "createdAt",
423 |           "type": "timestamp",
424 |           "primaryKey": false,
425 |           "notNull": true,
426 |           "default": "now()"
427 |         },
428 |         "updatedAt": {
429 |           "name": "updatedAt",
430 |           "type": "timestamp",
431 |           "primaryKey": false,
432 |           "notNull": true,
433 |           "default": "now()"
434 |         }
435 |       },
436 |       "indexes": {},
437 |       "foreignKeys": {},
438 |       "compositePrimaryKeys": {},
439 |       "uniqueConstraints": {
440 |         "user_email_unique": {
441 |           "name": "user_email_unique",
442 |           "nullsNotDistinct": false,
443 |           "columns": [
444 |             "email"
445 |           ]
446 |         }
447 |       },
448 |       "policies": {},
449 |       "checkConstraints": {},
450 |       "isRLSEnabled": false
451 |     },
452 |     "public.verification": {
453 |       "name": "verification",
454 |       "schema": "",
455 |       "columns": {
456 |         "id": {
457 |           "name": "id",
458 |           "type": "text",
459 |           "primaryKey": true,
460 |           "notNull": true
461 |         },
462 |         "identifier": {
463 |           "name": "identifier",
464 |           "type": "text",
465 |           "primaryKey": false,
466 |           "notNull": true
467 |         },
468 |         "value": {
469 |           "name": "value",
470 |           "type": "text",
471 |           "primaryKey": false,
472 |           "notNull": true
473 |         },
474 |         "expiresAt": {
475 |           "name": "expiresAt",
476 |           "type": "timestamp",
477 |           "primaryKey": false,
478 |           "notNull": true
479 |         },
480 |         "createdAt": {
481 |           "name": "createdAt",
482 |           "type": "timestamp",
483 |           "primaryKey": false,
484 |           "notNull": true,
485 |           "default": "now()"
486 |         },
487 |         "updatedAt": {
488 |           "name": "updatedAt",
489 |           "type": "timestamp",
490 |           "primaryKey": false,
491 |           "notNull": true,
492 |           "default": "now()"
493 |         }
494 |       },
495 |       "indexes": {},
496 |       "foreignKeys": {},
497 |       "compositePrimaryKeys": {},
498 |       "uniqueConstraints": {},
499 |       "policies": {},
500 |       "checkConstraints": {},
501 |       "isRLSEnabled": false
502 |     }
503 |   },
504 |   "enums": {},
505 |   "schemas": {},
506 |   "sequences": {},
507 |   "roles": {},
508 |   "policies": {},
509 |   "views": {},
510 |   "_meta": {
511 |     "columns": {},
512 |     "schemas": {},
513 |     "tables": {}
514 |   }
515 | }
```

drizzle/meta/0020_snapshot.json
```
1 | {
2 |   "id": "28459e0c-5ff3-4a49-b3f8-7c8e1c3c1ccd",
3 |   "prevId": "c741bfd3-0d05-404f-9322-fc979c372bbd",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.account": {
8 |       "name": "account",
9 |       "schema": "",
10 |       "columns": {
11 |         "id": {
12 |           "name": "id",
13 |           "type": "text",
14 |           "primaryKey": true,
15 |           "notNull": true
16 |         },
17 |         "userId": {
18 |           "name": "userId",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "providerId": {
24 |           "name": "providerId",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true
28 |         },
29 |         "accountId": {
30 |           "name": "accountId",
31 |           "type": "text",
32 |           "primaryKey": false,
33 |           "notNull": true
34 |         },
35 |         "providerType": {
36 |           "name": "providerType",
37 |           "type": "text",
38 |           "primaryKey": false,
39 |           "notNull": false
40 |         },
41 |         "access_token": {
42 |           "name": "access_token",
43 |           "type": "text",
44 |           "primaryKey": false,
45 |           "notNull": false
46 |         },
47 |         "refresh_token": {
48 |           "name": "refresh_token",
49 |           "type": "text",
50 |           "primaryKey": false,
51 |           "notNull": false
52 |         },
53 |         "access_token_expires_at": {
54 |           "name": "access_token_expires_at",
55 |           "type": "timestamp",
56 |           "primaryKey": false,
57 |           "notNull": false
58 |         },
59 |         "token_type": {
60 |           "name": "token_type",
61 |           "type": "text",
62 |           "primaryKey": false,
63 |           "notNull": false
64 |         },
65 |         "scope": {
66 |           "name": "scope",
67 |           "type": "text",
68 |           "primaryKey": false,
69 |           "notNull": false
70 |         },
71 |         "id_token": {
72 |           "name": "id_token",
73 |           "type": "text",
74 |           "primaryKey": false,
75 |           "notNull": false
76 |         },
77 |         "session_state": {
78 |           "name": "session_state",
79 |           "type": "text",
80 |           "primaryKey": false,
81 |           "notNull": false
82 |         },
83 |         "createdAt": {
84 |           "name": "createdAt",
85 |           "type": "timestamp",
86 |           "primaryKey": false,
87 |           "notNull": true,
88 |           "default": "now()"
89 |         },
90 |         "updatedAt": {
91 |           "name": "updatedAt",
92 |           "type": "timestamp",
93 |           "primaryKey": false,
94 |           "notNull": true,
95 |           "default": "now()"
96 |         }
97 |       },
98 |       "indexes": {},
99 |       "foreignKeys": {
100 |         "account_userId_user_id_fk": {
101 |           "name": "account_userId_user_id_fk",
102 |           "tableFrom": "account",
103 |           "tableTo": "user",
104 |           "columnsFrom": [
105 |             "userId"
106 |           ],
107 |           "columnsTo": [
108 |             "id"
109 |           ],
110 |           "onDelete": "cascade",
111 |           "onUpdate": "no action"
112 |         }
113 |       },
114 |       "compositePrimaryKeys": {},
115 |       "uniqueConstraints": {},
116 |       "policies": {},
117 |       "checkConstraints": {},
118 |       "isRLSEnabled": false
119 |     },
120 |     "public.chats": {
121 |       "name": "chats",
122 |       "schema": "",
123 |       "columns": {
124 |         "id": {
125 |           "name": "id",
126 |           "type": "text",
127 |           "primaryKey": true,
128 |           "notNull": true
129 |         },
130 |         "user_id": {
131 |           "name": "user_id",
132 |           "type": "text",
133 |           "primaryKey": false,
134 |           "notNull": true
135 |         },
136 |         "title": {
137 |           "name": "title",
138 |           "type": "text",
139 |           "primaryKey": false,
140 |           "notNull": true,
141 |           "default": "'New Chat'"
142 |         },
143 |         "created_at": {
144 |           "name": "created_at",
145 |           "type": "timestamp",
146 |           "primaryKey": false,
147 |           "notNull": true,
148 |           "default": "now()"
149 |         },
150 |         "updated_at": {
151 |           "name": "updated_at",
152 |           "type": "timestamp",
153 |           "primaryKey": false,
154 |           "notNull": true,
155 |           "default": "now()"
156 |         }
157 |       },
158 |       "indexes": {},
159 |       "foreignKeys": {},
160 |       "compositePrimaryKeys": {},
161 |       "uniqueConstraints": {},
162 |       "policies": {},
163 |       "checkConstraints": {},
164 |       "isRLSEnabled": false
165 |     },
166 |     "public.messages": {
167 |       "name": "messages",
168 |       "schema": "",
169 |       "columns": {
170 |         "id": {
171 |           "name": "id",
172 |           "type": "text",
173 |           "primaryKey": true,
174 |           "notNull": true
175 |         },
176 |         "chat_id": {
177 |           "name": "chat_id",
178 |           "type": "text",
179 |           "primaryKey": false,
180 |           "notNull": true
181 |         },
182 |         "role": {
183 |           "name": "role",
184 |           "type": "text",
185 |           "primaryKey": false,
186 |           "notNull": true
187 |         },
188 |         "parts": {
189 |           "name": "parts",
190 |           "type": "json",
191 |           "primaryKey": false,
192 |           "notNull": true
193 |         },
194 |         "has_web_search": {
195 |           "name": "has_web_search",
196 |           "type": "boolean",
197 |           "primaryKey": false,
198 |           "notNull": false,
199 |           "default": false
200 |         },
201 |         "web_search_context_size": {
202 |           "name": "web_search_context_size",
203 |           "type": "text",
204 |           "primaryKey": false,
205 |           "notNull": false,
206 |           "default": "'medium'"
207 |         },
208 |         "created_at": {
209 |           "name": "created_at",
210 |           "type": "timestamp",
211 |           "primaryKey": false,
212 |           "notNull": true,
213 |           "default": "now()"
214 |         }
215 |       },
216 |       "indexes": {},
217 |       "foreignKeys": {
218 |         "messages_chat_id_chats_id_fk": {
219 |           "name": "messages_chat_id_chats_id_fk",
220 |           "tableFrom": "messages",
221 |           "tableTo": "chats",
222 |           "columnsFrom": [
223 |             "chat_id"
224 |           ],
225 |           "columnsTo": [
226 |             "id"
227 |           ],
228 |           "onDelete": "cascade",
229 |           "onUpdate": "no action"
230 |         }
231 |       },
232 |       "compositePrimaryKeys": {},
233 |       "uniqueConstraints": {},
234 |       "policies": {},
235 |       "checkConstraints": {},
236 |       "isRLSEnabled": false
237 |     },
238 |     "public.polar_usage_events": {
239 |       "name": "polar_usage_events",
240 |       "schema": "",
241 |       "columns": {
242 |         "id": {
243 |           "name": "id",
244 |           "type": "text",
245 |           "primaryKey": true,
246 |           "notNull": true
247 |         },
248 |         "user_id": {
249 |           "name": "user_id",
250 |           "type": "text",
251 |           "primaryKey": false,
252 |           "notNull": true
253 |         },
254 |         "polar_customer_id": {
255 |           "name": "polar_customer_id",
256 |           "type": "text",
257 |           "primaryKey": false,
258 |           "notNull": false
259 |         },
260 |         "event_name": {
261 |           "name": "event_name",
262 |           "type": "text",
263 |           "primaryKey": false,
264 |           "notNull": true
265 |         },
266 |         "event_payload": {
267 |           "name": "event_payload",
268 |           "type": "json",
269 |           "primaryKey": false,
270 |           "notNull": true
271 |         },
272 |         "created_at": {
273 |           "name": "created_at",
274 |           "type": "timestamp",
275 |           "primaryKey": false,
276 |           "notNull": true,
277 |           "default": "now()"
278 |         }
279 |       },
280 |       "indexes": {},
281 |       "foreignKeys": {
282 |         "polar_usage_events_user_id_user_id_fk": {
283 |           "name": "polar_usage_events_user_id_user_id_fk",
284 |           "tableFrom": "polar_usage_events",
285 |           "tableTo": "user",
286 |           "columnsFrom": [
287 |             "user_id"
288 |           ],
289 |           "columnsTo": [
290 |             "id"
291 |           ],
292 |           "onDelete": "cascade",
293 |           "onUpdate": "no action"
294 |         }
295 |       },
296 |       "compositePrimaryKeys": {},
297 |       "uniqueConstraints": {},
298 |       "policies": {},
299 |       "checkConstraints": {},
300 |       "isRLSEnabled": false
301 |     },
302 |     "public.session": {
303 |       "name": "session",
304 |       "schema": "",
305 |       "columns": {
306 |         "id": {
307 |           "name": "id",
308 |           "type": "text",
309 |           "primaryKey": true,
310 |           "notNull": true
311 |         },
312 |         "sessionToken": {
313 |           "name": "sessionToken",
314 |           "type": "text",
315 |           "primaryKey": false,
316 |           "notNull": true
317 |         },
318 |         "userId": {
319 |           "name": "userId",
320 |           "type": "text",
321 |           "primaryKey": false,
322 |           "notNull": true
323 |         },
324 |         "expiresAt": {
325 |           "name": "expiresAt",
326 |           "type": "timestamp",
327 |           "primaryKey": false,
328 |           "notNull": true
329 |         },
330 |         "ipAddress": {
331 |           "name": "ipAddress",
332 |           "type": "text",
333 |           "primaryKey": false,
334 |           "notNull": false
335 |         },
336 |         "userAgent": {
337 |           "name": "userAgent",
338 |           "type": "text",
339 |           "primaryKey": false,
340 |           "notNull": false
341 |         },
342 |         "createdAt": {
343 |           "name": "createdAt",
344 |           "type": "timestamp",
345 |           "primaryKey": false,
346 |           "notNull": true,
347 |           "default": "now()"
348 |         },
349 |         "updatedAt": {
350 |           "name": "updatedAt",
351 |           "type": "timestamp",
352 |           "primaryKey": false,
353 |           "notNull": true,
354 |           "default": "now()"
355 |         }
356 |       },
357 |       "indexes": {},
358 |       "foreignKeys": {
359 |         "session_userId_user_id_fk": {
360 |           "name": "session_userId_user_id_fk",
361 |           "tableFrom": "session",
362 |           "tableTo": "user",
363 |           "columnsFrom": [
364 |             "userId"
365 |           ],
366 |           "columnsTo": [
367 |             "id"
368 |           ],
369 |           "onDelete": "cascade",
370 |           "onUpdate": "no action"
371 |         }
372 |       },
373 |       "compositePrimaryKeys": {},
374 |       "uniqueConstraints": {
375 |         "session_sessionToken_unique": {
376 |           "name": "session_sessionToken_unique",
377 |           "nullsNotDistinct": false,
378 |           "columns": [
379 |             "sessionToken"
380 |           ]
381 |         }
382 |       },
383 |       "policies": {},
384 |       "checkConstraints": {},
385 |       "isRLSEnabled": false
386 |     },
387 |     "public.user": {
388 |       "name": "user",
389 |       "schema": "",
390 |       "columns": {
391 |         "id": {
392 |           "name": "id",
393 |           "type": "text",
394 |           "primaryKey": true,
395 |           "notNull": true
396 |         },
397 |         "name": {
398 |           "name": "name",
399 |           "type": "text",
400 |           "primaryKey": false,
401 |           "notNull": false
402 |         },
403 |         "email": {
404 |           "name": "email",
405 |           "type": "text",
406 |           "primaryKey": false,
407 |           "notNull": true
408 |         },
409 |         "emailVerified": {
410 |           "name": "emailVerified",
411 |           "type": "boolean",
412 |           "primaryKey": false,
413 |           "notNull": false
414 |         },
415 |         "image": {
416 |           "name": "image",
417 |           "type": "text",
418 |           "primaryKey": false,
419 |           "notNull": false
420 |         },
421 |         "isAnonymous": {
422 |           "name": "isAnonymous",
423 |           "type": "boolean",
424 |           "primaryKey": false,
425 |           "notNull": false,
426 |           "default": false
427 |         },
428 |         "createdAt": {
429 |           "name": "createdAt",
430 |           "type": "timestamp",
431 |           "primaryKey": false,
432 |           "notNull": true,
433 |           "default": "now()"
434 |         },
435 |         "updatedAt": {
436 |           "name": "updatedAt",
437 |           "type": "timestamp",
438 |           "primaryKey": false,
439 |           "notNull": true,
440 |           "default": "now()"
441 |         }
442 |       },
443 |       "indexes": {},
444 |       "foreignKeys": {},
445 |       "compositePrimaryKeys": {},
446 |       "uniqueConstraints": {
447 |         "user_email_unique": {
448 |           "name": "user_email_unique",
449 |           "nullsNotDistinct": false,
450 |           "columns": [
451 |             "email"
452 |           ]
453 |         }
454 |       },
455 |       "policies": {},
456 |       "checkConstraints": {},
457 |       "isRLSEnabled": false
458 |     },
459 |     "public.verification": {
460 |       "name": "verification",
461 |       "schema": "",
462 |       "columns": {
463 |         "id": {
464 |           "name": "id",
465 |           "type": "text",
466 |           "primaryKey": true,
467 |           "notNull": true
468 |         },
469 |         "identifier": {
470 |           "name": "identifier",
471 |           "type": "text",
472 |           "primaryKey": false,
473 |           "notNull": true
474 |         },
475 |         "value": {
476 |           "name": "value",
477 |           "type": "text",
478 |           "primaryKey": false,
479 |           "notNull": true
480 |         },
481 |         "expiresAt": {
482 |           "name": "expiresAt",
483 |           "type": "timestamp",
484 |           "primaryKey": false,
485 |           "notNull": true
486 |         },
487 |         "createdAt": {
488 |           "name": "createdAt",
489 |           "type": "timestamp",
490 |           "primaryKey": false,
491 |           "notNull": true,
492 |           "default": "now()"
493 |         },
494 |         "updatedAt": {
495 |           "name": "updatedAt",
496 |           "type": "timestamp",
497 |           "primaryKey": false,
498 |           "notNull": true,
499 |           "default": "now()"
500 |         }
501 |       },
502 |       "indexes": {},
503 |       "foreignKeys": {},
504 |       "compositePrimaryKeys": {},
505 |       "uniqueConstraints": {},
506 |       "policies": {},
507 |       "checkConstraints": {},
508 |       "isRLSEnabled": false
509 |     }
510 |   },
511 |   "enums": {},
512 |   "schemas": {},
513 |   "sequences": {},
514 |   "roles": {},
515 |   "policies": {},
516 |   "views": {},
517 |   "_meta": {
518 |     "columns": {},
519 |     "schemas": {},
520 |     "tables": {}
521 |   }
522 | }
```

drizzle/meta/0021_snapshot.json
```
1 | {
2 |   "id": "e6db90c3-f2be-4342-83c7-1208ae49b9d3",
3 |   "prevId": "28459e0c-5ff3-4a49-b3f8-7c8e1c3c1ccd",
4 |   "version": "7",
5 |   "dialect": "postgresql",
6 |   "tables": {
7 |     "public.account": {
8 |       "name": "account",
9 |       "schema": "",
10 |       "columns": {
11 |         "id": {
12 |           "name": "id",
13 |           "type": "text",
14 |           "primaryKey": true,
15 |           "notNull": true
16 |         },
17 |         "userId": {
18 |           "name": "userId",
19 |           "type": "text",
20 |           "primaryKey": false,
21 |           "notNull": true
22 |         },
23 |         "providerId": {
24 |           "name": "providerId",
25 |           "type": "text",
26 |           "primaryKey": false,
27 |           "notNull": true
28 |         },
29 |         "accountId": {
30 |           "name": "accountId",
31 |           "type": "text",
32 |           "primaryKey": false,
33 |           "notNull": true
34 |         },
35 |         "providerType": {
36 |           "name": "providerType",
37 |           "type": "text",
38 |           "primaryKey": false,
39 |           "notNull": false
40 |         },
41 |         "access_token": {
42 |           "name": "access_token",
43 |           "type": "text",
44 |           "primaryKey": false,
45 |           "notNull": false
46 |         },
47 |         "refresh_token": {
48 |           "name": "refresh_token",
49 |           "type": "text",
50 |           "primaryKey": false,
51 |           "notNull": false
52 |         },
53 |         "access_token_expires_at": {
54 |           "name": "access_token_expires_at",
55 |           "type": "timestamp",
56 |           "primaryKey": false,
57 |           "notNull": false
58 |         },
59 |         "token_type": {
60 |           "name": "token_type",
61 |           "type": "text",
62 |           "primaryKey": false,
63 |           "notNull": false
64 |         },
65 |         "scope": {
66 |           "name": "scope",
67 |           "type": "text",
68 |           "primaryKey": false,
69 |           "notNull": false
70 |         },
71 |         "id_token": {
72 |           "name": "id_token",
73 |           "type": "text",
74 |           "primaryKey": false,
75 |           "notNull": false
76 |         },
77 |         "session_state": {
78 |           "name": "session_state",
79 |           "type": "text",
80 |           "primaryKey": false,
81 |           "notNull": false
82 |         },
83 |         "createdAt": {
84 |           "name": "createdAt",
85 |           "type": "timestamp",
86 |           "primaryKey": false,
87 |           "notNull": true,
88 |           "default": "now()"
89 |         },
90 |         "updatedAt": {
91 |           "name": "updatedAt",
92 |           "type": "timestamp",
93 |           "primaryKey": false,
94 |           "notNull": true,
95 |           "default": "now()"
96 |         }
97 |       },
98 |       "indexes": {},
99 |       "foreignKeys": {
100 |         "account_userId_user_id_fk": {
101 |           "name": "account_userId_user_id_fk",
102 |           "tableFrom": "account",
103 |           "tableTo": "user",
104 |           "columnsFrom": [
105 |             "userId"
106 |           ],
107 |           "columnsTo": [
108 |             "id"
109 |           ],
110 |           "onDelete": "cascade",
111 |           "onUpdate": "no action"
112 |         }
113 |       },
114 |       "compositePrimaryKeys": {},
115 |       "uniqueConstraints": {},
116 |       "policies": {},
117 |       "checkConstraints": {},
118 |       "isRLSEnabled": false
119 |     },
120 |     "public.chats": {
121 |       "name": "chats",
122 |       "schema": "",
123 |       "columns": {
124 |         "id": {
125 |           "name": "id",
126 |           "type": "text",
127 |           "primaryKey": true,
128 |           "notNull": true
129 |         },
130 |         "user_id": {
131 |           "name": "user_id",
132 |           "type": "text",
133 |           "primaryKey": false,
134 |           "notNull": true
135 |         },
136 |         "title": {
137 |           "name": "title",
138 |           "type": "text",
139 |           "primaryKey": false,
140 |           "notNull": true,
141 |           "default": "'New Chat'"
142 |         },
143 |         "created_at": {
144 |           "name": "created_at",
145 |           "type": "timestamp",
146 |           "primaryKey": false,
147 |           "notNull": true,
148 |           "default": "now()"
149 |         },
150 |         "updated_at": {
151 |           "name": "updated_at",
152 |           "type": "timestamp",
153 |           "primaryKey": false,
154 |           "notNull": true,
155 |           "default": "now()"
156 |         }
157 |       },
158 |       "indexes": {},
159 |       "foreignKeys": {},
160 |       "compositePrimaryKeys": {},
161 |       "uniqueConstraints": {},
162 |       "policies": {},
163 |       "checkConstraints": {},
164 |       "isRLSEnabled": false
165 |     },
166 |     "public.messages": {
167 |       "name": "messages",
168 |       "schema": "",
169 |       "columns": {
170 |         "id": {
171 |           "name": "id",
172 |           "type": "text",
173 |           "primaryKey": true,
174 |           "notNull": true
175 |         },
176 |         "chat_id": {
177 |           "name": "chat_id",
178 |           "type": "text",
179 |           "primaryKey": false,
180 |           "notNull": true
181 |         },
182 |         "role": {
183 |           "name": "role",
184 |           "type": "text",
185 |           "primaryKey": false,
186 |           "notNull": true
187 |         },
188 |         "parts": {
189 |           "name": "parts",
190 |           "type": "json",
191 |           "primaryKey": false,
192 |           "notNull": true
193 |         },
194 |         "has_web_search": {
195 |           "name": "has_web_search",
196 |           "type": "boolean",
197 |           "primaryKey": false,
198 |           "notNull": false,
199 |           "default": false
200 |         },
201 |         "web_search_context_size": {
202 |           "name": "web_search_context_size",
203 |           "type": "text",
204 |           "primaryKey": false,
205 |           "notNull": false,
206 |           "default": "'medium'"
207 |         },
208 |         "created_at": {
209 |           "name": "created_at",
210 |           "type": "timestamp",
211 |           "primaryKey": false,
212 |           "notNull": true,
213 |           "default": "now()"
214 |         }
215 |       },
216 |       "indexes": {},
217 |       "foreignKeys": {
218 |         "messages_chat_id_chats_id_fk": {
219 |           "name": "messages_chat_id_chats_id_fk",
220 |           "tableFrom": "messages",
221 |           "tableTo": "chats",
222 |           "columnsFrom": [
223 |             "chat_id"
224 |           ],
225 |           "columnsTo": [
226 |             "id"
227 |           ],
228 |           "onDelete": "cascade",
229 |           "onUpdate": "no action"
230 |         }
231 |       },
232 |       "compositePrimaryKeys": {},
233 |       "uniqueConstraints": {},
234 |       "policies": {},
235 |       "checkConstraints": {},
236 |       "isRLSEnabled": false
237 |     },
238 |     "public.polar_usage_events": {
239 |       "name": "polar_usage_events",
240 |       "schema": "",
241 |       "columns": {
242 |         "id": {
243 |           "name": "id",
244 |           "type": "text",
245 |           "primaryKey": true,
246 |           "notNull": true
247 |         },
248 |         "user_id": {
249 |           "name": "user_id",
250 |           "type": "text",
251 |           "primaryKey": false,
252 |           "notNull": true
253 |         },
254 |         "polar_customer_id": {
255 |           "name": "polar_customer_id",
256 |           "type": "text",
257 |           "primaryKey": false,
258 |           "notNull": false
259 |         },
260 |         "event_name": {
261 |           "name": "event_name",
262 |           "type": "text",
263 |           "primaryKey": false,
264 |           "notNull": true
265 |         },
266 |         "event_payload": {
267 |           "name": "event_payload",
268 |           "type": "json",
269 |           "primaryKey": false,
270 |           "notNull": true
271 |         },
272 |         "created_at": {
273 |           "name": "created_at",
274 |           "type": "timestamp",
275 |           "primaryKey": false,
276 |           "notNull": true,
277 |           "default": "now()"
278 |         }
279 |       },
280 |       "indexes": {},
281 |       "foreignKeys": {
282 |         "polar_usage_events_user_id_user_id_fk": {
283 |           "name": "polar_usage_events_user_id_user_id_fk",
284 |           "tableFrom": "polar_usage_events",
285 |           "tableTo": "user",
286 |           "columnsFrom": [
287 |             "user_id"
288 |           ],
289 |           "columnsTo": [
290 |             "id"
291 |           ],
292 |           "onDelete": "cascade",
293 |           "onUpdate": "no action"
294 |         }
295 |       },
296 |       "compositePrimaryKeys": {},
297 |       "uniqueConstraints": {},
298 |       "policies": {},
299 |       "checkConstraints": {},
300 |       "isRLSEnabled": false
301 |     },
302 |     "public.session": {
303 |       "name": "session",
304 |       "schema": "",
305 |       "columns": {
306 |         "id": {
307 |           "name": "id",
308 |           "type": "text",
309 |           "primaryKey": true,
310 |           "notNull": true
311 |         },
312 |         "sessionToken": {
313 |           "name": "sessionToken",
314 |           "type": "text",
315 |           "primaryKey": false,
316 |           "notNull": true
317 |         },
318 |         "userId": {
319 |           "name": "userId",
320 |           "type": "text",
321 |           "primaryKey": false,
322 |           "notNull": true
323 |         },
324 |         "expiresAt": {
325 |           "name": "expiresAt",
326 |           "type": "timestamp",
327 |           "primaryKey": false,
328 |           "notNull": true
329 |         },
330 |         "ipAddress": {
331 |           "name": "ipAddress",
332 |           "type": "text",
333 |           "primaryKey": false,
334 |           "notNull": false
335 |         },
336 |         "userAgent": {
337 |           "name": "userAgent",
338 |           "type": "text",
339 |           "primaryKey": false,
340 |           "notNull": false
341 |         },
342 |         "createdAt": {
343 |           "name": "createdAt",
344 |           "type": "timestamp",
345 |           "primaryKey": false,
346 |           "notNull": true,
347 |           "default": "now()"
348 |         },
349 |         "updatedAt": {
350 |           "name": "updatedAt",
351 |           "type": "timestamp",
352 |           "primaryKey": false,
353 |           "notNull": true,
354 |           "default": "now()"
355 |         }
356 |       },
357 |       "indexes": {},
358 |       "foreignKeys": {
359 |         "session_userId_user_id_fk": {
360 |           "name": "session_userId_user_id_fk",
361 |           "tableFrom": "session",
362 |           "tableTo": "user",
363 |           "columnsFrom": [
364 |             "userId"
365 |           ],
366 |           "columnsTo": [
367 |             "id"
368 |           ],
369 |           "onDelete": "cascade",
370 |           "onUpdate": "no action"
371 |         }
372 |       },
373 |       "compositePrimaryKeys": {},
374 |       "uniqueConstraints": {
375 |         "session_sessionToken_unique": {
376 |           "name": "session_sessionToken_unique",
377 |           "nullsNotDistinct": false,
378 |           "columns": [
379 |             "sessionToken"
380 |           ]
381 |         }
382 |       },
383 |       "policies": {},
384 |       "checkConstraints": {},
385 |       "isRLSEnabled": false
386 |     },
387 |     "public.user": {
388 |       "name": "user",
389 |       "schema": "",
390 |       "columns": {
391 |         "id": {
392 |           "name": "id",
393 |           "type": "text",
394 |           "primaryKey": true,
395 |           "notNull": true
396 |         },
397 |         "name": {
398 |           "name": "name",
399 |           "type": "text",
400 |           "primaryKey": false,
401 |           "notNull": false
402 |         },
403 |         "email": {
404 |           "name": "email",
405 |           "type": "text",
406 |           "primaryKey": false,
407 |           "notNull": true
408 |         },
409 |         "emailVerified": {
410 |           "name": "emailVerified",
411 |           "type": "boolean",
412 |           "primaryKey": false,
413 |           "notNull": false
414 |         },
415 |         "image": {
416 |           "name": "image",
417 |           "type": "text",
418 |           "primaryKey": false,
419 |           "notNull": false
420 |         },
421 |         "isAnonymous": {
422 |           "name": "isAnonymous",
423 |           "type": "boolean",
424 |           "primaryKey": false,
425 |           "notNull": false,
426 |           "default": false
427 |         },
428 |         "metadata": {
429 |           "name": "metadata",
430 |           "type": "json",
431 |           "primaryKey": false,
432 |           "notNull": false
433 |         },
434 |         "createdAt": {
435 |           "name": "createdAt",
436 |           "type": "timestamp",
437 |           "primaryKey": false,
438 |           "notNull": true,
439 |           "default": "now()"
440 |         },
441 |         "updatedAt": {
442 |           "name": "updatedAt",
443 |           "type": "timestamp",
444 |           "primaryKey": false,
445 |           "notNull": true,
446 |           "default": "now()"
447 |         }
448 |       },
449 |       "indexes": {},
450 |       "foreignKeys": {},
451 |       "compositePrimaryKeys": {},
452 |       "uniqueConstraints": {
453 |         "user_email_unique": {
454 |           "name": "user_email_unique",
455 |           "nullsNotDistinct": false,
456 |           "columns": [
457 |             "email"
458 |           ]
459 |         }
460 |       },
461 |       "policies": {},
462 |       "checkConstraints": {},
463 |       "isRLSEnabled": false
464 |     },
465 |     "public.verification": {
466 |       "name": "verification",
467 |       "schema": "",
468 |       "columns": {
469 |         "id": {
470 |           "name": "id",
471 |           "type": "text",
472 |           "primaryKey": true,
473 |           "notNull": true
474 |         },
475 |         "identifier": {
476 |           "name": "identifier",
477 |           "type": "text",
478 |           "primaryKey": false,
479 |           "notNull": true
480 |         },
481 |         "value": {
482 |           "name": "value",
483 |           "type": "text",
484 |           "primaryKey": false,
485 |           "notNull": true
486 |         },
487 |         "expiresAt": {
488 |           "name": "expiresAt",
489 |           "type": "timestamp",
490 |           "primaryKey": false,
491 |           "notNull": true
492 |         },
493 |         "createdAt": {
494 |           "name": "createdAt",
495 |           "type": "timestamp",
496 |           "primaryKey": false,
497 |           "notNull": true,
498 |           "default": "now()"
499 |         },
500 |         "updatedAt": {
501 |           "name": "updatedAt",
502 |           "type": "timestamp",
503 |           "primaryKey": false,
504 |           "notNull": true,
505 |           "default": "now()"
506 |         }
507 |       },
508 |       "indexes": {},
509 |       "foreignKeys": {},
510 |       "compositePrimaryKeys": {},
511 |       "uniqueConstraints": {},
512 |       "policies": {},
513 |       "checkConstraints": {},
514 |       "isRLSEnabled": false
515 |     }
516 |   },
517 |   "enums": {},
518 |   "schemas": {},
519 |   "sequences": {},
520 |   "roles": {},
521 |   "policies": {},
522 |   "views": {},
523 |   "_meta": {
524 |     "columns": {},
525 |     "schemas": {},
526 |     "tables": {}
527 |   }
528 | }
```

drizzle/meta/_journal.json
```
1 | {
2 |   "version": "7",
3 |   "dialect": "postgresql",
4 |   "entries": [
5 |     {
6 |       "idx": 0,
7 |       "version": "7",
8 |       "when": 1714107718166,
9 |       "tag": "0000_supreme_rocket_raccoon",
10 |       "breakpoints": true
11 |     },
12 |     {
13 |       "idx": 1,
14 |       "version": "7",
15 |       "when": 1714107757731,
16 |       "tag": "0001_curious_paper_doll",
17 |       "breakpoints": true
18 |     },
19 |     {
20 |       "idx": 2,
21 |       "version": "7",
22 |       "when": 1714118290945,
23 |       "tag": "0002_free_cobalt_man",
24 |       "breakpoints": true
25 |     },
26 |     {
27 |       "idx": 3,
28 |       "version": "7",
29 |       "when": 1714118653673,
30 |       "tag": "0003_oval_energizer",
31 |       "breakpoints": true
32 |     },
33 |     {
34 |       "idx": 4,
35 |       "version": "7",
36 |       "when": 1714119167990,
37 |       "tag": "0004_tense_ricochet",
38 |       "breakpoints": true
39 |     },
40 |     {
41 |       "idx": 5,
42 |       "version": "7",
43 |       "when": 1714119273465,
44 |       "tag": "0005_early_payback",
45 |       "breakpoints": true
46 |     },
47 |     {
48 |       "idx": 7,
49 |       "version": "7",
50 |       "when": 1714298017000,
51 |       "tag": "0007_update_verification_table",
52 |       "breakpoints": true
53 |     },
54 |     {
55 |       "idx": 8,
56 |       "version": "7",
57 |       "when": 1745834185624,
58 |       "tag": "0008_alter_accounts_expiresat_type",
59 |       "breakpoints": true
60 |     },
61 |     {
62 |       "idx": 9,
63 |       "version": "7",
64 |       "when": 1745834300128,
65 |       "tag": "0009_alter_users_emailverified_type",
66 |       "breakpoints": true
67 |     },
68 |     {
69 |       "idx": 10,
70 |       "version": "7",
71 |       "when": 1745834584741,
72 |       "tag": "0010_optimal_jane_foster",
73 |       "breakpoints": true
74 |     },
75 |     {
76 |       "idx": 11,
77 |       "version": "7",
78 |       "when": 1745834720342,
79 |       "tag": "0011_fixed_cerebro",
80 |       "breakpoints": true
81 |     },
82 |     {
83 |       "idx": 12,
84 |       "version": "7",
85 |       "when": 1745834874412,
86 |       "tag": "0012_tearful_misty_knight",
87 |       "breakpoints": true
88 |     },
89 |     {
90 |       "idx": 13,
91 |       "version": "7",
92 |       "when": 1745834973270,
93 |       "tag": "0013_special_whirlwind",
94 |       "breakpoints": true
95 |     },
96 |     {
97 |       "idx": 14,
98 |       "version": "7",
99 |       "when": 1745835071348,
100 |       "tag": "0014_fair_praxagora",
101 |       "breakpoints": true
102 |     },
103 |     {
104 |       "idx": 15,
105 |       "version": "7",
106 |       "when": 1745835182901,
107 |       "tag": "0015_remarkable_owl",
108 |       "breakpoints": true
109 |     },
110 |     {
111 |       "idx": 16,
112 |       "version": "7",
113 |       "when": 1745835444568,
114 |       "tag": "0016_cooing_lester",
115 |       "breakpoints": true
116 |     },
117 |     {
118 |       "idx": 17,
119 |       "version": "7",
120 |       "when": 1746085513975,
121 |       "tag": "0017_past_bromley",
122 |       "breakpoints": true
123 |     },
124 |     {
125 |       "idx": 18,
126 |       "version": "7",
127 |       "when": 1746951564021,
128 |       "tag": "0018_conscious_dragon_man",
129 |       "breakpoints": true
130 |     },
131 |     {
132 |       "idx": 19,
133 |       "version": "7",
134 |       "when": 1746951600000,
135 |       "tag": "0019_fix_session_token",
136 |       "breakpoints": true
137 |     },
138 |     {
139 |       "idx": 20,
140 |       "version": "7",
141 |       "when": 1747039395770,
142 |       "tag": "0020_rainy_rockslide",
143 |       "breakpoints": true
144 |     },
145 |     {
146 |       "idx": 21,
147 |       "version": "7",
148 |       "when": 1747045302354,
149 |       "tag": "0021_aberrant_baron_zemo",
150 |       "breakpoints": true
151 |     }
152 |   ]
153 | }
```

lib/context/mcp-context.tsx
```
1 | "use client";
2 | 
3 | import React, { createContext, useContext, useEffect, useState } from "react";
4 | import { useLocalStorage } from "@/lib/hooks/use-local-storage";
5 | import { STORAGE_KEYS } from "@/lib/constants";
6 | 
7 | // Define types for MCP server
8 | export interface KeyValuePair {
9 |   key: string;
10 |   value: string;
11 | }
12 | 
13 | export interface MCPServer {
14 |   id: string;
15 |   name: string;
16 |   title?: string;
17 |   url: string;
18 |   type: 'sse' | 'stdio' | 'streamable-http';
19 |   command?: string;
20 |   args?: string[];
21 |   env?: KeyValuePair[];
22 |   headers?: KeyValuePair[];
23 |   description?: string;
24 |   _meta?: Record<string, any>;
25 | }
26 | 
27 | // Type for processed MCP server config for API
28 | export interface MCPServerApi {
29 |   type: 'sse' | 'stdio' | 'streamable-http';
30 |   url: string;
31 |   command?: string;
32 |   args?: string[];
33 |   env?: KeyValuePair[];
34 |   headers?: KeyValuePair[];
35 |   title?: string;
36 |   _meta?: Record<string, any>;
37 | }
38 | 
39 | interface MCPContextType {
40 |   mcpServers: MCPServer[];
41 |   setMcpServers: (servers: MCPServer[]) => void;
42 |   selectedMcpServers: string[];
43 |   setSelectedMcpServers: (serverIds: string[]) => void;
44 |   mcpServersForApi: MCPServerApi[];
45 | }
46 | 
47 | const MCPContext = createContext<MCPContextType | undefined>(undefined);
48 | 
49 | export function MCPProvider(props: { children: React.ReactNode }) {
50 |   const { children } = props;
51 |   const [mcpServers, setMcpServers] = useLocalStorage<MCPServer[]>(
52 |     STORAGE_KEYS.MCP_SERVERS, 
53 |     []
54 |   );
55 |   const [selectedMcpServers, setSelectedMcpServers] = useLocalStorage<string[]>(
56 |     STORAGE_KEYS.SELECTED_MCP_SERVERS, 
57 |     []
58 |   );
59 |   const [mcpServersForApi, setMcpServersForApi] = useState<MCPServerApi[]>([]);
60 | 
61 |   // Process MCP servers for API consumption whenever server data changes
62 |   useEffect(() => {
63 |     if (!selectedMcpServers.length) {
64 |       setMcpServersForApi([]);
65 |       return;
66 |     }
67 |     
68 |     const processedServers: MCPServerApi[] = selectedMcpServers
69 |       .map(id => mcpServers.find(server => server.id === id))
70 |       .filter((server): server is MCPServer => Boolean(server))
71 |       .map(server => ({
72 |         type: server.type,
73 |         url: server.url,
74 |         command: server.command,
75 |         args: server.args,
76 |         env: server.env,
77 |         headers: server.headers,
78 |         title: server.title,
79 |         _meta: server._meta
80 |       }));
81 |     
82 |     setMcpServersForApi(processedServers);
83 |   }, [mcpServers, selectedMcpServers]);
84 | 
85 |   return (
86 |     <MCPContext.Provider 
87 |       value={{ 
88 |         mcpServers, 
89 |         setMcpServers, 
90 |         selectedMcpServers, 
91 |         setSelectedMcpServers,
92 |         mcpServersForApi 
93 |       }}
94 |     >
95 |       {children}
96 |     </MCPContext.Provider>
97 |   );
98 | }
99 | 
100 | export function useMCP() {
101 |   const context = useContext(MCPContext);
102 |   if (context === undefined) {
103 |     throw new Error("useMCP must be used within an MCPProvider");
104 |   }
105 |   return context;
106 | } 
```

lib/context/model-context.tsx
```
1 | "use client";
2 | 
3 | import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
4 | import { defaultModel, type modelID, MODELS } from "@/ai/providers";
5 | 
6 | interface ModelContextType {
7 |   selectedModel: modelID;
8 |   setSelectedModel: (model: modelID) => void;
9 | }
10 | 
11 | const ModelContext = createContext<ModelContextType | undefined>(undefined);
12 | 
13 | export function ModelProvider({ children }: { children: ReactNode }) {
14 |   const [selectedModel, setSelectedModelState] = useState<modelID>(defaultModel); // Always initialize with defaultModel
15 | 
16 |   useEffect(() => {
17 |     // This effect runs only on the client, after hydration
18 |     if (typeof window !== 'undefined') {
19 |       try {
20 |         const storedModel = localStorage.getItem('selected_ai_model');
21 |         if (storedModel && (MODELS as ReadonlyArray<string>).includes(storedModel)) {
22 |           setSelectedModelState(storedModel as modelID);
23 |         } else {
24 |           // If no valid model in localStorage, ensure defaultModel is set (or the first from MODELS)
25 |           // This also handles the case where defaultModel might have been updated
26 |           let initialClientModel = defaultModel;
27 |           if (!MODELS.includes(defaultModel) && MODELS.length > 0) {
28 |             initialClientModel = MODELS[0];
29 |           }
30 |           // No need to set if it's already defaultModel, but this ensures consistency
31 |           // and sets localStorage if it was missing or invalid
32 |           if (MODELS.includes(initialClientModel)) {
33 |              setSelectedModelState(initialClientModel); // This will trigger the second useEffect below
34 |           }
35 |         }
36 |       } catch (error) {
37 |         console.error("Error reading selected model from localStorage during effect", error);
38 |         // Fallback logic in case of error during localStorage read
39 |         let fallbackClientModel = defaultModel;
40 |         if (!MODELS.includes(defaultModel) && MODELS.length > 0) {
41 |           fallbackClientModel = MODELS[0];
42 |         }
43 |          if (MODELS.includes(fallbackClientModel)) {
44 |            setSelectedModelState(fallbackClientModel);
45 |          }
46 |       }
47 |     }
48 |   }, []); // Empty dependency array ensures this runs once on mount
49 | 
50 |   useEffect(() => {
51 |     if (typeof window !== 'undefined') {
52 |       try {
53 |         if (MODELS.includes(selectedModel)) {
54 |           localStorage.setItem('selected_ai_model', selectedModel);
55 |         }
56 |       } catch (error) {
57 |         console.error("Error saving selected model to localStorage", error);
58 |       }
59 |     }
60 |   }, [selectedModel]);
61 | 
62 |   const setSelectedModel = (model: modelID) => {
63 |     if (MODELS.includes(model) && model !== selectedModel) {
64 |       setSelectedModelState(model);
65 |     } else if (!MODELS.includes(model)) {
66 |       console.warn(`Attempted to set invalid model: ${model}`);
67 |       // Optionally, set to default or do nothing
68 |       // setSelectedModelState(defaultModel); 
69 |     }
70 |   };
71 | 
72 |   return (
73 |     <ModelContext.Provider value={{ selectedModel, setSelectedModel }}>
74 |       {children}
75 |     </ModelContext.Provider>
76 |   );
77 | }
78 | 
79 | export function useModel() {
80 |   const context = useContext(ModelContext);
81 |   if (context === undefined) {
82 |     throw new Error("useModel must be used within a ModelProvider");
83 |   }
84 |   return context;
85 | } 
```

lib/context/web-search-context.tsx
```
1 | "use client";
2 | 
3 | import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
4 | import { useLocalStorage } from '@/lib/hooks/use-local-storage';
5 | import { STORAGE_KEYS } from '@/lib/constants';
6 | 
7 | type WebSearchContextType = {
8 |   webSearchEnabled: boolean;
9 |   setWebSearchEnabled: Dispatch<SetStateAction<boolean>>;
10 |   webSearchContextSize: 'low' | 'medium' | 'high';
11 |   setWebSearchContextSize: Dispatch<SetStateAction<'low' | 'medium' | 'high'>>;
12 | };
13 | 
14 | const WebSearchContext = createContext<WebSearchContextType | undefined>(undefined);
15 | 
16 | interface WebSearchProviderProps {
17 |   children: ReactNode;
18 | }
19 | 
20 | export const WebSearchProvider: React.FC<WebSearchProviderProps> = ({ children }) => {
21 |   const [webSearchSettings, setWebSearchSettings] = useLocalStorage<{
22 |     enabled: boolean;
23 |     contextSize: 'low' | 'medium' | 'high';
24 |   }>(STORAGE_KEYS.WEB_SEARCH, {
25 |     enabled: false,
26 |     contextSize: 'medium'
27 |   });
28 | 
29 |   const setWebSearchEnabled = (enabled: boolean | ((prevState: boolean) => boolean)) => {
30 |     setWebSearchSettings(prev => ({ ...prev, enabled: typeof enabled === 'function' ? enabled(prev.enabled) : enabled }));
31 |   };
32 | 
33 |   const setWebSearchContextSize = (size: 'low' | 'medium' | 'high' | ((prevState: 'low' | 'medium' | 'high') => 'low' | 'medium' | 'high')) => {
34 |     setWebSearchSettings(prev => ({ ...prev, contextSize: typeof size === 'function' ? size(prev.contextSize) : size }));
35 |   };
36 | 
37 |   return (
38 |     <WebSearchContext.Provider value={{ 
39 |       webSearchEnabled: webSearchSettings.enabled, 
40 |       setWebSearchEnabled, 
41 |       webSearchContextSize: webSearchSettings.contextSize, 
42 |       setWebSearchContextSize 
43 |     }}>
44 |       {children}
45 |     </WebSearchContext.Provider>
46 |   );
47 | };
48 | 
49 | export const useWebSearch = (): WebSearchContextType => {
50 |   const context = useContext(WebSearchContext);
51 |   if (context === undefined) {
52 |     throw new Error('useWebSearch must be used within a WebSearchProvider');
53 |   }
54 |   return context;
55 | }; 
```

lib/hooks/use-chats.ts
```
1 | import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
2 | import { type Chat } from '@/lib/db/schema';
3 | import { toast } from 'sonner';
4 | 
5 | export function useChats() {
6 |   const queryClient = useQueryClient();
7 | 
8 |   // Main query to fetch chats
9 |   const {
10 |     data: chats = [],
11 |     isLoading,
12 |     error,
13 |     refetch
14 |   } = useQuery<Chat[]>({
15 |     queryKey: ['chats'],
16 |     queryFn: async () => {
17 |       const response = await fetch('/api/chats');
18 | 
19 |       if (!response.ok) {
20 |         throw new Error('Failed to fetch chats');
21 |       }
22 | 
23 |       return response.json();
24 |     },
25 |     staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
26 |     refetchOnWindowFocus: true, // Refetch when window regains focus
27 |   });
28 | 
29 |   // Mutation to delete a chat
30 |   const deleteChat = useMutation({
31 |     mutationFn: async (chatId: string) => {
32 |       const response = await fetch(`/api/chats/${chatId}`, {
33 |         method: 'DELETE'
34 |       });
35 | 
36 |       if (!response.ok) {
37 |         throw new Error('Failed to delete chat');
38 |       }
39 | 
40 |       return chatId;
41 |     },
42 |     onSuccess: (deletedChatId) => {
43 |       // Update cache by removing the deleted chat
44 |       queryClient.setQueryData<Chat[]>(['chats'], (oldChats = []) =>
45 |         oldChats.filter(chat => chat.id !== deletedChatId)
46 |       );
47 | 
48 |       toast.success('Chat deleted');
49 |     },
50 |     onError: (error) => {
51 |       console.error('Error deleting chat:', error);
52 |       toast.error('Failed to delete chat');
53 |     }
54 |   });
55 | 
56 |   // Mutation to update a chat's title
57 |   const updateChatTitle = useMutation({
58 |     mutationFn: async ({ chatId, title }: { chatId: string; title: string }) => {
59 |       const response = await fetch(`/api/chats/${chatId}`, {
60 |         method: 'PATCH',
61 |         headers: {
62 |           'Content-Type': 'application/json'
63 |         },
64 |         body: JSON.stringify({ title })
65 |       });
66 | 
67 |       if (!response.ok) {
68 |         const errorData = await response.json().catch(() => ({ message: 'Failed to update chat title' }));
69 |         throw new Error(errorData.message || 'Failed to update chat title');
70 |       }
71 | 
72 |       return response.json();
73 |     },
74 |     onMutate: async ({ chatId, title }: { chatId: string; title: string }) => {
75 |       // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
76 |       await queryClient.cancelQueries({ queryKey: ['chats'] });
77 | 
78 |       // Snapshot the previous value
79 |       const previousChats = queryClient.getQueryData<Chat[]>(['chats']);
80 | 
81 |       // Optimistically update to the new value
82 |       queryClient.setQueryData<Chat[]>(['chats'], (oldChats = []) =>
83 |         oldChats.map(chat =>
84 |           chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat
85 |         )
86 |       );
87 | 
88 |       // Return a context object with the snapshotted value
89 |       return { previousChats };
90 |     },
91 |     onError: (err, variables, context) => {
92 |       console.error('Error updating chat title:', err);
93 |       // Rollback to the previous value if optimistic update occurred
94 |       if (context?.previousChats) {
95 |         queryClient.setQueryData<Chat[]>(['chats'], context.previousChats);
96 |       }
97 |       toast.error(err.message || 'Failed to update chat title. Please try again.');
98 |     },
99 |     onSuccess: (data: Chat, variables) => {
100 |       // Update the specific chat in the cache with the server's response
101 |       queryClient.setQueryData<Chat[]>(['chats'], (oldChats = []) =>
102 |         oldChats.map(chat => (chat.id === variables.chatId ? data : chat))
103 |       );
104 |       toast.success('Chat title updated successfully!');
105 |     }
106 |   });
107 | 
108 |   // Function to invalidate chats cache for refresh
109 |   const refreshChats = () => {
110 |     queryClient.invalidateQueries({ queryKey: ['chats'] });
111 |   };
112 | 
113 |   return {
114 |     chats,
115 |     isLoading,
116 |     error,
117 |     deleteChat: deleteChat.mutate,
118 |     isDeleting: deleteChat.isPending,
119 |     updateChatTitle: updateChatTitle.mutate,
120 |     isUpdatingChatTitle: updateChatTitle.isPending,
121 |     refreshChats,
122 |     refetch
123 |   };
124 | }
```

lib/hooks/use-copy.ts
```
1 | import { useState, useCallback } from 'react';
2 | 
3 | export function useCopy(timeout = 2000) {
4 |   const [copied, setCopied] = useState(false);
5 | 
6 |   const copy = useCallback(
7 |     async (text: string) => {
8 |       if (!navigator.clipboard) {
9 |         console.error('Clipboard API not available');
10 |         return false;
11 |       }
12 |       
13 |       try {
14 |         await navigator.clipboard.writeText(text);
15 |         setCopied(true);
16 |         
17 |         setTimeout(() => {
18 |           setCopied(false);
19 |         }, timeout);
20 |         
21 |         return true;
22 |       } catch (error) {
23 |         console.error('Failed to copy text:', error);
24 |         return false;
25 |       }
26 |     },
27 |     [timeout]
28 |   );
29 | 
30 |   return { copied, copy };
31 | } 
```

lib/hooks/use-local-storage.ts
```
1 | import { useState, useEffect, useCallback } from 'react';
2 | 
3 | type SetValue<T> = T | ((val: T) => T);
4 | 
5 | /**
6 |  * Custom hook for persistent localStorage state with SSR support
7 |  * @param key The localStorage key
8 |  * @param initialValue The initial value if no value exists in localStorage
9 |  * @returns A stateful value and a function to update it
10 |  */
11 | export function useLocalStorage<T>(key: string, initialValue: T) {
12 |   // State to store our value
13 |   // Pass initial state function to useState so logic is only executed once
14 |   const [storedValue, setStoredValue] = useState<T>(initialValue);
15 | 
16 |   // Check if we're in the browser environment
17 |   const isBrowser = typeof window !== 'undefined';
18 | 
19 |   // Initialize state from localStorage or use initialValue
20 |   useEffect(() => {
21 |     if (!isBrowser) return;
22 |     
23 |     try {
24 |       const item = window.localStorage.getItem(key);
25 |       if (item) {
26 |         setStoredValue(parseJSON(item));
27 |       }
28 |     } catch (error) {
29 |       console.error(`Error reading localStorage key "${key}":`, error);
30 |     }
31 |   }, [key, isBrowser]);
32 | 
33 |   // Return a wrapped version of useState's setter function that
34 |   // persists the new value to localStorage.
35 |   const setValue = useCallback((value: SetValue<T>) => {
36 |     if (!isBrowser) return;
37 |     
38 |     try {
39 |       // Allow value to be a function so we have same API as useState
40 |       const valueToStore =
41 |         value instanceof Function ? value(storedValue) : value;
42 |       
43 |       // Save state
44 |       setStoredValue(valueToStore);
45 |       
46 |       // Save to localStorage
47 |       if (valueToStore === undefined) {
48 |         window.localStorage.removeItem(key);
49 |       } else {
50 |         window.localStorage.setItem(key, JSON.stringify(valueToStore));
51 |       }
52 |     } catch (error) {
53 |       console.error(`Error setting localStorage key "${key}":`, error);
54 |     }
55 |   }, [key, storedValue, isBrowser]);
56 | 
57 |   return [storedValue, setValue] as const;
58 | }
59 | 
60 | // Helper function to parse JSON with error handling
61 | function parseJSON<T>(value: string): T {
62 |   try {
63 |     return JSON.parse(value);
64 |   } catch {
65 |     console.error('Error parsing JSON from localStorage');
66 |     return {} as T;
67 |   }
68 | }
69 | 
70 | /**
71 |  * A hook to get a value from localStorage (read-only) with SSR support
72 |  * @param key The localStorage key
73 |  * @param defaultValue The default value if the key doesn't exist
74 |  * @returns The value from localStorage or the default value
75 |  */
76 | export function useLocalStorageValue<T>(key: string, defaultValue: T): T {
77 |   const [value] = useLocalStorage<T>(key, defaultValue);
78 |   return value;
79 | } 
```

lib/hooks/use-scroll-to-bottom.tsx
```
1 | import { useEffect, useRef, type RefObject } from 'react';
2 | 
3 | export function useScrollToBottom(): [
4 |   RefObject<HTMLDivElement>,
5 |   RefObject<HTMLDivElement>,
6 | ] {
7 |   const containerRef = useRef<HTMLDivElement>(null);
8 |   const endRef = useRef<HTMLDivElement>(null);
9 |   const isUserScrollingRef = useRef(false);
10 | 
11 |   useEffect(() => {
12 |     const container = containerRef.current;
13 |     const end = endRef.current;
14 | 
15 |     if (!container || !end) return;
16 | 
17 |     // Initial scroll to bottom
18 |     setTimeout(() => {
19 |       end.scrollIntoView({ behavior: 'instant', block: 'end' });
20 |     }, 100);
21 | 
22 |     // Track if user has manually scrolled up
23 |     const handleScroll = () => {
24 |       if (!container) return;
25 |       
26 |       const { scrollTop, scrollHeight, clientHeight } = container;
27 |       const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
28 |       
29 |       // If user is scrolled up, mark as manually scrolling
30 |       isUserScrollingRef.current = distanceFromBottom > 100;
31 |     };
32 | 
33 |     // Handle mutations
34 |     const observer = new MutationObserver((mutations) => {
35 |       if (!container || !end) return;
36 | 
37 |       // Check if mutation is related to expand/collapse
38 |       const isToggleSection = mutations.some(mutation => {
39 |         // Check if the target or parent is a motion-div (expanded content)
40 |         let target = mutation.target as HTMLElement;
41 |         let isExpand = false;
42 |         
43 |         while (target && target !== container) {
44 |           if (target.classList?.contains('motion-div')) {
45 |             isExpand = true;
46 |             break;
47 |           }
48 |           target = target.parentElement as HTMLElement;
49 |         }
50 |         return isExpand;
51 |       });
52 | 
53 |       // Don't scroll for expand/collapse actions
54 |       if (isToggleSection) return;
55 | 
56 |       // Only auto-scroll if user hasn't manually scrolled up
57 |       if (!isUserScrollingRef.current) {
58 |         // For new messages, use smooth scrolling
59 |         end.scrollIntoView({ behavior: 'smooth', block: 'end' });
60 |       }
61 |     });
62 | 
63 |     observer.observe(container, {
64 |       childList: true,
65 |       subtree: true,
66 |     });
67 | 
68 |     // Add scroll event listener
69 |     container.addEventListener('scroll', handleScroll);
70 | 
71 |     return () => {
72 |       observer.disconnect();
73 |       container.removeEventListener('scroll', handleScroll);
74 |     };
75 |   }, []);
76 | 
77 |   return [containerRef, endRef] as [RefObject<HTMLDivElement>, RefObject<HTMLDivElement>];
78 | }
```

lib/db/index.ts
```
1 | import { drizzle } from "drizzle-orm/neon-serverless";
2 | import { Pool } from "@neondatabase/serverless";
3 | import * as schema from "./schema";
4 | 
5 | // Initialize the connection pool
6 | const pool = new Pool({
7 |   connectionString: process.env.DATABASE_URL,
8 | });
9 | 
10 | // Initialize Drizzle with the connection pool and schema
11 | export const db = drizzle(pool, { schema }); 
```

lib/db/schema.ts
```
1 | import { timestamp, pgTable, text, primaryKey, json, boolean, integer } from "drizzle-orm/pg-core";
2 | import { nanoid } from "nanoid";
3 | 
4 | // Message role enum type
5 | export enum MessageRole {
6 |   USER = "user",
7 |   ASSISTANT = "assistant",
8 |   TOOL = "tool"
9 | }
10 | 
11 | export const chats = pgTable('chats', {
12 |   id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()),
13 |   userId: text('user_id').notNull(),
14 |   title: text('title').notNull().default('New Chat'),
15 |   createdAt: timestamp('created_at').defaultNow().notNull(),
16 |   updatedAt: timestamp('updated_at').defaultNow().notNull(),
17 | });
18 | 
19 | export const messages = pgTable('messages', {
20 |   id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()),
21 |   chatId: text('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
22 |   role: text('role').notNull(), // user, assistant, or tool
23 |   parts: json('parts').notNull(), // Store parts as JSON in the database
24 |   hasWebSearch: boolean('has_web_search').default(false),
25 |   webSearchContextSize: text('web_search_context_size').default('medium'), // 'low', 'medium', 'high'
26 |   createdAt: timestamp('created_at').defaultNow().notNull(),
27 | });
28 | 
29 | // Types for structured message content
30 | export type MessagePart = {
31 |   type: string;
32 |   text?: string;
33 |   toolCallId?: string;
34 |   toolName?: string;
35 |   args?: any;
36 |   result?: any;
37 |   citations?: WebSearchCitation[];
38 |   [key: string]: any;
39 | };
40 | 
41 | export type Attachment = {
42 |   type: string;
43 |   [key: string]: any;
44 | };
45 | 
46 | export type Chat = typeof chats.$inferSelect;
47 | export type Message = typeof messages.$inferSelect;
48 | export type DBMessage = {
49 |   id: string;
50 |   chatId: string;
51 |   role: string;
52 |   parts: MessagePart[];
53 |   createdAt: Date;
54 | };
55 | 
56 | // --- Better Auth Core Schema ---
57 | 
58 | export const users = pgTable("user", {
59 |   id: text("id").primaryKey().$defaultFn(() => nanoid()),
60 |   name: text("name"),
61 |   email: text("email").unique().notNull(),
62 |   emailVerified: boolean("emailVerified"),
63 |   image: text("image"),
64 |   isAnonymous: boolean("isAnonymous").default(false),
65 |   metadata: json("metadata"),
66 |   createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
67 |   updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
68 | });
69 | 
70 | export const accounts = pgTable(
71 |   "account",
72 |   {
73 |     id: text("id").primaryKey().$defaultFn(() => nanoid()),
74 |     userId: text("userId")
75 |       .notNull()
76 |       .references(() => users.id, { onDelete: "cascade" }),
77 |     providerId: text("providerId").notNull(), // e.g., "google", "github", "email"
78 |     accountId: text("accountId").notNull(), // The user's ID with the provider or email/password hash
79 |     providerType: text("providerType"), // "oauth", "email", etc. REMOVED .notNull()
80 |     accessToken: text("access_token"),
81 |     refreshToken: text("refresh_token"),
82 |     accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
83 |     tokenType: text("token_type"), // e.g., "bearer"
84 |     scope: text("scope"),
85 |     idToken: text("id_token"), // For OIDC providers like Google
86 |     sessionState: text("session_state"), // For OIDC providers
87 | 
88 |     // Fields specific to email/password - not needed for Google-only
89 |     // password: text("password"),
90 | 
91 |     createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
92 |     updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
93 |   }
94 | );
95 | 
96 | export const sessions = pgTable("session", {
97 |   id: text("id").primaryKey().$defaultFn(() => nanoid()),
98 |   sessionToken: text("sessionToken").unique().notNull(),
99 |   userId: text("userId")
100 |     .notNull()
101 |     .references(() => users.id, { onDelete: "cascade" }),
102 |   expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
103 |   ipAddress: text("ipAddress"),
104 |   userAgent: text("userAgent"),
105 |   createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
106 |   updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
107 | });
108 | 
109 | // Corrected Verification Token Schema -> Renamed Verification Schema
110 | export const verification = pgTable( // Renamed from verificationTokens
111 |   "verification", // Renamed from verificationToken
112 |   {
113 |     id: text("id").primaryKey().$defaultFn(() => nanoid()),
114 |     identifier: text("identifier").notNull(),
115 |     // token: text("token").unique().notNull(), // Removed this line
116 |     value: text("value").notNull(), // Ensure this exists as per docs (though error wasn't about this)
117 |     expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
118 |     createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
119 |     updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
120 |   }
121 | );
122 | 
123 | // --- End Better Auth Core Schema ---
124 | 
125 | // Infer types for Better Auth tables
126 | export type AuthUser = typeof users.$inferSelect;
127 | export type AuthAccount = typeof accounts.$inferSelect;
128 | export type AuthSession = typeof sessions.$inferSelect;
129 | // export type AuthVerificationToken = typeof verificationTokens.$inferSelect; // Removed old type export
130 | export type AuthVerification = typeof verification.$inferSelect; // Added new type export
131 | 
132 | export type WebSearchCitation = {
133 |   url: string;
134 |   title: string;
135 |   content?: string;
136 |   startIndex: number;
137 |   endIndex: number;
138 | };
139 | 
140 | // --- Polar Usage Events Schema ---
141 | 
142 | export const polarUsageEvents = pgTable('polar_usage_events', {
143 |   id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()), // Unique ID for the log entry
144 |   userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // Links to your existing users table
145 |   polarCustomerId: text('polar_customer_id'), // The customer ID from Polar
146 |   eventName: text('event_name').notNull(), // The name of the event (e.g., "ai-usage")
147 |   eventPayload: json('event_payload').notNull(), // The full payload sent to Polar's ingest API (e.g., { "completionTokens": 100 })
148 |   createdAt: timestamp('created_at').defaultNow().notNull(), // When this log entry was created
149 | });
150 | 
151 | export type PolarUsageEvent = typeof polarUsageEvents.$inferSelect; 
```

app/api/chat/route.ts
```
1 | import { model, type modelID, modelDetails, getLanguageModelWithKeys, createOpenRouterClientWithKey } from "@/ai/providers";
2 | import { createOpenRouter } from "@openrouter/ai-sdk-provider";
3 | import { getApiKey } from "@/ai/providers";
4 | import { streamText, type UIMessage, type LanguageModelResponseMetadata, type Message } from "ai";
5 | import { appendResponseMessages } from 'ai';
6 | import { saveChat, saveMessages, convertToDBMessages } from '@/lib/chat-store';
7 | import { nanoid } from 'nanoid';
8 | import { db } from '@/lib/db';
9 | import { chats } from '@/lib/db/schema';
10 | import { eq, and } from 'drizzle-orm';
11 | import { trackTokenUsage, hasEnoughCredits, WEB_SEARCH_COST } from '@/lib/tokenCounter';
12 | import { getRemainingCredits, getRemainingCreditsByExternalId } from '@/lib/polar';
13 | import { auth, checkMessageLimit } from '@/lib/auth';
14 | 
15 | import { experimental_createMCPClient as createMCPClient, MCPTransport } from 'ai';
16 | import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';
17 | import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
18 | import { spawn } from "child_process";
19 | 
20 | // Allow streaming responses up to 60 seconds on Hobby plan
21 | export const maxDuration = 60;
22 | 
23 | // Helper function to check if user is using their own API keys for the selected model
24 | function checkIfUsingOwnApiKeys(selectedModel: modelID, apiKeys: Record<string, string> = {}): boolean {
25 |   // Map model providers to their API key names
26 |   const providerKeyMap: Record<string, string> = {
27 |     'openai': 'OPENAI_API_KEY',
28 |     'anthropic': 'ANTHROPIC_API_KEY',
29 |     'groq': 'GROQ_API_KEY',
30 |     'xai': 'XAI_API_KEY',
31 |     'openrouter': 'OPENROUTER_API_KEY',
32 |     'requesty': 'REQUESTY_API_KEY'
33 |   };
34 | 
35 |   // Extract provider from model ID
36 |   const provider = selectedModel.split('/')[0];
37 |   const requiredApiKey = providerKeyMap[provider];
38 | 
39 |   if (!requiredApiKey) {
40 |     return false; // Unknown provider
41 |   }
42 | 
43 |   // Check if user has provided their own API key for this provider
44 |   const hasApiKey = Boolean(apiKeys[requiredApiKey] && apiKeys[requiredApiKey].trim().length > 0);
45 | 
46 |   return hasApiKey;
47 | }
48 | 
49 | interface KeyValuePair {
50 |   key: string;
51 |   value: string;
52 | }
53 | 
54 | interface MCPServerConfig {
55 |   url: string;
56 |   type: 'sse' | 'stdio' | 'streamable-http';
57 |   command?: string;
58 |   args?: string[];
59 |   env?: KeyValuePair[];
60 |   headers?: KeyValuePair[];
61 | }
62 | 
63 | interface WebSearchOptions {
64 |   enabled: boolean;
65 |   contextSize: 'low' | 'medium' | 'high';
66 | }
67 | 
68 | interface UrlCitation {
69 |   url: string;
70 |   title: string;
71 |   content?: string;
72 |   start_index: number;
73 |   end_index: number;
74 | }
75 | 
76 | interface Annotation {
77 |   type: string;
78 |   url_citation: UrlCitation;
79 | }
80 | 
81 | interface OpenRouterResponse extends LanguageModelResponseMetadata {
82 |   readonly messages: Message[];
83 |   annotations?: Annotation[];
84 |   body?: unknown;
85 | }
86 | 
87 | // Helper to create standardized error responses
88 | const createErrorResponse = (
89 |   code: string,
90 |   message: string,
91 |   status: number,
92 |   details?: string
93 | ) => {
94 |   return new Response(
95 |     JSON.stringify({ error: { code, message, details } }),
96 |     { status, headers: { "Content-Type": "application/json" } }
97 |   );
98 | };
99 | 
100 | export async function POST(req: Request) {
101 |   const {
102 |     messages,
103 |     chatId,
104 |     selectedModel,
105 |     mcpServers: initialMcpServers = [],
106 |     webSearch = { enabled: false, contextSize: 'medium' },
107 |     apiKeys = {}
108 |   }: {
109 |     messages: UIMessage[];
110 |     chatId?: string;
111 |     selectedModel: modelID;
112 |     mcpServers?: MCPServerConfig[];
113 |     webSearch?: WebSearchOptions;
114 |     apiKeys?: Record<string, string>;
115 |   } = await req.json();
116 | 
117 |   let mcpServers = initialMcpServers;
118 | 
119 |   // Disable MCP servers for DeepSeek R1 models
120 |   if (
121 |     selectedModel === "openrouter/deepseek/deepseek-r1" ||
122 |     selectedModel === "openrouter/deepseek/deepseek-r1-0528" ||
123 |     selectedModel === "openrouter/deepseek/deepseek-r1-0528-qwen3-8b"
124 |     //selectedModel === "openrouter/x-ai/grok-3-beta" ||
125 |     //selectedModel === "openrouter/x-ai/grok-3-mini-beta" ||
126 |     //selectedModel === "openrouter/x-ai/grok-3-mini-beta-reasoning-high"
127 |   ) {
128 |     mcpServers = [];
129 |   }
130 | 
131 |   // Get the authenticated session (including anonymous users)
132 |   const session = await auth.api.getSession({ headers: req.headers });
133 | 
134 |   // If no session exists, return error
135 |   if (!session || !session.user || !session.user.id) {
136 |     return createErrorResponse(
137 |       "AUTHENTICATION_REQUIRED",
138 |       "Authentication required. Please log in.",
139 |       401
140 |     );
141 |   }
142 | 
143 |   const userId = session.user.id;
144 |   const isAnonymous = (session.user as any).isAnonymous === true;
145 | 
146 |   // Try to get the Polar customer ID from session
147 |   const polarCustomerId: string | undefined = (session.user as any)?.polarCustomerId ||
148 |     (session.user as any)?.metadata?.polarCustomerId;
149 | 
150 |   // Estimate ~30 tokens per message as a basic check
151 |   const estimatedTokens = 30;
152 | 
153 |   // Check if user is using their own API keys
154 |   const isUsingOwnApiKeys = checkIfUsingOwnApiKeys(selectedModel, apiKeys);
155 |   console.log(`[Debug] User ${userId} - isUsingOwnApiKeys: ${isUsingOwnApiKeys}`);
156 | 
157 |   // 1. Check if user has sufficient credits (if they have a Polar account and not using own keys)
158 |   let hasCredits = false;
159 |   let actualCredits: number | null = null;
160 |   console.log(`[Debug] User ${userId} - isAnonymous: ${isAnonymous}, polarCustomerId: ${polarCustomerId}`);
161 | 
162 |   // Skip credit checks entirely if user is using their own API keys
163 |   if (isUsingOwnApiKeys) {
164 |     console.log(`[Debug] User ${userId} is using own API keys, skipping credit checks`);
165 |     hasCredits = true; // Allow request to proceed
166 |   } else {
167 |     try {
168 |       // Check credits using both the external ID (userId) and legacy polarCustomerId
169 |       // Pass isAnonymous flag to skip Polar checks for anonymous users
170 |       // Pass selectedModel to check for premium model access
171 |       hasCredits = await hasEnoughCredits(polarCustomerId, userId, estimatedTokens, isAnonymous, selectedModel);
172 |       console.log(`[Debug] hasEnoughCredits result: ${hasCredits}`);
173 | 
174 |       // Also get the actual credit balance to check for negative balances
175 |       if (!isAnonymous) {
176 |         if (userId) {
177 |           try {
178 |             actualCredits = await getRemainingCreditsByExternalId(userId);
179 |             console.log(`[Debug] Actual credits for user ${userId}: ${actualCredits}`);
180 |           } catch (error) {
181 |             console.warn('Error getting actual credits by external ID:', error);
182 |             // Fall back to legacy method
183 |             if (polarCustomerId) {
184 |               try {
185 |                 actualCredits = await getRemainingCredits(polarCustomerId);
186 |                 console.log(`[Debug] Actual credits via legacy method: ${actualCredits}`);
187 |               } catch (legacyError) {
188 |                 console.warn('Error getting actual credits by legacy method:', legacyError);
189 |               }
190 |             }
191 |           }
192 |         }
193 |       }
194 |     } catch (error: any) {
195 |       // Log but continue - don't block users if credit check fails
196 |       console.error('[CreditCheckError] Error checking credits:', error);
197 |       // Potentially return a specific error if this failure is critical
198 |       // For now, matches existing behavior of allowing request if check fails.
199 |     }
200 |   }
201 | 
202 |   // 2. Check for negative credit balance - block if user has negative credits (skip if using own API keys)
203 |   if (!isUsingOwnApiKeys && !isAnonymous && actualCredits !== null && actualCredits < 0) {
204 |     console.log(`[Debug] User ${userId} has negative credits (${actualCredits}), blocking request`);
205 |     return createErrorResponse(
206 |       "INSUFFICIENT_CREDITS",
207 |       `Your account has a negative credit balance (${actualCredits}). Please purchase more credits to continue.`,
208 |       402,
209 |       `User has ${actualCredits} credits`
210 |     );
211 |   }
212 | 
213 |   // 2.5. Check Web Search credit requirement - ensure user has enough credits for web search (skip if using own API keys)
214 | 
215 |   // SECURITY FIX: Don't trust client's webSearch.enabled, determine server-side
216 |   let serverSideWebSearchEnabled = false;
217 | 
218 |   // Only enable web search if user actually has credits AND not anonymous AND not using own keys
219 |   if (!isUsingOwnApiKeys && !isAnonymous && actualCredits !== null && actualCredits >= WEB_SEARCH_COST) {
220 |     // User has sufficient credits, allow them to use web search if requested
221 |     serverSideWebSearchEnabled = webSearch.enabled;
222 |   } else if (isUsingOwnApiKeys && webSearch.enabled) {
223 |     // Users with own API keys can use web search if they requested it
224 |     serverSideWebSearchEnabled = true;
225 |   }
226 | 
227 |   // Block unpaid attempts
228 |   if (webSearch.enabled && !serverSideWebSearchEnabled) {
229 |     if (isAnonymous) {
230 |       console.log(`[Security] Anonymous user ${userId} tried to use Web Search, blocking request`);
231 |       return createErrorResponse(
232 |         "FEATURE_RESTRICTED",
233 |         "Web Search is only available to signed-in users with credits. Please sign in and purchase credits to use this feature.",
234 |         403,
235 |         "Anonymous users cannot use Web Search"
236 |       );
237 |     }
238 | 
239 |     if (actualCredits !== null && actualCredits < WEB_SEARCH_COST) {
240 |       console.log(`[Security] User ${userId} tried to bypass Web Search payment (${actualCredits} < ${WEB_SEARCH_COST})`);
241 |       return createErrorResponse(
242 |         "INSUFFICIENT_CREDITS",
243 |         `You need at least ${WEB_SEARCH_COST} credits to use Web Search. Your balance is ${actualCredits}.`,
244 |         402,
245 |         `User attempted to bypass Web Search payment with ${actualCredits} credits`
246 |       );
247 |     }
248 |   }
249 | 
250 |   // Use server-determined web search status instead of client's request
251 |   const secureWebSearch = {
252 |     enabled: serverSideWebSearchEnabled,
253 |     contextSize: webSearch.contextSize
254 |   };
255 | 
256 |   // 3. If user has credits or is using own API keys, allow request (skip daily message limit)
257 |   console.log(`[Debug] Credit check: !isAnonymous=${!isAnonymous}, hasCredits=${hasCredits}, actualCredits=${actualCredits}, isUsingOwnApiKeys=${isUsingOwnApiKeys}, will skip limit check: ${(!isAnonymous && hasCredits) || isUsingOwnApiKeys}`);
258 | 
259 |   if ((!isAnonymous && hasCredits) || isUsingOwnApiKeys) {
260 |     console.log(`[Debug] User ${userId} ${isUsingOwnApiKeys ? 'using own API keys' : 'has credits'}, skipping message limit check`);
261 |     // proceed
262 |   } else {
263 |     console.log(`[Debug] User ${userId} entering message limit check - isAnonymous: ${isAnonymous}`);
264 |     // 4. Otherwise, check message limit based on authentication status
265 |     const limitStatus = await checkMessageLimit(userId, isAnonymous);
266 |     console.log(`[Debug] limitStatus:`, limitStatus);
267 | 
268 |     // Log message usage for anonymous users
269 |     if (isAnonymous) {
270 |       const used = limitStatus.limit - limitStatus.remaining;
271 |       console.log(`[Anonymous User ${userId}] Messages used: ${used}/${limitStatus.limit}, Remaining: ${limitStatus.remaining}`);
272 |     }
273 | 
274 |     if (limitStatus.hasReachedLimit) {
275 |       return new Response(
276 |         JSON.stringify({
277 |           error: "Message limit reached",
278 |           message: `You've reached your daily limit of ${limitStatus.limit} messages. ${isAnonymous ? "Sign in with Google to get more messages." : "Purchase credits to continue."}`,
279 |           limit: limitStatus.limit,
280 |           remaining: limitStatus.remaining
281 |         }),
282 |         { status: 429, headers: { "Content-Type": "application/json" } }
283 |       );
284 |     }
285 |   }
286 | 
287 |   const id = chatId || nanoid();
288 | 
289 |   // Check if chat already exists for the given ID
290 |   // If not, we'll create it in onFinish
291 |   let isNewChat = false;
292 |   if (chatId) {
293 |     try {
294 |       const existingChat = await db.query.chats.findFirst({
295 |         where: and(
296 |           eq(chats.id, chatId),
297 |           eq(chats.userId, userId)
298 |         )
299 |       });
300 |       isNewChat = !existingChat;
301 |     } catch (error) {
302 |       console.error("Error checking for existing chat:", error);
303 |       // Continue anyway, we'll create the chat in onFinish
304 |       isNewChat = true;
305 |     }
306 |   } else {
307 |     // No ID provided, definitely new
308 |     isNewChat = true;
309 |   }
310 | 
311 |   // Prepare messages for the model
312 |   const modelMessages: UIMessage[] = [...messages];
313 | 
314 |   if (
315 |     selectedModel === "openrouter/deepseek/deepseek-r1" ||
316 |     // selectedModel === "openrouter/x-ai/grok-3-beta" ||
317 |     // selectedModel === "openrouter/x-ai/grok-3-mini-beta" ||
318 |     // selectedModel === "openrouter/x-ai/grok-3-mini-beta-reasoning-high" ||
319 |     selectedModel === "openrouter/qwen/qwq-32b"
320 |   ) {
321 |     const systemContent = "Please provide your reasoning within <think> tags. After closing the </think> tag, provide your final answer directly without any other special tags.";
322 |     modelMessages.unshift({
323 |       role: "system",
324 |       id: nanoid(), // Ensure a unique ID for the system message
325 |       content: systemContent, // Add top-level content
326 |       parts: [{ type: "text", text: systemContent }]
327 |     });
328 |   }
329 | 
330 |   // Pre-emptively save the chat if it's new
331 |   if (isNewChat) {
332 |     try {
333 |       await saveChat({
334 |         id, // The generated or provided chatId
335 |         userId,
336 |         messages: [], // Start with empty messages, will be updated in onFinish
337 |         selectedModel,
338 |         apiKeys,
339 |       });
340 |       console.log(`[Chat ${id}] Pre-emptively created chat record.`);
341 |     } catch (error) {
342 |       console.error(`[Chat ${id}] Error pre-emptively creating chat:`, error);
343 |       // Decide if we should bail out or continue. For now, let's continue
344 |       // but the onFinish save might fail later if the chat wasn't created.
345 |       // If this is critical, we could return an error:
346 |       // return createErrorResponse("DATABASE_ERROR", "Failed to initialize chat session.", 500, error.message);
347 |     }
348 |   }
349 | 
350 |   // Initialize tools
351 |   let tools = {};
352 |   const mcpClients: any[] = [];
353 | 
354 |   // Process each MCP server configuration
355 |   for (const mcpServer of mcpServers) {
356 |     try {
357 |       // Create appropriate transport based on type
358 |       let finalTransportForClient: MCPTransport | { type: 'sse', url: string, headers?: Record<string, string> };
359 | 
360 |       if (mcpServer.type === 'sse') {
361 |         const headers: Record<string, string> = {};
362 |         if (mcpServer.headers && mcpServer.headers.length > 0) {
363 |           mcpServer.headers.forEach(header => {
364 |             if (header.key) headers[header.key] = header.value || '';
365 |           });
366 |         }
367 |         finalTransportForClient = {
368 |           type: 'sse' as const,
369 |           url: mcpServer.url,
370 |           headers: Object.keys(headers).length > 0 ? headers : undefined
371 |         };
372 |       } else if (mcpServer.type === 'streamable-http') {
373 |         const headers: Record<string, string> = {};
374 |         if (mcpServer.headers && mcpServer.headers.length > 0) {
375 |           mcpServer.headers.forEach(header => {
376 |             if (header.key) headers[header.key] = header.value || '';
377 |           });
378 |         }
379 |         // Use StreamableHTTPClientTransport from @modelcontextprotocol/sdk
380 |         const transportUrl = new URL(mcpServer.url);
381 |         finalTransportForClient = new StreamableHTTPClientTransport(transportUrl, {
382 |           // sessionId: nanoid(), // Optionally, provide a session ID if your server uses it
383 |           requestInit: {
384 |             headers: {
385 |               'MCP-Protocol-Version': '2025-06-18', // Required for MCP 1.13.0+
386 |               ...headers // Spread existing headers after protocol version
387 |             }
388 |           }
389 |         });
390 |       } else if (mcpServer.type === 'stdio') {
391 |         if (!mcpServer.command || !mcpServer.args || mcpServer.args.length === 0) {
392 |           console.warn("Skipping stdio MCP server due to missing command or args");
393 |           continue;
394 |         }
395 |         const env: Record<string, string> = {};
396 |         if (mcpServer.env && mcpServer.env.length > 0) {
397 |           mcpServer.env.forEach(envVar => {
398 |             if (envVar.key) env[envVar.key] = envVar.value || '';
399 |           });
400 |         }
401 |         // Check for uvx pattern
402 |         if (mcpServer.command === 'uvx') {
403 |           // Ensure uv is installed, which provides uvx
404 |           console.log("Ensuring uv (for uvx) is installed...");
405 |           let uvInstalled = false;
406 |           const installUvSubprocess = spawn('pip3', ['install', 'uv']);
407 |           // Capture output for debugging
408 |           let uvInstallStdout = '';
409 |           let uvInstallStderr = '';
410 |           installUvSubprocess.stdout.on('data', (data) => { uvInstallStdout += data.toString(); });
411 |           installUvSubprocess.stderr.on('data', (data) => { uvInstallStderr += data.toString(); });
412 | 
413 |           await new Promise<void>((resolve) => {
414 |             installUvSubprocess.on('close', (code: number) => {
415 |               if (code !== 0) {
416 |                 console.error(`Failed to install uv using pip3: exit code ${code}`);
417 |                 console.error('pip3 stdout:', uvInstallStdout);
418 |                 console.error('pip3 stderr:', uvInstallStderr);
419 |               } else {
420 |                 console.log("uv installed or already present.");
421 |                 if (uvInstallStdout) console.log('pip3 stdout:', uvInstallStdout);
422 |                 if (uvInstallStderr) console.log('pip3 stderr:', uvInstallStderr);
423 |                 uvInstalled = true;
424 |               }
425 |               resolve();
426 |             });
427 |             installUvSubprocess.on('error', (err) => {
428 |               console.error("Error spawning pip3 to install uv:", err);
429 |               resolve(); // Resolve anyway
430 |             });
431 |           });
432 | 
433 |           if (!uvInstalled) {
434 |             console.warn("Skipping uvx command: Failed to ensure uv installation.");
435 |             continue;
436 |           }
437 | 
438 |           // Do NOT modify the command or args. Let StdioMCPTransport run uvx directly.
439 |           console.log(`Proceeding to spawn uvx command directly.`);
440 |         }
441 |         // If python is passed in the command, install the python package mentioned in args after -m
442 |         else if (mcpServer.command.includes('python3')) {
443 |           const packageName = mcpServer.args[mcpServer.args.indexOf('-m') + 1];
444 |           console.log("Attempting to install python package using uv:", packageName);
445 |           // Use uv to install the package
446 |           const subprocess = spawn('uv', ['pip', 'install', packageName]);
447 |           subprocess.on('close', (code: number) => {
448 |             if (code !== 0) {
449 |               console.error(`Failed to install python package ${packageName} using uv: ${code}`);
450 |             } else {
451 |               console.log(`Successfully installed python package ${packageName} using uv.`);
452 |             }
453 |           });
454 |           // wait for the subprocess to finish
455 |           await new Promise<void>((resolve) => {
456 |             subprocess.on('close', () => resolve());
457 |             subprocess.on('error', (err) => {
458 |               console.error(`Error spawning uv command for package ${packageName}:`, err);
459 |               resolve(); // Resolve anyway to avoid hanging
460 |             });
461 |           });
462 |         }
463 | 
464 |         // Log the final command and args before spawning for stdio
465 |         console.log(`Spawning StdioMCPTransport with command: '${mcpServer.command}' and args:`, mcpServer.args);
466 | 
467 |         finalTransportForClient = new StdioMCPTransport({
468 |           command: mcpServer.command!,
469 |           args: mcpServer.args!,
470 |           env: Object.keys(env).length > 0 ? env : undefined
471 |         });
472 |       } else {
473 |         console.warn(`Skipping MCP server with unsupported transport type: ${(mcpServer as any).type}`);
474 |         continue;
475 |       }
476 | 
477 |       const mcpClient = await createMCPClient({ transport: finalTransportForClient });
478 |       mcpClients.push(mcpClient);
479 | 
480 |       const mcptools = await mcpClient.tools();
481 | 
482 |       console.log(`MCP tools from ${mcpServer.type} transport:`, Object.keys(mcptools));
483 | 
484 |       // Add MCP tools to tools object
485 |       tools = { ...tools, ...mcptools };
486 |     } catch (error) {
487 |       console.error("Failed to initialize MCP client:", error);
488 |       // Continue with other servers instead of failing the entire request
489 |       // If any MCP client is essential, we might return an error here:
490 |       // return createErrorResponse("MCP_CLIENT_ERROR", "Failed to initialize a required external tool.", 500, error.message);
491 |     }
492 |   }
493 | 
494 |   // Register cleanup for all clients
495 |   if (mcpClients.length > 0) {
496 |     req.signal.addEventListener('abort', async () => {
497 |       for (const client of mcpClients) {
498 |         try {
499 |           await client.close();
500 |         } catch (error) {
501 |           console.error("Error closing MCP client:", error);
502 |         }
503 |       }
504 |     });
505 |   }
506 | 
507 |   console.log("messages", messages);
508 |   console.log("parts", messages.map(m => m.parts.map(p => p)));
509 | 
510 |   // Log web search status
511 |   if (secureWebSearch.enabled) {
512 |     console.log(`[Web Search] ENABLED with context size: ${secureWebSearch.contextSize}`);
513 |   } else {
514 |     console.log(`[Web Search] DISABLED`);
515 |   }
516 | 
517 |   let modelInstance;
518 |   let effectiveWebSearchEnabled = secureWebSearch.enabled; // Initialize with requested value
519 | 
520 |   // Check if the selected model supports web search
521 |   const currentModelDetails = modelDetails[selectedModel];
522 |   if (secureWebSearch.enabled && selectedModel.startsWith("openrouter/")) {
523 |     if (currentModelDetails?.supportsWebSearch === true) {
524 |       // Model supports web search, use :online variant
525 |       const openrouterModelId = selectedModel.replace("openrouter/", "") + ":online";
526 |       const openrouterClient = createOpenRouterClientWithKey(apiKeys?.['OPENROUTER_API_KEY']);
527 |       // For DeepSeek R1, Grok 3 Beta, Grok 3 Mini Beta, Grok 3 Mini Beta (High Reasoning), and Qwen 32B, explicitly disable logprobs
528 |       if (
529 |         selectedModel === "openrouter/deepseek/deepseek-r1" ||
530 |         selectedModel === "openrouter/deepseek/deepseek-r1-0528-qwen3-8b" ||
531 |         selectedModel === "openrouter/x-ai/grok-3-beta" ||
532 |         selectedModel === "openrouter/x-ai/grok-3-mini-beta" ||
533 |         selectedModel === "openrouter/x-ai/grok-3-mini-beta-reasoning-high" ||
534 |         selectedModel === "openrouter/qwen/qwq-32b"
535 |       ) {
536 |         modelInstance = openrouterClient(openrouterModelId, { logprobs: false });
537 |       } else {
538 |         modelInstance = openrouterClient(openrouterModelId);
539 |       }
540 |       console.log(`[Web Search] Enabled for ${selectedModel} using ${openrouterModelId}`);
541 |     } else {
542 |       // Model does not support web search, or flag is not explicitly true
543 |       effectiveWebSearchEnabled = false;
544 |       modelInstance = getLanguageModelWithKeys(selectedModel, apiKeys);
545 |       console.log(`[Web Search] Requested for ${selectedModel}, but not supported or not enabled for this model. Using standard model.`);
546 |     }
547 |   } else {
548 |     // Web search not enabled in request or model is not an OpenRouter model
549 |     if (secureWebSearch.enabled) {
550 |       console.log(`[Web Search] Requested but ${selectedModel} is not an OpenRouter model or web search support unknown. Disabling web search for this call.`);
551 |     }
552 |     effectiveWebSearchEnabled = false;
553 |     modelInstance = getLanguageModelWithKeys(selectedModel, apiKeys);
554 |   }
555 | 
556 |   const modelOptions: { // Add type for clarity and to allow logprobs
557 |     web_search_options?: { search_context_size: 'low' | 'medium' | 'high' };
558 |     logprobs?: boolean;
559 |   } = {};
560 | 
561 |   if (effectiveWebSearchEnabled) {
562 |     modelOptions.web_search_options = {
563 |       search_context_size: secureWebSearch.contextSize
564 |     };
565 |   }
566 | 
567 |   // Always set logprobs: false for these models at the providerOptions level for streamText
568 |   if (
569 |     selectedModel === "openrouter/deepseek/deepseek-r1" ||
570 |     selectedModel === "openrouter/deepseek/deepseek-r1-0528-qwen3-8b" ||
571 |     selectedModel === "openrouter/x-ai/grok-3-beta" ||
572 |     selectedModel === "openrouter/x-ai/grok-3-mini-beta" ||
573 |     selectedModel === "openrouter/x-ai/grok-3-mini-beta-reasoning-high" ||
574 |     selectedModel === "openrouter/qwen/qwq-32b"
575 |   ) {
576 |     modelOptions.logprobs = false;
577 |   }
578 | 
579 |   // Enhanced security logging
580 |   if (webSearch.enabled && !serverSideWebSearchEnabled) {
581 |     console.error(`[SECURITY ALERT] User ${userId} attempted to bypass Web Search payment:`, {
582 |       userId,
583 |       isAnonymous,
584 |       actualCredits,
585 |       isUsingOwnApiKeys,
586 |       userAgent: req.headers.get('user-agent'),
587 |       requestTime: new Date().toISOString(),
588 |       sessionInfo: {
589 |         email: session.user.email,
590 |         name: session.user.name
591 |       }
592 |     });
593 |   }
594 | 
595 |   // Construct the payload for OpenRouter
596 |   const openRouterPayload = {
597 |     model: modelInstance,
598 |     system: `You are a helpful AI assistant. Today's date is ${new Date().toISOString().split('T')[0]}.
599 | 
600 |     You have access to external tools provided by connected servers. These tools can perform specific actions like running code, searching databases, or accessing external services.
601 | 
602 |     ${effectiveWebSearchEnabled ? `
603 |     ## Web Search Enabled:
604 |     You have web search capabilities enabled. When you use web search:
605 |     1. Cite your sources using markdown links
606 |     2. Use the format [domain.com](full-url) for citations
607 |     3. Only cite reliable and relevant sources
608 |     4. Integrate the information naturally into your responses
609 |     ` : ''}
610 | 
611 |     ## How to Respond:
612 |     1.  **Analyze the Request:** Understand what the user is asking.
613 |     2.  **Use Tools When Necessary:** If an external tool provides the best way to answer (e.g., fetching specific data, performing calculations, interacting with services), select the most relevant tool(s) and use them. You can use multiple tools in sequence. Clearly indicate when you are using a tool and what it's doing.
614 |     3.  **Use Your Own Abilities:** For requests involving brainstorming, explanation, writing, summarization, analysis, or general knowledge, rely on your own reasoning and knowledge base. You don't need to force the use of an external tool if it's not suitable or required for these tasks.
615 |     4.  **Respond Clearly:** Provide your answer directly when using your own abilities. If using tools, explain the steps taken and present the results clearly.
616 |     5.  **Handle Limitations:** If you cannot answer fully (due to lack of information, missing tools, or capability limits), explain the limitation clearly. Don't just say "I don't know" if you can provide partial information or explain *why* you can't answer. If relevant tools seem to be missing, you can mention that the user could potentially add them via the server configuration.
617 | 
618 |     ## Response Format:
619 |     - Use Markdown for formatting.
620 |     - Base your response on the results from any tools used, or on your own reasoning and knowledge.
621 |     `,
622 |     messages: modelMessages,
623 |     tools,
624 |     maxSteps: 20,
625 |     providerOptions: {
626 |       google: {
627 |         thinkingConfig: {
628 |           thinkingBudget: 2048,
629 |         },
630 |       },
631 |       anthropic: {
632 |         thinking: {
633 |           type: 'enabled',
634 |           budgetTokens: 12000
635 |         },
636 |       },
637 |       openrouter: modelOptions
638 |     },
639 |     onError: (error: any) => {
640 |       console.error(`[streamText.onError][Chat ${id}] Error during LLM stream:`, JSON.stringify(error, null, 2));
641 |     },
642 |     async onFinish(event: any) {
643 |       // Minimal fix: cast event.response to OpenRouterResponse
644 |       const response = event.response as OpenRouterResponse;
645 |       const allMessages = appendResponseMessages({
646 |         messages: modelMessages,
647 |         responseMessages: response.messages as any, // Cast to any to bypass type error
648 |       });
649 | 
650 |       // Extract citations from response messages
651 |       const processedMessages = allMessages.map(msg => {
652 |         if (msg.role === 'assistant' && (response.annotations?.length)) {
653 |           const citations = response.annotations
654 |             .filter((a: Annotation) => a.type === 'url_citation')
655 |             .map((c: Annotation) => ({
656 |               url: c.url_citation.url,
657 |               title: c.url_citation.title,
658 |               content: c.url_citation.content,
659 |               startIndex: c.url_citation.start_index,
660 |               endIndex: c.url_citation.end_index
661 |             }));
662 | 
663 |           // Add citations to message parts if they exist
664 |           if (citations.length > 0 && msg.parts) {
665 |             msg.parts = (msg.parts as any[]).map(part => ({
666 |               ...part,
667 |               citations
668 |             }));
669 |           }
670 |         }
671 |         return msg;
672 |       });
673 | 
674 |       // Update the chat with the full message history
675 |       // Note: saveChat here acts as an upsert based on how it's likely implemented
676 |       try {
677 |         await saveChat({
678 |           id,
679 |           userId,
680 |           messages: processedMessages as any, // Cast to any to bypass type error
681 |           selectedModel,
682 |           apiKeys,
683 |         });
684 |         console.log(`[Chat ${id}][onFinish] Successfully saved chat with all messages.`);
685 |       } catch (dbError: any) {
686 |         console.error(`[Chat ${id}][onFinish] DATABASE_ERROR saving chat:`, dbError);
687 |         // This error occurs after the stream has finished.
688 |         // We can't change the HTTP response to the client here.
689 |         // Robust logging is key.
690 |       }
691 | 
692 |       let dbMessages;
693 |       try {
694 |         dbMessages = (convertToDBMessages(processedMessages as any, id) as any[]).map(msg => ({
695 |           ...msg,
696 |           hasWebSearch: effectiveWebSearchEnabled && msg.role === 'assistant' && (response.annotations?.length || 0) > 0, // Only set true if web search was actually used
697 |           webSearchContextSize: secureWebSearch.enabled ? secureWebSearch.contextSize : undefined // Store original request if needed, or effective
698 |         }));
699 |       } catch (conversionError: any) {
700 |         console.error(`[Chat ${id}][onFinish] ERROR converting messages for DB:`, conversionError);
701 |         // If conversion fails, we cannot save messages.
702 |         // Log and potentially skip saving messages or save raw if possible.
703 |         return; // Exit onFinish early if messages can't be processed for DB.
704 |       }
705 | 
706 |       try {
707 |         await saveMessages({ messages: dbMessages });
708 |         console.log(`[Chat ${id}][onFinish] Successfully saved individual messages.`);
709 |       } catch (dbMessagesError: any) {
710 |         console.error(`[Chat ${id}][onFinish] DATABASE_ERROR saving messages:`, dbMessagesError);
711 |       }
712 | 
713 |       // Extract token usage from response - OpenRouter may provide it in different formats
714 |       let completionTokens = 0;
715 | 
716 |       // Access response with type assertion to avoid TypeScript errors
717 |       // The actual structure may vary by provider
718 |       const typedResponse = response as any;
719 | 
720 |       // Try to extract tokens from different possible response structures
721 |       if (typedResponse.usage?.completion_tokens) {
722 |         completionTokens = typedResponse.usage.completion_tokens;
723 |       } else if (typedResponse.usage?.output_tokens) {
724 |         completionTokens = typedResponse.usage.output_tokens;
725 |       } else {
726 |         // Estimate based on last message content length if available
727 |         const lastMessage = typedResponse.messages?.[typedResponse.messages.length - 1];
728 |         if (lastMessage?.content) {
729 |           // Rough estimate: 1 token ≈ 4 characters
730 |           completionTokens = Math.ceil(lastMessage.content.length / 4);
731 |         } else if (typeof typedResponse.content === 'string') {
732 |           completionTokens = Math.ceil(typedResponse.content.length / 4);
733 |         } else {
734 |           // Default minimum to track something
735 |           completionTokens = 1;
736 |         }
737 |       }
738 | 
739 |       // Existing code for tracking tokens
740 |       let polarCustomerId: string | undefined;
741 | 
742 |       // Get from session
743 |       try {
744 |         const session = await auth.api.getSession({ headers: req.headers });
745 | 
746 |         // Try to get from session first
747 |         polarCustomerId = (session?.user as any)?.polarCustomerId ||
748 |           (session?.user as any)?.metadata?.polarCustomerId;
749 |       } catch (error) {
750 |         console.warn('Failed to get session for Polar customer ID:', error);
751 |       }
752 | 
753 |       // Track token usage
754 |       if (completionTokens > 0) {
755 |         try {
756 |           // Get isAnonymous status from session if available
757 |           let isAnonymous = false;
758 |           try {
759 |             isAnonymous = (session?.user as any)?.isAnonymous === true;
760 |           } catch (error) {
761 |             console.warn('Could not determine if user is anonymous, assuming not anonymous');
762 |           }
763 | 
764 |           // Recalculate isUsingOwnApiKeys in callback scope since it's not accessible here
765 |           const callbackIsUsingOwnApiKeys = checkIfUsingOwnApiKeys(selectedModel, apiKeys);
766 | 
767 |           // Get actual credits in callback scope
768 |           let callbackActualCredits: number | null = null;
769 |           if (!isAnonymous && userId) {
770 |             try {
771 |               callbackActualCredits = await getRemainingCreditsByExternalId(userId);
772 |             } catch (error) {
773 |               console.warn('Error getting actual credits in onFinish callback:', error);
774 |             }
775 |           }
776 | 
777 |           // Determine if user should have credits deducted or just use daily message tracking
778 |           // Only deduct credits if user actually has purchased credits (positive balance) AND not using own API keys
[TRUNCATED]
```

app/api/chats/route.ts
```
1 | import { NextResponse } from "next/server";
2 | import { getChats } from "@/lib/chat-store";
3 | import { auth } from "@/lib/auth";
4 | 
5 | // Helper to get user ID from authenticated session only
6 | async function getRequestUserId(request: Request): Promise<string | null> {
7 |   // Only use authenticated session for user ID
8 |   const session = await auth.api.getSession({ headers: request.headers });
9 |   return session?.user?.id || null;
10 | }
11 | 
12 | export async function GET(request: Request) {
13 |   try {
14 |     const userId = await getRequestUserId(request);
15 | 
16 |     if (!userId) {
17 |       return NextResponse.json({ error: "Authentication required" }, { status: 401 });
18 |     }
19 | 
20 |     const chats = await getChats(userId);
21 |     return NextResponse.json(chats);
22 |   } catch (error) {
23 |     console.error("Error fetching chats:", error);
24 |     return NextResponse.json(
25 |       { error: "Failed to fetch chats" },
26 |       { status: 500 }
27 |     );
28 |   }
29 | } 
```

app/api/create-polar-customer/route.ts
```
1 | import { NextResponse } from 'next/server';
2 | import { auth } from '@/lib/auth';
3 | import { createOrUpdateCustomerWithExternalId, getCustomerByExternalId, getCustomerByEmail, updateCustomerExternalId } from '@/lib/polar';
4 | 
5 | /**
6 |  * Endpoint to manually create or update a Polar customer for testing
7 |  */
8 | export async function POST(req: Request) {
9 |     try {
10 |         // Get the authenticated session
11 |         const session = await auth.api.getSession({ headers: req.headers });
12 | 
13 |         // If no session exists, return error
14 |         if (!session || !session.user || !session.user.id) {
15 |             return NextResponse.json(
16 |                 { error: 'Unauthorized' },
17 |                 { status: 401 }
18 |             );
19 |         }
20 | 
21 |         const userId = session.user.id;
22 |         const isAnonymous = (session.user as any).isAnonymous === true;
23 |         const userEmail = session.user.email;
24 |         const userName = session.user.name;
25 | 
26 |         if (isAnonymous) {
27 |             return NextResponse.json(
28 |                 { error: 'Cannot create Polar customer for anonymous user' },
29 |                 { status: 400 }
30 |             );
31 |         }
32 | 
33 |         if (!userEmail) {
34 |             return NextResponse.json(
35 |                 { error: 'User email required to create Polar customer' },
36 |                 { status: 400 }
37 |             );
38 |         }
39 | 
40 |         console.log(`[CREATE POLAR CUSTOMER] Processing customer for user ${userId} (${userEmail})`);
41 | 
42 |         // Step 1: Check if customer already exists by external ID
43 |         let existingCustomer;
44 |         try {
45 |             existingCustomer = await getCustomerByExternalId(userId);
46 |         } catch (error) {
47 |             console.log(`[CREATE POLAR CUSTOMER] No existing customer found for external ID ${userId}`);
48 |         }
49 | 
50 |         if (existingCustomer) {
51 |             return NextResponse.json({
52 |                 success: true,
53 |                 message: 'Customer already exists with external ID',
54 |                 customer: existingCustomer,
55 |                 action: 'found_existing_by_external_id'
56 |             });
57 |         }
58 | 
59 |         // Step 2: Check if customer exists by email (but without external ID)
60 |         let customerByEmail: any;
61 |         try {
62 |             customerByEmail = await getCustomerByEmail(userEmail);
63 |             console.log(`[CREATE POLAR CUSTOMER] Customer lookup by email result:`, JSON.stringify(customerByEmail, null, 2));
64 |             console.log(`[CREATE POLAR CUSTOMER] Customer ID:`, customerByEmail?.id);
65 |             console.log(`[CREATE POLAR CUSTOMER] Customer type:`, typeof customerByEmail);
66 |         } catch (error) {
67 |             console.error(`[CREATE POLAR CUSTOMER] Error looking up customer by email:`, error);
68 |         }
69 | 
70 |         if (customerByEmail) {
71 |             // Validate that we have a customer with an ID
72 |             if (!customerByEmail.id) {
73 |                 console.error(`[CREATE POLAR CUSTOMER] Customer found but missing ID field:`, customerByEmail);
74 |                 return NextResponse.json(
75 |                     {
76 |                         error: 'Customer found but missing ID field',
77 |                         customerData: customerByEmail,
78 |                         userId,
79 |                         userEmail
80 |                     },
81 |                     { status: 500 }
82 |                 );
83 |             }
84 | 
85 |             // Customer exists by email but doesn't have the external ID set
86 |             console.log(`[CREATE POLAR CUSTOMER] Found existing customer by email: ${customerByEmail.id}. Setting external ID to ${userId}`);
87 | 
88 |             try {
89 |                 const updatedCustomer = await updateCustomerExternalId(customerByEmail.id, userId);
90 |                 console.log(`[CREATE POLAR CUSTOMER] Successfully updated customer external ID:`, updatedCustomer);
91 | 
92 |                 return NextResponse.json({
93 |                     success: true,
94 |                     message: 'Customer found by email and external ID updated successfully',
95 |                     customer: updatedCustomer,
96 |                     action: 'updated_external_id'
97 |                 });
98 |             } catch (updateError) {
99 |                 console.error(`[CREATE POLAR CUSTOMER] Error updating customer external ID:`, updateError);
100 |                 return NextResponse.json(
101 |                     {
102 |                         error: 'Failed to update customer external ID',
103 |                         details: updateError,
104 |                         customerId: customerByEmail.id,
105 |                         userId,
106 |                         userEmail
107 |                     },
108 |                     { status: 500 }
109 |                 );
110 |             }
111 |         }
112 | 
113 |         // Step 3: Create new customer (no existing customer found)
114 |         try {
115 |             const newCustomer = await createOrUpdateCustomerWithExternalId(
116 |                 userId,
117 |                 userEmail,
118 |                 userName || undefined,
119 |                 {
120 |                     source: 'manual_creation',
121 |                     created_via: 'debug_endpoint'
122 |                 }
123 |             );
124 | 
125 |             console.log(`[CREATE POLAR CUSTOMER] Successfully created customer:`, newCustomer);
126 | 
127 |             return NextResponse.json({
128 |                 success: true,
129 |                 message: 'Customer created successfully',
130 |                 customer: newCustomer,
131 |                 action: 'created_new'
132 |             });
133 | 
134 |         } catch (createError) {
135 |             console.error(`[CREATE POLAR CUSTOMER] Error creating customer:`, createError);
136 |             return NextResponse.json(
137 |                 {
138 |                     error: 'Failed to create customer',
139 |                     details: createError,
140 |                     userId,
141 |                     userEmail
142 |                 },
143 |                 { status: 500 }
144 |             );
145 |         }
146 | 
147 |     } catch (error) {
148 |         console.error('Error in create Polar customer API:', error);
149 |         return NextResponse.json(
150 |             { error: 'Internal server error', details: error },
151 |             { status: 500 }
152 |         );
153 |     }
154 | } 
```

app/api/debug-credits/route.ts
```
1 | import { NextResponse } from 'next/server';
2 | import { auth } from '@/lib/auth';
3 | import { getRemainingCredits, getRemainingCreditsByExternalId, getCustomerByExternalId } from '@/lib/polar';
4 | 
5 | /**
6 |  * Debug endpoint to help diagnose Polar credits issues
7 |  */
8 | export async function GET(req: Request) {
9 |     try {
10 |         // Get the authenticated session
11 |         const session = await auth.api.getSession({ headers: req.headers });
12 | 
13 |         // If no session exists, return error
14 |         if (!session || !session.user || !session.user.id) {
15 |             return NextResponse.json(
16 |                 { error: 'Unauthorized', debug: 'No valid session found' },
17 |                 { status: 401 }
18 |             );
19 |         }
20 | 
21 |         const userId = session.user.id;
22 |         const isAnonymous = (session.user as any).isAnonymous === true;
23 |         const polarCustomerId: string | undefined = (session.user as any)?.polarCustomerId ||
24 |             (session.user as any)?.metadata?.polarCustomerId;
25 | 
26 |         console.log(`[DEBUG CREDITS] Session info:`, {
27 |             userId,
28 |             isAnonymous,
29 |             polarCustomerId,
30 |             userEmail: session.user.email,
31 |             userName: session.user.name
32 |         });
33 | 
34 |         const debugInfo: any = {
35 |             userId,
36 |             isAnonymous,
37 |             polarCustomerId,
38 |             userEmail: session.user.email,
39 |             userName: session.user.name,
40 |             steps: []
41 |         };
42 | 
43 |         // For anonymous users, return debug info
44 |         if (isAnonymous) {
45 |             debugInfo.result = 'User is anonymous - no credits check needed';
46 |             return NextResponse.json(debugInfo);
47 |         }
48 | 
49 |         // Step 1: Try to find customer by external ID
50 |         try {
51 |             debugInfo.steps.push('Attempting to find customer by external ID...');
52 |             const customer = await getCustomerByExternalId(userId);
53 |             debugInfo.polarCustomer = customer;
54 | 
55 |             if (customer) {
56 |                 debugInfo.steps.push(`✅ Found customer: ${customer.id} (${customer.email})`);
57 |                 debugInfo.polarCustomerIdFromExternal = customer.id;
58 |             } else {
59 |                 debugInfo.steps.push('❌ No customer found by external ID');
60 |             }
61 |         } catch (error) {
62 |             debugInfo.steps.push(`❌ Error finding customer: ${error}`);
63 |             debugInfo.customerLookupError = error;
64 |         }
65 | 
66 |         // Step 2: Try to get credits via external ID
67 |         try {
68 |             debugInfo.steps.push('Attempting to get credits via external ID...');
69 |             const creditsByExternal = await getRemainingCreditsByExternalId(userId);
70 |             debugInfo.creditsByExternalId = creditsByExternal;
71 | 
72 |             if (creditsByExternal !== null) {
73 |                 debugInfo.steps.push(`✅ Credits via external ID: ${creditsByExternal}`);
74 |             } else {
75 |                 debugInfo.steps.push('❌ No credits found via external ID');
76 |             }
77 |         } catch (error) {
78 |             debugInfo.steps.push(`❌ Error getting credits via external ID: ${error}`);
79 |             debugInfo.creditsExternalError = error;
80 |         }
81 | 
82 |         // Step 3: Try legacy method if we have polarCustomerId
83 |         if (polarCustomerId) {
84 |             try {
85 |                 debugInfo.steps.push('Attempting to get credits via legacy customer ID...');
86 |                 const creditsLegacy = await getRemainingCredits(polarCustomerId);
87 |                 debugInfo.creditsByLegacyId = creditsLegacy;
88 | 
89 |                 if (creditsLegacy !== null) {
90 |                     debugInfo.steps.push(`✅ Credits via legacy ID: ${creditsLegacy}`);
91 |                 } else {
92 |                     debugInfo.steps.push('❌ No credits found via legacy ID');
93 |                 }
94 |             } catch (error) {
95 |                 debugInfo.steps.push(`❌ Error getting credits via legacy ID: ${error}`);
96 |                 debugInfo.creditsLegacyError = error;
97 |             }
98 |         } else {
99 |             debugInfo.steps.push('⚠️ No legacy polar customer ID available');
100 |         }
101 | 
102 |         // Final assessment
103 |         const finalCredits = debugInfo.creditsByExternalId ?? debugInfo.creditsByLegacyId ?? null;
104 |         debugInfo.finalCreditsResult = finalCredits;
105 |         debugInfo.canAccessPremium = finalCredits !== null && finalCredits > 0;
106 | 
107 |         return NextResponse.json(debugInfo);
108 | 
109 |     } catch (error) {
110 |         console.error('Error in debug credits API:', error);
111 |         return NextResponse.json(
112 |             { error: 'Internal server error', details: error },
113 |             { status: 500 }
114 |         );
115 |     }
116 | } 
```

app/api/portal/route.ts
```
1 | import { NextRequest, NextResponse } from "next/server";
2 | import { auth } from "@/lib/auth";
3 | import { Polar } from "@polar-sh/sdk";
4 | 
5 | // Polar server environment configuration
6 | // Use POLAR_SERVER_ENV if explicitly set, otherwise default to sandbox for safety
7 | const polarServerEnv = process.env.POLAR_SERVER_ENV === "production" ? "production" : "sandbox";
8 | 
9 | const polar = new Polar({
10 |     accessToken: process.env.POLAR_ACCESS_TOKEN!,
11 |     server: polarServerEnv,
12 | });
13 | 
14 | export async function GET(request: NextRequest) {
15 |     try {
16 |         // Get the current session
17 |         const session = await auth.api.getSession({
18 |             headers: request.headers,
19 |         });
20 | 
21 |         if (!session?.user) {
22 |             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
23 |         }
24 | 
25 |         const userId = session.user.id;
26 | 
27 |         // Get the Polar customer using external ID (the user's app ID)
28 |         try {
29 |             const customer = await polar.customers.getExternal({
30 |                 externalId: userId,
31 |             });
32 | 
33 |             // Create an authenticated customer portal session
34 |             const customerSession = await polar.customerSessions.create({
35 |                 customerId: customer.id,
36 |             });
37 | 
38 |             // Redirect to the customer portal
39 |             return NextResponse.redirect(customerSession.customerPortalUrl);
40 |         } catch (error) {
41 |             console.error("Error getting Polar customer or creating portal session:", error);
42 | 
43 |             // If customer not found, return error with helpful message
44 |             if (error instanceof Error && error.message.includes("not found")) {
45 |                 return NextResponse.json(
46 |                     { error: "Customer not found. Please contact support." },
47 |                     { status: 404 }
48 |                 );
49 |             }
50 | 
51 |             return NextResponse.json(
52 |                 { error: "Failed to access customer portal" },
53 |                 { status: 500 }
54 |             );
55 |         }
56 |     } catch (error) {
57 |         console.error("Portal API error:", error);
58 |         return NextResponse.json(
59 |             { error: "Internal server error" },
60 |             { status: 500 }
61 |         );
62 |     }
63 | } 
```

app/api/credits/route.ts
```
1 | import { NextResponse } from 'next/server';
2 | import { auth } from '@/lib/auth';
3 | import { getRemainingCredits, getRemainingCreditsByExternalId } from '@/lib/polar';
4 | 
5 | /**
6 |  * API endpoint to get credit information for the current user
7 |  */
8 | export async function GET(req: Request) {
9 |     try {
10 |         // Get the authenticated session
11 |         const session = await auth.api.getSession({ headers: req.headers });
12 | 
13 |         // If no session exists, return error
14 |         if (!session || !session.user || !session.user.id) {
15 |             console.log('[DEBUG] Credits API: No valid session found');
16 |             return NextResponse.json(
17 |                 { error: 'Unauthorized' },
18 |                 { status: 401 }
19 |             );
20 |         }
21 | 
22 |         const userId = session.user.id;
23 |         const isAnonymous = (session.user as any).isAnonymous === true;
24 |         const polarCustomerId: string | undefined = (session.user as any)?.polarCustomerId ||
25 |             (session.user as any)?.metadata?.polarCustomerId;
26 | 
27 |         console.log(`[DEBUG] Credits API: userId=${userId}, isAnonymous=${isAnonymous}, polarCustomerId=${polarCustomerId}`);
28 | 
29 |         // For anonymous users, return null credits
30 |         if (isAnonymous) {
31 |             console.log('[DEBUG] Credits API: User is anonymous, returning null credits');
32 |             return NextResponse.json({
33 |                 credits: null,
34 |                 isAnonymous: true
35 |             });
36 |         }
37 | 
38 |         let credits: number | null = null;
39 | 
40 |         try {
41 |             // Try the external ID approach first if a userId is provided
42 |             if (userId) {
43 |                 try {
44 |                     console.log(`[DEBUG] Credits API: Attempting to get credits via external ID for user ${userId}`);
45 |                     const remainingCreditsByExternal = await getRemainingCreditsByExternalId(userId);
46 |                     console.log(`[DEBUG] Credits API: External ID result: ${remainingCreditsByExternal}`);
47 |                     if (remainingCreditsByExternal !== null) {
48 |                         credits = remainingCreditsByExternal;
49 |                     }
50 |                 } catch (externalError) {
51 |                     console.warn('Failed to get credits via external ID, falling back to legacy method:', externalError);
52 |                     // Continue to legacy method
53 |                 }
54 |             }
55 | 
56 |             // Legacy method using polarCustomerId if external ID didn't work
57 |             if (credits === null && polarCustomerId) {
58 |                 console.log(`[DEBUG] Credits API: Attempting to get credits via legacy polarCustomerId ${polarCustomerId}`);
59 |                 const remainingCredits = await getRemainingCredits(polarCustomerId);
60 |                 console.log(`[DEBUG] Credits API: Legacy method result: ${remainingCredits}`);
61 |                 credits = remainingCredits;
62 |             }
63 | 
64 |             console.log(`[DEBUG] Credits API: Final credits result: ${credits}`);
65 |             return NextResponse.json({
66 |                 credits,
67 |                 isAnonymous: false
68 |             });
69 |         } catch (error) {
70 |             console.error('Error fetching credits:', error);
71 |             return NextResponse.json(
72 |                 { error: 'Failed to fetch credits' },
73 |                 { status: 500 }
74 |             );
75 |         }
76 |     } catch (error) {
77 |         console.error('Error in credits API:', error);
78 |         return NextResponse.json(
79 |             { error: 'Internal server error' },
80 |             { status: 500 }
81 |         );
82 |     }
83 | } 
```

app/api/version/route.ts
```
1 | import { NextResponse } from 'next/server';
2 | 
3 | export async function GET() {
4 |     return NextResponse.json({
5 |         commit: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
6 |         url: process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL || 'unknown',
7 |     });
8 | } 
```

app/chat/[id]/page.tsx
```
1 | "use client";
2 | 
3 | import Chat from "@/components/chat";
4 | import { useQueryClient } from "@tanstack/react-query";
5 | import { useParams } from "next/navigation";
6 | import { useEffect } from "react";
7 | 
8 | export default function ChatPage() {
9 |   const params = useParams();
10 |   const chatId = params?.id as string;
11 |   const queryClient = useQueryClient();
12 | 
13 |   // Prefetch chat data
14 |   // useEffect(() => {
15 |   //   async function prefetchChat() {
16 |   //     if (!chatId || !userId) return;
17 |   //     
18 |   //     // Check if data already exists in cache
19 |   //     const existingData = queryClient.getQueryData(['chat', chatId, userId]);
20 |   //     if (existingData) return;
21 |   //
22 |   //     // Prefetch the data
23 |   //     await queryClient.prefetchQuery({
24 |   //       queryKey: ['chat', chatId, userId] as const,
25 |   //       queryFn: async () => {
26 |   //         try {
27 |   //           const response = await fetch(`/api/chats/${chatId}`, {
28 |   //             headers: {
29 |   //               'x-user-id': userId
30 |   //             }
31 |   //           });
32 |   //           
33 |   //           if (response.status === 404) {
34 |   //             // Chat doesn't exist yet, expected for new chats. Return null silently.
35 |   //             return null;
36 |   //           }
37 |   //
38 |   //           if (!response.ok) {
39 |   //             console.error(`Prefetch failed for chat ${chatId}: Status ${response.status}`);
40 |   //             return null;
41 |   //           }
42 |   //           
43 |   //           return response.json();
44 |   //         } catch (error) {
45 |   //           console.error('Error prefetching chat:', error);
46 |   //           return null;
47 |   //         }
48 |   //       },
49 |   //       staleTime: 1000 * 60 * 5, // 5 minutes
50 |   //     });
51 |   //   }
52 |   //
53 |   //   prefetchChat();
54 |   // }, [chatId, userId, queryClient]);
55 | 
56 |   return <Chat />;
57 | } 
```

app/checkout/success/page.tsx
```
1 | import { Button } from "@/components/ui/button";
2 | import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
3 | import { CheckCircle } from "lucide-react";
4 | import Link from "next/link";
5 | 
6 | export default function CheckoutSuccessPage() {
7 |   return (
8 |     <div className="container flex items-center justify-center min-h-[calc(100vh-80px)]">
9 |       <Card className="w-full max-w-md shadow-lg">
10 |         <CardHeader className="text-center">
11 |           <div className="flex justify-center mb-4">
12 |             <CheckCircle size={48} className="text-green-500" />
13 |           </div>
14 |           <CardTitle className="text-2xl">Payment Successful!</CardTitle>
15 |           <CardDescription>
16 |             Thank you for your purchase
17 |           </CardDescription>
18 |         </CardHeader>
19 |         <CardContent className="text-center">
20 |           <p className="mb-4">
21 |             Your AI credits have been added to your account and are ready to use.
22 |           </p>
23 |           <p className="text-sm text-muted-foreground">
24 |             It may take a moment for your credits to appear in your account.
25 |           </p>
26 |         </CardContent>
27 |         <CardFooter className="flex justify-center">
28 |           <Link href="/">
29 |             <Button size="lg">
30 |               Return to Chat
31 |             </Button>
32 |           </Link>
33 |         </CardFooter>
34 |       </Card>
35 |     </div>
36 |   );
37 | } 
```

app/checkout/error/page.tsx
```
1 | import { Button } from "@/components/ui/button";
2 | import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
3 | import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
4 | import Link from "next/link";
5 | 
6 | interface CheckoutErrorPageProps {
7 |   searchParams: {
8 |     reason?: string;
9 |     checkout_id?: string;
10 |   };
11 | }
12 | 
13 | export default function CheckoutErrorPage({ searchParams }: CheckoutErrorPageProps) {
14 |   const { reason, checkout_id } = searchParams;
15 |   
16 |   const getErrorMessage = (reason?: string) => {
17 |     switch (reason) {
18 |       case 'canceled':
19 |         return {
20 |           title: 'Checkout Canceled',
21 |           description: 'You canceled the payment process.',
22 |           suggestion: 'No worries! You can try again whenever you\'re ready.'
23 |         };
24 |       case 'failed':
25 |         return {
26 |           title: 'Payment Failed',
27 |           description: 'There was an issue processing your payment.',
28 |           suggestion: 'Please check your payment method and try again.'
29 |         };
30 |       default:
31 |         return {
32 |           title: 'Checkout Error',
33 |           description: 'Something went wrong during the checkout process.',
34 |           suggestion: 'Please try again or contact support if the issue persists.'
35 |         };
36 |     }
37 |   };
38 | 
39 |   const errorInfo = getErrorMessage(reason);
40 | 
41 |   return (
42 |     <div className="container flex items-center justify-center min-h-[calc(100vh-80px)]">
43 |       <Card className="w-full max-w-md shadow-lg">
44 |         <CardHeader className="text-center">
45 |           <div className="flex justify-center mb-4">
46 |             <XCircle size={48} className="text-red-500" />
47 |           </div>
48 |           <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
49 |           <CardDescription>
50 |             {errorInfo.description}
51 |           </CardDescription>
52 |         </CardHeader>
53 |         <CardContent className="text-center">
54 |           <p className="mb-4 text-muted-foreground">
55 |             {errorInfo.suggestion}
56 |           </p>
57 |           {checkout_id && (
58 |             <p className="text-xs text-muted-foreground border-t pt-4">
59 |               Reference ID: {checkout_id}
60 |             </p>
61 |           )}
62 |         </CardContent>
63 |         <CardFooter className="flex flex-col gap-2">
64 |           <Link href="/" className="w-full">
65 |             <Button variant="default" size="lg" className="w-full">
66 |               <ArrowLeft className="mr-2 h-4 w-4" />
67 |               Return to Chat
68 |             </Button>
69 |           </Link>
70 |           <Button 
71 |             variant="outline" 
72 |             size="lg" 
73 |             className="w-full"
74 |             onClick={() => window.location.href = '/api/auth/checkout/ai-usage'}
75 |           >
76 |             <RefreshCw className="mr-2 h-4 w-4" />
77 |             Try Again
78 |           </Button>
79 |         </CardFooter>
80 |       </Card>
81 |     </div>
82 |   );
83 | } 
```

app/api/auth/[...betterauth]/route.ts
```
1 | import { auth } from '@/lib/auth';
2 | import { toNextJsHandler } from 'better-auth/next-js';
3 | 
4 | // Export the handlers wrapped for Next.js App Router
5 | export const { GET, POST } = toNextJsHandler(auth.handler);
6 | 
7 | // Log that Better-Auth routes are registered
8 | console.log('Better-Auth routes registered successfully'); 
```

app/api/auth/polar/route.ts
```
1 | import { NextRequest, NextResponse } from 'next/server';
2 | 
3 | export async function GET(req: NextRequest) {
4 |     console.log('Polar route GET hit at:', req.url);
5 |     return NextResponse.json({ status: 'Polar route is active' });
6 | }
7 | 
8 | export async function POST(req: NextRequest) {
9 |     console.log('Polar route POST hit at:', req.url);
10 | 
11 |     try {
12 |         const body = await req.text();
13 |         console.log('Received body:', body.substring(0, 100) + '...');
14 | 
15 |         // Log all headers
16 |         console.log('Headers:');
17 |         req.headers.forEach((value, key) => {
18 |             console.log(`${key}: ${value}`);
19 |         });
20 | 
21 |         return NextResponse.json({ status: 'success', message: 'Webhook received' });
22 |     } catch (error) {
23 |         console.error('Error in Polar route:', error);
24 |         return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
25 |     }
26 | } 
```

app/api/chats/migrate/route.ts
```
1 | import { NextRequest, NextResponse } from "next/server";
2 | import { auth } from "@/lib/auth";
3 | import { db } from "@/lib/db";
4 | import { chats } from "@/lib/db/schema";
5 | import { eq } from "drizzle-orm";
6 | import { z } from "zod";
7 | 
8 | const migrateSchema = z.object({
9 |     localUserId: z.string().min(1, "Local user ID is required"),
10 | });
11 | 
12 | export async function POST(req: NextRequest) {
13 |     // 1. Check Authentication using headers
14 |     const session = await auth.api.getSession({ headers: req.headers });
15 |     if (!session?.user?.id) {
16 |         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
17 |     }
18 |     const authenticatedUserId = session.user.id;
19 | 
20 |     // 2. Validate Request Body
21 |     let parsedBody;
22 |     try {
23 |         const body = await req.json();
24 |         parsedBody = migrateSchema.parse(body);
25 |     } catch (error) {
26 |         if (error instanceof z.ZodError) {
27 |             return NextResponse.json({ error: error.errors }, { status: 400 });
28 |         }
29 |         return NextResponse.json(
30 |             { error: "Invalid request body" },
31 |             { status: 400 },
32 |         );
33 |     }
34 | 
35 |     const { localUserId } = parsedBody;
36 | 
37 |     // 3. Perform Database Update
38 |     try {
39 |         console.log(
40 |             `Migrating chats from local user ${localUserId} to authenticated user ${authenticatedUserId}`,
41 |         );
42 |         const result = await db
43 |             .update(chats)
44 |             .set({ userId: authenticatedUserId })
45 |             .where(eq(chats.userId, localUserId))
46 |             .returning({ updatedId: chats.id }); // Optional: return updated chat IDs
47 | 
48 |         console.log(`Migrated ${result.length} chats.`);
49 | 
50 |         return NextResponse.json(
51 |             { success: true, migratedCount: result.length },
52 |             { status: 200 },
53 |         );
54 |     } catch (dbError) {
55 |         console.error("Database error during chat migration:", dbError);
56 |         return NextResponse.json(
57 |             { error: "Failed to migrate chats" },
58 |             { status: 500 },
59 |         );
60 |     }
61 | } 
```

app/api/chats/[id]/route.ts
```
1 | import { NextResponse, NextRequest } from "next/server";
2 | import { getChatById, deleteChat } from "@/lib/chat-store"; // Assuming getChatById also checks userId
3 | import { auth } from "@/lib/auth";
4 | import { db } from "@/lib/db";
5 | import { chats } from "@/lib/db/schema";
6 | import { eq, and } from "drizzle-orm";
7 | 
8 | interface Params {
9 |   params: {
10 |     id: string;
11 |   };
12 | }
13 | 
14 | // Helper to get user ID from authenticated session only
15 | async function getRequestUserId(request: NextRequest | Request): Promise<string | null> {
16 |   // Only use authenticated session for user ID
17 |   const session = await auth.api.getSession({ headers: request.headers });
18 |   return session?.user?.id || null;
19 | }
20 | 
21 | export async function GET(request: NextRequest, { params }: Params) {
22 |   try {
23 |     const userId = await getRequestUserId(request);
24 | 
25 |     if (!userId) {
26 |       return NextResponse.json({ error: "Authentication required" }, { status: 401 });
27 |     }
28 | 
29 |     const { id } = await params;
30 |     const chat = await getChatById(id, userId);
31 | 
32 |     if (!chat) {
33 |       console.log(`Chat not found for id: ${id} and userId: ${userId}`);
34 |       return NextResponse.json(
35 |         { error: "Chat not found" },
36 |         { status: 404 }
37 |       );
38 |     }
39 | 
40 |     return NextResponse.json(chat);
41 |   } catch (error) {
42 |     console.error("Error fetching chat:", error);
43 |     return NextResponse.json(
44 |       { error: "Failed to fetch chat" },
45 |       { status: 500 }
46 |     );
47 |   }
48 | }
49 | 
50 | export async function DELETE(request: NextRequest, { params }: Params) {
51 |   try {
52 |     const userId = await getRequestUserId(request);
53 | 
54 |     if (!userId) {
55 |       return NextResponse.json({ error: "Authentication required" }, { status: 401 });
56 |     }
57 | 
58 |     const { id } = await params;
59 |     await deleteChat(id, userId);
60 |     return NextResponse.json({ success: true });
61 |   } catch (error) {
62 |     console.error("Error deleting chat:", error);
63 |     return NextResponse.json(
64 |       { error: "Failed to delete chat" },
65 |       { status: 500 }
66 |     );
67 |   }
68 | }
69 | 
70 | export async function PATCH(
71 |   request: NextRequest,
72 |   { params }: Params
73 | ) {
74 |   try {
75 |     const userId = await getRequestUserId(request);
76 |     if (!userId) {
77 |       return new Response('Unauthorized', { status: 401 });
78 |     }
79 | 
80 |     const { id: chatId } = await params;
81 |     let requestBody;
82 |     try {
83 |       requestBody = await request.json();
84 |     } catch (error) {
85 |       return NextResponse.json({ error: "Invalid request body: Must be valid JSON" }, { status: 400 });
86 |     }
87 | 
88 |     const { title } = requestBody;
89 | 
90 |     if (typeof title !== 'string' || title.trim() === '') {
91 |       return NextResponse.json({ error: "Invalid title: Title must be a non-empty string" }, { status: 400 });
92 |     }
93 | 
94 |     if (title.length > 255) {
95 |       return NextResponse.json({ error: `Invalid title: Title must be 255 characters or less. Received ${title.length} characters.` }, { status: 400 });
96 |     }
97 | 
98 |     // First, verify the chat exists and belongs to the user.
99 |     // We can use a direct DB query for this to ensure we get the latest state before update.
100 |     const existingChatArray = await db
101 |       .select()
102 |       .from(chats)
103 |       .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
104 |       .limit(1);
105 | 
106 |     if (existingChatArray.length === 0) {
107 |       // Check if chat exists at all to differentiate between Not Found and Forbidden
108 |       const chatExistsArray = await db.select({ id: chats.id }).from(chats).where(eq(chats.id, chatId)).limit(1);
109 |       if (chatExistsArray.length === 0) {
110 |         return NextResponse.json({ error: "Chat not found" }, { status: 404 });
111 |       }
112 |       return NextResponse.json({ error: "Forbidden: You do not own this chat" }, { status: 403 });
113 |     }
114 | 
115 |     const existingChat = existingChatArray[0];
116 | 
117 |     // Update the chat title
118 |     const updatedChatArray = await db
119 |       .update(chats)
120 |       .set({ title: title.trim(), updatedAt: new Date() })
121 |       .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
122 |       .returning();
123 | 
124 |     if (updatedChatArray.length === 0) {
125 |       // This case should ideally not be reached if the prior check passed,
126 |       // but as a safeguard:
127 |       console.error(`Failed to update chat title for chat ID: ${chatId} and user ID: ${userId}. Chat might have been deleted or ownership changed concurrently.`);
128 |       return NextResponse.json({ error: "Failed to update chat title. Chat not found or access denied." }, { status: 404 });
129 |     }
130 | 
131 |     return NextResponse.json(updatedChatArray[0], { status: 200 });
132 | 
133 |   } catch (error) {
134 |     console.error("Error updating chat title:", error);
135 |     // Generic error for unexpected issues
136 |     if (error instanceof Error && error.message.includes("Invalid request body")) {
137 |       return NextResponse.json({ error: "Invalid request body: Must be valid JSON" }, { status: 400 });
138 |     }
139 |     return NextResponse.json(
140 |       { error: "Failed to update chat title due to an internal server error" },
141 |       { status: 500 }
142 |     );
143 |   }
144 | }
```

app/api/usage/messages/route.ts
```
1 | import { NextResponse } from 'next/server';
2 | import { auth, checkMessageLimit } from '@/lib/auth';
3 | 
4 | /**
5 |  * API endpoint to get message usage information for the current user
6 |  */
7 | export async function GET(req: Request) {
8 |     try {
9 |         // Get the authenticated session
10 |         const session = await auth.api.getSession({ headers: req.headers });
11 | 
12 |         // If no session exists, return error
13 |         if (!session || !session.user || !session.user.id) {
14 |             return NextResponse.json(
15 |                 { error: 'Unauthorized' },
16 |                 { status: 401 }
17 |             );
18 |         }
19 | 
20 |         const userId = session.user.id;
21 |         const isAnonymous = (session.user as any).isAnonymous === true;
22 | 
23 |         // Check message limit for this user
24 |         const limitStatus = await checkMessageLimit(userId, isAnonymous);
25 | 
26 |         return NextResponse.json({
27 |             limit: limitStatus.limit,
28 |             used: limitStatus.limit - limitStatus.remaining,
29 |             remaining: limitStatus.remaining,
30 |             isAnonymous,
31 |             // Check if user has a Polar subscription
32 |             hasSubscription: (session.user as any)?.metadata?.hasSubscription || false,
33 |             // Include credit information
34 |             credits: limitStatus.credits || 0,
35 |             hasCredits: (limitStatus.credits || 0) > 0,
36 |             usedCredits: limitStatus.usedCredits || false
37 |         });
38 |     } catch (error) {
39 |         console.error('Error getting message usage:', error);
40 |         return NextResponse.json(
41 |             { error: 'Failed to get message usage' },
42 |             { status: 500 }
43 |         );
44 |     }
45 | } 
```

app/api/auth/polar/webhooks/route.ts
```
1 | import { auth } from '@/lib/auth';
2 | import { NextRequest, NextResponse } from 'next/server';
3 | 
4 | // GET handler for testing the endpoint
5 | export async function GET() {
6 |     console.log('Polar webhooks GET endpoint hit for testing');
7 |     return NextResponse.json({ status: 'Polar webhooks endpoint is active' });
8 | }
9 | 
10 | // This is the correct path for Polar webhooks according to the documentation
11 | // The BetterAuth Polar plugin expects webhooks at /polar/webhooks relative to auth mount point
12 | export async function POST(req: NextRequest) {
13 |     console.log('Polar webhook received at correct path: /api/auth/polar/webhooks');
14 | 
15 |     // Simply forward the request to the auth handler which will process it
16 |     return auth.handler(req);
17 | } 
```

app/api/auth/sign-in/anonymous/route.ts
```
1 | "use server";
2 | 
3 | import { auth } from '@/lib/auth';
4 | import { redirect } from 'next/navigation';
5 | 
6 | export async function POST(request: Request) {
7 |     console.log('Anonymous sign-in endpoint called');
8 | 
9 |     try {
10 |         // Forward to the auth handler
11 |         const response = await auth.handler(
12 |             new Request(`${request.url.split('/api/auth')[0]}/api/auth/sign-in/anonymous`, {
13 |                 method: 'POST',
14 |                 headers: request.headers,
15 |                 body: request.body,
16 |                 // @ts-expect-error - duplex is required for Node.js but not included in the TypeScript types
17 |                 duplex: 'half'
18 |             })
19 |         );
20 | 
21 |         console.log('Anonymous sign-in response status:', response.status);
22 | 
23 |         // Check if the response is successful
24 |         if (!response.ok) {
25 |             // Clone the response to read the body
26 |             const clonedResponse = response.clone();
27 |             try {
28 |                 const responseBody = await clonedResponse.text();
29 |                 console.error('Auth handler error response:', responseBody);
30 |             } catch (bodyError) {
31 |                 console.error('Could not read error response body:', bodyError);
32 |             }
33 | 
34 |             // Still return the original response to maintain behavior
35 |             return response;
36 |         }
37 | 
38 |         console.log('Anonymous sign-in successful');
39 |         return response;
40 |     } catch (error) {
41 |         console.error('Error in anonymous sign-in:', error);
42 |         // Log more details about the error
43 |         if (error instanceof Error) {
44 |             console.error('Error name:', error.name);
45 |             console.error('Error message:', error.message);
46 |             console.error('Error stack:', error.stack);
47 |         }
48 | 
49 |         return new Response(
50 |             JSON.stringify({ error: 'Failed to sign in anonymously' }),
51 |             { status: 500, headers: { 'Content-Type': 'application/json' } }
52 |         );
53 |     }
54 | } 
```

</current_codebase>
