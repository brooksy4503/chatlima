"use client";

// Re-export the centralized auth hook to maintain backward compatibility
export { useAuth } from '@/lib/context/auth-context';

// Also export the sign-in and sign-out functions for components that need them directly
export { signIn, signOut } from '@/lib/auth-client';