# File Upload System Documentation

## Overview

Chatlima supports a dual-path file upload system that handles both images (for vision analysis) and documents (for AI-assisted file processing).

```
User Upload → Client Validation → Separate Images/Files
                                             ↓
                             Images (base64)    Non-Images (Blob Storage)
                                     ↓                    ↓
                             Vision Analysis        read_file tool
                                     ↓                    ↓
                             AI Processing ←─────────────┘
```

---

## Supported File Types

| Type | MIME Types | Extensions | Parser | AI Usage |
|------|------------|------------|--------|----------|
| **Images** | `image/jpeg`, `image/png`, `image/webp` | `.jpg`, `.jpeg`, `.png`, `.webp` | Image Parser | Vision (base64 inline) |
| **PDF** | `application/pdf` | `.pdf` | PDF Parser | `read_file` tool |
| **CSV** | `text/csv` | `.csv` | CSV Parser | `read_file` tool |
| **Excel** | `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | `.xls`, `.xlsx` | Excel Parser | `read_file` tool |
| **Text/Code** | `text/plain`, `text/markdown`, `application/json`, `application/javascript`, etc. | `.txt`, `.md`, `.json`, `.js`, `.ts`, `.py`, `.java`, `.c`, `.cpp`, `.html`, `.css`, `.yaml`, `.yml` | Text Parser | `read_file` tool |

---

## Limits

| Limit | Value |
|-------|-------|
| Max file size | 30 MB |
| Max files per message | 5 |
| Max Excel rows parsed | 1,000 per sheet |
| Max CSV rows parsed | 10,000 |
| Max text preview | 15,000 characters |

---

## Architecture

### Client-Side Flow

1. **File Selection** - User selects files via drag-drop or file picker
2. **Validation** - Client validates file size and type
3. **Image Processing** - Images are compressed and converted to base64
4. **File Separation** - Images vs documents are separated

### Submission Flow

1. **Upload Non-Images** - Documents are uploaded to Vercel Blob Storage
2. **Build Message** - Message content includes file paths for AI reference
3. **Send to AI** - Images go inline, documents accessible via `read_file` tool

### Server-Side Processing

1. **API Route** - `/api/upload-files` handles multipart uploads
2. **Blob Storage** - Files stored with unique filenames (timestamp-based)
3. **AI Tool** - `read_file` tool fetches and parses files on demand

---

## API Endpoints

### POST /api/upload-files

Upload files to Vercel Blob Storage.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `files` (FormData with multiple files)

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "filepath": "uploads/data_20240206-143022.csv",
      "url": "https://...",
      "filename": "data.csv",
      "mimeType": "text/csv",
      "size": 1024,
      "type": "document"
    }
  ],
  "errors": []
}
```

**Error Response:**
```json
{
  "success": false,
  "files": [],
  "errors": ["file.csv: File size exceeds maximum allowed size"]
}
```

---

## AI Tool: read_file

The `read_file` tool allows the AI to read and parse uploaded files.

**Description:**
> Read contents of a file uploaded by the user. Supports: CSV, Excel, PDF, text files, code files. Returns parsed content based on file type.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `filepath` | string | Path to file (e.g., `uploads/data-2024-02-06-143022.csv`) |

**Example Usage:**
```json
{
  "name": "read_file",
  "arguments": {
    "filepath": "uploads/sales_data-20240206-143022.csv"
  }
}
```

**Response:**
```json
{
  "success": true,
  "content": "CSV Summary:\n- Total rows: 1000\n- Columns: Date, Product, Revenue\n\nFirst 5 rows:\n..."
}
```

---

## Components

### FileUpload

Location: `components/file-upload.tsx`

Unified file upload component supporting all file types.

**Props:**
```typescript
interface FileUploadProps {
  onFileSelect: (files: FileAttachment[]) => void;
  maxFiles?: number;           // Default: 5
  maxSizePerFile?: number;     // Default: 31457280 (30MB)
  acceptedTypes?: string[];    // Default: ALL_SUPPORTED_TYPES
  disabled?: boolean;
  defaultDetail?: "low" | "high" | "auto";  // For images
  showDetailSelector?: boolean;
  className?: string;
}
```

**Usage:**
```tsx
<FileUpload
  onFileSelect={handleFileSelect}
  maxFiles={5}
  disabled={isLoading}
/>
```

### FilePreview

