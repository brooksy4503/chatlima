/**
 * User-facing labels for credit cost tiers (replaces legacy "free vs premium" copy).
 */

export type CreditTierId = 'economy' | 'standard' | 'pro' | 'frontier' | 'ultra';

export interface CreditTierInfo {
  id: CreditTierId;
  label: string;
  shortLabel: string;
}

const TIER_BY_COST: Record<number, CreditTierInfo> = {
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
  if (creditCost <= 1) return TIER_BY_COST[1];
  if (creditCost <= 2) return TIER_BY_COST[2];
  if (creditCost <= 5) return TIER_BY_COST[5];
  if (creditCost <= 15) return TIER_BY_COST[15];
  return TIER_BY_COST[30];
}

export function formatCreditsPerMessage(creditCost: number): string {
  const n = Math.max(1, Math.round(creditCost));
  return `${n} ${n === 1 ? 'credit' : 'credits'}/msg`;
}

export function formatCreditCostBadge(creditCost: number): string {
  const n = Math.max(1, Math.round(creditCost));
  return `${n}c`;
}
