'use client';

import React from 'react';
import { Download, X } from 'lucide-react';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  filename?: string;
  metadata?: {
    filename?: string;
    size?: number;
    mimeType?: string;
    width?: number;
    height?: number;
  };
  detail?: string;
}

export function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  filename,
  metadata,
  detail
}: ImageModalProps) {
  const handleDownload = () => {
    // Create a download link for the image
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename || metadata?.filename || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayFilename = filename || metadata?.filename || 'Uploaded image';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[95vw] max-h-[95vh] translate-x-[-50%] translate-y-[-50%] gap-0 rounded-lg border p-0 shadow-lg duration-200"
          )}
          aria-describedby="image-modal-description"
        >
          <div className="relative flex flex-col h-[95vh]">
            {/* Header with filename and controls */}
                          <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-sm">
                <div className="flex-1 min-w-0">
                  <DialogPrimitive.Title asChild>
                    <h3 className="text-lg font-semibold truncate" title={displayFilename}>
                      {displayFilename}
                    </h3>
                  </DialogPrimitive.Title>
                {metadata && (
                  <div id="image-modal-description" className="text-sm text-muted-foreground mt-1">
                    {metadata.size && <span>{formatFileSize(metadata.size)}</span>}
                    {metadata.width && metadata.height && (
                      <span> • {metadata.width}×{metadata.height}</span>
                    )}
                    {detail && detail !== 'auto' && (
                      <span> • {detail} quality</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center space-x-2"
                  aria-label={`Download ${displayFilename}`}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
                
                <DialogPrimitive.Close asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label="Close image viewer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogPrimitive.Close>
              </div>
            </div>

            {/* Image container */}
            <div className="flex-1 flex items-center justify-center p-4 min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={displayFilename}
                className="max-w-full max-h-full object-contain rounded-lg border border-border shadow-lg"
                loading="lazy"
              />
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
} 