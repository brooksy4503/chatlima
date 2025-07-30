import type { ImageMetadata } from './types';

interface ImageProcessingOptions {
    maxSize: number;
    allowedTypes: string[];
}

export async function processImageFile(file: File): Promise<{
    dataUrl: string;
    metadata: ImageMetadata;
}> {
    console.log('[DEBUG] processImageFile called for:', {
        filename: file.name,
        size: file.size,
        type: file.type
    });

    // Determine if we need to compress/resize the image to stay under payload limits
    // Vercel has a 4.5MB payload limit, so we target ~3MB for images after base64 encoding
    const targetPayloadSize = 3 * 1024 * 1024; // 3MB in bytes
    const estimatedBase64Size = (file.size * 4) / 3; // Base64 is ~33% larger than binary

    let processedFile = file;

    if (estimatedBase64Size > targetPayloadSize || file.size > 5 * 1024 * 1024) { // 5MB raw file size
        console.log('[DEBUG] Image is large, compressing...', {
            originalSize: file.size,
            estimatedBase64Size,
            targetPayloadSize
        });

        // Progressive compression - try multiple passes if needed
        const compressionAttempts = [
            { maxWidth: 2048, maxHeight: 2048, quality: 0.85 },
            { maxWidth: 1792, maxHeight: 1792, quality: 0.8 },
            { maxWidth: 1536, maxHeight: 1536, quality: 0.75 },
            { maxWidth: 1280, maxHeight: 1280, quality: 0.7 },
            { maxWidth: 1024, maxHeight: 1024, quality: 0.65 },
            { maxWidth: 800, maxHeight: 800, quality: 0.6 }
        ];

        let currentFile = file;
        let attemptIndex = 0;

        // Choose starting point based on file size
        if (file.size > 15 * 1024 * 1024) { // > 15MB
            attemptIndex = 2; // Start with 1536x1536 @ 75%
        } else if (file.size > 10 * 1024 * 1024) { // > 10MB  
            attemptIndex = 1; // Start with 1792x1792 @ 80%
        }

        for (let i = attemptIndex; i < compressionAttempts.length; i++) {
            const { maxWidth, maxHeight, quality } = compressionAttempts[i];

            try {
                const compressedFile = await resizeImageIfNeeded(currentFile, maxWidth, maxHeight, quality);
                const compressedDataUrl = await fileToDataUrl(compressedFile);

                console.log(`[DEBUG] Compression attempt ${i + 1}:`, {
                    settings: `${maxWidth}x${maxHeight} @ ${quality * 100}%`,
                    originalSize: file.size,
                    compressedSize: compressedFile.size,
                    dataUrlLength: compressedDataUrl.length,
                    compressionRatio: (compressedFile.size / file.size * 100).toFixed(1) + '%',
                    underLimit: compressedDataUrl.length <= targetPayloadSize
                });

                // If we're under the target size, use this version
                if (compressedDataUrl.length <= targetPayloadSize) {
                    processedFile = compressedFile;
                    console.log(`[SUCCESS] Image compressed successfully on attempt ${i + 1}`);
                    break;
                } else {
                    // Continue with the compressed file for the next attempt
                    currentFile = compressedFile;
                    processedFile = compressedFile; // Keep the best we have so far
                }
            } catch (error) {
                console.warn(`[DEBUG] Compression attempt ${i + 1} failed:`, error);
                if (i === compressionAttempts.length - 1) {
                    // Last attempt failed, use whatever we have
                    console.warn('[DEBUG] All compression attempts failed, using best available');
                }
            }
        }

        console.log('[DEBUG] Final compression result:', {
            originalSize: file.size,
            finalSize: processedFile.size,
            compressionRatio: (processedFile.size / file.size * 100).toFixed(1) + '%'
        });
    }

    // Extract metadata from processed file
    console.log('[DEBUG] Extracting image metadata...');
    const metadata = await extractImageMetadata(processedFile);
    console.log('[DEBUG] Metadata extracted:', metadata);

    // Generate base64 data URL in AI SDK compatible format (used by OpenRouter and Requesty)
    console.log('[DEBUG] Converting file to data URL...');
    let dataUrl = await fileToDataUrl(processedFile);
    console.log('[DEBUG] Data URL created, length:', dataUrl.length);

    // Final validation and emergency compression if still too large
    if (dataUrl.length > targetPayloadSize) {
        console.warn('[DEBUG] Data URL still too large after compression, attempting emergency compression:', {
            dataUrlLength: dataUrl.length,
            targetSize: targetPayloadSize
        });

        // Emergency ultra-aggressive compression
        try {
            const emergencyFile = await resizeImageIfNeeded(processedFile, 640, 640, 0.5);
            const emergencyDataUrl = await fileToDataUrl(emergencyFile);

            console.log('[DEBUG] Emergency compression result:', {
                originalDataUrlLength: dataUrl.length,
                emergencyDataUrlLength: emergencyDataUrl.length,
                underLimit: emergencyDataUrl.length <= targetPayloadSize
            });

            if (emergencyDataUrl.length <= targetPayloadSize) {
                processedFile = emergencyFile;
                dataUrl = emergencyDataUrl;
                console.log('[SUCCESS] Emergency compression successful');
            } else {
                console.error('[ERROR] Even emergency compression failed - image may be too complex or large');
            }
        } catch (error) {
            console.error('[ERROR] Emergency compression failed:', error);
        }
    }

    const result = {
        dataUrl,
        metadata: {
            ...metadata,
            originalSize: file.size, // Keep track of original size
            compressedSize: processedFile.size
        }
    };

    console.log('[DEBUG] processImageFile complete for:', file.name);
    return result;
}

