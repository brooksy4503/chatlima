import { db } from '@/lib/db';
import { cleanupConfig, cleanupExecutionLogs, users } from '@/lib/db/schema';
import { eq, desc, and, gte, count, sql } from 'drizzle-orm';
import type { CleanupConfig, CleanupExecutionLog, CleanupExecutionLogInsert } from '@/lib/db/schema';

export interface CleanupConfigData {
    enabled: boolean;
    schedule: string;
    thresholdDays: number;
    batchSize: number;
    notificationEnabled: boolean;
    webhookUrl?: string;
    emailEnabled?: boolean;
    lastModified?: string;
    modifiedBy?: string;
}

export interface CleanupLogEntry {
    id: string;
    executedAt: string;
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

export interface LogsQueryParams {
    type?: string;
    limit?: number;
    offset?: number;
    days?: number;
}

export interface LogsResponse {
    logs: CleanupLogEntry[];
    summary: {
        totalExecutions: number;
        successfulExecutions: number;
        failedExecutions: number;
        partialExecutions: number;
        totalUsersDeleted: number;
        dryRunExecutions: number;
        averageDuration: number;
        lastExecution?: string;
        cronExecutions: number;
        manualExecutions: number;
        scriptExecutions: number;
    };
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
        page: number;
        totalPages: number;
    };
}

const DEFAULT_CONFIG_ID = 'default';

export class CleanupConfigService {

    /**
     * Get the current cleanup configuration
     */
    static async getConfig(): Promise<CleanupConfigData> {
        try {
            const result = await db
                .select()
                .from(cleanupConfig)
                .limit(1);

            if (result.length === 0) {
                // Create default configuration if none exists
                const defaultConfig = await this.createDefaultConfig();
                return this.mapConfigToData(defaultConfig);
            }

            return this.mapConfigToData(result[0]);
        } catch (error) {
            console.error('Error getting cleanup config:', error);
            // Return default config on error
            return {
                enabled: false,
                schedule: '0 2 * * 0',
                thresholdDays: 45,
                batchSize: 50,
                notificationEnabled: true,
                emailEnabled: false,
                lastModified: new Date().toISOString(),
            };
        }
    }

    /**
     * Update the cleanup configuration
     */
    static async updateConfig(
        updates: Partial<CleanupConfigData>,
        modifiedBy?: string,
        modifiedByUserId?: string
    ): Promise<CleanupConfigData> {
        try {
            // Check if config exists
            const existing = await db
                .select()
                .from(cleanupConfig)
                .limit(1);

            const now = new Date();

            if (existing.length === 0) {
                // Create new config
                const newConfig = await db
                    .insert(cleanupConfig)
                    .values({
                        id: DEFAULT_CONFIG_ID,
                        enabled: updates.enabled ?? false,
                        schedule: updates.schedule ?? '0 2 * * 0',
                        thresholdDays: updates.thresholdDays ?? 45,
                        batchSize: updates.batchSize ?? 50,
                        notificationEnabled: updates.notificationEnabled ?? true,
                        webhookUrl: updates.webhookUrl,
                        emailEnabled: updates.emailEnabled ?? false,
                        lastModified: now,
                        modifiedBy,
                        modifiedByUserId,
                        updatedAt: now,
                    })
                    .returning();

                return this.mapConfigToData(newConfig[0]);
            } else {
                // Update existing config
                const updated = await db
                    .update(cleanupConfig)
                    .set({
                        ...updates,
                        lastModified: now,
                        modifiedBy,
                        modifiedByUserId,
                        updatedAt: now,
                    })
                    .where(eq(cleanupConfig.id, existing[0].id))
                    .returning();

                return this.mapConfigToData(updated[0]);
            }
        } catch (error) {
            console.error('Error updating cleanup config:', error);
            throw new Error('Failed to update cleanup configuration');
        }
    }

    /**
     * Log a cleanup execution
     */
    static async logExecution(log: Omit<CleanupLogEntry, 'id'>): Promise<CleanupLogEntry> {
        try {
            const logEntry: CleanupExecutionLogInsert = {
                executedAt: new Date(log.executedAt),
                executedBy: log.executedBy,
                adminUserId: undefined, // Will be set if available
                adminUserEmail: log.adminUser,
                usersCounted: log.usersCounted,
                usersDeleted: log.usersDeleted,
                thresholdDays: log.thresholdDays,
                batchSize: log.batchSize,
                durationMs: log.durationMs,
                status: log.status,
                errorMessage: log.errorMessage,
                errorCount: log.errorCount,
                dryRun: log.dryRun,
                deletedUserIds: log.deletedUserIds,
            };

            const result = await db
                .insert(cleanupExecutionLogs)
                .values(logEntry)
                .returning();

            return this.mapLogToEntry(result[0]);
        } catch (error) {
            console.error('Error logging cleanup execution:', error);
            throw new Error('Failed to log cleanup execution');
        }
    }

