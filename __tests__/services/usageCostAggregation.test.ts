import { UsageCostAggregationService } from '@/lib/services/usageCostAggregation';

jest.mock('@/lib/db', () => ({
    db: {
        query: {
            tokenUsageMetrics: {
                findMany: jest.fn(),
            },
        },
    },
}));

import { db } from '@/lib/db';

describe('UsageCostAggregationService', () => {
    const mockFindMany = db.query.tokenUsageMetrics.findMany as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('aggregates stored actual and estimated costs', async () => {
        mockFindMany.mockResolvedValue([
            {
                inputTokens: 100,
                outputTokens: 50,
                totalTokens: 150,
                actualCost: '0.10',
                estimatedCost: '0.05',
                provider: 'openrouter',
                modelId: 'openrouter/openai/gpt-4o',
                createdAt: new Date('2026-01-15T12:00:00.000Z'),
            },
            {
                inputTokens: 200,
                outputTokens: 100,
                totalTokens: 300,
                actualCost: null,
                estimatedCost: '0.03',
                provider: 'openrouter',
                modelId: 'openrouter/openai/gpt-4o-mini',
                createdAt: new Date('2026-01-16T12:00:00.000Z'),
            },
        ]);

        const result = await UsageCostAggregationService.getAggregatedCosts('user-1');

        expect(result.totalCost).toBeCloseTo(0.13, 5);
        expect(result.requestCount).toBe(2);
        expect(result.totalDiscount).toBe(0);
        expect(result.breakdownByProvider.openrouter.totalCost).toBeCloseTo(0.13, 5);
        expect(result.breakdownByModel['openrouter/openai/gpt-4o'].totalCost).toBeCloseTo(0.1, 5);
    });

    it('calculates projected costs from aggregated totals', async () => {
        jest.spyOn(UsageCostAggregationService, 'getAggregatedCosts').mockResolvedValue({
            totalInputTokens: 1000,
            totalOutputTokens: 500,
            totalTokens: 1500,
            totalInputCost: 0.2,
            totalOutputCost: 0.1,
            totalSubtotal: 0.3,
            totalDiscount: 0,
            totalCost: 0.3,
            currency: 'USD',
            requestCount: 10,
            averageCostPerRequest: 0.03,
            averageCostPerToken: 0.0002,
            breakdownByProvider: {},
            breakdownByModel: {},
            breakdownByDay: {},
        });

        const projected = await UsageCostAggregationService.calculateProjectedCosts('user-1', {
            periodDays: 30,
        });

        expect(projected.projectedDailyCost).toBeCloseTo(0.01, 5);
        expect(projected.projectedMonthlyCost).toBeCloseTo(0.3, 5);
    });
});
