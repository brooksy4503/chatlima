"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth, signIn } from '@/hooks/useAuth';

export function AnonymousAuth() {
  const { session, isPending } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isAttemptingSignIn, setIsAttemptingSignIn] = useState(false);
  const attemptedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple simultaneous sign-in attempts
    if (isAttemptingSignIn || attemptedRef.current) {
      return;
    }

    // Only try to sign in anonymously if:
    // 1. We're not already signing in
    // 2. Session is not pending (loading)
    // 3. There's no active session
    // 4. We haven't already attempted to sign in
    if (!isPending && !session) {
      const attemptSignIn = async () => {
        setIsAttemptingSignIn(true);
        attemptedRef.current = true;
        
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
        } finally {
          setIsAttemptingSignIn(false);
        }
      };

      attemptSignIn();
    }
  }, [session, isPending, isAttemptingSignIn]);

  // This component doesn't render anything - it just handles the authentication logic
  return null;
} 