    /**
     * Get cleanup execution logs with filtering and pagination
     */
    static async getLogs(params: LogsQueryParams = {}): Promise<LogsResponse> {
        try {
            const {
                type = 'all',
                limit = 50,
                offset = 0,
                days
            } = params;

            // Apply filters
            const conditions = [];

            if (type !== 'all') {
                const filterType = type === 'manual' ? 'admin' : type;
                conditions.push(eq(cleanupExecutionLogs.executedBy, filterType as any));
            }

            if (days) {
                const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
                conditions.push(gte(cleanupExecutionLogs.executedAt, cutoffDate));
            }

            // Build where condition
            const whereCondition = conditions.length > 0
                ? (conditions.length === 1 ? conditions[0] : and(...conditions))
                : undefined;

            // Build queries
            const buildQuery = () => {
                const baseQuery = db.select().from(cleanupExecutionLogs);
                return whereCondition ? baseQuery.where(whereCondition) : baseQuery;
            };

            const buildCountQuery = () => {
                const baseCountQuery = db.select({ count: count() }).from(cleanupExecutionLogs);
                return whereCondition ? baseCountQuery.where(whereCondition) : baseCountQuery;
            };

            // Get total count
            const [{ count: totalCount }] = await buildCountQuery();

            // Get paginated results
            const logs = await buildQuery()
                .orderBy(desc(cleanupExecutionLogs.executedAt))
                .limit(limit)
                .offset(offset);

            // Calculate summary statistics efficiently using aggregation
            const summary = await this.calculateSummaryEfficient(whereCondition);

            return {
                logs: logs.map(log => this.mapLogToEntry(log)),
                summary,
                pagination: {
                    total: totalCount,
                    limit,
                    offset,
                    hasMore: offset + limit < totalCount,
                    page: Math.floor(offset / limit) + 1,
                    totalPages: Math.ceil(totalCount / limit),
                }
            };
        } catch (error) {
            console.error('Error getting cleanup logs:', error);
            throw new Error('Failed to retrieve cleanup logs');
        }
    }

    /**
     * Get execution logs for health monitoring
     */
    static async getExecutionHistory(daysBack: number = 30): Promise<CleanupLogEntry[]> {
        try {
            const cutoffDate = new Date(Date.now() - (daysBack * 24 * 60 * 60 * 1000));

            const logs = await db
                .select()
                .from(cleanupExecutionLogs)
                .where(gte(cleanupExecutionLogs.executedAt, cutoffDate))
                .orderBy(desc(cleanupExecutionLogs.executedAt));

            return logs.map(log => this.mapLogToEntry(log));
        } catch (error) {
            console.error('Error getting execution history:', error);
            return [];
        }
    }

    /**
     * Calculate summary statistics efficiently using database aggregation
     */
    private static async calculateSummaryEfficient(whereCondition?: any): Promise<LogsResponse['summary']> {
        try {
            // Build base query with aggregations
            const baseQuery = db
                .select({
                    totalExecutions: count(),
                    totalUsersDeleted: sql<number>`sum(case when ${cleanupExecutionLogs.dryRun} = false then ${cleanupExecutionLogs.usersDeleted} else 0 end)`,
                    successCount: sql<number>`sum(case when ${cleanupExecutionLogs.status} = 'success' then 1 else 0 end)`,
                    errorCount: sql<number>`sum(case when ${cleanupExecutionLogs.status} = 'error' then 1 else 0 end)`,
                    partialCount: sql<number>`sum(case when ${cleanupExecutionLogs.status} = 'partial' then 1 else 0 end)`,
                    dryRunCount: sql<number>`sum(case when ${cleanupExecutionLogs.dryRun} = true then 1 else 0 end)`,
                    cronCount: sql<number>`sum(case when ${cleanupExecutionLogs.executedBy} = 'cron' then 1 else 0 end)`,
                    adminCount: sql<number>`sum(case when ${cleanupExecutionLogs.executedBy} = 'admin' then 1 else 0 end)`,
                    scriptCount: sql<number>`sum(case when ${cleanupExecutionLogs.executedBy} = 'script' then 1 else 0 end)`,
                    avgDuration: sql<number>`avg(${cleanupExecutionLogs.durationMs})`,
                    lastExecution: sql<Date | null>`max(${cleanupExecutionLogs.executedAt})`
                })
                .from(cleanupExecutionLogs);

            const query = whereCondition ? baseQuery.where(whereCondition) : baseQuery;
            const [result] = await query;

            return {
                totalExecutions: result.totalExecutions || 0,
                totalUsersDeleted: result.totalUsersDeleted || 0,
                successfulExecutions: result.successCount || 0,
                failedExecutions: result.errorCount || 0,
                partialExecutions: result.partialCount || 0,
                dryRunExecutions: result.dryRunCount || 0,
                cronExecutions: result.cronCount || 0,
                manualExecutions: result.adminCount || 0,
                scriptExecutions: result.scriptCount || 0,
                averageDuration: Math.round(result.avgDuration || 0),
                lastExecution: result.lastExecution ? new Date(result.lastExecution).toISOString() : undefined
            };
        } catch (error) {
            console.error('Error calculating summary:', error);
            // Fallback to empty summary
            return {
                totalExecutions: 0,
                totalUsersDeleted: 0,
                successfulExecutions: 0,
                failedExecutions: 0,
                partialExecutions: 0,
                dryRunExecutions: 0,
                cronExecutions: 0,
                manualExecutions: 0,
                scriptExecutions: 0,
                averageDuration: 0,
                lastExecution: undefined
            };
        }
    }

