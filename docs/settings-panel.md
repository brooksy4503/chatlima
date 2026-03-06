# Settings Panel Documentation

## Overview

ChatLima features a unified settings panel that consolidates all configuration options into a single, modern interface. The panel is implemented as a slide-out sheet with horizontal tab navigation, providing a clean and accessible user experience.

## Architecture

### Component Structure

```
components/
├── settings-sheet.tsx           # Main container component
├── settings/
│   ├── api-keys-tab.tsx        # API key management
│   ├── mcp-servers-tab.tsx     # MCP server configuration
│   ├── provider-health-tab.tsx # Provider health monitoring
│   ├── preferences-tab.tsx    # User preferences
│   └── index.ts                # Exports (optional)
```

### Key Components

#### SettingsSheet (`components/settings-sheet.tsx`)

The main container that manages:
- Sheet open/close state
- Horizontal tab navigation
- Content rendering for each tab
- Responsive design (icons-only on mobile, icons+text on desktop)

**Props:**
```typescript
interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
  mcpServers: MCPServer[];
  onMcpServersChange: (servers: MCPServer[]) => void;
  selectedMcpServers: string[];
  onSelectedMcpServersChange: (serverIds: string[]) => void;
  showWelcomeScreen: boolean;
  onShowWelcomeScreenChange: (value: boolean) => void;
  webSearchEnabled: boolean;
  webSearchContextSize: 'low' | 'medium' | 'high';
  onWebSearchContextSizeChange: (value: 'low' | 'medium' | 'high') => void;
}
```

#### API Keys Tab (`components/settings/api-keys-tab.tsx`)

Manages API keys for 6 providers:
- OpenAI
- Anthropic
- Groq
- XAI
- OpenRouter
- Requesty

**Features:**
- Embedded mode (no Dialog wrapper)
- Show/hide password toggles
- Save to localStorage
- Clear all keys option
- Keys persist across sessions
- Bypass credit system when using personal keys

#### MCP Servers Tab (`components/settings/mcp-servers-tab.tsx`)

Provides summary view with:
- Active server count display
- Configured server count display
- Quick server activation badges
- "Manage Servers" button to open existing MCPServerManager dialog

**Note:** Uses existing dialog to preserve all functionality without modification. The MCPServerManager is complex (1400+ lines) with multiple views, OAuth flows, connection testing, and accordion configurations.

#### Provider Health Tab (`components/settings/provider-health-tab.tsx`)

Displays real-time health monitoring:
- Provider status (healthy/degraded/down/unknown)
- Model count per provider
- API key source (ENV vs User)
- Refresh functionality
- Status indicators with color coding

**Uses:** Existing `ProviderHealthDashboard` component in non-dialog mode (`dialogMode={false}`).

#### Preferences Tab (`components/settings/preferences-tab.tsx`)

Manages user preferences:
- Welcome screen toggle (stored in localStorage)
- Web search context size selector (conditional display based on `webSearchEnabled`)
  - Low: Minimal context, faster responses
  - Medium: Balanced context and speed
  - High: Maximum context, slower responses

## Design Decisions

### Why Horizontal Tabs?

1. **Mobile Accessibility**: Horizontal tabs are easier to navigate on mobile devices with touch interfaces
2. **Modern Pattern**: Follows contemporary app design patterns (iOS Settings, Android Settings, VS Code)
3. **Space Efficiency**: Takes less vertical space than sidebar navigation
4. **Visual Clarity**: Clear separation between navigation and content
5. **Scalability**: Easy to add new tabs in the future

### Why Slide-Out Sheet?

1. **Context Preservation**: Users can still see the chat while adjusting settings
2. **Smooth Animations**: Radix UI Sheet provides polished slide-in/out animations
3. **Responsive**: Full-screen on mobile, slide-out on desktop
4. **Non-Blocking**: Doesn't completely obscure the main interface
5. **Familiar Pattern**: Users expect settings in a slide-out panel (Slack, Discord, etc.)

### Why Keep MCP Dialog?

The MCP Server Manager is complex (1400+ lines) with:
- Multiple views (list/add)
- Extensive form state management
- OAuth authorization flows
- Connection testing
- Accordion configurations
- Environment variables and headers management

