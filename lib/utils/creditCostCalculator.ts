import { ModelInfo } from '@/lib/types/models';

/**
 * Calculates the credit cost per message for a given model
 * Based on tiered pricing structure to protect against expensive model abuse
 * 
 * Tiers:
 * - Free/Standard models: 1 credit
 * - Premium ($3-15/M input or $5-50/M output): 2 credits  
 * - High Premium ($15-50/M): 5 credits
 * - Very High Premium ($50-100/M): 15 credits
 * - Ultra Premium ($100+/M): 30 credits
 */
export function calculateCreditCostPerMessage(modelInfo: ModelInfo | null): number {
  if (!modelInfo) return 1; // Default to 1 credit if model info unavailable
  if (!modelInfo.premium) return 1; // Free/standard models: 1 credit

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
