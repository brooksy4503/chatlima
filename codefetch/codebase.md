You are a senior developer. You produce optimized, maintainable code that follows best practices. 

Your task is to review the current codebase and fix the current issues.

Current Issue:
<issue>
If there is an error while sending or receiving response to llm usually the user cannot continue the chat and requires a refresh before a new chat can be created
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
│   │   ├── usage
│   │   │   └── messages
│   │   │       └── route.ts
│   │   └── version
│   │       └── route.ts
│   ├── chat
│   │   └── [id]
│   │       └── page.tsx
│   ├── checkout
│   │   └── success
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── opengraph-image.png
│   ├── page.tsx
│   ├── providers.tsx
│   └── twitter-image.png
├── auth-schema.ts
├── codefetch
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
│   ├── citation.tsx
│   ├── copy-button.tsx
│   ├── deploy-button.tsx
│   ├── icons.tsx
│   ├── input.tsx
│   ├── markdown.tsx
│   ├── mcp-server-manager.tsx
│   ├── message.tsx
│   ├── messages.tsx
│   ├── model-picker.tsx
│   ├── project-overview.tsx
│   ├── suggested-prompts.tsx
│   ├── textarea.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   ├── tool-invocation.tsx
│   └── ui
│       ├── BuildInfo.tsx
│       ├── accordion.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── popover.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── text-morph.tsx
│       ├── textarea.tsx
│       └── tooltip.tsx
├── components.json
├── docs
│   ├── client-side-chat-search-plan.md
│   ├── deepseek_r1_openrouter_integration.md
│   ├── feature_plan_rename_chat_title_sidebar.md
│   ├── mcp_fetch_server_sse_deployment_plan.md
│   ├── mem0ai_integration_plan.md
│   ├── model-picker-infinite-loop-debugging.md
│   ├── openrouter_web_search_integration_plan.md
│   ├── polar-integration-plan.md
│   ├── polar_external_id_integration_resolution.md
│   └── uvx-mcp-server-issue.md
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
├── pnpm-lock.yaml
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── logo.png
│   ├── next.svg
│   ├── scira.png
│   ├── vercel.svg
│   └── window.svg
├── railpack.json
├── reset_db.sql
└── tsconfig.json


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
3 |   "version": "0.1.0",
4 |   "private": true,
5 |   "scripts": {
6 |     "dev": "next dev --turbopack",
7 |     "build": "next build --turbopack",
8 |     "start": "next start",
9 |     "lint": "next lint",
10 |     "db:generate": "drizzle-kit generate",
11 |     "db:migrate": "drizzle-kit migrate",
12 |     "db:push": "drizzle-kit push",
13 |     "db:studio": "drizzle-kit studio"
14 |   },
15 |   "dependencies": {
16 |     "@ai-sdk/anthropic": "^1.2.10",
17 |     "@ai-sdk/cohere": "^1.2.9",
18 |     "@ai-sdk/google": "^1.2.12",
19 |     "@ai-sdk/groq": "^1.2.8",
20 |     "@ai-sdk/openai": "^1.3.16",
21 |     "@ai-sdk/react": "^1.2.9",
22 |     "@ai-sdk/ui-utils": "^1.2.10",
23 |     "@ai-sdk/xai": "^1.2.14",
24 |     "@neondatabase/serverless": "^1.0.0",
25 |     "@openrouter/ai-sdk-provider": "^0.4.5",
26 |     "@polar-sh/better-auth": "^0.1.1",
27 |     "@polar-sh/nextjs": "^0.4.0",
28 |     "@polar-sh/sdk": "^0.32.13",
29 |     "@radix-ui/react-accordion": "^1.2.7",
30 |     "@radix-ui/react-avatar": "^1.1.6",
31 |     "@radix-ui/react-dialog": "^1.1.10",
32 |     "@radix-ui/react-dropdown-menu": "^2.1.11",
33 |     "@radix-ui/react-label": "^2.1.3",
34 |     "@radix-ui/react-popover": "^1.1.10",
35 |     "@radix-ui/react-scroll-area": "^1.2.5",
36 |     "@radix-ui/react-select": "^2.1.7",
37 |     "@radix-ui/react-separator": "^1.1.4",
38 |     "@radix-ui/react-slot": "^1.2.0",
39 |     "@radix-ui/react-switch": "^1.2.2",
40 |     "@radix-ui/react-tooltip": "^1.2.3",
41 |     "@tanstack/react-query": "^5.74.4",
42 |     "@vercel/otel": "^1.11.0",
43 |     "ai": "^4.3.9",
44 |     "better-auth": "^1.2.7",
45 |     "class-variance-authority": "^0.7.1",
46 |     "clsx": "^2.1.1",
47 |     "drizzle-orm": "^0.42.0",
48 |     "fast-deep-equal": "^3.1.3",
49 |     "framer-motion": "^12.7.4",
50 |     "groq-sdk": "^0.19.0",
51 |     "lucide-react": "^0.488.0",
52 |     "motion": "^12.7.3",
53 |     "nanoid": "^5.1.5",
54 |     "next": "^15.3.1",
55 |     "next-themes": "^0.4.6",
56 |     "or": "^0.2.0",
57 |     "pg": "^8.14.1",
58 |     "react": "^19.1.0",
59 |     "react-dom": "^19.1.0",
60 |     "react-markdown": "^10.1.0",
61 |     "remark-gfm": "^4.0.1",
62 |     "sonner": "^2.0.3",
63 |     "tailwind-merge": "^3.2.0",
64 |     "tailwindcss-animate": "^1.0.7",
65 |     "zod": "^3.24.2"
66 |   },
67 |   "devDependencies": {
68 |     "@better-auth/cli": "^1.2.7",
69 |     "@eslint/eslintrc": "^3.3.1",
70 |     "@tailwindcss/postcss": "^4.1.4",
71 |     "@types/node": "^22.14.1",
72 |     "@types/pg": "^8.11.13",
73 |     "@types/react": "^19.1.2",
74 |     "@types/react-dom": "^19.1.2",
75 |     "dotenv": "^16.5.0",
76 |     "dotenv-cli": "^8.0.0",
77 |     "drizzle-kit": "^0.31.0",
78 |     "esbuild": ">=0.25.0",
79 |     "eslint": "^9.24.0",
80 |     "eslint-config-next": "15.3.0",
81 |     "pg-pool": "^3.8.0",
82 |     "tailwindcss": "^4.1.4",
83 |     "typescript": "^5.8.3"
84 |   }
85 | }
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

ai/providers.ts
```
1 | import { createOpenAI } from "@ai-sdk/openai";
2 | import { createGroq } from "@ai-sdk/groq";
3 | import { createAnthropic } from "@ai-sdk/anthropic";
4 | import { createXai } from "@ai-sdk/xai";
5 | import { createOpenRouter } from "@openrouter/ai-sdk-provider";
6 | 
7 | import {
8 |   customProvider,
9 |   wrapLanguageModel,
10 |   extractReasoningMiddleware
11 | } from "ai";
12 | 
13 | export interface ModelInfo {
14 |   provider: string;
15 |   name: string;
16 |   description: string;
17 |   apiVersion: string;
18 |   capabilities: string[];
19 |   enabled?: boolean;
20 | }
21 | 
22 | const middleware = extractReasoningMiddleware({
23 |   tagName: 'think',
24 | });
25 | 
26 | const deepseekR1Middleware = extractReasoningMiddleware({
27 |   tagName: 'think',
28 | });
29 | 
30 | // Helper to get API keys from environment variables first, then localStorage
31 | export const getApiKey = (key: string): string | undefined => {
32 |   // Check for environment variables first
33 |   if (process.env[key]) {
34 |     return process.env[key] || undefined;
35 |   }
36 | 
37 |   // Fall back to localStorage if available
38 |   if (typeof window !== 'undefined') {
39 |     return window.localStorage.getItem(key) || undefined;
40 |   }
41 | 
42 |   return undefined;
43 | };
44 | 
45 | // Create provider instances with API keys from localStorage
46 | const openaiClient = createOpenAI({
47 |   apiKey: getApiKey('OPENAI_API_KEY'),
48 | });
49 | 
50 | const anthropicClient = createAnthropic({
51 |   apiKey: getApiKey('ANTHROPIC_API_KEY'),
52 | });
53 | 
54 | const groqClient = createGroq({
55 |   apiKey: getApiKey('GROQ_API_KEY'),
56 | });
57 | 
58 | const xaiClient = createXai({
59 |   apiKey: getApiKey('XAI_API_KEY'),
60 | });
61 | 
62 | const openrouterClient = createOpenRouter({
63 |   apiKey: getApiKey('OPENROUTER_API_KEY'),
64 |   headers: {
65 |     'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com/',
66 |     'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'ChatLima',
67 |   }
68 | });
69 | 
70 | const languageModels = {
71 |   "claude-3-7-sonnet": anthropicClient('claude-3-7-sonnet-20250219'),
72 |   "openrouter/anthropic/claude-3.5-sonnet": openrouterClient("anthropic/claude-3.5-sonnet"),
73 |   "openrouter/anthropic/claude-3.7-sonnet": openrouterClient("anthropic/claude-3.7-sonnet"),
74 |   "openrouter/anthropic/claude-3.7-sonnet:thinking": openrouterClient("anthropic/claude-3.7-sonnet:thinking"),
75 |   "openrouter/deepseek/deepseek-chat-v3-0324": openrouterClient("deepseek/deepseek-chat-v3-0324"),
76 |   "openrouter/deepseek/deepseek-r1": wrapLanguageModel({
77 |     model: openrouterClient("deepseek/deepseek-r1", { logprobs: false }),
78 |     middleware: deepseekR1Middleware,
79 |   }),
80 |   "openrouter/google/gemini-2.5-flash-preview": openrouterClient("google/gemini-2.5-flash-preview"),
81 |   "openrouter/google/gemini-2.5-flash-preview:thinking": openrouterClient("google/gemini-2.5-flash-preview:thinking"),
82 |   "openrouter/google/gemini-2.5-pro-preview-03-25": openrouterClient("google/gemini-2.5-pro-preview-03-25"),
83 |   "gpt-4.1-mini": openaiClient("gpt-4.1-mini"),
84 |   "openrouter/openai/gpt-4.1": openrouterClient("openai/gpt-4.1"),
85 |   "openrouter/openai/gpt-4.1-mini": openrouterClient("openai/gpt-4.1-mini"),
86 |   "openrouter/x-ai/grok-3-beta": wrapLanguageModel({
87 |     model: openrouterClient("x-ai/grok-3-beta", { logprobs: false }),
88 |     middleware: deepseekR1Middleware,
89 |   }),
90 |   "grok-3-mini": xaiClient("grok-3-mini-latest"),
91 |   "openrouter/x-ai/grok-3-mini-beta": wrapLanguageModel({
92 |     model: openrouterClient("x-ai/grok-3-mini-beta", { logprobs: false }),
93 |     middleware: deepseekR1Middleware,
94 |   }),
95 |   "openrouter/x-ai/grok-3-mini-beta-reasoning-high": wrapLanguageModel({
96 |     model: openrouterClient("x-ai/grok-3-mini-beta", { reasoning: { effort: "high" }, logprobs: false }),
97 |     middleware: deepseekR1Middleware,
98 |   }),
99 |   "openrouter/mistralai/mistral-medium-3": openrouterClient("mistralai/mistral-medium-3"),
100 |   "openrouter/mistralai/mistral-small-3.1-24b-instruct": openrouterClient("mistralai/mistral-small-3.1-24b-instruct"),
101 |   "openrouter/meta-llama/llama-4-maverick": openrouterClient("meta-llama/llama-4-maverick"),
102 |   "openrouter/openai/o4-mini-high": openrouterClient("openai/o4-mini-high"),
103 |   "qwen-qwq": wrapLanguageModel(
104 |     {
105 |       model: groqClient("qwen-qwq-32b"),
106 |       middleware
107 |     }
108 |   ),
109 |   "openrouter/qwen/qwq-32b": wrapLanguageModel({
110 |     model: openrouterClient("qwen/qwq-32b"),
111 |     middleware: deepseekR1Middleware,
112 |   }),
113 |   "openrouter/qwen/qwen3-235b-a22b": openrouterClient("qwen/qwen3-235b-a22b")
114 | };
115 | 
116 | export const modelDetails: Record<keyof typeof languageModels, ModelInfo> = {
117 |   "claude-3-7-sonnet": {
118 |     provider: "Anthropic",
119 |     name: "Claude 3.7 Sonnet",
120 |     description: "Latest version of Anthropic's Claude 3.7 Sonnet with strong reasoning and coding capabilities.",
121 |     apiVersion: "claude-3-7-sonnet-20250219",
122 |     capabilities: ["Reasoning", "Efficient", "Agentic"],
123 |     enabled: false
124 |   },
125 |   "openrouter/anthropic/claude-3.5-sonnet": {
126 |     provider: "OpenRouter",
127 |     name: "Claude 3.5 Sonnet",
128 |     description: "New Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at: Coding, Data science, Visual processing, Agentic tasks",
129 |     apiVersion: "anthropic/claude-3.5-sonnet",
130 |     capabilities: ["Coding", "Data science", "Visual processing", "Agentic tasks"],
131 |     enabled: true
132 |   },
133 |   "openrouter/anthropic/claude-3.7-sonnet": {
134 |     provider: "OpenRouter",
135 |     name: "Claude 3.7 Sonnet",
136 |     description: "Latest version of Anthropic's Claude 3.7 Sonnet accessed via OpenRouter. Strong reasoning and coding capabilities.",
137 |     apiVersion: "anthropic/claude-3.7-sonnet",
138 |     capabilities: ["Reasoning", "Coding", "Agentic"],
139 |     enabled: true
140 |   },
141 |   "openrouter/anthropic/claude-3.7-sonnet:thinking": {
142 |     provider: "OpenRouter",
143 |     name: "Claude 3.7 Sonnet (thinking)",
144 |     description: "Advanced LLM with improved reasoning, coding, and problem-solving. Features a hybrid reasoning approach for flexible processing.",
145 |     apiVersion: "anthropic/claude-3.7-sonnet:thinking",
146 |     capabilities: ["Reasoning", "Coding", "Problem-solving", "Agentic"],
147 |     enabled: true
148 |   },
149 |   "openrouter/deepseek/deepseek-chat-v3-0324": {
150 |     provider: "OpenRouter",
151 |     name: "DeepSeek Chat V3 0324",
152 |     description: "DeepSeek Chat model V3 accessed via OpenRouter.",
153 |     apiVersion: "deepseek/deepseek-chat-v3-0324",
154 |     capabilities: ["Chat", "Efficient"],
155 |     enabled: true
156 |   },
157 |   "openrouter/deepseek/deepseek-r1": {
158 |     provider: "OpenRouter",
159 |     name: "DeepSeek R1",
160 |     description: "DeepSeek R1: Open-source model with performance on par with OpenAI o1, featuring open reasoning tokens. 671B parameters (37B active). MIT licensed. Note: This model cannot be used for Tool Calling (e.g., MCP Servers).",
161 |     apiVersion: "deepseek/deepseek-r1",
162 |     capabilities: ["Reasoning", "Open Source"],
163 |     enabled: true
164 |   },
165 |   "openrouter/google/gemini-2.5-flash-preview": {
166 |     provider: "OpenRouter",
167 |     name: "Gemini 2.5 Flash Preview",
168 |     description: "Google's state-of-the-art workhorse model for advanced reasoning, coding, mathematics, and scientific tasks, with built-in \"thinking\" capabilities. Accessed via OpenRouter.",
169 |     apiVersion: "google/gemini-2.5-flash-preview",
170 |     capabilities: ["Reasoning", "Coding", "Mathematics", "Scientific"],
171 |     enabled: true
172 |   },
173 |   "openrouter/google/gemini-2.5-flash-preview:thinking": {
174 |     provider: "OpenRouter",
175 |     name: "Gemini 2.5 Flash Preview (thinking)",
176 |     description: "Gemini 2.5 Flash is Google's state-of-the-art workhorse model, specifically designed for advanced reasoning, coding, mathematics, and scientific tasks. It includes built-in \"thinking\" capabilities, enabling it to provide responses with greater accuracy and nuanced context handling. Accessed via OpenRouter.",
177 |     apiVersion: "google/gemini-2.5-flash-preview:thinking",
178 |     capabilities: ["Reasoning", "Coding", "Mathematics", "Scientific", "Thinking"],
179 |     enabled: true
180 |   },
181 |   "openrouter/google/gemini-2.5-pro-preview-03-25": {
182 |     provider: "OpenRouter",
183 |     name: "Gemini 2.5 Pro Preview",
184 |     description: "Google's state-of-the-art AI model for advanced reasoning, coding, math, and science, accessed via OpenRouter.",
185 |     apiVersion: "google/gemini-2.5-pro-preview-03-25",
186 |     capabilities: ["Reasoning", "Coding", "Math", "Science"],
187 |     enabled: true
188 |   },
189 |   "gpt-4.1-mini": {
190 |     provider: "OpenAI",
191 |     name: "GPT-4.1 Mini",
192 |     description: "Compact version of OpenAI's GPT-4.1 with good balance of capabilities, including vision.",
193 |     apiVersion: "gpt-4.1-mini",
194 |     capabilities: ["Balance", "Creative", "Vision"],
195 |     enabled: false
196 |   },
197 |   "openrouter/openai/gpt-4.1": {
198 |     provider: "OpenRouter",
199 |     name: "GPT-4.1",
200 |     description: "GPT-4.1 is a flagship large language model excelling in instruction following, software engineering, and long-context reasoning, supporting a 1 million token context. It's tuned for precise code diffs, agent reliability, and high recall, ideal for agents, IDE tooling, and enterprise knowledge retrieval.",
201 |     apiVersion: "openai/gpt-4.1",
202 |     capabilities: ["Coding", "Instruction Following", "Long Context", "Multimodal", "Agents", "IDE Tooling", "Knowledge Retrieval"],
203 |     enabled: true
204 |   },
205 |   "openrouter/openai/gpt-4.1-mini": {
206 |     provider: "OpenRouter",
207 |     name: "GPT-4.1 Mini",
208 |     description: "Mid-sized model competitive with GPT-4o, lower latency/cost. Strong coding & vision. Accessed via OpenRouter.",
209 |     apiVersion: "openai/gpt-4.1-mini",
210 |     capabilities: ["Coding", "Vision", "Efficient"],
211 |     enabled: true
212 |   },
213 |   "openrouter/x-ai/grok-3-beta": {
214 |     provider: "OpenRouter",
215 |     name: "Grok 3 Beta",
216 |     description: "xAI's flagship model excelling at enterprise tasks, coding, summarization, and deep domain knowledge. Note: This model cannot be used for Tool Calling (e.g., MCP Servers). Accessed via OpenRouter.",
217 |     apiVersion: "x-ai/grok-3-beta",
218 |     capabilities: ["Reasoning", "Coding", "Knowledge"],
219 |     enabled: true
220 |   },
221 |   "grok-3-mini": {
222 |     provider: "XAI",
223 |     name: "Grok 3 Mini",
224 |     description: "Latest version of XAI's Grok 3 Mini with strong reasoning and coding capabilities.",
225 |     apiVersion: "grok-3-mini-latest",
226 |     capabilities: ["Reasoning", "Efficient", "Agentic"],
227 |     enabled: false
228 |   },
229 |   "openrouter/x-ai/grok-3-mini-beta": {
230 |     provider: "OpenRouter",
231 |     name: "Grok 3 Mini Beta",
232 |     description: "Lightweight model ideal for reasoning-heavy tasks, math, and puzzles. Note: This model cannot be used for Tool Calling (e.g., MCP Servers). Tool calling is disabled. Accessed via OpenRouter.",
233 |     apiVersion: "x-ai/grok-3-mini-beta",
234 |     capabilities: ["Reasoning", "Math", "Puzzles"],
235 |     enabled: true
236 |   },
237 |   "openrouter/x-ai/grok-3-mini-beta-reasoning-high": {
238 |     provider: "OpenRouter",
239 |     name: "Grok 3 Mini Beta (High Reasoning)",
240 |     description: "xAI Grok 3 Mini Beta configured for high reasoning effort. Ideal for complex reasoning, math, and puzzles. Note: This model cannot be used for Tool Calling (e.g., MCP Servers). Tool calling is disabled. Accessed via OpenRouter.",
241 |     apiVersion: "x-ai/grok-3-mini-beta",
242 |     capabilities: ["Reasoning", "Math", "Puzzles", "High Effort"],
243 |     enabled: true
244 |   },
245 |   "openrouter/mistralai/mistral-medium-3": {
246 |     provider: "OpenRouter",
247 |     name: "Mistral Medium 3",
248 |     description: "High-performance enterprise-grade language model with frontier-level capabilities. Balances state-of-the-art reasoning and multimodal performance. Accessed via OpenRouter.",
249 |     apiVersion: "mistralai/mistral-medium-3",
250 |     capabilities: ["Reasoning", "Coding", "STEM", "Enterprise"],
251 |     enabled: true
252 |   },
253 |   "openrouter/mistralai/mistral-small-3.1-24b-instruct": {
254 |     provider: "OpenRouter",
255 |     name: "Mistral Small 3.1 Instruct",
256 |     description: "Mistral Small 3.1 Instruct model accessed via OpenRouter.",
257 |     apiVersion: "mistralai/mistral-small-3.1-24b-instruct",
258 |     capabilities: ["Instruct", "Efficient"],
259 |     enabled: true
260 |   },
261 |   "openrouter/meta-llama/llama-4-maverick": {
262 |     provider: "OpenRouter",
263 |     name: "Llama 4 Maverick",
264 |     description: "Meta's Llama 4 Maverick: a high-capacity, multimodal MoE language model. Supports multilingual text/image input and produces text/code output.",
265 |     apiVersion: "meta-llama/llama-4-maverick",
266 |     capabilities: ["Multimodal", "Multilingual", "Image Input", "Code Output", "Reasoning"],
267 |     enabled: true
268 |   },
269 |   "openrouter/openai/o4-mini-high": {
270 |     provider: "OpenRouter",
271 |     name: "o4 Mini High",
272 |     description: "OpenAI o4-mini-high, a compact reasoning model optimized for speed and cost, with strong multimodal and agentic capabilities. Accessed via OpenRouter.",
273 |     apiVersion: "openai/o4-mini-high",
274 |     capabilities: ["Reasoning", "Coding", "Efficient", "Agentic", "Multimodal"],
275 |     enabled: true
276 |   },
277 |   "qwen-qwq": {
278 |     provider: "Groq",
279 |     name: "Qwen QWQ",
280 |     description: "Latest version of Alibaba's Qwen QWQ with strong reasoning and coding capabilities.",
281 |     apiVersion: "qwen-qwq",
282 |     capabilities: ["Reasoning", "Efficient", "Agentic"],
283 |     enabled: false
284 |   },
285 |   "openrouter/qwen/qwq-32b": {
286 |     provider: "OpenRouter",
287 |     name: "Qwen QwQ 32B",
288 |     description: "QwQ is the reasoning model of the Qwen series. Compared with conventional instruction-tuned models, QwQ, which is capable of thinking and reasoning, can achieve significantly enhanced performance in downstream tasks, especially hard problems. Accessed via OpenRouter.",
289 |     apiVersion: "qwen/qwq-32b",
290 |     capabilities: ["Reasoning", "Hard Problems"],
291 |     enabled: true
292 |   },
293 |   "openrouter/qwen/qwen3-235b-a22b": {
294 |     provider: "OpenRouter",
295 |     name: "Qwen3 235B A22B",
296 |     description: "Qwen3-235B-A22B is a 235B parameter mixture-of-experts (MoE) model by Qwen, activating 22B parameters per forward pass. It supports 'thinking' and 'non-thinking' modes, excels in reasoning, multilingual tasks, instruction-following, and agent tool-calling, with a context window up to 131K tokens via OpenRouter.",
297 |     apiVersion: "qwen/qwen3-235b-a22b",
298 |     capabilities: ["Reasoning", "Coding", "Multilingual", "Agentic"],
299 |     enabled: true
300 |   }
301 | };
302 | 
303 | // Update API keys when localStorage changes (for runtime updates)
304 | if (typeof window !== 'undefined') {
305 |   window.addEventListener('storage', (event) => {
306 |     // Reload the page if any API key changed to refresh the providers
307 |     if (event.key?.includes('API_KEY')) {
308 |       window.location.reload();
309 |     }
310 |   });
311 | }
312 | 
313 | export const model = customProvider({
314 |   languageModels,
315 | });
316 | 
317 | // Define a specific model ID for title generation
318 | export const titleGenerationModelId: modelID = "openrouter/openai/gpt-4.1-mini";
319 | 
320 | // Get the actual model instance for title generation
321 | export const titleGenerationModel = languageModels[titleGenerationModelId];
322 | 
323 | export type modelID = keyof typeof languageModels;
324 | 
325 | // Filter models based on the enabled flag
326 | export const MODELS = (Object.keys(languageModels) as modelID[]).filter(
327 |   (modelId) => modelDetails[modelId].enabled !== false
328 | );
329 | 
330 | export const defaultModel: modelID = "openrouter/qwen/qwq-32b";
```

app/actions.ts
```
1 | "use server";
2 | 
3 | import { openai } from "@ai-sdk/openai";
4 | import { generateObject } from "ai";
5 | import { z } from "zod";
6 | import { getApiKey, model, titleGenerationModel } from "@/ai/providers";
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
40 | export async function generateTitle(messages: any[]) {
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
62 |   try {
63 |     const { object } = await generateObject({
64 |       model: titleGenerationModel,
65 |       schema: z.object({
66 |         title: z.string().min(1).max(100),
67 |       }),
68 |       system: `
69 |       You are a helpful assistant that generates short, concise titles for chat conversations based *only* on the user's first message.
70 |       The title should summarize the main topic or request of the user's message.
71 |       The title should be no more than 30 characters.
72 |       The title should be unique and not generic like "Chat Title".
73 |       Focus on keywords from the user's message.
74 |       `,
75 |       messages: [
76 |         ...titleGenMessages,
77 |         {
78 |           role: "user",
79 |           content: "Generate a concise title based on my first message.",
80 |         },
81 |       ],
82 |     });
83 |     return object.title;
84 |   } catch (error) {
85 |     console.error('Error generating title with generateObject:', error);
86 |     // Fallback to a simple title derived from the first few words if AI fails
87 |     return userContent.split(' ').slice(0, 5).join(' ') + (userContent.split(' ').length > 5 ? '...' : '');
88 |   }
89 | }
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
8 | 
9 | :root {
10 |   --background: oklch(0.99 0.01 56.32);
11 |   --foreground: oklch(0.34 0.01 2.77);
12 |   --card: oklch(1.00 0 0);
13 |   --card-foreground: oklch(0.34 0.01 2.77);
14 |   --popover: oklch(1.00 0 0);
15 |   --popover-foreground: oklch(0.34 0.01 2.77);
16 |   --primary: oklch(0.74 0.16 34.71);
17 |   --primary-foreground: oklch(1.00 0 0);
18 |   --secondary: oklch(0.96 0.02 28.90);
19 |   --secondary-foreground: oklch(0.56 0.13 32.74);
20 |   --muted: oklch(0.97 0.02 39.40);
21 |   --muted-foreground: oklch(0.49 0.05 26.45);
22 |   --accent: oklch(0.83 0.11 58.00);
23 |   --accent-foreground: oklch(0.34 0.01 2.77);
24 |   --destructive: oklch(0.61 0.21 22.24);
25 |   --destructive-foreground: oklch(1.00 0 0);
26 |   --border: oklch(0.93 0.04 38.69);
27 |   --input: oklch(0.93 0.04 38.69);
28 |   --ring: oklch(0.74 0.16 34.71);
29 |   --chart-1: oklch(0.74 0.16 34.71);
30 |   --chart-2: oklch(0.83 0.11 58.00);
31 |   --chart-3: oklch(0.88 0.08 54.93);
32 |   --chart-4: oklch(0.82 0.11 40.89);
33 |   --chart-5: oklch(0.64 0.13 32.07);
34 |   --sidebar: oklch(0.97 0.02 39.40);
35 |   --sidebar-foreground: oklch(0.34 0.01 2.77);
36 |   --sidebar-primary: oklch(0.74 0.16 34.71);
37 |   --sidebar-primary-foreground: oklch(1.00 0 0);
38 |   --sidebar-accent: oklch(0.83 0.11 58.00);
39 |   --sidebar-accent-foreground: oklch(0.34 0.01 2.77);
40 |   --sidebar-border: oklch(0.93 0.04 38.69);
41 |   --sidebar-ring: oklch(0.74 0.16 34.71);
42 |   --font-sans: Montserrat, sans-serif;
43 |   --font-serif: Merriweather, serif;
44 |   --font-mono: Ubuntu Mono, monospace;
45 |   --radius: 0.625rem;
46 |   --shadow-2xs: 0px 6px 12px -3px hsl(0 0% 0% / 0.04);
47 |   --shadow-xs: 0px 6px 12px -3px hsl(0 0% 0% / 0.04);
48 |   --shadow-sm: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 1px 2px -4px hsl(0 0% 0% / 0.09);
49 |   --shadow: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 1px 2px -4px hsl(0 0% 0% / 0.09);
50 |   --shadow-md: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 2px 4px -4px hsl(0 0% 0% / 0.09);
51 |   --shadow-lg: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 4px 6px -4px hsl(0 0% 0% / 0.09);
52 |   --shadow-xl: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 8px 10px -4px hsl(0 0% 0% / 0.09);
53 |   --shadow-2xl: 0px 6px 12px -3px hsl(0 0% 0% / 0.22);
54 | }
55 | 
56 | .dark {
57 |   --background: oklch(0.26 0.02 352.40);
58 |   --foreground: oklch(0.94 0.01 51.32);
59 |   --card: oklch(0.32 0.02 341.45);
60 |   --card-foreground: oklch(0.94 0.01 51.32);
61 |   --popover: oklch(0.32 0.02 341.45);
62 |   --popover-foreground: oklch(0.94 0.01 51.32);
63 |   --primary: oklch(0.57 0.15 35.26);
64 |   --primary-foreground: oklch(1.00 0 0);
65 |   --secondary: oklch(0.36 0.02 342.27);
66 |   --secondary-foreground: oklch(0.94 0.01 51.32);
67 |   --muted: oklch(0.32 0.02 341.45);
68 |   --muted-foreground: oklch(0.84 0.02 52.63);
69 |   --accent: oklch(0.36 0.02 342.27);
70 |   --accent-foreground: oklch(0.94 0.01 51.32);
71 |   --destructive: oklch(0.51 0.16 20.19);
72 |   --destructive-foreground: oklch(1.00 0 0);
73 |   --border: oklch(0.36 0.02 342.27);
74 |   --input: oklch(0.36 0.02 342.27);
75 |   --ring: oklch(0.74 0.16 34.71);
76 |   --chart-1: oklch(0.74 0.16 34.71);
77 |   --chart-2: oklch(0.83 0.11 58.00);
78 |   --chart-3: oklch(0.88 0.08 54.93);
79 |   --chart-4: oklch(0.82 0.11 40.89);
80 |   --chart-5: oklch(0.64 0.13 32.07);
81 |   --sidebar: oklch(0.26 0.02 352.40);
82 |   --sidebar-foreground: oklch(0.94 0.01 51.32);
83 |   --sidebar-primary: oklch(0.47 0.08 34.31);
84 |   --sidebar-primary-foreground: oklch(1.00 0 0);
85 |   --sidebar-accent: oklch(0.67 0.09 56.00);
86 |   --sidebar-accent-foreground: oklch(0.26 0.01 353.48);
87 |   --sidebar-border: oklch(0.36 0.02 342.27);
88 |   --sidebar-ring: oklch(0.74 0.16 34.71);
89 |   --font-sans: Montserrat, sans-serif;
90 |   --font-serif: Merriweather, serif;
91 |   --font-mono: Ubuntu Mono, monospace;
92 |   --radius: 0.625rem;
93 |   --shadow-2xs: 0px 6px 12px -3px hsl(0 0% 0% / 0.04);
94 |   --shadow-xs: 0px 6px 12px -3px hsl(0 0% 0% / 0.04);
95 |   --shadow-sm: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 1px 2px -4px hsl(0 0% 0% / 0.09);
96 |   --shadow: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 1px 2px -4px hsl(0 0% 0% / 0.09);
97 |   --shadow-md: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 2px 4px -4px hsl(0 0% 0% / 0.09);
98 |   --shadow-lg: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 4px 6px -4px hsl(0 0% 0% / 0.09);
99 |   --shadow-xl: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 8px 10px -4px hsl(0 0% 0% / 0.09);
100 |   --shadow-2xl: 0px 6px 12px -3px hsl(0 0% 0% / 0.22);
101 | }
102 | 
103 | .sunset {
104 |   --background: oklch(0.98 0.03 80.00);
105 |   --foreground: oklch(0.34 0.01 2.77);
106 |   --card: oklch(1.00 0 0);
107 |   --card-foreground: oklch(0.34 0.01 2.77);
108 |   --popover: oklch(1.00 0 0);
109 |   --popover-foreground: oklch(0.34 0.01 2.77);
110 |   --primary: oklch(0.65 0.26 34.00);
111 |   --primary-foreground: oklch(1.00 0 0);
112 |   --secondary: oklch(0.96 0.05 60.00);
113 |   --secondary-foreground: oklch(0.56 0.13 32.74);
114 |   --muted: oklch(0.97 0.02 39.40);
115 |   --muted-foreground: oklch(0.49 0.05 26.45);
116 |   --accent: oklch(0.83 0.22 50.00);
117 |   --accent-foreground: oklch(0.34 0.01 2.77);
118 |   --destructive: oklch(0.61 0.21 22.24);
119 |   --destructive-foreground: oklch(1.00 0 0);
120 |   --border: oklch(0.93 0.06 60.00);
121 |   --input: oklch(0.93 0.06 60.00);
122 |   --ring: oklch(0.65 0.26 34.00);
123 |   --chart-1: oklch(0.65 0.26 34.00);
124 |   --chart-2: oklch(0.83 0.22 50.00);
125 |   --chart-3: oklch(0.88 0.15 54.93);
126 |   --chart-4: oklch(0.82 0.20 40.89);
127 |   --chart-5: oklch(0.64 0.18 32.07);
128 |   --sidebar: oklch(0.97 0.04 70.00);
129 |   --sidebar-foreground: oklch(0.34 0.01 2.77);
130 |   --sidebar-primary: oklch(0.65 0.26 34.00);
131 |   --sidebar-primary-foreground: oklch(1.00 0 0);
132 |   --sidebar-accent: oklch(0.83 0.22 50.00);
133 |   --sidebar-accent-foreground: oklch(0.34 0.01 2.77);
134 |   --sidebar-border: oklch(0.93 0.06 60.00);
135 |   --sidebar-ring: oklch(0.65 0.26 34.00);
136 |   --font-sans: Montserrat, sans-serif;
137 |   --font-serif: Merriweather, serif;
138 |   --font-mono: Ubuntu Mono, monospace;
139 |   --radius: 0.625rem;
140 |   --shadow-2xs: 0px 6px 12px -3px hsl(0 0% 0% / 0.04);
141 |   --shadow-xs: 0px 6px 12px -3px hsl(0 0% 0% / 0.04);
142 |   --shadow-sm: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 1px 2px -4px hsl(0 0% 0% / 0.09);
143 |   --shadow: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 1px 2px -4px hsl(0 0% 0% / 0.09);
144 |   --shadow-md: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 2px 4px -4px hsl(0 0% 0% / 0.09);
145 |   --shadow-lg: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 4px 6px -4px hsl(0 0% 0% / 0.09);
146 |   --shadow-xl: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 8px 10px -4px hsl(0 0% 0% / 0.09);
147 |   --shadow-2xl: 0px 6px 12px -3px hsl(0 0% 0% / 0.22);
148 | }
149 | 
150 | .black {
151 |   --background: oklch(0.15 0.01 350.00);
152 |   --foreground: oklch(0.95 0.01 60.00);
153 |   --card: oklch(0.20 0.01 340.00);
154 |   --card-foreground: oklch(0.95 0.01 60.00);
155 |   --popover: oklch(0.20 0.01 340.00);
156 |   --popover-foreground: oklch(0.95 0.01 60.00);
157 |   --primary: oklch(0.45 0.10 35.00);
158 |   --primary-foreground: oklch(1.00 0 0);
159 |   --secondary: oklch(0.25 0.01 340.00);
160 |   --secondary-foreground: oklch(0.95 0.01 60.00);
161 |   --muted: oklch(0.22 0.01 340.00);
162 |   --muted-foreground: oklch(0.86 0.01 60.00);
163 |   --accent: oklch(0.70 0.09 58.00);
164 |   --accent-foreground: oklch(0.15 0.01 350.00);
165 |   --destructive: oklch(0.45 0.16 20.00);
166 |   --destructive-foreground: oklch(1.00 0 0);
167 |   --border: oklch(0.25 0.01 340.00);
168 |   --input: oklch(0.25 0.01 340.00);
169 |   --ring: oklch(0.45 0.10 35.00);
170 |   --chart-1: oklch(0.45 0.10 35.00);
171 |   --chart-2: oklch(0.70 0.09 58.00);
172 |   --chart-3: oklch(0.80 0.06 54.00);
173 |   --chart-4: oklch(0.75 0.08 40.00);
174 |   --chart-5: oklch(0.55 0.10 32.00);
175 |   --sidebar: oklch(0.15 0.01 350.00);
176 |   --sidebar-foreground: oklch(0.95 0.01 60.00);
177 |   --sidebar-primary: oklch(0.40 0.06 34.00);
178 |   --sidebar-primary-foreground: oklch(1.00 0 0);
179 |   --sidebar-accent: oklch(0.60 0.07 56.00);
180 |   --sidebar-accent-foreground: oklch(0.15 0.01 350.00);
181 |   --sidebar-border: oklch(0.25 0.01 340.00);
182 |   --sidebar-ring: oklch(0.45 0.10 35.00);
183 |   --font-sans: Montserrat, sans-serif;
184 |   --font-serif: Merriweather, serif;
185 |   --font-mono: Ubuntu Mono, monospace;
186 |   --radius: 0.625rem;
187 |   --shadow-2xs: 0px 6px 12px -3px hsl(0 0% 0% / 0.04);
188 |   --shadow-xs: 0px 6px 12px -3px hsl(0 0% 0% / 0.04);
189 |   --shadow-sm: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 1px 2px -4px hsl(0 0% 0% / 0.09);
190 |   --shadow: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 1px 2px -4px hsl(0 0% 0% / 0.09);
191 |   --shadow-md: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 2px 4px -4px hsl(0 0% 0% / 0.09);
192 |   --shadow-lg: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 4px 6px -4px hsl(0 0% 0% / 0.09);
193 |   --shadow-xl: 0px 6px 12px -3px hsl(0 0% 0% / 0.09), 0px 8px 10px -4px hsl(0 0% 0% / 0.09);
194 |   --shadow-2xl: 0px 6px 12px -3px hsl(0 0% 0% / 0.22);
195 | }
196 | 
197 | /* Cyberpunk Theme */
198 | .cyberpunk {
199 |   --background: oklch(0.18 0.05 280);
200 |   /* Dark Purple */
201 |   --foreground: oklch(0.90 0.15 180);
202 |   /* Bright Cyan */
203 |   --card: oklch(0.22 0.06 275);
204 |   /* Darker Purple */
205 |   --card-foreground: oklch(0.90 0.15 180);
206 |   /* Bright Cyan */
207 |   --popover: oklch(0.22 0.06 275);
208 |   /* Darker Purple */
209 |   --popover-foreground: oklch(0.90 0.15 180);
210 |   /* Bright Cyan */
211 |   --primary: oklch(0.70 0.25 300);
212 |   /* Electric Pink */
213 |   --primary-foreground: oklch(0.10 0.02 280);
214 |   /* Very Dark Purple */
215 |   --secondary: oklch(0.30 0.08 270);
216 |   /* Medium Purple */
217 |   --secondary-foreground: oklch(0.90 0.15 180);
218 |   /* Bright Cyan */
219 |   --muted: oklch(0.25 0.07 272);
220 |   /* Muted Purple */
221 |   --muted-foreground: oklch(0.75 0.10 180);
222 |   /* Lighter Cyan */
223 |   --accent: oklch(0.85 0.20 140);
224 |   /* Neon Green */
225 |   --accent-foreground: oklch(0.10 0.02 280);
226 |   /* Very Dark Purple */
227 |   --destructive: oklch(0.60 0.25 15);
228 |   /* Bright Red */
229 |   --destructive-foreground: oklch(0.10 0.02 280);
230 |   /* Very Dark Purple */
231 |   --border: oklch(0.40 0.10 290);
232 |   /* Neon Border */
233 |   --input: oklch(0.30 0.08 270);
234 |   /* Medium Purple */
235 |   --ring: oklch(0.70 0.25 300);
236 |   /* Electric Pink */
237 |   --chart-1: oklch(0.70 0.25 300);
238 |   /* Electric Pink */
239 |   --chart-2: oklch(0.85 0.20 140);
240 |   /* Neon Green */
241 |   --chart-3: oklch(0.75 0.22 240);
242 |   /* Electric Blue */
243 |   --chart-4: oklch(0.80 0.18 90);
244 |   /* Neon Yellow */
245 |   --chart-5: oklch(0.65 0.20 0);
246 |   /* Bright Orange */
247 |   --sidebar: oklch(0.15 0.04 285);
248 |   /* Very Dark Purple */
249 |   --sidebar-foreground: oklch(0.90 0.15 180);
250 |   /* Bright Cyan */
251 |   --sidebar-primary: oklch(0.70 0.25 300);
252 |   /* Electric Pink */
253 |   --sidebar-primary-foreground: oklch(0.10 0.02 280);
254 |   /* Very Dark Purple */
255 |   --sidebar-accent: oklch(0.85 0.20 140);
256 |   /* Neon Green */
257 |   --sidebar-accent-foreground: oklch(0.10 0.02 280);
258 |   /* Very Dark Purple */
259 |   --sidebar-border: oklch(0.40 0.10 290);
260 |   /* Neon Border */
261 |   --sidebar-ring: oklch(0.70 0.25 300);
262 |   /* Electric Pink */
263 |   --font-sans: 'Orbitron', sans-serif;
264 |   /* Futuristic font */
265 |   --font-serif: 'Share Tech Mono', monospace;
266 |   /* Monospaced for code feel */
267 |   --font-mono: 'Share Tech Mono', monospace;
268 |   --radius: 0.25rem;
269 |   /* Sharper edges */
270 |   --shadow-2xs: 0px 2px 4px -1px oklch(0.70 0.25 300 / 0.2);
271 |   --shadow-xs: 0px 3px 6px -1px oklch(0.70 0.25 300 / 0.25);
272 |   --shadow-sm: 0px 4px 8px -2px oklch(0.70 0.25 300 / 0.3), 0px 2px 4px -2px oklch(0.70 0.25 300 / 0.2);
273 |   --shadow: 0px 6px 12px -3px oklch(0.70 0.25 300 / 0.35), 0px 4px 6px -4px oklch(0.70 0.25 300 / 0.25);
274 |   --shadow-md: 0px 8px 16px -4px oklch(0.70 0.25 300 / 0.4), 0px 4px 8px -4px oklch(0.70 0.25 300 / 0.3);
275 |   --shadow-lg: 0px 12px 24px -6px oklch(0.70 0.25 300 / 0.45), 0px 6px 12px -6px oklch(0.70 0.25 300 / 0.35);
276 |   --shadow-xl: 0px 16px 32px -8px oklch(0.70 0.25 300 / 0.5), 0px 8px 16px -8px oklch(0.70 0.25 300 / 0.4);
277 |   --shadow-2xl: 0px 24px 48px -12px oklch(0.70 0.25 300 / 0.6);
278 | }
279 | 
280 | /* Retro Theme */
281 | .retro {
282 |   --background: oklch(0.95 0.02 90);
283 |   /* Cream */
284 |   --foreground: oklch(0.35 0.08 40);
285 |   /* Dark Brown */
286 |   --card: oklch(0.98 0.01 85);
287 |   /* Lighter Cream */
288 |   --card-foreground: oklch(0.35 0.08 40);
289 |   /* Dark Brown */
290 |   --popover: oklch(0.98 0.01 85);
291 |   /* Lighter Cream */
292 |   --popover-foreground: oklch(0.35 0.08 40);
293 |   /* Dark Brown */
294 |   --primary: oklch(0.60 0.15 140);
295 |   /* Avocado Green */
296 |   --primary-foreground: oklch(0.95 0.02 90);
297 |   /* Cream */
298 |   --secondary: oklch(0.85 0.10 80);
299 |   /* Mustard Yellow */
300 |   --secondary-foreground: oklch(0.35 0.08 40);
301 |   /* Dark Brown */
302 |   --muted: oklch(0.92 0.03 88);
303 |   /* Muted Cream */
304 |   --muted-foreground: oklch(0.50 0.06 50);
305 |   /* Medium Brown */
306 |   --accent: oklch(0.65 0.18 30);
307 |   /* Burnt Orange */
308 |   --accent-foreground: oklch(0.95 0.02 90);
309 |   /* Cream */
310 |   --destructive: oklch(0.55 0.20 25);
311 |   /* Muted Red */
312 |   --destructive-foreground: oklch(0.95 0.02 90);
313 |   /* Cream */
314 |   --border: oklch(0.88 0.04 70);
315 |   /* Light Brown Border */
316 |   --input: oklch(0.88 0.04 70);
317 |   /* Light Brown Border */
318 |   --ring: oklch(0.60 0.15 140);
319 |   /* Avocado Green */
320 |   --chart-1: oklch(0.60 0.15 140);
321 |   /* Avocado Green */
322 |   --chart-2: oklch(0.65 0.18 30);
323 |   /* Burnt Orange */
324 |   --chart-3: oklch(0.70 0.12 190);
325 |   /* Teal */
326 |   --chart-4: oklch(0.85 0.10 80);
327 |   /* Mustard Yellow */
328 |   --chart-5: oklch(0.50 0.10 45);
329 |   /* Darker Brown */
330 |   --sidebar: oklch(0.90 0.03 85);
331 |   /* Slightly Darker Cream */
332 |   --sidebar-foreground: oklch(0.35 0.08 40);
333 |   /* Dark Brown */
334 |   --sidebar-primary: oklch(0.60 0.15 140);
335 |   /* Avocado Green */
336 |   --sidebar-primary-foreground: oklch(0.95 0.02 90);
337 |   /* Cream */
338 |   --sidebar-accent: oklch(0.65 0.18 30);
339 |   /* Burnt Orange */
340 |   --sidebar-accent-foreground: oklch(0.95 0.02 90);
341 |   /* Cream */
342 |   --sidebar-border: oklch(0.88 0.04 70);
343 |   /* Light Brown Border */
344 |   --sidebar-ring: oklch(0.60 0.15 140);
345 |   /* Avocado Green */
346 |   --font-sans: 'Lobster', cursive;
347 |   /* Retro script */
348 |   --font-serif: 'Playfair Display', serif;
349 |   /* Classic serif */
350 |   --font-mono: 'Courier Prime', monospace;
351 |   /* Typewriter mono */
352 |   --radius: 0.8rem;
353 |   /* Rounded corners */
354 |   --shadow-2xs: 0px 1px 2px 0px oklch(0.35 0.08 40 / 0.05);
355 |   --shadow-xs: 0px 2px 4px -1px oklch(0.35 0.08 40 / 0.06), 0px 1px 2px -1px oklch(0.35 0.08 40 / 0.04);
356 |   --shadow-sm: 0px 3px 6px -1px oklch(0.35 0.08 40 / 0.08), 0px 2px 4px -2px oklch(0.35 0.08 40 / 0.05);
357 |   --shadow: 0px 4px 8px -2px oklch(0.35 0.08 40 / 0.1), 0px 2px 4px -2px oklch(0.35 0.08 40 / 0.06);
358 |   --shadow-md: 0px 6px 12px -3px oklch(0.35 0.08 40 / 0.12), 0px 4px 6px -4px oklch(0.35 0.08 40 / 0.07);
359 |   --shadow-lg: 0px 10px 20px -5px oklch(0.35 0.08 40 / 0.14), 0px 6px 10px -6px oklch(0.35 0.08 40 / 0.09);
360 |   --shadow-xl: 0px 15px 30px -8px oklch(0.35 0.08 40 / 0.16), 0px 8px 15px -8px oklch(0.35 0.08 40 / 0.11);
361 |   --shadow-2xl: 0px 25px 50px -12px oklch(0.35 0.08 40 / 0.25);
362 | }
363 | 
364 | /* Nature Theme */
365 | .nature {
366 |   --background: oklch(0.96 0.03 140);
367 |   /* Light Leaf Green */
368 |   --foreground: oklch(0.25 0.06 110);
369 |   /* Dark Forest Green */
370 |   --card: oklch(1.00 0.01 130);
371 |   /* Almost White Green Tint */
372 |   --card-foreground: oklch(0.25 0.06 110);
373 |   /* Dark Forest Green */
374 |   --popover: oklch(1.00 0.01 130);
375 |   /* Almost White Green Tint */
376 |   --popover-foreground: oklch(0.25 0.06 110);
377 |   /* Dark Forest Green */
378 |   --primary: oklch(0.55 0.18 150);
379 |   /* Vibrant Leaf Green */
380 |   --primary-foreground: oklch(0.98 0.01 120);
381 |   /* Very Light Green */
382 |   --secondary: oklch(0.80 0.08 90);
383 |   /* Light Wood Brown */
384 |   --secondary-foreground: oklch(0.25 0.06 110);
385 |   /* Dark Forest Green */
386 |   --muted: oklch(0.92 0.04 135);
387 |   /* Muted Light Green */
388 |   --muted-foreground: oklch(0.45 0.07 115);
389 |   /* Medium Forest Green */
390 |   --accent: oklch(0.75 0.15 220);
391 |   /* Sky Blue */
392 |   --accent-foreground: oklch(0.20 0.05 230);
393 |   /* Dark Blue */
394 |   --destructive: oklch(0.60 0.20 40);
395 |   /* Earthy Red */
396 |   --destructive-foreground: oklch(0.98 0.01 120);
397 |   /* Very Light Green */
398 |   --border: oklch(0.85 0.05 120);
399 |   /* Light Green Border */
400 |   --input: oklch(0.85 0.05 120);
401 |   /* Light Green Border */
402 |   --ring: oklch(0.55 0.18 150);
403 |   /* Vibrant Leaf Green */
404 |   --chart-1: oklch(0.55 0.18 150);
405 |   /* Vibrant Leaf Green */
406 |   --chart-2: oklch(0.75 0.15 220);
407 |   /* Sky Blue */
408 |   --chart-3: oklch(0.65 0.12 80);
409 |   /* Wood Brown */
410 |   --chart-4: oklch(0.80 0.10 60);
411 |   /* Sunlight Yellow */
412 |   --chart-5: oklch(0.70 0.16 350);
413 |   /* Flower Pink */
414 |   --sidebar: oklch(0.90 0.04 130);
415 |   /* Slightly Darker Light Green */
416 |   --sidebar-foreground: oklch(0.25 0.06 110);
417 |   /* Dark Forest Green */
418 |   --sidebar-primary: oklch(0.55 0.18 150);
419 |   /* Vibrant Leaf Green */
420 |   --sidebar-primary-foreground: oklch(0.98 0.01 120);
421 |   /* Very Light Green */
422 |   --sidebar-accent: oklch(0.75 0.15 220);
423 |   /* Sky Blue */
424 |   --sidebar-accent-foreground: oklch(0.20 0.05 230);
425 |   /* Dark Blue */
426 |   --sidebar-border: oklch(0.85 0.05 120);
427 |   /* Light Green Border */
428 |   --sidebar-ring: oklch(0.55 0.18 150);
429 |   /* Vibrant Leaf Green */
430 |   --font-sans: 'Quicksand', sans-serif;
431 |   /* Soft, rounded font */
432 |   --font-serif: 'Gentium Book Basic', serif;
433 |   /* Readable serif */
434 |   --font-mono: 'Fira Code', monospace;
435 |   /* Clear mono */
436 |   --radius: 0.75rem;
437 |   /* Slightly rounded */
438 |   --shadow-2xs: 0px 1px 2px 0px oklch(0.25 0.06 110 / 0.04);
439 |   --shadow-xs: 0px 2px 4px -1px oklch(0.25 0.06 110 / 0.05), 0px 1px 2px -1px oklch(0.25 0.06 110 / 0.03);
440 |   --shadow-sm: 0px 3px 6px -1px oklch(0.25 0.06 110 / 0.07), 0px 2px 4px -2px oklch(0.25 0.06 110 / 0.04);
441 |   --shadow: 0px 4px 8px -2px oklch(0.25 0.06 110 / 0.09), 0px 2px 4px -2px oklch(0.25 0.06 110 / 0.05);
442 |   --shadow-md: 0px 6px 12px -3px oklch(0.25 0.06 110 / 0.11), 0px 4px 6px -4px oklch(0.25 0.06 110 / 0.06);
443 |   --shadow-lg: 0px 10px 20px -5px oklch(0.25 0.06 110 / 0.13), 0px 6px 10px -6px oklch(0.25 0.06 110 / 0.08);
444 |   --shadow-xl: 0px 15px 30px -8px oklch(0.25 0.06 110 / 0.15), 0px 8px 15px -8px oklch(0.25 0.06 110 / 0.10);
445 |   --shadow-2xl: 0px 25px 50px -12px oklch(0.25 0.06 110 / 0.20);
446 | }
447 | 
448 | @theme inline {
449 |   --color-background: var(--background);
450 |   --color-foreground: var(--foreground);
451 |   --color-card: var(--card);
452 |   --color-card-foreground: var(--card-foreground);
453 |   --color-popover: var(--popover);
454 |   --color-popover-foreground: var(--popover-foreground);
455 |   --color-primary: var(--primary);
456 |   --color-primary-foreground: var(--primary-foreground);
457 |   --color-secondary: var(--secondary);
458 |   --color-secondary-foreground: var(--secondary-foreground);
459 |   --color-muted: var(--muted);
460 |   --color-muted-foreground: var(--muted-foreground);
461 |   --color-accent: var(--accent);
462 |   --color-accent-foreground: var(--accent-foreground);
463 |   --color-destructive: var(--destructive);
464 |   --color-destructive-foreground: var(--destructive-foreground);
465 |   --color-border: var(--border);
466 |   --color-input: var(--input);
467 |   --color-ring: var(--ring);
468 |   --color-chart-1: var(--chart-1);
469 |   --color-chart-2: var(--chart-2);
470 |   --color-chart-3: var(--chart-3);
471 |   --color-chart-4: var(--chart-4);
472 |   --color-chart-5: var(--chart-5);
473 |   --color-sidebar: var(--sidebar);
474 |   --color-sidebar-foreground: var(--sidebar-foreground);
475 |   --color-sidebar-primary: var(--sidebar-primary);
476 |   --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
477 |   --color-sidebar-accent: var(--sidebar-accent);
478 |   --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
479 |   --color-sidebar-border: var(--sidebar-border);
480 |   --color-sidebar-ring: var(--sidebar-ring);
481 | 
482 |   --font-sans: var(--font-sans);
483 |   --font-mono: var(--font-mono);
484 |   --font-serif: var(--font-serif);
485 | 
486 |   --radius-sm: calc(var(--radius) - 4px);
487 |   --radius-md: calc(var(--radius) - 2px);
488 |   --radius-lg: var(--radius);
489 |   --radius-xl: calc(var(--radius) + 4px);
490 | 
491 |   --shadow-2xs: var(--shadow-2xs);
492 |   --shadow-xs: var(--shadow-xs);
493 |   --shadow-sm: var(--shadow-sm);
494 |   --shadow: var(--shadow);
495 |   --shadow-md: var(--shadow-md);
496 |   --shadow-lg: var(--shadow-lg);
497 |   --shadow-xl: var(--shadow-xl);
498 |   --shadow-2xl: var(--shadow-2xl);
499 | }
500 | 
501 | @layer base {
502 |   * {
503 |     @apply border-border outline-ring/50;
504 |   }
505 | 
506 |   body {
507 |     @apply bg-background text-foreground;
508 |     letter-spacing: var(--tracking-normal);
509 |   }
510 | }
511 | 
512 | @layer utilities {
513 | 
514 |   /* Hide scrollbar for Chrome, Safari and Opera */
515 |   .no-scrollbar::-webkit-scrollbar {
516 |     display: none;
517 |   }
518 | 
519 |   /* Hide scrollbar for IE, Edge and Firefox */
520 |   .no-scrollbar {
521 |     -ms-overflow-style: none;
522 |     /* IE and Edge */
523 |     /* Use Firefox-specific scrollbar hiding when supported */
524 |     scrollbar-width: none;
525 |   }
526 | }
```

app/layout.tsx
```
1 | import type { Metadata } from "next";
2 | import { Inter } from "next/font/google";
3 | import { ChatSidebar } from "@/components/chat-sidebar";
4 | import { SidebarTrigger } from "@/components/ui/sidebar";
5 | import { PlusCircle } from "lucide-react";
6 | import { Providers } from "./providers";
7 | import "./globals.css";
8 | import Script from "next/script";
9 | import { Button } from "@/components/ui/button";
10 | import Link from "next/link";
11 | import { WebSearchProvider } from "@/lib/context/web-search-context";
12 | import { cn } from "@/lib/utils";
13 | import BuildInfo from "@/components/ui/BuildInfo";
14 | import Image from "next/image";
15 | 
16 | const inter = Inter({ subsets: ["latin"] });
17 | 
18 | export const metadata: Metadata = {
19 |   metadataBase: new URL("https://www.chatlima.com/"),
20 |   title: "ChatLima",
21 |   description: "ChatLima is a minimalistic MCP client with a good feature set.",
22 |   icons: {
23 |     icon: "/logo.png",
24 |   },
25 |   openGraph: {
26 |     siteName: "ChatLima",
27 |     url: "https://www.chatlima.com/",
28 |     images: [
29 |       {
30 |         url: "https://www.chatlima.com/opengraph-image.png",
31 |         width: 1200,
32 |         height: 630,
33 |       },
34 |     ],
35 |   },
36 |   twitter: {
37 |     card: "summary_large_image",
38 |     title: "ChatLima",
39 |     description: "ChatLima is a minimalistic MCP client with a good feature set.",
40 |     images: ["https://www.chatlima.com/twitter-image.png"],
41 |   },
42 | };
43 | 
44 | export default function RootLayout({
45 |   children,
46 | }: Readonly<{
47 |   children: React.ReactNode;
48 | }>) {
49 |   return (
50 |     <html lang="en" suppressHydrationWarning>
51 |       <body className={`${inter.className}`}>
52 |         <Providers>
53 |           <WebSearchProvider>
54 |             <div className="flex h-dvh w-full">
55 |               <ChatSidebar />
56 |               <main className="flex-1 flex flex-col relative">
57 |                 <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
58 |                   <SidebarTrigger>
59 |                     <button className="flex items-center justify-center h-8 w-8 bg-muted hover:bg-accent rounded-md transition-colors">
60 |                       <Image src="/logo.png" alt="ChatLima logo" width={16} height={16} />
61 |                     </button>
62 |                   </SidebarTrigger>
63 |                   <Button
64 |                     variant="ghost"
65 |                     size="icon"
66 |                     className="flex items-center justify-center h-8 w-8 bg-muted hover:bg-accent rounded-md transition-colors"
67 |                     asChild
68 |                   >
69 |                     <Link href="/" title="New Chat">
70 |                       <PlusCircle className="h-4 w-4" />
71 |                     </Link>
72 |                   </Button>
73 |                 </div>
74 |                 <div className="flex-1 flex justify-center">
75 |                   {children}
76 |                 </div>
77 |               </main>
78 |             </div>
79 |           </WebSearchProvider>
80 |         </Providers>
81 |         <Script defer src="https://cloud.umami.is/script.js" data-website-id="bd3f8736-1562-47e0-917c-c10fde7ef0d2" />
82 |       </body>
83 |     </html>
84 |   );
85 | }
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
1 | import * as React from "react"
2 | 
3 | const MOBILE_BREAKPOINT = 768
4 | 
5 | export function useIsMobile() {
6 |   const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
7 | 
8 |   React.useEffect(() => {
9 |     const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
10 |     const onChange = () => {
11 |       setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
12 |     }
13 |     mql.addEventListener("change", onChange)
14 |     setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
15 |     return () => mql.removeEventListener("change", onChange)
16 |   }, [])
17 | 
18 |   return !!isMobile
19 | }
```

hooks/useAuth.ts
```
1 | import { useEffect, useState } from 'react';
2 | import { auth } from '@/lib/auth';
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
15 | }
16 | 
17 | export function useAuth() {
18 |     const [status, setStatus] = useState<AuthStatus>('loading');
19 |     const [user, setUser] = useState<AuthUser | null>(null);
20 |     const [error, setError] = useState<Error | null>(null);
21 | 
22 |     useEffect(() => {
23 |         const fetchSession = async () => {
24 |             try {
25 |                 // Get session (handles both signed in and anonymous users)
26 |                 const session = await auth.api.getSession({ headers: new Headers() });
27 | 
28 |                 if (session && session.user) {
29 |                     // If we have a user with ID, we're authenticated in some form
30 |                     if (session.user.id) {
31 |                         const isAnonymous = (session.user as any).isAnonymous === true;
32 | 
33 |                         setUser({
34 |                             id: session.user.id,
35 |                             name: session.user.name || null,
36 |                             email: session.user.email || null,
37 |                             image: session.user.image || null,
38 |                             isAnonymous: isAnonymous,
39 |                             // These values would be fetched separately from an API endpoint
40 |                             messageLimit: isAnonymous ? 10 : 20,
41 |                             messageRemaining: 0, // Would be updated via API
42 |                             hasSubscription: !!(session.user as any)?.metadata?.hasSubscription,
43 |                         });
44 | 
45 |                         setStatus(isAnonymous ? 'anonymous' : 'authenticated');
46 |                     } else {
47 |                         setStatus('unauthenticated');
48 |                         setUser(null);
49 |                     }
50 |                 } else {
51 |                     // No session means not authenticated
52 |                     setStatus('unauthenticated');
53 |                     setUser(null);
54 |                 }
55 |             } catch (err) {
56 |                 setError(err instanceof Error ? err : new Error(String(err)));
57 |                 setStatus('unauthenticated');
58 |                 setUser(null);
59 |             }
60 |         };
61 | 
62 |         fetchSession();
63 |     }, []);
64 | 
65 |     // Sign in with Google
66 |     const signIn = async () => {
67 |         try {
68 |             // Redirect to Google sign-in page
69 |             window.location.href = '/api/auth/signin/google';
70 |         } catch (err) {
71 |             setError(err instanceof Error ? err : new Error(String(err)));
72 |         }
73 |     };
74 | 
75 |     // Sign out
76 |     const signOut = async () => {
77 |         try {
78 |             // Redirect to sign-out page
79 |             window.location.href = '/api/auth/signout';
80 | 
81 |             // The server will create a new anonymous session automatically
82 |             // We'll need to wait for the redirect to complete and then reload
83 |         } catch (err) {
84 |             setError(err instanceof Error ? err : new Error(String(err)));
85 |         }
86 |     };
87 | 
88 |     // Get message usage data
89 |     const refreshMessageUsage = async () => {
90 |         if (!user) return;
91 | 
92 |         try {
93 |             const response = await fetch('/api/usage/messages');
94 |             if (response.ok) {
95 |                 const data = await response.json();
96 |                 setUser(prev => prev ? {
97 |                     ...prev,
98 |                     messageLimit: data.limit,
99 |                     messageRemaining: data.remaining
100 |                 } : null);
101 |             }
102 |         } catch (err) {
103 |             console.error('Failed to fetch message usage:', err);
104 |         }
105 |     };
106 | 
107 |     return {
108 |         status,
109 |         user,
110 |         error,
111 |         signIn,
112 |         signOut,
113 |         refreshMessageUsage,
114 |         isLoading: status === 'loading',
115 |         isAuthenticated: status === 'authenticated',
116 |         isAnonymous: status === 'anonymous',
117 |     };
118 | } 
```

hooks/useCredits.ts
```
1 | import { useState, useEffect } from 'react';
2 | import { getRemainingCredits, getRemainingCreditsByExternalId } from '../lib/polar';
3 | 
4 | /**
5 |  * Hook to get and manage a user's credits
6 |  * 
7 |  * @param polarCustomerId The customer's ID in Polar system (legacy)
8 |  * @param userId The user's ID in our application (used as external ID in Polar)
9 |  * @returns Object containing the user's credits status and related functions
10 |  */
11 | export function useCredits(polarCustomerId?: string, userId?: string) {
12 |     const [credits, setCredits] = useState<number | null>(null);
13 |     const [loading, setLoading] = useState<boolean>(false);
14 |     const [error, setError] = useState<Error | null>(null);
15 | 
16 |     // Function to fetch credits
17 |     const fetchCredits = async () => {
18 |         // If neither ID is provided, we can't fetch credits
19 |         if (!polarCustomerId && !userId) {
20 |             setCredits(null);
21 |             return;
22 |         }
23 | 
24 |         setLoading(true);
25 |         setError(null);
26 | 
27 |         try {
28 |             // Try the external ID approach first if a userId is provided
29 |             if (userId) {
30 |                 try {
31 |                     const remainingCreditsByExternal = await getRemainingCreditsByExternalId(userId);
32 |                     if (remainingCreditsByExternal !== null) {
33 |                         setCredits(remainingCreditsByExternal);
34 |                         setLoading(false);
35 |                         return;
36 |                     }
37 |                     // If external ID lookup fails, fall through to legacy method
38 |                 } catch (externalError) {
39 |                     console.warn('Failed to get credits via external ID, falling back to legacy method:', externalError);
40 |                     // Continue to legacy method
41 |                 }
42 |             }
43 | 
44 |             // Legacy method using polarCustomerId
45 |             if (polarCustomerId) {
46 |                 const remainingCredits = await getRemainingCredits(polarCustomerId);
47 |                 setCredits(remainingCredits);
48 |             } else {
49 |                 setCredits(null);
50 |             }
51 |         } catch (err) {
52 |             console.error('Error fetching credits:', err);
53 |             setError(err instanceof Error ? err : new Error('Failed to fetch credits'));
54 |         } finally {
55 |             setLoading(false);
56 |         }
57 |     };
58 | 
59 |     // Fetch credits on mount and when IDs change
60 |     useEffect(() => {
61 |         fetchCredits();
62 |     }, [polarCustomerId, userId]);
63 | 
64 |     // Helper function to format credits display with thousands separator
65 |     const formattedCredits = credits !== null
66 |         ? credits.toLocaleString()
67 |         : 'Unknown';
68 | 
69 |     // Function to check if user has sufficient credits for an operation
70 |     const hasSufficientCredits = (requiredAmount: number = 1): boolean => {
71 |         if (credits === null) return true; // Allow if credits unknown
72 |         return credits >= requiredAmount;
73 |     };
74 | 
75 |     return {
76 |         credits,
77 |         formattedCredits,
78 |         loading,
79 |         error,
80 |         fetchCredits,
81 |         hasSufficientCredits,
82 |     };
83 | } 
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
53 |   }
54 | ];
55 | 
56 | interface ApiKeyManagerProps {
57 |   open: boolean;
58 |   onOpenChange: (open: boolean) => void;
59 | }
60 | 
61 | export function ApiKeyManager({ open, onOpenChange }: ApiKeyManagerProps) {
62 |   // State to store API keys
63 |   const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
64 | 
65 |   // Load API keys from localStorage on initial mount
66 |   useEffect(() => {
67 |     const storedKeys: Record<string, string> = {};
68 |     
69 |     API_KEYS_CONFIG.forEach(config => {
70 |       const value = localStorage.getItem(config.storageKey);
71 |       if (value) {
72 |         storedKeys[config.key] = value;
73 |       }
74 |     });
75 |     
76 |     setApiKeys(storedKeys);
77 |   }, []);
78 | 
79 |   // Update API key in state
80 |   const handleApiKeyChange = (key: string, value: string) => {
81 |     setApiKeys(prev => ({
82 |       ...prev,
83 |       [key]: value
84 |     }));
85 |   };
86 | 
87 |   // Save API keys to localStorage
88 |   const handleSaveApiKeys = () => {
89 |     try {
90 |       API_KEYS_CONFIG.forEach(config => {
91 |         const value = apiKeys[config.key];
92 |         
93 |         if (value && value.trim()) {
94 |           localStorage.setItem(config.storageKey, value.trim());
95 |         } else {
96 |           localStorage.removeItem(config.storageKey);
97 |         }
98 |       });
99 |       
100 |       toast.success("API keys saved successfully");
101 |       onOpenChange(false);
102 |     } catch (error) {
103 |       console.error("Error saving API keys:", error);
104 |       toast.error("Failed to save API keys");
105 |     }
106 |   };
107 | 
108 |   // Clear all API keys
109 |   const handleClearApiKeys = () => {
110 |     try {
111 |       API_KEYS_CONFIG.forEach(config => {
112 |         localStorage.removeItem(config.storageKey);
113 |       });
114 |       
115 |       setApiKeys({});
116 |       toast.success("All API keys cleared");
117 |     } catch (error) {
118 |       console.error("Error clearing API keys:", error);
119 |       toast.error("Failed to clear API keys");
120 |     }
121 |   };
122 | 
123 |   return (
124 |     <Dialog open={open} onOpenChange={onOpenChange}>
125 |       <DialogContent className="sm:max-w-[500px]">
126 |         <DialogHeader>
127 |           <DialogTitle>API Key Settings</DialogTitle>
128 |           <DialogDescription>
129 |             Enter your own API keys for different AI providers. Keys are stored securely in your browser&apos;s local storage.
130 |           </DialogDescription>
131 |         </DialogHeader>
132 |         
133 |         <div className="grid gap-4 py-4">
134 |           {API_KEYS_CONFIG.map(config => (
135 |             <div key={config.key} className="grid gap-2">
136 |               <Label htmlFor={config.key}>{config.label}</Label>
137 |               <Input
138 |                 id={config.key}
139 |                 type="password"
140 |                 value={apiKeys[config.key] || ""}
141 |                 onChange={(e) => handleApiKeyChange(config.key, e.target.value)}
142 |                 placeholder={config.placeholder}
143 |               />
144 |             </div>
145 |           ))}
146 |         </div>
147 |         
148 |         <DialogFooter className="flex justify-between sm:justify-between">
149 |           <Button
150 |             variant="destructive"
151 |             onClick={handleClearApiKeys}
152 |           >
153 |             Clear All Keys
154 |           </Button>
155 |           <div className="flex gap-2">
156 |             <Button
157 |               variant="outline"
158 |               onClick={() => onOpenChange(false)}
159 |             >
160 |               Cancel
161 |             </Button>
162 |             <Button onClick={handleSaveApiKeys}>
163 |               Save Keys
164 |             </Button>
165 |           </div>
166 |         </DialogFooter>
167 |       </DialogContent>
168 |     </Dialog>
169 |   );
170 | } 
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
24 | 
25 | interface Chat {
26 |     id: string;
27 |     title: string;
28 |     userId: string;
29 |     createdAt: Date;
30 |     updatedAt: Date;
31 |     sharePath?: string | null;
32 | }
33 | 
34 | interface ChatListProps {
35 |     chats: Chat[];
36 |     isLoading: boolean;
37 |     isCollapsed: boolean;
38 |     isUpdatingChatTitle: boolean;
39 |     onNewChat: () => void;
40 |     onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
41 |     onUpdateChatTitle: (params: { chatId: string, title: string }, options: { onSuccess: () => void, onError: () => void }) => void;
42 | }
43 | 
44 | export function ChatList({
45 |     chats,
46 |     isLoading,
47 |     isCollapsed,
48 |     isUpdatingChatTitle,
49 |     onNewChat,
50 |     onDeleteChat,
51 |     onUpdateChatTitle,
52 | }: ChatListProps) {
53 |     const router = useRouter();
54 |     const pathname = usePathname();
55 |     const [searchTerm, setSearchTerm] = useState("");
56 |     const [editingChatId, setEditingChatId] = useState<string | null>(null);
57 |     const [editingChatTitle, setEditingChatTitle] = useState<string>("");
58 |     const inputRef = useRef<HTMLInputElement>(null);
59 | 
60 |     const filteredChats = chats?.filter(chat =>
61 |         chat.title.toLowerCase().includes(searchTerm.toLowerCase())
62 |     ) || [];
63 | 
64 |     const handleStartEdit = (chatId: string, currentTitle: string, e: React.MouseEvent) => {
65 |         e.stopPropagation();
66 |         e.preventDefault();
67 |         setEditingChatId(chatId);
68 |         setEditingChatTitle(currentTitle);
69 |         setTimeout(() => {
70 |             inputRef.current?.focus();
71 |             inputRef.current?.select();
72 |         }, 0);
73 |     };
74 | 
75 |     const handleCancelEdit = () => {
76 |         setEditingChatId(null);
77 |         setEditingChatTitle("");
78 |     };
79 | 
80 |     const handleSaveEdit = () => {
81 |         if (!editingChatId || editingChatTitle.trim() === "") {
82 |             toast.error("Chat title cannot be empty.");
83 |             inputRef.current?.focus();
84 |             return;
85 |         }
86 | 
87 |         onUpdateChatTitle(
88 |             { chatId: editingChatId, title: editingChatTitle.trim() },
89 |             {
90 |                 onSuccess: () => {
91 |                     setEditingChatId(null);
92 |                     setEditingChatTitle("");
93 |                 },
94 |                 onError: () => {
95 |                     inputRef.current?.focus();
96 |                     inputRef.current?.select();
97 |                 }
98 |             }
99 |         );
100 |     };
101 | 
102 |     const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
103 |         setEditingChatTitle(e.target.value);
104 |     };
105 | 
106 |     const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
107 |         if (e.key === 'Enter') {
108 |             e.preventDefault();
109 |             handleSaveEdit();
110 |         } else if (e.key === 'Escape') {
111 |             e.preventDefault();
112 |             handleCancelEdit();
113 |         }
114 |     };
115 | 
116 |     const handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
117 |         if (e.relatedTarget && (e.relatedTarget.id === `save-chat-${editingChatId}` || e.relatedTarget.id === `cancel-chat-${editingChatId}`)) {
118 |             return;
119 |         }
120 |         setTimeout(() => {
121 |             if (editingChatId && document.activeElement !== inputRef.current) {
122 |                 const activeElementId = document.activeElement?.id;
123 |                 if (activeElementId !== `save-chat-${editingChatId}` && activeElementId !== `cancel-chat-${editingChatId}`) {
124 |                     handleCancelEdit();
125 |                 }
126 |             }
127 |         }, 100);
128 |     };
129 | 
130 |     const renderChatSkeletons = () => {
131 |         return Array(3).fill(0).map((_, index) => (
132 |             <SidebarMenuItem key={`skeleton-${index}`}>
133 |                 <div className={`flex items-center gap-2 px-3 py-2 ${isCollapsed ? "justify-center" : ""}`}>
134 |                     <Skeleton className="h-4 w-4 rounded-full" />
135 |                     {!isCollapsed && (
136 |                         <>
137 |                             <Skeleton className="h-4 w-full max-w-[180px]" />
138 |                             <Skeleton className="h-5 w-5 ml-auto rounded-md flex-shrink-0" />
139 |                         </>
140 |                     )}
141 |                 </div>
142 |             </SidebarMenuItem>
143 |         ));
144 |     };
145 | 
146 |     return (
147 |         <>
148 |             {!isCollapsed && (
149 |                 <div className="px-3 pt-1 pb-2 border-b border-border/40">
150 |                     <Button
151 |                         variant="outline"
152 |                         className="w-full mb-2"
153 |                         onClick={onNewChat}
154 |                     >
155 |                         <PlusCircle className="mr-2 h-4 w-4" />
156 |                         New Chat
157 |                     </Button>
158 |                     <Input
159 |                         type="search"
160 |                         placeholder="Search chats..."
161 |                         aria-label="Search chats by title"
162 |                         value={searchTerm}
163 |                         onChange={e => setSearchTerm(e.target.value)}
164 |                         className="w-full"
165 |                     />
166 |                 </div>
167 |             )}
168 |             <SidebarGroupContent className={cn(
169 |                 "overflow-y-auto",
170 |                 isCollapsed ? "overflow-x-hidden overflow-y-hidden" : ""
171 |             )}>
172 |                 {isLoading ? (
173 |                     renderChatSkeletons()
174 |                 ) : filteredChats && filteredChats.length > 0 ? (
175 |                     <AnimatePresence initial={false}>
176 |                         {filteredChats.map((chat) => {
177 |                             const isActive = pathname === `/chat/${chat.id}`;
178 |                             const isEditingThisChat = editingChatId === chat.id;
179 |                             return (
180 |                                 <motion.div
181 |                                     key={chat.id}
182 |                                     initial={{ opacity: 0, height: 0 }}
183 |                                     animate={{ opacity: 1, height: "auto" }}
184 |                                     exit={{ opacity: 0, height: 0 }}
185 |                                     transition={{ duration: 0.2 }}
186 |                                     className="overflow-hidden list-none"
187 |                                 >
188 |                                     <SidebarMenuItem>
189 |                                         {isEditingThisChat ? (
190 |                                             <div className="flex items-center gap-2 px-3 py-2 w-full">
191 |                                                 <Input
192 |                                                     ref={inputRef}
193 |                                                     value={editingChatTitle}
194 |                                                     onChange={handleInputChange}
195 |                                                     onKeyDown={handleInputKeyDown}
196 |                                                     onBlur={handleInputBlur}
197 |                                                     className="h-7 flex-grow px-1 text-sm"
198 |                                                     maxLength={100}
199 |                                                 />
200 |                                                 <Button
201 |                                                     id={`save-chat-${chat.id}`}
202 |                                                     variant="ghost"
203 |                                                     size="icon"
204 |                                                     className="h-6 w-6 text-green-500 hover:text-green-600"
205 |                                                     onClick={handleSaveEdit}
206 |                                                     disabled={isUpdatingChatTitle}
207 |                                                 >
208 |                                                     {isUpdatingChatTitle && editingChatId === chat.id ? (
209 |                                                         <Loader2 className="h-4 w-4 animate-spin" />
210 |                                                     ) : (
211 |                                                         <CheckIcon className="h-4 w-4" />
212 |                                                     )}
213 |                                                 </Button>
214 |                                                 <Button
215 |                                                     id={`cancel-chat-${chat.id}`}
216 |                                                     variant="ghost"
217 |                                                     size="icon"
218 |                                                     className="h-6 w-6 text-red-500 hover:text-red-600"
219 |                                                     onClick={handleCancelEdit}
220 |                                                     disabled={isUpdatingChatTitle}
221 |                                                 >
222 |                                                     <XIcon className="h-4 w-4" />
223 |                                                 </Button>
224 |                                             </div>
225 |                                         ) : (
226 |                                             <>
227 |                                                 {isCollapsed ? (
228 |                                                     <TooltipProvider delayDuration={0}>
229 |                                                         <Tooltip>
230 |                                                             <TooltipTrigger asChild>
231 |                                                                 <SidebarMenuButton
232 |                                                                     onClick={() => router.push(`/chat/${chat.id}`)}
233 |                                                                     isActive={isActive}
234 |                                                                     className={cn(
235 |                                                                         "w-full flex justify-center",
236 |                                                                         isActive && "bg-primary/10 dark:bg-primary/20 text-primary hover:text-primary"
237 |                                                                     )}
238 |                                                                 >
239 |                                                                     <MessageSquare className="h-4 w-4" />
240 |                                                                 </SidebarMenuButton>
241 |                                                             </TooltipTrigger>
242 |                                                             <TooltipContent side="right" sideOffset={5}>
243 |                                                                 <p>{chat.title}</p>
244 |                                                             </TooltipContent>
245 |                                                         </Tooltip>
246 |                                                     </TooltipProvider>
247 |                                                 ) : (
248 |                                                     <TooltipProvider delayDuration={0}>
249 |                                                         <Tooltip>
250 |                                                             <TooltipTrigger asChild>
251 |                                                                 <SidebarMenuButton
252 |                                                                     asChild
253 |                                                                     isActive={isActive}
254 |                                                                     className={cn(
255 |                                                                         "w-full flex justify-start pr-10",
256 |                                                                         isActive && "bg-primary/10 dark:bg-primary/20 text-primary hover:text-primary"
257 |                                                                     )}
258 |                                                                 >
259 |                                                                     <Link href={`/chat/${chat.id}`} className="flex items-center flex-grow overflow-hidden">
260 |                                                                         <span className="truncate max-w-[160px]">
261 |                                                                             {chat.title || `Chat ${chat.id.substring(0, 8)}...`}
262 |                                                                         </span>
263 |                                                                     </Link>
264 |                                                                 </SidebarMenuButton>
265 |                                                             </TooltipTrigger>
266 |                                                             <TooltipContent side="right" sideOffset={5}>
267 |                                                                 <p>{chat.title}</p>
268 |                                                             </TooltipContent>
269 |                                                         </Tooltip>
270 |                                                     </TooltipProvider>
271 |                                                 )}
272 |                                                 {!isCollapsed && (
273 |                                                     <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover/menu-item:opacity-100 group-focus-within/menu-item:opacity-100 transition-opacity duration-150">
274 |                                                         <Button
275 |                                                             variant="ghost"
276 |                                                             size="icon"
277 |                                                             className="h-6 w-6 hover:text-blue-500"
278 |                                                             onClick={(e) => handleStartEdit(chat.id, chat.title, e)}
279 |                                                             title="Edit title"
280 |                                                         >
281 |                                                             <Pencil className="h-3 w-3" />
282 |                                                         </Button>
283 |                                                         <Button
284 |                                                             variant="ghost"
285 |                                                             size="icon"
286 |                                                             className="h-6 w-6 hover:text-red-500"
287 |                                                             onClick={(e) => onDeleteChat(chat.id, e)}
288 |                                                             title="Delete chat"
289 |                                                         >
290 |                                                             <Trash2 className="h-3 w-3" />
291 |                                                         </Button>
292 |                                                     </div>
293 |                                                 )}
294 |                                             </>
295 |                                         )}
296 |                                     </SidebarMenuItem>
297 |                                 </motion.div>
298 |                             );
299 |                         })}
300 |                     </AnimatePresence>
301 |                 ) : searchTerm ? (
302 |                     <SidebarMenuItem className="text-sm text-muted-foreground px-3 py-2">
303 |                         {!isCollapsed && "No results found."}
304 |                     </SidebarMenuItem>
305 |                 ) : (
306 |                     <SidebarMenuItem className="text-sm text-muted-foreground px-3 py-2">
307 |                         {!isCollapsed && "No chats yet. Start a new one!"}
308 |                     </SidebarMenuItem>
309 |                 )}
310 |             </SidebarGroupContent>
311 |         </>
312 |     );
313 | } 
```

components/chat-sidebar.tsx
```
1 | "use client";
2 | 
3 | import { useState, useEffect, useRef } from "react";
4 | import { useRouter, usePathname } from "next/navigation";
5 | import { MessageSquare, PlusCircle, Trash2, ServerIcon, Settings, Sparkles, ChevronsUpDown, Copy, Github, Key, LogOut, Globe } from "lucide-react";
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
177 |                         <div className={`flex items-center gap-2 ${isCollapsed ? "justify-center w-full" : ""}`}>
178 |                             <div className={`flex items-center justify-center rounded-full bg-primary ${isCollapsed ? 'h-6 w-6 flex-shrink-0' : 'h-8 w-8'}`}>
179 |                                 <Image src="/logo.png" alt="ChatLima logo" width={32} height={32} className={`${isCollapsed ? 'h-4 w-4' : 'h-6 w-6'}`} />
180 |                             </div>
181 |                             {!isCollapsed && (
182 |                                 <div className="font-semibold text-lg text-foreground/90">ChatLima</div>
183 |                             )}
184 |                         </div>
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
275 |                         <div className={`flex items-center gap-2 ${isCollapsed ? "justify-center w-full" : ""}`}>
276 |                             <div className={`flex items-center justify-center rounded-full bg-primary ${isCollapsed ? 'h-6 w-6 flex-shrink-0' : 'h-8 w-8'}`}>
277 |                                 <Image src="/logo.png" alt="ChatLima logo" width={32} height={32} className={`${isCollapsed ? 'h-4 w-4' : 'h-6 w-6'}`} />
278 |                             </div>
279 |                             {!isCollapsed && (
280 |                                 <div className="font-semibold text-lg text-foreground/90">ChatLima</div>
281 |                             )}
282 |                         </div>
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
313 |                             "px-4 pt-0 text-xs font-medium text-muted-foreground/80 uppercase tracking-wider",
314 |                             isCollapsed ? "sr-only" : ""
315 |                         )}>
316 |                             MCP Servers
317 |                         </SidebarGroupLabel>
318 |                         <SidebarGroupContent>
319 |                             <SidebarMenu>
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
349 |                             </SidebarMenu>
350 |                         </SidebarGroupContent>
351 |                     </SidebarGroup>
352 | 
353 |                     <div className="relative my-0">
354 |                         <div className="absolute inset-x-0">
355 |                             <Separator className="w-full h-px bg-border/40" />
356 |                         </div>
357 |                     </div>
358 | 
359 |                     <SidebarGroup className="flex-shrink-0">
360 |                         <SidebarGroupLabel className={cn(
361 |                             "px-4 pt-2 text-xs font-medium text-muted-foreground/80 uppercase tracking-wider",
362 |                             isCollapsed ? "sr-only" : ""
363 |                         )}>
364 |                             Settings
365 |                         </SidebarGroupLabel>
366 |                         <SidebarGroupContent>
367 |                            <SidebarMenu>
368 |                                 <SidebarMenuItem>
369 |                                     <ThemeToggle
370 |                                         className={cn(
371 |                                             "w-full flex items-center gap-2 transition-all text-sm text-foreground/80",
372 |                                             isCollapsed ? "justify-center" : "justify-start"
373 |                                         )}
374 |                                         showLabel={!isCollapsed}
375 |                                         labelText={<span className="flex-grow text-left">Theme</span>}
376 |                                     />
377 |                                 </SidebarMenuItem>
378 |                                 {webSearchEnabled && (
379 |                                     <SidebarMenuItem>
380 |                                         <DropdownMenu>
381 |                                             <TooltipProvider>
382 |                                                 <Tooltip>
383 |                                                     <DropdownMenuTrigger asChild>
384 |                                                         <TooltipTrigger asChild>
385 |                                                             <SidebarMenuButton
386 |                                                                 className={cn(
387 |                                                                     "w-full flex items-center gap-2 transition-all",
388 |                                                                     "hover:bg-secondary/50 active:bg-secondary/70",
389 |                                                                     isCollapsed ? "justify-center" : ""
390 |                                                                 )}
391 |                                                             >
392 |                                                                 <Globe className={cn(
393 |                                                                     "h-4 w-4 flex-shrink-0",
394 |                                                                     webSearchEnabled ? "text-primary" : "text-muted-foreground"
395 |                                                                 )} />
396 |                                                                 {!isCollapsed && (
397 |                                                                     <span className="text-sm text-foreground/80 flex-grow text-left">
398 |                                                                         Search Context ({webSearchContextSize.charAt(0).toUpperCase() + webSearchContextSize.slice(1)}) 
399 |                                                                     </span>
400 |                                                                 )}
401 |                                                             </SidebarMenuButton>
402 |                                                         </TooltipTrigger>
403 |                                                     </DropdownMenuTrigger>
404 |                                                     {isCollapsed && (
405 |                                                         <TooltipContent side="right" sideOffset={5}>
406 |                                                             Web Search Context: {webSearchContextSize.charAt(0).toUpperCase() + webSearchContextSize.slice(1)}
407 |                                                         </TooltipContent>
408 |                                                     )}
409 |                                                 </Tooltip>
410 |                                             </TooltipProvider>
411 |                                             <DropdownMenuContent 
412 |                                                 align="end" 
413 |                                                 side={isCollapsed ? "right" : "bottom"} 
414 |                                                 sideOffset={8} 
415 |                                                 className="min-w-[120px]"
416 |                                             >
417 |                                                 <DropdownMenuLabel>Search Context Size</DropdownMenuLabel>
418 |                                                 <DropdownMenuSeparator />
419 |                                                 <DropdownMenuItem 
420 |                                                     onClick={() => setWebSearchContextSize('low')}
421 |                                                     className={cn(webSearchContextSize === 'low' && "bg-secondary")}
422 |                                                 >
423 |                                                     Low
424 |                                                 </DropdownMenuItem>
425 |                                                 <DropdownMenuItem 
426 |                                                     onClick={() => setWebSearchContextSize('medium')}
427 |                                                     className={cn(webSearchContextSize === 'medium' && "bg-secondary")}
428 |                                                 >
429 |                                                     Medium
430 |                                                 </DropdownMenuItem>
431 |                                                 <DropdownMenuItem 
432 |                                                     onClick={() => setWebSearchContextSize('high')}
433 |                                                     className={cn(webSearchContextSize === 'high' && "bg-secondary")}
434 |                                                 >
435 |                                                     High
436 |                                                 </DropdownMenuItem>
437 |                                             </DropdownMenuContent>
438 |                                         </DropdownMenu>
439 |                                     </SidebarMenuItem>
440 |                                 )}
441 |                            </SidebarMenu>
442 |                         </SidebarGroupContent>
443 |                     </SidebarGroup>
444 |                 </SidebarContent>
445 |                 
446 |                 <SidebarFooter className="flex flex-col gap-2 p-3 border-t border-border/40">
447 |                     <SidebarMenu>
448 |                         {/* Item removed */}
449 |                     </SidebarMenu>
450 |                     
451 |                     <div className="relative my-0 pt-2">
452 |                         <div className="absolute inset-x-0">
453 |                             <Separator className="w-full h-px bg-border/40" />
454 |                         </div>
455 |                     </div>
456 | 
457 |                     {isSessionLoading ? (
458 |                         <div className="flex items-center gap-2 px-3 py-2 mt-2">
459 |                             <Skeleton className="h-8 w-8 rounded-full" />
460 |                             {!isCollapsed && <Skeleton className="h-4 w-24" />}
461 |                         </div>
462 |                     ) : session?.user?.isAnonymous === true ? (
463 |                         <div className={cn(
464 |                             "flex items-center mt-2", 
465 |                             isCollapsed ? "justify-center px-1 py-2" : "px-3 py-2 gap-2" 
466 |                         )}>
467 |                             <SignInButton isCollapsed={isCollapsed} />
468 |                         </div>
469 |                     ) : (
470 |                         <div className={cn(
471 |                             "flex items-center mt-2", 
472 |                             isCollapsed ? "justify-center px-1 py-2" : "px-3 py-2" 
473 |                         )}>
474 |                             <UserAccountMenu />
475 |                         </div>
476 |                     )}
477 | 
478 |                     <Link 
479 |                         href="https://github.com/zaidmukaddam/scira-mcp-chat" 
480 |                         target="_blank" 
481 |                         rel="noopener noreferrer"
482 |                         className={cn(
483 |                             "flex items-center text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors py-2 mt-2 w-full",
484 |                             isCollapsed ? "justify-center" : "justify-start px-3 gap-2"
485 |                         )}
486 |                     >
487 |                         <div className={cn("flex items-center justify-center", isCollapsed ? "w-8 h-8" : "w-6 h-6")}>
488 |                             <Github className="h-4 w-4" />
489 |                         </div>
490 |                         {!isCollapsed && <span>Powered by Scira Chat</span>}
491 |                     </Link>
492 |                 </SidebarFooter>
493 |             </Sidebar>
494 | 
495 |             <MCPServerManager
496 |                 servers={mcpServers}
497 |                 onServersChange={setMcpServers}
498 |                 selectedServers={selectedMcpServers}
499 |                 onSelectedServersChange={setSelectedMcpServers}
500 |                 open={mcpSettingsOpen}
501 |                 onOpenChange={setMcpSettingsOpen}
502 |             />
503 |         </>
504 |     );
505 | }
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
117 |     } as Message));
118 |   }, [chatData]);
119 |   
120 |   const { messages, input, handleInputChange, handleSubmit, status, stop } =
121 |     useChat({
122 |       id: chatId || generatedChatId,
123 |       initialMessages,
124 |       maxSteps: 20,
125 |       body: {
126 |         selectedModel,
127 |         mcpServers: mcpServersForApi,
128 |         chatId: chatId || generatedChatId,
129 |         webSearch: {
130 |           enabled: webSearchEnabled,
131 |           contextSize: webSearchContextSize,
132 |         }
133 |       },
134 |       experimental_throttle: 500,
135 |       onFinish: (message) => {
136 |         queryClient.invalidateQueries({ queryKey: ['chats'] });
137 |         queryClient.invalidateQueries({ queryKey: ['chat', chatId || generatedChatId] });
138 |         if (!chatId && generatedChatId) {
139 |           if (window.location.pathname !== `/chat/${generatedChatId}`) {
140 |              router.push(`/chat/${generatedChatId}`, { scroll: false }); 
141 |           }
142 |         }
143 |       },
144 |       onError: (error) => {
145 |         let errorMessage = "An error occurred, please try again later."; // Default message
146 |         try {
147 |           // Attempt to parse the error message as JSON, assuming the API error response body might be stringified here
148 |           const parsedError = JSON.parse(error.message);
149 |           // If parsing is successful and a specific message exists in the parsed object, use it
150 |           if (parsedError && typeof parsedError.message === 'string' && parsedError.message.length > 0) {
151 |             errorMessage = parsedError.message;
152 |           } else if (error.message.length > 0) {
153 |             // Fallback to the original error message if parsing fails or doesn't yield a message field
154 |             errorMessage = error.message;
155 |           }
156 |         } catch (e) {
157 |           // If parsing fails, check if the original error message is non-empty
158 |           if (error.message && error.message.length > 0) {
159 |             errorMessage = error.message;
160 |           }
161 |         }
162 |         toast.error(
163 |           errorMessage,
164 |           { position: "top-center", richColors: true },
165 |         );
166 |       },
167 |     });
168 |     
169 |   const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
170 |     e.preventDefault();
171 |     
172 |     handleSubmit(e);
173 |   }, [handleSubmit]);
174 | 
175 |   const isLoading = status === "streaming" || status === "submitted" || isLoadingChat;
176 | 
177 |   const isOpenRouterModel = selectedModel.startsWith("openrouter/");
178 | 
179 |   return (
180 |     <div className="h-dvh flex flex-col justify-between w-full max-w-3xl mx-auto px-4 sm:px-6 md:py-4">
181 |       {/* Main content area: Either ProjectOverview or Messages */}
182 |       <div className="flex-1 overflow-y-auto min-h-0 pb-2">
183 |         {messages.length === 0 && !isLoadingChat ? (
184 |           <div className="max-w-xl mx-auto w-full pt-4 sm:pt-8">
185 |             <ProjectOverview />
186 |           </div>
187 |         ) : (
188 |           <Messages messages={messages} isLoading={isLoading} status={status} />
189 |         )}
190 |       </div>
191 | 
192 |       {/* Input area: Always rendered at the bottom */}
193 |       <div className="mt-2 w-full mx-auto mb-4 sm:mb-auto shrink-0">
194 |         {/* Conditionally render ProjectOverview above input only when no messages and not loading */}
195 |         {messages.length === 0 && !isLoadingChat && (
196 |           <div className="max-w-xl mx-auto w-full mb-4 sm:hidden"> {/* Hidden on sm+, shown on mobile */}
197 |             {/* Maybe a condensed overview or nothing here if ProjectOverview is too large */}
198 |           </div>
199 |         )}
200 |         <form onSubmit={handleFormSubmit} className="mt-2">
201 |           <Textarea
202 |             selectedModel={selectedModel}
203 |             setSelectedModel={setSelectedModel}
204 |             handleInputChange={handleInputChange}
205 |             input={input}
206 |             isLoading={isLoading}
207 |             status={status}
208 |             stop={stop}
209 |           />
210 |         </form>
211 |       </div>
212 |     </div>
213 |   );
214 | }
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
20 |         className
21 |       )}
22 |       onClick={() => copy(text)}
23 |       title="Copy to clipboard"
24 |     >
25 |       {copied ? (
26 |         <>
27 |           <CheckIcon className="h-4 w-4" />
28 |           <span className="text-xs">Copied!</span>
29 |         </>
30 |       ) : (
31 |         <>
32 |           <CopyIcon className="h-4 w-4" />
33 |           <span className="text-xs">Copy</span>
34 |         </>
35 |       )}
36 |     </Button>
37 |   );
38 | } 
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

components/markdown.tsx
```
1 | import Link from "next/link";
2 | import React, { memo } from "react";
3 | import ReactMarkdown, { type Components } from "react-markdown";
4 | import remarkGfm from "remark-gfm";
5 | import { cn } from "@/lib/utils";
6 | 
7 | const components: Partial<Components> = {
8 |   pre: ({ children, ...props }) => (
9 |     <pre className="overflow-x-auto rounded-lg bg-zinc-100 dark:bg-zinc-800/50 black:bg-zinc-800/50 p-2.5 my-1.5 text-sm" {...props}>
10 |       {children}
11 |     </pre>
12 |   ),
13 |   code: ({ children, className, ...props }: React.HTMLProps<HTMLElement> & { className?: string }) => {
14 |     const match = /language-(\w+)/.exec(className || '');
15 |     const isInline = !match && !className;
16 | 
17 |     if (isInline) {
18 |       return (
19 |         <code
20 |           className="px-1 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/50 black:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 black:text-zinc-300 text-[0.9em] font-mono"
21 |           {...props}
22 |         >
23 |           {children}
24 |         </code>
25 |       );
26 |     }
27 |     return (
28 |       <code className={cn("block font-mono text-sm", className)} {...props}>
29 |         {children}
30 |       </code>
31 |     );
32 |   },
33 |   ol: ({ node, children, ...props }) => (
34 |     <ol className="list-decimal list-outside ml-4 space-y-0.5 my-1.5" {...props}>
35 |       {children}
36 |     </ol>
37 |   ),
38 |   ul: ({ node, children, ...props }) => (
39 |     <ul className="list-disc list-outside ml-4 space-y-0.5 my-1.5" {...props}>
40 |       {children}
41 |     </ul>
42 |   ),
43 |   li: ({ node, children, ...props }) => (
44 |     <li className="leading-normal" {...props}>
45 |       {children}
46 |     </li>
47 |   ),
48 |   p: ({ node, children, ...props }) => (
49 |     <p className="leading-relaxed my-1" {...props}>
50 |       {children}
51 |     </p>
52 |   ),
53 |   strong: ({ node, children, ...props }) => (
54 |     <strong className="font-semibold" {...props}>
55 |       {children}
56 |     </strong>
57 |   ),
58 |   em: ({ node, children, ...props }) => (
59 |     <em className="italic" {...props}>
60 |       {children}
61 |     </em>
62 |   ),
63 |   blockquote: ({ node, children, ...props }) => (
64 |     <blockquote
65 |       className="border-l-2 border-zinc-200 dark:border-zinc-700 black:border-zinc-700 pl-3 my-1.5 italic text-zinc-600 dark:text-zinc-400 black:text-zinc-400"
66 |       {...props}
67 |     >
68 |       {children}
69 |     </blockquote>
70 |   ),
71 |   a: ({ node, href, children, ...props }) => {
72 |     const isInternal = href && (href.startsWith("/") || href.startsWith("#"));
73 |     if (isInternal) {
74 |       return (
75 |         <Link href={href} {...props}>
76 |           {children}
77 |         </Link>
78 |       );
79 |     }
80 |     return (
81 |       <a
82 |         href={href}
83 |         target="_blank"
84 |         rel="noopener noreferrer"
85 |         {...props}
86 |         className="text-blue-500 hover:underline hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 black:text-blue-400 black:hover:text-blue-300 transition-colors"
87 |       >
88 |         {children}
89 |       </a>
90 |     );
91 |   },
92 |   h1: ({ node, children, ...props }) => (
93 |     <h1 className="text-2xl font-semibold mt-3 mb-1.5 text-zinc-800 dark:text-zinc-200 black:text-zinc-200" {...props}>
94 |       {children}
95 |     </h1>
96 |   ),
97 |   h2: ({ node, children, ...props }) => (
98 |     <h2 className="text-xl font-semibold mt-2.5 mb-1.5 text-zinc-800 dark:text-zinc-200 black:text-zinc-200" {...props}>
99 |       {children}
100 |     </h2>
101 |   ),
102 |   h3: ({ node, children, ...props }) => (
103 |     <h3 className="text-lg font-semibold mt-2 mb-1 text-zinc-800 dark:text-zinc-200 black:text-zinc-200" {...props}>
104 |       {children}
105 |     </h3>
106 |   ),
107 |   h4: ({ node, children, ...props }) => (
108 |     <h4 className="text-base font-semibold mt-2 mb-1 text-zinc-800 dark:text-zinc-200 black:text-zinc-200" {...props}>
109 |       {children}
110 |     </h4>
111 |   ),
112 |   h5: ({ node, children, ...props }) => (
113 |     <h5 className="text-sm font-semibold mt-2 mb-1 text-zinc-800 dark:text-zinc-200 black:text-zinc-200" {...props}>
114 |       {children}
115 |     </h5>
116 |   ),
117 |   h6: ({ node, children, ...props }) => (
118 |     <h6 className="text-xs font-semibold mt-2 mb-0.5 text-zinc-800 dark:text-zinc-200 black:text-zinc-200" {...props}>
119 |       {children}
120 |     </h6>
121 |   ),
122 |   table: ({ node, children, ...props }) => (
123 |     <div className="my-1.5 overflow-x-auto">
124 |       <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700 black:divide-zinc-700" {...props}>
125 |         {children}
126 |       </table>
127 |     </div>
128 |   ),
129 |   thead: ({ node, children, ...props }) => (
130 |     <thead className="bg-zinc-50 dark:bg-zinc-800/50 black:bg-zinc-800/50" {...props}>
131 |       {children}
132 |     </thead>
133 |   ),
134 |   tbody: ({ node, children, ...props }) => (
135 |     <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700 black:divide-zinc-700 bg-white dark:bg-transparent black:bg-transparent" {...props}>
136 |       {children}
137 |     </tbody>
138 |   ),
139 |   tr: ({ node, children, ...props }) => (
140 |     <tr className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30 black:hover:bg-zinc-800/30" {...props}>
141 |       {children}
142 |     </tr>
143 |   ),
144 |   th: ({ node, children, ...props }) => (
145 |     <th
146 |       className="px-3 py-1.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 black:text-zinc-400 uppercase tracking-wider"
147 |       {...props}
148 |     >
149 |       {children}
150 |     </th>
151 |   ),
152 |   td: ({ node, children, ...props }) => (
153 |     <td className="px-3 py-1.5 text-sm" {...props}>
154 |       {children}
155 |     </td>
156 |   ),
157 |   hr: ({ node, ...props }) => (
158 |     <hr className="my-1.5 border-zinc-200 dark:border-zinc-700 black:border-zinc-700" {...props} />
159 |   ),
160 | };
161 | 
162 | const remarkPlugins = [remarkGfm];
163 | 
164 | const NonMemoizedMarkdown = ({ children }: { children: string }) => {
165 |   return (
166 |     <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
167 |       {children}
168 |     </ReactMarkdown>
169 |   );
170 | };
171 | 
172 | export const Markdown = memo(
173 |   NonMemoizedMarkdown,
174 |   (prevProps, nextProps) => prevProps.children === nextProps.children,
175 | );
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
41 |     url: '',
42 |     type: 'sse',
43 |     command: 'node',
44 |     args: [],
45 |     env: [],
46 |     headers: []
47 | };
48 | 
49 | interface MCPServerManagerProps {
50 |     servers: MCPServer[];
51 |     onServersChange: (servers: MCPServer[]) => void;
52 |     selectedServers: string[];
53 |     onSelectedServersChange: (serverIds: string[]) => void;
54 |     open: boolean;
55 |     onOpenChange: (open: boolean) => void;
56 | }
57 | 
58 | // Check if a key name might contain sensitive information
59 | const isSensitiveKey = (key: string): boolean => {
60 |     const sensitivePatterns = [
61 |         /key/i, 
62 |         /token/i, 
63 |         /secret/i, 
64 |         /password/i, 
65 |         /pass/i,
66 |         /auth/i,
67 |         /credential/i
68 |     ];
69 |     return sensitivePatterns.some(pattern => pattern.test(key));
70 | };
71 | 
72 | // Mask a sensitive value
73 | const maskValue = (value: string): string => {
74 |     if (!value) return '';
75 |     if (value.length < 8) return '••••••';
76 |     return value.substring(0, 3) + '•'.repeat(Math.min(10, value.length - 4)) + value.substring(value.length - 1);
77 | };
78 | 
79 | export const MCPServerManager = ({
80 |     servers,
81 |     onServersChange,
82 |     selectedServers,
83 |     onSelectedServersChange,
84 |     open,
85 |     onOpenChange
86 | }: MCPServerManagerProps) => {
87 |     const [newServer, setNewServer] = useState<Omit<MCPServer, 'id'>>(INITIAL_NEW_SERVER);
88 |     const [view, setView] = useState<'list' | 'add'>('list');
89 |     const [newEnvVar, setNewEnvVar] = useState<KeyValuePair>({ key: '', value: '' });
90 |     const [newHeader, setNewHeader] = useState<KeyValuePair>({ key: '', value: '' });
91 |     const [editingServerId, setEditingServerId] = useState<string | null>(null);
92 |     const [showSensitiveEnvValues, setShowSensitiveEnvValues] = useState<Record<number, boolean>>({});
93 |     const [showSensitiveHeaderValues, setShowSensitiveHeaderValues] = useState<Record<number, boolean>>({});
94 |     const [editingEnvIndex, setEditingEnvIndex] = useState<number | null>(null);
95 |     const [editingHeaderIndex, setEditingHeaderIndex] = useState<number | null>(null);
96 |     const [editedEnvValue, setEditedEnvValue] = useState<string>('');
97 |     const [editedHeaderValue, setEditedHeaderValue] = useState<string>('');
98 | 
99 |     const resetAndClose = () => {
100 |         setView('list');
101 |         setNewServer(INITIAL_NEW_SERVER);
102 |         setNewEnvVar({ key: '', value: '' });
103 |         setNewHeader({ key: '', value: '' });
104 |         setShowSensitiveEnvValues({});
105 |         setShowSensitiveHeaderValues({});
106 |         setEditingEnvIndex(null);
107 |         setEditingHeaderIndex(null);
108 |         onOpenChange(false);
109 |     };
110 | 
111 |     const addServer = () => {
112 |         if (!newServer.name) {
113 |             toast.error("Server name is required");
114 |             return;
115 |         }
116 | 
117 |         if (newServer.type === 'sse' && !newServer.url) {
118 |             toast.error("Server URL is required for SSE transport");
119 |             return;
120 |         }
121 | 
122 |         if (newServer.type === 'stdio' && (!newServer.command || !newServer.args?.length)) {
123 |             toast.error("Command and at least one argument are required for stdio transport");
124 |             return;
125 |         }
126 | 
127 |         const id = crypto.randomUUID();
128 |         const updatedServers = [...servers, { ...newServer, id }];
129 |         onServersChange(updatedServers);
130 | 
131 |         toast.success(`Added MCP server: ${newServer.name}`);
132 |         setView('list');
133 |         setNewServer(INITIAL_NEW_SERVER);
134 |         setNewEnvVar({ key: '', value: '' });
135 |         setNewHeader({ key: '', value: '' });
136 |         setShowSensitiveEnvValues({});
137 |         setShowSensitiveHeaderValues({});
138 |     };
139 | 
140 |     const removeServer = (id: string, e: React.MouseEvent) => {
141 |         e.stopPropagation();
142 |         const updatedServers = servers.filter(server => server.id !== id);
143 |         onServersChange(updatedServers);
144 | 
145 |         // If the removed server was selected, remove it from selected servers
146 |         if (selectedServers.includes(id)) {
147 |             onSelectedServersChange(selectedServers.filter(serverId => serverId !== id));
148 |         }
149 | 
150 |         toast.success("Server removed");
151 |     };
152 | 
153 |     const toggleServer = (id: string) => {
154 |         if (selectedServers.includes(id)) {
155 |             // Remove from selected servers
156 |             onSelectedServersChange(selectedServers.filter(serverId => serverId !== id));
157 |             const server = servers.find(s => s.id === id);
158 |             if (server) {
159 |                 toast.success(`Disabled MCP server: ${server.name}`);
160 |             }
161 |         } else {
162 |             // Add to selected servers
163 |             onSelectedServersChange([...selectedServers, id]);
164 |             const server = servers.find(s => s.id === id);
165 |             if (server) {
166 |                 toast.success(`Enabled MCP server: ${server.name}`);
167 |             }
168 |         }
169 |     };
170 | 
171 |     const clearAllServers = () => {
172 |         if (selectedServers.length > 0) {
173 |             onSelectedServersChange([]);
174 |             toast.success("All MCP servers disabled");
175 |             resetAndClose();
176 |         }
177 |     };
178 | 
179 |     const handleArgsChange = (value: string) => {
180 |         try {
181 |             // Try to parse as JSON if it starts with [ (array)
182 |             const argsArray = value.trim().startsWith('[')
183 |                 ? JSON.parse(value)
184 |                 : value.split(' ').filter(Boolean);
185 | 
186 |             setNewServer({ ...newServer, args: argsArray });
187 |         } catch (error) {
188 |             // If parsing fails, just split by spaces
189 |             setNewServer({ ...newServer, args: value.split(' ').filter(Boolean) });
190 |         }
191 |     };
192 | 
193 |     const addEnvVar = () => {
194 |         if (!newEnvVar.key) return;
195 | 
196 |         setNewServer({
197 |             ...newServer,
198 |             env: [...(newServer.env || []), { ...newEnvVar }]
199 |         });
200 | 
201 |         setNewEnvVar({ key: '', value: '' });
202 |     };
203 | 
204 |     const removeEnvVar = (index: number) => {
205 |         const updatedEnv = [...(newServer.env || [])];
206 |         updatedEnv.splice(index, 1);
207 |         setNewServer({ ...newServer, env: updatedEnv });
208 |         
209 |         // Clean up visibility state for this index
210 |         const updatedVisibility = { ...showSensitiveEnvValues };
211 |         delete updatedVisibility[index];
212 |         setShowSensitiveEnvValues(updatedVisibility);
213 |         
214 |         // If currently editing this value, cancel editing
215 |         if (editingEnvIndex === index) {
216 |             setEditingEnvIndex(null);
217 |         }
218 |     };
219 | 
220 |     const startEditEnvValue = (index: number, value: string) => {
221 |         setEditingEnvIndex(index);
222 |         setEditedEnvValue(value);
223 |     };
224 | 
225 |     const saveEditedEnvValue = () => {
226 |         if (editingEnvIndex !== null) {
227 |             const updatedEnv = [...(newServer.env || [])];
228 |             updatedEnv[editingEnvIndex] = {
229 |                 ...updatedEnv[editingEnvIndex],
230 |                 value: editedEnvValue
231 |             };
232 |             setNewServer({ ...newServer, env: updatedEnv });
233 |             setEditingEnvIndex(null);
234 |         }
235 |     };
236 | 
237 |     const addHeader = () => {
238 |         if (!newHeader.key) return;
239 | 
240 |         setNewServer({
241 |             ...newServer,
242 |             headers: [...(newServer.headers || []), { ...newHeader }]
243 |         });
244 | 
245 |         setNewHeader({ key: '', value: '' });
246 |     };
247 | 
248 |     const removeHeader = (index: number) => {
249 |         const updatedHeaders = [...(newServer.headers || [])];
250 |         updatedHeaders.splice(index, 1);
251 |         setNewServer({ ...newServer, headers: updatedHeaders });
252 |         
253 |         // Clean up visibility state for this index
254 |         const updatedVisibility = { ...showSensitiveHeaderValues };
255 |         delete updatedVisibility[index];
256 |         setShowSensitiveHeaderValues(updatedVisibility);
257 |         
258 |         // If currently editing this value, cancel editing
259 |         if (editingHeaderIndex === index) {
260 |             setEditingHeaderIndex(null);
261 |         }
262 |     };
263 | 
264 |     const startEditHeaderValue = (index: number, value: string) => {
265 |         setEditingHeaderIndex(index);
266 |         setEditedHeaderValue(value);
267 |     };
268 | 
269 |     const saveEditedHeaderValue = () => {
270 |         if (editingHeaderIndex !== null) {
271 |             const updatedHeaders = [...(newServer.headers || [])];
272 |             updatedHeaders[editingHeaderIndex] = {
273 |                 ...updatedHeaders[editingHeaderIndex],
274 |                 value: editedHeaderValue
275 |             };
276 |             setNewServer({ ...newServer, headers: updatedHeaders });
277 |             setEditingHeaderIndex(null);
278 |         }
279 |     };
280 | 
281 |     const toggleSensitiveEnvValue = (index: number) => {
282 |         setShowSensitiveEnvValues(prev => ({
283 |             ...prev,
284 |             [index]: !prev[index]
285 |         }));
286 |     };
287 | 
288 |     const toggleSensitiveHeaderValue = (index: number) => {
289 |         setShowSensitiveHeaderValues(prev => ({
290 |             ...prev,
291 |             [index]: !prev[index]
292 |         }));
293 |     };
294 | 
295 |     const hasAdvancedConfig = (server: MCPServer) => {
296 |         return (server.env && server.env.length > 0) ||
297 |             (server.headers && server.headers.length > 0);
298 |     };
299 | 
300 |     // Editing support
301 |     const startEditing = (server: MCPServer) => {
302 |         setEditingServerId(server.id);
303 |         setNewServer({
304 |             name: server.name,
305 |             url: server.url,
306 |             type: server.type,
307 |             command: server.command,
308 |             args: server.args,
309 |             env: server.env,
310 |             headers: server.headers
311 |         });
312 |         setView('add');
313 |         // Reset sensitive value visibility states
314 |         setShowSensitiveEnvValues({});
315 |         setShowSensitiveHeaderValues({});
316 |         setEditingEnvIndex(null);
317 |         setEditingHeaderIndex(null);
318 |     };
319 | 
320 |     const handleFormCancel = () => {
321 |         if (view === 'add') {
322 |             setView('list');
323 |             setEditingServerId(null);
324 |             setNewServer(INITIAL_NEW_SERVER);
325 |             setShowSensitiveEnvValues({});
326 |             setShowSensitiveHeaderValues({});
327 |             setEditingEnvIndex(null);
328 |             setEditingHeaderIndex(null);
329 |         } else {
330 |             resetAndClose();
331 |         }
332 |     };
333 | 
334 |     const updateServer = () => {
335 |         if (!newServer.name) {
336 |             toast.error("Server name is required");
337 |             return;
338 |         }
339 |         if (newServer.type === 'sse' && !newServer.url) {
340 |             toast.error("Server URL is required for SSE transport");
341 |             return;
342 |         }
343 |         if (newServer.type === 'stdio' && (!newServer.command || !newServer.args?.length)) {
344 |             toast.error("Command and at least one argument are required for stdio transport");
345 |             return;
346 |         }
347 |         const updated = servers.map(s =>
348 |             s.id === editingServerId ? { ...newServer, id: editingServerId! } : s
349 |         );
350 |         onServersChange(updated);
351 |         toast.success(`Updated MCP server: ${newServer.name}`);
352 |         setView('list');
353 |         setEditingServerId(null);
354 |         setNewServer(INITIAL_NEW_SERVER);
355 |         setShowSensitiveEnvValues({});
356 |         setShowSensitiveHeaderValues({});
357 |     };
358 | 
359 |     return (
360 |         <Dialog open={open} onOpenChange={onOpenChange}>
361 |             <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-hidden flex flex-col">
362 |                 <DialogHeader>
363 |                     <DialogTitle className="flex items-center gap-2">
364 |                         <ServerIcon className="h-5 w-5 text-primary" />
365 |                         MCP Server Configuration
366 |                     </DialogTitle>
367 |                     <DialogDescription>
368 |                         Connect to Model Context Protocol servers to access additional AI tools.
369 |                         {selectedServers.length > 0 && (
370 |                             <span className="block mt-1 text-xs font-medium text-primary">
371 |                                 {selectedServers.length} server{selectedServers.length !== 1 ? 's' : ''} currently active
372 |                             </span>
373 |                         )}
374 |                     </DialogDescription>
375 |                 </DialogHeader>
376 | 
377 |                 {view === 'list' ? (
378 |                     <div className="flex-1 overflow-hidden flex flex-col">
379 |                         {servers.length > 0 ? (
380 |                             <div className="flex-1 overflow-hidden flex flex-col">
381 |                                 <div className="flex-1 overflow-hidden flex flex-col">
382 |                                     <div className="flex items-center justify-between mb-3">
383 |                                         <h3 className="text-sm font-medium">Available Servers</h3>
384 |                                         <span className="text-xs text-muted-foreground">
385 |                                             Select multiple servers to combine their tools
386 |                                         </span>
387 |                                     </div>
388 |                                     <div className="overflow-y-auto pr-1 flex-1 gap-2.5 flex flex-col pb-16">
389 |                                         {servers
390 |                                             .sort((a, b) => {
391 |                                                 const aActive = selectedServers.includes(a.id);
392 |                                                 const bActive = selectedServers.includes(b.id);
393 |                                                 if (aActive && !bActive) return -1;
394 |                                                 if (!aActive && bActive) return 1;
395 |                                                 return 0;
396 |                                             })
397 |                                             .map((server) => {
398 |                                             const isActive = selectedServers.includes(server.id);
399 |                                             return (
400 |                                                 <div
401 |                                                     key={server.id}
402 |                                                     className={`
403 |                             relative flex flex-col p-3.5 rounded-xl transition-colors
404 |                             border ${isActive
405 |                                                             ? 'border-primary bg-primary/10'
406 |                                                             : 'border-border hover:border-primary/30 hover:bg-primary/5'}
407 |                           `}
408 |                                                 >
409 |                                                     {/* Server Header with Type Badge and Delete Button */}
410 |                                                     <div className="flex items-center justify-between mb-2">
411 |                                                         <div className="flex items-center gap-2">
412 |                                                             {server.type === 'sse' ? (
413 |                                                                 <Globe className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'} flex-shrink-0`} />
414 |                                                             ) : (
415 |                                                                 <Terminal className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'} flex-shrink-0`} />
416 |                                                             )}
417 |                                                             <h4 className="text-sm font-medium truncate max-w-[220px]">{server.name}</h4>
418 |                                                             {hasAdvancedConfig(server) && (
419 |                                                                 <span className="flex-shrink-0">
420 |                                                                     <Cog className="h-3 w-3 text-muted-foreground" />
421 |                                                                 </span>
422 |                                                             )}
423 |                                                         </div>
424 |                                                         <div className="flex items-center gap-2">
425 |                                                             <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
426 |                                                                 {server.type.toUpperCase()}
427 |                                                             </span>
428 |                                                             <button
429 |                                                                 onClick={(e) => removeServer(server.id, e)}
430 |                                                                 className="p-1 rounded-full hover:bg-muted/70"
431 |                                                                 aria-label="Remove server"
432 |                                                             >
433 |                                                                 <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
434 |                                                             </button>
435 |                                                             <button
436 |                                                                 onClick={() => startEditing(server)}
437 |                                                                 className="p-1 rounded-full hover:bg-muted/50"
438 |                                                                 aria-label="Edit server"
439 |                                                             >
440 |                                                                 <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
441 |                                                             </button>
442 |                                                         </div>
443 |                                                     </div>
444 | 
445 |                                                     {/* Server Details */}
446 |                                                     <p className="text-xs text-muted-foreground mb-2.5 truncate">
447 |                                                         {server.type === 'sse'
448 |                                                             ? server.url
449 |                                                             : `${server.command} ${server.args?.join(' ')}`
450 |                                                         }
451 |                                                     </p>
452 | 
453 |                                                     {/* Action Button */}
454 |                                                     <Button
455 |                                                         size="sm"
456 |                                                         className="w-full gap-1.5 hover:text-black hover:dark:text-white rounded-lg"
457 |                                                         variant={isActive ? "default" : "outline"}
458 |                                                         onClick={() => toggleServer(server.id)}
459 |                                                     >
460 |                                                         {isActive && <CheckCircle className="h-3.5 w-3.5" />}
461 |                                                         {isActive ? "Active" : "Enable Server"}
462 |                                                     </Button>
463 |                                                 </div>
464 |                                             );
465 |                                         })}
466 |                                     </div>
467 |                                 </div>
468 |                             </div>
469 |                         ) : (
470 |                             <div className="flex-1 py-8 pb-16 flex flex-col items-center justify-center space-y-4">
471 |                                 <div className="rounded-full p-3 bg-primary/10">
472 |                                     <ServerIcon className="h-7 w-7 text-primary" />
473 |                                 </div>
474 |                                 <div className="text-center space-y-1">
475 |                                     <h3 className="text-base font-medium">No MCP Servers Added</h3>
476 |                                     <p className="text-sm text-muted-foreground max-w-[300px]">
477 |                                         Add your first MCP server to access additional AI tools
478 |                                     </p>
479 |                                 </div>
480 |                                 <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-4">
481 |                                     <a
482 |                                         href="https://modelcontextprotocol.io"
483 |                                         target="_blank"
484 |                                         rel="noopener noreferrer"
485 |                                         className="flex items-center gap-1 hover:text-primary transition-colors"
486 |                                     >
487 |                                         Learn about MCP
488 |                                         <ExternalLink className="h-3 w-3" />
489 |                                     </a>
490 |                                 </div>
491 |                             </div>
492 |                         )}
493 |                     </div>
494 |                 ) : (
495 |                     <div className="space-y-4 overflow-y-auto px-1 py-0.5 mb-14 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
496 |                         <h3 className="text-sm font-medium">{editingServerId ? "Edit MCP Server" : "Add New MCP Server"}</h3>
497 |                         <div className="space-y-4">
498 |                             <div className="grid gap-1.5">
499 |                                 <Label htmlFor="name">
500 |                                     Server Name
501 |                                 </Label>
502 |                                 <Input
503 |                                     id="name"
504 |                                     value={newServer.name}
505 |                                     onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
506 |                                     placeholder="My MCP Server"
507 |                                     className="relative z-0"
508 |                                 />
509 |                             </div>
510 | 
511 |                             <div className="grid gap-1.5">
512 |                                 <Label htmlFor="transport-type">
513 |                                     Transport Type
514 |                                 </Label>
515 |                                 <div className="space-y-2">
516 |                                     <p className="text-xs text-muted-foreground">Choose how to connect to your MCP server:</p>
517 |                                     <div className="grid gap-2 grid-cols-2">
518 |                                         <button
519 |                                             type="button"
520 |                                             onClick={() => setNewServer({ ...newServer, type: 'sse' })}
521 |                                             className={`flex items-center gap-2 p-3 rounded-md text-left border transition-all ${
522 |                                                 newServer.type === 'sse' 
523 |                                                     ? 'border-primary bg-primary/10 ring-1 ring-primary' 
524 |                                                     : 'border-border hover:border-border/80 hover:bg-muted/50'
525 |                                             }`}
526 |                                         >
527 |                                             <Globe className={`h-5 w-5 shrink-0 ${newServer.type === 'sse' ? 'text-primary' : ''}`} />
528 |                                             <div>
529 |                                                 <p className="font-medium">SSE</p>
530 |                                                 <p className="text-xs text-muted-foreground">Server-Sent Events</p>
531 |                                             </div>
532 |                                         </button>
533 |                                         
534 |                                         <button
535 |                                             type="button"
536 |                                             onClick={() => setNewServer({ ...newServer, type: 'stdio' })}
537 |                                             className={`flex items-center gap-2 p-3 rounded-md text-left border transition-all ${
538 |                                                 newServer.type === 'stdio' 
539 |                                                     ? 'border-primary bg-primary/10 ring-1 ring-primary' 
540 |                                                     : 'border-border hover:border-border/80 hover:bg-muted/50'
541 |                                             }`}
542 |                                         >
543 |                                             <Terminal className={`h-5 w-5 shrink-0 ${newServer.type === 'stdio' ? 'text-primary' : ''}`} />
544 |                                             <div>
545 |                                                 <p className="font-medium">stdio</p>
546 |                                                 <p className="text-xs text-muted-foreground">Standard I/O</p>
547 |                                             </div>
548 |                                         </button>
549 |                                     </div>
550 |                                 </div>
551 |                             </div>
552 | 
553 |                             {newServer.type === 'sse' ? (
554 |                                 <div className="grid gap-1.5">
555 |                                     <Label htmlFor="url">
556 |                                         Server URL
557 |                                     </Label>
558 |                                     <Input
559 |                                         id="url"
560 |                                         value={newServer.url}
561 |                                         onChange={(e) => setNewServer({ ...newServer, url: e.target.value })}
562 |                                         placeholder="https://mcp.example.com/token/sse"
563 |                                         className="relative z-0"
564 |                                     />
565 |                                     <p className="text-xs text-muted-foreground">
566 |                                         Full URL to the SSE endpoint of the MCP server
567 |                                     </p>
568 |                                 </div>
569 |                             ) : (
570 |                                 <>
571 |                                     <div className="grid gap-1.5">
572 |                                         <Label htmlFor="command">
573 |                                             Command
574 |                                         </Label>
575 |                                         <Input
576 |                                             id="command"
577 |                                             value={newServer.command}
578 |                                             onChange={(e) => setNewServer({ ...newServer, command: e.target.value })}
579 |                                             placeholder="node"
580 |                                             className="relative z-0"
581 |                                         />
582 |                                         <p className="text-xs text-muted-foreground">
583 |                                             Executable to run (e.g., node, python)
584 |                                         </p>
585 |                                     </div>
586 |                                     <div className="grid gap-1.5">
587 |                                         <Label htmlFor="args">
588 |                                             Arguments
589 |                                         </Label>
590 |                                         <Input
591 |                                             id="args"
592 |                                             value={newServer.args?.join(' ') || ''}
593 |                                             onChange={(e) => handleArgsChange(e.target.value)}
594 |                                             placeholder="src/mcp-server.js --port 3001"
595 |                                             className="relative z-0"
596 |                                         />
597 |                                         <p className="text-xs text-muted-foreground">
598 |                                             Space-separated arguments or JSON array
599 |                                         </p>
600 |                                     </div>
601 |                                 </>
602 |                             )}
603 | 
604 |                             {/* Advanced Configuration */}
605 |                             <Accordion type="single" collapsible className="w-full">
606 |                                 <AccordionItem value="env-vars">
607 |                                     <AccordionTrigger className="text-sm py-2">
608 |                                         Environment Variables
609 |                                     </AccordionTrigger>
610 |                                     <AccordionContent>
611 |                                         <div className="space-y-3">
612 |                                             <div className="flex items-end gap-2">
613 |                                                 <div className="flex-1">
614 |                                                     <Label htmlFor="env-key" className="text-xs mb-1 block">
615 |                                                         Key
616 |                                                     </Label>
617 |                                                     <Input
618 |                                                         id="env-key"
619 |                                                         value={newEnvVar.key}
620 |                                                         onChange={(e) => setNewEnvVar({ ...newEnvVar, key: e.target.value })}
621 |                                                         placeholder="API_KEY"
622 |                                                         className="h-8 relative z-0"
623 |                                                     />
624 |                                                 </div>
625 |                                                 <div className="flex-1">
626 |                                                     <Label htmlFor="env-value" className="text-xs mb-1 block">
627 |                                                         Value
628 |                                                     </Label>
629 |                                                     <Input
630 |                                                         id="env-value"
631 |                                                         value={newEnvVar.value}
632 |                                                         onChange={(e) => setNewEnvVar({ ...newEnvVar, value: e.target.value })}
633 |                                                         placeholder="your-secret-key"
634 |                                                         className="h-8 relative z-0"
635 |                                                         type="text"
636 |                                                     />
637 |                                                 </div>
638 |                                                 <Button
639 |                                                     type="button"
640 |                                                     variant="outline"
641 |                                                     size="sm"
642 |                                                     onClick={addEnvVar}
643 |                                                     disabled={!newEnvVar.key}
644 |                                                     className="h-8 mt-1"
645 |                                                 >
646 |                                                     <Plus className="h-3.5 w-3.5" />
647 |                                                 </Button>
648 |                                             </div>
649 | 
650 |                                             {newServer.env && newServer.env.length > 0 ? (
651 |                                                 <div className="border rounded-md divide-y">
652 |                                                     {newServer.env.map((env, index) => (
653 |                                                         <div key={index} className="flex items-center justify-between p-2 text-sm">
654 |                                                             <div className="flex-1 flex items-center gap-1 truncate">
655 |                                                                 <span className="font-mono text-xs">{env.key}</span>
656 |                                                                 <span className="mx-2 text-muted-foreground">=</span>
657 |                                                                 
658 |                                                                 {editingEnvIndex === index ? (
659 |                                                                     <div className="flex gap-1 flex-1">
660 |                                                                         <Input
661 |                                                                             className="h-6 text-xs py-1 px-2"
662 |                                                                             value={editedEnvValue}
663 |                                                                             onChange={(e) => setEditedEnvValue(e.target.value)}
664 |                                                                             onKeyDown={(e) => e.key === 'Enter' && saveEditedEnvValue()}
665 |                                                                             autoFocus
666 |                                                                         />
667 |                                                                         <Button 
668 |                                                                             size="sm" 
669 |                                                                             className="h-6 px-2"
670 |                                                                             onClick={saveEditedEnvValue}
671 |                                                                         >
672 |                                                                             Save
673 |                                                                         </Button>
674 |                                                                     </div>
675 |                                                                 ) : (
676 |                                                                     <>
677 |                                                                         <span className="text-xs text-muted-foreground truncate">
678 |                                                                             {isSensitiveKey(env.key) && !showSensitiveEnvValues[index] 
679 |                                                                                 ? maskValue(env.value) 
680 |                                                                                 : env.value}
681 |                                                                         </span>
682 |                                                                         <span className="flex ml-1 gap-1">
683 |                                                                             {isSensitiveKey(env.key) && (
684 |                                                                                 <button
685 |                                                                                     onClick={() => toggleSensitiveEnvValue(index)}
686 |                                                                                     className="p-1 hover:bg-muted/50 rounded-full"
687 |                                                                                 >
688 |                                                                                     {showSensitiveEnvValues[index] ? (
689 |                                                                                         <EyeOff className="h-3 w-3 text-muted-foreground" />
690 |                                                                                     ) : (
691 |                                                                                         <Eye className="h-3 w-3 text-muted-foreground" />
692 |                                                                                     )}
693 |                                                                                 </button>
694 |                                                                             )}
695 |                                                                             <button
696 |                                                                                 onClick={() => startEditEnvValue(index, env.value)}
697 |                                                                                 className="p-1 hover:bg-muted/50 rounded-full"
698 |                                                                             >
699 |                                                                                 <Edit2 className="h-3 w-3 text-muted-foreground" />
700 |                                                                             </button>
701 |                                                                         </span>
702 |                                                                     </>
703 |                                                                 )}
704 |                                                             </div>
705 |                                                             <Button
706 |                                                                 type="button"
707 |                                                                 variant="ghost"
708 |                                                                 size="sm"
709 |                                                                 onClick={() => removeEnvVar(index)}
710 |                                                                 className="h-6 w-6 p-0 ml-2"
711 |                                                             >
712 |                                                                 <X className="h-3 w-3" />
713 |                                                             </Button>
714 |                                                         </div>
715 |                                                     ))}
716 |                                                 </div>
717 |                                             ) : (
718 |                                                 <p className="text-xs text-muted-foreground text-center py-2">
719 |                                                     No environment variables added
720 |                                                 </p>
721 |                                             )}
722 |                                             <p className="text-xs text-muted-foreground">
723 |                                                 Environment variables will be passed to the MCP server process.
724 |                                             </p>
725 |                                         </div>
726 |                                     </AccordionContent>
727 |                                 </AccordionItem>
728 | 
729 |                                 <AccordionItem value="headers">
730 |                                     <AccordionTrigger className="text-sm py-2">
731 |                                         {newServer.type === 'sse' ? 'HTTP Headers' : 'Additional Configuration'}
732 |                                     </AccordionTrigger>
733 |                                     <AccordionContent>
734 |                                         <div className="space-y-3">
735 |                                             <div className="flex items-end gap-2">
736 |                                                 <div className="flex-1">
737 |                                                     <Label htmlFor="header-key" className="text-xs mb-1 block">
738 |                                                         Key
739 |                                                     </Label>
740 |                                                     <Input
741 |                                                         id="header-key"
742 |                                                         value={newHeader.key}
743 |                                                         onChange={(e) => setNewHeader({ ...newHeader, key: e.target.value })}
744 |                                                         placeholder="Authorization"
745 |                                                         className="h-8 relative z-0"
746 |                                                     />
747 |                                                 </div>
748 |                                                 <div className="flex-1">
749 |                                                     <Label htmlFor="header-value" className="text-xs mb-1 block">
750 |                                                         Value
751 |                                                     </Label>
752 |                                                     <Input
753 |                                                         id="header-value"
754 |                                                         value={newHeader.value}
755 |                                                         onChange={(e) => setNewHeader({ ...newHeader, value: e.target.value })}
756 |                                                         placeholder="Bearer token123"
757 |                                                         className="h-8 relative z-0"
758 |                                                     />
759 |                                                 </div>
760 |                                                 <Button
761 |                                                     type="button"
762 |                                                     variant="outline"
763 |                                                     size="sm"
764 |                                                     onClick={addHeader}
765 |                                                     disabled={!newHeader.key}
766 |                                                     className="h-8 mt-1"
767 |                                                 >
768 |                                                     <Plus className="h-3.5 w-3.5" />
769 |                                                 </Button>
770 |                                             </div>
771 | 
772 |                                             {newServer.headers && newServer.headers.length > 0 ? (
773 |                                                 <div className="border rounded-md divide-y">
774 |                                                     {newServer.headers.map((header, index) => (
775 |                                                         <div key={index} className="flex items-center justify-between p-2 text-sm">
776 |                                                             <div className="flex-1 flex items-center gap-1 truncate">
777 |                                                                 <span className="font-mono text-xs">{header.key}</span>
778 |                                                                 <span className="mx-2 text-muted-foreground">:</span>
779 |                                                                 
780 |                                                                 {editingHeaderIndex === index ? (
781 |                                                                     <div className="flex gap-1 flex-1">
782 |                                                                         <Input
783 |                                                                             className="h-6 text-xs py-1 px-2"
784 |                                                                             value={editedHeaderValue}
785 |                                                                             onChange={(e) => setEditedHeaderValue(e.target.value)}
786 |                                                                             onKeyDown={(e) => e.key === 'Enter' && saveEditedHeaderValue()}
787 |                                                                             autoFocus
788 |                                                                         />
789 |                                                                         <Button 
790 |                                                                             size="sm" 
791 |                                                                             className="h-6 px-2"
792 |                                                                             onClick={saveEditedHeaderValue}
793 |                                                                         >
794 |                                                                             Save
795 |                                                                         </Button>
796 |                                                                     </div>
797 |                                                                 ) : (
798 |                                                                     <>
799 |                                                                         <span className="text-xs text-muted-foreground truncate">
800 |                                                                             {isSensitiveKey(header.key) && !showSensitiveHeaderValues[index] 
801 |                                                                                 ? maskValue(header.value) 
802 |                                                                                 : header.value}
803 |                                                                         </span>
804 |                                                                         <span className="flex ml-1 gap-1">
805 |                                                                             {isSensitiveKey(header.key) && (
806 |                                                                                 <button
807 |                                                                                     onClick={() => toggleSensitiveHeaderValue(index)}
808 |                                                                                     className="p-1 hover:bg-muted/50 rounded-full"
809 |                                                                                 >
810 |                                                                                     {showSensitiveHeaderValues[index] ? (
811 |                                                                                         <EyeOff className="h-3 w-3 text-muted-foreground" />
812 |                                                                                     ) : (
813 |                                                                                         <Eye className="h-3 w-3 text-muted-foreground" />
814 |                                                                                     )}
815 |                                                                                 </button>
816 |                                                                             )}
817 |                                                                             <button
818 |                                                                                 onClick={() => startEditHeaderValue(index, header.value)}
819 |                                                                                 className="p-1 hover:bg-muted/50 rounded-full"
820 |                                                                             >
821 |                                                                                 <Edit2 className="h-3 w-3 text-muted-foreground" />
822 |                                                                             </button>
823 |                                                                         </span>
824 |                                                                     </>
825 |                                                                 )}
826 |                                                             </div>
827 |                                                             <Button
828 |                                                                 type="button"
829 |                                                                 variant="ghost"
830 |                                                                 size="sm"
831 |                                                                 onClick={() => removeHeader(index)}
832 |                                                                 className="h-6 w-6 p-0 ml-2"
833 |                                                             >
834 |                                                                 <X className="h-3 w-3" />
835 |                                                             </Button>
836 |                                                         </div>
837 |                                                     ))}
838 |                                                 </div>
839 |                                             ) : (
840 |                                                 <p className="text-xs text-muted-foreground text-center py-2">
841 |                                                     No {newServer.type === 'sse' ? 'headers' : 'additional configuration'} added
842 |                                                 </p>
843 |                                             )}
844 |                                             <p className="text-xs text-muted-foreground">
845 |                                                 {newServer.type === 'sse'
846 |                                                     ? 'HTTP headers will be sent with requests to the SSE endpoint.'
847 |                                                     : 'Additional configuration parameters for the stdio transport.'}
848 |                                             </p>
849 |                                         </div>
850 |                                     </AccordionContent>
851 |                                 </AccordionItem>
852 |                             </Accordion>
853 |                         </div>
854 |                     </div>
855 |                 )}
856 | 
857 |                 {/* Persistent fixed footer with buttons */}
858 |                 <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex justify-between z-10">
859 |                     {view === 'list' ? (
860 |                         <>
861 |                             <Button
862 |                                 variant="outline"
863 |                                 onClick={clearAllServers}
864 |                                 size="sm"
865 |                                 className="gap-1.5 hover:text-black hover:dark:text-white"
866 |                                 disabled={selectedServers.length === 0}
867 |                             >
868 |                                 <X className="h-3.5 w-3.5" />
869 |                                 Disable All
870 |                             </Button>
871 |                             <Button
872 |                                 onClick={() => setView('add')}
873 |                                 size="sm"
874 |                                 className="gap-1.5"
875 |                             >
876 |                                 <PlusCircle className="h-3.5 w-3.5" />
877 |                                 Add Server
878 |                             </Button>
879 |                         </>
880 |                     ) : (
881 |                         <>
882 |                             <Button variant="outline" onClick={handleFormCancel}>
883 |                                 Cancel
884 |                             </Button>
885 |                             <Button
886 |                                 onClick={editingServerId ? updateServer : addServer}
887 |                                 disabled={
888 |                                     !newServer.name ||
889 |                                     (newServer.type === 'sse' && !newServer.url) ||
890 |                                     (newServer.type === 'stdio' && (!newServer.command || !newServer.args?.length))
891 |                                 }
892 |                             >
893 |                                 {editingServerId ? "Save Changes" : "Add Server"}
894 |                             </Button>
895 |                         </>
896 |                     )}
897 |                 </div>
898 |             </DialogContent>
899 |         </Dialog>
900 |     );
901 | }; 
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
16 | 
17 | interface ReasoningPart {
18 |   type: "reasoning";
19 |   reasoning: string;
20 |   details: Array<{ type: "text"; text: string }>;
21 | }
22 | 
23 | interface ReasoningMessagePartProps {
24 |   part: ReasoningUIPart;
25 |   isReasoning: boolean;
26 | }
27 | 
28 | export function ReasoningMessagePart({
29 |   part,
30 |   isReasoning,
31 | }: ReasoningMessagePartProps) {
32 |   const [isExpanded, setIsExpanded] = useState(false);
33 | 
34 |   const memoizedSetIsExpanded = useCallback((value: boolean) => {
35 |     setIsExpanded(value);
36 |   }, []);
37 | 
38 |   useEffect(() => {
39 |     memoizedSetIsExpanded(isReasoning);
40 |   }, [isReasoning, memoizedSetIsExpanded]);
41 | 
42 |   return (
43 |     <div className="flex flex-col mb-2 group">
44 |       {isReasoning ? (
45 |         <div className={cn(
46 |           "flex items-center gap-2.5 rounded-full py-1.5 px-3",
47 |           "bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300",
48 |           "border border-indigo-200/50 dark:border-indigo-700/20 w-fit"
49 |         )}>
50 |           <div className="animate-spin h-3.5 w-3.5">
51 |             <SpinnerIcon />
52 |           </div>
53 |           <div className="text-xs font-medium tracking-tight">Thinking...</div>
54 |         </div>
55 |       ) : (
56 |         <button 
57 |           onClick={() => setIsExpanded(!isExpanded)}
58 |           className={cn(
59 |             "flex items-center justify-between w-full",
60 |             "rounded-md py-2 px-3 mb-0.5",
61 |             "bg-muted/50 border border-border/60 hover:border-border/80",
62 |             "transition-all duration-150 cursor-pointer",
63 |             isExpanded ? "bg-muted border-primary/20" : ""
64 |           )}
65 |         >
66 |           <div className="flex items-center gap-2.5">
67 |             <div className={cn(
68 |               "flex items-center justify-center w-6 h-6 rounded-full",
69 |               "bg-amber-50 dark:bg-amber-900/20",
70 |               "text-amber-600 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-700/30",
71 |             )}>
72 |               <LightbulbIcon className="h-3.5 w-3.5" />
73 |             </div>
74 |             <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
75 |               Reasoning
76 |               <span className="text-xs text-muted-foreground font-normal">
77 |                 (click to {isExpanded ? "hide" : "view"})
78 |               </span>
79 |             </div>
80 |           </div>
81 |           <div className={cn(
82 |             "flex items-center justify-center",
83 |             "rounded-full p-0.5 w-5 h-5",
84 |             "text-muted-foreground hover:text-foreground",
85 |             "bg-background/80 border border-border/50",
86 |             "transition-colors",
87 |           )}>
88 |             {isExpanded ? (
89 |               <ChevronDownIcon className="h-3 w-3" />
90 |             ) : (
91 |               <ChevronUpIcon className="h-3 w-3" />
92 |             )}
93 |           </div>
94 |         </button>
95 |       )}
96 | 
97 |       <AnimatePresence initial={false}>
98 |         {isExpanded && (
99 |           <motion.div
100 |             key="reasoning"
101 |             className={cn(
102 |               "text-sm text-muted-foreground flex flex-col gap-2",
103 |               "pl-3.5 ml-0.5 mt-1",
104 |               "border-l border-amber-200/50 dark:border-amber-700/30"
105 |             )}
106 |             initial={{ height: 0, opacity: 0 }}
107 |             animate={{ height: "auto", opacity: 1 }}
108 |             exit={{ height: 0, opacity: 0 }}
109 |             transition={{ duration: 0.2, ease: "easeInOut" }}
110 |           >
111 |             <div className="text-xs text-muted-foreground/70 pl-1 font-medium">
112 |               The assistant&apos;s thought process:
113 |             </div>
114 |             {part.details.map((detail, detailIndex) =>
115 |               detail.type === "text" ? (
116 |                 <div key={detailIndex} className="px-2 py-1.5 bg-muted/10 rounded-md border border-border/30">
117 |                   <Markdown>{detail.text}</Markdown>
118 |                 </div>
119 |               ) : (
120 |                 "<redacted>"
121 |               ),
122 |             )}
123 |           </motion.div>
124 |         )}
125 |       </AnimatePresence>
126 |     </div>
127 |   );
128 | }
129 | 
130 | interface MessageProps {
131 |   message: TMessage & {
132 |     parts?: Array<TextUIPart | ToolInvocationUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
133 |   };
134 |   isLoading: boolean;
135 |   status: "error" | "submitted" | "streaming" | "ready";
136 |   isLatestMessage: boolean;
137 | }
138 | 
139 | const PurePreviewMessage = ({
140 |   message,
141 |   isLatestMessage,
142 |   status,
143 |   isLoading,
144 | }: MessageProps) => {
145 |   // Create a string with all text parts for copy functionality
146 |   const getMessageText = () => {
147 |     if (!message.parts) return "";
148 |     return message.parts
149 |       .filter(part => part.type === "text")
150 |       .map(part => (part.type === "text" ? part.text : ""))
151 |       .join("\n\n");
152 |   };
153 | 
154 |   // Only show copy button if the message is from the assistant or user, and not currently streaming
155 |   const shouldShowCopyButton = (message.role === "assistant" || message.role === "user") && (!isLatestMessage || status !== "streaming");
156 | 
157 |   return (
158 |     <AnimatePresence key={message.id}>
159 |       <motion.div
160 |         className={cn(
161 |           "w-full mx-auto px-4 group/message",
162 |           message.role === "assistant" ? "mb-8" : "mb-6"
163 |         )}
164 |         initial={{ y: 5, opacity: 0 }}
165 |         animate={{ y: 0, opacity: 1 }}
166 |         key={`message-${message.id}`}
167 |         data-role={message.role}
168 |       >
169 |         <div
170 |           className={cn(
171 |             "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
172 |             "group-data-[role=user]/message:w-fit",
173 |           )}
174 |         >
175 |           <div className="flex flex-col w-full space-y-3">
176 |             {message.parts?.map((part, i) => {
177 |               switch (part.type) {
178 |                 case "text":
179 |                   const textPart = part as TextUIPart;
180 |                   return (
181 |                     <motion.div
182 |                       initial={{ y: 5, opacity: 0 }}
183 |                       animate={{ y: 0, opacity: 1 }}
184 |                       key={`message-${message.id}-part-${i}`}
185 |                       className="flex flex-row gap-2 items-start w-full"
186 |                     >
187 |                       <div
188 |                         className={cn("flex flex-col gap-3 w-full", {
189 |                           "bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl flex items-center gap-2":
190 |                             message.role === "user",
191 |                         })}
192 |                       >
193 |                         <Markdown>{textPart.text}</Markdown>
194 |                         {textPart.citations && <Citations citations={textPart.citations} />}
195 |                         {message.role === 'user' && shouldShowCopyButton && (
196 |                           <CopyButton text={getMessageText()} className="ml-auto" />
197 |                         )}
198 |                       </div>
199 |                     </motion.div>
200 |                   );
201 |                 case "tool-invocation":
202 |                   const toolPart = part as ToolInvocationUIPart;
203 |                   const { toolName, state, args } = toolPart.toolInvocation;
204 |                   const result = 'result' in toolPart.toolInvocation ? toolPart.toolInvocation.result : null;
205 |                   
206 |                   return (
207 |                     <ToolInvocation
208 |                       key={`message-${message.id}-part-${i}`}
209 |                       toolName={toolName}
210 |                       state={state}
211 |                       args={args}
212 |                       result={result}
213 |                       isLatestMessage={isLatestMessage}
214 |                       status={status}
215 |                     />
216 |                   );
217 |                 case "reasoning":
218 |                   const reasoningPart = part as ReasoningUIPart;
219 |                   return (
220 |                     <ReasoningMessagePart
221 |                       key={`message-${message.id}-${i}`}
222 |                       part={reasoningPart}
223 |                       isReasoning={
224 |                         (message.parts &&
225 |                           status === "streaming" &&
226 |                           i === message.parts.length - 1) ??
227 |                         false
228 |                       }
229 |                     />
230 |                   );
231 |                 default:
232 |                   return null;
233 |               }
234 |             })}
235 |             {message.role === 'assistant' && shouldShowCopyButton && (
236 |               <div className="flex justify-start mt-2">
237 |                 <CopyButton text={getMessageText()} />
238 |               </div>
239 |             )}
240 |           </div>
241 |         </div>
242 |       </motion.div>
243 |     </AnimatePresence>
244 |   );
245 | };
246 | 
247 | export const Message = memo(PurePreviewMessage, (prevProps, nextProps) => {
248 |   if (prevProps.status !== nextProps.status) return false;
249 |   if (prevProps.message.annotations !== nextProps.message.annotations)
250 |     return false;
251 |   if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
252 |   return true;
253 | });
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
10 |   messages: TMessage[];
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
27 |             message={m}
28 |             status={status}
29 |           />
30 |         ))}
31 |         <div className="h-1" ref={endRef} />
32 |       </div>
33 |     </div>
34 |   );
35 | };
```

components/model-picker.tsx
```
1 | "use client";
2 | import { MODELS, modelDetails, type modelID, defaultModel } from "@/ai/providers";
3 | import {
4 |   Select,
5 |   SelectContent,
6 |   SelectGroup,
7 |   SelectItem,
8 |   SelectTrigger,
9 |   SelectValue,
10 | } from "./ui/select";
11 | import { cn } from "@/lib/utils";
12 | import { Sparkles, Zap, Info, Bolt, Code, Brain, Lightbulb, Image, Gauge, Rocket, Bot } from "lucide-react";
13 | import { useState } from "react";
14 | 
15 | interface ModelPickerProps {
16 |   selectedModel: modelID;
17 |   setSelectedModel: (model: modelID) => void;
18 | }
19 | 
20 | export const ModelPicker = ({ selectedModel, setSelectedModel }: ModelPickerProps) => {
21 |   const [hoveredModel, setHoveredModel] = useState<modelID | null>(null);
22 |   
23 |   // Ensure we always have a valid model ID immediately for stable rendering
24 |   // const stableModelId = MODELS.includes(selectedModel) ? selectedModel : defaultModel; // Replaced by direct use of selectedModel
25 |   
26 |   // Function to get the appropriate icon for each provider
27 |   const getProviderIcon = (provider: string) => {
28 |     switch (provider.toLowerCase()) {
29 |       case 'anthropic':
30 |         return <Zap className="h-3 w-3 text-orange-600" />;
31 |       case 'openai':
32 |         return <Zap className="h-3 w-3 text-green-500" />;
33 |       case 'google':
34 |         return <Zap className="h-3 w-3 text-red-500" />;
35 |       case 'groq':
36 |         return <Zap className="h-3 w-3 text-blue-500" />;
37 |       case 'xai':
38 |         return <Zap className="h-3 w-3 text-yellow-500" />;
39 |       case 'openrouter':
40 |         return <Zap className="h-3 w-3 text-purple-500" />;
41 |       default:
42 |         return <Zap className="h-3 w-3 text-blue-500" />;
43 |     }
44 |   };
45 |   
46 |   // Function to get capability icon
47 |   const getCapabilityIcon = (capability: string) => {
48 |     switch (capability.toLowerCase()) {
49 |       case 'code':
50 |         return <Code className="h-2.5 w-2.5" />;
51 |       case 'reasoning':
52 |         return <Brain className="h-2.5 w-2.5" />;
53 |       case 'research':
54 |         return <Lightbulb className="h-2.5 w-2.5" />;
55 |       case 'vision':
56 |         // eslint-disable-next-line jsx-a11y/alt-text
57 |         return <Image className="h-2.5 w-2.5" />;
58 |       case 'fast':
59 |       case 'rapid':
60 |         return <Bolt className="h-2.5 w-2.5" />;
61 |       case 'efficient':
62 |       case 'compact':
63 |         return <Gauge className="h-2.5 w-2.5" />;
64 |       case 'creative':
65 |       case 'balance':
66 |         return <Rocket className="h-2.5 w-2.5" />;
67 |       case 'agentic':
68 |         return <Bot className="h-2.5 w-2.5" />;
69 |       default:
70 |         return <Info className="h-2.5 w-2.5" />;
71 |     }
72 |   };
73 |   
74 |   // Get capability badge color
75 |   const getCapabilityColor = (capability: string) => {
76 |     switch (capability.toLowerCase()) {
77 |       case 'code':
78 |         return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
79 |       case 'reasoning':
80 |       case 'research':
81 |         return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
82 |       case 'vision':
83 |         return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
84 |       case 'fast':
85 |       case 'rapid':
86 |         return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
87 |       case 'efficient':
88 |       case 'compact':
89 |         return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
90 |       case 'creative':
91 |       case 'balance':
92 |         return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300";
93 |       case 'agentic':
94 |         return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300";
95 |       default:
96 |         return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
97 |     }
98 |   };
99 |   
100 |   // Get current model details to display
101 |   const displayModelId = hoveredModel || selectedModel; // Use selectedModel
102 |   const currentModelDetails = modelDetails[displayModelId];
103 | 
104 |   // Handle model change
105 |   const handleModelChange = (modelId: string) => {
106 |     if ((MODELS as string[]).includes(modelId)) {
107 |       const typedModelId = modelId as modelID;
108 |       setSelectedModel(typedModelId);
109 |     }
110 |   };
111 | 
112 |   return (
113 |     <div>
114 |       <Select 
115 |         value={selectedModel} // Use selectedModel directly
116 |         onValueChange={handleModelChange} 
117 |       >
118 |         <SelectTrigger 
119 |           className="max-w-[200px] sm:max-w-fit sm:w-56 px-2 sm:px-3 h-8 sm:h-9 rounded-full group border-primary/20 bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-200 ring-offset-background focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
120 |         >
121 |           <SelectValue 
122 |             placeholder="Select model" 
123 |             className="text-xs font-medium flex items-center gap-1 sm:gap-2 text-primary dark:text-primary-foreground"
124 |           >
125 |             <div className="flex items-center gap-1 sm:gap-2">
126 |               {getProviderIcon(modelDetails[selectedModel].provider)} {/* Use selectedModel */}
127 |               <span className="font-medium truncate">{modelDetails[selectedModel].name}</span> {/* Use selectedModel */}
128 |             </div>
129 |           </SelectValue>
130 |         </SelectTrigger>
131 |         <SelectContent
132 |           align="start"
133 |           className="bg-background/95 dark:bg-muted/95 backdrop-blur-sm border-border/80 rounded-lg overflow-hidden p-0 w-[280px] sm:w-[350px] md:w-[515px]"
134 |         >
135 |           <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] md:grid-cols-[260px_1fr] items-start">
136 |             {/* Model selector column */}
137 |             <div className="sm:border-r border-border/40 bg-muted/20 p-0 pr-1">
138 |               <SelectGroup className="space-y-1">
139 |                 {MODELS.map((id) => {
140 |                   const modelId = id as modelID;
141 |                   return (
142 |                     <SelectItem 
143 |                       key={id} 
144 |                       value={id}
145 |                       onMouseEnter={() => setHoveredModel(modelId)}
146 |                       onMouseLeave={() => setHoveredModel(null)}
147 |                       className={cn(
148 |                         "!px-2 sm:!px-3 py-1.5 sm:py-2 cursor-pointer rounded-md text-xs transition-colors duration-150",
149 |                         "hover:bg-primary/5 hover:text-primary-foreground",
150 |                         "focus:bg-primary/10 focus:text-primary focus:outline-none",
151 |                         "data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary",
152 |                         selectedModel === id && "!bg-primary/15 !text-primary font-medium" // Use selectedModel
153 |                       )}
154 |                     >
155 |                       <div className="flex flex-col gap-0.5">
156 |                         <div className="flex items-center gap-1.5">
157 |                           {getProviderIcon(modelDetails[modelId].provider)}
158 |                           <span className="font-medium truncate">{modelDetails[modelId].name}</span>
159 |                         </div>
160 |                         <span className="text-[10px] sm:text-xs text-muted-foreground">
161 |                           {modelDetails[modelId].provider}
162 |                         </span>
163 |                       </div>
164 |                     </SelectItem>
165 |                   );
166 |                 })}
167 |               </SelectGroup>
168 |             </div>
169 |             
170 |             {/* Model details column - hidden on smallest screens, visible on sm+ */}
171 |             <div className="sm:block hidden p-2 sm:p-3 md:p-4 flex-col sticky top-0">
172 |               <div>
173 |                 <div className="flex items-center gap-2 mb-1">
174 |                   {getProviderIcon(currentModelDetails.provider)}
175 |                   <h3 className="text-sm font-semibold">{currentModelDetails.name}</h3>
176 |                 </div>
177 |                 <div className="text-xs text-muted-foreground mb-1">
178 |                   Provider: <span className="font-medium">{currentModelDetails.provider}</span>
179 |                 </div>
180 |                 
181 |                 {/* Capability badges */}
182 |                 <div className="flex flex-wrap gap-1 mt-2 mb-3">
183 |                   {currentModelDetails.capabilities.map((capability) => (
184 |                     <span 
185 |                       key={capability}
186 |                       className={cn(
187 |                         "inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium",
188 |                         getCapabilityColor(capability)
189 |                       )}
190 |                     >
191 |                       {getCapabilityIcon(capability)}
192 |                       <span>{capability}</span>
193 |                     </span>
194 |                   ))}
195 |                 </div>
196 |                 
197 |                 <div className="text-xs text-foreground/90 leading-relaxed mb-3 hidden md:block">
198 |                   {currentModelDetails.description}
199 |                 </div>
200 |               </div>
201 |               
202 |               <div className="bg-muted/40 rounded-md p-2 hidden md:block">
203 |                 <div className="text-[10px] text-muted-foreground flex justify-between items-center">
204 |                   <span>API Version:</span>
205 |                   <code className="bg-background/80 px-2 py-0.5 rounded text-[10px] font-mono">
206 |                     {currentModelDetails.apiVersion}
207 |                   </code>
208 |                 </div>
209 |               </div>
210 |             </div>
211 |             
212 |             {/* Condensed model details for mobile only */}
213 |             <div className="p-3 sm:hidden border-t border-border/30">
214 |               <div className="flex flex-wrap gap-1 mb-2">
215 |                 {currentModelDetails.capabilities.slice(0, 4).map((capability) => (
216 |                   <span 
217 |                     key={capability}
218 |                     className={cn(
219 |                       "inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium",
220 |                       getCapabilityColor(capability)
221 |                     )}
222 |                   >
223 |                     {getCapabilityIcon(capability)}
224 |                     <span>{capability}</span>
225 |                   </span>
226 |                 ))}
227 |                 {currentModelDetails.capabilities.length > 4 && (
228 |                   <span className="text-[10px] text-muted-foreground">+{currentModelDetails.capabilities.length - 4} more</span>
229 |                 )}
230 |               </div>
231 |             </div>
232 |           </div>
233 |         </SelectContent>
234 |       </Select>
235 |     </div>
236 |   );
237 | };
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
3 | import { ArrowUp, Loader2, Globe } from "lucide-react";
4 | import { ModelPicker } from "./model-picker";
5 | import { useRef } from "react";
6 | import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
7 | import { useWebSearch } from "@/lib/context/web-search-context";
8 | 
9 | interface InputProps {
10 |   input: string;
11 |   handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
12 |   isLoading: boolean;
13 |   status: string;
14 |   stop: () => void;
15 |   selectedModel: modelID;
16 |   setSelectedModel: (model: modelID) => void;
17 | }
18 | 
19 | export const Textarea = ({
20 |   input,
21 |   handleInputChange,
22 |   isLoading,
23 |   status,
24 |   stop,
25 |   selectedModel,
26 |   setSelectedModel,
27 | }: InputProps) => {
28 |   const isStreaming = status === "streaming" || status === "submitted";
29 |   const iconButtonRef = useRef<HTMLButtonElement>(null);
30 | 
31 |   const { webSearchEnabled, setWebSearchEnabled } = useWebSearch();
32 | 
33 |   const handleWebSearchToggle = () => {
34 |     setWebSearchEnabled(!webSearchEnabled);
35 |   };
36 | 
37 |   return (
38 |     <div className="relative w-full">
39 |       <ShadcnTextarea
40 |         className="resize-none bg-background/50 dark:bg-muted/50 backdrop-blur-sm w-full rounded-2xl pr-12 pt-4 pb-16 border-input focus-visible:ring-ring placeholder:text-muted-foreground"
41 |         value={input}
42 |         autoFocus
43 |         placeholder="Send a message..."
44 |         onChange={handleInputChange}
45 |         onKeyDown={(e) => {
46 |           if (e.key === "Enter" && !e.shiftKey && !isLoading && input.trim()) {
47 |             e.preventDefault();
48 |             e.currentTarget.form?.requestSubmit();
49 |           }
50 |         }}
51 |       />
52 |       <div className="absolute left-2 bottom-2 z-10">
53 |         <div className="flex items-center gap-2">
54 |           <ModelPicker
55 |             setSelectedModel={setSelectedModel}
56 |             selectedModel={selectedModel}
57 |           />
58 |           {selectedModel.startsWith("openrouter/") && (
59 |             <div className="relative flex items-center">
60 |               <Tooltip>
61 |                 <TooltipTrigger asChild>
62 |                   <button
63 |                     type="button"
64 |                     ref={iconButtonRef}
65 |                     aria-label={webSearchEnabled ? "Disable web search" : "Enable web search"}
66 |                     onClick={handleWebSearchToggle}
67 |                     className={`h-8 w-8 flex items-center justify-center rounded-full border transition-colors duration-150 ${webSearchEnabled ? 'bg-primary text-primary-foreground border-primary shadow' : 'bg-background border-border text-muted-foreground hover:bg-accent'} focus:outline-none focus:ring-2 focus:ring-primary/30`}
68 |                   >
69 |                     <Globe className="h-5 w-5" />
70 |                   </button>
71 |                 </TooltipTrigger>
72 |                 <TooltipContent sideOffset={8}>
73 |                   {webSearchEnabled ? 'Disable web search' : 'Enable web search'}
74 |                 </TooltipContent>
75 |               </Tooltip>
76 |             </div>
77 |           )}
78 |         </div>
79 |       </div>
80 |       <button
81 |         type={isStreaming ? "button" : "submit"}
82 |         onClick={isStreaming ? stop : undefined}
83 |         disabled={(!isStreaming && !input.trim()) || (isStreaming && status === "submitted")}
84 |         className="absolute right-2 bottom-2 rounded-full p-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed transition-all duration-200"
85 |       >
86 |         {isStreaming ? (
87 |           <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
88 |         ) : (
89 |           <ArrowUp className="h-4 w-4 text-primary-foreground" />
90 |         )}
91 |       </button>
92 |     </div>
93 |   );
94 | };
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
22 |   const iconClassName = "h-4 w-4 hover:text-sidebar-accent";
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
59 |     <DropdownMenuTrigger asChild={true}>
60 |       <Button
61 |         variant="ghost"
62 |         size={showLabel && labelText ? "default" : "icon"}
63 |         className={cn(
64 |           `rounded-md`,
65 |           showLabel && labelText ? "px-2 py-1 h-auto" : "", // Adjust padding/height if label is shown
66 |           className
67 |         )}
68 |         {...props}
69 |       >
70 |         {IconComponent}
71 |         {showLabel && labelText && <span>{labelText}</span>}
72 |         {(!showLabel || !labelText) && <span className="sr-only">Toggle theme</span>}
73 |       </Button>
74 |     </DropdownMenuTrigger>
75 |   );
76 | 
77 |   return (
78 |     <DropdownMenu>
79 |       {TriggerComponent}
80 |       <DropdownMenuContent align="end">
81 |         <DropdownMenuItem onSelect={() => setTheme("dark")}>
82 |           <Flame className="mr-2 h-4 w-4" />
83 |           <span>Dark</span>
84 |         </DropdownMenuItem>
85 |         <DropdownMenuItem onSelect={() => setTheme("light")}>
86 |           <Sun className="mr-2 h-4 w-4" />
87 |           <span>Light</span>
88 |         </DropdownMenuItem>
89 |         <DropdownMenuItem onSelect={() => setTheme("black")}>
90 |           <CircleDashed className="mr-2 h-4 w-4" />
91 |           <span>Black</span>
92 |         </DropdownMenuItem>
93 |         <DropdownMenuItem onSelect={() => setTheme("sunset")}>
94 |           <Sun className="mr-2 h-4 w-4" />
95 |           <span>Sunset</span>
96 |         </DropdownMenuItem>
97 |         <DropdownMenuItem onSelect={() => setTheme("cyberpunk")}>
98 |           <TerminalSquare className="mr-2 h-4 w-4" />
99 |           <span>Cyberpunk</span>
100 |         </DropdownMenuItem>
101 |         <DropdownMenuItem onSelect={() => setTheme("retro")}>
102 |           <CassetteTape className="mr-2 h-4 w-4" />
103 |           <span>Retro</span>
104 |         </DropdownMenuItem>
105 |         <DropdownMenuItem onSelect={() => setTheme("nature")}>
106 |           <Leaf className="mr-2 h-4 w-4" />
107 |           <span>Nature</span>
108 |         </DropdownMenuItem>
109 |       </DropdownMenuContent>
110 |     </DropdownMenu>
111 |   )
112 | }
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
106 |         <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
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
11 | 
12 | if (!process.env.GOOGLE_CLIENT_ID) {
13 |     throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
14 | }
15 | if (!process.env.GOOGLE_CLIENT_SECRET) {
16 |     throw new Error('Missing GOOGLE_CLIENT_SECRET environment variable');
17 | }
18 | if (!process.env.AUTH_SECRET) {
19 |     throw new Error('Missing AUTH_SECRET environment variable');
20 | }
21 | if (!process.env.POLAR_ACCESS_TOKEN) {
22 |     throw new Error('Missing POLAR_ACCESS_TOKEN environment variable');
23 | }
24 | if (!process.env.POLAR_PRODUCT_ID) {
25 |     throw new Error('Missing POLAR_PRODUCT_ID environment variable');
26 | }
27 | if (!process.env.SUCCESS_URL) {
28 |     throw new Error('Missing SUCCESS_URL environment variable');
29 | }
30 | 
31 | const polarClient = new Polar({
32 |     accessToken: process.env.POLAR_ACCESS_TOKEN,
33 |     server: 'sandbox', // As per your instruction
34 | });
35 | 
36 | export const auth = betterAuth({
37 |     database: drizzleAdapter(db, {
38 |         provider: "pg",
39 |         // Explicitly pass the schema tables using the standard names
40 |         schema: {
41 |             user: schema.users,       // Use the exported const 'users'
42 |             account: schema.accounts, // Use the exported const 'accounts'
43 |             session: schema.sessions, // Use the exported const 'sessions'
44 |             verification: schema.verification // Updated from verificationTokens
45 |         },
46 |         // We might need to explicitly pass the schema tables here later
47 |         // schema: { ...schema } 
48 |         // Or potentially use this flag if table names are standard plurals
49 |         // usePlural: true
50 |     }),
51 |     secret: process.env.AUTH_SECRET,
52 |     sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
53 |     // Add session field mapping based on documentation
54 |     session: {
55 |         fields: {
56 |             token: "sessionToken" // Map internal token to sessionToken column
57 |             // If your expires column was different, you'd map expiresAt here too
58 |         }
59 |     },
60 |     trustedOrigins: ['https://hog-cute-turkey.ngrok-free.app', 'http://localhost:3000', 'https://www.chatlima.com'],
61 |     socialProviders: {
62 |         google: {
63 |             clientId: process.env.GOOGLE_CLIENT_ID,
64 |             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
65 |             // Set higher message limit for authenticated users
66 |             onAccountCreated: async ({ user }: { user: any }) => {
67 |                 console.log('[Google Provider] onAccountCreated: Triggered for user', user.id);
68 |                 // Update user metadata to add higher message limit
69 |                 await db.update(schema.users)
70 |                     .set({
71 |                         metadata: {
72 |                             ...user.metadata,
73 |                             messageLimit: 20 // 20 messages per day for Google signed-in users
74 |                         }
75 |                     })
76 |                     .where(eq(schema.users.id, user.id));
77 | 
78 |                 return user;
79 |             }
80 |         },
81 |     },
82 |     plugins: [
83 |         anonymous({
84 |             emailDomainName: "anonymous.chatlima.com", // Use a proper domain for anonymous users
85 |             onLinkAccount: async ({ anonymousUser, newUser }) => {
86 |                 console.log('--- Anonymous Plugin onLinkAccount Fired ---');
87 |                 console.log('Anonymous User:', JSON.stringify(anonymousUser, null, 2));
88 |                 console.log('New User:', JSON.stringify(newUser, null, 2));
89 | 
90 |                 console.log('Linking anonymous user to authenticated user', {
91 |                     anonymousId: anonymousUser.user?.id,
92 |                     newUserId: newUser.user?.id
93 |                 });
94 |                 // Optional: Migrate any data from anonymousUser to newUser here
95 | 
96 |                 // ***** MOVED POLAR CUSTOMER CREATION LOGIC HERE *****
97 |                 const userForPolar = newUser.user; // Get the actual user object
98 | 
99 |                 // Ensure we have a valid user object and it's not anonymous
100 |                 // (though after linking, newUser.user should be the authenticated one)
101 |                 if (userForPolar && userForPolar.id && !userForPolar.isAnonymous) {
102 |                     console.log('[onLinkAccount] Processing Polar customer for authenticated user:', userForPolar.id, 'Email:', userForPolar.email);
103 |                     try {
104 |                         let polarCustomer;
105 |                         try {
106 |                             // Attempt to fetch customer by externalId (userForPolar.id from your app)
107 |                             polarCustomer = await polarClient.customers.getExternal({ externalId: userForPolar.id });
108 |                             console.log('[onLinkAccount] Found existing Polar customer by externalId:', polarCustomer.id, 'for user:', userForPolar.id);
109 | 
110 |                             // Optional: If found, ensure email matches or update if necessary
111 |                             if (polarCustomer.email !== userForPolar.email && userForPolar.email) {
112 |                                 console.log(`[onLinkAccount] Polar customer ${polarCustomer.id} has email ${polarCustomer.email}, app user has ${userForPolar.email}. Updating Polar customer's email.`);
113 |                                 await polarClient.customers.updateExternal({
114 |                                     externalId: userForPolar.id,
115 |                                     customerUpdateExternalID: { email: userForPolar.email, name: userForPolar.name }
116 |                                 });
117 |                                 console.log('[onLinkAccount] Polar customer email updated for externalId:', userForPolar.id);
118 |                             }
119 | 
120 |                         } catch (error: any) {
121 |                             if (error.name === 'ResourceNotFound' || error.statusCode === 404 || (error.response && error.response.status === 404)) {
122 |                                 console.log('[onLinkAccount] No Polar customer found with externalId:', userForPolar.id, '. Attempting to create.');
123 | 
124 |                                 try {
125 |                                     polarCustomer = await polarClient.customers.create({
126 |                                         email: userForPolar.email,
127 |                                         name: userForPolar.name,
128 |                                         externalId: userForPolar.id
129 |                                     });
130 |                                     console.log('[onLinkAccount] Polar customer created successfully:', polarCustomer.id, 'with externalId:', userForPolar.id);
131 |                                 } catch (createError: any) {
132 |                                     console.error('[onLinkAccount] Failed to create Polar customer for user:', userForPolar.id, '. Create Error:', createError);
133 |                                     if (createError.response && createError.response.data) {
134 |                                         console.error('[onLinkAccount] Polar API error details:', createError.response.data);
135 |                                     }
136 |                                 }
137 |                             } else {
138 |                                 console.error('[onLinkAccount] Error fetching Polar customer by externalId for user:', userForPolar.id, 'Fetch Error:', error);
139 |                                 if (error.response && error.response.data) {
140 |                                     console.error('[onLinkAccount] Polar API error details:', error.response.data);
141 |                                 }
142 |                             }
143 |                         }
144 |                     } catch (error) {
145 |                         console.error('[onLinkAccount] Unhandled error in Polar processing for user:', userForPolar.id, 'Error:', error);
146 |                     }
147 |                 } else {
148 |                     console.log('[onLinkAccount] Skipping Polar customer processing for user:', userForPolar?.id, 'isAnonymous:', userForPolar?.isAnonymous);
149 |                 }
150 |             },
151 |         }),
152 |         polarPlugin({
153 |             client: polarClient,
154 |             createCustomerOnSignUp: false,
155 |             // onAccountCreated: async ({ user }: { user: { id: string, email: string, name?: string, isAnonymous?: boolean } }) => {
156 |             //     console.log('[Polar Plugin] onAccountCreated: Triggered for user', user.id); // THIS WAS NOT FIRING
157 |             //     // ...  previous logic commented out as it's moved ...
158 |             //     return user;
159 |             // },
160 |             enableCustomerPortal: true,
161 |             checkout: {
162 |                 enabled: true,
163 |                 products: [
164 |                     {
165 |                         productId: process.env.POLAR_PRODUCT_ID || '',
166 |                         slug: 'ai-usage',
167 |                         // Remove name and description as they're not part of the expected type
168 |                     }
169 |                 ],
170 |                 successUrl: process.env.SUCCESS_URL,
171 |             },
172 |             webhooks: {
173 |                 secret: process.env.POLAR_WEBHOOK_SECRET || '', // Use empty string if not set yet
174 |                 onPayload: async (payload) => {
175 |                     console.log('Polar webhook received:', payload.type);
176 |                 },
177 |                 // Add specific event handlers
178 |                 onSubscriptionCreated: async (payload) => {
179 |                     console.log('Subscription created:', payload.data.id);
180 |                     // Credits will be managed by Polar meter
181 |                 },
182 |                 onOrderCreated: async (payload) => {
183 |                     console.log('Order created:', payload.data.id);
184 |                 },
185 |                 onSubscriptionCanceled: async (payload) => {
186 |                     console.log('Subscription canceled:', payload.data.id);
187 |                 },
188 |                 onSubscriptionRevoked: async (payload) => {
189 |                     console.log('Subscription revoked:', payload.data.id);
190 |                 }
191 |             },
192 |         }),
193 |     ],
194 |     // session: { ... } // Potentially configure session strategy if needed
195 | });
196 | 
197 | // Helper to check if user has reached their daily message or credit limit
198 | export async function checkMessageLimit(userId: string, isAnonymous: boolean): Promise<{
199 |     hasReachedLimit: boolean;
200 |     limit: number;
201 |     remaining: number;
202 |     credits?: number | null;
203 |     usedCredits?: boolean;
204 | }> {
205 |     try {
206 |         // 1. Check Polar credits (for authenticated users only)
207 |         if (!isAnonymous) {
208 |             const credits = await getRemainingCreditsByExternalId(userId);
209 |             if (typeof credits === 'number' && credits > 0) {
210 |                 // User has credits, so allow usage and show credits left
211 |                 return {
212 |                     hasReachedLimit: false,
213 |                     limit: 250, // Soft cap for display, actual limit is credits
214 |                     remaining: credits,
215 |                     credits,
216 |                     usedCredits: true
217 |                 };
218 |             }
219 |         }
220 | 
221 |         // 2. If no credits (or anonymous), use daily message limit
222 |         // Get user info
223 |         const user = await db.query.users.findFirst({
224 |             where: eq(schema.users.id, userId)
225 |         });
226 | 
227 |         // Set daily limits
228 |         let messageLimit = isAnonymous ? 10 : 20;
229 |         if (!isAnonymous && user) {
230 |             messageLimit = (user as any).metadata?.messageLimit || 20;
231 |         }
232 | 
233 |         // Count today's messages for this user
234 |         const startOfDay = new Date();
235 |         startOfDay.setHours(0, 0, 0, 0);
236 | 
237 |         const messageCount = await db.select({ count: count() })
238 |             .from(schema.messages)
239 |             .innerJoin(schema.chats, eq(schema.chats.id, schema.messages.chatId))
240 |             .where(
241 |                 and(
242 |                     eq(schema.chats.userId, userId),
243 |                     gte(schema.messages.createdAt, startOfDay),
244 |                     eq(schema.messages.role, 'user')
245 |                 )
246 |             )
247 |             .execute()
248 |             .then(result => result[0]?.count || 0);
249 | 
250 |         return {
251 |             hasReachedLimit: messageCount >= messageLimit,
252 |             limit: messageLimit,
253 |             remaining: Math.max(0, messageLimit - messageCount),
254 |             credits: 0,
255 |             usedCredits: false
256 |         };
257 |     } catch (error) {
258 |         console.error('Error checking message limit:', error);
259 |         // Default to allowing messages if there's an error
260 |         return { hasReachedLimit: false, limit: 10, remaining: 10 };
261 |     }
262 | }
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
33 | };
34 | 
35 | type ChatWithMessages = Chat & {
36 |   messages: Message[];
37 | };
38 | 
39 | export async function saveMessages({
40 |   messages: dbMessages,
41 | }: {
42 |   messages: Array<DBMessage>;
43 | }) {
44 |   try {
45 |     if (dbMessages.length > 0) {
46 |       const chatId = dbMessages[0].chatId;
47 | 
48 |       // First delete any existing messages for this chat
49 |       await db
50 |         .delete(messages)
51 |         .where(eq(messages.chatId, chatId));
52 | 
53 |       // Then insert the new messages
54 |       return await db.insert(messages).values(dbMessages);
55 |     }
56 |     return null;
57 |   } catch (error) {
58 |     console.error('Failed to save messages in database', error);
59 |     throw error;
60 |   }
61 | }
62 | 
63 | // Function to convert AI messages to DB format
64 | export function convertToDBMessages(aiMessages: AIMessage[], chatId: string): DBMessage[] {
65 |   return aiMessages.map(msg => {
66 |     // Use existing id or generate a new one
67 |     const messageId = msg.id || nanoid();
68 | 
69 |     // If msg has parts, use them directly
70 |     if (msg.parts) {
71 |       return {
72 |         id: messageId,
73 |         chatId,
74 |         role: msg.role,
75 |         parts: msg.parts,
76 |         hasWebSearch: msg.hasWebSearch || false,
77 |         webSearchContextSize: msg.webSearchContextSize || 'medium',
78 |         createdAt: new Date()
79 |       };
80 |     }
81 | 
82 |     // Otherwise, convert content to parts
83 |     let parts: Array<TextUIPart | ToolInvocationUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
84 | 
85 |     if (typeof msg.content === 'string') {
86 |       parts = [{ type: 'text', text: msg.content } as TextUIPart];
87 |     } else if (Array.isArray(msg.content)) {
88 |       if (msg.content.every(item => typeof item === 'object' && item !== null)) {
89 |         // Content is already in parts-like format
90 |         parts = msg.content as Array<TextUIPart | ToolInvocationUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
91 |       } else {
92 |         // Content is an array but not in parts format
93 |         parts = [{ type: 'text', text: JSON.stringify(msg.content) } as TextUIPart];
94 |       }
95 |     } else {
96 |       // Default case
97 |       parts = [{ type: 'text', text: String(msg.content) } as TextUIPart];
98 |     }
99 | 
100 |     return {
101 |       id: messageId,
102 |       chatId,
103 |       role: msg.role,
104 |       parts,
105 |       hasWebSearch: msg.hasWebSearch || false,
106 |       webSearchContextSize: msg.webSearchContextSize || 'medium',
107 |       createdAt: new Date()
108 |     };
109 |   });
110 | }
111 | 
112 | // Convert DB messages to UI format
113 | export function convertToUIMessages(dbMessages: Array<Message>): Array<UIMessage> {
114 |   return dbMessages.map((message) => ({
115 |     id: message.id,
116 |     parts: message.parts as Array<TextUIPart | ToolInvocationUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>,
117 |     role: message.role as string,
118 |     content: getTextContent(message), // For backward compatibility
119 |     createdAt: message.createdAt,
120 |     hasWebSearch: message.hasWebSearch || false,
121 |     webSearchContextSize: (message.webSearchContextSize || 'medium') as 'low' | 'medium' | 'high'
122 |   }));
123 | }
124 | 
125 | export async function saveChat({ id, userId, messages: aiMessages, title }: SaveChatParams) {
126 |   // Generate a new ID if one wasn't provided
127 |   const chatId = id || nanoid();
128 | 
129 |   // Check if title is provided, if not generate one
130 |   let chatTitle = title;
131 | 
132 |   // Generate title if messages are provided and no title is specified
133 |   if (aiMessages && aiMessages.length > 0) {
134 |     const hasEnoughMessages = aiMessages.length >= 2 &&
135 |       aiMessages.some(m => m.role === 'user') &&
136 |       aiMessages.some(m => m.role === 'assistant');
137 | 
138 |     if (!chatTitle || chatTitle === 'New Chat' || chatTitle === undefined) {
139 |       if (hasEnoughMessages) {
140 |         try {
141 |           // Use AI to generate a meaningful title based on conversation
142 |           chatTitle = await generateTitle(aiMessages);
143 |         } catch (error) {
144 |           console.error('Error generating title:', error);
145 |           // Fallback to basic title extraction if AI title generation fails
146 |           const firstUserMessage = aiMessages.find(m => m.role === 'user');
147 |           if (firstUserMessage) {
148 |             // Check for parts first (new format)
149 |             if (firstUserMessage.parts && Array.isArray(firstUserMessage.parts)) {
150 |               const textParts = firstUserMessage.parts.filter((p: MessagePart) => p.type === 'text' && p.text);
151 |               if (textParts.length > 0) {
152 |                 chatTitle = textParts[0].text?.slice(0, 50) || 'New Chat';
153 |                 if ((textParts[0].text?.length || 0) > 50) {
154 |                   chatTitle += '...';
155 |                 }
156 |               } else {
157 |                 chatTitle = 'New Chat';
158 |               }
159 |             }
160 |             // Fallback to content (old format)
161 |             else if (typeof firstUserMessage.content === 'string') {
162 |               chatTitle = firstUserMessage.content.slice(0, 50);
163 |               if (firstUserMessage.content.length > 50) {
164 |                 chatTitle += '...';
165 |               }
166 |             } else {
167 |               chatTitle = 'New Chat';
168 |             }
169 |           } else {
170 |             chatTitle = 'New Chat';
171 |           }
172 |         }
173 |       } else {
174 |         // Not enough messages for AI title, use first message
175 |         const firstUserMessage = aiMessages.find(m => m.role === 'user');
176 |         if (firstUserMessage) {
177 |           // Check for parts first (new format)
178 |           if (firstUserMessage.parts && Array.isArray(firstUserMessage.parts)) {
179 |             const textParts = firstUserMessage.parts.filter((p: MessagePart) => p.type === 'text' && p.text);
180 |             if (textParts.length > 0) {
181 |               chatTitle = textParts[0].text?.slice(0, 50) || 'New Chat';
182 |               if ((textParts[0].text?.length || 0) > 50) {
183 |                 chatTitle += '...';
184 |               }
185 |             } else {
186 |               chatTitle = 'New Chat';
187 |             }
188 |           }
189 |           // Fallback to content (old format)
190 |           else if (typeof firstUserMessage.content === 'string') {
191 |             chatTitle = firstUserMessage.content.slice(0, 50);
192 |             if (firstUserMessage.content.length > 50) {
193 |               chatTitle += '...';
194 |             }
195 |           } else {
196 |             chatTitle = 'New Chat';
197 |           }
198 |         } else {
199 |           chatTitle = 'New Chat';
200 |         }
201 |       }
202 |     }
203 |   } else {
204 |     chatTitle = chatTitle || 'New Chat';
205 |   }
206 | 
207 |   // Check if chat already exists
208 |   const existingChat = await db.query.chats.findFirst({
209 |     where: and(
210 |       eq(chats.id, chatId),
211 |       eq(chats.userId, userId)
212 |     ),
213 |   });
214 | 
215 |   if (existingChat) {
216 |     // Update existing chat
217 |     await db
218 |       .update(chats)
219 |       .set({
220 |         title: chatTitle,
221 |         updatedAt: new Date()
222 |       })
223 |       .where(and(
224 |         eq(chats.id, chatId),
225 |         eq(chats.userId, userId)
226 |       ));
227 |   } else {
228 |     // Create new chat
229 |     await db.insert(chats).values({
230 |       id: chatId,
231 |       userId,
232 |       title: chatTitle,
233 |       createdAt: new Date(),
234 |       updatedAt: new Date()
235 |     });
236 |   }
237 | 
238 |   return { id: chatId };
239 | }
240 | 
241 | // Helper to get just the text content for display
242 | export function getTextContent(message: Message): string {
243 |   try {
244 |     const parts = message.parts as MessagePart[];
245 |     return parts
246 |       .filter(part => part.type === 'text' && part.text)
247 |       .map(part => part.text)
248 |       .join('\n');
249 |   } catch (e) {
250 |     // If parsing fails, return empty string
251 |     return '';
252 |   }
253 | }
254 | 
255 | export async function getChats(userId: string) {
256 |   return await db.query.chats.findMany({
257 |     where: eq(chats.userId, userId),
258 |     orderBy: [desc(chats.updatedAt)]
259 |   });
260 | }
261 | 
262 | export async function getChatById(id: string, userId: string): Promise<ChatWithMessages | null> {
263 |   const chat = await db.query.chats.findFirst({
264 |     where: and(
265 |       eq(chats.id, id),
266 |       eq(chats.userId, userId)
267 |     ),
268 |   });
269 | 
270 |   if (!chat) return null;
271 | 
272 |   const chatMessages = await db.query.messages.findMany({
273 |     where: eq(messages.chatId, id),
274 |     orderBy: [messages.createdAt]
275 |   });
276 | 
277 |   return {
278 |     ...chat,
279 |     messages: chatMessages
280 |   };
281 | }
282 | 
283 | export async function deleteChat(id: string, userId: string) {
284 |   await db.delete(chats).where(
285 |     and(
286 |       eq(chats.id, id),
287 |       eq(chats.userId, userId)
288 |     )
289 |   );
290 | } 
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
6 | // Determine Polar server environment
7 | // Use POLAR_SERVER_ENV if set, otherwise fallback to NODE_ENV logic
8 | const polarServerEnv = process.env.POLAR_SERVER_ENV === "sandbox" ? "sandbox"
9 |     : process.env.POLAR_SERVER_ENV === "production" ? "production"
10 |         : process.env.NODE_ENV === "production" ? "production"
11 |             : "sandbox";
12 | 
13 | // Initialize Polar SDK client
14 | const polarClient = new Polar({
15 |     accessToken: process.env.POLAR_ACCESS_TOKEN as string,
16 |     // Use the determined server environment
17 |     server: polarServerEnv,
18 | });
19 | 
20 | /**
21 |  * Reports AI usage to Polar and logs it in the local database
22 |  * 
23 |  * @param userId The ID of the user in your local database
24 |  * @param tokenCount The number of completion tokens consumed
25 |  * @param polarCustomerId Optional - The customer's ID in the Polar system (deprecated, will be replaced by external_id)
26 |  * @param additionalProperties Optional - Any additional properties to include in the event payload
27 |  * @returns A promise that resolves when both the Polar API call and DB insertion are complete
28 |  */
29 | export async function reportAIUsage(
30 |     userId: string,
31 |     _placeholder_param_for_now: number, // Keeping signature for now, but will be 1
32 |     polarCustomerId?: string,
33 |     additionalProperties: Record<string, any> = {}
34 | ) {
35 |     const eventName = 'message.processed'; // Changed from 'ai-usage'
36 |     const eventPayload = {
37 |         credits_consumed: 1, // Changed from completionTokens: tokenCount
38 |         ...additionalProperties
39 |     };
40 | 
41 |     try {
42 |         // 1. Try to get the customer by external ID first (using userId as external ID)
43 |         let customerId = polarCustomerId;
44 | 
45 |         if (!customerId) {
46 |             try {
47 |                 const customer = await getCustomerByExternalId(userId);
48 |                 if (customer) {
49 |                     customerId = customer.id;
50 |                 }
51 |             } catch (externalIdError) {
52 |                 console.warn(`Could not find Polar customer with external ID ${userId}:`, externalIdError);
53 |                 // Continue with regular flow, we'll try the map or just log locally
54 |             }
55 |         }
56 | 
57 |         // 2. Report to Polar (if we have a customer ID)
58 |         if (customerId) {
59 |             await polarClient.events.ingest({
60 |                 events: [
61 |                     {
62 |                         name: eventName,
63 |                         customerId: customerId,
64 |                         metadata: eventPayload
65 |                     }
66 |                 ]
67 |             });
68 |         }
69 | 
70 |         // 3. Log the event in our database regardless
71 |         try {
72 |             await db.insert(polarUsageEvents).values({
73 |                 id: nanoid(),
74 |                 userId,
75 |                 polarCustomerId: customerId, // Use the potentially found customerId from external ID
76 |                 eventName,
77 |                 eventPayload,
78 |                 createdAt: new Date()
79 |             });
80 |         } catch (dbError: any) {
81 |             // Check for foreign key constraint violation
82 |             if (dbError.code === '23503' && dbError.constraint?.includes('user_id')) {
83 |                 console.warn(`User ${userId} not found in database. Skipping usage tracking in DB.`);
84 |                 // Still return success since we reported to Polar if applicable
85 |                 return { success: true, userExistsInDB: false };
86 |             }
87 |             // Rethrow other database errors
88 |             throw dbError;
89 |         }
90 | 
91 |         return { success: true, userExistsInDB: true };
92 |     } catch (error) {
93 |         console.error('Error reporting AI usage to Polar:', error);
94 |         throw error;
95 |     }
96 | }
97 | 
98 | /**
99 |  * Gets a user's remaining credits from Polar using their external ID (app user ID)
100 |  * 
101 |  * @param userId The user's ID in our application (used as external ID in Polar)
102 |  * @returns A promise that resolves to the number of credits remaining, or null if there was an error
103 |  */
104 | export async function getRemainingCreditsByExternalId(userId: string): Promise<number | null> {
105 |     try {
106 |         // First try to get the customer state by external ID
107 |         const customerState = await polarClient.customers.getStateExternal({
108 |             externalId: userId
109 |         });
110 | 
111 |         if (!customerState) {
112 |             return null;
113 |         }
114 | 
115 |         // Look for AI usage meter in the customer state
116 |         // The meters property might be under a different name depending on the SDK version
117 |         const meters = (customerState as any).meters || [];
118 |         for (const meter of meters) {
119 |             if (meter?.meter?.name === 'Message Credits Used') { // New check
120 |                 return meter.balance || 0;
121 |             }
122 |         }
123 | 
124 |         return null;
125 |     } catch (error) {
126 |         console.error(`Error getting credits for external ID ${userId}:`, error);
127 |         return null;
128 |     }
129 | }
130 | 
131 | /**
132 |  * Gets a user's remaining credits from Polar
133 |  * 
134 |  * @param polarCustomerId The customer's ID in the Polar system
135 |  * @returns A promise that resolves to the number of credits remaining, or null if there was an error
136 |  */
137 | export async function getRemainingCredits(polarCustomerId: string): Promise<number | null> {
138 |     try {
139 |         // Get the customer meters response - use 'any' to bypass type checking
140 |         // since the Polar SDK types may vary by version
141 |         const response: any = await polarClient.customerMeters.list({
142 |             customerId: polarCustomerId
143 |         });
144 | 
145 |         // Try to handle both paginated and non-paginated responses safely
146 |         const processResult = async (data: any): Promise<number | null> => {
147 |             // Check if data contains meters directly
148 |             if (Array.isArray(data)) {
149 |                 for (const meter of data) {
150 |                     if (meter?.meter?.name === 'Message Credits Used') { // New check
151 |                         return meter.balance || meter.remaining || 0;
152 |                     }
153 |                 }
154 |             }
155 | 
156 |             // Check if the data has nested items
157 |             if (data?.items && Array.isArray(data.items)) {
158 |                 for (const meter of data.items) {
159 |                     if (meter?.meter?.name === 'Message Credits Used') { // New check
160 |                         return meter.balance || meter.remaining || 0;
161 |                     }
162 |                 }
163 |             }
164 | 
165 |             return null;
166 |         };
167 | 
168 |         // First try to process the direct response
169 |         let result = await processResult(response);
170 |         if (result !== null) return result;
171 | 
172 |         // If that doesn't work, try to handle the paginated response
173 |         // by getting the first page explicitly
174 |         try {
175 |             // Attempt to get first page if the response is paginated
176 |             if (typeof response.next === 'function') {
177 |                 const firstPage = await response.next();
178 |                 if (firstPage?.value) {
179 |                     result = await processResult(firstPage.value);
180 |                     if (result !== null) return result;
181 |                 }
182 |             }
183 |         } catch (err) {
184 |             // Silently ignore pagination errors
185 |             console.warn('Error processing paginated response', err);
186 |         }
187 | 
188 |         console.warn(`No 'Message Credits Used' meter found for customer ${polarCustomerId}`); // Updated warning
189 |         return null;
190 |     } catch (error) {
191 |         console.error('Error getting remaining credits from Polar:', error);
192 |         return null;
193 |     }
194 | }
195 | 
196 | /**
197 |  * Gets a customer by their external ID (app user ID)
198 |  * 
199 |  * @param externalId The external ID (your app's user ID)
200 |  * @returns The customer object or null if not found
201 |  */
202 | export async function getCustomerByExternalId(externalId: string) {
203 |     try {
204 |         const customer = await polarClient.customers.getExternal({
205 |             externalId: externalId
206 |         });
207 |         return customer;
208 |     } catch (error) {
209 |         // If the customer doesn't exist, return null instead of throwing
210 |         if ((error as any)?.statusCode === 404) {
211 |             return null;
212 |         }
213 |         // Otherwise re-throw the error
214 |         throw error;
215 |     }
216 | }
217 | 
218 | /**
219 |  * Creates or updates a customer in Polar using external ID
220 |  * 
221 |  * @param userId The ID of the user in your local database (will be used as external_id)
222 |  * @param email The user's email
223 |  * @param name Optional - The user's name
224 |  * @param metadata Optional - Any additional metadata to include
225 |  * @returns The created or updated customer
226 |  */
227 | export async function createOrUpdateCustomerWithExternalId(
228 |     userId: string,
229 |     email: string,
230 |     name?: string,
231 |     metadata: Record<string, any> = {}
232 | ) {
233 |     try {
234 |         // First check if the customer already exists with this external ID
235 |         const existingCustomer = await getCustomerByExternalId(userId);
236 | 
237 |         if (existingCustomer) {
238 |             // Customer exists, update them
239 |             const updatedCustomer = await polarClient.customers.updateExternal({
240 |                 externalId: userId,
241 |                 customerUpdateExternalID: {
242 |                     email: email,
243 |                     name: name,
244 |                     metadata: metadata
245 |                 }
246 |             });
247 |             return updatedCustomer;
248 |         } else {
249 |             // Customer doesn't exist, create them
250 |             const newCustomer = await polarClient.customers.create({
251 |                 email: email,
252 |                 name: name,
253 |                 externalId: userId,
254 |                 metadata: metadata
255 |             });
256 |             return newCustomer;
257 |         }
258 |     } catch (error) {
259 |         console.error('Error creating/updating customer with external ID:', error);
260 |         throw error;
261 |     }
262 | }
263 | 
264 | /**
265 |  * Helper to associate a Polar customer ID with a user
266 |  * 
267 |  * @param userId The ID of the user in your local database
268 |  * @param polarCustomerId The customer's ID in the Polar system
269 |  */
270 | export async function associatePolarCustomer(userId: string, polarCustomerId: string) {
271 |     try {
272 |         // This would typically update your User model to store the Polar customer ID
273 |         // For now, we'll just log a usage event to record the association
274 |         await db.insert(polarUsageEvents).values({
275 |             id: nanoid(),
276 |             userId,
277 |             polarCustomerId,
278 |             eventName: 'polar-customer-association',
279 |             eventPayload: {
280 |                 associated: true,
281 |                 timestamp: new Date().toISOString()
282 |             },
283 |             createdAt: new Date()
284 |         });
285 |         return { success: true };
286 |     } catch (dbError: any) {
287 |         // Check for foreign key constraint violation
288 |         if (dbError.code === '23503' && dbError.constraint?.includes('user_id')) {
289 |             console.warn(`User ${userId} not found in database. Cannot associate Polar customer.`);
290 |             return { success: false, reason: 'user_not_found' };
291 |         }
292 |         // Rethrow other database errors
293 |         console.error('Error associating Polar customer:', dbError);
294 |         throw dbError;
295 |     }
296 | }
297 | 
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

docs/client-side-chat-search-plan.md
```
1 | # Implementation Plan: Client-Side Chat Title Search in Sidebar
2 | 
3 | ## Overview
4 | Add a search input to the chat sidebar that allows users to filter the list of chats by their titles. The filtering should be performed client-side, updating the displayed chat list in real time as the user types.
5 | 
6 | ---
7 | 
8 | ## Steps
9 | 
10 | ### 1. UI: Add Search Input
11 | - Place a search input field at the top of the chat list section in the sidebar, below the "Chats" label.
12 | - Use a suitable UI component (e.g., the existing `Input` from `@/components/ui/input`).
13 | - Add a search icon (optional, for better UX).
14 | 
15 | ### 2. State Management
16 | - Add a new state variable, e.g., `searchTerm`, using `useState("")` in the `ChatSidebar` component.
17 | - Bind the search input's value to `searchTerm`.
18 | - Update `searchTerm` on every input change.
19 | 
20 | ### 3. Filtering Logic
21 | - When rendering the chat list (`chats.map(...)`), filter the `chats` array based on the `searchTerm`.
22 | - The filter should be case-insensitive and only match against the chat title.
23 | - If `searchTerm` is empty, show all chats.
24 | 
25 | ### 4. UX Considerations
26 | - If no chats match the search, display a "No results found" message.
27 | - Optionally, clear the search input when the sidebar is collapsed or when the user navigates away.
28 | - Ensure accessibility: label the search input appropriately.
29 | 
30 | ### 5. Styling
31 | - Ensure the search input fits visually with the sidebar design.
32 | - Add padding/margin as needed to separate it from the chat list and label.
33 | 
34 | ---
35 | 
36 | ## Example Pseudocode
37 | 
38 | ```tsx
39 | // State
40 | const [searchTerm, setSearchTerm] = useState("");
41 | 
42 | // In render
43 | <Input
44 |   value={searchTerm}
45 |   onChange={e => setSearchTerm(e.target.value)}
46 |   placeholder="Search chats..."
47 |   aria-label="Search chats by title"
48 | />
49 | 
50 | // Filtered chats
51 | const filteredChats = chats.filter(chat =>
52 |   chat.title.toLowerCase().includes(searchTerm.toLowerCase())
53 | );
54 | 
55 | // Render filteredChats instead of chats
56 | ```
57 | 
58 | ---
59 | 
60 | ## File(s) to Update
61 | - `components/chat-sidebar.tsx`
62 | 
63 | ---
64 | 
65 | ## Testing
66 | - Type in the search input and verify that the chat list updates in real time.
67 | - Test with different cases (upper/lower).
68 | - Test with no matches.
69 | - Test with sidebar collapsed/expanded.
70 | 
71 | ---
72 | 
73 | ## Optional Enhancements
74 | - Add a clear ("X") button to the search input.
75 | - Highlight the matching part of the chat title.
76 | - Debounce the search input for performance (not strictly necessary for small lists).
77 | 
78 | ---
79 | 
80 | **Next Steps:**  
81 | Implement the above plan in `components/chat-sidebar.tsx`. 
```

docs/deepseek_r1_openrouter_integration.md
```
1 | # Integrating DeepSeek R1 via OpenRouter with Vercel AI SDK
2 | 
3 | This document outlines the necessary configurations and prompting strategies to successfully integrate the DeepSeek R1 model when accessed through OpenRouter, using the Vercel AI SDK. These steps address common issues such as Zod validation errors for `logprobs` and ensuring the final answer is correctly displayed in the UI.
4 | 
5 | ## Summary of Key Configurations
6 | 
7 | To ensure DeepSeek R1 functions correctly, the following adjustments were made:
8 | 
9 | 1.  **Model Definition in `ai/providers.ts`**:
10 |     *   The `openrouter/deepseek/deepseek-r1` model was enabled.
11 |     *   It was wrapped with `extractReasoningMiddleware` to separate reasoning from the final answer.
12 |     *   `logprobs: false` was added to the `openrouterClient` configuration for this model to prevent validation errors.
13 |     *   The `extractReasoningMiddleware` for DeepSeek R1 was configured to use `tagName: 'think'` and `startWithReasoning: false` (or rely on the default, which is `false`).
14 | 
15 |     ```typescript
16 |     // In ai/providers.ts
17 | 
18 |     // ... other imports ...
19 |     import {
20 |       customProvider,
21 |       wrapLanguageModel,
22 |       extractReasoningMiddleware
23 |     } from "ai";
24 | 
25 |     // Middleware for general reasoning (if any)
26 |     const middleware = extractReasoningMiddleware({
27 |       tagName: 'think',
28 |     });
29 | 
30 |     // Specific middleware for DeepSeek R1
31 |     const deepseekR1Middleware = extractReasoningMiddleware({
32 |       tagName: 'think',
33 |       // startWithReasoning: true, // This was found to cause issues, default (false) is better
34 |     });
35 | 
36 |     const openrouterClient = createOpenRouter({
37 |       apiKey: getApiKey('OPENROUTER_API_KEY'),
38 |       // ... other headers ...
39 |     });
40 | 
41 |     const languageModels = {
42 |       // ... other models ...
43 |       "openrouter/deepseek/deepseek-r1": wrapLanguageModel({
44 |         model: openrouterClient("deepseek/deepseek-r1", { logprobs: false }), // Disable logprobs
45 |         middleware: deepseekR1Middleware,
46 |       }),
47 |       // ... other models ...
48 |     };
49 | 
50 |     export const modelDetails: Record<keyof typeof languageModels, ModelInfo> = {
51 |       // ... other model details ...
52 |       "openrouter/deepseek/deepseek-r1": {
53 |         provider: "OpenRouter",
54 |         name: "DeepSeek R1",
55 |         description: "DeepSeek R1: Open-source model with performance on par with OpenAI o1, featuring open reasoning tokens. 671B parameters (37B active). MIT licensed.",
56 |         apiVersion: "deepseek/deepseek-r1",
57 |         capabilities: ["Reasoning", "Open Source"],
58 |         enabled: true // Ensure the model is enabled
59 |       },
60 |       // ... other model details ...
61 |     };
62 |     // ... rest of the file ...
63 |     ```
64 | 
65 | 2.  **System Prompt in API Route (`app/api/chat/route.ts`)**:
66 |     *   A specific system message is prepended to the conversation history when `openrouter/deepseek/deepseek-r1` is selected. This prompt guides the model to structure its output correctly.
67 | 
68 |     ```typescript
69 |     // In app/api/chat/route.ts
70 | 
71 |     // ... other imports ...
72 |     import { type UIMessage, nanoid } from 'ai'; // Assuming nanoid is used for IDs
73 | 
74 |     export async function POST(req: Request) {
75 |       const {
76 |         messages,
77 |         selectedModel,
78 |         // ... other parameters ...
79 |       }: {
80 |         messages: UIMessage[];
81 |         selectedModel: modelID;
82 |         // ... other types ...
83 |       } = await req.json();
84 | 
85 |       let modelMessages: UIMessage[] = [...messages];
86 | 
87 |       if (selectedModel === "openrouter/deepseek/deepseek-r1") {
88 |         const systemContent = "Please provide your reasoning within <think> tags. After closing the </think> tag, provide your final answer directly without any other special tags.";
89 |         modelMessages.unshift({
90 |           role: "system",
91 |           id: nanoid(), // Or any unique ID generation method
92 |           content: systemContent,
93 |           parts: [{ type: "text", text: systemContent }]
94 |         });
95 |       }
96 | 
97 |       // ... rest of the API route logic ...
98 | 
99 |       // When instantiating model for web search, also disable logprobs for DeepSeek R1
100 |       if (webSearch.enabled && selectedModel.startsWith("openrouter/")) {
101 |         const openrouterModelId = selectedModel.replace("openrouter/", "") + ":online";
102 |         // ... client instantiation ...
103 |         if (selectedModel === "openrouter/deepseek/deepseek-r1") {
104 |           modelInstance = openrouterClient(openrouterModelId, { logprobs: false });
105 |         } else {
106 |           modelInstance = openrouterClient(openrouterModelId);
107 |         }
108 |       }
109 |       // ...
110 |     }
111 |     ```
112 | 
113 | ## Explanation of Changes
114 | 
115 | *   **`logprobs: false`**: The DeepSeek R1 model, when accessed via OpenRouter, sometimes sends `logprobs` in a format (or with missing sub-fields like `content` as an array) that causes Zod validation errors in the Vercel AI SDK. Disabling `logprobs` altogether avoids this issue.
116 | *   **`extractReasoningMiddleware` with `startWithReasoning: false` (default)**: While `startWithReasoning: true` might seem logical for a model that uses reasoning tags, it can be too strict. If the model outputs any leading characters (even whitespace) before the `<think>` tag, it can cause errors. The default `false` is more robust as it searches for the tag within the stream.
117 | *   **System Prompt**: DeepSeek R1 requires explicit guidance on how to structure its output. The prompt:
118 |     `"Please provide your reasoning within <think> tags. After closing the </think> tag, provide your final answer directly without any other special tags."`
119 |     ensures that:
120 |     *   Reasoning is wrapped in `<think>...</think>` and captured by `message.reasoning`.
121 |     *   The final answer is provided as plain text immediately after, becoming `message.content`, which can be directly rendered by the UI without issues from unhandled tags like `<answer>`.
122 | 
123 | By implementing these configurations, DeepSeek R1 can be used effectively with OpenRouter and the Vercel AI SDK, providing both its reasoning process and the final answer in a usable format. 
```

docs/feature_plan_rename_chat_title_sidebar.md
```
1 | # Feature Plan: Rename Chat Title in Sidebar
2 | 
3 | ## Overview
4 | Enable users to rename the title of a chat directly from the sidebar. This feature will improve chat organization and user experience by allowing custom, meaningful chat names.
5 | 
6 | ---
7 | 
8 | ## 1. UI/UX Changes
9 | 
10 | ### Sidebar
11 | - [x] Add an edit (pencil) icon or make the chat title clickable in the sidebar chat list. (Implemented with a pencil icon on hover)
12 | - [x] On click, replace the chat title with an input field pre-filled with the current title.
13 | - [x] Show save (checkmark) and cancel (X) icons/buttons next to the input.
14 | - [x] On save, update the title in the sidebar and persist the change.
15 | - [x] On cancel or blur, revert to the original title. (Blur and Escape key revert)
16 | - [x] Show loading indicator or disable input while saving. (Input disabled, loader on save button)
17 | - [x] Optionally, show error feedback if renaming fails. (Implemented via toasts)
18 | 
19 | ### Accessibility
20 | - [x] Ensure input is focusable and accessible via keyboard. (Enter/Escape for save/cancel)
21 | - [x] Provide appropriate ARIA labels for edit/save/cancel actions.
22 | 
23 | ---
24 | 
25 | ## 2. State Management
26 | - [x] Track which chat (if any) is currently being edited in the sidebar state. (`editingChatId` in `ChatSidebar.tsx`)
27 | - [x] Store the temporary input value for the chat being edited. (`editingChatTitle` in `ChatSidebar.tsx`)
28 | - [x] Handle optimistic UI updates: update the title immediately, revert if API call fails. (Handled in `useChats.ts` hook)
29 | 
30 | ---
31 | 
32 | ## 3. Backend/API Changes
33 | 
34 | ### API Endpoint
35 | - [x] Add or update an endpoint to allow renaming a chat (e.g., `PATCH /api/chats/[id]` or similar). (Implemented: `PATCH /api/chats/[id]`)
36 | - [x] Request body: `{ title: string }`
37 | - [x] Response: updated chat object or success status.
38 | - [x] Validate input (e.g., non-empty, reasonable length). (Non-empty, max 255 chars)
39 | - [x] Ensure only authorized users can rename their own chats.
40 | 
41 | ### Database
42 | - [x] Ensure the chat table/model has a `title` field that can be updated. (API updates `title` and `updatedAt`)
43 | 
44 | ---
45 | 
46 | ## 4. Frontend Integration
47 | - [x] Update sidebar chat list component to support edit mode per chat. (`ChatSidebar.tsx`)
48 | - [x] Add event handlers for edit, save, and cancel actions.
49 | - [x] Call the API to persist the new title. (Via `updateChatTitle` in `useChats.ts`)
50 | - [x] Update local state/store on success, handle errors gracefully. (Handled in `useChats.ts`)
51 | 
52 | ---
53 | 
54 | ## 5. Testing
55 | - Unit tests for sidebar component logic (edit, save, cancel, error handling).
56 | - Integration tests for API endpoint (authorization, validation, success, failure).
57 | - Manual/automated UI tests for user flow and accessibility.
58 | 
59 | ---
60 | 
61 | ## 6. Optional Enhancements
62 | - Allow renaming from the main chat view as well.
63 | - Support undo/redo for title changes.
64 | - Show a tooltip or helper text for the edit action.
65 | 
66 | ---
67 | 
68 | ## 7. Rollout & Documentation
69 | - Update user documentation/help to describe the new feature.
70 | - Announce the feature in release notes or changelog. 
```

docs/mcp_fetch_server_sse_deployment_plan.md
```
1 | # Implementation Plan: MCP Fetch Server as SSE Endpoint
2 | 
3 | ## 1. **Understand the MCP Fetch Server**
4 | - Review the [MCP fetch server source code](https://github.com/modelcontextprotocol/servers/tree/main/src/fetch) to understand its requirements, configuration, and capabilities.
5 | - The fetch server is designed to act as a bridge between MCP clients and remote LLMs or APIs, exposing them via the MCP protocol.
6 | 
7 | ## 2. **Prerequisites**
8 | - Node.js (LTS version recommended)
9 | - `pnpm` or `npm` for package management
10 | - Access to the MCP fetch server codebase (clone or install via npm if published)
11 | - (Optional) Cloudflare account if deploying via Cloudflare Workers (see [Cloudflare blog](https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/))
12 | 
13 | ## 3. **Setup the MCP Fetch Server Locally**
14 | 1. **Clone the repository:**
15 |    ```bash
16 |    git clone https://github.com/modelcontextprotocol/servers.git
17 |    cd servers/src/fetch
18 |    ```
19 | 2. **Install dependencies:**
20 |    ```bash
21 |    pnpm install # or npm install
22 |    ```
23 | 3. **Configure the server:**
24 |    - Create a configuration file (e.g., `config.json` or `.env`) specifying the remote LLM endpoints, API keys, and any required MCP options.
25 |    - Reference the [MCP documentation](https://modelcontextprotocol.io/llms-full.txt) for supported features and configuration examples.
26 | 
27 | ## 4. **Expose as an SSE Endpoint**
28 | - The MCP protocol supports multiple transports; for SSE (Server-Sent Events), ensure the fetch server is configured to listen on HTTP and stream responses using the SSE format.
29 | - If the server does not natively support SSE, implement a thin HTTP wrapper that:
30 |   - Accepts incoming MCP requests
31 |   - Forwards them to the fetch server (via stdio or HTTP)
32 |   - Streams responses back to the client using SSE headers (`Content-Type: text/event-stream`)
33 | - Example Node.js SSE handler:
34 |   ```js
35 |   res.setHeader('Content-Type', 'text/event-stream');
36 |   res.setHeader('Cache-Control', 'no-cache');
37 |   res.setHeader('Connection', 'keep-alive');
38 |   // Stream MCP responses as events
39 |   ```
40 | 
41 | ## 5. **Deployment**
42 | - **Local/VM:**
43 |   - Run the server on a public IP or behind a reverse proxy (e.g., Nginx) with HTTPS.
44 | - **Cloudflare Workers:**
45 |   - Package the server as a Worker or use [Cloudflare's MCP Worker template](https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/).
46 |   - Deploy using `wrangler` CLI.
47 | - **Other Cloud Providers:**
48 |   - Deploy as a container (Docker) or serverless function as needed.
49 | 
50 | ## 6. **Integration with MCP Clients**
51 | - Reference the [MCP client compatibility matrix](https://modelcontextprotocol.io/llms-full.txt) to select/test with compatible clients (e.g., Claude Desktop, Continue, VS Code Copilot, etc.).
52 | - Configure the client to point to your SSE endpoint (URL and any required authentication).
53 | 
54 | ## 7. **Testing and Debugging**
55 | - Use the [MCP Inspector tool](https://github.com/modelcontextprotocol/inspector) for local testing:
56 |   ```bash
57 |   npx @modelcontextprotocol/inspector --server http://localhost:PORT
58 |   ```
59 | - Monitor logs for errors and protocol compliance (see [logging best practices](https://modelcontextprotocol.io/llms-full.txt)).
60 | 
61 | ## 8. **Security and Environment**
62 | - Use environment variables for secrets (API keys, etc.).
63 | - Restrict access to the endpoint (IP allowlist, authentication, etc.).
64 | - Sanitize logs to avoid leaking sensitive data.
65 | 
66 | ## 9. **References**
67 | - [MCP fetch server source](https://github.com/modelcontextprotocol/servers/tree/main/src/fetch)
68 | - [MCP client/server feature matrix](https://modelcontextprotocol.io/llms-full.txt)
69 | - [Cloudflare blog: Remote MCP servers](https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/)
70 | - [MCP Inspector tool](https://github.com/modelcontextprotocol/inspector)
71 | 
72 | ---
73 | **Next Steps:**
74 | - Decide on deployment target (local, VM, Cloudflare, etc.)
75 | - Prepare configuration for your target LLM/API
76 | - Implement or adapt SSE wrapper if needed
77 | - Test with MCP Inspector and compatible clients 
78 | 
79 | # Cloudflare Deployment Focus: MCP Fetch Server as SSE Endpoint
80 | 
81 | ## 1. Do You Need to Download the Fetch Repo?
82 | - **Not always required.**
83 |   - If the MCP fetch server is published as an npm package (check [npmjs.com](https://www.npmjs.com/) for `@modelcontextprotocol/fetch` or similar), you can install it directly in your Cloudflare Worker project using `npm install` or `pnpm add`.
84 |   - If not published, you must clone or copy the relevant code from the [fetch server repo](https://github.com/modelcontextprotocol/servers/tree/main/src/fetch) into your Worker project.
85 |   - **Check the repo's README or package.json for publish status.**
86 | 
87 | ## 2. Using GitHub Packages or Templates for Cloudflare Workers
88 | - **Cloudflare Worker Templates:**
89 |   - The [Cloudflare blog](https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/) and [MCP documentation](https://modelcontextprotocol.io/llms-full.txt) recommend using a Worker template or starter project for MCP servers.
90 |   - There may be official or community templates for MCP Workers. Search GitHub for `modelcontextprotocol cloudflare worker` or similar keywords.
91 |   - Example: `npx create-cloudflare@latest` to scaffold a Worker, then add MCP fetch server logic.
92 | - **Converting Existing Repos:**
93 |   - If you have an existing Node.js MCP server, you may need to:
94 |     - Refactor code to be compatible with the Cloudflare Workers runtime (no Node.js APIs, use Web APIs only).
95 |     - Bundle dependencies using a tool like [esbuild](https://esbuild.github.io/) or [wrangler](https://developers.cloudflare.com/workers/wrangler/).
96 |     - Move configuration and secrets to Cloudflare environment variables.
97 |   - There is no "automatic" converter, but many repos provide a `worker` or `cloudflare` subdirectory or branch for this purpose.
98 | 
99 | ## 3. Steps for Cloudflare Worker Deployment
100 | 1. **Scaffold a Worker project:**
101 |    ```bash
102 |    npx create-cloudflare@latest
103 |    cd <your-worker>
104 |    pnpm install # or npm install
105 |    ```
106 | 2. **Add MCP Fetch Server Logic:**
107 |    - If available as a package: `pnpm add @modelcontextprotocol/fetch`
108 |    - Otherwise, copy necessary files from the fetch repo.
109 | 3. **Implement SSE Endpoint:**
110 |    - Use the [Cloudflare Workers Streams API](https://developers.cloudflare.com/workers/runtime-apis/streams/) to implement SSE.
111 |    - Set headers: `Content-Type: text/event-stream`, etc.
112 | 4. **Configure wrangler.toml:**
113 |    - Set environment variables, routes, and build commands as needed.
114 | 5. **Deploy:**
115 |    ```bash
116 |    npx wrangler deploy
117 |    ```
118 | 6. **Test with MCP Inspector and clients.**
119 | 
120 | ## 4. References
121 | - [Cloudflare blog: Remote MCP servers](https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/)
122 | - [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
123 | - [MCP fetch server source](https://github.com/modelcontextprotocol/servers/tree/main/src/fetch)
124 | - [MCP Inspector tool](https://github.com/modelcontextprotocol/inspector)
125 | 
126 | ---
127 | **Summary:**
128 | - You do **not** always need to download the fetch repo if an npm package exists.
129 | - There are no "automatic" converters, but templates and manual adaptation are common.
130 | - Focus on using Worker-compatible code and follow Cloudflare's deployment best practices. 
```

docs/mem0ai_integration_plan.md
```
1 | # Implementation Plan: Integrating Mem0AI (mem0) into the Chat-Bot App
2 | 
3 | ## 1. Objectives
4 | - Add persistent, contextual memory to the chat-bot so it can remember user interactions and personalize future responses.
5 | - Leverage Mem0AI's modular memory layer for scalable, extensible memory management.
6 | 
7 | ## 2. High-Level Architecture
8 | - **Mem0AI as Memory Layer:** Use Mem0AI as a service or library to handle memory operations (add, search, get, delete) for chat sessions.
9 | - **Integration Points:**
10 |   - When a user sends a message, store the interaction in Mem0.
11 |   - When generating a response, retrieve relevant memories from Mem0 to provide context.
12 |   - Optionally, use advanced features like entity/relationship tracking or contradiction resolution.
13 | 
14 | ## 3. Integration Steps
15 | 
16 | ### 3.1. Integration Mode
17 | - **TypeScript SDK:**
18 |   - We will use Mem0AI's TypeScript SDK directly in the Next.js app (API routes or server components).
19 | 
20 | ### 3.2. LLM Provider
21 | - **OpenRouter:**
22 |   - Use OpenRouter as the LLM provider for generating responses and memory processing.
23 |   - Configure Mem0AI to use OpenRouter endpoints and API keys.
24 | 
25 | ### 3.3. Vector Store & Embedding Provider
26 | - **Pinecone (Serverless):**
27 |   - Use Pinecone as both the vector store and embedding provider, leveraging its built-in OpenAI embedding integration.
28 |   - This allows you to send raw text to Pinecone, which will handle embedding generation and vector storage in a single API call.
29 |   - **Pros:** Simplifies architecture, reduces API calls, managed scaling, no need to manage separate embedding service.
30 |   - **Cons:** Usage-based pricing, managed service only.
31 | 
32 | ### 3.4. Install Dependencies
33 | - Add Mem0AI TypeScript SDK to the project:
34 |   - `npm install @mem0ai/mem0` (or the correct package name from the docs)
35 | - Add Pinecone client library:
36 |   - `npm install @pinecone-database/pinecone`
37 | 
38 | ### 3.5. Configure Mem0AI
39 | - Create a configuration file or environment variables for:
40 |   - LLM provider: OpenRouter endpoint and API key
41 |   - Vector store & embedding: Pinecone API key, environment, and index name
42 | - Example: `mem0.config.ts` or extend `.env.local`
43 | 
44 | ### 3.6. Integrate with Chat API
45 | - **On Message Send:**
46 |   - After a user sends a message, call `Memory.add()` to store the message and any relevant metadata. Mem0AI will use Pinecone to generate embeddings and store vectors.
47 | - **On Message Generation:**
48 |   - Before generating a bot response, call `Memory.search()` with the current context/query to retrieve relevant past memories from Pinecone.
49 |   - Use retrieved memories to augment the prompt for the LLM.
50 | - **On Chat Load:**
51 |   - Optionally, fetch a summary or key memories for the chat session.
52 | 
53 | ### 3.7. Advanced Features (Optional)
54 | - **Entity/Relationship Tracking:** Use Mem0's graph memory features to track entities and their relationships across conversations.
55 | - **Contradiction Resolution:** Use LLM-based memory processing to resolve conflicting information.
56 | 
57 | ## 4. Development Steps
58 | 1. **Research and Prototype:**
59 |    - Review Mem0AI TypeScript SDK documentation and examples.
60 |    - Prototype basic memory add/search in a test script or isolated API route.
61 | 2. **Dependency Installation:**
62 |    - Add Mem0AI SDK and Pinecone client library.
63 | 3. **Configuration:**
64 |    - Set up config files and environment variables for Mem0AI, OpenRouter, and Pinecone.
65 | 4. **API Integration:**
66 |    - Update chat API routes (`app/api/chat/`, `app/api/chats/[id]/`) to call Mem0AI methods at appropriate points.
67 |    - Ensure error handling and fallbacks if memory service is unavailable.
68 | 5. **Prompt Augmentation:**
69 |    - Update LLM prompt construction to include retrieved memories/context.
70 | 6. **Testing:**
71 |    - Write unit/integration tests for memory operations.
72 |    - Test with real chat sessions to verify memory persistence and retrieval.
73 | 7. **Performance and Scaling:**
74 |    - Monitor latency and optimize Pinecone queries as needed.
75 |    - Consider background processing for heavy memory operations.
76 | 8. **Documentation:**
77 |    - Document memory integration points and configuration for future maintainers.
78 | 
79 | ## 5. Future Enhancements
80 | - Add UI for users to view/edit their chat history/memories.
81 | - Support for multiple memory backends (switchable via config).
82 | - Analytics on memory usage and retrieval effectiveness.
83 | 
84 | ## 6. References
85 | - [Mem0AI DeepWiki](https://deepwiki.com/mem0ai/mem0)
86 | - [Mem0AI GitHub](https://github.com/mem0ai/mem0)
87 | - [Mem0AI SDK Docs](https://github.com/mem0ai/mem0#readme)
88 | - [Pinecone Docs](https://docs.pinecone.io/) 
```

docs/model-picker-infinite-loop-debugging.md
```
1 | # Debugging: Model Picker Infinite Update Loop in React Context
2 | 
3 | ## Error Observed
4 | 
5 | ```
6 | Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
7 | ```
8 | 
9 | ## Root Cause
10 | 
11 | - The error was caused by an infinite update loop between a consumer component (`components/chat.tsx`) and the context provider (`lib/context/model-context.tsx`).
12 | - The consumer was reading from `localStorage` and calling `setSelectedModel` in a `useEffect`, while the context provider was also managing the same state and syncing with `localStorage`.
13 | - This caused repeated state updates and re-renders, resulting in the React error above.
14 | 
15 | ## Failed Fixes
16 | 
17 | ### 1. Guarding setSelectedModel in Context
18 | - **Attempt:** Only call `setSelectedModelState` if the new model is different from the current one.
19 | - **Result:** Did not resolve the issue, as the consumer effect still caused repeated updates.
20 | 
21 | ### 2. Removing setSelectedModel from useEffect in Consumer (Partial)
22 | - **Attempt:** Remove the effect, but it was not fully removed in all places, so the loop persisted.
23 | - **Result:** Error continued until the effect was completely removed.
24 | 
25 | ## Correct Fix
26 | 
27 | - **Solution:** Remove the `useEffect` in `components/chat.tsx` that set `selectedModel` from `localStorage`.
28 | - **Reason:** The context provider (`lib/context/model-context.tsx`) is solely responsible for initializing and syncing the model state with `localStorage`. Consumers should only use the context value and setter, not re-read or re-set from `localStorage`.
29 | - **Result:** Infinite update loop resolved. Model picker works as expected.
30 | 
31 | ## Key Takeaways
32 | 
33 | - **State should have a single source of truth.**
34 | - **Do not duplicate state logic between context and consumers.**
35 | - **Let context providers handle initialization and persistence.**
36 | 
37 | ---
38 | 
39 | **Documented by AI after debugging session, 2024.** 
```

docs/openrouter_web_search_integration_plan.md
```
1 | # Implementation Plan: Adding OpenRouter Web Search Feature
2 | 
3 | ## Overview
4 | Add web search capabilities to the chat application using OpenRouter's web search feature, allowing the AI to ground responses in real-time web data.
5 | 
6 | ## 1. API Integration Updates
7 | 
8 | ### 1.1 OpenRouter Client Enhancement
9 | - Update OpenRouter client configuration in `ai/providers.ts` to include web search options:
10 |   ```typescript
11 |   const openrouterClient = createOpenRouter({
12 |     apiKey: getApiKey('OPENROUTER_API_KEY'),
13 |     headers: {
14 |       'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
15 |       'X-Title': process.env.NEXT_PUBLIC_APP_TITLE,
16 |     },
17 |     plugins: [{ id: "web" }] // Add web search plugin
18 |   });
19 |   ```
20 | 
21 | ### 1.2 API Client Updates
22 | - Create new types for web search options and annotations
23 | - Update API request structure to include web search parameters
24 | - Add support for handling URL citations in responses
25 | 
26 | ## 2. Database Schema Updates
27 | 
28 | ### 2.1 Message Table Updates
29 | - Add columns for storing web search metadata:
30 |   - `has_web_search`: boolean
31 |   - `web_search_context_size`: enum ('low', 'medium', 'high')
32 |   - `citations`: jsonb array for storing URL citations
33 | 
34 | ### 2.2 Chat Settings
35 | - Add web search preferences to chat settings:
36 |   - Default search context size
37 |   - Maximum results per query
38 |   - Enable/disable web search
39 | 
40 | ## 3. Backend Implementation
41 | 
42 | ### 3.1 API Route Updates
43 | Location: `app/api/chat/route.ts`
44 | - Add web search options to request processing
45 | - Implement citation handling
46 | - Add error handling for web search-specific cases
47 | 
48 | ### 3.2 Chat Processing
49 | - Update chat processing logic to:
50 |   - Include web search parameters
51 |   - Process and store citations
52 |   - Handle pricing implications
53 | 
54 | ## 4. Frontend Implementation
55 | 
56 | ### 4.1 Chat Interface Updates
57 | - Add UI components to existing chat interface:
58 |   - Web search toggle in message input area
59 |   - Search context size selector in settings
60 |   - Citation display in message bubbles
61 | - Style citations with proper linking
62 | 
63 | ### 4.2 Settings Panel
64 | - Extend existing API Key Manager with web search options:
65 |   - Default search behavior
66 |   - Context size preferences
67 |   - Citation display preferences
68 | 
69 | ### 4.3 Message Display
70 | - Update existing message components to handle citations:
71 |   - Add citation component with hover states
72 |   - Implement citation highlighting
73 |   - Add citation count badges
74 | 
75 | ## 5. User Experience
76 | 
77 | ### 5.1 Visual Feedback
78 | - Add loading states for web searches
79 | - Display search context size indicator
80 | - Show citation count badges
81 | 
82 | ### 5.2 Error Handling
83 | - Implement user-friendly error messages for:
84 |   - API rate limits
85 |   - Search context size limits
86 |   - Citation processing errors
87 | 
88 | ## 6. Testing
89 | 
90 | ### 6.1 Unit Tests
91 | - Test web search parameter validation
92 | - Test citation processing
93 | - Test database operations
94 | 
95 | ### 6.2 Integration Tests
96 | - Test complete chat flow with web search
97 | - Test error scenarios
98 | - Test citation display and linking
99 | 
100 | ### 6.3 E2E Tests
101 | - Test full user journey with web search
102 | - Test settings configuration
103 | - Test citation interaction
104 | 
105 | ## 7. Documentation
106 | 
107 | ### 7.1 Code Documentation
108 | - Add JSDoc comments for new functions
109 | - Document web search configuration options
110 | - Document citation handling
111 | 
112 | ### 7.2 User Documentation
113 | - Create user guide for web search features
114 | - Document pricing implications
115 | - Provide best practices
116 | 
117 | ## 8. Deployment
118 | 
119 | ### 8.1 Migration Plan
120 | - Create database migrations
121 | - Plan staged rollout
122 | - Configure monitoring
123 | 
124 | ### 8.2 Monitoring
125 | - Add metrics for:
126 |   - Web search usage
127 |   - Citation clicks
128 |   - Error rates
129 |   - Response times
130 | 
131 | ## Timeline Estimate
132 | 1. API Integration Updates: 1 day
133 | 2. Database Updates: 1 day
134 | 3. Backend Implementation: 2 days
135 | 4. Frontend Implementation: 3 days
136 | 5. Testing: 2 days
137 | 6. Documentation: 1 day
138 | 7. Deployment: 1 day
139 | 
140 | Total: ~11 working days
141 | 
142 | ## Dependencies
143 | - Existing OpenRouter integration (✓ Already implemented)
144 | - Database migration permissions
145 | - Frontend UI component library (✓ Already using shadcn/ui)
146 | 
147 | ## Risks and Mitigation
148 | 1. Cost Management
149 |    - Implement usage limits
150 |    - Add cost monitoring
151 |    - Create alert thresholds
152 | 
153 | 2. Performance
154 |    - Cache common searches
155 |    - Optimize citation storage
156 |    - Implement lazy loading
157 | 
158 | 3. Rate Limiting
159 |    - Add request queuing
160 |    - Implement backoff strategy
161 |    - Monitor usage patterns
162 | 
163 | ## Success Metrics
164 | 1. User Engagement
165 |    - Web search usage rate
166 |    - Citation click-through rate
167 |    - User feedback scores
168 | 
169 | 2. Performance
170 |    - Response time with web search
171 |    - Error rate
172 |    - Search relevance scores
173 | 
174 | 3. Business Impact
175 |    - Cost per chat
176 |    - User retention
177 |    - Feature adoption rate 
```

docs/polar-integration-plan.md
```
1 | # Polar Integration Plan for Next.js App with Better-Auth & Neon DB
2 | 
3 | ## Overview
4 | This document outlines a step-by-step plan to integrate [Polar](https://docs.polar.sh/introduction) into a Next.js application that uses [Better-Auth](https://docs.polar.sh/integrate/sdk/adapters/better-auth) for authentication and Neon DB for data storage. The plan also covers enabling [Usage-Based Billing](https://docs.polar.sh/features/usage-based-billing/introduction).
5 | 
6 | ---
7 | 
8 | ## 1. Preparation
9 | 
10 | ### 1.1. Polar Account & Organization
11 | - Sign up at [polar.sh](https://polar.sh/signup) and create an organization.
12 | - In the Polar dashboard, create an **Organization Access Token** and note it for environment configuration.
13 | 
14 | ### 1.2. Environment Variables
15 | - Add the following to your `.env.local`:
16 |   - `POLAR_ACCESS_TOKEN=...`
17 |   - `POLAR_WEBHOOK_SECRET=...` (after webhook setup)
18 |   - `SUCCESS_URL=...` (URL to redirect after successful checkout)
19 | 
20 | ---
21 | 
22 | ## 2. Install Dependencies
23 | - Install the required packages:
24 |   ```bash
25 |   pnpm install @polar-sh/nextjs zod better-auth @polar-sh/better-auth
26 |   ```
27 |   ([Next.js Adapter](https://docs.polar.sh/integrate/sdk/adapters/nextjs), [Better-Auth Adapter](https://docs.polar.sh/integrate/sdk/adapters/better-auth))
28 | 
29 | ---
30 | 
31 | ## 3. Integrate Polar with Better-Auth
32 | 
33 | ### 3.1. Configure Better-Auth Plugin
34 | - In your Better-Auth setup file (`lib/auth.ts`), add the Polar plugin:
35 |   - Import and instantiate the Polar SDK client with your access token.
36 |   - Configure the `polar` plugin within the `betterAuth` initialization.
37 |   - Enable automatic customer creation on signup (`createCustomerOnSignUp: true`).
38 |   - Enable the customer portal (`enableCustomerPortal: true`).
39 |   - Configure checkout:
40 |     - `enabled: true`
41 |     - Define `products` (array of product objects with `productId` and `slug`).
42 |     - Set `successUrl`.
43 |   - Configure webhooks:
44 |     - Provide `secret` (from `POLAR_WEBHOOK_SECRET`).
45 |     - Optionally, define specific `onPayload` handlers (e.g., `onSubscriptionCreated`, `onOrderCreated`).
46 | - Reference: [Better-Auth Adapter Docs](https://docs.polar.sh/integrate/sdk/adapters/better-auth)
47 | 
48 | ### 3.2. API Routes Provided by Plugin (via `app/api/auth/[...betterauth]/route.ts`)
49 | - The Polar Better-Auth plugin will expose its routes relative to your BetterAuth instance. Given the existing setup at `app/api/auth/[...betterauth]/route.ts`, the Polar routes will be:
50 |   - `GET /api/auth/checkout/:slug` — Redirect to Polar checkout
51 |   - `GET /api/auth/state` — Customer state (subscriptions, entitlements, etc.) for the authenticated user
52 |   - `GET /api/auth/portal` — Redirects to Polar Customer Portal for authenticated user
53 |   - `POST /api/auth/polar/webhooks` — Incoming webhooks (ensure this path is configured in your Polar Organization Settings)
54 | 
55 | ---
56 | 
57 | ## 4. Next.js API Route Integration (Standalone if needed)
58 | 
59 | While the Better-Auth plugin handles most cases, you might need dedicated API routes for more custom checkout or portal logic not covered by the plugin. The existing API structure is `app/api/<feature>/route.ts`.
60 | 
61 | ### 4.1. Checkout Handler (If not using Better-Auth plugin's checkout exclusively)
62 | - Create a route (e.g., `/app/api/checkout/polar/route.ts` or a more specific path if needed) using the Polar Next.js adapter:
63 |   ```typescript
64 |   import { Checkout } from "@polar-sh/nextjs";
65 |   export const GET = Checkout({
66 |     accessToken: process.env.POLAR_ACCESS_TOKEN,
67 |     successUrl: process.env.SUCCESS_URL,
68 |     server: "sandbox", // or 'production'
69 |   });
70 |   ```
71 | - [Reference](https://docs.polar.sh/integrate/sdk/adapters/nextjs)
72 | 
73 | ### 4.2. Customer Portal Handler (If not using Better-Auth plugin's portal exclusively)
74 | - Create a route (e.g., `/app/api/portal/polar/route.ts`) for the customer portal:
75 |   ```typescript
76 |   import { CustomerPortal } from "@polar-sh/nextjs";
77 |   export const GET = CustomerPortal({
78 |     accessToken: process.env.POLAR_ACCESS_TOKEN,
79 |     getCustomerId: (req) => { /* resolve Polar customer ID */ },
80 |     server: "sandbox",
81 |   });
82 |   ```
83 | 
84 | ### 4.3. Webhook Handler (If not using Better-Auth plugin's webhook handler)
85 | - Create a webhook endpoint (e.g., `/app/api/webhooks/polar/route.ts` to distinguish from the Better-Auth one, or if a separate handler is preferred):
86 |   ```typescript
87 |   import { Webhooks } from "@polar-sh/nextjs";
88 |   export const POST = Webhooks({
89 |     webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
90 |     onPayload: async (payload) => { /* handle events */ },
91 |   });
92 |   ```
93 | - [Reference](https://docs.polar.sh/integrate/sdk/adapters/nextjs)
94 | 
95 | ---
96 | 
97 | ## 5. Usage-Based Billing Integration
98 | 
99 | ### 5.1. Understand Usage-Based Billing
100 | - Review the [Usage-Based Billing Introduction](https://docs.polar.sh/features/usage-based-billing/introduction) to understand concepts like usage records, metered products, and reporting usage.
101 | 
102 | ### 5.2. Product Setup
103 | - In the Polar dashboard, create products with usage-based pricing models.
104 | - Note product IDs for use in your integration.
105 | 
106 | ### 5.3. Reporting Usage
107 | - Implement backend logic to report usage events to Polar via their API.
108 | - Ensure usage is tracked in your Neon DB and reported in near real-time or on a schedule.
109 | - Reference: [Usage-Based Billing Docs](https://docs.polar.sh/features/usage-based-billing/introduction)
110 | 
111 | ---
112 | 
113 | ## 6. Database (Neon DB) Considerations
114 | - Ensure user and customer records in Neon DB are linked to Polar customer IDs (externalId mapping).
115 | - Store usage events and billing history for auditing and reconciliation.
116 | 
117 | ---
118 | 
119 | ## 7. Testing & Sandbox
120 | - Use the `server: "sandbox"` option in all Polar SDK calls during development.
121 | - Test the full flow: signup, checkout, usage reporting, webhook handling, and customer portal.
122 | 
123 | ---
124 | 
125 | ## 8. Go Live
126 | - Switch `server` to `production` in all Polar SDK calls.
127 | - Update environment variables with production tokens and webhook secrets.
128 | - Monitor webhooks and billing events for correctness.
129 | 
130 | ---
131 | 
132 | ## References
133 | - [Polar Introduction](https://docs.polar.sh/introduction)
134 | - [Next.js Adapter](https://docs.polar.sh/integrate/sdk/adapters/nextjs)
135 | - [Better-Auth Adapter](https://docs.polar.sh/integrate/sdk/adapters/better-auth)
136 | - [Next.js Guide](https://docs.polar.sh/guides/nextjs)
137 | - [Usage-Based Billing](https://docs.polar.sh/features/usage-based-billing/introduction) 
```

docs/polar_external_id_integration_resolution.md
```
1 | # Resolving Polar external_id Integration with BetterAuth
2 | 
3 | ## 1. Problem Statement
4 | 
5 | The primary goal was to ensure that when a new user signs up for the application (initially via Google Sign-In), a corresponding customer record is created in Polar, and the application's internal user ID is stored as the `external_id` in the Polar customer record.
6 | 
7 | This was crucial to resolve errors like "Could not find Polar customer with external ID" which occurred when the application attempted to perform operations like fetching credit balances or reporting usage for users whose `external_id` was not known to Polar.
8 | 
9 | ## 2. Initial Approaches & Challenges
10 | 
11 | ### 2.1. Using `createCustomerOnSignUp` in Polar Plugin
12 | - The `@polar-sh/better-auth` plugin offers a `createCustomerOnSignUp: true` option.
13 | - Initial attempts might have used this, but direct control over the `externalId` and handling specific scenarios (like anonymous users vs. registered users) led to exploring custom hooks.
14 | 
15 | ### 2.2. Using `onAccountCreated` in Polar Plugin
16 | - The next approach involved setting `createCustomerOnSignUp: false` and leveraging the `onAccountCreated` hook provided within the `polarPlugin` configuration in `lib/auth.ts`.
17 | - The logic here was to explicitly call `polarClient.customers.create({ ... externalId: user.id })`.
18 | - **Challenge**: Through systematic logging, it was discovered that this `onAccountCreated` hook (and a similar one at the `socialProviders.google` level) was **not being triggered** for new users signing up via Google, especially when the anonymous user linking flow was involved. This meant the Polar customer creation logic was never executed.
19 | 
20 | ## 3. Identifying the Correct Hook for Execution
21 | 
22 | - **Observation**: While the `onAccountCreated` hooks were silent, detailed logging revealed that the `onLinkAccount` hook within the `anonymous` plugin (also configured in `lib/auth.ts`) *was* consistently firing after a new user successfully authenticated via Google and their temporary anonymous user record was linked to their new registered user record.
23 | - **Key Insight**: The `onLinkAccount` hook provides a `newUser` object, which contains `newUser.user` with all the necessary details for Polar customer creation: `id` (the application's user ID), `email`, and `name`.
24 | 
25 | ## 4. Solution Implemented
26 | 
27 | The core of the solution was to relocate the Polar customer creation and linking logic to a place where it was guaranteed to run with the correct user data.
28 | 
29 | ### 4.1. Moving Logic to `onLinkAccount`
30 | - The entire try-catch block responsible for Polar customer operations was moved from the (non-firing) `onAccountCreated` hook of the `polarPlugin` into the (verified firing) `onLinkAccount` hook of the `anonymous` plugin in `lib/auth.ts`.
31 | 
32 | ### 4.2. Logic within `onLinkAccount`
33 | The implemented logic for the `newUser.user` (referred to as `userForPolar` in the code) is as follows:
34 | 1.  **Log Processing**: Log that Polar customer processing is starting for the authenticated user, including their app ID and email.
35 | 2.  **Check for Existing by `externalId`**: Attempt to fetch an existing Polar customer using `polarClient.customers.getExternal({ externalId: userForPolar.id })`.
36 |     *   If found, log this and, as an optional step, verify if the email matches, offering a point to update the Polar customer's email if necessary (though `externalId` is the primary link).
37 | 3.  **Create if Not Found by `externalId`**:
38 |     *   If the `getExternal` call fails with a "ResourceNotFound" (or 404) error, it means no Polar customer is currently linked to this application `user.id`.
39 |     *   Log this and proceed to attempt creation: `polarClient.customers.create({ email: userForPolar.email, name: userForPolar.name, externalId: userForPolar.id })`.
40 |     *   If creation is successful, log the new Polar customer ID and the associated `externalId`.
41 | 4.  **Error Handling for Creation**:
42 |     *   If the `create` call itself fails, log the error. Crucially, this includes logging detailed API error responses from Polar.
43 | 
44 | ## 5. Handling Pre-existing Polar Customers (Email Conflict)
45 | 
46 | - **Scenario**: A test case involved a user (`brooksy4503@gmail.com`) who already existed as a customer in the Polar (Sandbox) dashboard by email, but *without* an `external_id` set that matched the application's `user.id`.
47 | - **Observed Behavior**: When the `onLinkAccount` logic attempted to `polarClient.customers.create()` for this user, Polar's API correctly returned an error: `{"detail":[{"loc":["body","email"],"msg":"A customer with this email address already exists.","type":"value_error"}]}`.
48 | - **Resolution for Test Case**: For the specific test account (`brooksy4503@gmail.com`), the resolution was to manually delete this customer from the Polar Sandbox dashboard. Upon the next sign-in to the application, the `onLinkAccount` logic treated it as a completely new user (from Polar's perspective) and successfully created the Polar customer with the correct `external_id`.
49 | - **General Implication**: This confirmed that Polar's `create` API does not automatically link/update an `external_id` if it finds an existing customer by email; it flags it as a conflict.
50 | - **Current State for Production**: Since it was determined that there were no other existing application users who also pre-existed in Polar in this unlinked state, a complex automated backfill logic (e.g., attempting to list Polar customers by email and then update with `externalId` if a conflict on create occurs) was not added to the `onLinkAccount` hook. The current implementation will log the "email already exists" error from Polar if such a case arises. If this becomes a more common scenario, this error logging will be the starting point for implementing a more sophisticated linking strategy within the `createError` block.
51 | 
52 | ## 6. Key Files Modified
53 | - `lib/auth.ts`: This file saw all the significant changes, specifically within the `plugins` array, moving logic to the `anonymous` plugin's `onLinkAccount` hook and effectively commenting out the non-operational `onAccountCreated` hook in the `polarPlugin`.
54 | 
55 | ## 7. Outcome
56 | - New users signing up via Google are now correctly having Polar customer records created.
57 | - The application's internal `user.id` is successfully stored as the `external_id` on these Polar customer records.
58 | - Subsequent operations like credit checking and usage reporting for these users function correctly, as the link via `externalId` is established.
59 | - The initial "Could not find Polar customer with external ID" errors have been resolved for new user flows and for test accounts that were reset/recreated. 
```

docs/uvx-mcp-server-issue.md
```
1 | # Handling `uvx` MCP Servers in `app/api/chat/route.ts`
2 | 
3 | This document describes an issue encountered when integrating MCP (Multi-Compute Protocol) servers configured to run via `uvx` within the chat API endpoint (`app/api/chat/route.ts`) and the solution implemented.
4 | 
5 | ## Problem
6 | 
7 | Stdio MCP servers configured in `mcp.json` (or similar) using `command: "uvx"` were failing to initialize correctly. The expected behavior of `uvx` is to download the specified package (e.g., `aci-mcp`) and execute it with the given arguments.
8 | 
9 | However, the `app/api/chat/route.ts` handler was encountering errors when trying to spawn the process:
10 | 
11 | - Initial attempts to directly spawn `uvx` or the target executable (e.g., `aci-mcp`) often resulted in "No such file or directory" errors, suggesting path issues or that the executable wasn't installed where the Node.js `spawn` function expected it.
12 | - Attempts to manually replicate `uvx` behavior by:
13 |     1. Transforming `uvx tool ...` to `python3 -m uv run tool ...` failed.
14 |     2. Manually installing the tool using `uv pip install tool` also failed, initially due to `uv` requiring a virtual environment or the `--system` flag, and even then, path issues might have persisted.
15 | 
16 | ## Root Cause
17 | 
18 | The primary issue was that the Node.js code in `app/api/chat/route.ts` was **intercepting the `uvx` command** and attempting to manually manage the installation and execution of the underlying tool. This manual process was overly complex and failed to correctly replicate the integrated download-and-run behavior of `uvx` itself, leading to various environment and path-related errors.
19 | 
20 | ## Solution
21 | 
22 | The successful solution involved simplifying the handler logic significantly:
23 | 
24 | 1.  **Detect `uvx`:** In `app/api/chat/route.ts`, check if `mcpServer.command === 'uvx'`.
25 | 2.  **Ensure `uv` is Installed:** Since `uvx` is distributed as part of `uv`, ensure `uv` is present in the environment where the Node.js server runs. This is done by running `pip3 install uv` via `spawn`.
26 | 3.  **Run `uvx` Directly:** **Crucially, do not modify `mcpServer.command` or `mcpServer.args`.** Allow the `StdioMCPTransport` constructor to receive the original command (`uvx`) and its arguments.
27 | 
28 | ```typescript
29 | // Inside the loop processing mcpServers in app/api/chat/route.ts
30 | 
31 | if (mcpServer.type === 'stdio') {
32 |   // ... (check for command/args)
33 | 
34 |   // Convert env array to object
35 |   // ...
36 | 
37 |   // Check for uvx pattern
38 |   if (mcpServer.command === 'uvx') {
39 |     // Ensure uv is installed, which provides uvx
40 |     console.log("Ensuring uv (for uvx) is installed...");
41 |     let uvInstalled = false;
42 |     const installUvSubprocess = spawn('pip3', ['install', 'uv']);
43 |     // ... (await subprocess completion and check for errors)
44 | 
45 |     if (!uvInstalled) {
46 |       console.warn("Skipping uvx command: Failed to ensure uv installation.");
47 |       continue;
48 |     }
49 | 
50 |     // Do NOT modify the command or args. Let StdioMCPTransport run uvx directly.
51 |     console.log(`Proceeding to spawn uvx command directly.`);
52 | 
53 |   } else if (mcpServer.command.includes('python3')) {
54 |     // Handle python3 -m package installation using uv pip install --system
55 |     // ...
56 |   }
57 | 
58 |   // Log the final command and args before spawning for stdio
59 |   console.log(`Spawning StdioMCPTransport with command: '${mcpServer.command}' and args:`, mcpServer.args);
60 | 
61 |   transport = new StdioMCPTransport({
62 |     command: mcpServer.command,
63 |     args: mcpServer.args,
64 |     env: Object.keys(env).length > 0 ? env : undefined
65 |   });
66 | 
67 | } else if (mcpServer.type === 'sse') {
68 |   // ... (handle SSE)
69 | }
70 | 
71 | // ... (create MCP client with transport)
72 | ```
73 | 
74 | ## Why it Works
75 | 
76 | By ensuring `uv` is installed and then allowing `StdioMCPTransport` to execute `uvx` directly, we leverage `uvx`'s intended functionality. `uvx` correctly handles:
77 | 
78 | - Downloading the specified package (e.g., `aci-mcp`) into its own cache.
79 | - Executing the package with the provided arguments.
80 | - Managing the necessary environment setup transparently.
81 | 
82 | This avoids the complexities and pitfalls of manually managing Python package installation and execution paths within the Node.js environment. 
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
13 | import { LogOut, User, Settings } from "lucide-react";
14 | import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
15 | 
16 | export function UserAccountMenu() {
17 |   const { data: session } = useSession();
18 | 
19 |   if (!session?.user) return null;
20 | 
21 |   const handleSignOut = async () => {
22 |     try {
23 |       await signOut({});
24 |     } catch (error) {
25 |       console.error("Sign-out error:", error);
26 |     }
27 |   };
28 | 
29 |   const userInitials = session.user.name
30 |     ? session.user.name
31 |         .split(' ')
32 |         .map(name => name[0])
33 |         .join('')
34 |         .toUpperCase()
35 |     : session.user.email?.[0]?.toUpperCase() || 'U';
36 | 
37 |   return (
38 |     <DropdownMenu>
39 |       <DropdownMenuTrigger asChild>
40 |         <Button variant="ghost" className="relative h-8 w-8 rounded-full">
41 |           <Avatar className="h-8 w-8">
42 |             <AvatarImage 
43 |               src={session.user.image || ''} 
44 |               alt={session.user.name || 'User'} 
45 |             />
46 |             <AvatarFallback>{userInitials}</AvatarFallback>
47 |           </Avatar>
48 |         </Button>
49 |       </DropdownMenuTrigger>
50 |       <DropdownMenuContent className="w-56" align="end" forceMount>
51 |         <DropdownMenuLabel className="font-normal">
52 |           <div className="flex flex-col space-y-1">
53 |             <p className="text-sm font-medium leading-none">{session.user.name}</p>
54 |             <p className="text-xs leading-none text-muted-foreground">
55 |               {session.user.email}
56 |             </p>
57 |           </div>
58 |         </DropdownMenuLabel>
59 |         <DropdownMenuSeparator />
60 |         <DropdownMenuItem onClick={handleSignOut}>
61 |           <LogOut className="mr-2 h-4 w-4" />
62 |           <span>Log out</span>
63 |         </DropdownMenuItem>
64 |       </DropdownMenuContent>
65 |     </DropdownMenu>
66 |   );
67 | } 
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
16 |   url: string;
17 |   type: 'sse' | 'stdio';
18 |   command?: string;
19 |   args?: string[];
20 |   env?: KeyValuePair[];
21 |   headers?: KeyValuePair[];
22 |   description?: string;
23 | }
24 | 
25 | // Type for processed MCP server config for API
26 | export interface MCPServerApi {
27 |   type: 'sse' | 'stdio';
28 |   url: string;
29 |   command?: string;
30 |   args?: string[];
31 |   env?: KeyValuePair[];
32 |   headers?: KeyValuePair[];
33 | }
34 | 
35 | interface MCPContextType {
36 |   mcpServers: MCPServer[];
37 |   setMcpServers: (servers: MCPServer[]) => void;
38 |   selectedMcpServers: string[];
39 |   setSelectedMcpServers: (serverIds: string[]) => void;
40 |   mcpServersForApi: MCPServerApi[];
41 | }
42 | 
43 | const MCPContext = createContext<MCPContextType | undefined>(undefined);
44 | 
45 | export function MCPProvider(props: { children: React.ReactNode }) {
46 |   const { children } = props;
47 |   const [mcpServers, setMcpServers] = useLocalStorage<MCPServer[]>(
48 |     STORAGE_KEYS.MCP_SERVERS, 
49 |     []
50 |   );
51 |   const [selectedMcpServers, setSelectedMcpServers] = useLocalStorage<string[]>(
52 |     STORAGE_KEYS.SELECTED_MCP_SERVERS, 
53 |     []
54 |   );
55 |   const [mcpServersForApi, setMcpServersForApi] = useState<MCPServerApi[]>([]);
56 | 
57 |   // Process MCP servers for API consumption whenever server data changes
58 |   useEffect(() => {
59 |     if (!selectedMcpServers.length) {
60 |       setMcpServersForApi([]);
61 |       return;
62 |     }
63 |     
64 |     const processedServers: MCPServerApi[] = selectedMcpServers
65 |       .map(id => mcpServers.find(server => server.id === id))
66 |       .filter((server): server is MCPServer => Boolean(server))
67 |       .map(server => ({
68 |         type: server.type,
69 |         url: server.url,
70 |         command: server.command,
71 |         args: server.args,
72 |         env: server.env,
73 |         headers: server.headers
74 |       }));
75 |     
76 |     setMcpServersForApi(processedServers);
77 |   }, [mcpServers, selectedMcpServers]);
78 | 
79 |   return (
80 |     <MCPContext.Provider 
81 |       value={{ 
82 |         mcpServers, 
83 |         setMcpServers, 
84 |         selectedMcpServers, 
85 |         setSelectedMcpServers,
86 |         mcpServersForApi 
87 |       }}
88 |     >
89 |       {children}
90 |     </MCPContext.Provider>
91 |   );
92 | }
93 | 
94 | export function useMCP() {
95 |   const context = useContext(MCPContext);
96 |   if (context === undefined) {
97 |     throw new Error("useMCP must be used within an MCPProvider");
98 |   }
99 |   return context;
100 | } 
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

app/api/chat/route.ts
```
1 | import { model, type modelID } from "@/ai/providers";
2 | import { createOpenRouter } from "@openrouter/ai-sdk-provider";
3 | import { getApiKey } from "@/ai/providers";
4 | import { streamText, type UIMessage, type LanguageModelResponseMetadata, type Message } from "ai";
5 | import { appendResponseMessages } from 'ai';
6 | import { saveChat, saveMessages, convertToDBMessages } from '@/lib/chat-store';
7 | import { nanoid } from 'nanoid';
8 | import { db } from '@/lib/db';
9 | import { chats } from '@/lib/db/schema';
10 | import { eq, and } from 'drizzle-orm';
11 | import { trackTokenUsage, hasEnoughCredits } from '@/lib/tokenCounter';
12 | import { auth, checkMessageLimit } from '@/lib/auth';
13 | 
14 | import { experimental_createMCPClient as createMCPClient, MCPTransport } from 'ai';
15 | import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';
16 | import { spawn } from "child_process";
17 | 
18 | // Allow streaming responses up to 60 seconds on Hobby plan
19 | export const maxDuration = 60;
20 | 
21 | interface KeyValuePair {
22 |   key: string;
23 |   value: string;
24 | }
25 | 
26 | interface MCPServerConfig {
27 |   url: string;
28 |   type: 'sse' | 'stdio';
29 |   command?: string;
30 |   args?: string[];
31 |   env?: KeyValuePair[];
32 |   headers?: KeyValuePair[];
33 | }
34 | 
35 | interface WebSearchOptions {
36 |   enabled: boolean;
37 |   contextSize: 'low' | 'medium' | 'high';
38 | }
39 | 
40 | interface UrlCitation {
41 |   url: string;
42 |   title: string;
43 |   content?: string;
44 |   start_index: number;
45 |   end_index: number;
46 | }
47 | 
48 | interface Annotation {
49 |   type: string;
50 |   url_citation: UrlCitation;
51 | }
52 | 
53 | interface OpenRouterResponse extends LanguageModelResponseMetadata {
54 |   readonly messages: Message[];
55 |   annotations?: Annotation[];
56 |   body?: unknown;
57 | }
58 | 
59 | export async function POST(req: Request) {
60 |   const {
61 |     messages,
62 |     chatId,
63 |     selectedModel,
64 |     mcpServers: initialMcpServers = [],
65 |     webSearch = { enabled: false, contextSize: 'medium' }
66 |   }: {
67 |     messages: UIMessage[];
68 |     chatId?: string;
69 |     selectedModel: modelID;
70 |     mcpServers?: MCPServerConfig[];
71 |     webSearch?: WebSearchOptions;
72 |   } = await req.json();
73 | 
74 |   let mcpServers = initialMcpServers;
75 | 
76 |   // Disable MCP servers for DeepSeek R1, Grok 3 Beta, Grok 3 Mini Beta, and Grok 3 Mini Beta (High Reasoning)
77 |   if (
78 |     selectedModel === "openrouter/deepseek/deepseek-r1" ||
79 |     selectedModel === "openrouter/x-ai/grok-3-beta" ||
80 |     selectedModel === "openrouter/x-ai/grok-3-mini-beta" ||
81 |     selectedModel === "openrouter/x-ai/grok-3-mini-beta-reasoning-high"
82 |   ) {
83 |     mcpServers = [];
84 |   }
85 | 
86 |   // Get the authenticated session (including anonymous users)
87 |   const session = await auth.api.getSession({ headers: req.headers });
88 | 
89 |   // If no session exists, return error
90 |   if (!session || !session.user || !session.user.id) {
91 |     return new Response(
92 |       JSON.stringify({ error: "Authentication required" }),
93 |       { status: 401, headers: { "Content-Type": "application/json" } }
94 |     );
95 |   }
96 | 
97 |   const userId = session.user.id;
98 |   const isAnonymous = (session.user as any).isAnonymous === true;
99 | 
100 |   // Try to get the Polar customer ID from session
101 |   const polarCustomerId: string | undefined = (session.user as any)?.polarCustomerId ||
102 |     (session.user as any)?.metadata?.polarCustomerId;
103 | 
104 |   // Estimate ~30 tokens per message as a basic check
105 |   const estimatedTokens = 30;
106 | 
107 |   // 1. Check if user has sufficient credits (if they have a Polar account)
108 |   let hasCredits = false;
109 |   try {
110 |     // Check credits using both the external ID (userId) and legacy polarCustomerId
111 |     // Pass isAnonymous flag to skip Polar checks for anonymous users
112 |     hasCredits = await hasEnoughCredits(polarCustomerId, userId, estimatedTokens, isAnonymous);
113 |   } catch (error) {
114 |     // Log but continue - don't block users if credit check fails
115 |     console.error('Error checking credits:', error);
116 |   }
117 | 
118 |   // 2. If user has credits, allow request (skip daily message limit)
119 |   if (!isAnonymous && hasCredits) {
120 |     // proceed
121 |   } else {
122 |     // 3. Otherwise, check message limit based on authentication status
123 |     const limitStatus = await checkMessageLimit(userId, isAnonymous);
124 |     if (limitStatus.hasReachedLimit) {
125 |       return new Response(
126 |         JSON.stringify({
127 |           error: "Message limit reached",
128 |           message: `You've reached your daily limit of ${limitStatus.limit} messages. ${isAnonymous ? "Sign in with Google to get more messages." : "Purchase credits to continue."}`,
129 |           limit: limitStatus.limit,
130 |           remaining: limitStatus.remaining
131 |         }),
132 |         { status: 429, headers: { "Content-Type": "application/json" } }
133 |       );
134 |     }
135 |   }
136 | 
137 |   const id = chatId || nanoid();
138 | 
139 |   // Check if chat already exists for the given ID
140 |   // If not, we'll create it in onFinish
141 |   let isNewChat = false;
142 |   if (chatId) {
143 |     try {
144 |       const existingChat = await db.query.chats.findFirst({
145 |         where: and(
146 |           eq(chats.id, chatId),
147 |           eq(chats.userId, userId)
148 |         )
149 |       });
150 |       isNewChat = !existingChat;
151 |     } catch (error) {
152 |       console.error("Error checking for existing chat:", error);
153 |       // Continue anyway, we'll create the chat in onFinish
154 |       isNewChat = true;
155 |     }
156 |   } else {
157 |     // No ID provided, definitely new
158 |     isNewChat = true;
159 |   }
160 | 
161 |   // Prepare messages for the model
162 |   const modelMessages: UIMessage[] = [...messages];
163 | 
164 |   if (
165 |     selectedModel === "openrouter/deepseek/deepseek-r1" ||
166 |     selectedModel === "openrouter/x-ai/grok-3-beta" ||
167 |     selectedModel === "openrouter/x-ai/grok-3-mini-beta" ||
168 |     selectedModel === "openrouter/x-ai/grok-3-mini-beta-reasoning-high" ||
169 |     selectedModel === "openrouter/qwen/qwq-32b"
170 |   ) {
171 |     const systemContent = "Please provide your reasoning within <think> tags. After closing the </think> tag, provide your final answer directly without any other special tags.";
172 |     modelMessages.unshift({
173 |       role: "system",
174 |       id: nanoid(), // Ensure a unique ID for the system message
175 |       content: systemContent, // Add top-level content
176 |       parts: [{ type: "text", text: systemContent }]
177 |     });
178 |   }
179 | 
180 |   // Pre-emptively save the chat if it's new
181 |   if (isNewChat) {
182 |     try {
183 |       await saveChat({
184 |         id, // The generated or provided chatId
185 |         userId,
186 |         messages: [], // Start with empty messages, will be updated in onFinish
187 |       });
188 |       console.log(`[Chat ${id}] Pre-emptively created chat record.`);
189 |     } catch (error) {
190 |       console.error(`[Chat ${id}] Error pre-emptively creating chat:`, error);
191 |       // Decide if we should bail out or continue. For now, let's continue
192 |       // but the onFinish save might fail later if the chat wasn't created.
193 |     }
194 |   }
195 | 
196 |   // Initialize tools
197 |   let tools = {};
198 |   const mcpClients: any[] = [];
199 | 
200 |   // Process each MCP server configuration
201 |   for (const mcpServer of mcpServers) {
202 |     try {
203 |       // Create appropriate transport based on type
204 |       let transport: MCPTransport | { type: 'sse', url: string, headers?: Record<string, string> };
205 | 
206 |       if (mcpServer.type === 'sse') {
207 |         // Convert headers array to object for SSE transport
208 |         const headers: Record<string, string> = {};
209 |         if (mcpServer.headers && mcpServer.headers.length > 0) {
210 |           mcpServer.headers.forEach(header => {
211 |             if (header.key) headers[header.key] = header.value || '';
212 |           });
213 |         }
214 | 
215 |         transport = {
216 |           type: 'sse' as const,
217 |           url: mcpServer.url,
218 |           headers: Object.keys(headers).length > 0 ? headers : undefined
219 |         };
220 |       } else if (mcpServer.type === 'stdio') {
221 |         // For stdio transport, we need command and args
222 |         if (!mcpServer.command || !mcpServer.args || mcpServer.args.length === 0) {
223 |           console.warn("Skipping stdio MCP server due to missing command or args");
224 |           continue;
225 |         }
226 | 
227 |         // Convert env array to object for stdio transport
228 |         const env: Record<string, string> = {};
229 |         if (mcpServer.env && mcpServer.env.length > 0) {
230 |           mcpServer.env.forEach(envVar => {
231 |             if (envVar.key) env[envVar.key] = envVar.value || '';
232 |           });
233 |         }
234 | 
235 |         // Check for uvx pattern
236 |         if (mcpServer.command === 'uvx') {
237 |           // Ensure uv is installed, which provides uvx
238 |           console.log("Ensuring uv (for uvx) is installed...");
239 |           let uvInstalled = false;
240 |           const installUvSubprocess = spawn('pip3', ['install', 'uv']);
241 |           // Capture output for debugging
242 |           let uvInstallStdout = '';
243 |           let uvInstallStderr = '';
244 |           installUvSubprocess.stdout.on('data', (data) => { uvInstallStdout += data.toString(); });
245 |           installUvSubprocess.stderr.on('data', (data) => { uvInstallStderr += data.toString(); });
246 | 
247 |           await new Promise<void>((resolve) => {
248 |             installUvSubprocess.on('close', (code: number) => {
249 |               if (code !== 0) {
250 |                 console.error(`Failed to install uv using pip3: exit code ${code}`);
251 |                 console.error('pip3 stdout:', uvInstallStdout);
252 |                 console.error('pip3 stderr:', uvInstallStderr);
253 |               } else {
254 |                 console.log("uv installed or already present.");
255 |                 if (uvInstallStdout) console.log('pip3 stdout:', uvInstallStdout);
256 |                 if (uvInstallStderr) console.log('pip3 stderr:', uvInstallStderr);
257 |                 uvInstalled = true;
258 |               }
259 |               resolve();
260 |             });
261 |             installUvSubprocess.on('error', (err) => {
262 |               console.error("Error spawning pip3 to install uv:", err);
263 |               resolve(); // Resolve anyway
264 |             });
265 |           });
266 | 
267 |           if (!uvInstalled) {
268 |             console.warn("Skipping uvx command: Failed to ensure uv installation.");
269 |             continue;
270 |           }
271 | 
272 |           // Do NOT modify the command or args. Let StdioMCPTransport run uvx directly.
273 |           console.log(`Proceeding to spawn uvx command directly.`);
274 |         }
275 |         // If python is passed in the command, install the python package mentioned in args after -m
276 |         else if (mcpServer.command.includes('python3')) {
277 |           const packageName = mcpServer.args[mcpServer.args.indexOf('-m') + 1];
278 |           console.log("Attempting to install python package using uv:", packageName);
279 |           // Use uv to install the package
280 |           const subprocess = spawn('uv', ['pip', 'install', packageName]);
281 |           subprocess.on('close', (code: number) => {
282 |             if (code !== 0) {
283 |               console.error(`Failed to install python package ${packageName} using uv: ${code}`);
284 |             } else {
285 |               console.log(`Successfully installed python package ${packageName} using uv.`);
286 |             }
287 |           });
288 |           // wait for the subprocess to finish
289 |           await new Promise<void>((resolve) => {
290 |             subprocess.on('close', () => resolve());
291 |             subprocess.on('error', (err) => {
292 |               console.error(`Error spawning uv command for package ${packageName}:`, err);
293 |               resolve(); // Resolve anyway to avoid hanging
294 |             });
295 |           });
296 |         }
297 | 
298 |         // Log the final command and args before spawning for stdio
299 |         console.log(`Spawning StdioMCPTransport with command: '${mcpServer.command}' and args:`, mcpServer.args);
300 | 
301 |         transport = new StdioMCPTransport({
302 |           command: mcpServer.command,
303 |           args: mcpServer.args,
304 |           env: Object.keys(env).length > 0 ? env : undefined
305 |         });
306 |       } else {
307 |         console.warn(`Skipping MCP server with unsupported transport type: ${mcpServer.type}`);
308 |         continue;
309 |       }
310 | 
311 |       const mcpClient = await createMCPClient({ transport });
312 |       mcpClients.push(mcpClient);
313 | 
314 |       const mcptools = await mcpClient.tools();
315 | 
316 |       console.log(`MCP tools from ${mcpServer.type} transport:`, Object.keys(mcptools));
317 | 
318 |       // Add MCP tools to tools object
319 |       tools = { ...tools, ...mcptools };
320 |     } catch (error) {
321 |       console.error("Failed to initialize MCP client:", error);
322 |       // Continue with other servers instead of failing the entire request
323 |     }
324 |   }
325 | 
326 |   // Register cleanup for all clients
327 |   if (mcpClients.length > 0) {
328 |     req.signal.addEventListener('abort', async () => {
329 |       for (const client of mcpClients) {
330 |         try {
331 |           await client.close();
332 |         } catch (error) {
333 |           console.error("Error closing MCP client:", error);
334 |         }
335 |       }
336 |     });
337 |   }
338 | 
339 |   console.log("messages", messages);
340 |   console.log("parts", messages.map(m => m.parts.map(p => p)));
341 | 
342 |   // Log web search status
343 |   if (webSearch.enabled) {
344 |     console.log(`[Web Search] ENABLED with context size: ${webSearch.contextSize}`);
345 |   } else {
346 |     console.log(`[Web Search] DISABLED`);
347 |   }
348 | 
349 |   // Add web search tool if enabled
350 |   if (webSearch.enabled) {
351 |     const apiKey = getApiKey('OPENROUTER_API_KEY');
352 |     if (!apiKey) {
353 |       console.error("[Web Search] OPENROUTER_API_KEY is missing. Web search will be disabled.");
354 |     } else {
355 |       const openrouterClient: any = createOpenRouter({ apiKey }); // Treat as any for the check
356 |       if (openrouterClient && typeof openrouterClient.toolFactory === 'object' && openrouterClient.toolFactory !== null && typeof openrouterClient.toolFactory.searchWeb === 'function') {
357 |         tools = {
358 |           ...tools,
359 |           web_search: openrouterClient.toolFactory.searchWeb({
360 |             contextSize: webSearch.contextSize,
361 |           }),
362 |         };
363 |         console.log("[Web Search] Tool configured successfully.");
364 |       } else {
365 |         console.error("[Web Search] Failed to initialize openrouterClient or toolFactory.searchWeb is not a function. Web search will be disabled. Check API key and provider library.");
366 |       }
367 |     }
368 |   }
369 | 
370 |   let modelInstance;
371 |   if (webSearch.enabled && selectedModel.startsWith("openrouter/")) {
372 |     // Remove 'openrouter/' prefix for the OpenRouter client
373 |     const openrouterModelId = selectedModel.replace("openrouter/", "") + ":online";
374 |     const openrouterClient = createOpenRouter({
375 |       apiKey: getApiKey('OPENROUTER_API_KEY'),
376 |       headers: {
377 |         'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com/',
378 |         'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'ChatLima',
379 |       }
380 |     });
381 |     // For DeepSeek R1, Grok 3 Beta, Grok 3 Mini Beta, Grok 3 Mini Beta (High Reasoning), and Qwen 32B, explicitly disable logprobs
382 |     if (
383 |       selectedModel === "openrouter/deepseek/deepseek-r1" ||
384 |       selectedModel === "openrouter/x-ai/grok-3-beta" ||
385 |       selectedModel === "openrouter/x-ai/grok-3-mini-beta" ||
386 |       selectedModel === "openrouter/x-ai/grok-3-mini-beta-reasoning-high" ||
387 |       selectedModel === "openrouter/qwen/qwq-32b"
388 |     ) {
389 |       modelInstance = openrouterClient(openrouterModelId, { logprobs: false });
390 |     } else {
391 |       modelInstance = openrouterClient(openrouterModelId);
392 |     }
393 |   } else {
394 |     modelInstance = model.languageModel(selectedModel);
395 |   }
396 | 
397 |   const modelOptions = {
398 |     ...(webSearch.enabled && {
399 |       web_search_options: {
400 |         search_context_size: webSearch.contextSize
401 |       }
402 |     })
403 |   };
404 | 
405 |   // Construct the payload for OpenRouter
406 |   const openRouterPayload = {
407 |     model: modelInstance,
408 |     system: `You are a helpful AI assistant. Today's date is ${new Date().toISOString().split('T')[0]}.
409 | 
410 |     You have access to external tools provided by connected servers. These tools can perform specific actions like running code, searching databases, or accessing external services.
411 | 
412 |     ${webSearch.enabled ? `
413 |     ## Web Search Enabled:
414 |     You have web search capabilities enabled. When you use web search:
415 |     1. Cite your sources using markdown links
416 |     2. Use the format [domain.com](full-url) for citations
417 |     3. Only cite reliable and relevant sources
418 |     4. Integrate the information naturally into your responses
419 |     ` : ''}
420 | 
421 |     ## How to Respond:
422 |     1.  **Analyze the Request:** Understand what the user is asking.
423 |     2.  **Use Tools When Necessary:** If an external tool provides the best way to answer (e.g., fetching specific data, performing calculations, interacting with services), select the most relevant tool(s) and use them. You can use multiple tools in sequence. Clearly indicate when you are using a tool and what it's doing.
424 |     3.  **Use Your Own Abilities:** For requests involving brainstorming, explanation, writing, summarization, analysis, or general knowledge, rely on your own reasoning and knowledge base. You don't need to force the use of an external tool if it's not suitable or required for these tasks.
425 |     4.  **Respond Clearly:** Provide your answer directly when using your own abilities. If using tools, explain the steps taken and present the results clearly.
426 |     5.  **Handle Limitations:** If you cannot answer fully (due to lack of information, missing tools, or capability limits), explain the limitation clearly. Don't just say "I don't know" if you can provide partial information or explain *why* you can't answer. If relevant tools seem to be missing, you can mention that the user could potentially add them via the server configuration.
427 | 
428 |     ## Response Format:
429 |     - Use Markdown for formatting.
430 |     - Base your response on the results from any tools used, or on your own reasoning and knowledge.
431 |     `,
432 |     messages: modelMessages,
433 |     tools,
434 |     maxSteps: 20,
435 |     providerOptions: {
436 |       google: {
437 |         thinkingConfig: {
438 |           thinkingBudget: 2048,
439 |         },
440 |       },
441 |       anthropic: {
442 |         thinking: {
443 |           type: 'enabled',
444 |           budgetTokens: 12000
445 |         },
446 |       },
447 |       openrouter: modelOptions
448 |     },
449 |     onError: (error: any) => {
450 |       console.error(JSON.stringify(error, null, 2));
451 |     },
452 |     async onFinish(event: any) {
453 |       // Minimal fix: cast event.response to OpenRouterResponse
454 |       const response = event.response as OpenRouterResponse;
455 |       const allMessages = appendResponseMessages({
456 |         messages: modelMessages,
457 |         responseMessages: response.messages as any, // Cast to any to bypass type error
458 |       });
459 | 
460 |       // Extract citations from response messages
461 |       const processedMessages = allMessages.map(msg => {
462 |         if (msg.role === 'assistant' && (response.annotations?.length)) {
463 |           const citations = response.annotations
464 |             .filter((a: Annotation) => a.type === 'url_citation')
465 |             .map((c: Annotation) => ({
466 |               url: c.url_citation.url,
467 |               title: c.url_citation.title,
468 |               content: c.url_citation.content,
469 |               startIndex: c.url_citation.start_index,
470 |               endIndex: c.url_citation.end_index
471 |             }));
472 | 
473 |           // Add citations to message parts if they exist
474 |           if (citations.length > 0 && msg.parts) {
475 |             msg.parts = (msg.parts as any[]).map(part => ({
476 |               ...part,
477 |               citations
478 |             }));
479 |           }
480 |         }
481 |         return msg;
482 |       });
483 | 
484 |       // Update the chat with the full message history
485 |       // Note: saveChat here acts as an upsert based on how it's likely implemented
486 |       await saveChat({
487 |         id,
488 |         userId,
489 |         messages: processedMessages as any, // Cast to any to bypass type error
490 |       });
491 | 
492 |       const dbMessages = (convertToDBMessages(processedMessages as any, id) as any[]).map(msg => ({
493 |         ...msg,
494 |         hasWebSearch: webSearch.enabled,
495 |         webSearchContextSize: webSearch.contextSize
496 |       }));
497 | 
498 |       await saveMessages({ messages: dbMessages });
499 | 
500 |       // Extract token usage from response - OpenRouter may provide it in different formats
501 |       let completionTokens = 0;
502 | 
503 |       // Access response with type assertion to avoid TypeScript errors
504 |       // The actual structure may vary by provider
505 |       const typedResponse = response as any;
506 | 
507 |       // Try to extract tokens from different possible response structures
508 |       if (typedResponse.usage?.completion_tokens) {
509 |         completionTokens = typedResponse.usage.completion_tokens;
510 |       } else if (typedResponse.usage?.output_tokens) {
511 |         completionTokens = typedResponse.usage.output_tokens;
512 |       } else {
513 |         // Estimate based on last message content length if available
514 |         const lastMessage = typedResponse.messages?.[typedResponse.messages.length - 1];
515 |         if (lastMessage?.content) {
516 |           // Rough estimate: 1 token ≈ 4 characters
517 |           completionTokens = Math.ceil(lastMessage.content.length / 4);
518 |         } else if (typeof typedResponse.content === 'string') {
519 |           completionTokens = Math.ceil(typedResponse.content.length / 4);
520 |         } else {
521 |           // Default minimum to track something
522 |           completionTokens = 10;
523 |         }
524 |       }
525 | 
526 |       // Existing code for tracking tokens
527 |       let polarCustomerId: string | undefined;
528 | 
529 |       // Get from session
530 |       try {
531 |         const session = await auth.api.getSession({ headers: req.headers });
532 | 
533 |         // Try to get from session first
534 |         polarCustomerId = (session?.user as any)?.polarCustomerId ||
535 |           (session?.user as any)?.metadata?.polarCustomerId;
536 |       } catch (error) {
537 |         console.warn('Failed to get session for Polar customer ID:', error);
538 |       }
539 | 
540 |       // Track token usage
541 |       if (completionTokens > 0) {
542 |         try {
543 |           // Get isAnonymous status from session if available
544 |           let isAnonymous = false;
545 |           try {
546 |             isAnonymous = (session?.user as any)?.isAnonymous === true;
547 |           } catch (error) {
548 |             console.warn('Could not determine if user is anonymous, assuming not anonymous');
549 |           }
550 | 
551 |           // Pass isAnonymous flag to skip Polar reporting for anonymous users
552 |           await trackTokenUsage(userId, polarCustomerId, completionTokens, isAnonymous);
553 |           console.log(`${isAnonymous ? 'Tracked' : 'Reported'} ${completionTokens} tokens for user ${userId}${isAnonymous ? ' (anonymous)' : ' to Polar'}`);
554 |         } catch (error) {
555 |           console.error('Failed to track token usage:', error);
556 |           // Don't break the response flow if tracking fails
557 |         }
558 |       }
559 |     }
560 |   };
561 | 
562 |   console.log("OpenRouter API Payload:", JSON.stringify(openRouterPayload, null, 2));
563 | 
564 |   // Now call streamText as before
565 |   const result = streamText(openRouterPayload);
566 | 
567 |   result.consumeStream()
568 |   return result.toDataStreamResponse({
569 |     sendReasoning: true,
570 |     getErrorMessage: (error) => {
571 |       if (error instanceof Error) {
572 |         if (error.message.includes("Rate limit")) {
573 |           return "Rate limit exceeded. Please try again later.";
574 |         }
575 |       }
576 |       console.error(error);
577 |       return "An error occurred.";
578 |     },
579 |   });
580 | }
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
28 |           <Link href="/chat">
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
32 |             hasSubscription: (session.user as any)?.metadata?.hasSubscription || false
33 |         });
34 |     } catch (error) {
35 |         console.error('Error getting message usage:', error);
36 |         return NextResponse.json(
37 |             { error: 'Failed to get message usage' },
38 |             { status: 500 }
39 |         );
40 |     }
41 | } 
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

</current_codebase>
