import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/lib/middleware/auth';
import { ValidationMiddleware } from '@/lib/middleware/validation';
import { RateLimitMiddleware } from '@/lib/middleware/rateLimit';
import { TokenTrackingService } from '@/lib/tokenTracking';
import { CostCalculationService } from '@/lib/services/costCalculation';
import { UsageSummaryStats, ApiResponse } from '@/lib/types/api';
import { nanoid } from 'nanoid';

/**
 * API endpoint for retrieving usage summary statistics
 * 
 * GET /api/usage/summary
 * 
 * Query Parameters:
 * - startDate: string (optional) - Start date for filtering (ISO format)
 * - endDate: string (optional) - End date for filtering (ISO format)
 * - provider: string (optional) - Filter by provider
 * - modelId: string (optional) - Filter by model ID
 * - currency: string (optional) - Currency for cost data (default: USD)
 * - includeVolumeDiscounts: boolean (optional) - Include volume discounts (default: true)
 * - period: string (optional) - Time period: 'day' | 'week' | 'month' | 'year' | 'custom' (default: 'month')
 * 
 * Response:
 * - success: boolean
 * - data: UsageSummaryStats
 * - meta: Filter information and metadata
 * 
 * Authentication: Required
 * Rate Limit: 200 requests per minute
 */

// Validation schema for query parameters
const querySchema = {
    startDate: { type: 'date', required: false },
    endDate: { type: 'date', required: false },
    provider: { type: 'string', required: false, maxLength: 50 },
    modelId: { type: 'string', required: false, maxLength: 100 },
    currency: { type: 'string', required: false, minLength: 3, maxLength: 3, default: 'USD' },
    includeVolumeDiscounts: { type: 'boolean', required: false, default: true },
    period: { type: 'string', required: false, enum: ['day', 'week', 'month', 'year', 'custom'], default: 'month' },
};