Location: `components/file-preview.tsx`

Preview component showing uploaded files with remove functionality.

**Props:**
```typescript
interface FilePreviewProps {
  files: FileAttachment[];
  onRemove: (index: number) => void;
  maxWidth?: number;   // Default: 120
  maxHeight?: number;  // Default: 120
  className?: string;
}
```

**Usage:**
```tsx
<FilePreview
  files={selectedFiles}
  onRemove={handleFileRemove}
/>
```

---

## Types

### FileAttachment

```typescript
interface FileAttachment {
  file?: File;
  type: 'image' | 'document' | 'code' | 'other';
  uploadedFilePath?: string;    // Blob storage path
  uploadedFileUrl?: string;     // Public URL
  dataUrl?: string;             // Base64 for images
  metadata: {
    filename: string;
    size: number;
    mimeType: string;
    width?: number;
    height?: number;
    originalSize?: number;
    compressedSize?: number;
  };
  detail?: "low" | "high" | "auto";  // Image detail level
}
```

### ImageAttachment (Backward Compatible)

```typescript
// Alias for backward compatibility
type ImageAttachment = FileAttachment;
```

---

## File Parsers

### CSV Parser

Location: `lib/file-reader/csv-parser.ts`

- Auto-detects delimiter (`,`, `;`, `\t`, `|`)
- Handles quoted values
- Returns up to 10,000 rows
- Includes summary with headers and sample data

### Excel Parser

Location: `lib/file-reader/excel-parser.ts`

- Supports `.xls` and `.xlsx`
- Parses multiple sheets
- Returns up to 1,000 rows per sheet
- Includes sheet names and summary

### PDF Parser

Location: `lib/file-reader/pdf-parser.ts`

- Extracts text content
- Includes metadata (pages, title, author)
- Returns up to 5,000 characters preview

### Text/Code Parser

Location: `lib/file-reader/text-parser.ts`

- Handles plain text and code files
- Auto-detects language for syntax highlighting
- Returns up to 15,000 characters preview
- Wraps code in markdown code blocks

---

## Environment Variables

```bash
# Required for Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

### Setup Instructions

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** → **Create new storage**
3. Select **Blob**
4. Copy the `BLOB_READ_WRITE_TOKEN`
5. Add to `.env.local`:
   ```bash
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
   ```

---

## Troubleshooting

### Blob Storage Token Missing

**Error:** Files fail to upload with authentication error

**Solution:** Ensure `BLOB_READ_WRITE_TOKEN` is set in environment variables

### File Too Large

**Error:** "File size exceeds maximum allowed size"

**Solution:** Files must be under 30MB. Compress or split large files.

### Unsupported File Type

**Error:** "File type is not supported"

**Solution:** Check the supported file types table above. Convert to a supported format.

### Upload Fails Silently

**Error:** Upload hangs or fails without error

**Solution:** 
1. Check network connection
2. Verify Blob Storage is enabled in Vercel
3. Check Vercel logs for errors

### AI Cannot Read File

**Error:** AI doesn't analyze uploaded file

**Solution:**
1. Ensure you mentioned the file in your message
2. The file path is included in the message for AI reference
3. AI uses `read_file` tool on demand

---

## Migration from Image-Only System

The file upload system maintains backward compatibility with the previous image-only system:

| Old | New |
|-----|-----|
| `ImageUpload` | `FileUpload` (alias) |
| `ImagePreview` | `FilePreview` (alias) |
| `ImageAttachment` | `FileAttachment` |
| `images` prop | `files` prop |
| `onImagesChange` | `onFilesChange` |
| `handleImageSelect` | `handleFileSelect` |
| `handleImageRemove` | `handleFileRemove` |
| `selectedImages` | `selectedFiles` |

---

## Best Practices

1. **Mention files in your message** - Tell the AI which files to analyze
2. **Use appropriate file types** - CSV for data, PDF for documents
3. **Keep files under 10MB** - Faster uploads and processing
4. **Use descriptive filenames** - Helps AI understand context
5. **One file type per upload** - Mix images and documents as needed

---

## Future Enhancements

- [ ] Audio file support with transcription
- [ ] Video file support with frame extraction
- [ ] Archive extraction (.zip, .tar.gz)
- [ ] Direct cloud storage integration (Google Drive, Dropbox)
- [ ] File expiration and cleanup
- [ ] Progress indicators for large uploads
