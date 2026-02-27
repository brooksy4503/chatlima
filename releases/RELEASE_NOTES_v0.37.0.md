# 🚀 ChatLima v0.37.0 - Improved File Upload System

## 🎯 What's New

This release introduces an **improved dual-path file upload system** with Vercel Blob Storage for documents and enhanced file handling and documentation for user-uploaded files.

### 📎 Dual-Path File Upload

- **Images**: Processed client-side and sent as base64 for vision-capable models
- **Documents**: Uploaded to Vercel Blob Storage and made available to the AI via a `read_file` tool
- **Supported types**: Images (JPEG, PNG, WebP), PDF, CSV, Excel (.xls, .xlsx), and text/code (.txt, .md, .json, .js, .ts, .py, etc.)
- **Limits**: 30 MB max file size, 5 files per message, with parser limits for Excel (1,000 rows/sheet) and CSV (10,000 rows)

### 📄 File Handling & UX

- **File preview** component for images and document metadata
- **Client-side validation** for file size and type before upload
- **Structured documentation** for the file upload system and implementation plan

## 🔧 Technical Implementation

- **`app/api/upload-files/route.ts`**: Multipart upload API storing files in Vercel Blob Storage
- **`app/api/chat/route.ts`**: Chat route updated to accept file references and integrate with the `read_file` tool
- **`components/file-upload.tsx`**: Upload UI with drag-drop and file picker
- **`components/file-preview.tsx`**: Preview for images and document info
- **`lib/file-upload.ts`**: Client-side upload and validation logic
- **`lib/file-reader/`**: Parsers for PDF, CSV, Excel, and text (used by `read_file` tool)
- **`lib/browser-storage.ts`**: Browser storage utilities
- **Tests**: E2E and unit tests for upload API, file-upload component, and file-reader/PDF parser

## 🛡️ Security & Privacy

- Files stored in Vercel Blob with timestamp-based unique names to avoid collisions
- Client-side validation reduces unnecessary server load and improves UX
- Document content is only fetched and parsed when the AI uses the `read_file` tool

## 📈 Benefits

- Users can attach documents and images to conversations for vision and RAG-style use cases
- Clear separation between vision (inline images) and document processing (Blob + tool) keeps payloads and costs predictable
- Documented architecture and limits make it easier to extend or tune the system

## 🔄 Migration Notes

- No breaking changes. Existing chats and API usage remain unchanged.
- Optional: ensure `BLOB_READ_WRITE_TOKEN` (or equivalent) is set in Vercel for Blob Storage if using document uploads.

## 🚀 Deployment

- Build and tests: `pnpm build` (Playwright tests require `pn exec playwright install` for browser binaries)
- Push to `main` triggers automatic production deployment via GitHub/Vercel integration
- No database migrations required

---

**Full Changelog**: [v0.36.1...v0.37.0](https://github.com/brooksy4503/chatlima/compare/v0.36.1...v0.37.0)
