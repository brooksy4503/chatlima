import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/lib/middleware/auth';
import { ValidationMiddleware } from '@/lib/middleware/validation';
import { RateLimitMiddleware } from '@/lib/middleware/rateLimit';
import { PaginationUtil } from '@/lib/utils/pagination';
import { TokenTrackingService } from '@/lib/tokenTracking';
import { TokenUsageData, TokenUsageStats, ApiResponse } from '@/lib/types/api';
import { nanoid } from 'nanoid';

/**
 * API endpoint for retrieving token usage data
 * 
 * GET /api/usage/token
 * 
 * Query Parameters:
 * - startDate: string (optional) - Start date for filtering (ISO format)
 * - endDate: string (optional) - End date for filtering (ISO format)
 * - provider: string (optional) - Filter by provider
 * - modelId: string (optional) - Filter by model ID
 * - currency: string (optional) - Currency for cost data (default: USD)
 * - page: number (optional) - Page number for pagination (default: 1)
 * - limit: number (optional) - Items per page (default: 20, max: 100)
 * - offset: number (optional) - Offset for pagination (alternative to page)
 * - type: string (optional) - Data type: 'detailed' | 'stats' | 'daily' (default: 'detailed')
 * 
 * Response:
 * - success: boolean
 * - data: TokenUsageData[] | TokenUsageStats | DailyTokenUsageData[]
 * - meta: Pagination metadata and filter information
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
    page: { type: 'integer', required: false, min: 1, default: 1 },
    limit: { type: 'integer', required: false, min: 1, max: 100, default: 20 },
    offset: { type: 'integer', required: false, min: 0 },
    type: { type: 'string', required: false, enum: ['detailed', 'stats', 'daily'], default: 'detailed' },
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
            page,
            limit,
            offset,
            type,
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
        let totalItems = 0;

        // Fetch data based on type
        switch (type) {
            case 'stats':
                // Get aggregated statistics
                result = await TokenTrackingService.getUserTokenStats(userId, {
                    startDate,
                    endDate,
                    provider,
                });
                break;

            case 'daily':
                // Get daily usage data
                const dailyData = await TokenTrackingService.getDailyTokenUsage(userId, {
                    startDate,
                    endDate,
                    provider,
                });

                // Apply pagination to daily data
                const paginatedDaily = PaginationUtil.applyPagination(dailyData, page, limit, offset);
                result = paginatedDaily.items;
                totalItems = paginatedDaily.total;
                break;

            case 'detailed':
            default:
                // For detailed data, we'll return an empty array for now
                // In a real implementation, this would query the token_usage_metrics table directly
                result = [];
                totalItems = 0;
                break;
        }

        // Create response metadata
        const meta: any = {
            userId,
            type,
            currency,
            filters: {
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString(),
                provider,
                modelId,
            },
        };

        // Add pagination metadata for array responses
        if (Array.isArray(result)) {
            const baseUrl = `${req.nextUrl.origin}${req.nextUrl.pathname}`;
            const queryParams = PaginationUtil.getQueryParams(req.url);
            delete queryParams.page;
            delete queryParams.limit;
            delete queryParams.offset;

            const paginationMeta = PaginationUtil.createMetadata(
                page,
                limit,
                totalItems,
                baseUrl,
                queryParams
            );

            meta.pagination = paginationMeta.pagination;
        }

        return ValidationMiddleware.createSuccessResponse(result, meta);

    } catch (error) {
        console.error(`[TokenUsageAPI:${requestId}] Error:`, error);
        return ValidationMiddleware.createErrorResponse(
            'INTERNAL_ERROR',
            'Failed to retrieve token usage data',
            500,
            error instanceof Error ? error.message : String(error)
        );
    }
}

/**
 * @swagger
 * /api/usage/token:
 *   get:
 *     summary: Retrieve token usage data
 *     description: Get detailed token usage records, statistics, or daily aggregations for the authenticated user
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
 *         description: Filter by provider (e.g., 'openai', 'anthic')
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
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Offset for pagination (alternative to page)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [detailed, stats, daily]
 *           default: detailed
 *         description: Type of data to return
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
 *                     - type: array
 *                       items:
 *                         $ref: '#/components/schemas/TokenUsageData'
 *                     - $ref: '#/components/schemas/TokenUsageStats'
 *                     - type: array
 *                       items:
 *                         $ref: '#/components/schemas/DailyTokenUsageData'
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
 *                     pagination:
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