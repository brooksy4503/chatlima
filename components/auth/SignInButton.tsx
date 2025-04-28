"use client";

import { signIn, signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut } from "lucide-react";

export function SignInButton() {
  const { data: session, isPending } = useSession();

  const handleSignIn = async () => {
    try {
      await signIn.social({
        provider: "google",
      });
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({
      });
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  if (isPending) {
    return <Skeleton className="h-10 w-32" />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {session.user.email}
        </span>
        <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign Out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return <Button onClick={handleSignIn}>Sign in with Google</Button>;
} 