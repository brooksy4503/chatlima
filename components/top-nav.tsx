"use client";

import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";

export function TopNav() {
  const router = useRouter();

  const handleNewChat = () => {
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40 px-4 py-2 flex items-center gap-2">
      <SidebarTrigger>
        <button className="flex items-center justify-center h-8 w-8 bg-muted hover:bg-accent rounded-md transition-colors">
          <Image src="/logo.png" alt="ChatLima logo" width={16} height={16} />
        </button>
      </SidebarTrigger>
      <Button
        variant="ghost"
        size="icon"
        className="flex items-center justify-center h-8 w-8 bg-muted hover:bg-accent rounded-md transition-colors"
        onClick={handleNewChat}
        title="New Chat"
      >
        <PlusCircle className="h-4 w-4" />
      </Button>
    </nav>
  );
} 