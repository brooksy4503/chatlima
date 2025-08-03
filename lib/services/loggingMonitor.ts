/**
 * Logging Monitor Service
 * 
 * Prevents future discrepancies between billing (polar_usage_events) 
 * and analytics (token_usage_metrics) by providing real-time monitoring
 * and alerting capabilities.
 */

import { db } from '../db';
import { tokenUsageMetrics, polarUsageEvents } from '../db/schema';
import { eq, sql, gte, and } from 'drizzle-orm';

export interface LoggingHealthStatus {
    status: 'healthy' | 'warning' | 'critical';
    billingRecords: number;
    analyticsRecords: number;
    discrepancy: number;
    discrepancyPercentage: number;
    lastCheck: string;
    recentErrors: string[];
    recommendations: string[];
}

export interface LoggingAlert {
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: 'discrepancy' | 'failure' | 'performance';
    message: string;
    data: Record<string, any>;
    timestamp: string;
}

export class LoggingMonitorService {
    private static readonly DISCREPANCY_WARNING_THRESHOLD = 0.05; // 5%
    private static readonly DISCREPANCY_CRITICAL_THRESHOLD = 0.10; // 10%
    private static readonly MONITORING_WINDOW_HOURS = 24;

    /**
     * Check the health of logging systems
     */
    static async checkLoggingHealth(): Promise<LoggingHealthStatus> {
        const checkTime = new Date();
        const windowStart = new Date(checkTime.getTime() - (this.MONITORING_WINDOW_HOURS * 60 * 60 * 1000));

        try {
            // Count recent billing records
            const billingCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(polarUsageEvents)
                .where(
                    and(
                        eq(polarUsageEvents.eventName, 'message.processed'),
                        gte(polarUsageEvents.createdAt, windowStart)
                    )
                );

            // Count recent analytics records
            const analyticsCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(tokenUsageMetrics)
                .where(gte(tokenUsageMetrics.createdAt, windowStart));

            const billingRecords = billingCount[0]?.count || 0;
            const analyticsRecords = analyticsCount[0]?.count || 0;
            const discrepancy = billingRecords - analyticsRecords;
            const discrepancyPercentage = billingRecords > 0 ? (discrepancy / billingRecords) : 0;

            // Determine status
            let status: 'healthy' | 'warning' | 'critical' = 'healthy';
            const recommendations: string[] = [];
            const recentErrors: string[] = [];

            if (discrepancyPercentage >= this.DISCREPANCY_CRITICAL_THRESHOLD) {
                status = 'critical';
                recommendations.push('URGENT: Analytics logging is failing. Check database connections and error logs.');
                recommendations.push('Run backfill script to recover missing data.');
                recommendations.push('Investigate saveMessages() and TokenTrackingService errors.');
            } else if (discrepancyPercentage >= this.DISCREPANCY_WARNING_THRESHOLD) {
                status = 'warning';
                recommendations.push('Monitor analytics logging closely for potential issues.');
                recommendations.push('Check recent error logs for database or service failures.');
            }

            if (billingRecords === 0 && analyticsRecords === 0) {
                recommendations.push('No recent activity detected. This may be normal during low-traffic periods.');
            }

            // Check for recent analytics failures
            try {
                const recentFailures = await db
                    .select()
                    .from(tokenUsageMetrics)
                    .where(
                        and(
                            eq(tokenUsageMetrics.status, 'failed'),
                            gte(tokenUsageMetrics.createdAt, windowStart)
                        )
                    )
                    .limit(5);

                recentFailures.forEach(failure => {
                    if (failure.errorMessage) {
                        recentErrors.push(`${failure.createdAt.toISOString()}: ${failure.errorMessage}`);
                    }
                });
            } catch (error) {
                recentErrors.push(`Error checking recent failures: ${error instanceof Error ? error.message : String(error)}`);
            }

            return {
                status,
                billingRecords,
                analyticsRecords,
                discrepancy,
                discrepancyPercentage,
                lastCheck: checkTime.toISOString(),
                recentErrors,
                recommendations
            };

        } catch (error) {
            return {
                status: 'critical',
                billingRecords: 0,
                analyticsRecords: 0,
                discrepancy: 0,
                discrepancyPercentage: 0,
                lastCheck: checkTime.toISOString(),
                recentErrors: [`Health check failed: ${error instanceof Error ? error.message : String(error)}`],
                recommendations: [
                    'Database connection may be down.',
                    'Check database connectivity and service health.',
                    'Investigate logging infrastructure immediately.'
                ]
            };
        }
    }

