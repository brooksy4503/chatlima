import { NextRequest, NextResponse } from 'next/server';
import { RateLimitConfig } from '@/lib/types/api';
import { nanoid } from 'nanoid';

/**
 * In-memory rate limiting store
 * Note: In production, consider using Redis or another distributed store
 */
class RateLimitStore {
    private static instance: RateLimitStore;
    private store: Map<string, { count: number; resetTime: number }>;

    private constructor() {
        this.store = new Map();
        // Clean up expired entries every minute
        setInterval(() => this.cleanup(), 60 * 1000);
    }

    static getInstance(): RateLimitStore {
        if (!RateLimitStore.instance) {
            RateLimitStore.instance = new RateLimitStore();
        }
        return RateLimitStore.instance;
    }

    get(key: string): { count: number; resetTime: number } | undefined {
        return this.store.get(key);
    }

    set(key: string, count: number, resetTime: number): void {
        this.store.set(key, { count, resetTime });
    }

    increment(key: string, windowMs: number): { count: number; resetTime: number } {
        const now = Date.now();
        const resetTime = now + windowMs;

        const current = this.store.get(key);
        if (current && current.resetTime > now) {
            current.count++;
            this.store.set(key, current);
            return current;
        } else {
            this.store.set(key, { count: 1, resetTime });
            return { count: 1, resetTime };
        }
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, value] of this.store.entries()) {
            if (value.resetTime <= now) {
                this.store.delete(key);
            }
        }
    }
}

/**
 * Rate limiting middleware
 */
export class RateLimitMiddleware {
    /**
     * Apply rate limiting to a request
     */
    static async applyRateLimit(
        req: NextRequest,
        config: RateLimitConfig
    ): Promise<{ isAllowed: boolean; remaining: number; resetTime: number; response?: NextResponse }> {
        const requestId = nanoid();
        const store = RateLimitStore.getInstance();

        try {
            // Generate rate limit key
            const key = config.keyGenerator
                ? config.keyGenerator(req)
                : this.defaultKeyGenerator(req);

            // Get current rate limit data
            const rateLimitData = store.increment(key, config.windowMs);
            const now = Date.now();
            const timeRemaining = Math.max(0, rateLimitData.resetTime - now);
            const remaining = Math.max(0, config.maxRequests - rateLimitData.count);

            // Check if rate limit exceeded
            if (rateLimitData.count > config.maxRequests) {
                const response = NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'RATE_LIMIT_EXCEEDED',
                            message: 'Too many requests. Please try again later.',
                        },
                        meta: {
                            retryAfter: Math.ceil(timeRemaining / 1000),
                            limit: config.maxRequests,
                            remaining: 0,
                            reset: new Date(rateLimitData.resetTime).toISOString(),
                        },
                    },
                    {
                        status: 429,
                        headers: {
                            'X-RateLimit-Limit': config.maxRequests.toString(),
                            'X-RateLimit-Remaining': '0',
                            'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toISOString(),
                            'Retry-After': Math.ceil(timeRemaining / 1000).toString(),
                        },
                    }
                );

                return {
                    isAllowed: false,
                    remaining: 0,
                    resetTime: rateLimitData.resetTime,
                    response,
                };
            }

            // Add rate limit headers to successful responses
            const headers = {
                'X-RateLimit-Limit': config.maxRequests.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toISOString(),
            };

            return {
                isAllowed: true,
                remaining,
                resetTime: rateLimitData.resetTime,
            };
        } catch (error) {
            console.error('[RateLimitMiddleware] Rate limiting error:', error);
            // Fail open - allow request but log error
            return {
                isAllowed: true,
                remaining: config.maxRequests,
                resetTime: Date.now() + config.windowMs,
            };
        }
    }

    /**
     * Default key generator using IP address and user ID if available
     */
    private static defaultKeyGenerator(req: NextRequest): string {
        const ip = this.getClientIP(req);
        const authHeader = req.headers.get('authorization');

        // Create a composite key that includes IP and auth info
        return `rate_limit:${ip}:${authHeader || 'anonymous'}`;
    }

    /**
     * Get client IP address from request
     */
    private static getClientIP(req: NextRequest): string {
        // Check for forwarded IP (common in production environments)
        const forwardedFor = req.headers.get('x-forwarded-for');
        if (forwardedFor) {
            return forwardedFor.split(',')[0].trim();
        }

        // Check for real IP
        const realIP = req.headers.get('x-real-ip');
        if (realIP) {
            return realIP;
        }

        // Fallback to remote address
        return 'unknown';
    }

    /**
     * Create rate limit configurations for different endpoints
     */
    static getConfigs(): Record<string, RateLimitConfig> {
        return {
            // General API endpoints - 100 requests per minute
            default: {
                windowMs: 60 * 1000, // 1 minute
                maxRequests: 100,
                skipSuccessfulRequests: false,
                skipFailedRequests: false,
            },

            // Usage data endpoints - 200 requests per minute
            usage: {
                windowMs: 60 * 1000, // 1 minute
                maxRequests: 200,
                skipSuccessfulRequests: false,
                skipFailedRequests: false,
            },

            // Export endpoints - 10 requests per minute
            export: {
                windowMs: 60 * 1000, // 1 minute
                maxRequests: 10,
                skipSuccessfulRequests: false,
                skipFailedRequests: false,
            },

            // Admin endpoints - 50 requests per minute
            admin: {
                windowMs: 60 * 1000, // 1 minute
                maxRequests: 50,
                skipSuccessfulRequests: false,
                skipFailedRequests: false,
            },

            // Pricing management endpoints - 20 requests per minute
            pricing: {
                windowMs: 60 * 1000, // 1 minute
                maxRequests: 20,
                skipSuccessfulRequests: false,
                skipFailedRequests: false,
            },
        };
    }

    /**
     * Apply rate limiting with specific configuration
     */
    static async withConfig(
        req: NextRequest,
        configName: keyof ReturnType<typeof RateLimitMiddleware.getConfigs>
    ): Promise<{ isAllowed: boolean; remaining: number; resetTime: number; response?: NextResponse }> {
        const configs = this.getConfigs();
        const config = configs[configName] || configs.default;
        return this.applyRateLimit(req, config);
    }
}