Keeping it as a separate dialog:
- Preserves all existing functionality
- Avoids risky refactoring of complex component
- Maintains separation of concerns
- Allows standalone use elsewhere if needed
- Reduces development time and risk

## Implementation Details

### Responsive Design

**Desktop (≥640px):**
- Sheet width: 600px (max-w-2xl)
- Tabs show icons + text labels
- Full content area visible
- Side-by-side layouts where applicable

**Mobile (<640px):**
- Full-screen sheet (inset-0)
- Tabs show icons only (text hidden)
- Optimized touch targets
- Stacked layouts for better mobile UX

### State Management

Settings state is managed in `ChatSidebar`:
```typescript
const [settingsOpen, setSettingsOpen] = useState(false);
```

All tab-specific state is passed down through props:
- **MCP servers**: `useMCP()` context (provides `mcpServers`, `selectedMcpServers`, etc.)
- **Web search**: `useWebSearch()` context (provides `webSearchEnabled`, `webSearchContextSize`)
- **Welcome screen**: `useLocalStorage()` hook with `STORAGE_KEYS.SHOW_WELCOME_SCREEN`

### Storage Strategy

- **API Keys**: Browser localStorage via `browser-storage.ts` utilities
  - Keys: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `XAI_API_KEY`, `OPENROUTER_API_KEY`, `REQUESTY_API_KEY`
  - Secure storage in browser only (never sent to server)
  
- **MCP Servers**: Browser localStorage via MCP context
  - Keys: `mcpServers` (server configs), `selectedMcpServers` (active servers)
  
- **Preferences**: Browser localStorage via `useLocalStorage` hook
  - Key: `showWelcomeScreen` (boolean)
  
- **Web Search Context**: React context (`WebSearchContext`)
  - Runtime state, not persisted

### Component Lifecycle

1. User clicks "Settings" button in sidebar
2. `settingsOpen` state changes to `true`
3. `SettingsSheet` renders with slide-in animation
4. Default tab is "api-keys" (configurable via `defaultTab` prop)
5. User can switch between tabs
6. Changes in each tab are immediate (no save button needed, except API Keys)
7. Clicking X or outside sheet closes it
8. State is preserved for next open

## Migration from Old System

### Previous Implementation
- 3 separate modal dialogs (MCP Servers, API Keys, Provider Health)
- Dropdown menu with 4+ items
- Individual open/close state for each modal
- Separate rendering of each dialog

### New Implementation
- Single unified settings panel
- One "Settings" button
- Single `settingsOpen` state
- Horizontal tab navigation
- One `SettingsSheet` component

### Breaking Changes
- **None** - All existing functionality is preserved
- **API**: `ApiKeyManager` and `MCPServerManager` still work standalone with their dialog interfaces
- **Backward Compatibility**: Existing components support both embedded and standalone modes

## Testing Checklist

### Functionality Testing
- [ ] API Keys: Add/edit/clear for all 6 providers
- [ ] API Keys: Show/hide password toggle works for each key
- [ ] API Keys: Keys persist after page reload
- [ ] API Keys: Keys bypass credit system correctly
- [ ] MCP Servers: Add server with SSE transport
- [ ] MCP Servers: Add server with stdio transport
- [ ] MCP Servers: Add server with streamable-http transport
- [ ] MCP Servers: OAuth authorization flow completes successfully
- [ ] MCP Servers: Connection testing shows correct results
- [ ] MCP Servers: Server selection persists
- [ ] MCP Servers: Active server count badge displays correctly
- [ ] Provider Health: Shows correct status for all providers
- [ ] Provider Health: Refresh button updates status
- [ ] Provider Health: Model counts are accurate
- [ ] Provider Health: API key source shows correctly (ENV vs User)
- [ ] Preferences: Welcome screen toggle persists
- [ ] Preferences: Web search context selector works (when enabled)
- [ ] Preferences: Web search options hidden when feature disabled

