/**
 * Constants used throughout the application
 */

// Local storage keys
export const STORAGE_KEYS = {
  MCP_SERVERS: "mcpServers",
  SELECTED_MCP_SERVERS: "selectedMcpServers",
  SIDEBAR_STATE: "sidebarState",
  WEB_SEARCH: "webSearch",
  IMAGE_GENERATION: "imageGeneration",
  SHOW_WELCOME_SCREEN: "showWelcomeScreen",
  SHOW_SUGGESTED_PROMPTS: "showSuggestedPrompts",
  COMPARE_MODE: "compareMode",
  COMPARE_MODELS: "compareModels",
} as const;

// Configurable model IDs
export const titleGenerationModelId = process.env.TITLE_GENERATION_MODEL_ID || 'openrouter/openai/gpt-5-nano'; 