export function validateImageFile(file: File, options: ImageProcessingOptions = {
    maxSize: 20 * 1024 * 1024, // 20MB (compatible with most AI providers)
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] // Standard formats supported by most AI providers
}): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > options.maxSize) {
        return {
            valid: false,
            error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(options.maxSize)})`
        };
    }

    // Check MIME type
    if (!options.allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `File type '${file.type}' is not supported. Supported types: ${options.allowedTypes.join(', ')}`
        };
    }

    // Additional security checks
    if (!file.name || file.name.trim() === '') {
        return {
            valid: false,
            error: 'File must have a valid name'
        };
    }

    return { valid: true };
}

export async function getImageDimensions(file: File): Promise<{
    width: number;
    height: number;
}> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}

async function extractImageMetadata(file: File): Promise<ImageMetadata> {
    try {
        const dimensions = await getImageDimensions(file);

        return {
            filename: file.name,
            size: file.size,
            mimeType: file.type,
            width: dimensions.width,
            height: dimensions.height
        };
    } catch (error) {
        // Fallback metadata if dimension extraction fails
        return {
            filename: file.name,
            size: file.size,
            mimeType: file.type,
            width: 0,
            height: 0
        };
    }
}

async function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to convert file to data URL'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Error reading file'));
        };

        reader.readAsDataURL(file);
    });
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function validateDataUrl(dataUrl: string): { valid: boolean; error?: string } {
    // Validate base64 data URL format: data:image/{type};base64,{data}
    if (!dataUrl.startsWith('data:image/')) {
        return { valid: false, error: 'Invalid data URL format - must start with data:image/' };
    }

    // Check for supported formats (standard formats supported by most AI providers)
    const validTypes = ['data:image/jpeg', 'data:image/png', 'data:image/webp'];
    if (!validTypes.some(type => dataUrl.startsWith(type))) {
        return { valid: false, error: 'Unsupported image format. Use JPEG, PNG, or WebP' };
    }

    // Check if it's properly base64 encoded
    if (!dataUrl.includes(';base64,')) {
        return { valid: false, error: 'Data URL must be base64 encoded' };
    }

    // Estimate file size from base64 (rough calculation)
    const base64Data = dataUrl.split(',')[1];
    const estimatedSize = (base64Data.length * 3) / 4; // Base64 is ~33% larger than original

    if (estimatedSize > 20 * 1024 * 1024) { // 20MB limit (compatible with most AI providers)
        return { valid: false, error: 'Image data too large (exceeds 20MB limit)' };
    }

    return { valid: true };
}

export function resizeImageIfNeeded(file: File, maxWidth: number = 2048, maxHeight: number = 2048, quality: number = 0.9): Promise<File> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            const { width, height } = img;

            // Calculate new dimensions while maintaining aspect ratio
            let newWidth = width;
            let newHeight = height;

            if (width > maxWidth || height > maxHeight) {
                const aspectRatio = width / height;

                if (width > height) {
                    newWidth = maxWidth;
                    newHeight = maxWidth / aspectRatio;
                } else {
                    newHeight = maxHeight;
                    newWidth = maxHeight * aspectRatio;
                }
            }

            // Always process the image to apply quality compression, even if dimensions don't change
            // This is crucial for reducing file size when dealing with large images
            canvas.width = newWidth;
            canvas.height = newHeight;

            ctx?.drawImage(img, 0, 0, newWidth, newHeight);

            // Use JPEG for better compression, unless it's already WebP
            const outputFormat = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
            const outputExtension = outputFormat === 'image/webp' ? '.webp' : '.jpg';
            const originalName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
            const outputName = originalName + outputExtension;

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const resizedFile = new File([blob], outputName, {
                            type: outputFormat,
                            lastModified: Date.now()
                        });
                        resolve(resizedFile);
                    } else {
                        resolve(file); // Fallback to original if resize fails
                    }
                },
                outputFormat,
                quality
            );
        };

        img.onerror = () => {
            resolve(file); // Fallback to original if image load fails
        };

        img.src = URL.createObjectURL(file);
    });
} 