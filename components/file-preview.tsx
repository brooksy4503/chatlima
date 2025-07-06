"use client";

import React from 'react';
import { X, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize, type ProcessedFile } from '@/lib/file-processing';

interface FilePreviewProps {
  file: ProcessedFile;
  onRemove: () => void;
  className?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove, className }) => {
  const isImage = file.type === 'image';

  return (
    <div className={cn(
      "relative inline-block mr-2 mb-2 group",
      className
    )}>
      <div className="border rounded-lg p-2 bg-muted/50 hover:bg-muted transition-colors">
        {isImage ? (
          <div className="relative">
            <img 
              src={file.data} 
              alt={file.filename} 
              className="max-w-20 max-h-20 object-cover rounded"
              onError={(e) => {
                // Fallback to file icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden flex items-center justify-center w-20 h-20 bg-muted rounded">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-20 h-20 space-y-1">
            <FileText className="h-8 w-8 text-red-500" />
            <span className="text-xs text-muted-foreground font-medium">PDF</span>
          </div>
        )}
        
        <div className="mt-1 text-center">
          <p className="text-xs truncate max-w-20 font-medium" title={file.filename}>
            {file.filename}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>
      
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className={cn(
          "absolute -top-2 -right-2 bg-destructive text-destructive-foreground",
          "rounded-full p-1 h-6 w-6 flex items-center justify-center",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "hover:bg-destructive/90 focus:opacity-100",
          "focus:outline-none focus:ring-2 focus:ring-destructive/50"
        )}
        title="Remove file"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

interface FilePreviewListProps {
  files: ProcessedFile[];
  onRemoveFile: (index: number) => void;
  className?: string;
}

export const FilePreviewList: React.FC<FilePreviewListProps> = ({ 
  files, 
  onRemoveFile, 
  className 
}) => {
  if (files.length === 0) return null;

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-1 p-2 border rounded-lg bg-background/50",
      className
    )}>
      {files.map((file, index) => (
        <FilePreview
          key={`${file.filename}-${index}`}
          file={file}
          onRemove={() => onRemoveFile(index)}
        />
      ))}
    </div>
  );
};