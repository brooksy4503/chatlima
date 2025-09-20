'use client';

import { useState } from 'react';
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

  const shareUrl = `${window.location.origin}/chats/shared/${shareId}`;
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

  return (
    <div className="flex items-center gap-1">
      <TwitterShareButton url={shareUrl} title={shareTitle}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          aria-label="Share on Twitter"
        >
          <Twitter className="h-4 w-4 text-blue-500" />
        </Button>
      </TwitterShareButton>

      <FacebookShareButton url={shareUrl} title={shareTitle}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          aria-label="Share on Facebook"
        >
          <Facebook className="h-4 w-4 text-blue-600" />
        </Button>
      </FacebookShareButton>

      <LinkedinShareButton url={shareUrl} title={shareTitle}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="h-4 w-4 text-blue-700" />
        </Button>
      </LinkedinShareButton>

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