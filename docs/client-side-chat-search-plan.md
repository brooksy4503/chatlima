# Implementation Plan: Client-Side Chat Title Search in Sidebar

## Overview
Add a search input to the chat sidebar that allows users to filter the list of chats by their titles. The filtering should be performed client-side, updating the displayed chat list in real time as the user types.

---

## Steps

### 1. UI: Add Search Input
- Place a search input field at the top of the chat list section in the sidebar, below the "Chats" label.
- Use a suitable UI component (e.g., the existing `Input` from `@/components/ui/input`).
- Add a search icon (optional, for better UX).

### 2. State Management
- Add a new state variable, e.g., `searchTerm`, using `useState("")` in the `ChatSidebar` component.
- Bind the search input's value to `searchTerm`.
- Update `searchTerm` on every input change.

### 3. Filtering Logic
- When rendering the chat list (`chats.map(...)`), filter the `chats` array based on the `searchTerm`.
- The filter should be case-insensitive and only match against the chat title.
- If `searchTerm` is empty, show all chats.

### 4. UX Considerations
- If no chats match the search, display a "No results found" message.
- Optionally, clear the search input when the sidebar is collapsed or when the user navigates away.
- Ensure accessibility: label the search input appropriately.

### 5. Styling
- Ensure the search input fits visually with the sidebar design.
- Add padding/margin as needed to separate it from the chat list and label.

---

## Example Pseudocode

```tsx
// State
const [searchTerm, setSearchTerm] = useState("");

// In render
<Input
  value={searchTerm}
  onChange={e => setSearchTerm(e.target.value)}
  placeholder="Search chats..."
  aria-label="Search chats by title"
/>

// Filtered chats
const filteredChats = chats.filter(chat =>
  chat.title.toLowerCase().includes(searchTerm.toLowerCase())
);

// Render filteredChats instead of chats
```

---

## File(s) to Update
- `components/chat-sidebar.tsx`

---

## Testing
- Type in the search input and verify that the chat list updates in real time.
- Test with different cases (upper/lower).
- Test with no matches.
- Test with sidebar collapsed/expanded.

---

## Optional Enhancements
- Add a clear ("X") button to the search input.
- Highlight the matching part of the chat title.
- Debounce the search input for performance (not strictly necessary for small lists).

---

**Next Steps:**  
Implement the above plan in `components/chat-sidebar.tsx`. 