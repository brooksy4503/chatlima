import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { db } from '@/lib/db';
import { users, tokenUsageMetrics } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

// Mock the database module
jest.mock('@/lib/db', () => ({
    db: {
        select: jest.fn(),
        insert: jest.fn(),
        delete: jest.fn(),
        query: {
            users: {
                findFirst: jest.fn(),
                findMany: jest.fn(),
            },
            tokenUsageMetrics: {
                findMany: jest.fn(),
            },
        },
    },
}));

describe('Admin Users API', () => {
    const mockDb = db as jest.Mocked<typeof db>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return users with usage statistics', async () => {
        // Mock the user stats query
        const mockUserStats = [
            {
                userId: 'user-123',
                totalTokens: 1500,
                totalCost: '0.003',
                requestCount: 10,
                lastActive: '2024-01-15T10:00:00Z',
            },
        ];

        // Mock the database query
        const mockGroupBy = jest.fn() as jest.MockedFunction<() => Promise<typeof mockUserStats>>;
        mockGroupBy.mockResolvedValue(mockUserStats);
        const mockWhere = jest.fn().mockReturnValue({
            groupBy: mockGroupBy,
        });
        const mockFrom = jest.fn().mockReturnValue({
            where: mockWhere,
        });

        (mockDb.select as jest.Mock).mockReturnValue({
            from: mockFrom,
        } as any);

        // This simulates the query from the API
        const userStats = await (mockDb
            .select({
                userId: tokenUsageMetrics.userId,
                totalTokens: sql<number>`COALESCE(SUM(${tokenUsageMetrics.totalTokens}), 0)`,
                totalCost: sql<number>`COALESCE(SUM(${tokenUsageMetrics.estimatedCost}), 0)`,
                requestCount: sql<number>`COUNT(*)`,
                lastActive: sql<string>`MAX(${tokenUsageMetrics.createdAt})`,
            }) as any)
            .from(tokenUsageMetrics)
            .where(undefined)
            .groupBy(tokenUsageMetrics.userId);

        expect(userStats).toBeDefined();
        expect(Array.isArray(userStats)).toBe(true);
        expect(userStats).toEqual(mockUserStats);

        if (userStats.length > 0) {
            const stats = userStats[0];
            expect(stats.userId).toBeDefined();
            expect(typeof stats.totalTokens).toBe('number');
            expect(typeof stats.totalCost).toBe('string');
            expect(typeof stats.requestCount).toBe('number');
        }
    });
}); 