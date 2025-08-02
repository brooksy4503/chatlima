import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/lib/middleware/auth';
import { ValidationMiddleware } from '@/lib/middleware/validation';
import { RateLimitMiddleware } from '@/lib/middleware/rateLimit';
import { PaginationUtil } from '@/lib/utils/pagination';
import { TokenTrackingService } from '@/lib/tokenTracking';
import { ModelPricingInfo, ModelPricingList, ApiResponse } from '@/lib/types/api';
import { nanoid } from 'nanoid';

/**
 * API endpoint for retrieving and managing model pricing information
 * 
 * GET /api/pricing/models - Retrieve model pricing information
 * PUT /api/pricing/models - Update model pricing (admin only)
 * 
 * GET Query Parameters:
 * - provider: string (optional) - Filter by provider
 * - modelId: string (optional) - Filter by model ID
 * - currency: string (optional) - Filter by currency (default: USD)
 * - isActive: boolean (optional) - Filter by active status
 * - page: number (optional) - Page number for pagination (default: 1)
 * - limit: number (optional) - Items per page (default: 50, max: 100)
 * - offset: number (optional) - Offset for pagination (alternative to page)
 * 
 * GET Response:
 * - success: boolean
 * - data: ModelPricingList
 * - meta: Pagination metadata and filter information
 * 
 * PUT Request Body:
 * - modelId: string (required) - Model ID
 * - provider: string (required) - Provider name
 * - inputTokenPrice: number (required) - Price per input token
 * - outputTokenPrice: number (required) - Price per output token
 * - currency: string (optional) - Currency (default: USD)
 * - isActive: boolean (optional) - Active status (default: true)
 * - effectiveFrom: string (optional) - Effective from date (ISO format)
 * - effectiveTo: string (optional) - Effective to date (ISO format)
 * 
 * PUT Response:
 * - success: boolean
 * - data: ModelPricingInfo
 * - meta: Operation metadata
 * 
 * Authentication: Required
 * Rate Limit: 20 requests per minute
 */

// Validation schema for GET query parameters
const getQuerySchema = {
    provider: { type: 'string', required: false, maxLength: 50 },
    modelId: { type: 'string', required: false, maxLength: 100 },
    currency: { type: 'string', required: false, minLength: 3, maxLength: 3, default: 'USD' },
    isActive: { type: 'boolean', required: false },
    page: { type: 'integer', required: false, min: 1, default: 1 },
    limit: { type: 'integer', required: false, min: 1, max: 100, default: 50 },
    offset: { type: 'integer', required: false, min: 0 },
};

// Validation schema for PUT request body
const putBodySchema = {
    modelId: { type: 'string', required: true, maxLength: 100 },
    provider: { type: 'string', required: true, maxLength: 50 },
    inputTokenPrice: { type: 'number', required: true, min: 0 },
    outputTokenPrice: { type: 'number', required: true, min: 0 },
    currency: { type: 'string', required: false, minLength: 3, maxLength: 3, default: 'USD' },
    isActive: { type: 'boolean', required: false, default: true },
    effectiveFrom: { type: 'date', required: false },
    effectiveTo: { type: 'date', required: false },
};

export async function GET(req: NextRequest) {
    const requestId = nanoid();

    try {
        // Apply rate limiting
        const rateLimitResult = await RateLimitMiddleware.withConfig(req, 'pricing');
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
            provider,
            modelId,
            currency,
            isActive,
            page,
            limit,
            offset,
        } = validation.data;

        // Get model pricing data
        // Note: This would typically query the model_pricing table directly
        // For now, we'll return mock data
        const mockPricingData: ModelPricingInfo[] = [
            {
                id: '1',
                modelId: 'gpt-4' as any,
                provider: 'openai',
                inputTokenPrice: 0.00003,
                outputTokenPrice: 0.00006,
                currency: 'USD',
                effectiveFrom: new Date('2024-01-01'),
                isActive: true,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
            },
            {
                id: '2',
                modelId: 'gpt-3.5-turbo' as any,
                provider: 'openai',
                inputTokenPrice: 0.0000015,
                outputTokenPrice: 0.000002,
                currency: 'USD',
                effectiveFrom: new Date('2024-01-01'),
                isActive: true,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
            },
        ];

        // Filter data based on parameters
        let filteredData = mockPricingData;
        if (provider) {
            filteredData = filteredData.filter(item => item.provider === provider);
        }
        if (modelId) {
            filteredData = filteredData.filter(item => item.modelId === modelId);
        }
        if (currency) {
            filteredData = filteredData.filter(item => item.currency === currency);
        }
        if (isActive !== undefined) {
            filteredData = filteredData.filter(item => item.isActive === isActive);
        }

        // Apply pagination
        const paginatedData = PaginationUtil.applyPagination(filteredData, page, limit, offset);

        // Create response metadata
        const baseUrl = `${req.nextUrl.origin}${req.nextUrl.pathname}`;
        const queryParams = PaginationUtil.getQueryParams(req.url);
        delete queryParams.page;
        delete queryParams.limit;
        delete queryParams.offset;

        const paginationMeta = PaginationUtil.createMetadata(
            page,
            limit,
            paginatedData.total,
            baseUrl,
            queryParams
        );

        const result: ModelPricingList = {
            models: paginatedData.items,
            total: paginatedData.total,
        };

        const meta = {
            userId,
            currency,
            filters: {
                provider,
                modelId,
                isActive,
            },
            pagination: paginationMeta.pagination,
        };

        return ValidationMiddleware.createSuccessResponse(result, meta);

    } catch (error) {
        console.error(`[ModelPricingAPI:${requestId}] GET Error:`, error);
        return ValidationMiddleware.createErrorResponse(
            'INTERNAL_ERROR',
            'Failed to retrieve model pricing information',
            500,
            error instanceof Error ? error.message : String(error)
        );
    }
}

