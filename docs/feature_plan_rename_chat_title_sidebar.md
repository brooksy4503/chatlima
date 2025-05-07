# Feature Plan: Rename Chat Title in Sidebar

## Overview
Enable users to rename the title of a chat directly from the sidebar. This feature will improve chat organization and user experience by allowing custom, meaningful chat names.

---

## 1. UI/UX Changes

### Sidebar
- [x] Add an edit (pencil) icon or make the chat title clickable in the sidebar chat list. (Implemented with a pencil icon on hover)
- [x] On click, replace the chat title with an input field pre-filled with the current title.
- [x] Show save (checkmark) and cancel (X) icons/buttons next to the input.
- [x] On save, update the title in the sidebar and persist the change.
- [x] On cancel or blur, revert to the original title. (Blur and Escape key revert)
- [x] Show loading indicator or disable input while saving. (Input disabled, loader on save button)
- [x] Optionally, show error feedback if renaming fails. (Implemented via toasts)

### Accessibility
- [x] Ensure input is focusable and accessible via keyboard. (Enter/Escape for save/cancel)
- [x] Provide appropriate ARIA labels for edit/save/cancel actions.

---

## 2. State Management
- [x] Track which chat (if any) is currently being edited in the sidebar state. (`editingChatId` in `ChatSidebar.tsx`)
- [x] Store the temporary input value for the chat being edited. (`editingChatTitle` in `ChatSidebar.tsx`)
- [x] Handle optimistic UI updates: update the title immediately, revert if API call fails. (Handled in `useChats.ts` hook)

---

## 3. Backend/API Changes

### API Endpoint
- [x] Add or update an endpoint to allow renaming a chat (e.g., `PATCH /api/chats/[id]` or similar). (Implemented: `PATCH /api/chats/[id]`)
- [x] Request body: `{ title: string }`
- [x] Response: updated chat object or success status.
- [x] Validate input (e.g., non-empty, reasonable length). (Non-empty, max 255 chars)
- [x] Ensure only authorized users can rename their own chats.

### Database
- [x] Ensure the chat table/model has a `title` field that can be updated. (API updates `title` and `updatedAt`)

---

## 4. Frontend Integration
- [x] Update sidebar chat list component to support edit mode per chat. (`ChatSidebar.tsx`)
- [x] Add event handlers for edit, save, and cancel actions.
- [x] Call the API to persist the new title. (Via `updateChatTitle` in `useChats.ts`)
- [x] Update local state/store on success, handle errors gracefully. (Handled in `useChats.ts`)

---

## 5. Testing
- Unit tests for sidebar component logic (edit, save, cancel, error handling).
- Integration tests for API endpoint (authorization, validation, success, failure).
- Manual/automated UI tests for user flow and accessibility.

---

## 6. Optional Enhancements
- Allow renaming from the main chat view as well.
- Support undo/redo for title changes.
- Show a tooltip or helper text for the edit action.

---

## 7. Rollout & Documentation
- Update user documentation/help to describe the new feature.
- Announce the feature in release notes or changelog. 