### UI/UX Testing
- [ ] Sheet opens/closes smoothly with animation
- [ ] Tab navigation works with mouse clicks
- [ ] Tab navigation works with keyboard (Tab, Arrow keys)
- [ ] Active tab is clearly indicated
- [ ] Responsive layout on desktop (≥640px)
- [ ] Responsive layout on mobile (<640px)
- [ ] Icons display correctly on all tabs
- [ ] Text labels display correctly on desktop
- [ ] Text labels hidden on mobile (icons only)
- [ ] Dark mode styling is correct
- [ ] Light mode styling is correct
- [ ] All tabs are accessible and functional
- [ ] No horizontal overflow on narrow screens
- [ ] Scroll works correctly in content area
- [ ] Close button (X) works correctly
- [ ] Clicking outside sheet closes it
- [ ] ESC key closes sheet

### Integration Testing
- [ ] Settings button in sidebar opens panel
- [ ] Active MCP server count badge shows in sidebar button
- [ ] Settings state persists across navigation
- [ ] No memory leaks when opening/closing repeatedly
- [ ] Context updates reflect immediately in settings
- [ ] Settings changes apply immediately (except API keys require save)

## Future Enhancements

Potential improvements for future versions:

1. **Deep Linking**: Support opening settings to specific tab via URL hash
   - Example: `#settings-mcp-servers` opens MCP Servers tab
   - Useful for documentation links and support

2. **Unsaved Changes Warning**: Detect unsaved API key changes before closing
   - Prompt user to save or discard changes
   - Prevent accidental data loss

3. **Search Functionality**: Add search in settings for quick access
   - Search across all settings options
   - Keyboard shortcut (Cmd/Ctrl + K)

4. **Export/Import**: Allow exporting/importing settings configurations
   - JSON export of all settings
   - Import from file
   - Useful for backup and migration

5. **Keyboard Shortcuts**: Add shortcuts for common settings actions
   - `Cmd/Ctrl + ,` to open settings (standard pattern)
   - Tab-specific shortcuts
   - Quick navigation between tabs

6. **Settings Sync**: Sync settings across devices (for authenticated users)
   - Store preferences in database
   - Sync API keys securely (encrypted)

7. **Reset to Defaults**: Add option to reset specific tab to defaults
   - Useful for troubleshooting
   - Per-tab reset option

8. **Settings History**: Track recent settings changes
   - Undo/redo functionality
   - Change history log

## Related Documentation

- [MCP Server Configuration](../README.md#mcp-server-configuration)
- [API Key Management](../README.md#api-keys)
- [Provider Health Dashboard](./provider-health-dashboard.md) (if exists)
- [Web Search Integration](./web-search-integration.md) (if exists)

## Troubleshooting

### Settings Panel Not Opening
- Check browser console for errors
- Verify `settingsOpen` state is being updated
- Ensure `SettingsSheet` component is rendered in sidebar

### API Keys Not Saving
- Check localStorage permissions (private browsing mode)
- Verify browser-storage utilities are working
- Check for localStorage quota exceeded

### MCP Servers Tab Issues
- MCP dialog should open normally
- If not, check MCPServerManager props are passed correctly
- Verify MCP context is providing correct data

### Preferences Not Persisting
- Check localStorage is enabled
- Verify `useLocalStorage` hook is working
- Check STORAGE_KEYS constants are correct

### Responsive Issues
- Test on actual mobile devices
- Check CSS media queries
- Verify Radix Sheet responsive behavior

## Developer Notes

### Adding a New Settings Tab

1. Create new component in `components/settings/new-tab.tsx`
2. Add tab trigger in `SettingsSheet` TabsList
3. Add tab content in `SettingsSheet` TabsContent
4. Pass required props from `SettingsSheet`
5. Update this documentation

### Modifying Existing Tabs

- API Keys: Edit `api-keys-tab.tsx` or `api-key-manager.tsx`
- MCP Servers: Edit `mcp-servers-tab.tsx` or `mcp-server-manager.tsx`
- Provider Health: Edit `provider-health-tab.tsx` or `provider-health-dashboard.tsx`
- Preferences: Edit `preferences-tab.tsx`

### State Management Best Practices

- Keep settings state close to where it's used
- Use React Context for shared state (MCP, WebSearch)
- Use localStorage for persisted preferences
- Pass state down through props for isolated components

---

**Last Updated**: March 2026  
**Version**: 1.0.0  
**Related**: [README.md](../README.md), [CLAUDE.md](../CLAUDE.md), [SPEC.md](../SPEC.md)
