---
name: Sidebar clarity fixes
overview: "Implement the first set of sidebar UI improvements: label the bottom token metrics, ensure all footer icons have tooltips, and make the New Chat action more visually distinct from the chat list."
todos: []
isProject: false
---

# Sidebar Task 1 – Clarity and hierarchy

## Scope

Three changes, all in existing components (no new files):

1. **Label the bottom metrics** – Add tooltips (and optionally short labels) so "3.3M", "$4.49", and "511" are clearly Tokens, Cost, and AI Requests.
2. **Footer icon tooltips** – Confirm Documentation, GitHub, FAQ, and Theme have tooltips; add one for Theme in the sidebar if missing.
3. **Separate "New Chat" from the list** – Make the New Chat button the primary action so it doesn’t visually blend with the chat list.

---

## 1. Label the bottom metrics

**File:** [components/token-metrics/ChatTokenSummary.tsx](components/token-metrics/ChatTokenSummary.tsx)

**Current:** `MiniChatTokenSummary` (lines 307–320) shows three items: Coins + token count, cost, BarChart3 + messageCount. Only the third has `title="AI Requests"`.

**Change:**

- Wrap the first item (Coins + `formatNumber(totalTokens)`) in a `title` attribute or a `Tooltip` with text like **"Total tokens"** (or "Tokens used").
- Wrap the second item (cost) in a `title` or `Tooltip` with text like **"Estimated cost"** (or "Usage cost").
- Keep the existing `title="AI Requests"` on the third item.

**Implementation note:** The component does not currently import `Tooltip`. Prefer adding `title` attributes for minimal change and consistent hover behavior with the third metric. If the design system prefers `Tooltip` for all three, add the `Tooltip` import and wrap each of the three `<div>` blocks (same pattern as in [components/chat-sidebar.tsx](components/chat-sidebar.tsx) footer icons).

---

## 2. Footer icon tooltips

**File:** [components/chat-sidebar.tsx](components/chat-sidebar.tsx)

**Current:** Footer (lines 536–591) has:

- Documentation (BookOpen) – has `TooltipContent`: "Documentation".
- GitHub – has "ChatLima on GitHub".
- FAQ (HelpCircle) – has "FAQ".
- `ThemeToggle` – used with `showLabel={false}` and no wrapper `Tooltip`.

**Change:**

- Wrap `ThemeToggle` in a `Tooltip` so the trigger shows a label when collapsed/on hover, e.g. **"Theme"** or **"Appearance"**, consistent with the other footer icons. Use the same `Tooltip` / `TooltipTrigger` / `TooltipContent` pattern as the Documentation link (side="top", sideOffset=5).

No changes needed for the other three icons; they already have tooltips.

---

## 3. Make "New Chat" more distinct

**File:** [components/chat-list.tsx](components/chat-list.tsx)

**Current:** "New Chat" is a `Button` with `variant="outline"` (lines 226–233), directly above the "Search chats..." input and the scrollable chat list. It uses the same outline style as other secondary actions.

**Change (pick one):**

- **Option A (recommended):** Use `variant="default"` for the New Chat button so it uses the primary (filled) style and reads as the main action. Keeps layout and copy unchanged.
- **Option B:** Keep `variant="outline"` but add a subtle separator (e.g. a `Separator` or bottom margin/border under the button + search block) and/or slightly increase vertical spacing between the "New Chat" + search group and the first chat item so the block feels like a distinct "actions" area.

Recommendation: Option A for a clear primary action with minimal code change.

---

## Files to touch


| File                                                                                           | Change                                                                                             |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [components/token-metrics/ChatTokenSummary.tsx](components/token-metrics/ChatTokenSummary.tsx) | Add `title` (or Tooltip) for tokens and cost in `MiniChatTokenSummary`.                            |
| [components/chat-sidebar.tsx](components/chat-sidebar.tsx)                                     | Wrap `ThemeToggle` in `Tooltip` with "Theme" or "Appearance".                                      |
| [components/chat-list.tsx](components/chat-list.tsx)                                           | Change New Chat button to `variant="default"` (and optionally add separator/spacing per Option B). |


---

## Testing

- **Metrics:** Expand sidebar, confirm all three metrics show a tooltip on hover (Tokens, Cost, AI Requests).
- **Footer:** Hover each footer icon (including theme); all should show a tooltip. Collapsed sidebar: theme icon still shows tooltip.
- **New Chat:** Confirm New Chat looks like the primary action (filled style) and that keyboard/screen-reader behavior is unchanged.

No new dependencies or API changes. All edits are UI-only within the listed components.