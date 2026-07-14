import { CostCalculationService } from '@/lib/services/costCalculation';
import { UsageCostAggregationService } from '@/lib/services/usageCostAggregation';
import { db } from '@/lib/db';
import { tokenUsageMetrics } from '@/lib/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

jest.mock('@/lib/db', () => ({
    db: {
        query: {
            tokenUsageMetrics: {
                findFirst: jest.fn(),
                findMany: jest.fn(),
            },
            modelPricing: {
                findFirst: jest.fn(),
            },
        },
        insert: jest.fn(),
    },
}));

const mockTokenUsageMetricsFindFirst = jest.fn() as jest.Mock;
const mockTokenUsageMetricsFindMany = jest.fn() as jest.Mock;

beforeEach(() => {
    mockTokenUsageMetricsFindFirst.mockReset();
    mockTokenUsageMetricsFindMany.mockReset();
    // @ts-ignore
    db.query.tokenUsageMetrics.findFirst = mockTokenUsageMetricsFindFirst;
    // @ts-ignore
    db.query.tokenUsageMetrics.findMany = mockTokenUsageMetricsFindMany;
});

describe('CostCalculationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('calculateCostForRecord', () => {
        it('returns stored provider-truth cost from the record', async () => {
            mockTokenUsageMetricsFindFirst.mockResolvedValue({
                id: 'record-123',
                inputTokens: 1000,
                outputTokens: 500,
                totalTokens: 1500,
                actualCost: '0.05',
                estimatedCost: '0.01',
            });

            const result = await CostCalculationService.calculateCostForRecord('record-123');

            expect(result.totalCost).toBe(0.05);
            expect(result.inputTokens).toBe(1000);
            expect(result.outputTokens).toBe(500);
        });

        it('throws when record is not found', async () => {
            mockTokenUsageMetricsFindFirst.mockResolvedValue(null);

            await expect(
                CostCalculationService.calculateCostForRecord('missing')
            ).rejects.toThrow('Token usage record with ID missing not found');
        });
    });

    describe('calculateCost', () => {
        it('returns fast estimate without database pricing lookup', async () => {
            const result = await CostCalculationService.calculateCost(
                1000,
                500,
                'openrouter/openai/gpt-4o',
                'openrouter'
            );

            expect(result.totalTokens).toBe(1500);
            expect(result.totalCost).toBeGreaterThanOrEqual(0);
            expect(result.volumeDiscountApplied).toBe(false);
            expect(mockTokenUsageMetricsFindMany).not.toHaveBeenCalled();
        });
    });

    describe('getAggregatedCosts', () => {
        it('aggregates stored actual and estimated costs', async () => {
            mockTokenUsageMetricsFindMany.mockResolvedValue([
                {
                    inputTokens: 1000,
                    outputTokens: 500,
                    actualCost: '0.10',
                    estimatedCost: '0.05',
                    provider: 'openrouter',
                    modelId: 'openrouter/openai/gpt-4o',
                    createdAt: new Date('2026-01-01'),
                },
                {
                    inputTokens: 200,
                    outputTokens: 100,
                    actualCost: null,
                    estimatedCost: '0.02',
                    provider: 'openrouter',
                    modelId: 'openrouter/openai/gpt-4o-mini',
                    createdAt: new Date('2026-01-02'),
                },
            ]);

            const result = await CostCalculationService.getAggregatedCosts('user-123');

            expect(result.totalCost).toBeCloseTo(0.12, 5);
            expect(result.requestCount).toBe(2);
            expect(result.totalDiscount).toBe(0);
        });

        it('handles empty results', async () => {
            mockTokenUsageMetricsFindMany.mockResolvedValue([]);

            const result = await CostCalculationService.getAggregatedCosts('user-123');

            expect(result.totalCost).toBe(0);
            expect(result.requestCount).toBe(0);
        });

        it('propagates database errors', async () => {
            mockTokenUsageMetricsFindMany.mockRejectedValue(new Error('Database query failed'));

            await expect(CostCalculationService.getAggregatedCosts('user-123')).rejects.toThrow(
                'Database query failed'
            );
        });
    });

    describe('calculateProjectedCosts', () => {
        it('projects from aggregated stored costs', async () => {
            jest.spyOn(UsageCostAggregationService, 'getAggregatedCosts').mockResolvedValue({
                totalInputTokens: 30000,
                totalOutputTokens: 15000,
                totalTokens: 45000,
                totalInputCost: 0.015,
                totalOutputCost: 0.0225,
                totalSubtotal: 0.0375,
                totalDiscount: 0,
                totalCost: 0.0375,
                currency: 'USD',
                requestCount: 30,
                averageCostPerRequest: 0.00125,
                averageCostPerToken: 0.000000833,
                breakdownByProvider: {},
                breakdownByModel: {},
                breakdownByDay: {},
            });

            const result = await CostCalculationService.calculateProjectedCosts('user-123', {
                periodDays: 30,
            });

            expect(result.projectedMonthlyCost).toBeCloseTo(0.0375, 4);
            expect(result.confidence).toBe('medium');
        });
    });

    describe('checkUsageLimits', () => {
        it('checks limits against aggregated stored costs', async () => {
            jest.spyOn(UsageCostAggregationService, 'getAggregatedCosts').mockResolvedValue({
                totalInputTokens: 1000,
                totalOutputTokens: 500,
                totalTokens: 1500,
                totalInputCost: 40,
                totalOutputCost: 0,
                totalSubtotal: 40,
                totalDiscount: 0,
                totalCost: 40,
                currency: 'USD',
                requestCount: 10,
                averageCostPerRequest: 4,
                averageCostPerToken: 0.026,
                breakdownByProvider: {},
                breakdownByModel: {},
                breakdownByDay: {},
            });

            const result = await CostCalculationService.checkUsageLimits('user-123', {
                monthlyLimit: 100,
            });

            expect(result.isOverLimit).toBe(false);
            expect(result.currentUsage).toBe(40);
            expect(result.percentageUsed).toBe(40);
        });
    });

    describe('provider configuration', () => {
        it('returns provider config when available', () => {
            const config = CostCalculationService.getProviderConfig('openai');
            expect(config).toBeDefined();
            expect(config?.provider).toBe('openai');
        });

        it('returns undefined for unknown provider', () => {
            expect(CostCalculationService.getProviderConfig('non-existent')).toBeUndefined();
        });

        it('returns all provider configs', () => {
            const configs = CostCalculationService.getAllProviderConfigs();
            expect(configs.length).toBeGreaterThan(0);
        });
    });
});
