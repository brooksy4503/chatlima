"use client";

import { createAuthClient } from "better-auth/react"; // Use the React adapter
import { anonymousClient } from "better-auth/client/plugins";

export const { signIn, signOut, useSession } = createAuthClient({
    plugins: [
        anonymousClient()
    ]
}); 