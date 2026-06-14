import {
  calculateCreditCostPerMessage,
  getModelCreditCostOverride,
  MODEL_CREDIT_COST_OVERRIDES,
} from '@/lib/utils/creditCostCalculator';
import type { ModelInfo } from '@/lib/types/models';

function makeModelInfo(overrides: Partial<ModelInfo> = {}): ModelInfo {
  return {
    id: 'openrouter/openai/gpt-4.1',
    provider: 'OpenRouter',
    name: 'Test Model',
    description: 'Test',
    capabilities: ['Text'],
    premium: true,
    vision: false,
    status: 'available',
    lastChecked: new Date(),
    pricing: { input: 0.000003, output: 0.000012, currency: 'USD' },
    ...overrides,
  };
}

describe('creditCostCalculator', () => {
  describe('getModelCreditCostOverride', () => {
    it('returns Fusion override', () => {
      expect(getModelCreditCostOverride('openrouter/openrouter/fusion')).toBe(50);
    });

    it('returns undefined for normal models', () => {
      expect(getModelCreditCostOverride('openrouter/openai/gpt-4.1')).toBeUndefined();
    });
  });

  describe('calculateCreditCostPerMessage', () => {
    it('charges 50 credits for Fusion despite non-premium catalog pricing', () => {
      const fusion = makeModelInfo({
        id: 'openrouter/openrouter/fusion',
        name: 'OpenRouter: Fusion',
        premium: false,
        pricing: undefined,
      });

      expect(calculateCreditCostPerMessage(fusion)).toBe(
        MODEL_CREDIT_COST_OVERRIDES['openrouter/openrouter/fusion']
      );
    });

    it('uses tier pricing for premium models without overrides', () => {
      const model = makeModelInfo({
        premium: true,
        pricing: { input: 0.00002, output: 0.00006, currency: 'USD' },
      });

      expect(calculateCreditCostPerMessage(model)).toBe(5);
    });

    it('defaults economy models to 1 credit', () => {
      const model = makeModelInfo({
        premium: false,
        pricing: { input: 0, output: 0, currency: 'USD' },
      });

      expect(calculateCreditCostPerMessage(model)).toBe(1);
    });
  });
});
