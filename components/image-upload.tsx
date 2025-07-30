'use client';

import React, { useRef, useState, useCallback } from 'react';
import { ImageIcon, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { processImageFile, validateImageFile } from '@/lib/image-utils';
import type { ImageAttachment } from '@/lib/types';

interface ImageUploadProps {
  onImageSelect: (images: ImageAttachment[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in bytes
  acceptedTypes?: string[];
  disabled?: boolean;
  defaultDetail?: "low" | "high" | "auto";
  showDetailSelector?: boolean;
  className?: string;
}

export function ImageUpload({
  onImageSelect,
  maxFiles = 5,
  maxSizePerFile = 20 * 1024 * 1024, // 20MB (compatible with OpenRouter and most providers)
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'], // Standard formats supported by most AI providers
  disabled = false,
  defaultDetail = "auto",
  showDetailSelector = true,
  className = ""
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<"low" | "high" | "auto">(defaultDetail);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const errors: string[] = [];
    const processedImages: ImageAttachment[] = [];
    
    console.log('[DEBUG] ImageUpload.handleFiles called with:', {
      filesCount: fileArray.length,
      maxFiles,
      selectedDetail,
      files: fileArray.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });

    if (fileArray.length > maxFiles) {
      const errorMsg = `Maximum ${maxFiles} images allowed. Only first ${maxFiles} will be processed.`;
      errors.push(errorMsg);
      console.warn('[WARN]', errorMsg);
    }

    setIsUploading(true);
    setUploadErrors([]);

    const filesToProcess = fileArray.slice(0, maxFiles);
    console.log('[DEBUG] Processing', filesToProcess.length, 'files');

    for (const file of filesToProcess) {
      try {
        console.log('[DEBUG] Processing file:', file.name);
        
        // Validate file
        const validation = validateImageFile(file, {
          maxSize: maxSizePerFile,
          allowedTypes: acceptedTypes
        });

        console.log('[DEBUG] File validation result:', {
          filename: file.name,
          valid: validation.valid,
          error: validation.error
        });

        if (!validation.valid) {
          const errorMsg = `${file.name}: ${validation.error}`;
          errors.push(errorMsg);
          console.error('[ERROR] File validation failed:', errorMsg);
          continue;
        }

        // Process file
        console.log('[DEBUG] Processing image file:', file.name);
        const { dataUrl, metadata } = await processImageFile(file);
        
        console.log('[DEBUG] Image processed successfully:', {
          filename: file.name,
          dataUrlLength: dataUrl.length,
          metadata,
          detail: selectedDetail,
          wasCompressed: metadata.originalSize && metadata.originalSize > metadata.size
        });

        // Show compression info if image was compressed
        if (metadata.originalSize && metadata.originalSize > metadata.size) {
          const compressionRatio = ((metadata.size / metadata.originalSize) * 100).toFixed(1);
          console.log(`[INFO] Image ${file.name} compressed from ${Math.round(metadata.originalSize / 1024 / 1024 * 10) / 10}MB to ${Math.round(metadata.size / 1024 / 1024 * 10) / 10}MB (${compressionRatio}%)`);
        }

        processedImages.push({
          file,
          dataUrl,
          metadata,
          detail: selectedDetail
        });
      } catch (error) {
        const errorMsg = `${file.name}: Failed to process image`;
        errors.push(errorMsg);
        console.error('[ERROR] Error processing image:', error);
      }
    }

    setIsUploading(false);
    setUploadErrors(errors);
    
    console.log('[DEBUG] Image processing complete:', {
      processedCount: processedImages.length,
      errorsCount: errors.length,
      errors: errors
    });

    if (processedImages.length > 0) {
      console.log('[DEBUG] Calling onImageSelect with', processedImages.length, 'images');
      onImageSelect(processedImages);
    } else {
      console.warn('[WARN] No images were successfully processed');
    }
  }, [maxFiles, maxSizePerFile, acceptedTypes, selectedDetail, onImageSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, isUploading, handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const handleButtonClick = useCallback(() => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  }, [disabled, isUploading]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Detail Level Selector */}
      {showDetailSelector && (
        <div className="flex items-center space-x-2">
          <Label htmlFor="detail-selector" className="text-sm font-medium">
            Image Detail:
          </Label>
          <Select value={selectedDetail} onValueChange={(value: "low" | "high" | "auto") => setSelectedDetail(value)}>
            <SelectTrigger className="w-32" id="detail-selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="low">Low (85 tokens)</SelectItem>
              <SelectItem value="high">High (170 tokens)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`image-upload-area ${dragActive ? 'border-primary' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <div className="flex flex-col items-center justify-center space-y-2 p-6">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Processing images...</div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
                <Upload className="h-4 w-4" />
              </div>
              <div className="text-sm font-medium">
                {dragActive ? 'Drop images here' : 'Click or drag images to upload'}
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Supports JPEG, PNG, WebP • Max {maxFiles} files • {Math.round(maxSizePerFile / (1024 * 1024))}MB per file
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Button (Alternative to drag area) */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={disabled || isUploading}
          className="w-full sm:w-auto"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          {isUploading ? 'Processing...' : 'Choose Images'}
        </Button>
      </div>

      {/* Error Messages */}
      {uploadErrors.length > 0 && (
        <div className="space-y-1">
          {uploadErrors.map((error, index) => (
            <div key={index} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground">
        <div className="font-medium mb-1">Image Detail Levels:</div>
        <ul className="space-y-0.5 ml-2">
          <li>• <strong>Auto:</strong> AI chooses optimal quality (recommended)</li>
          <li>• <strong>Low:</strong> Faster processing, good for simple images</li>
          <li>• <strong>High:</strong> Detailed analysis, better for complex images</li>
        </ul>
        <div className="mt-2 text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
          <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">✨ Smart Compression:</div>
          <div className="text-blue-700 dark:text-blue-300">
            Large images (&gt;5MB) are automatically compressed to ensure fast uploads while maintaining quality.
          </div>
        </div>
      </div>
    </div>
  );
}

// Status indicator component
export function ImageUploadStatus({
  isUploading,
  imageCount,
  errors
}: {
  isUploading: boolean;
  imageCount: number;
  errors: string[];
}) {
  if (isUploading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Processing images...
      </div>
    );
  }

  if (errors.length > 0) {
    return (
      <div className="text-sm text-destructive">
        {errors.length} error{errors.length > 1 ? 's' : ''} occurred
      </div>
    );
  }

  if (imageCount > 0) {
    return (
      <div className="text-xs text-muted-foreground">
        {imageCount} image{imageCount > 1 ? 's' : ''} ready to send
      </div>
    );
  }

  return null;
} 