/**
 * OpenRouter "meta-router" models live under the openrouter/* API namespace
 * (e.g. openrouter/fusion, openrouter/auto). They orchestrate their own
 * server tools (web_search, web_fetch, fusion deliberation) and must not receive
 * ChatLima client/MCP tools or multi-step streamText loops.
 */

/** Strip ChatLima's openrouter/ catalog prefix to get the OpenRouter API model id. */
export function getOpenRouterApiModelId(selectedModel: string): string | null {
  if (!selectedModel.startsWith('openrouter/')) {
    return null;
  }
  return selectedModel.replace(/^openrouter\//, '');
}

/**
 * True when the OpenRouter API model id is under the openrouter/* namespace
 * (Fusion, Auto Router, Free Router, Body Builder, etc.).
 */
export function isOpenRouterMetaRouterModel(selectedModel: string): boolean {
  const apiModelId = getOpenRouterApiModelId(selectedModel);
  return apiModelId !== null && apiModelId.startsWith('openrouter/');
}
