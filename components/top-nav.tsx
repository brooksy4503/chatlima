"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PlusCircle, Menu, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChatShareDialog } from "@/components/chat-share-dialog";
import { useQuery } from "@tanstack/react-query";
 

export function TopNav() {
  const params = useParams();
  const chatId = params?.id as string | undefined;
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Fetch chat title for sharing - only when actually needed
  const { data: chatData } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      if (!chatId) return null;
      const response = await fetch(`/api/chats/${chatId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!chatId && isShareDialogOpen,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleNewChat = () => {
    // Use window.location for more reliable navigation
    window.location.href = '/';
  };

  const handleShare = () => {
    setIsShareDialogOpen(true);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40 px-4 py-4 h-[72px] flex items-center relative">
        {/* Mobile Hamburger Menu - Left side */}
        <div className="absolute left-4">
          <SidebarTrigger>
            <button 
              className="flex items-center justify-center h-9 w-9 bg-muted hover:bg-accent rounded-md transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
          </SidebarTrigger>
        </div>
        
        {/* ChatLima title - Truly centered */}
        <div className="flex-1 flex justify-center">
          <h1 className="text-3xl font-semibold">ChatLima</h1>
        </div>
        
        {/* Action buttons - Right side */}
        <div className="absolute right-4 flex items-center gap-4">
          
          {/* Share button - only show if we're on a chat page */}
          {chatId && (
            <Button
              variant="ghost"
              size="icon"
              className="flex items-center justify-center h-9 w-9 bg-muted hover:bg-accent rounded-md transition-colors"
              onClick={handleShare}
              title="Share chat"
              aria-label="Share this chat"
            >
              <Share className="h-4 w-4" />
            </Button>
          )}
          
          {/* New Chat Button */}
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
        </div>
      </nav>

      {/* Share Dialog */}
      {chatId && chatData && (
        <ChatShareDialog
          isOpen={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          chatId={chatId}
          chatTitle={chatData.title || "Untitled Chat"}
        />
      )}
    </>
  );
} 