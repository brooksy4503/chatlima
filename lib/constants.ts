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

/** Polar meter grant sizes (product copy; balance comes from Polar API) */
export const MONTHLY_CREDIT_ALLOWANCE = 1000;
export const YEARLY_CREDIT_ALLOWANCE = 12000;

/** Credit cost for enabling web search on a turn */
export const WEB_SEARCH_COST = 5;

// Configurable model IDs
export const titleGenerationModelId = process.env.TITLE_GENERATION_MODEL_ID || 'openrouter/openai/gpt-5-nano'; 