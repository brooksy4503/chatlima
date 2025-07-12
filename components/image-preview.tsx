'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/image-utils';
import type { ImageAttachment } from '@/lib/types';

interface ImagePreviewProps {
  images: ImageAttachment[];
  onRemove: (index: number) => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
}

export function ImagePreview({
  images,
  onRemove,
  onReorder,
  maxWidth = 200,
  maxHeight = 200,
  className = ""
}: ImagePreviewProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className={`image-preview-grid ${className}`}>
      {images.map((image, index) => (
        <ImagePreviewItem
          key={`${image.metadata.filename}-${index}`}
          image={image}
          index={index}
          onRemove={onRemove}
          maxWidth={maxWidth}
          maxHeight={maxHeight}
        />
      ))}
    </div>
  );
}

interface ImagePreviewItemProps {
  image: ImageAttachment;
  index: number;
  onRemove: (index: number) => void;
  maxWidth: number;
  maxHeight: number;
}

function ImagePreviewItem({
  image,
  index,
  onRemove,
  maxWidth,
  maxHeight
}: ImagePreviewItemProps) {
  return (
    <div className="image-preview-item">
      <div className="relative">
        <img
          src={image.dataUrl}
          alt={image.metadata.filename}
          className="w-full h-auto rounded border border-border object-cover"
          style={{
            maxWidth: `${maxWidth}px`,
            maxHeight: `${maxHeight}px`
          }}
          loading="lazy"
        />
        
        {/* Remove button */}
        <Button
          variant="destructive"
          size="sm"
          className="image-preview-remove"
          onClick={() => onRemove(index)}
          aria-label={`Remove ${image.metadata.filename}`}
        >
          <X className="h-3 w-3" />
        </Button>
        
        {/* Detail level indicator */}
        {image.detail && image.detail !== 'auto' && (
          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-background/80 border border-border rounded text-xs">
            {image.detail}
          </div>
        )}
      </div>
      
      {/* File info */}
      <div className="mt-1 space-y-0.5">
        <div className="text-xs font-medium truncate" title={image.metadata.filename}>
          {image.metadata.filename}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatFileSize(image.metadata.size)}
          {image.metadata.width > 0 && image.metadata.height > 0 && (
            <> • {image.metadata.width}×{image.metadata.height}</>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading placeholder component for when images are being processed
export function ImagePreviewLoading({ count = 1 }: { count?: number }) {
  return (
    <div className="image-preview-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="image-preview-item">
          <div className="animate-pulse">
            <div className="w-full h-24 bg-muted rounded border border-border"></div>
            <div className="mt-1 space-y-1">
              <div className="h-3 bg-muted rounded w-3/4"></div>
              <div className="h-2 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Error state component
export function ImagePreviewError({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry?: () => void; 
}) {
  return (
    <div className="p-3 border border-destructive/20 bg-destructive/5 rounded-md">
      <div className="flex items-center justify-between">
        <div className="text-sm text-destructive">{error}</div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    </div>
  );
} 