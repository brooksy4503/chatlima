import { UsageLimitsService } from '@/lib/services/usageLimits';

describe('UsageLimitsService', () => {
    describe('getEffectiveLimits', () => {
        it('should return default limits when no user-specific or global limits exist', async () => {
            const limits = await UsageLimitsService.getEffectiveLimits('test-user-id');

            expect(limits).toBeDefined();
            expect(limits.dailyTokenLimit).toBe(50000);
            expect(limits.monthlyTokenLimit).toBe(1000000);
            expect(limits.dailyCostLimit).toBe(10);
            expect(limits.monthlyCostLimit).toBe(100);
            expect(limits.requestRateLimit).toBe(60);
            expect(limits.currency).toBe('USD');
            expect(limits.isActive).toBe(true);
        });
    });

    describe('checkUsageLimits', () => {
        it('should detect when daily token limit is exceeded', async () => {
            const result = await UsageLimitsService.checkUsageLimits('test-user-id', {
                dailyTokens: 60000, // Exceeds default 50K limit
                monthlyTokens: 500000,
                dailyCost: 5,
                monthlyCost: 50,
            });

            expect(result.isOverLimit).toBe(true);
            expect(result.exceededLimits).toContain('daily_tokens');
        });

        it('should detect when monthly token limit is exceeded', async () => {
            const result = await UsageLimitsService.checkUsageLimits('test-user-id', {
                dailyTokens: 10000,
                monthlyTokens: 1100000, // Exceeds default 1M limit
                dailyCost: 5,
                monthlyCost: 50,
            });

            expect(result.isOverLimit).toBe(true);
            expect(result.exceededLimits).toContain('monthly_tokens');
        });

        it('should detect when daily cost limit is exceeded', async () => {
            const result = await UsageLimitsService.checkUsageLimits('test-user-id', {
                dailyTokens: 10000,
                monthlyTokens: 500000,
                dailyCost: 15, // Exceeds default $10 limit
                monthlyCost: 50,
            });

            expect(result.isOverLimit).toBe(true);
            expect(result.exceededLimits).toContain('daily_cost');
        });

        it('should detect when monthly cost limit is exceeded', async () => {
            const result = await UsageLimitsService.checkUsageLimits('test-user-id', {
                dailyTokens: 10000,
                monthlyTokens: 500000,
                dailyCost: 5,
                monthlyCost: 150, // Exceeds default $100 limit
            });

            expect(result.isOverLimit).toBe(true);
            expect(result.exceededLimits).toContain('monthly_cost');
        });

        it('should detect multiple exceeded limits', async () => {
            const result = await UsageLimitsService.checkUsageLimits('test-user-id', {
                dailyTokens: 60000, // Exceeds daily token limit
                monthlyTokens: 1100000, // Exceeds monthly token limit
                dailyCost: 15, // Exceeds daily cost limit
                monthlyCost: 150, // Exceeds monthly cost limit
            });

            expect(result.isOverLimit).toBe(true);
            expect(result.exceededLimits).toHaveLength(4);
            expect(result.exceededLimits).toContain('daily_tokens');
            expect(result.exceededLimits).toContain('monthly_tokens');
            expect(result.exceededLimits).toContain('daily_cost');
            expect(result.exceededLimits).toContain('monthly_cost');
        });

        it('should not detect limits when usage is within bounds', async () => {
            const result = await UsageLimitsService.checkUsageLimits('test-user-id', {
                dailyTokens: 10000,
                monthlyTokens: 500000,
                dailyCost: 5,
                monthlyCost: 50,
            });

            expect(result.isOverLimit).toBe(false);
            expect(result.exceededLimits).toHaveLength(0);
        });
    });
});