    /**
     * Generate alerts based on current logging health
     */
    static async generateAlerts(): Promise<LoggingAlert[]> {
        const health = await this.checkLoggingHealth();
        const alerts: LoggingAlert[] = [];

        // Discrepancy alerts
        if (health.status === 'critical') {
            alerts.push({
                severity: 'critical',
                type: 'discrepancy',
                message: `CRITICAL: ${health.discrepancy} analytics records missing (${(health.discrepancyPercentage * 100).toFixed(1)}% loss)`,
                data: {
                    billingRecords: health.billingRecords,
                    analyticsRecords: health.analyticsRecords,
                    discrepancy: health.discrepancy,
                    timeWindow: `${this.MONITORING_WINDOW_HOURS} hours`
                },
                timestamp: health.lastCheck
            });
        } else if (health.status === 'warning') {
            alerts.push({
                severity: 'medium',
                type: 'discrepancy',
                message: `WARNING: ${health.discrepancy} analytics records missing (${(health.discrepancyPercentage * 100).toFixed(1)}% loss)`,
                data: {
                    billingRecords: health.billingRecords,
                    analyticsRecords: health.analyticsRecords,
                    discrepancy: health.discrepancy,
                    timeWindow: `${this.MONITORING_WINDOW_HOURS} hours`
                },
                timestamp: health.lastCheck
            });
        }

        // Failure alerts
        if (health.recentErrors.length > 0) {
            alerts.push({
                severity: health.recentErrors.length > 3 ? 'high' : 'medium',
                type: 'failure',
                message: `${health.recentErrors.length} recent logging errors detected`,
                data: {
                    errors: health.recentErrors,
                    errorCount: health.recentErrors.length
                },
                timestamp: health.lastCheck
            });
        }

        return alerts;
    }

    /**
     * Log health status for monitoring dashboards
     */
    static async logHealthStatus(): Promise<void> {
        const health = await this.checkLoggingHealth();
        const alerts = await this.generateAlerts();

        // Log to console with structured format for log aggregation
        console.log(JSON.stringify({
            timestamp: health.lastCheck,
            service: 'logging-monitor',
            type: 'health-check',
            status: health.status,
            metrics: {
                billingRecords: health.billingRecords,
                analyticsRecords: health.analyticsRecords,
                discrepancy: health.discrepancy,
                discrepancyPercentage: health.discrepancyPercentage
            },
            alerts: alerts.length,
            recommendations: health.recommendations.length
        }));

        // Log alerts separately for monitoring systems
        for (const alert of alerts) {
            console.log(JSON.stringify({
                timestamp: alert.timestamp,
                service: 'logging-monitor',
                type: 'alert',
                severity: alert.severity,
                alertType: alert.type,
                message: alert.message,
                data: alert.data
            }));
        }
    }

