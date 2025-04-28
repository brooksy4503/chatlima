"use client";

import { createAuthClient } from "better-auth/react"; // Use the React adapter

export const { signIn, signOut, useSession } = createAuthClient(); 