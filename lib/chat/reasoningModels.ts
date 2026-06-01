/** Models that receive tag-based reasoning system instructions. */
export const REASONING_TAG_MODEL_IDS = [
  'openrouter/deepseek/deepseek-r1',
  'openrouter/deepseek/deepseek-r1-0528',
  'openrouter/deepseek/deepseek-r1-0528-qwen3-8b',
  'openrouter/x-ai/grok-3-beta',
  'openrouter/x-ai/grok-3-mini-beta',
  'openrouter/x-ai/grok-3-mini-beta-reasoning-high',
  'openrouter/qwen/qwq-32b',
] as const;

export const REASONING_TAG_SYSTEM_PROMPT =
  'Please provide your reasoning within <think> tags. After closing the </think> tag, provide your final answer directly without any other special tags.';

/** Models that should disable logprobs in OpenRouter provider options. */
export const LOGPROBS_DISABLED_MODEL_IDS = [
  'openrouter/deepseek/deepseek-r1',
  'openrouter/deepseek/deepseek-r1-0528',
  'openrouter/x-ai/grok-3-beta',
  'openrouter/x-ai/grok-3-mini-beta',
  'openrouter/x-ai/grok-3-mini-beta-reasoning-high',
  'openrouter/qwen/qwq-32b',
] as const;

export function modelUsesReasoningTagInstructions(selectedModel: string): boolean {
  return REASONING_TAG_MODEL_IDS.includes(
    selectedModel as (typeof REASONING_TAG_MODEL_IDS)[number]
  );
}

export function modelShouldDisableLogprobs(selectedModel: string): boolean {
  if (
    LOGPROBS_DISABLED_MODEL_IDS.includes(
      selectedModel as (typeof LOGPROBS_DISABLED_MODEL_IDS)[number]
    )
  ) {
    return true;
  }
  return (
    selectedModel.includes('openrouter/minimax/m2') ||
    selectedModel.includes('openrouter/minimax-m2')
  );
}
