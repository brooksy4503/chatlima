import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/lib/middleware/auth';
import { ValidationMiddleware } from '@/lib/middleware/validation';
import { RateLimitMiddleware } from '@/lib/middleware/rateLimit';
import { TokenTrackingService } from '@/lib/tokenTracking';
import { CostCalculationService } from '@/lib/services/costCalculation';
import { UsageLimitStatus, UsageLimitConfig, ApiResponse } from '@/lib/types/api';
import { nanoid } from 'nanoid';

/**
 * API endpoint for retrieving and managing usage limits
 * 
 * GET /api/limits/usage - Retrieve usage limits
 * PUT /api/limits/usage - Update usage limits (admin only)
 * 
 * GET Query Parameters:
 * - userId: string (optional) - User ID (admin only)
 * - currency: string (optional) - Currency for cost data (default: USD)
 * 
 * GET Response:
 * - success: boolean
 * - data: UsageLimitStatus
 * - meta: Filter information and metadata
 * 
 * PUT Request Body:
 * - userId: string (optional) - User ID (null for global limits)
 * - monthlyTokenLimit: number (optional) - Monthly token limit
 * - monthlyCostLimit: number (optional) - Monthly cost limit
 * - dailyTokenLimit: number (optional) - Daily token limit
 * - dailyCostLimit: number (optional) - Daily cost limit
 * - requestRateLimit: number (optional) - Request rate limit per minute
 * - currency: string (optional) - Currency (default: USD)
 * - isActive: boolean (optional) - Active status (default: true)
 * 
 * PUT Response:
 * - success: boolean
 * - data: UsageLimitConfig
 * - meta: Operation metadata
 * 
 * Authentication: Required
 * Rate Limit: 20 requests per minute
 */

// Validation schema for GET query parameters
const getQuerySchema = {
    userId: { type: 'string', required: false, maxLength: 100 },
    currency: { type: 'string', required: false, minLength: 3, maxLength: 3, default: 'USD' },
};

// Validation schema for PUT request body
const putBodySchema = {
    userId: { type: 'string', required: false, maxLength: 100 },
    monthlyTokenLimit: { type: 'number', required: false, min: 0 },
    monthlyCostLimit: { type: 'number', required: false, min: 0 },
    dailyTokenLimit: { type: 'number', required: false, min: 0 },
    dailyCostLimit: { type: 'number', required: false, min: 0 },
    requestRateLimit: { type: 'number', required: false, min: 1 },
    currency: { type: 'string', required: false, minLength: 3, maxLength: 3, default: 'USD' },
    isActive: { type: 'boolean', required: false, default: true },
};

export async function GET(req: NextRequest) {
    const requestId = nanoid();

    try {
        // Apply rate limiting
        const rateLimitResult = await RateLimitMiddleware.withConfig(req, 'limits');
        if (!rateLimitResult.isAllowed) {
            return rateLimitResult.response!;
        }

        // Authenticate user
        const authResult = await AuthMiddleware.requireAuth(req);
        if (authResult.response) {
            return authResult.response;
        }

        const authContext = authResult.authContext;
        const userId = authContext.userId;

        // Validate query parameters
        const validation = ValidationMiddleware.validateQueryParams(req, getQuerySchema);
        if (!validation.isValid) {
            return ValidationMiddleware.createValidationErrorResponse(validation.errors);
        }

        const {
            userId: targetUserId,
            currency,
        } = validation.data;

        // Check if user is requesting data for another user (admin only)
        let finalUserId = userId;
        if (targetUserId && targetUserId !== userId) {
            const adminResult = await AuthMiddleware.requireAdmin(req);
            if (adminResult.response) {
                return adminResult.response;
            }
            finalUserId = targetUserId;
        }

        // Get current month's usage data
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Get token usage statistics for the month
        const monthlyTokenStats = await TokenTrackingService.getUserTokenStats(finalUserId, {
            startDate: startOfMonth,
            endDate: now,
        });

        // Get token usage statistics for the day
        const dailyTokenStats = await TokenTrackingService.getUserTokenStats(finalUserId, {
            startDate: startOfDay,
            endDate: now,
        });

        // Get cost data for the month
        const monthlyCostData = await CostCalculationService.getAggregatedCosts(finalUserId, {
            startDate: startOfMonth,
            endDate: now,
            currency,
        });

        // Get cost data for the day
        const dailyCostData = await CostCalculationService.getAggregatedCosts(finalUserId, {
            startDate: startOfDay,
            endDate: now,
            currency,
        });

        // Get usage limits (mock data for now)
        const limits = {
            monthlyTokenLimit: 1000000, // 1M tokens
            monthlyCostLimit: 100, // $100
            dailyTokenLimit: 50000, // 50K tokens
            dailyCostLimit: 10, // $10
            requestRateLimit: 60, // 60 requests per minute
        };

        // Calculate usage status
        const result: UsageLimitStatus = {
            monthlyTokens: {
                used: monthlyTokenStats.totalTokens,
                limit: limits.monthlyTokenLimit || 1000000, // Default 1M tokens
                remaining: Math.max(0, (limits.monthlyTokenLimit || 1000000) - monthlyTokenStats.totalTokens),
                percentage: ((monthlyTokenStats.totalTokens / (limits.monthlyTokenLimit || 1000000)) * 100),
            },
            monthlyCost: {
                used: monthlyCostData.totalCost,
                limit: limits.monthlyCostLimit || 100, // Default $100
                remaining: Math.max(0, (limits.monthlyCostLimit || 100) - monthlyCostData.totalCost),
                percentage: ((monthlyCostData.totalCost / (limits.monthlyCostLimit || 100)) * 100),
            },
            dailyTokens: {
                used: dailyTokenStats.totalTokens,
                limit: limits.dailyTokenLimit || 50000, // Default 50K tokens
                remaining: Math.max(0, (limits.dailyTokenLimit || 50000) - dailyTokenStats.totalTokens),
                percentage: ((dailyTokenStats.totalTokens / (limits.dailyTokenLimit || 50000)) * 100),
            },
            dailyCost: {
                used: dailyCostData.totalCost,
                limit: limits.dailyCostLimit || 10, // Default $10
                remaining: Math.max(0, (limits.dailyCostLimit || 10) - dailyCostData.totalCost),
                percentage: ((dailyCostData.totalCost / (limits.dailyCostLimit || 10)) * 100),
            },
            isApproachingAnyLimit: (
                ((monthlyTokenStats.totalTokens / (limits.monthlyTokenLimit || 1000000)) * 100) > 80 ||
                ((monthlyCostData.totalCost / (limits.monthlyCostLimit || 100)) * 100) > 80 ||
                ((dailyTokenStats.totalTokens / (limits.dailyTokenLimit || 50000)) * 100) > 80 ||
                ((dailyCostData.totalCost / (limits.dailyCostLimit || 10)) * 100) > 80
            ),
            isOverAnyLimit: (
                monthlyTokenStats.totalTokens > (limits.monthlyTokenLimit || 1000000) ||
                monthlyCostData.totalCost > (limits.monthlyCostLimit || 100) ||
                dailyTokenStats.totalTokens > (limits.dailyTokenLimit || 50000) ||
                dailyCostData.totalCost > (limits.dailyCostLimit || 10)
            ),
            currency,
        };

        const meta = {
            userId: finalUserId,
            requestedUserId: targetUserId,
            currency,
            isAdmin: authContext.isAdmin,
        };

        return ValidationMiddleware.createSuccessResponse(result, meta);

    } catch (error) {
        console.error(`[UsageLimitsAPI:${requestId}] GET Error:`, error);
        return ValidationMiddleware.createErrorResponse(
            'INTERNAL_ERROR',
            'Failed to retrieve usage limits',
            500,
            error instanceof Error ? error.message : String(error)
        );
    }
}

