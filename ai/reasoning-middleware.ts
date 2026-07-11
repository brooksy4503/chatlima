import type { LanguageModelV3 } from '@ai-sdk/provider';
import {
  wrapLanguageModel,
  extractReasoningMiddleware,
  type LanguageModel,
} from 'ai';

const tagBasedReasoningMiddleware = extractReasoningMiddleware({
  tagName: 'think',
});

/** Models that embed reasoning in think tags inside the text stream. */
export function usesTagBasedReasoningExtraction(modelId: string): boolean {
  const id = modelId.toLowerCase();
  return (
    id.includes('deepseek-r1') ||
    id.includes('deepseek-reasoner') ||
    id.includes('qwq') ||
    id.includes('grok-3-beta') ||
    id.includes('grok-3-mini-beta') ||
    id.includes('parasail-deepseek-r1')
  );
}

/** Models that expose reasoning via OpenRouter's native reasoning field (no tag middleware). */
export function usesNativeReasoningField(modelId: string): boolean {
  const id = modelId.toLowerCase();
  return id.includes('minimax/m2') || id.includes('minimax-m2');
}

export function wrapWithTagBasedReasoning(model: LanguageModel): LanguageModel;
export function wrapWithTagBasedReasoning(model: unknown): LanguageModel;
export function wrapWithTagBasedReasoning(model: unknown): LanguageModel {
  return wrapLanguageModel({
    model: model as LanguageModelV3,
    middleware: tagBasedReasoningMiddleware,
  }) as LanguageModel;
}
