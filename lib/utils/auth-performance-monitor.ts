"use client";

/**
 * Auth Performance Monitor
 * 
 * This utility helps track and monitor auth-related API calls to identify performance issues.
 * It should be imported and initialized in development mode to track excessive auth calls.
 */

interface AuthCallMetrics {
    totalCalls: number;
    callsByEndpoint: Map<string, number>;
    lastCallTime: number;
    callTimestamps: number[];
}

class AuthPerformanceMonitor {
    private metrics: AuthCallMetrics = {
        totalCalls: 0,
        callsByEndpoint: new Map(),
        lastCallTime: 0,
        callTimestamps: [],
    };

    private observer: PerformanceObserver | null = null;
    private isMonitoring = false;

    constructor() {
        if (typeof window === 'undefined') return;
    }

    start() {
        if (typeof window === 'undefined' || this.isMonitoring) return;

        console.log('🔍 Auth Performance Monitor: Started monitoring auth calls');

        // Intercept fetch to monitor auth-related API calls
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const [resource, config] = args;
            const url = typeof resource === 'string'
                ? resource
                : resource instanceof URL
                    ? resource.toString()
                    : resource.url;

            // Track auth-related endpoints
            if (this.isAuthEndpoint(url)) {
                this.recordCall(url);
            }

            return originalFetch.apply(window, args);
        };

        // Set up performance observer for additional monitoring
        this.observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (entry.entryType === 'resource' && this.isAuthEndpoint(entry.name)) {
                    // Additional tracking via Performance API
                }
            });
        });

        try {
            this.observer.observe({ entryTypes: ['resource'] });
        } catch (e) {
            // Some browsers might not support all entry types
        }

        this.isMonitoring = true;

        // Report metrics every 5 seconds in development
        if (process.env.NODE_ENV === 'development') {
            setInterval(() => this.report(), 5000);
        }
    }

    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.isMonitoring = false;
        console.log('🔍 Auth Performance Monitor: Stopped monitoring');
    }

    private isAuthEndpoint(url: string): boolean {
        const authPatterns = [
            '/api/auth',
            '/api/usage',
            '/api/credits',
            '/_better-auth',
            '/api/debug-credits',
        ];

        return authPatterns.some(pattern => url.includes(pattern));
    }

    private recordCall(endpoint: string) {
        const now = Date.now();
        this.metrics.totalCalls++;
        this.metrics.lastCallTime = now;
        this.metrics.callTimestamps.push(now);

        // Keep only last 100 timestamps
        if (this.metrics.callTimestamps.length > 100) {
            this.metrics.callTimestamps.shift();
        }

        // Extract clean endpoint name
        const cleanEndpoint = this.extractEndpoint(endpoint);
        const currentCount = this.metrics.callsByEndpoint.get(cleanEndpoint) || 0;
        this.metrics.callsByEndpoint.set(cleanEndpoint, currentCount + 1);

        // Warn if too many calls in short period
        const recentCalls = this.metrics.callTimestamps.filter(
            timestamp => timestamp > now - 1000 // Last second
        ).length;

        if (recentCalls > 5) {
            console.warn(
                `⚠️ Auth Performance Warning: ${recentCalls} auth calls in the last second!`,
                { endpoint: cleanEndpoint, totalCalls: this.metrics.totalCalls }
            );
        }
    }

    private extractEndpoint(url: string): string {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.pathname;
        } catch {
            return url;
        }
    }

    report() {
        if (this.metrics.totalCalls === 0) return;

        console.group('📊 Auth Performance Report');
        console.log(`Total Auth Calls: ${this.metrics.totalCalls}`);
        console.log('Calls by Endpoint:');

        const sortedEndpoints = Array.from(this.metrics.callsByEndpoint.entries())
            .sort((a, b) => b[1] - a[1]);

        sortedEndpoints.forEach(([endpoint, count]) => {
            console.log(`  ${endpoint}: ${count} calls`);
        });

        // Calculate calls per minute
        const now = Date.now();
        const callsLastMinute = this.metrics.callTimestamps.filter(
            timestamp => timestamp > now - 60000
        ).length;

        console.log(`Calls in last minute: ${callsLastMinute}`);

        if (this.metrics.totalCalls > 50) {
            console.warn('⚠️ High number of auth calls detected! Consider investigating.');
        }

        console.groupEnd();
    }

    reset() {
        this.metrics = {
            totalCalls: 0,
            callsByEndpoint: new Map(),
            lastCallTime: 0,
            callTimestamps: [],
        };
        console.log('🔍 Auth Performance Monitor: Metrics reset');
    }

    getMetrics() {
        return {
            ...this.metrics,
            callsByEndpoint: Object.fromEntries(this.metrics.callsByEndpoint),
        };
    }
}

// Create singleton instance
const authMonitor = new AuthPerformanceMonitor();

// Auto-start in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // Start monitoring after a short delay to ensure app is initialized
    setTimeout(() => {
        authMonitor.start();
    }, 1000);
}

export { authMonitor };