    /**
     * Create default configuration
     */
    private static async createDefaultConfig(): Promise<CleanupConfig> {
        const defaultValues = {
            id: DEFAULT_CONFIG_ID,
            enabled: false,
            schedule: '0 2 * * 0',
            thresholdDays: 45,
            batchSize: 50,
            notificationEnabled: true,
            emailEnabled: false,
            lastModified: new Date(),
            modifiedBy: 'system',
        };

        const result = await db
            .insert(cleanupConfig)
            .values(defaultValues)
            .returning();

        return result[0];
    }

    /**
     * Map database config to data object
     */
    private static mapConfigToData(config: CleanupConfig): CleanupConfigData {
        return {
            enabled: config.enabled,
            schedule: config.schedule,
            thresholdDays: config.thresholdDays,
            batchSize: config.batchSize,
            notificationEnabled: config.notificationEnabled,
            webhookUrl: config.webhookUrl || undefined,
            emailEnabled: config.emailEnabled,
            lastModified: config.lastModified.toISOString(),
            modifiedBy: config.modifiedBy || undefined,
        };
    }

    /**
     * Map database log to entry object
     */
    private static mapLogToEntry(log: CleanupExecutionLog): CleanupLogEntry {
        return {
            id: log.id,
            executedAt: log.executedAt.toISOString(),
            executedBy: log.executedBy as 'admin' | 'cron' | 'script',
            adminUser: log.adminUserEmail || undefined,
            usersCounted: log.usersCounted,
            usersDeleted: log.usersDeleted,
            thresholdDays: log.thresholdDays,
            batchSize: log.batchSize,
            durationMs: log.durationMs,
            status: log.status as 'success' | 'error' | 'partial',
            errorMessage: log.errorMessage || undefined,
            errorCount: log.errorCount,
            dryRun: log.dryRun,
            deletedUserIds: log.deletedUserIds || undefined,
        };
    }

    /**
     * Calculate summary statistics from logs
     */
    private static calculateSummary(logs: CleanupExecutionLog[]) {
        const totalExecutions = logs.length;
        const successfulExecutions = logs.filter(log => log.status === 'success').length;
        const failedExecutions = logs.filter(log => log.status === 'error').length;
        const partialExecutions = logs.filter(log => log.status === 'partial').length;
        const totalUsersDeleted = logs.reduce((sum, log) => sum + (log.dryRun ? 0 : log.usersDeleted), 0);
        const dryRunExecutions = logs.filter(log => log.dryRun).length;
        const averageDuration = logs.length > 0
            ? Math.round(logs.reduce((sum, log) => sum + log.durationMs, 0) / logs.length)
            : 0;
        const cronExecutions = logs.filter(log => log.executedBy === 'cron').length;
        const manualExecutions = logs.filter(log => log.executedBy === 'admin').length;
        const scriptExecutions = logs.filter(log => log.executedBy === 'script').length;

        return {
            totalExecutions,
            successfulExecutions,
            failedExecutions,
            partialExecutions,
            totalUsersDeleted,
            dryRunExecutions,
            averageDuration,
            lastExecution: logs[0]?.executedAt.toISOString(),
            cronExecutions,
            manualExecutions,
            scriptExecutions,
        };
    }
}

export default CleanupConfigService;
