import { db } from '@/lib/db';
import { tokenUsageMetrics } from '@/lib/db/schema';
import { gte, lte, sql, and } from 'drizzle-orm';

export interface SystemHealthMetrics {
    uptime: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgResponseTime: number;
    lastCheck: Date;
}

export interface UptimeData {
    timestamp: Date;
    isOnline: boolean;
    responseTime?: number;
    error?: string;
}

export class SystemMonitoringService {
    /**
     * Calculate system uptime based on successful vs total requests
     */
    static async calculateUptime(timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<SystemHealthMetrics> {
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
            case 'hour':
                startDate = new Date(now.getTime() - 60 * 60 * 1000);
                break;
            case 'day':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }

        try {
            const result = await db
                .select({
                    totalRequests: sql<number>`coalesce(count(*), 0)`,
                    successfulRequests: sql<number>`coalesce(count(*) filter (where ${tokenUsageMetrics.status} = 'completed'), 0)`,
                    failedRequests: sql<number>`coalesce(count(*) filter (where ${tokenUsageMetrics.status} = 'failed'), 0)`,
                    avgResponseTime: sql<number>`coalesce(avg(${tokenUsageMetrics.processingTimeMs}), 0) / 1000.0`
                })
                .from(tokenUsageMetrics)
                .where(gte(tokenUsageMetrics.createdAt, startDate));

            const metrics = result[0];
            const totalRequests = metrics?.totalRequests || 0;
            const successfulRequests = metrics?.successfulRequests || 0;
            const failedRequests = metrics?.failedRequests || 0;
            const avgResponseTime = metrics?.avgResponseTime || 0;

            // Calculate uptime percentage
            const uptime = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 99.9;

            return {
                uptime,
                totalRequests,
                successfulRequests,
                failedRequests,
                avgResponseTime,
                lastCheck: now
            };
        } catch (error) {
            console.error('[SystemMonitoring] Error calculating uptime:', error);
            return {
                uptime: 99.9,
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                avgResponseTime: 0,
                lastCheck: now
            };
        }
    }

    /**
     * Get system health metrics for different time periods
     */
    static async getSystemHealth(): Promise<{
        hourly: SystemHealthMetrics;
        daily: SystemHealthMetrics;
        weekly: SystemHealthMetrics;
        monthly: SystemHealthMetrics;
    }> {
        const [hourly, daily, weekly, monthly] = await Promise.all([
            this.calculateUptime('hour'),
            this.calculateUptime('day'),
            this.calculateUptime('week'),
            this.calculateUptime('month')
        ]);

        return {
            hourly,
            daily,
            weekly,
            monthly
        };
    }

    /**
     * Check if system is currently healthy based on recent activity
     */
    static async isSystemHealthy(): Promise<boolean> {
        try {
            const health = await this.calculateUptime('hour');
            return health.uptime >= 95.0; // Consider healthy if 95%+ uptime in last hour
        } catch (error) {
            console.error('[SystemMonitoring] Error checking system health:', error);
            return true; // Assume healthy if we can't determine
        }
    }

    /**
     * Get response time statistics
     */
    static async getResponseTimeStats(timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<{
        avg: number;
        min: number;
        max: number;
        p95: number;
        p99: number;
    }> {
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
            case 'hour':
                startDate = new Date(now.getTime() - 60 * 60 * 1000);
                break;
            case 'day':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }

        try {
            const result = await db
                .select({
                    avg: sql<number>`coalesce(avg(${tokenUsageMetrics.processingTimeMs}), 0) / 1000.0`,
                    min: sql<number>`coalesce(min(${tokenUsageMetrics.processingTimeMs}), 0) / 1000.0`,
                    max: sql<number>`coalesce(max(${tokenUsageMetrics.processingTimeMs}), 0) / 1000.0`,
                    p95: sql<number>`coalesce(percentile_cont(0.95) within group (order by ${tokenUsageMetrics.processingTimeMs}), 0) / 1000.0`,
                    p99: sql<number>`coalesce(percentile_cont(0.99) within group (order by ${tokenUsageMetrics.processingTimeMs}), 0) / 1000.0`
                })
                .from(tokenUsageMetrics)
                .where(and(
                    gte(tokenUsageMetrics.createdAt, startDate),
                    sql`${tokenUsageMetrics.processingTimeMs} IS NOT NULL`
                ));

            const stats = result[0];
            return {
                avg: stats?.avg || 0,
                min: stats?.min || 0,
                max: stats?.max || 0,
                p95: stats?.p95 || 0,
                p99: stats?.p99 || 0
            };
        } catch (error) {
            console.error('[SystemMonitoring] Error getting response time stats:', error);
            return {
                avg: 0,
                min: 0,
                max: 0,
                p95: 0,
                p99: 0
            };
        }
    }

    /**
     * Get error rate statistics
     */
    static async getErrorRate(timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<{
        errorRate: number;
        totalErrors: number;
        totalRequests: number;
        errorBreakdown: Array<{
            status: string;
            count: number;
            percentage: number;
        }>;
    }> {
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
            case 'hour':
                startDate = new Date(now.getTime() - 60 * 60 * 1000);
                break;
            case 'day':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }

        try {
            const result = await db
                .select({
                    status: tokenUsageMetrics.status,
                    count: sql<number>`count(*)`,
                    totalRequests: sql<number>`count(*) over()`
                })
                .from(tokenUsageMetrics)
                .where(gte(tokenUsageMetrics.createdAt, startDate))
                .groupBy(tokenUsageMetrics.status);

            const totalRequests = result[0]?.totalRequests || 0;
            const errorBreakdown = result.map(row => ({
                status: row.status,
                count: row.count,
                percentage: totalRequests > 0 ? (row.count / totalRequests) * 100 : 0
            }));

            const failedRequests = errorBreakdown
                .filter(row => row.status !== 'completed')
                .reduce((sum, row) => sum + row.count, 0);

            const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;

            return {
                errorRate,
                totalErrors: failedRequests,
                totalRequests,
                errorBreakdown
            };
        } catch (error) {
            console.error('[SystemMonitoring] Error getting error rate:', error);
            return {
                errorRate: 0,
                totalErrors: 0,
                totalRequests: 0,
                errorBreakdown: []
            };
        }
    }
}
