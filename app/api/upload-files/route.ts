import { NextRequest, NextResponse } from 'next/server';
import { 
  validateFile, 
  validateFileType, 
  generateUniqueFilename, 
  ALL_SUPPORTED_TYPES,
  getFileCategory,
} from '@/lib/file-upload';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedFiles: Array<{
      filepath: string;
      url: string;
      filename: string;
      mimeType: string;
      size: number;
      type: 'image' | 'document' | 'code' | 'other';
    }> = [];
    const errors: string[] = [];

    for (const fileEntry of files) {
      if (!(fileEntry instanceof File)) {
        errors.push('Invalid file entry');
        continue;
      }

      const file = fileEntry as File;

      const validation = validateFile(file);
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      const typeValidation = validateFileType(file, ALL_SUPPORTED_TYPES);
      if (!typeValidation.valid) {
        errors.push(`${file.name}: ${typeValidation.error}`);
        continue;
      }

      try {
        const uniqueFilename = generateUniqueFilename(file.name);
        const blobKey = `uploads/${uniqueFilename}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const blob = await put(blobKey, buffer, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
          contentType: file.type || undefined,
        });

        uploadedFiles.push({
          filepath: blobKey,
          url: blob.url,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          type: getFileCategory(file.type),
        });
      } catch (uploadError) {
        const message = uploadError instanceof Error ? uploadError.message : 'Upload failed';
        errors.push(`${file.name}: ${message}`);
        console.error('[UploadAPI] Error uploading file:', uploadError);
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      files: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[UploadAPI] Error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
