/**
 * Cleanup Monitoring Service
 * 
 * Provides monitoring, alerting, and notification capabilities for the 
 * anonymous user cleanup system.
 */

export interface CleanupMetrics {
    executionId: string;
    executedAt: Date;
    executedBy: 'admin' | 'cron' | 'script';
    adminUser?: string;
    usersCounted: number;
    usersDeleted: number;
    thresholdDays: number;
    batchSize: number;
    durationMs: number;
    status: 'success' | 'error' | 'partial';
    errorMessage?: string;
    errorCount: number;
    dryRun: boolean;
    deletedUserIds?: string[];
}

export interface AlertCondition {
    type: 'execution_failure' | 'high_deletion_count' | 'long_execution_time' | 'success_notification';
    severity: 'info' | 'warning' | 'error' | 'critical';
    threshold?: number;
    message: string;
    shouldNotify: boolean;
}

export class CleanupMonitoringService {

    /**
     * Analyze execution metrics and determine alert conditions
     */
    static analyzeExecution(metrics: CleanupMetrics): AlertCondition[] {
        const alerts: AlertCondition[] = [];

        // 1. Execution failure alerts
        if (metrics.status === 'error') {
            alerts.push({
                type: 'execution_failure',
                severity: 'error',
                message: `Cleanup execution failed: ${metrics.errorMessage || 'Unknown error'}`,
                shouldNotify: true,
            });
        } else if (metrics.status === 'partial') {
            alerts.push({
                type: 'execution_failure',
                severity: 'warning',
                message: `Cleanup execution completed with ${metrics.errorCount} errors`,
                shouldNotify: true,
            });
        }

        // 2. High deletion count alerts (>10% of typical batch size or >25 users)
        const highDeletionThreshold = Math.max(Math.floor(metrics.batchSize * 0.1), 25);
        if (metrics.usersDeleted > highDeletionThreshold && !metrics.dryRun) {
            alerts.push({
                type: 'high_deletion_count',
                severity: 'warning',
                threshold: highDeletionThreshold,
                message: `High deletion count: ${metrics.usersDeleted} users deleted (threshold: ${highDeletionThreshold})`,
                shouldNotify: true,
            });
        }

        // 3. Long execution time alerts (>5 minutes = 300,000ms)
        const longExecutionThreshold = 300000;
        if (metrics.durationMs > longExecutionThreshold) {
            alerts.push({
                type: 'long_execution_time',
                severity: 'warning',
                threshold: longExecutionThreshold,
                message: `Long execution time: ${Math.round(metrics.durationMs / 1000)}s (threshold: ${longExecutionThreshold / 1000}s)`,
                shouldNotify: true,
            });
        }

        // 4. Success notifications (for cron jobs only)
        if (metrics.status === 'success' && metrics.executedBy === 'cron' && !metrics.dryRun) {
            alerts.push({
                type: 'success_notification',
                severity: 'info',
                message: `Automated cleanup completed successfully: ${metrics.usersDeleted} users deleted in ${Math.round(metrics.durationMs / 1000)}s`,
                shouldNotify: false, // Only notify on request or if configured
            });
        }

        return alerts;
    }