export async function PUT(req: NextRequest) {
    const requestId = nanoid();

    try {
        // Apply rate limiting
        const rateLimitResult = await RateLimitMiddleware.withConfig(req, 'pricing');
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
            modelId,
            provider,
            inputTokenPrice,
            outputTokenPrice,
            currency,
            isActive,
            effectiveFrom,
            effectiveTo,
        } = validation.data;

        // Validate effective date range
        if (effectiveFrom && effectiveTo && effectiveFrom > effectiveTo) {
            return ValidationMiddleware.createErrorResponse(
                'INVALID_DATE_RANGE',
                'effectiveFrom must be before effectiveTo',
                400
            );
        }

        // Update model pricing
        const pricingParams = {
            modelId,
            provider,
            inputTokenPrice,
            outputTokenPrice,
            currency,
            isActive,
            effectiveFrom: effectiveFrom || new Date(),
            effectiveTo,
        };

        await TokenTrackingService.setModelPricing(pricingParams);

        // Create result
        const result: ModelPricingInfo = {
            id: nanoid(),
            modelId,
            provider,
            inputTokenPrice,
            outputTokenPrice,
            currency,
            isActive,
            effectiveFrom: effectiveFrom || new Date(),
            effectiveTo,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const meta = {
            userId,
            operation: 'update',
            timestamp: new Date().toISOString(),
        };

        return ValidationMiddleware.createSuccessResponse(result, meta);

    } catch (error) {
        console.error(`[ModelPricingAPI:${requestId}] PUT Error:`, error);
        return ValidationMiddleware.createErrorResponse(
            'INTERNAL_ERROR',
            'Failed to update model pricing',
            500,
            error instanceof Error ? error.message : String(error)
        );
    }
}

/**
 * @swagger
 * /api/pricing/models:
 *   get:
 *     summary: Retrieve model pricing information
 *     description: Get a list of model pricing configurations with filtering and pagination
 *     tags:
 *       - Pricing
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Filter by currency
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
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
 *           default: 50
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Offset for pagination (alternative to page)
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
 *                   $ref: '#/components/schemas/ModelPricingList'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     userId:
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
 *   
 *   put:
 *     summary: Update model pricing information
 *     description: Create or update model pricing configuration (admin only)
 *     tags:
 *       - Pricing
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modelId
 *               - provider
 *               - inputTokenPrice
 *               - outputTokenPrice
 *             properties:
 *               modelId:
 *                 type: string
 *                 description: Model ID
 *               provider:
 *                 type: string
 *                 description: Provider name
 *               inputTokenPrice:
 *                 type: number
 *                 minimum: 0
 *                 description: Price per input token
 *               outputTokenPrice:
 *                 type: number
 *                 minimum: 0
 *                 description: Price per output token
 *               currency:
 *                 type: string
 *                 default: USD
 *                 description: Currency for pricing
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Whether this pricing is active
 *               effectiveFrom:
 *                 type: string
 *                 format: date-time
 *                 description: When this pricing becomes effective
 *               effectiveTo:
 *                 type: string
 *                 format: date-time
 *                 description: When this pricing expires (optional)
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
 *                   $ref: '#/components/schemas/ModelPricingInfo'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     userId:
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