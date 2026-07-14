import {
  apiPerTokenToStoredPer1k,
  toPerTokenPrice,
} from '@/lib/services/pricingUnits';

describe('pricingUnits', () => {
  it('converts OpenRouter per-token API price to stored per-1k', () => {
    // Claude Sonnet: $3 / 1M input => $0.000003 per token
    expect(apiPerTokenToStoredPer1k(0.000003)).toBeCloseTo(0.003, 9);
  });

  it('converts stored per-1k price to per-token for cost math', () => {
    expect(toPerTokenPrice(0.003)).toBeCloseTo(0.000003, 9);
  });

  it('round-trips API per-token through storage format', () => {
    const perToken = 0.000015;
    const stored = apiPerTokenToStoredPer1k(perToken);
    expect(toPerTokenPrice(stored)).toBeCloseTo(perToken, 12);
  });
});
