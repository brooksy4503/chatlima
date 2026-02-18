'use client';

import React, { useRef, useState, useCallback } from 'react';
import { ImageIcon, Upload, Loader2, FileText, FileSpreadsheet, FileCode, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { processImageFile, validateImageFile } from '@/lib/image-utils';
import type { FileAttachment, ImageAttachment } from '@/lib/types';
import { 
  getFileCategory, 
  ALL_SUPPORTED_TYPES, 
  MAX_FILE_SIZE,
  formatFileSize,
} from '@/lib/file-upload';

interface FileUploadProps {
  onFileSelect: (files: FileAttachment[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
  defaultDetail?: "low" | "high" | "auto";
  showDetailSelector?: boolean;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  maxFiles = 5,
  maxSizePerFile = MAX_FILE_SIZE,
  acceptedTypes = ALL_SUPPORTED_TYPES,
  disabled = false,
  defaultDetail = "auto",
  showDetailSelector = true,
  className = ""
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<"low" | "high" | "auto">(defaultDetail);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const errors: string[] = [];
    const processedFiles: FileAttachment[] = [];

    if (fileArray.length > maxFiles) {
      const errorMsg = `Maximum ${maxFiles} files allowed. Only first ${maxFiles} will be processed.`;
      errors.push(errorMsg);
    }

    setIsUploading(true);
    setUploadErrors([]);

    const filesToProcess = fileArray.slice(0, maxFiles);

    for (const file of filesToProcess) {
      try {
        if (file.size > maxSizePerFile) {
          errors.push(`${file.name}: File size (${formatFileSize(file.size)}) exceeds maximum (${formatFileSize(maxSizePerFile)})`);
          continue;
        }

        if (file.size === 0) {
          errors.push(`${file.name}: File is empty`);
          continue;
        }

        const fileType = getFileCategory(file.type);
        
        if (fileType === 'image') {
          const validation = validateImageFile(file, {
            maxSize: maxSizePerFile,
            allowedTypes: acceptedTypes.filter(t => t.startsWith('image/'))
          });

          if (!validation.valid) {
            errors.push(`${file.name}: ${validation.error}`);
            continue;
          }

          const { dataUrl, metadata } = await processImageFile(file);

          processedFiles.push({
            file,
            type: 'image',
            dataUrl,
            metadata: {
              ...metadata,
              originalSize: file.size,
            },
            detail: selectedDetail
          });
        } else {
          processedFiles.push({
            file,
            type: fileType,
            metadata: {
              filename: file.name,
              size: file.size,
              mimeType: file.type || 'application/octet-stream',
            },
          });
        }
      } catch (error) {
        const errorMsg = `${file.name}: Failed to process file`;
        errors.push(errorMsg);
        console.error('[ERROR] Error processing file:', error);
      }
    }

    setIsUploading(false);
    setUploadErrors(errors);

    if (processedFiles.length > 0) {
      onFileSelect(processedFiles);
    }
  }, [maxFiles, maxSizePerFile, acceptedTypes, selectedDetail, onFileSelect]);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const handleButtonClick = useCallback(() => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  }, [disabled, isUploading]);

  const imageTypes = acceptedTypes.filter(t => t.startsWith('image/'));
  const documentTypes = acceptedTypes.filter(t => 
    t.includes('pdf') || t.includes('csv') || t.includes('excel') || t.includes('spreadsheet')
  );
  const codeTypes = acceptedTypes.filter(t => 
    t.includes('text/') || t.includes('json') || t.includes('javascript')
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {showDetailSelector && imageTypes.length > 0 && (
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
              <div className="text-sm text-muted-foreground">Processing files...</div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Upload className="h-6 w-6" />
              </div>
              <div className="text-sm font-medium">
                {dragActive ? 'Drop files here' : 'Click or drag files to upload'}
              </div>
              <div className="text-xs text-muted-foreground text-center space-y-1">
                <div>Images (JPEG, PNG, WebP) • Documents (PDF, CSV, Excel) • Code files</div>
                <div>Max {maxFiles} files • {Math.round(maxSizePerFile / (1024 * 1024))}MB per file</div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={disabled || isUploading}
          className="w-full sm:w-auto"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Processing...' : 'Choose Files'}
        </Button>
      </div>

      {uploadErrors.length > 0 && (
        <div className="space-y-1">
          {uploadErrors.map((error, index) => (
            <div key={index} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <div className="font-medium mb-1">Supported File Types:</div>
        <ul className="space-y-0.5 ml-2">
          <li>• <strong>Images:</strong> JPEG, PNG, WebP (for vision analysis)</li>
          <li>• <strong>Documents:</strong> PDF, CSV, Excel (analyzed by AI)</li>
          <li>• <strong>Code:</strong> JavaScript, TypeScript, Python, etc.</li>
        </ul>
        {imageTypes.length > 0 && (
          <div className="mt-2 text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
            <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">📷 Images:</div>
            <div className="text-blue-700 dark:text-blue-300">
              Images are compressed and sent to vision-capable models for analysis.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function getFileIcon(type: 'image' | 'document' | 'code' | 'other', mimeType?: string) {
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

export function FileUploadStatus({
  isUploading,
  fileCount,
  errors
}: {
  isUploading: boolean;
  fileCount: number;
  errors: string[];
}) {
  if (isUploading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Processing files...
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

  if (fileCount > 0) {
    return (
      <div className="text-xs text-muted-foreground">
        {fileCount} file{fileCount > 1 ? 's' : ''} ready to send
      </div>
    );
  }

  return null;
}

export { FileUpload as ImageUpload };

export type { FileUploadProps as ImageUploadProps };
export type { FileAttachment as ImageAttachment };
