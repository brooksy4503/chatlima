"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Share, Link as LinkIcon, Eye, EyeOff, Copy, Check } from "lucide-react";
import { type ChatWithShareInfo } from '@/lib/db/schema';

interface ChatShareDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
  chatTitle: string;
}

interface ShareData {
  shareId: string;
  shareUrl: string;
}

export function ChatShareDialog({ 
  isOpen, 
  onOpenChange, 
  chatId, 
  chatTitle
}: ChatShareDialogProps) {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);

  const queryClient = useQueryClient();

  // Mutation to create a chat share
  const createShareMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const response = await fetch(`/api/chats/${chatId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create share link');
      }

      const data = await response.json();
      return { chatId, shareData: data };
    },
    onSuccess: ({ chatId, shareData }) => {
      // Update local state
      setShareData(shareData);
      setIsShared(true);

      // Update all chat queries by invalidating them - this ensures all variants get updated
      queryClient.invalidateQueries({ queryKey: ['chats'] });

      toast.success("Share link ready!");
    },
    onError: (error) => {
      console.error('Error creating share:', error);
      toast.error("Failed to create share link. Please try again.");
    }
  });

  // Mutation to revoke a chat share
  const revokeShareMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const response = await fetch(`/api/chats/${chatId}/share`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke share link');
      }

      return chatId;
    },
    onSuccess: (chatId) => {
      // Update local state
      setShareData(null);
      setIsShared(false);

      // Update all chat queries by invalidating them - this ensures all variants get updated
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      
      toast.success("Share link revoked successfully!");
    },
    onError: (error) => {
      console.error('Error revoking share:', error);
      toast.error("Failed to revoke share link. Please try again.");
    }
  });

  // Check for existing share when dialog opens
  useEffect(() => {
    if (isOpen && !shareData) {
      checkExistingShare();
    }
  }, [isOpen, chatId]);

  const checkExistingShare = async () => {
    setIsCheckingExisting(true);
    try {
      const response = await fetch(`/api/chats/${chatId}/share`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exists !== false) {
          // Share exists, show it
          setShareData(data);
          setIsShared(true);
        }
        // If data.exists === false, we'll show the consent form
      }
    } catch (error) {
      console.error('Error checking existing share:', error);
      // If there's an error, we'll just show the create form
    } finally {
      setIsCheckingExisting(false);
    }
  };



  const handleCreateShare = () => {
    if (!hasConsented) {
      toast.error("Please agree to the terms before creating a share link.");
      return;
    }

    createShareMutation.mutate(chatId);
  };

  const handleRevokeShare = () => {
    revokeShareMutation.mutate(chatId);
  };

  const handleCopyUrl = async () => {
    if (shareData?.shareUrl) {
      try {
        await navigator.clipboard.writeText(shareData.shareUrl);
        setIsCopied(true);
        toast.success("Share URL copied to clipboard!");
        // Reset the copied state after 2 seconds
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        toast.error("Failed to copy URL to clipboard");
      }
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Reset state when dialog closes
      setHasConsented(false);
      setIsCopied(false);
      setShareData(null);
      setIsShared(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share Chat
          </DialogTitle>
          <DialogDescription>
            Create a public link to share &quot;{chatTitle}&quot; with others.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {(isCheckingExisting || createShareMutation.isPending || revokeShareMutation.isPending) && !shareData && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                {isCheckingExisting ? "Checking for existing share..." : 
                 createShareMutation.isPending ? "Creating share..." : "Revoking share..."}
              </span>
            </div>
          )}

          {!isCheckingExisting && !createShareMutation.isPending && !revokeShareMutation.isPending && !isShared && !shareData && (
            <>
              {/* Privacy Notice */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                  Privacy Notice
                </h4>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  This creates an unlisted public link. Personal information, API keys, 
                  system prompts, and media will be removed for privacy.
                </p>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={hasConsented}
                  onCheckedChange={(checked) => setHasConsented(checked === true)}
                />
                <Label htmlFor="consent" className="text-sm leading-5">
                  I understand this creates an unlisted public link and agree to the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Terms of Service
                  </a>
                  {" "}and{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </Label>
              </div>
            </>
          )}

          {/* Share Link Display */}
          {shareData && (
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Share link created
                  </span>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Anyone with this link can view a read-only version of your chat.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="share-url" className="text-sm font-medium">
                  Share URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="share-url"
                    value={shareData.shareUrl}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyUrl}
                    className="h-10 px-3 shrink-0"
                    title="Copy share URL to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {(isCheckingExisting || createShareMutation.isPending || revokeShareMutation.isPending) && !shareData ? (
            // Don't show buttons while processing
            <></>
          ) : !isShared && !shareData ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateShare}
                disabled={!hasConsented || createShareMutation.isPending}
                className="w-full sm:w-auto"
              >
                {createShareMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <LinkIcon className="mr-2 h-4 w-4" />
                Create Share Link
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleRevokeShare}
                disabled={revokeShareMutation.isPending}
                className="w-full sm:w-auto"
              >
                {revokeShareMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <EyeOff className="mr-2 h-4 w-4" />
                Disable Link
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Done
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}