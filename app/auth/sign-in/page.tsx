"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { signIn } from "@/lib/auth-client";

function getSafeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/chat";
  }

  return next;
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isAnonymous, isLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const nextPath = useMemo(() => getSafeNext(searchParams.get("next")), [searchParams]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAnonymous) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, isAnonymous, isLoading, nextPath, router]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: nextPath,
      });
    } catch (error) {
      console.error("Sign-in error:", error);
      setIsSigningIn(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex-1 bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Image src="/logo.png" alt="ChatLima logo" width={32} height={32} className="h-8 w-8" />
          </div>
          <CardTitle>Sign in to ChatLima</CardTitle>
          <CardDescription>
            Continue with Google to access your chats, subscription, and admin tools.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleGoogleSignIn} disabled={isSigningIn || isLoading} className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            {isSigningIn ? "Redirecting..." : "Sign in with Google"}
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/chat">
              <MessageSquare className="mr-2 h-4 w-4" />
              Continue to chat
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<main className="min-h-screen w-full flex-1 bg-background" />}>
      <SignInContent />
    </Suspense>
  );
}
