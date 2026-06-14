import { ModelInfo } from '@/lib/types/models';

/**
 * Models with usage-based or multi-completion pricing that OpenRouter lists as
 * non-premium (e.g. pricing "-1"). Overrides tier calculation.
 *
 * Fusion bills as the sum of panel + judge completions (~$0.30–$0.50+ typical).
 * At ~$0.009/credit ($9/mo ≈ 1000 credits), 50 credits ≈ break-even on a $0.45 request.
 */
export const MODEL_CREDIT_COST_OVERRIDES: Record<string, number> = {
  'openrouter/openrouter/fusion': 50,
};

export function getModelCreditCostOverride(modelId: string | undefined | null): number | undefined {
  if (!modelId) return undefined;
  return MODEL_CREDIT_COST_OVERRIDES[modelId];
}

/**
 * Calculates the credit cost per message for a given model
 * Based on tiered pricing structure to protect against expensive model abuse
 * 
 * Tiers (see creditTierLabels.ts for user-facing names):
 * - Economy: 1 credit
 * - Standard ($3-15/M): 2 credits
 * - Pro ($15-50/M): 5 credits
 * - Frontier ($50-100/M): 15 credits
 * - Ultra ($100+/M): 30 credits
 *
 * Some models use {@link MODEL_CREDIT_COST_OVERRIDES} when API pricing is variable.
 */
export function calculateCreditCostPerMessage(modelInfo: ModelInfo | null): number {
  if (!modelInfo) return 1; // Default to 1 credit if model info unavailable

  const override = getModelCreditCostOverride(modelInfo.id);
  if (override !== undefined) return override;

  if (!modelInfo.premium) return 1; // Economy tier

  const inputPrice = modelInfo.pricing?.input || 0;
  const outputPrice = modelInfo.pricing?.output || 0;
  const inputPerMillion = inputPrice * 1000000;
  const outputPerMillion = outputPrice * 1000000;

  // Use the higher of input price or scaled output price (output typically higher volume)
  const maxPrice = Math.max(inputPerMillion, outputPerMillion * 0.5);

  // Tier determination
  if (maxPrice >= 100) return 30;  // Ultra-premium (o1-pro, o3-pro): 30 credits
  if (maxPrice >= 50) return 15;   // Very High premium (gpt-5-pro): 15 credits
  if (maxPrice >= 15) return 5;    // High premium (claude-opus, gpt-4): 5 credits
  if (inputPerMillion >= 3 || outputPerMillion >= 5) return 2; // Standard premium: 2 credits

  return 1; // Fallback
}
