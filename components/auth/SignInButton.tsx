"use client";

import { signIn, signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignInButtonProps {
  isCollapsed?: boolean;
}

export function SignInButton({ isCollapsed }: SignInButtonProps) {
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
      await signOut({});
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  if (isPending) {
    return <Skeleton className={cn("h-10", isCollapsed ? "w-10 rounded-full" : "w-32")} />;
  }

  if (session?.user) {
    return (
      <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-2")}>
        {!isCollapsed && (
          <span className="text-sm text-muted-foreground hidden sm:inline truncate max-w-[150px]" title={session.user.email ?? ''}>
            {session.user.email}
          </span>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleSignOut} 
          aria-label="Sign Out"
          className={cn(isCollapsed ? "h-8 w-8" : "h-9 w-9")}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleSignIn}
      className={cn(
        "bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors duration-200 ease-in-out shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50",
        isCollapsed ? "w-auto h-auto p-2 aspect-square rounded-lg" : "w-full py-2 px-4 rounded-lg"
      )}
      title={isCollapsed ? "Sign in with Google" : undefined}
    >
      <LogIn className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
      {!isCollapsed && <span>Sign in with Google</span>}
    </Button>
  );
} 