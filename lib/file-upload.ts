import { put, del } from '@vercel/blob';

export const MAX_FILE_SIZE = 31_457_280; // 30MB

export const SUPPORTED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/webp'],
  documents: [
    'application/pdf',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ],
  code: [
    'text/plain',
    'text/markdown',
    'application/json',
    'application/javascript',
    'text/x-typescript',
    'text/x-python',
    'text/x-java',
    'text/x-c',
    'text/x-cpp',
    'text/html',
    'text/css',
    'text/x-yaml',
    'text/yaml',
  ],
};

export const ALL_SUPPORTED_TYPES = [
  ...SUPPORTED_FILE_TYPES.images,
  ...SUPPORTED_FILE_TYPES.documents,
  ...SUPPORTED_FILE_TYPES.code,
];

export function isImageFile(mimeType: string): boolean {
  return SUPPORTED_FILE_TYPES.images.includes(mimeType);
}

export function isDocumentFile(mimeType: string): boolean {
  return SUPPORTED_FILE_TYPES.documents.includes(mimeType);
}

export function isCodeFile(mimeType: string): boolean {
  return SUPPORTED_FILE_TYPES.code.includes(mimeType);
}

export function getFileCategory(mimeType: string): 'image' | 'document' | 'code' | 'other' {
  if (isImageFile(mimeType)) return 'image';
  if (isDocumentFile(mimeType)) return 'document';
  if (isCodeFile(mimeType)) return 'code';
  return 'other';
}

export function validateFile(
  file: File,
  maxSize: number = MAX_FILE_SIZE
): { valid: boolean; error?: string } {
  if (!file.name || file.name.trim() === '') {
    return { valid: false, error: 'File must have a valid name' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`,
    };
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || ext.length === 0) {
    return { valid: false, error: 'File must have an extension' };
  }

  return { valid: true };
}

export function validateFileType(
  file: File,
  allowedTypes: string[] = ALL_SUPPORTED_TYPES
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const mimeTypeByExt = getMimeTypeFromExtension(ext);
    
    if (mimeTypeByExt && allowedTypes.includes(mimeTypeByExt)) {
      return { valid: true };
    }

    return {
      valid: false,
      error: `File type '${file.type || ext}' is not supported. Supported types: images (JPEG, PNG, WebP), documents (PDF, CSV, Excel), and code files`,
    };
  }

  return { valid: true };
}

export function generateUniqueFilename(originalName: string): string {
  const lastDotIndex = originalName.lastIndexOf('.');
  const baseName = lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;
  const extension = lastDotIndex > 0 ? originalName.substring(lastDotIndex) : '';

  const sanitizedBaseName = baseName
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 50);

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T]/g, '')
    .replace(/\..+/, '')
    .substring(0, 15);

  return `${sanitizedBaseName}-${timestamp}${extension}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getMimeTypeFromExtension(extension?: string): string | null {
  if (!extension) return null;

  const ext = extension.toLowerCase().replace('.', '');

  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    pdf: 'application/pdf',
    csv: 'text/csv',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    txt: 'text/plain',
    md: 'text/markdown',
    json: 'application/json',
    js: 'application/javascript',
    mjs: 'application/javascript',
    ts: 'text/x-typescript',
    tsx: 'text/x-typescript',
    py: 'text/x-python',
    java: 'text/x-java',
    c: 'text/x-c',
    cpp: 'text/x-cpp',
    h: 'text/x-c',
    hpp: 'text/x-cpp',
    html: 'text/html',
    css: 'text/css',
    yaml: 'text/yaml',
    yml: 'text/x-yaml',
  };

  return mimeMap[ext] || null;
}

export async function uploadFiles(
  files: File[]
): Promise<{
  success: boolean;
  filePaths: string[];
  errors: string[];
}> {
  const filePaths: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const validation = validateFile(file);
    if (!validation.valid) {
      errors.push(`${file.name}: ${validation.error}`);
      continue;
    }

    const typeValidation = validateFileType(file);
    if (!typeValidation.valid) {
      errors.push(`${file.name}: ${typeValidation.error}`);
      continue;
    }

    try {
      const result = await saveUploadedFile(file);
      if (result.success && result.filepath) {
        filePaths.push(result.filepath);
      } else {
        errors.push(`${file.name}: ${result.error || 'Upload failed'}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`${file.name}: ${message}`);
    }
  }

  return {
    success: errors.length === 0,
    filePaths,
    errors,
  };
}

async function saveUploadedFile(
  file: File
): Promise<{
  success: boolean;
  filepath?: string;
  url?: string;
  error?: string;
}> {
  try {
    const uniqueFilename = generateUniqueFilename(file.name);
    const blobKey = `uploads/${uniqueFilename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const blob = await put(blobKey, buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.type || getMimeTypeFromExtension(file.name.split('.').pop()) || undefined,
    });

    return {
      success: true,
      filepath: blobKey,
      url: blob.url,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    console.error('[FileUpload] Error uploading file:', error);
    return {
      success: false,
      error: message,
    };
  }
}

export async function deleteUploadedFile(filepath: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await del(filepath, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    console.error('[FileUpload] Error deleting file:', error);
    return {
      success: false,
      error: message,
    };
  }
}

export async function fetchFileContent(url: string): Promise<{
  success: boolean;
  content?: ArrayBuffer;
  error?: string;
}> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.arrayBuffer();
    return { success: true, content };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fetch failed';
    console.error('[FileUpload] Error fetching file:', error);
    return { success: false, error: message };
  }
}
