'use client';

import React from 'react';
import { X, ImageIcon, FileText, FileSpreadsheet, FileCode, File } from 'lucide-react';
import type { FileAttachment, ImageAttachment } from '@/lib/types';
import { formatFileSize, getFileCategory } from '@/lib/file-upload';

interface FilePreviewProps {
  files: FileAttachment[];
  onRemove: (index: number) => void;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
}

function getFileIcon(type: 'image' | 'document' | 'code' | 'other', mimeType?: string) {
  switch (type) {
    case 'image':
      return ImageIcon;
    case 'document':
      if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel') || mimeType?.includes('csv')) {
        return FileSpreadsheet;
      }
      return FileText;
    case 'code':
      return FileCode;
    default:
      return File;
  }
}

function getFileTypeLabel(type: 'image' | 'document' | 'code' | 'other', mimeType?: string): string {
  switch (type) {
    case 'image':
      return 'Image';
    case 'document':
      if (mimeType?.includes('pdf')) return 'PDF';
      if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) return 'Excel';
      if (mimeType?.includes('csv')) return 'CSV';
      return 'Document';
    case 'code':
      if (mimeType?.includes('javascript')) return 'JavaScript';
      if (mimeType?.includes('typescript')) return 'TypeScript';
      if (mimeType?.includes('python')) return 'Python';
      if (mimeType?.includes('json')) return 'JSON';
      return 'Code';
    default:
      return 'File';
  }
}

export function FilePreview({
  files,
  onRemove,
  maxWidth = 120,
  maxHeight = 120,
  className = ''
}: FilePreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {files.map((file, index) => {
        const Icon = getFileIcon(file.type, file.metadata.mimeType);
        const typeLabel = getFileTypeLabel(file.type, file.metadata.mimeType);

        if (file.type === 'image' && file.dataUrl) {
          return (
            <div
              key={index}
              className="relative group cursor-pointer"
              onClick={() => onRemove(index)}
              style={{ maxWidth, maxHeight }}
            >
              <img
                src={file.dataUrl}
                alt={file.metadata.filename}
                className="w-full h-full object-cover rounded-lg border border-border"
                style={{ maxWidth, maxHeight }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <X className="h-6 w-6 text-white" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg truncate">
                {file.metadata.filename}
              </div>
            </div>
          );
        }

        return (
          <div
            key={index}
            className="relative group cursor-pointer"
            onClick={() => onRemove(index)}
            style={{ maxWidth, maxHeight }}
          >
            <div
              className="flex flex-col items-center justify-center bg-muted border border-border rounded-lg p-3"
              style={{ width: maxWidth, height: maxHeight }}
            >
              <Icon className="h-8 w-8 text-muted-foreground mb-2" />
              <div className="text-xs font-medium text-center truncate w-full">
                {file.metadata.filename}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatFileSize(file.metadata.size)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {typeLabel}
              </div>
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <X className="h-6 w-6 text-white" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { FilePreview as ImagePreview };

export type { FilePreviewProps as ImagePreviewProps };
