import { db } from '@/lib/db';
import { cleanupExecutionLogs } from '@/lib/db/schema';
import { desc, and, gte, count, sql, eq } from 'drizzle-orm';
import type { CleanupExecutionLog, CleanupExecutionLogInsert } from '@/lib/db/schema';

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

export class CleanupConfigService {
    static async logExecution(log: Omit<CleanupLogEntry, 'id'>): Promise<CleanupLogEntry> {
        const logEntry: CleanupExecutionLogInsert = {
            executedAt: new Date(log.executedAt),
            executedBy: log.executedBy,
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
    }

    static async getLogs(params: LogsQueryParams = {}): Promise<LogsResponse> {
        const {
            type = 'all',
            limit = 50,
            offset = 0,
            days
        } = params;

        const conditions = [];

        if (type !== 'all') {
            const filterType = type === 'manual' ? 'admin' : type;
            conditions.push(eq(cleanupExecutionLogs.executedBy, filterType as 'admin' | 'cron' | 'script'));
        }

        if (days) {
            const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
            conditions.push(gte(cleanupExecutionLogs.executedAt, cutoffDate));
        }

        const whereCondition = conditions.length > 0
            ? (conditions.length === 1 ? conditions[0] : and(...conditions))
            : undefined;

        const buildQuery = () => {
            const baseQuery = db.select().from(cleanupExecutionLogs);
            return whereCondition ? baseQuery.where(whereCondition) : baseQuery;
        };

        const buildCountQuery = () => {
            const baseCountQuery = db.select({ count: count() }).from(cleanupExecutionLogs);
            return whereCondition ? baseCountQuery.where(whereCondition) : baseCountQuery;
        };

        const [{ count: totalCount }] = await buildCountQuery();

        const logs = await buildQuery()
            .orderBy(desc(cleanupExecutionLogs.executedAt))
            .limit(limit)
            .offset(offset);

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
    }

    static async getExecutionHistory(daysBack: number = 30): Promise<CleanupLogEntry[]> {
        const cutoffDate = new Date(Date.now() - (daysBack * 24 * 60 * 60 * 1000));

        const logs = await db
            .select()
            .from(cleanupExecutionLogs)
            .where(gte(cleanupExecutionLogs.executedAt, cutoffDate))
            .orderBy(desc(cleanupExecutionLogs.executedAt));

        return logs.map(log => this.mapLogToEntry(log));
    }

    private static async calculateSummaryEfficient(whereCondition?: ReturnType<typeof and>): Promise<LogsResponse['summary']> {
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
    }

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
}

export default CleanupConfigService;
