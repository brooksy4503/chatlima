'use client';

import React, { useState, useEffect } from 'react';
import {
  TwitterShareButton,
  FacebookShareButton,
  LinkedinShareButton,
} from 'react-share';
import { Twitter, Facebook, Linkedin, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SharingButtonsProps {
  shareId: string;
  title: string;
}

export function SharingButtons({ shareId, title }: SharingButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/chats/shared/${shareId}`);
    }
  }, [shareId]);

  const shareTitle = `${title} - Shared Chat`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  if (!shareUrl) {
    return null; // Or a loading state if preferred
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        aria-label="Share on Twitter"
      >
        <TwitterShareButton url={shareUrl} title={shareTitle}>
          <Twitter className="h-4 w-4 text-blue-500" />
        </TwitterShareButton>
      </Button>

      <Button
        asChild
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        aria-label="Share on Facebook"
      >
        <FacebookShareButton url={shareUrl} title={shareTitle}>
          <Facebook className="h-4 w-4 text-blue-600" />
        </FacebookShareButton>
      </Button>

      <Button
        asChild
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        aria-label="Share on LinkedIn"
      >
        <LinkedinShareButton url={shareUrl} title={shareTitle}>
          <Linkedin className="h-4 w-4 text-blue-700" />
        </LinkedinShareButton>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={handleCopyLink}
        aria-label="Copy link"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4 text-gray-500" />
        )}
      </Button>
    </div>
  );
}