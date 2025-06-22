"use client";

import { useRouter } from "next/navigation";
import { PlusCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function TopNav() {
  const router = useRouter();

  const handleNewChat = () => {
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40 px-4 py-4 h-[72px] flex items-center justify-between">
      {/* Mobile Hamburger Menu - Left side */}
      <SidebarTrigger>
        <button 
          className="flex items-center justify-center h-9 w-9 bg-muted hover:bg-accent rounded-md transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>
      </SidebarTrigger>
      
      {/* ChatLima title - Centered */}
      <h1 className="text-3xl font-semibold">ChatLima</h1>
      
      {/* New Chat Button - Right side */}
      <Button
        variant="ghost"
        size="icon"
        className="flex items-center justify-center h-9 w-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
        onClick={handleNewChat}
        title="New Chat"
        aria-label="Start new chat"
      >
        <PlusCircle className="h-4 w-4" />
      </Button>
    </nav>
  );
} 