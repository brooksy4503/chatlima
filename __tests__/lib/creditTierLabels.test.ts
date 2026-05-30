import {
  formatCreditCostBadge,
  formatCreditsPerMessage,
  getCreditTierInfo,
} from '@/lib/utils/creditTierLabels';

describe('creditTierLabels', () => {
  it('maps known credit costs to tier labels', () => {
    expect(getCreditTierInfo(1).label).toBe('Economy');
    expect(getCreditTierInfo(2).label).toBe('Standard');
    expect(getCreditTierInfo(30).label).toBe('Ultra');
  });

  it('formats credits per message', () => {
    expect(formatCreditsPerMessage(1)).toBe('1 credit/msg');
    expect(formatCreditsPerMessage(5)).toBe('5 credits/msg');
  });

  it('formats compact badges', () => {
    expect(formatCreditCostBadge(2)).toBe('2c');
  });
});