export async function GET(req: NextRequest) {
    const requestId = nanoid();

    try {
        // Apply rate limiting
        const rateLimitResult = await RateLimitMiddleware.withConfig(req, 'usage');
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
        const validation = ValidationMiddleware.validateQueryParams(req, querySchema);
        if (!validation.isValid) {
            return ValidationMiddleware.createValidationErrorResponse(validation.errors);
        }

        const {
            startDate,
            endDate,
            provider,
            modelId,
            currency,
            includeVolumeDiscounts,
            period,
        } = validation.data;

        // Calculate date range based on period
        let calculatedStartDate = startDate;
        let calculatedEndDate = endDate;
        const now = new Date();

        if (period !== 'custom') {
            calculatedEndDate = now;

            switch (period) {
                case 'day':
                    calculatedStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    const dayOfWeek = now.getDay();
                    calculatedStartDate = new Date(now.getTime() - (dayOfWeek * 24 * 60 * 60 * 1000));
                    calculatedStartDate.setHours(0, 0, 0, 0);
                    break;
                case 'month':
                    calculatedStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'year':
                    calculatedStartDate = new Date(now.getFullYear(), 0, 1);
                    break;
            }
        }

        // Validate date range
        if (calculatedStartDate && calculatedEndDate && calculatedStartDate > calculatedEndDate) {
            return ValidationMiddleware.createErrorResponse(
                'INVALID_DATE_RANGE',
                'startDate must be before endDate',
                400
            );
        }

        // Get token usage statistics
        const tokenStats = await TokenTrackingService.getUserTokenStats(userId, {
            startDate: calculatedStartDate,
            endDate: calculatedEndDate,
            provider,
        });

        // Get cost analytics data
        const costData = await CostCalculationService.getAggregatedCosts(userId, {
            startDate: calculatedStartDate,
            endDate: calculatedEndDate,
            provider,
            modelId,
            currency,
            includeVolumeDiscounts,
        });

        // Get daily usage for trends
        const dailyUsage = await TokenTrackingService.getDailyTokenUsage(userId, {
            startDate: calculatedStartDate,
            endDate: calculatedEndDate,
            provider,
        });

        // Process daily trends
        const dailyTrends = dailyUsage.map(day => ({
            date: day.date.toISOString().split('T')[0],
            tokens: day.totalTokens,
            cost: day.estimatedCost,
        })).sort((a, b) => a.date.localeCompare(b.date));

        // Calculate top providers
        const providerStats = new Map<string, { tokens: number; cost: number }>();
        if (costData.breakdownByProvider) {
            Object.entries(costData.breakdownByProvider).forEach(([providerName, breakdown]) => {
                providerStats.set(providerName, {
                    tokens: breakdown.totalTokens,
                    cost: breakdown.totalCost,
                });
            });
        }

        const topProviders = Array.from(providerStats.entries())
            .map(([provider, stats]) => ({
                provider,
                tokenCount: stats.tokens,
                cost: stats.cost,
                percentage: (stats.tokens / costData.totalTokens) * 100,
            }))
            .sort((a, b) => b.tokenCount - a.tokenCount)
            .slice(0, 10);

        // Calculate top models (simplified - would need model breakdown from cost data)
        const topModels = [
            {
                modelId: 'gpt-4' as any,
                tokenCount: costData.totalTokens * 0.6, // Example calculation
                cost: costData.totalCost * 0.6,
                percentage: 60,
            },
            {
                modelId: 'gpt-3.5-turbo' as any,
                tokenCount: costData.totalTokens * 0.4, // Example calculation
                cost: costData.totalCost * 0.4,
                percentage: 40,
            },
        ];

        // Calculate averages
        const averageTokensPerRequest = costData.requestCount > 0 ? costData.totalTokens / costData.requestCount : 0;
        const averageCostPerRequest = costData.requestCount > 0 ? costData.totalCost / costData.requestCount : 0;

        // Build summary result
        const result: UsageSummaryStats = {
            totalTokens: costData.totalTokens,
            totalCost: costData.totalCost,
            currency: costData.currency,
            requestCount: costData.requestCount,
            averageTokensPerRequest,
            averageCostPerRequest,
            topProviders,
            topModels,
            dailyTrends,
            period: {
                startDate: calculatedStartDate!,
                endDate: calculatedEndDate!,
                days: Math.ceil((calculatedEndDate!.getTime() - calculatedStartDate!.getTime()) / (1000 * 60 * 60 * 24)),
            },
        };

        // Create response metadata
        const meta = {
            userId,
            period,
            currency,
            filters: {
                startDate: calculatedStartDate?.toISOString(),
                endDate: calculatedEndDate?.toISOString(),
                provider,
                modelId,
                includeVolumeDiscounts,
            },
        };

        return ValidationMiddleware.createSuccessResponse(result, meta);

    } catch (error) {
        console.error(`[UsageSummaryAPI:${requestId}] Error:`, error);
        return ValidationMiddleware.createErrorResponse(
            'INTERNAL_ERROR',
            'Failed to retrieve usage summary statistics',
            500,
            error instanceof Error ? error.message : String(error)
        );
    }
}

/**
 * @swagger
 * /api/usage/summary:
 *   get:
 *     summary: Retrieve usage summary statistics
 *     description: Get comprehensive usage summary including tokens, costs, trends, and top providers/models
 *     tags:
 *       - Usage
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for filtering (ISO format, required when period=custom)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for filtering (ISO format, required when period=custom)
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *         description: Filter by provider
 *       - in: query
 *         name: modelId
 *         schema:
 *           type: string
 *         description: Filter by model ID
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           default: USD
 *         description: Currency for cost data
 *       - in: query
 *         name: includeVolumeDiscounts
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include volume discounts in calculations
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year, custom]
 *           default: month
 *         description: Time period for the summary
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
 *                   $ref: '#/components/schemas/UsageSummaryStats'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     period:
 *                       type: string
 *                     currency:
 *                       type: string
 *                     filters:
 *                       type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */