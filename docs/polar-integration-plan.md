# Polar Integration Plan for Next.js App with Better-Auth & Neon DB

## Overview
This document outlines a step-by-step plan to integrate [Polar](https://docs.polar.sh/introduction) into a Next.js application that uses [Better-Auth](https://docs.polar.sh/integrate/sdk/adapters/better-auth) for authentication and Neon DB for data storage. The plan also covers enabling [Usage-Based Billing](https://docs.polar.sh/features/usage-based-billing/introduction).

---

## 1. Preparation

### 1.1. Polar Account & Organization
- Sign up at [polar.sh](https://polar.sh/signup) and create an organization.
- In the Polar dashboard, create an **Organization Access Token** and note it for environment configuration.

### 1.2. Environment Variables
- Add the following to your `.env.local`:
  - `POLAR_ACCESS_TOKEN=...`
  - `POLAR_WEBHOOK_SECRET=...` (after webhook setup)
  - `SUCCESS_URL=...` (URL to redirect after successful checkout)

---

## 2. Install Dependencies
- Install the required packages:
  ```bash
  pnpm install @polar-sh/nextjs zod better-auth @polar-sh/better-auth
  ```
  ([Next.js Adapter](https://docs.polar.sh/integrate/sdk/adapters/nextjs), [Better-Auth Adapter](https://docs.polar.sh/integrate/sdk/adapters/better-auth))

---

## 3. Integrate Polar with Better-Auth

### 3.1. Configure Better-Auth Plugin
- In your Better-Auth setup file (`lib/auth.ts`), add the Polar plugin:
  - Import and instantiate the Polar SDK client with your access token.
  - Configure the `polar` plugin within the `betterAuth` initialization.
  - Enable automatic customer creation on signup (`createCustomerOnSignUp: true`).
  - Enable the customer portal (`enableCustomerPortal: true`).
  - Configure checkout:
    - `enabled: true`
    - Define `products` (array of product objects with `productId` and `slug`).
    - Set `successUrl`.
  - Configure webhooks:
    - Provide `secret` (from `POLAR_WEBHOOK_SECRET`).
    - Optionally, define specific `onPayload` handlers (e.g., `onSubscriptionCreated`, `onOrderCreated`).
- Reference: [Better-Auth Adapter Docs](https://docs.polar.sh/integrate/sdk/adapters/better-auth)

### 3.2. API Routes Provided by Plugin (via `app/api/auth/[...betterauth]/route.ts`)
- The Polar Better-Auth plugin will expose its routes relative to your BetterAuth instance. Given the existing setup at `app/api/auth/[...betterauth]/route.ts`, the Polar routes will be:
  - `GET /api/auth/checkout/:slug` — Redirect to Polar checkout
  - `GET /api/auth/state` — Customer state (subscriptions, entitlements, etc.) for the authenticated user
  - `GET /api/auth/portal` — Redirects to Polar Customer Portal for authenticated user
  - `POST /api/auth/polar/webhooks` — Incoming webhooks (ensure this path is configured in your Polar Organization Settings)

---

## 4. Next.js API Route Integration (Standalone if needed)

While the Better-Auth plugin handles most cases, you might need dedicated API routes for more custom checkout or portal logic not covered by the plugin. The existing API structure is `app/api/<feature>/route.ts`.

### 4.1. Checkout Handler (If not using Better-Auth plugin's checkout exclusively)
- Create a route (e.g., `/app/api/checkout/polar/route.ts` or a more specific path if needed) using the Polar Next.js adapter:
  ```typescript
  import { Checkout } from "@polar-sh/nextjs";
  export const GET = Checkout({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    successUrl: process.env.SUCCESS_URL,
    server: "sandbox", // or 'production'
  });
  ```
- [Reference](https://docs.polar.sh/integrate/sdk/adapters/nextjs)

### 4.2. Customer Portal Handler (If not using Better-Auth plugin's portal exclusively)
- Create a route (e.g., `/app/api/portal/polar/route.ts`) for the customer portal:
  ```typescript
  import { CustomerPortal } from "@polar-sh/nextjs";
  export const GET = CustomerPortal({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    getCustomerId: (req) => { /* resolve Polar customer ID */ },
    server: "sandbox",
  });
  ```

### 4.3. Webhook Handler (If not using Better-Auth plugin's webhook handler)
- Create a webhook endpoint (e.g., `/app/api/webhooks/polar/route.ts` to distinguish from the Better-Auth one, or if a separate handler is preferred):
  ```typescript
  import { Webhooks } from "@polar-sh/nextjs";
  export const POST = Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
    onPayload: async (payload) => { /* handle events */ },
  });
  ```
- [Reference](https://docs.polar.sh/integrate/sdk/adapters/nextjs)

---

## 5. Usage-Based Billing Integration

### 5.1. Understand Usage-Based Billing
- Review the [Usage-Based Billing Introduction](https://docs.polar.sh/features/usage-based-billing/introduction) to understand concepts like usage records, metered products, and reporting usage.

### 5.2. Product Setup
- In the Polar dashboard, create products with usage-based pricing models.
- Note product IDs for use in your integration.

### 5.3. Reporting Usage
- Implement backend logic to report usage events to Polar via their API.
- Ensure usage is tracked in your Neon DB and reported in near real-time or on a schedule.
- Reference: [Usage-Based Billing Docs](https://docs.polar.sh/features/usage-based-billing/introduction)

---

## 6. Database (Neon DB) Considerations
- Ensure user and customer records in Neon DB are linked to Polar customer IDs (externalId mapping).
- Store usage events and billing history for auditing and reconciliation.

---

## 7. Testing & Sandbox
- Use the `server: "sandbox"` option in all Polar SDK calls during development.
- Test the full flow: signup, checkout, usage reporting, webhook handling, and customer portal.

---

## 8. Go Live
- Switch `server` to `production` in all Polar SDK calls.
- Update environment variables with production tokens and webhook secrets.
- Monitor webhooks and billing events for correctness.

---

## References
- [Polar Introduction](https://docs.polar.sh/introduction)
- [Next.js Adapter](https://docs.polar.sh/integrate/sdk/adapters/nextjs)
- [Better-Auth Adapter](https://docs.polar.sh/integrate/sdk/adapters/better-auth)
- [Next.js Guide](https://docs.polar.sh/guides/nextjs)
- [Usage-Based Billing](https://docs.polar.sh/features/usage-based-billing/introduction) 