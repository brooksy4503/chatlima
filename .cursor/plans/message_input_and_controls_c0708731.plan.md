---
name: Message input and controls
overview: Soften the message input focus ring, ensure all control-row controls have clear tooltips (including Preset and Model), show full model name on hover when truncated, and keep Send affordance consistent.
todos: []
isProject: false
---

# Message input and controls – UI improvements

## Scope

Four areas, all in existing components:

1. **Input focus ring** – Softer and/or thinner so focus is clear but not dominant.
2. **Control row labels** – Ensure every control (Preset, Model, Attach file, Web search, Send) has a clear tooltip for new users and accessibility.
3. **Model name length** – When the model label is truncated, show full name (and provider) in a tooltip.
4. **Send affordance** – Keep a single, clear tooltip for the send action (up-arrow + “Send” are one button).

---

## 1. Input focus ring

**File:** [components/textarea.tsx](components/textarea.tsx)

**Current:** The message textarea uses `ShadcnTextarea` with a custom `className` (around line 579) that includes `focus-visible:ring-ring`. The base [components/ui/textarea.tsx](components/ui/textarea.tsx) applies `focus-visible:ring-[3px] focus-visible:ring-ring/50`. The passed class can override to full-opacity `ring-ring`, and the theme’s `--ring` matches the primary (orange), so the focus ring can look strong.

**Change:**

- In the `className` for `ShadcnTextarea`, override the focus ring to be thinner and softer:
  - Use `focus-visible:ring-2` (thinner than `ring-[3px]`).
  - Use a softer ring color, e.g. `focus-visible:ring-primary/20` or `focus-visible:ring-ring/30`, so focus is visible but not dominant.
- Keep existing `border-input` and other classes; only adjust the focus-visible ring classes (and remove any `focus-visible:ring-ring` that forces full opacity if present).

**Implementation note:** The current string uses `focus-visible:ring-ring` with no opacity. Replace or add so the effective focus style is `focus-visible:ring-2 focus-visible:ring-primary/20` (or equivalent). If the base ui/textarea is merged via `cn()`, the later class wins, so the override in `textarea.tsx` is sufficient.

---

## 2. Control row tooltips

**Files:** [components/textarea.tsx](components/textarea.tsx), [components/preset-selector.tsx](components/preset-selector.tsx), [components/model-picker.tsx](components/model-picker.tsx)

**Current:**

- **Preset (gear):** [preset-selector.tsx](components/preset-selector.tsx) – Already wrapped in `Tooltip`; content is “Manual Mode” when no preset, or preset name and details when active. Add a short, consistent label for the trigger: e.g. set `aria-label="Preset"` on the `SelectTrigger` (or the element that receives focus) so screen readers and future tooltip copy align. Optionally set tooltip title to “Preset” and keep the existing description below.
- **Model:** [model-picker.tsx](components/model-picker.tsx) – Trigger already has a `Tooltip` with descriptive text (“Select an AI model…”). Add a short label: e.g. prepend “Model” to the tooltip content or use a single line “Model” when that’s enough, so the control is clearly “Model” (handles the “Model” tooltip ask).
- **Paperclip:** [textarea.tsx](components/textarea.tsx) (around 779–806) – Already has `TooltipContent` (“Upload files”, “Hide file upload”, etc.). Ensure copy is clear; e.g. “Attach file” as the primary label is fine. No code change required unless you want to standardize wording to “Attach file”.
- **Globe:** [textarea.tsx](components/textarea.tsx) (around 808–835) – Already has `Tooltip` via `getWebSearchTooltipMessage()`. Optionally standardize to include “Web search” in the message. No structural change required.
- **Send:** [textarea.tsx](components/textarea.tsx) (around 841–874) – Single button (ArrowUp + “Send” text) with `TooltipContent`: “Send message” when not streaming, “Stop generation” when streaming. No change needed; already one clear affordance.

**Change:**