    /**
     * Generate comprehensive execution report
     */
    static generateExecutionReport(metrics: CleanupMetrics, alerts: AlertCondition[]): string {
        const report = [
            `🧹 Anonymous User Cleanup Report`,
            ``,
            `📊 Execution Summary:`,
            `• Execution ID: ${metrics.executionId}`,
            `• Executed: ${metrics.executedAt.toISOString()}`,
            `• Triggered by: ${metrics.executedBy}${metrics.adminUser ? ` (${metrics.adminUser})` : ''}`,
            `• Status: ${metrics.status.toUpperCase()}${metrics.dryRun ? ' (DRY RUN)' : ''}`,
            `• Duration: ${Math.round(metrics.durationMs / 1000)}s`,
            ``,
            `👥 User Statistics:`,
            `• Users analyzed: ${metrics.usersCounted}`,
            `• Users ${metrics.dryRun ? 'would be ' : ''}deleted: ${metrics.usersDeleted}`,
            `• Threshold: ${metrics.thresholdDays} days of inactivity`,
            `• Batch size: ${metrics.batchSize}`,
            ``,
        ];

        // Add error information if present
        if (metrics.errorCount > 0) {
            report.push(
                `❌ Errors Encountered:`,
                `• Error count: ${metrics.errorCount}`,
                metrics.errorMessage ? `• Error message: ${metrics.errorMessage}` : '',
                ``,
            );
        }

        // Add alerts section
        if (alerts.length > 0) {
            report.push(`🚨 Alerts:`);
            alerts.forEach(alert => {
                const emoji = {
                    info: '💡',
                    warning: '⚠️',
                    error: '❌',
                    critical: '🚨'
                }[alert.severity];
                report.push(`${emoji} ${alert.severity.toUpperCase()}: ${alert.message}`);
            });
            report.push('');
        }

        // Add performance metrics
        report.push(
            `📈 Performance Metrics:`,
            `• Processing rate: ${Math.round(metrics.usersCounted / (metrics.durationMs / 1000))} users/second`,
            `• Deletion efficiency: ${Math.round((metrics.usersDeleted / metrics.usersCounted) * 100)}%`,
            ``,
        );

        return report.filter(line => line !== '').join('\n');
    }

    /**
     * Log execution metrics to console with structured format
     */
    static logExecution(metrics: CleanupMetrics, alerts: AlertCondition[]): void {
        const logLevel = alerts.some(a => a.severity === 'error' || a.severity === 'critical') ? 'error' :
            alerts.some(a => a.severity === 'warning') ? 'warn' : 'info';

        const logData = {
            service: 'cleanup-monitoring',
            executionId: metrics.executionId,
            metrics: {
                executedAt: metrics.executedAt.toISOString(),
                executedBy: metrics.executedBy,
                adminUser: metrics.adminUser,
                status: metrics.status,
                usersCounted: metrics.usersCounted,
                usersDeleted: metrics.usersDeleted,
                thresholdDays: metrics.thresholdDays,
                batchSize: metrics.batchSize,
                durationMs: metrics.durationMs,
                errorCount: metrics.errorCount,
                dryRun: metrics.dryRun,
            },
            alerts: alerts.map(alert => ({
                type: alert.type,
                severity: alert.severity,
                message: alert.message,
                threshold: alert.threshold,
            })),
            performance: {
                processingRate: Math.round(metrics.usersCounted / (metrics.durationMs / 1000)),
                deletionEfficiency: Math.round((metrics.usersDeleted / metrics.usersCounted) * 100),
            },
        };

        console[logLevel]('Cleanup execution monitoring report:', JSON.stringify(logData, null, 2));
    }

