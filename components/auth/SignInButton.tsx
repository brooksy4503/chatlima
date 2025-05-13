"use client";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignInButtonProps {
  isCollapsed?: boolean;
}

export function SignInButton({ isCollapsed }: SignInButtonProps) {
  const handleSignIn = async () => {
    try {
      await signIn.social({
        provider: "google",
      });
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

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