- **PresetSelector:** Add `aria-label="Preset"` (or “Settings”) on the `SelectTrigger` in [preset-selector.tsx](components/preset-selector.tsx). Optionally make the first line of `TooltipContent` “Preset” (or “Settings”) when no preset, and “Preset: …” when preset is active, then the existing description.
- **ModelPicker:** In [model-picker.tsx](components/model-picker.tsx), ensure the existing trigger `TooltipContent` starts with or includes a short “Model” label (e.g. “Model – Select an AI model…” or a first line “Model”) so the control is unambiguously “Model”.
- **Paperclip / Globe / Send:** Confirm tooltips are present and readable; standardize to “Attach file”, “Web search”, “Send message” only if you want strict wording.

---

## 3. Model name length

**File:** [components/model-picker.tsx](components/model-picker.tsx)

**Current:** The trigger button (around 455–460) shows `selectedModelData.name` in a `<span className="text-xs font-medium truncate">`. So long names (e.g. “MoonshotAI: Kimi K2.5”) are truncated with CSS `truncate`. The trigger already has a `Tooltip`, but the content is the generic “Select an AI model…” (or disabled/unavailable text), not the full model name.

**Change:**

- In the same `TooltipContent` for the ModelPicker trigger, include the **full model name** (and optionally provider) when the user hovers. For example:
  - First line: full display name and/or `selectedModel` (e.g. `selectedModelData.name` or the raw id for power users), so when the label is truncated, hover shows the full name.
  - Keep or shorten the existing description below (e.g. “Select an AI model…”).
- Optionally, use a **compact display** in the button (e.g. show only the part after the colon, like “Kimi K2.5”) and put the full “Provider: Full Name” in the tooltip. That would require deriving a short label (e.g. from `selectedModelData.name` or `selectedModel`) and is a larger change; the minimum fix is adding the full name to the existing tooltip.

**Implementation note:** Reuse the existing `Tooltip` / `TooltipTrigger` / `TooltipContent` around the `PopoverTrigger`. In `TooltipContent`, when not disabled and not unavailable, render something like:  
`<p className="font-medium">{selectedModelData.name}</p>` (and optionally `selectedModel` or provider), then the current description. That way truncated labels are explained on hover.

---

## 4. Send affordance

**File:** [components/textarea.tsx](components/textarea.tsx)

**Current:** The send control is one button (lines 843–874) that shows ArrowUp + “Send” when not streaming, and Square + “Stop” when streaming. It has a single `Tooltip` with “Send message” when not streaming and “Stop generation” when streaming. There is no separate up-arrow button; the arrow is inside this button.

**Change:**

- No code change. The design already uses one control and one tooltip. Ensure the tooltip copy remains “Send message” (and “Stop generation” when streaming). If any other send-related control is added later, give it the same tooltip text for consistency.

---

## Files to touch


| File                                                             | Change                                                                                                                                |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| [components/textarea.tsx](components/textarea.tsx)               | Softer focus ring on `ShadcnTextarea` (ring-2, ring-primary/20 or ring-ring/30). Optionally standardize Paperclip/Globe tooltip copy. |
| [components/preset-selector.tsx](components/preset-selector.tsx) | Add `aria-label="Preset"` (or “Settings”) on trigger; optionally add “Preset” as first line of tooltip.                               |
| [components/model-picker.tsx](components/model-picker.tsx)       | In trigger TooltipContent, add full model name (and optionally provider); add short “Model” label for control identity.               |


---

## Testing

- **Focus ring:** Focus the message input; the ring should be visibly thinner and softer, with no strong orange dominance.
- **Tooltips:** Hover (and focus) Preset, Model, Attach file, Web search, and Send; each should show a clear label (e.g. Preset, Model, Attach file, Web search, Send message).
- **Model name:** Select a model with a long name; trigger label may truncate; on hover, tooltip should show the full model name (and optionally provider).
- **Send:** One button, one tooltip “Send message” when idle; no duplicate or conflicting send affordance.

No new dependencies or API changes. All edits are UI-only in the listed components.