    /**
     * Validate that both billing and analytics logging succeeded for a specific operation
     */
    static async validateLoggingCompleteness(
        userId: string,
        operationTimestamp: Date,
        toleranceMs: number = 30000 // 30 second tolerance
    ): Promise<{
        billingLogged: boolean;
        analyticsLogged: boolean;
        complete: boolean;
        details: string;
    }> {
        const startTime = new Date(operationTimestamp.getTime() - toleranceMs);
        const endTime = new Date(operationTimestamp.getTime() + toleranceMs);

        try {
            // Check for billing record
            const billingRecord = await db
                .select()
                .from(polarUsageEvents)
                .where(
                    and(
                        eq(polarUsageEvents.userId, userId),
                        eq(polarUsageEvents.eventName, 'message.processed'),
                        gte(polarUsageEvents.createdAt, startTime),
                        sql`${polarUsageEvents.createdAt} <= ${endTime}`
                    )
                )
                .limit(1);

            // Check for analytics record
            const analyticsRecord = await db
                .select()
                .from(tokenUsageMetrics)
                .where(
                    and(
                        eq(tokenUsageMetrics.userId, userId),
                        gte(tokenUsageMetrics.createdAt, startTime),
                        sql`${tokenUsageMetrics.createdAt} <= ${endTime}`
                    )
                )
                .limit(1);

            const billingLogged = billingRecord.length > 0;
            const analyticsLogged = analyticsRecord.length > 0;
            const complete = billingLogged && analyticsLogged;

            let details = '';
            if (!billingLogged && !analyticsLogged) {
                details = 'Neither billing nor analytics logged';
            } else if (!billingLogged) {
                details = 'Billing missing, analytics present';
            } else if (!analyticsLogged) {
                details = 'Analytics missing, billing present';
            } else {
                details = 'Both systems logged successfully';
            }

            return {
                billingLogged,
                analyticsLogged,
                complete,
                details
            };

        } catch (error) {
            return {
                billingLogged: false,
                analyticsLogged: false,
                complete: false,
                details: `Validation failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    /**
     * Get summary statistics for logging health dashboard
     */
    static async getLoggingSummary(days: number = 7): Promise<{
        totalBillingRecords: number;
        totalAnalyticsRecords: number;
        dailyBreakdown: Array<{
            date: string;
            billingRecords: number;
            analyticsRecords: number;
            discrepancy: number;
        }>;
        overallHealthScore: number;
    }> {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

        try {
            // Get total counts
            const [totalBilling, totalAnalytics] = await Promise.all([
                db.select({ count: sql<number>`count(*)` })
                    .from(polarUsageEvents)
                    .where(
                        and(
                            eq(polarUsageEvents.eventName, 'message.processed'),
                            gte(polarUsageEvents.createdAt, startDate)
                        )
                    ),
                db.select({ count: sql<number>`count(*)` })
                    .from(tokenUsageMetrics)
                    .where(gte(tokenUsageMetrics.createdAt, startDate))
            ]);

            // Get daily breakdown using raw SQL for date grouping
            const dailyBreakdown = await db.execute(sql`
        WITH dates AS (
          SELECT generate_series(
            date_trunc('day', ${startDate}::timestamp),
            date_trunc('day', ${endDate}::timestamp),
            interval '1 day'
          )::date as date
        ),
        billing_daily AS (
          SELECT 
            date_trunc('day', created_at)::date as date,
            count(*) as billing_count
          FROM polar_usage_events 
          WHERE event_name = 'message.processed' 
            AND created_at >= ${startDate}
          GROUP BY date_trunc('day', created_at)::date
        ),
        analytics_daily AS (
          SELECT 
            date_trunc('day', created_at)::date as date,
            count(*) as analytics_count
          FROM token_usage_metrics 
          WHERE created_at >= ${startDate}
          GROUP BY date_trunc('day', created_at)::date
        )
        SELECT 
          d.date,
          COALESCE(b.billing_count, 0) as billing_records,
          COALESCE(a.analytics_count, 0) as analytics_records,
          COALESCE(b.billing_count, 0) - COALESCE(a.analytics_count, 0) as discrepancy
        FROM dates d
        LEFT JOIN billing_daily b ON d.date = b.date
        LEFT JOIN analytics_daily a ON d.date = a.date
        ORDER BY d.date
      `);

            // Calculate overall health score (0-100)
            const totalBillingCount = totalBilling[0]?.count || 0;
            const totalAnalyticsCount = totalAnalytics[0]?.count || 0;
            const overallHealthScore = totalBillingCount > 0
                ? Math.max(0, Math.min(100, (totalAnalyticsCount / totalBillingCount) * 100))
                : 100;

            return {
                totalBillingRecords: totalBillingCount,
                totalAnalyticsRecords: totalAnalyticsCount,
                dailyBreakdown: dailyBreakdown.rows.map((row: any) => ({
                    date: row.date,
                    billingRecords: parseInt(row.billing_records),
                    analyticsRecords: parseInt(row.analytics_records),
                    discrepancy: parseInt(row.discrepancy)
                })),
                overallHealthScore: Math.round(overallHealthScore)
            };

        } catch (error) {
            console.error('Error generating logging summary:', error);
            return {
                totalBillingRecords: 0,
                totalAnalyticsRecords: 0,
                dailyBreakdown: [],
                overallHealthScore: 0
            };
        }
    }
}