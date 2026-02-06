# Upload System (Image Attachments)

In this codebase, “upload” means **attaching images to a chat message**. There is no multipart form upload flow (e.g. `multipart/form-data`) and no object storage flow (e.g. S3 + presigned URLs). Images are converted client-side into base64 **data URLs** and sent inline in the JSON request.

## End-to-end flow

### 1) Client: pick files → validate → turn into `data:image/...;base64,...`

- The UI and basic validation live in `components/image-upload.tsx`:
  - Limits count via `maxFiles`.
  - Limits file size via `maxSizePerFile` (defaults to `2MB`).
  - Restricts MIME types to JPEG/PNG/WebP by default.
- The conversion/compression logic lives in `lib/image-utils.ts`:
  - Reads files as data URLs with `FileReader.readAsDataURL(...)`.
  - Extracts metadata (dimensions, MIME type, filename).
  - Uses canvas-based resizing/compression when needed to target a smaller payload (the code targets ~`3MB` for the *data URL* to avoid platform request size limits).

### 2) Client: store selected images + submit

- The chat UI holds selected images in component state (`selectedImages`).
- On submit, if there are images, it uses `append(...)` to create a **multimodal** user message with `parts`:
  - A text part: `{ type: "text", text: input }`
  - One or more image parts: `{ type: "image_url", image_url: { url: dataUrl, detail }, metadata }`
- This is implemented in `components/chat.tsx` in `handleFormSubmit`.

### 3) Server: accept the request and validate vision support

- The API endpoint is `app/api/chat/route.ts`.
- It parses the JSON body including `messages` and an optional legacy `attachments` array.
- `ChatMessageProcessingService.processMessagesWithAttachments(...)` (`lib/services/chatMessageProcessingService.ts`) does the “attachment” processing:
  - If `attachments` are present, it appends them to the **last user message** as `image_url` parts.
  - It rejects image inputs for models that are not vision-capable (`modelInfo.vision !== true`).

### 4) Server: convert message parts into provider format (OpenRouter/Requesty)

- For OpenRouter/Requesty models, the server converts messages with `parts` to the AI SDK “standard content” array:
  - `text` parts become `{ type: "text", text }`
  - `image_url` parts become `{ type: "image", image: <dataUrl>, mimeType?: <inferred> }`
- This conversion is implemented in `lib/openrouter-utils.ts` (`convertToOpenRouterFormat`).

## Key consequences / limits

- Images are **not stored on the server**. They are embedded as base64 strings inside the chat request payload.
- Request-size limits matter. The implementation tries to keep image payloads small:
  - `components/image-upload.tsx` defaults to `maxFiles = 3` and `maxSizePerFile = 2MB`.
  - `lib/image-utils.ts` applies progressive compression/resizing and has an “emergency” compression pass if the final data URL is still too large.

## Key files

- UI picker + validation: `components/image-upload.tsx`
- Client-side processing (data URL + compression): `lib/image-utils.ts`
- Chat submit wiring (build `parts` and `append`): `components/chat.tsx`
- Server API endpoint: `app/api/chat/route.ts`
- Legacy attachments → parts: `lib/services/chatMessageProcessingService.ts`
- OpenRouter/Requesty formatting: `lib/openrouter-utils.ts`

