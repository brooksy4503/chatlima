"use client";

import React, { useRef, useState } from 'react';
import { Paperclip, Upload, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { validateFile, type ProcessedFile } from '@/lib/file-processing';

interface FileUploadProps {
  onFileSelect: (files: ProcessedFile[]) => void;
  disabled?: boolean;
  multiple?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  disabled = false, 
  multiple = false, 
  className 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = async (files: FileList) => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);
    const processedFiles: ProcessedFile[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateFile(file);
      
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      try {
        const { processFile } = await import('@/lib/file-processing');
        const processed = await processFile(file);
        processedFiles.push(processed);
      } catch (error) {
        errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Processing failed'}`);
      }
    }

    if (errors.length > 0) {
      console.error('File processing errors:', errors);
      // You might want to show these errors to the user via toast or other means
    }

    if (processedFiles.length > 0) {
      onFileSelect(processedFiles);
    }

    setIsProcessing(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileChange}
        disabled={disabled}
        multiple={multiple}
        className="hidden"
      />
      
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled || isProcessing}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-full border transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/30",
              disabled || isProcessing
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer",
              isDragging && "bg-primary/10 border-primary",
              className
            )}
          >
            {isProcessing ? (
              <div className="animate-spin h-4 w-4">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {isProcessing ? 'Processing files...' : 'Attach image or PDF'}
        </TooltipContent>
      </Tooltip>
    </>
  );
};

// Alternative drag-and-drop area component for larger upload zones
export const FileDropZone: React.FC<FileUploadProps & { children?: React.ReactNode }> = ({ 
  onFileSelect, 
  disabled = false, 
  multiple = false, 
  children,
  className 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = async (files: FileList) => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);
    const processedFiles: ProcessedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateFile(file);
      
      if (validation.valid) {
        try {
          const { processFile } = await import('@/lib/file-processing');
          const processed = await processFile(file);
          processedFiles.push(processed);
        } catch (error) {
          console.error('File processing error:', error);
        }
      }
    }

    if (processedFiles.length > 0) {
      onFileSelect(processedFiles);
    }

    setIsProcessing(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileChange}
        disabled={disabled}
        multiple={multiple}
        className="hidden"
      />
      
      {isProcessing ? (
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin h-8 w-8">
            <svg className="h-8 w-8" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">Processing files...</p>
        </div>
      ) : children ? (
        children
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drop files here or click to select
          </p>
          <p className="text-xs text-muted-foreground">
            Images (JPG, PNG, WebP) up to 5MB or PDFs up to 10MB
          </p>
        </div>
      )}
    </div>
  );
};