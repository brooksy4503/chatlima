# Projects Feature Plan — Option B (Balanced / Scalable)

## Goal
Add a first-class **Projects** feature where users can:
- Create a project with instructions
- Attach files to a project
- Associate chats with a project
- Automatically include project context during inference

---

## Why Option B
Option B gives us a clean, scalable foundation without overbuilding:
- Better structure than a quick patch
- Lower complexity than full enterprise knowledge architecture
- Easy upgrade path to embeddings/retrieval later

---

## Scope

### In scope
1. Project CRUD
2. Project file attach/list/delete
3. Link chat to project (single active project per chat)
4. Inject project instructions + file references into chat inference context
5. Basic UI for project management and chat project selection

### Out of scope (future)
- Semantic retrieval / embeddings
- Multi-user project permissions
- Advanced ingestion pipelines and chunk-level indexing

---

## Data Model Changes

## 1) `projects`
Create a new table:
- `id` (pk)
- `user_id` (fk -> user.id)
- `name` (required, length-limited)
- `instructions` (text)
- `created_at`
- `updated_at`
- optional `deleted_at` (soft delete, future-safe)

Recommended constraints:
- unique `(user_id, name)`
- name length check (e.g. 1–100)
- instructions max length check (e.g. <= 8000)

## 2) `project_files`
Create a new table:
- `id` (pk)
- `project_id` (fk -> projects.id, cascade delete)
- `filepath`
- `url`
- `filename`
- `mime_type`
- `size`
- `created_at`

Recommended indexes:
- `project_id`
- `(project_id, created_at)`

## 3) Chat ↔ Project link
Use a dedicated link table to stay flexible:
- `chat_projects`
  - `chat_id` (fk -> chats.id, cascade delete)
  - `project_id` (fk -> projects.id, cascade delete)
  - `attached_at`
  - primary key on `(chat_id)` (enforces one active project per chat for now)

This structure can evolve to many-to-many/history later if needed.

---

## API Plan

## Projects
- `GET /api/projects` → list current user projects
- `POST /api/projects` → create project
- `GET /api/projects/[id]` → project details + file list + linked chats count
- `PATCH /api/projects/[id]` → update name/instructions
- `DELETE /api/projects/[id]` → delete project

## Project Files
- `POST /api/projects/[id]/files` → upload/attach files to project
- `GET /api/projects/[id]/files` → list files
- `DELETE /api/projects/[id]/files/[fileId]` → remove file record (and optionally blob)

## Chat Project Link
- `PUT /api/chats/[id]/project` → set or replace active project for chat
- `DELETE /api/chats/[id]/project` → unlink project from chat

Auth: all endpoints require session user and must enforce ownership checks.

---

## Inference Context Assembly

Integrate into `app/api/chat/route.ts` via a helper/service:

`buildProjectContext({ chatId, userId })` should:
1. Resolve project linked to chat
2. Load project instructions
3. Load project files
4. Return structured context block:
   - project name
   - project instructions
   - attached files section with filepath/url hints

Injection strategy:
- Prepend/append to `effectiveSystemInstruction`
- Preserve existing `read_file` tool flow
- Include file references in a deterministic format compatible with current parser logic

Behavior when no project linked:
- no-op (existing behavior unchanged)

---

## UI/UX Plan

## Sidebar
- Add **Projects** section below/alongside Chats
- “New Project” action
- Project list items route to project detail page/modal

## Project Create/Edit
- Name input
- Instructions editor (textarea)
- File upload area
- Save/update controls

## Chat Experience
- Project selector in chat header (or above textarea)
- Show active project badge
- Ability to remove/switch project

## Project Detail
- Files list + delete action
- Linked chats list (or count + quick filter)

---

## Migration Strategy
- Add nullable/new tables only (no destructive changes)
- Existing chats remain unlinked
- No behavior change for existing users until they create/select a project

Optional backfill utility (later):
- select chat(s) and bind to project in bulk

---

## Risks & Mitigations

1. **Prompt bloat from project context**
   - Mitigation: cap instructions and max listed files in system context

2. **File access errors / stale URLs**
   - Mitigation: validate at attach time; handle read_file failures gracefully

3. **Authorization leaks**
   - Mitigation: strict ownership checks on every project/file/link endpoint

4. **UX complexity**
   - Mitigation: start with single-project-per-chat model and simple selector

---

## Delivery Phases

## Phase 1 — Backend Foundation
- Migrations + schema updates
- Project CRUD endpoints
- File attach/list/delete endpoints
- Chat-project link endpoints
- Context builder integrated in `api/chat`

## Phase 2 — Core UI
- Sidebar projects section
- Project create/edit UI
- Project selector in chat
- Active project indicator

## Phase 3 — Hardening
- Tests (API + integration)
- Context size safeguards
- Better file filtering and UX polish
- Telemetry/logging around project context usage

---

## Acceptance Criteria
- User can create a project with instructions
- User can upload files into a project
- User can assign a chat to a project
- Chat requests include project instructions and file references
- Existing chats continue working unchanged
- Ownership checks prevent cross-user access
