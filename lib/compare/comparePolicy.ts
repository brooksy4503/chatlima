export const MAX_COMPARE_MODELS = 3;
export const MIN_COMPARE_MODELS = 2;

export type SubmitGateResult =
  | { allowed: true }
  | { allowed: false; reason: string };

export function canSubmitCompare(params: {
  input: string;
  compareModels: string[];
  hasEnoughCredits: (required: number) => boolean;
  estimatedCreditCost: number;
}): SubmitGateResult {
  const { input, compareModels, hasEnoughCredits, estimatedCreditCost } = params;

  if (!input.trim()) {
    return { allowed: false, reason: 'Enter a prompt to compare models.' };
  }

  if (compareModels.length < MIN_COMPARE_MODELS) {
    return { allowed: false, reason: `Select at least ${MIN_COMPARE_MODELS} models to compare.` };
  }

  if (compareModels.length > MAX_COMPARE_MODELS) {
    return { allowed: false, reason: `Maximum ${MAX_COMPARE_MODELS} models per comparison.` };
  }

  if (!hasEnoughCredits(estimatedCreditCost)) {
    return {
      allowed: false,
      reason: `Not enough credits. This comparison needs ~${estimatedCreditCost} credits.`,
    };
  }

  return { allowed: true };
}
