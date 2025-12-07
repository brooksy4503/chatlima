"use client";

import { createAuthClient } from "better-auth/react"; // Use the React adapter
import { anonymousClient } from "better-auth/client/plugins";

export const { signIn, signOut, useSession } = createAuthClient({
    baseURL: typeof window !== 'undefined' ? window.location.origin : undefined,
    fetchOptions: {
        credentials: "include",
        cache: "default", // Use default browser caching
    },
    plugins: [
        anonymousClient()
    ],
    // Prevent excessive session refetching that causes re-render loops
    session: {
        disableDefaultFetching: false,
        refetchOnWindowFocus: false,
    },
}); 