export async function PUT(req: NextRequest) {
    const requestId = nanoid();

    try {
        // Apply rate limiting
        const rateLimitResult = await RateLimitMiddleware.withConfig(req, 'limits');
        if (!rateLimitResult.isAllowed) {
            return rateLimitResult.response!;
        }

        // Authenticate user and check admin privileges
        const authResult = await AuthMiddleware.requireAdmin(req);
        if (authResult.response) {
            return authResult.response;
        }

        const authContext = authResult.authContext;
        const userId = authContext.userId;

        // Parse and validate request body
        const body = await req.json();
        const validation = await ValidationMiddleware.validateBody(body, putBodySchema);
        if (!validation.isValid) {
            return ValidationMiddleware.createValidationErrorResponse(validation.errors);
        }

        const {
            userId: targetUserId,
            monthlyTokenLimit,
            monthlyCostLimit,
            dailyTokenLimit,
            dailyCostLimit,
            requestRateLimit,
            currency,
            isActive,
        } = validation.data;

        // Update usage limits (mock implementation)
        const limitConfig = {
            id: nanoid(),
            userId: targetUserId,
            monthlyTokenLimit,
            monthlyCostLimit,
            dailyTokenLimit,
            dailyCostLimit,
            requestRateLimit,
            currency,
            isActive,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Create result
        const result: UsageLimitConfig = {
            id: limitConfig.id || nanoid(),
            userId: targetUserId,
            monthlyTokenLimit,
            monthlyCostLimit,
            dailyTokenLimit,
            dailyCostLimit,
            requestRateLimit,
            currency,
            isActive,
            createdAt: limitConfig.createdAt || new Date(),
            updatedAt: new Date(),
        };

        const meta = {
            userId,
            targetUserId,
            operation: 'update',
            timestamp: new Date().toISOString(),
        };

        return ValidationMiddleware.createSuccessResponse(result, meta);

    } catch (error) {
        console.error(`[UsageLimitsAPI:${requestId}] PUT Error:`, error);
        return ValidationMiddleware.createErrorResponse(
            'INTERNAL_ERROR',
            'Failed to update usage limits',
            500,
            error instanceof Error ? error.message : String(error)
        );
    }
}

/**
 * @swagger
 * /api/limits/usage:
 *   get:
 *     summary: Retrieve usage limits
 *     description: Get current usage limits and status for the authenticated user or specified user (admin only)
 *     tags:
 *       - Limits
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID (admin only)
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           default: USD
 *         description: Currency for cost data
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UsageLimitStatus'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     requestedUserId:
 *                       type: string
 *                     currency:
 *                       type: string
 *                     isAdmin:
 *                       type: boolean
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin required for other users)
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 *   
 *   put:
 *     summary: Update usage limits
 *     description: Create or update usage limits for a user (admin only)
 *     tags:
 *       - Limits
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID (null for global limits)
 *               monthlyTokenLimit:
 *                 type: number
 *                 minimum: 0
 *                 description: Monthly token limit
 *               monthlyCostLimit:
 *                 type: number
 *                 minimum: 0
 *                 description: Monthly cost limit
 *               dailyTokenLimit:
 *                 type: number
 *                 minimum: 0
 *                 description: Daily token limit
 *               dailyCostLimit:
 *                 type: number
 *                 minimum: 0
 *                 description: Daily cost limit
 *               requestRateLimit:
 *                 type: number
 *                 minimum: 1
 *                 description: Request rate limit per minute
 *               currency:
 *                 type: string
 *                 default: USD
 *                 description: Currency for cost limits
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Whether these limits are active
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UsageLimitConfig'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     targetUserId:
 *                       type: string
 *                     operation:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin required)
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */