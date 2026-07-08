import {
  formatCreditCostBadge,
  formatCreditsPerMessage,
  getCreditTierInfo,
} from '@/lib/utils/creditTierLabels';

describe('creditTierLabels', () => {
  it('maps known credit costs to tier labels', () => {
    expect(getCreditTierInfo(0).label).toBe('Free');
    expect(getCreditTierInfo(1).label).toBe('Economy');
    expect(getCreditTierInfo(2).label).toBe('Standard');
    expect(getCreditTierInfo(30).label).toBe('Ultra');
  });

  it('buckets non-exact zero costs into Free tier', () => {
    expect(getCreditTierInfo(-1).label).toBe('Free');
  });

  it('formats credits per message', () => {
    expect(formatCreditsPerMessage(0)).toBe('no credits');
    expect(formatCreditsPerMessage(1)).toBe('1 credit/msg');
    expect(formatCreditsPerMessage(5)).toBe('5 credits/msg');
  });

  it('formats compact badges', () => {
    expect(formatCreditCostBadge(0)).toBe('Free');
    expect(formatCreditCostBadge(2)).toBe('2c');
  });
});
