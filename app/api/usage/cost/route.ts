import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/lib/middleware/auth';
import { ValidationMiddleware } from '@/lib/middleware/validation';
import { RateLimitMiddleware } from '@/lib/middleware/rateLimit';
import { PaginationUtil } from '@/lib/utils/pagination';
import { CostCalculationService } from '@/lib/services/costCalculation';
import { AggregatedCostData, ApiResponse } from '@/lib/types/api';
import { nanoid } from 'nanoid';

/**
 * API endpoint for retrieving cost analytics data
 * 
 * GET /api/usage/cost
 * 
 * Query Parameters:
 * - startDate: string (optional) - Start date for filtering (ISO format)
 * - endDate: string (optional) - End date for filtering (ISO format)
 * - provider: string (optional) - Filter by provider
 * - modelId: string (optional) - Filter by model ID
 * - currency: string (optional) - Currency for cost data (default: USD)
 * - includeVolumeDiscounts: boolean (optional) - Include volume discounts (default: true)
 * - type: string (optional) - Data type: 'aggregated' | 'projected' | 'limits' (default: 'aggregated')
 * - periodDays: number (optional) - Period in days for projected costs (default: 30)
 * - monthlyLimit: number (optional) - Monthly limit for usage limits check (default: 100)
 * 
 * Response:
 * - success: boolean
 * - data: AggregatedCostData | ProjectedCostData | UsageLimitStatus
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
    type: { type: 'string', required: false, enum: ['aggregated', 'projected', 'limits'], default: 'aggregated' },
    periodDays: { type: 'integer', required: false, min: 1, max: 365, default: 30 },
    monthlyLimit: { type: 'number', required: false, min: 0, default: 100 },
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
            type,
            periodDays,
            monthlyLimit,
        } = validation.data;

        // Validate date range
        if (startDate && endDate && startDate > endDate) {
            return ValidationMiddleware.createErrorResponse(
                'INVALID_DATE_RANGE',
                'startDate must be before endDate',
                400
            );
        }

        let result: any;

        // Fetch data based on type
        switch (type) {
            case 'aggregated':
                // Get aggregated cost data
                result = await CostCalculationService.getAggregatedCosts(userId, {
                    startDate,
                    endDate,
                    provider,
                    modelId,
                    currency,
                    includeVolumeDiscounts,
                });
                break;

            case 'projected':
                // Get projected costs
                result = await CostCalculationService.calculateProjectedCosts(userId, {
                    periodDays,
                    provider,
                    modelId,
                    currency,
                });
                break;

            case 'limits':
                // Check usage limits
                result = await CostCalculationService.checkUsageLimits(userId, {
                    monthlyLimit,
                    currency,
                });
                break;

            default:
                return ValidationMiddleware.createErrorResponse(
                    'INVALID_TYPE',
                    'Invalid type parameter. Must be one of: aggregated, projected, limits',
                    400
                );
        }

        // Create response metadata
        const meta = {
            userId,
            type,
            currency,
            filters: {
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString(),
                provider,
                modelId,
                includeVolumeDiscounts,
                periodDays: type === 'projected' ? periodDays : undefined,
                monthlyLimit: type === 'limits' ? monthlyLimit : undefined,
            },
        };

        return ValidationMiddleware.createSuccessResponse(result, meta);

    } catch (error) {
        console.error(`[CostAnalyticsAPI:${requestId}] Error:`, error);
        return ValidationMiddleware.createErrorResponse(
            'INTERNAL_ERROR',
            'Failed to retrieve cost analytics data',
            500,
            error instanceof Error ? error.message : String(error)
        );
    }
}

/**
 * @swagger
 * /api/usage/cost:
 *   get:
 *     summary: Retrieve cost analytics data
 *     description: Get aggregated cost data, projected costs, or usage limits for the authenticated user
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
 *         description: Start date for filtering (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for filtering (ISO format)
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [aggregated, projected, limits]
 *           default: aggregated
 *         description: Type of data to return
 *       - in: query
 *         name: periodDays
 *         schema:
 *           type: integer
 *           default: 30
 *           minimum: 1
 *           maximum: 365
 *         description: Period in days for projected costs (only for type=projected)
 *       - in: query
 *         name: monthlyLimit
 *         schema:
 *           type: number
 *           default: 100
 *           minimum: 0
 *         description: Monthly limit for usage limits check (only for type=limits)
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
 *                   oneOf:
 *                     - $ref: '#/components/schemas/AggregatedCostData'
 *                     - $ref: '#/components/schemas/ProjectedCostData'
 *                     - $ref: '#/components/schemas/UsageLimitStatus'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     type:
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