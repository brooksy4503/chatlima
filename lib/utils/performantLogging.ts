/**
 * Performant logging utilities to replace excessive diagnostic logging
 * Only logs in development mode and uses efficient logging patterns
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isVerboseLogging = process.env.VERBOSE_LOGGING === 'true';

// Track chunk count to limit excessive onChunk logging
const chunkCounts = new Map<string, number>();

/**
 * Efficient diagnostic logging that only runs in development
 * Uses lazy evaluation to avoid JSON.stringify in production
 */
export const logDiagnostic = (type: string, message: string, data?: any | (() => any)) => {
    if (!isDevelopment) return;

    const timestamp = new Date().toISOString();

    if (data && isVerboseLogging) {
        const dataToLog = typeof data === 'function' ? data() : data;
        console.log(`[${timestamp}][${type}] ${message}`, JSON.stringify(dataToLog, null, 2));
    } else {
        console.log(`[${timestamp}][${type}] ${message}`);
    }
};

/**
 * Optimized chunk logging that only logs first few chunks and then summarizes
 */
export const logChunk = (chatId: string, chunk: any, firstTokenTime: number | null, requestId: string) => {
    if (!isDevelopment) return;

    const chunkKey = `${chatId}-${requestId}`;
    const currentCount = chunkCounts.get(chunkKey) || 0;
    chunkCounts.set(chunkKey, currentCount + 1);

    // Only log first 3 chunks and every 50th chunk after that
    if (currentCount < 3 || currentCount % 50 === 0) {
        console.log(`[DEBUG][Chat ${chatId}] onChunk ${currentCount + 1}:`, {
            chunkType: chunk.type,
            isFirstToken: firstTokenTime !== null,
            totalChunks: currentCount + 1
        });
    }

    // Clean up tracking after response completes (rough cleanup after 1000 chunks)
    if (currentCount > 1000) {
        chunkCounts.delete(chunkKey);
    }
};

/**
 * Log performance metrics only once per request
 */
export const logPerformanceMetrics = (requestId: string, metrics: {
    requestStartTime: number;
    firstTokenTime: number | null;
    timeToFirstTokenMs: number | null;
}) => {
    if (!isDevelopment) return;

    const totalTime = Date.now() - metrics.requestStartTime;
    console.log(`[PERF][${requestId}] Total: ${totalTime}ms, FirstToken: ${metrics.timeToFirstTokenMs}ms`);
};

/**
 * Simplified error logging
 */
export const logError = (context: string, error: any, requestId?: string) => {
    const prefix = requestId ? `[ERROR][${requestId}]` : '[ERROR]';
    console.error(`${prefix}[${context}]`, error instanceof Error ? error.message : String(error));
};

/**
 * Request-level logging (start/end only)
 */
export const logRequestBoundary = (type: 'START' | 'END', requestId: string, data?: any) => {
    if (!isDevelopment) return;

    const timestamp = new Date().toISOString();
    if (data) {
        console.log(`[${timestamp}][${type}][${requestId}]`, data);
    } else {
        console.log(`[${timestamp}][${type}][${requestId}]`);
    }
};
