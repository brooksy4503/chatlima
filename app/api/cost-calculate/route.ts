import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CostCalculationService } from '@/lib/services/costCalculation';
import { nanoid } from 'nanoid';

// Diagnostic logging helper
const logDiagnostic = (type: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}][${type}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

export async function POST(req: NextRequest) {
  const requestId = nanoid(); // Unique ID for this request
  logDiagnostic('REQUEST_START', `Starting cost calculation API request (POST)`, {
    requestId,
    url: req.url,
    method: req.method
  });

  try {
    // Check if user is authenticated
    logDiagnostic('AUTH_START', `Starting authentication check`, { requestId });
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      logDiagnostic('AUTH_FAILED', `Authentication failed - no session`, { requestId });
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    logDiagnostic('AUTH_SUCCESS', `Authentication successful`, {
      requestId,
      userId: session.user.id
    });

    const body = await req.json();
    logDiagnostic('REQUEST_PARSED', `Request body parsed`, {
      requestId,
      bodyKeys: Object.keys(body)
    });

    const {
      inputTokens,
      outputTokens,
      modelId,
      provider,
      currency = 'USD',
      includeVolumeDiscounts = true,
      exchangeRates,
      customPricing,
    } = body;

    logDiagnostic('VALIDATION_START', `Starting parameter validation`, {
      requestId,
      inputTokens,
      outputTokens,
      modelId,
      provider,
      currency,
      includeVolumeDiscounts
    });

    // Validate required fields
    if (inputTokens === undefined || outputTokens === undefined || !modelId || !provider) {
      logDiagnostic('VALIDATION_FAILED', `Missing required fields`, {
        requestId,
        hasInputTokens: inputTokens !== undefined,
        hasOutputTokens: outputTokens !== undefined,
        hasModelId: !!modelId,
        hasProvider: !!provider
      });
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMETER', message: 'Missing required fields: inputTokens, outputTokens, modelId, provider' } },
        { status: 400 }
      );
    }

    // Validate token counts
    if (typeof inputTokens !== 'number' || inputTokens < 0) {
      logDiagnostic('VALIDATION_FAILED', `Invalid inputTokens`, {
        requestId,
        inputTokens,
        type: typeof inputTokens
      });
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMETER', message: 'inputTokens must be a non-negative number' } },
        { status: 400 }
      );
    }

    if (typeof outputTokens !== 'number' || outputTokens < 0) {
      logDiagnostic('VALIDATION_FAILED', `Invalid outputTokens`, {
        requestId,
        outputTokens,
        type: typeof outputTokens
      });
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMETER', message: 'outputTokens must be a non-negative number' } },
        { status: 400 }
      );
    }

    logDiagnostic('VALIDATION_SUCCESS', `Parameter validation successful`, { requestId });

    // Calculate cost
    logDiagnostic('CALCULATION_START', `Starting cost calculation`, {
      requestId,
      inputTokens,
      outputTokens,
      modelId,
      provider,
      options: {
        currency,
        includeVolumeDiscounts,
        hasExchangeRates: !!exchangeRates,
        hasCustomPricing: !!customPricing
      }
    });

    const costBreakdown = await CostCalculationService.calculateCost(
      inputTokens,
      outputTokens,
      modelId,
      provider,
      {
        currency,
        includeVolumeDiscounts,
        exchangeRates,
        customPricing,
      }
    );

    logDiagnostic('CALCULATION_SUCCESS', `Cost calculation completed successfully`, {
      requestId,
      totalCost: costBreakdown.totalCost,
      currency: costBreakdown.currency,
      hasDiscounts: costBreakdown.volumeDiscountApplied || costBreakdown.discountAmount > 0
    });

    return NextResponse.json({
      success: true,
      data: costBreakdown,
      meta: {
        inputTokens,
        outputTokens,
        modelId,
        provider,
        currency,
        includeVolumeDiscounts,
      },
    });
  } catch (error) {
    logDiagnostic('REQUEST_ERROR', `Error in cost calculation API (POST)`, {
      requestId,
      error: error instanceof Error ? error.message : String(error)
    });
    console.error('[Cost Calculate API] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to calculate cost' } },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const requestId = nanoid(); // Unique ID for this request
  logDiagnostic('REQUEST_START', `Starting cost calculation API request (GET)`, {
    requestId,
    url: req.url,
    method: req.method
  });

  try {
    // Check if user is authenticated
    logDiagnostic('AUTH_START', `Starting authentication check`, { requestId });
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      logDiagnostic('AUTH_FAILED', `Authentication failed - no session`, { requestId });
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    logDiagnostic('AUTH_SUCCESS', `Authentication successful`, {
      requestId,
      userId: session.user.id
    });

    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get('recordId');
    const currency = searchParams.get('currency') || 'USD';
    const includeVolumeDiscounts = searchParams.get('includeVolumeDiscounts') !== 'false';

    logDiagnostic('VALIDATION_START', `Starting parameter validation`, {
      requestId,
      recordId,
      currency,
      includeVolumeDiscounts
    });

    if (!recordId) {
      logDiagnostic('VALIDATION_FAILED', `Missing required recordId parameter`, { requestId });
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMETER', message: 'recordId parameter is required' } },
        { status: 400 }
      );
    }

    logDiagnostic('VALIDATION_SUCCESS', `Parameter validation successful`, { requestId });

    // Calculate cost for specific record
    logDiagnostic('CALCULATION_START', `Starting cost calculation for record`, {
      requestId,
      recordId,
      currency,
      includeVolumeDiscounts
    });

    const costBreakdown = await CostCalculationService.calculateCostForRecord(
      recordId,
      {
        currency,
        includeVolumeDiscounts,
      }
    );

    logDiagnostic('CALCULATION_SUCCESS', `Cost calculation for record completed successfully`, {
      requestId,
      recordId,
      totalCost: costBreakdown.totalCost,
      currency: costBreakdown.currency,
      hasDiscounts: costBreakdown.volumeDiscountApplied || costBreakdown.discountAmount > 0
    });

    return NextResponse.json({
      success: true,
      data: costBreakdown,
      meta: {
        recordId,
        currency,
        includeVolumeDiscounts,
      },
    });
  } catch (error) {
    logDiagnostic('REQUEST_ERROR', `Error in cost calculation API (GET)`, {
      requestId,
      error: error instanceof Error ? error.message : String(error)
    });
    console.error('[Cost Calculate API] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to calculate cost for record' } },
      { status: 500 }
    );
  }
}
