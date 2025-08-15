/**
 * Constants used throughout the application
 */

// Local storage keys
export const STORAGE_KEYS = {
  MCP_SERVERS: "mcpServers",
  SELECTED_MCP_SERVERS: "selectedMcpServers",
  SIDEBAR_STATE: "sidebarState",
  WEB_SEARCH: "webSearch"
} as const;

// Configurable model IDs
export const titleGenerationModelId = process.env.TITLE_GENERATION_MODEL_ID || 'openrouter/qwen/qwen-turbo'; 