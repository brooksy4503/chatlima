export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_PDF_TYPES = ['application/pdf'];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface ProcessedFile {
  type: 'image' | 'pdf';
  data: string; // base64 data URL
  filename: string;
  size: number;
}

/**
 * Validates a file for size and type
 */
export const validateFile = (file: File): FileValidationResult => {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isPDF = ALLOWED_PDF_TYPES.includes(file.type);

  if (!isImage && !isPDF) {
    return {
      valid: false,
      error: `File type ${file.type} not supported. Please use JPG, PNG, WebP, or PDF files.`
    };
  }

  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_PDF_SIZE;
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File too large. Maximum size for ${isImage ? 'images' : 'PDFs'} is ${maxSizeMB}MB.`
    };
  }

  return { valid: true };
};

/**
 * Converts a file to base64 data URL
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Processes a file for upload (validates and converts to base64)
 */
export const processFile = async (file: File): Promise<ProcessedFile> => {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const base64Data = await fileToBase64(file);
  const type = ALLOWED_IMAGE_TYPES.includes(file.type) ? 'image' : 'pdf';

  return {
    type,
    data: base64Data,
    filename: file.name,
    size: file.size
  };
};

/**
 * Compresses an image before processing (basic implementation)
 */
export const compressImage = async (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => resolve(file); // Fallback to original
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Gets file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Extracts filename from a data URL
 */
export const getFilenameFromDataUrl = (dataUrl: string, fallback: string = 'file'): string => {
  try {
    const [, mimeType] = dataUrl.split(';')[0].split(':');
    const extension = mimeType.split('/')[1];
    return `${fallback}.${extension}`;
  } catch {
    return fallback;
  }
};

/**
 * Checks if the browser supports the File API
 */
export const supportsFileAPI = (): boolean => {
  return typeof FileReader !== 'undefined' && typeof File !== 'undefined';
};