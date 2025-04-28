import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db/index'; // Assuming your Drizzle instance is exported from here
import * as schema from './db/schema'; // Assuming your full Drizzle schema is exported here

if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing GOOGLE_CLIENT_SECRET environment variable');
}
if (!process.env.AUTH_SECRET) {
    throw new Error('Missing AUTH_SECRET environment variable');
}

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        // Explicitly pass the schema tables using the standard names
        schema: {
            user: schema.users,       // Use the exported const 'users'
            account: schema.accounts, // Use the exported const 'accounts'
            session: schema.sessions, // Use the exported const 'sessions'
            verification: schema.verification // Updated from verificationTokens
        },
        // We might need to explicitly pass the schema tables here later
        // schema: { ...schema } 
        // Or potentially use this flag if table names are standard plurals
        // usePlural: true
    }),
    secret: process.env.AUTH_SECRET,
    // Email/Password is disabled by default if not configured
    // emailAndPassword: { enabled: false } // Explicitly not enabling this
    sessionMaxAge: 30 * 24 * 60 * 60, // Moved maxAge to top level (30 days)
    // Add session field mapping based on documentation
    session: {
        fields: {
            token: "sessionToken" // Map internal token to sessionToken column
            // If your expires column was different, you'd map expiresAt here too
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // Optionally define scopes if needed beyond the defaults (openid, email, profile)
            // scopes: ['...'],
        },
    },
    // Removed nested session block
    // session: {
    //   strategy: 'database',
    //   maxAge: 30 * 24 * 60 * 60,
    // }
});

// Removed problematic type for now
// import type { BetterAuthSession } from 'better-auth';
// export type Session = BetterAuthSession; 