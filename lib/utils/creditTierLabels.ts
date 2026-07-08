/**
 * User-facing labels for credit cost tiers (replaces legacy "free vs premium" copy).
 */

export type CreditTierId = 'free' | 'economy' | 'standard' | 'pro' | 'frontier' | 'ultra';

export interface CreditTierInfo {
  id: CreditTierId;
  label: string;
  shortLabel: string;
}

const TIER_BY_COST: Record<number, CreditTierInfo> = {
  0: { id: 'free', label: 'Free', shortLabel: 'No credits' },
  1: { id: 'economy', label: 'Economy', shortLabel: '1 credit' },
  2: { id: 'standard', label: 'Standard', shortLabel: '2 credits' },
  5: { id: 'pro', label: 'Pro', shortLabel: '5 credits' },
  15: { id: 'frontier', label: 'Frontier', shortLabel: '15 credits' },
  30: { id: 'ultra', label: 'Ultra', shortLabel: '30 credits' },
};

export function getCreditTierInfo(creditCost: number): CreditTierInfo {
  if (TIER_BY_COST[creditCost]) {
    return TIER_BY_COST[creditCost];
  }
  if (creditCost <= 0) return TIER_BY_COST[0];
  if (creditCost <= 1) return TIER_BY_COST[1];
  if (creditCost <= 2) return TIER_BY_COST[2];
  if (creditCost <= 5) return TIER_BY_COST[5];
  if (creditCost <= 15) return TIER_BY_COST[15];
  return TIER_BY_COST[30];
}

export function formatCreditsPerMessage(creditCost: number): string {
  if (creditCost <= 0) return 'no credits';
  const n = Math.round(creditCost);
  return `${n} ${n === 1 ? 'credit' : 'credits'}/msg`;
}

export function formatCreditCostBadge(creditCost: number): string {
  if (creditCost <= 0) return 'Free';
  const n = Math.round(creditCost);
  return `${n}c`;
}
