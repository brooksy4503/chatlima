"use client";

import { useEffect, useState } from 'react';
import { signIn, useSession } from '@/lib/auth-client';

export function AnonymousAuth() {
  const { data: session, isPending } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only try to sign in anonymously if:
    // 1. We're not already signing in
    // 2. Session is not pending (loading)
    // 3. There's no active session
    if (!isPending && !session) {
      const attemptSignIn = async () => {
        console.log("Attempting anonymous sign-in (simplified logic)...");
        try {
          // Try the standard way first
          const { data, error } = await signIn.anonymous();
          console.log("Standard anonymous sign-in initiated/checked.");
          if (error) {
            setError("Failed to sign in anonymously. Please try again.");
          } else if (data?.user) {
            // @ts-expect-error TODO: Fix this type error
            if (window.rudderanalytics) {
              // @ts-expect-error TODO: Fix this type error
              window.rudderanalytics.identify(data.user.id, { // Use optional chaining
                isAnonymous: true,
              });
            }
          }
        } catch (error: any) {
          // Ignore the specific error for already being signed in anonymously
          if (error?.message?.includes('ANONYMOUS_USERS_CANNOT_SIGN_IN_AGAIN') || error?.message?.includes('already signed in anonymously')) {
            console.log("Already signed in anonymously or attempt blocked by backend.");
          } else {
            console.error("Standard anonymous sign-in failed:", error);
            // No fallback - rely solely on the standard method
          }
        }
      };

      attemptSignIn();
    }
  }, [session, isPending]);

  // This component doesn't render anything - it just handles the authentication logic
  return null;
} 