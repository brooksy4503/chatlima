"use client";

import { useAuth, signOut } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, LayoutDashboard, FileText, Shield } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckoutButton } from "@/components/checkout-button";

export function UserAccountMenu() {
  const { session } = useAuth();

  if (!session?.user) return null;

  const handleSignOut = async () => {
    try {
      await signOut({});
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  const userInitials = session.user.name
    ? session.user.name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
    : session.user.email?.[0]?.toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={session.user.image || ''} 
              alt={session.user.name || 'User'} 
            />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <CheckoutButton />
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/api/portal" target="_blank" rel="noopener noreferrer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Customer Portal</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs">Legal</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/terms">
            <FileText className="mr-2 h-4 w-4" />
            <span>Terms of Service</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/privacy">
            <Shield className="mr-2 h-4 w-4" />
            <span>Privacy Policy</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 