import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/lib/middleware/auth';
import { ValidationMiddleware } from '@/lib/middleware/validation';
import { RateLimitMiddleware } from '@/lib/middleware/rateLimit';
import { TokenTrackingService } from '@/lib/tokenTracking';
import { CostCalculationService } from '@/lib/services/costCalculation';
import { ExportParams, ExportResponse, ApiResponse } from '@/lib/types/api';
import { nanoid } from 'nanoid';

/**
 * API endpoint for exporting usage data
 * 
 * GET /api/usage/export
 * 
 * Query Parameters:
 * - startDate: string (optional) - Start date for filtering (ISO format)
 * - endDate: string (optional) - End date for filtering (ISO format)
 * - provider: string (optional) - Filter by provider
 * - modelId: string (optional) - Filter by model ID
 * - currency: string (optional) - Currency for cost data (default: USD)
 * - page: number (optional) - Page number for pagination (default: 1)
 * - limit: number (optional) - Items per page (default: 1000, max: 5000)
 * - offset: number (optional) - Offset for pagination (alternative to page)
 * - format: string (required) - Export format: 'json' | 'csv'
 * - includeCostData: boolean (optional) - Include cost data (default: true)
 * - includeMetadata: boolean (optional) - Include metadata (default: false)
 * 
 * Response:
 * - success: boolean
 * - data: ExportResponse
 * - meta: Export configuration and filter information
 * 
 * Authentication: Required
 * Rate Limit: 10 requests per minute
 */

// Validation schema for query parameters
const querySchema = {
    startDate: { type: 'date', required: false },
    endDate: { type: 'date', required: false },
    provider: { type: 'string', required: false, maxLength: 50 },
    modelId: { type: 'string', required: false, maxLength: 100 },
    currency: { type: 'string', required: false, minLength: 3, maxLength: 3, default: 'USD' },
    page: { type: 'integer', required: false, min: 1, default: 1 },
    limit: { type: 'integer', required: false, min: 1, max: 5000, default: 1000 },
    offset: { type: 'integer', required: false, min: 0 },
    format: { type: 'string', required: true, enum: ['json', 'csv'] },
    includeCostData: { type: 'boolean', required: false, default: true },
    includeMetadata: { type: 'boolean', required: false, default: false },
};

export async function GET(req: NextRequest) {
    const requestId = nanoid();

    try {
        // Apply rate limiting (stricter for export endpoints)
        const rateLimitResult = await RateLimitMiddleware.withConfig(req, 'export');
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
            format,
            includeCostData,
            includeMetadata,
        } = validation.data;

        // Validate date range
        if (startDate && endDate && startDate > endDate) {
            return ValidationMiddleware.createErrorResponse(
                'INVALID_DATE_RANGE',
                'startDate must be before endDate',
                400
            );
        }

        // Get token usage data
        const tokenStats = await TokenTrackingService.getUserTokenStats(userId, {
            startDate,
            endDate,
            provider,
        });

        // Get daily usage data
        const dailyUsage = await TokenTrackingService.getDailyTokenUsage(userId, {
            startDate,
            endDate,
            provider,
        });

        // Prepare export data
        let exportData: any[] = [];

        if (format === 'json') {
            // For JSON format, export daily usage data
            exportData = dailyUsage.map(day => ({
                date: day.date.toISOString().split('T')[0],
                provider: day.provider,
                inputTokens: day.inputTokens,
                outputTokens: day.outputTokens,
                totalTokens: day.totalTokens,
                estimatedCost: includeCostData ? day.estimatedCost : undefined,
                actualCost: includeCostData ? day.actualCost : undefined,
                requestCount: day.requestCount,
                currency: includeCostData ? currency : undefined,
                ...(includeMetadata ? { metadata: {} } : {}),
            }));
        } else if (format === 'csv') {
            // For CSV format, prepare structured data
            exportData = dailyUsage.map(day => ({
                date: day.date.toISOString().split('T')[0],
                provider: day.provider,
                input_tokens: day.inputTokens,
                output_tokens: day.outputTokens,
                total_tokens: day.totalTokens,
                ...(includeCostData ? {
                    estimated_cost: day.estimatedCost,
                    actual_cost: day.actualCost,
                    currency,
                } : {}),
                request_count: day.requestCount,
                ...(includeMetadata ? { metadata: '{}' } : {}),
            }));
        }

        // Generate export file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `usage-export-${timestamp}.${format}`;

        let downloadUrl: string;
        let fileContent: string;

        if (format === 'json') {
            fileContent = JSON.stringify(exportData, null, 2);
            // In a real implementation, you would upload this to cloud storage
            // and return a signed URL. For now, we'll return a data URL.
            const base64 = Buffer.from(fileContent).toString('base64');
            downloadUrl = `data:application/json;base64,${base64}`;
        } else if (format === 'csv') {
            // Generate CSV content
            if (exportData.length > 0) {
                const headers = Object.keys(exportData[0]);
                const csvRows = [
                    headers.join(','),
                    ...exportData.map(row =>
                        headers.map(header => {
                            const value = row[header];
                            // Escape CSV special characters and wrap in quotes if needed
                            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                                return `"${value.replace(/"/g, '""')}"`;
                            }
                            return value;
                        }).join(',')
                    )
                ];
                fileContent = csvRows.join('\n');
            } else {
                fileContent = 'No data available';
            }

            // Generate data URL for CSV
            const base64 = Buffer.from(fileContent).toString('base64');
            downloadUrl = `data:text/csv;base64,${base64}`;
        } else {
            return ValidationMiddleware.createErrorResponse(
                'INVALID_FORMAT',
                'Unsupported export format',
                400
            );
        }

        // Create export response
        const result: ExportResponse = {
            downloadUrl,
            filename,
            format,
            recordCount: exportData.length,
            generatedAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiry
        };

        // Create response metadata
        const meta = {
            userId,
            format,
            currency,
            includeCostData,
            includeMetadata,
            filters: {
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString(),
                provider,
                modelId,
            },
            export: {
                recordCount: exportData.length,
                generatedAt: result.generatedAt.toISOString(),
                expiresAt: result.expiresAt.toISOString(),
            },
        };

        return ValidationMiddleware.createSuccessResponse(result, meta);

    } catch (error) {
        console.error(`[UsageExportAPI:${requestId}] Error:`, error);
        return ValidationMiddleware.createErrorResponse(
            'INTERNAL_ERROR',
            'Failed to export usage data',
            500,
            error instanceof Error ? error.message : String(error)
        );
    }
}

/**
 * @swagger
 * /api/usage/export:
 *   get:
 *     summary: Export usage data
 *     description: Export token usage data in JSON or CSV format
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
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 1000
 *           maximum: 5000
 *         description: Items per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Offset for pagination (alternative to page)
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *         description: Export format (required)
 *       - in: query
 *         name: includeCostData
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include cost data in export
 *       - in: query
 *         name: includeMetadata
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include metadata in export
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
 *                   $ref: '#/components/schemas/ExportResponse'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     format:
 *                       type: string
 *                     currency:
 *                       type: string
 *                     includeCostData:
 *                       type: boolean
 *                     includeMetadata:
 *                       type: boolean
 *                     filters:
 *                       type: object
 *                     export:
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