import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CostCalculationService } from '@/lib/services/costCalculation';
import { nanoid } from 'nanoid';

// Diagnostic logging helper
const logDiagnostic = (category: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[CostAnalyticsAPI:${category}] ${timestamp} - ${message}`, data || '');
};

export async function GET(req: NextRequest) {
  const requestId = nanoid(); // Unique ID for this request
  logDiagnostic('REQUEST_START', `Starting cost analytics API request`, {
    requestId,
    url: req.url,
    method: req.method
  });

  try {
    // Check if user is authenticated
    logDiagnostic('AUTH_CHECK', `Checking user authentication`, { requestId });
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      logDiagnostic('AUTH_FAILED', `Authentication failed`, { requestId });
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    logDiagnostic('AUTH_SUCCESS', `Authentication successful`, {
      requestId,
      userId: session.user.id
    });

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const provider = searchParams.get('provider') || undefined;
    const modelId = searchParams.get('modelId') || undefined;
    const currency = searchParams.get('currency') || 'USD';
    const type = searchParams.get('type') || 'aggregated'; // 'aggregated', 'projected', 'limits'
    const includeVolumeDiscounts = searchParams.get('includeVolumeDiscounts') !== 'false';

    logDiagnostic('PARAMS_PARSED', `Parsed query parameters`, {
      requestId,
      userId,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      provider,
      modelId,
      currency,
      type,
      includeVolumeDiscounts
    });

    // Validate date parameters
    if (startDate && isNaN(startDate.getTime())) {
      logDiagnostic('VALIDATION_ERROR', `Invalid startDate format`, {
        requestId,
        startDate: searchParams.get('startDate')
      });
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMETER', message: 'Invalid startDate format' } },
        { status: 400 }
      );
    }

    if (endDate && isNaN(endDate.getTime())) {
      logDiagnostic('VALIDATION_ERROR', `Invalid endDate format`, {
        requestId,
        endDate: searchParams.get('endDate')
      });
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMETER', message: 'Invalid endDate format' } },
        { status: 400 }
      );
    }

    if (startDate && endDate && startDate > endDate) {
      logDiagnostic('VALIDATION_ERROR', `startDate must be before endDate`, {
        requestId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMETER', message: 'startDate must be before endDate' } },
        { status: 400 }
      );
    }

    logDiagnostic('VALIDATION_SUCCESS', `Parameter validation passed`, { requestId });

    let result;

    switch (type) {
      case 'aggregated':
        logDiagnostic('FETCH_AGGREGATED_START', `Fetching aggregated cost data`, {
          requestId,
          userId,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          provider,
          modelId,
          currency,
          includeVolumeDiscounts
        });

        // Get aggregated cost data
        result = await CostCalculationService.getAggregatedCosts(userId, {
          startDate,
          endDate,
          provider,
          modelId,
          currency,
          includeVolumeDiscounts,
        });

        logDiagnostic('FETCH_AGGREGATED_SUCCESS', `Successfully fetched aggregated cost data`, {
          requestId,
          totalCost: result.totalCost,
          requestCount: result.requestCount
        });
        break;

      case 'projected':
        const periodDays = searchParams.get('periodDays') ? parseInt(searchParams.get('periodDays')!) : 30;

        logDiagnostic('FETCH_PROJECTED_START', `Fetching projected costs`, {
          requestId,
          userId,
          periodDays,
          provider,
          modelId,
          currency
        });

        // Get projected costs
        result = await CostCalculationService.calculateProjectedCosts(userId, {
          periodDays,
          provider,
          modelId,
          currency,
        });

        logDiagnostic('FETCH_PROJECTED_SUCCESS', `Successfully fetched projected costs`, {
          requestId,
          projectedMonthlyCost: result.projectedMonthlyCost,
          confidence: result.confidence
        });
        break;

      case 'limits':
        const monthlyLimit = searchParams.get('monthlyLimit') ? parseFloat(searchParams.get('monthlyLimit')!) : 100;

        logDiagnostic('FETCH_LIMITS_START', `Checking usage limits`, {
          requestId,
          userId,
          monthlyLimit,
          currency
        });

        // Check usage limits
        result = await CostCalculationService.checkUsageLimits(userId, {
          monthlyLimit,
          currency,
        });

        logDiagnostic('FETCH_LIMITS_SUCCESS', `Successfully checked usage limits`, {
          requestId,
          isApproachingLimit: result.isApproachingLimit,
          isOverLimit: result.isOverLimit,
          percentageUsed: result.percentageUsed
        });
        break;

      default:
        logDiagnostic('INVALID_TYPE', `Invalid type parameter`, {
          requestId,
          type,
          validTypes: ['aggregated', 'projected', 'limits']
        });
        return NextResponse.json(
          { error: { code: 'INVALID_PARAMETER', message: 'Invalid type parameter. Must be one of: aggregated, projected, limits' } },
          { status: 400 }
        );
    }

    const response = {
      success: true,
      data: result,
      meta: {
        userId,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        provider,
        modelId,
        currency,
        type,
        includeVolumeDiscounts,
      },
    };

    logDiagnostic('REQUEST_SUCCESS', `Cost analytics API request completed successfully`, {
      requestId,
      response: {
        ...response,
        // Don't log the full data to avoid overly verbose logs
        data: type === 'aggregated' ?
          { totalCost: (response.data as any).totalCost, requestCount: (response.data as any).requestCount } :
          type === 'projected' ?
            { projectedMonthlyCost: (response.data as any).projectedMonthlyCost, confidence: (response.data as any).confidence } :
            { isApproachingLimit: (response.data as any).isApproachingLimit, percentageUsed: (response.data as any).percentageUsed }
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    logDiagnostic('REQUEST_ERROR', `Error in cost analytics API request`, {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error('[Cost Analytics API] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve cost analytics data' } },
      { status: 500 }
    );
  }
}