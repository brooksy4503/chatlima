/**
 * Canonical pricing unit for model_pricing and cost calculation:
 * stored prices are USD per 1,000 tokens.
 */

/** Convert API per-token price to stored per-1k price. */
export function apiPerTokenToStoredPer1k(perTokenPrice: number): number {
  return perTokenPrice * 1000;
}

/** Convert stored per-1k price to per-token for cost math. */
export function toPerTokenPrice(storedPer1kPrice: number): number {
  return storedPer1kPrice / 1000;
}
