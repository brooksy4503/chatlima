# Implementation Plan: Integrating Better-Auth with Google Login (OAuth) Only

## 1. Overview
Integrate [Better-Auth](https://www.better-auth.com/) into the Next.js project, using only Google Login (OAuth) for authentication. Email/password auth will be disabled. The project uses Drizzle ORM, which is natively supported by Better-Auth.

---

## 2. Installation
- Add Better-Auth and the Google OAuth plugin:
  - `pnpm add better-auth @better-auth/google`
- Ensure Drizzle ORM and your database driver (e.g., `pg` for Postgres) are installed.

---

## 3. Environment Variables
- Add the following to `.env.local`:
  - `DATABASE_URL` (for Drizzle connection)
  - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (from Google Cloud Console)
  - Any other required Better-Auth env vars (e.g., `AUTH_SECRET`)

---

## 4. Drizzle Schema
- Run Better-Auth's schema generator if available, or manually ensure tables for users, sessions, accounts, etc., are present.
- If using auto-generation, follow Better-Auth's docs for Drizzle integration.

---

## 5. Better-Auth Configuration
- Create an `auth.ts` (or `auth/index.ts`) in a suitable location (e.g., `lib/auth/` or `app/api/auth/`):
  - Import and configure Better-Auth with Drizzle Pool and Google plugin.
  - **Disable email/password** by not enabling that plugin.
  - Example:
    ```ts
    import { betterAuth } from 'better-auth';
    import { google } from '@better-auth/google';
    import { drizzle } from 'drizzle-orm';
    import { Pool } from 'pg';
    
    export const auth = betterAuth({
      database: new Pool({ connectionString: process.env.DATABASE_URL }),
      plugins: [
        google({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
      ],
      // No emailAndPassword config
    });
    ```

---

## 6. API Routes
- Expose Better-Auth endpoints via Next.js API routes (e.g., `/api/auth/*`).
- Use Better-Auth's built-in handlers or wrap them as needed for Next.js route handlers.
- Ensure callback URLs match those set in Google Cloud Console.

---

## 7. Frontend Integration
- Create a login page (e.g., `/login`):
  - Add a "Sign in with Google" button.
  - On click, redirect to the Better-Auth Google login endpoint.
- Optionally, use Better-Auth's React hooks/components if available, or implement custom logic using fetch/redirects.

---

## 8. Session Management
- Use Better-Auth's session management utilities to get the current user/session in API routes and React components.
- Protect pages/routes by checking for a valid session.

---

## 9. Testing & Validation
- Test the full login flow:
  - User clicks "Sign in with Google"
  - OAuth consent screen
  - Redirect back to app, session created
  - User data available in session
- Test logout and session expiration.

---

## 10. Optional: Customization & Plugins
- Explore additional Better-Auth plugins for features like organizations, 2FA, etc., if needed in the future.

---

## 11. References
- [Better-Auth Docs](https://www.better-auth.com/)
- [Google OAuth Setup](https://console.cloud.google.com/apis/credentials)

---

## 12. Notes
- No email/password fields or flows will be present in the UI or backend.
- All user authentication is via Google OAuth only.
- Ensure all callback URLs and environment variables are set correctly for production and development.

---

## 13. Migrating Local Chats to Authenticated User

### Problem
Currently, chat data is associated with a locally stored user ID (e.g., in localStorage) before authentication. After Google sign-in, chats should be available under the authenticated user's account.

### Solution Overview
- On sign-in, detect if there are any locally stored chats (and the local user ID).
- After successful authentication, associate (migrate/merge) these chats with the authenticated user's ID in the database.
- Ensure this process is secure and idempotent (does not duplicate chats).

### Implementation Steps

#### 1. Identify Local Chats
- On the client, before or during sign-in, check for any chats associated with the local (anonymous) user ID in localStorage or IndexedDB.

#### 2. Backend API for Migration
- Create an API endpoint (e.g., `/api/chats/migrate`) that:
  - Accepts the local user ID and the authenticated user's ID (from session).
  - Moves or merges all chats from the local user to the authenticated user in the database.
  - Handles potential conflicts (e.g., duplicate chat IDs).

#### 3. Trigger Migration After Sign-In
- After Google sign-in and session establishment:
  - If a local user ID exists, call the migration API with the local user ID.
  - On success, remove the local user ID and local chats from the client.

#### 4. Update Chat Fetching Logic
- Ensure all chat fetching on the client uses the authenticated user's ID after sign-in.
- For unauthenticated users, continue to use the local user ID.

#### 5. Security Considerations
- Only allow migration if the request is authenticated and the local user ID matches the client's stored value.
- Prevent users from migrating other users' chats.

#### 6. Optional: Merge Strategy
- If chat IDs may overlap, decide whether to merge, overwrite, or keep both (with new IDs).
- Optionally, notify the user if any chats could not be migrated due to conflicts.

### Example Flow
1. User visits site, creates chats as anonymous (local user ID).
2. User signs in with Google.
3. App detects local chats, calls `/api/chats/migrate` with local user ID.
4. Backend reassigns chats to authenticated user.
5. User sees all previous chats after sign-in. 