    /**
     * Send notifications based on alert conditions
     * In a production environment, this would integrate with email services,
     * Slack, Discord, or other notification systems.
     */
    static async sendNotifications(
        metrics: CleanupMetrics,
        alerts: AlertCondition[],
        notificationConfig: { enabled: boolean; webhookUrl?: string; emailEnabled?: boolean }
    ): Promise<void> {
        if (!notificationConfig.enabled) {
            return;
        }

        const notifiableAlerts = alerts.filter(alert => alert.shouldNotify);

        if (notifiableAlerts.length === 0) {
            return;
        }

        const report = this.generateExecutionReport(metrics, alerts);

        // Console notification (always available)
        console.log('📧 Cleanup notification would be sent:', {
            to: 'admin@chatlima.com',
            subject: `Cleanup Alert: ${metrics.status.toUpperCase()} - ${metrics.usersDeleted} users affected`,
            body: report,
            alertCount: notifiableAlerts.length,
            severity: Math.max(...notifiableAlerts.map(a =>
                a.severity === 'critical' ? 4 :
                    a.severity === 'error' ? 3 :
                        a.severity === 'warning' ? 2 : 1
            )),
        });

        // Webhook notification (if configured)
        if (notificationConfig.webhookUrl) {
            try {
                await fetch(notificationConfig.webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: `Anonymous User Cleanup Alert`,
                        blocks: [
                            {
                                type: 'section',
                                text: {
                                    type: 'mrkdwn',
                                    text: `*Cleanup Execution ${metrics.status.toUpperCase()}*\n${report}`,
                                },
                            },
                        ],
                    }),
                });
            } catch (error) {
                console.error('Failed to send webhook notification:', error);
            }
        }

        // Email notification would be implemented here
        // This would typically use a service like SendGrid, AWS SES, etc.
        if (notificationConfig.emailEnabled) {
            // Implementation would go here
            console.log('📧 Email notification would be sent via email service');
        }
    }

    /**
     * Calculate cleanup statistics for monitoring dashboard
     */
    static calculateCleanupStats(executions: CleanupMetrics[]): {
        totalExecutions: number;
        successRate: number;
        averageDuration: number;
        totalUsersDeleted: number;
        averageUsersPerExecution: number;
        executionFrequency: number; // executions per day
        lastExecution?: Date;
        healthScore: number; // 0-100 based on success rate and performance
    } {
        if (executions.length === 0) {
            return {
                totalExecutions: 0,
                successRate: 0,
                averageDuration: 0,
                totalUsersDeleted: 0,
                averageUsersPerExecution: 0,
                executionFrequency: 0,
                healthScore: 100, // Perfect score with no data
            };
        }

        const successfulExecutions = executions.filter(e => e.status === 'success').length;
        const totalUsersDeleted = executions.reduce((sum, e) => sum + e.usersDeleted, 0);
        const averageDuration = executions.reduce((sum, e) => sum + e.durationMs, 0) / executions.length;

        // Calculate execution frequency (executions per day)
        const timeSpan = executions.length > 1 ?
            new Date(executions[0].executedAt).getTime() - new Date(executions[executions.length - 1].executedAt).getTime() :
            24 * 60 * 60 * 1000; // 1 day default
        const executionFrequency = (executions.length / (timeSpan / (24 * 60 * 60 * 1000)));

        // Calculate health score (0-100)
        const successRate = successfulExecutions / executions.length;
        const performanceScore = Math.min(1, 60000 / averageDuration); // Better if under 1 minute
        const healthScore = Math.round((successRate * 0.7 + performanceScore * 0.3) * 100);

        return {
            totalExecutions: executions.length,
            successRate: Math.round(successRate * 100),
            averageDuration: Math.round(averageDuration),
            totalUsersDeleted,
            averageUsersPerExecution: Math.round(totalUsersDeleted / executions.length),
            executionFrequency: Math.round(executionFrequency * 100) / 100,
            lastExecution: executions[0]?.executedAt,
            healthScore,
        };
    }

    /**
     * Check system health and return recommendations
     */
    static getSystemHealthRecommendations(stats: ReturnType<typeof CleanupMonitoringService.calculateCleanupStats>): string[] {
        const recommendations: string[] = [];

        if (stats.successRate < 90) {
            recommendations.push('⚠️ Success rate is below 90%. Review error logs and improve error handling.');
        }

        if (stats.averageDuration > 120000) { // 2 minutes
            recommendations.push('🐌 Average execution time is high. Consider optimizing database queries or reducing batch sizes.');
        }

        if (stats.executionFrequency > 1) {
            recommendations.push('🔄 High execution frequency detected. Consider increasing thresholds to reduce frequency.');
        }

        if (stats.averageUsersPerExecution > 50) {
            recommendations.push('📊 High deletion rate. Monitor user growth patterns and adjust thresholds accordingly.');
        }

        if (stats.healthScore < 80) {
            recommendations.push('🏥 System health score is below optimal. Review performance metrics and error rates.');
        }

        if (recommendations.length === 0) {
            recommendations.push('✅ System is operating optimally. Continue monitoring for any changes.');
        }

        return recommendations;
    }
}

export default CleanupMonitoringService;
