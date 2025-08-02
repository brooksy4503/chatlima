import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TokenTrackingService } from '@/lib/tokenTracking';
import { nanoid } from 'nanoid';

// Diagnostic logging helper
const logDiagnostic = (type: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}][${type}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

export async function POST(req: NextRequest) {
  const requestId = nanoid(); // Unique ID for this request
  logDiagnostic('REQUEST_START', `Starting model pricing API request (POST)`, {
    requestId,
    url: req.url,
    method: req.method
  });

  try {
    // Check if user is authenticated and is an admin
    logDiagnostic('AUTH_START', `Starting authentication check`, { requestId });
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      logDiagnostic('AUTH_FAILED', `Authentication failed - no session`, { requestId });
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check if user is an admin (you may need to adjust this based on your auth system)
    const isAdmin = (session.user as any)?.role === 'admin' || (session.user as any)?.isAdmin === true;

    if (!isAdmin) {
      logDiagnostic('AUTH_FAILED', `Authentication failed - not admin`, {
        requestId,
        userId: session.user.id,
        userRole: (session.user as any)?.role,
        isAdmin: (session.user as any)?.isAdmin
      });
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    logDiagnostic('AUTH_SUCCESS', `Authentication successful`, {
      requestId,
      userId: session.user.id,
      isAdmin
    });

    const body = await req.json();
    logDiagnostic('REQUEST_PARSED', `Request body parsed`, {
      requestId,
      bodyKeys: Object.keys(body)
    });

    const { modelId, provider, inputTokenPrice, outputTokenPrice, currency = 'USD', isActive = true } = body;

    logDiagnostic('VALIDATION_START', `Starting parameter validation`, {
      requestId,
      modelId,
      provider,
      inputTokenPrice,
      outputTokenPrice,
      currency,
      isActive
    });

    // Validate required fields
    if (!modelId || !provider || inputTokenPrice === undefined || outputTokenPrice === undefined) {
      logDiagnostic('VALIDATION_FAILED', `Missing required fields`, {
        requestId,
        hasModelId: !!modelId,
        hasProvider: !!provider,
        hasInputTokenPrice: inputTokenPrice !== undefined,
        hasOutputTokenPrice: outputTokenPrice !== undefined
      });
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMETER', message: 'Missing required fields: modelId, provider, inputTokenPrice, outputTokenPrice' } },
        { status: 400 }
      );
    }

    // Validate price values
    if (typeof inputTokenPrice !== 'number' || inputTokenPrice < 0) {
      logDiagnostic('VALIDATION_FAILED', `Invalid inputTokenPrice`, {
        requestId,
        inputTokenPrice,
        type: typeof inputTokenPrice
      });
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMETER', message: 'inputTokenPrice must be a positive number' } },
        { status: 400 }
      );
    }

    if (typeof outputTokenPrice !== 'number' || outputTokenPrice < 0) {
      logDiagnostic('VALIDATION_FAILED', `Invalid outputTokenPrice`, {
        requestId,
        outputTokenPrice,
        type: typeof outputTokenPrice
      });
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMETER', message: 'outputTokenPrice must be a positive number' } },
        { status: 400 }
      );
    }

    logDiagnostic('VALIDATION_SUCCESS', `Parameter validation successful`, { requestId });

    // Set model pricing
    logDiagnostic('PRICING_UPDATE_START', `Starting model pricing update`, {
      requestId,
      modelId,
      provider,
      inputTokenPrice,
      outputTokenPrice,
      currency,
      isActive
    });

    await TokenTrackingService.setModelPricing({
      modelId,
      provider,
      inputTokenPrice,
      outputTokenPrice,
      currency,
      isActive,
    });

    logDiagnostic('PRICING_UPDATE_SUCCESS', `Model pricing updated successfully`, {
      requestId,
      modelId,
      provider
    });

    return NextResponse.json({
      success: true,
      message: 'Model pricing updated successfully',
      data: {
        modelId,
        provider,
        inputTokenPrice,
        outputTokenPrice,
        currency,
        isActive,
      },
    });
  } catch (error) {
    logDiagnostic('REQUEST_ERROR', `Error in model pricing API (POST)`, {
      requestId,
      error: error instanceof Error ? error.message : String(error)
    });
    console.error('[Model Pricing API] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update model pricing' } },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const requestId = nanoid(); // Unique ID for this request
  logDiagnostic('REQUEST_START', `Starting model pricing API request (GET)`, {
    requestId,
    url: req.url,
    method: req.method
  });

  try {
    // Check if user is authenticated and is an admin
    logDiagnostic('AUTH_START', `Starting authentication check`, { requestId });
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      logDiagnostic('AUTH_FAILED', `Authentication failed - no session`, { requestId });
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const isAdmin = (session.user as any)?.role === 'admin' || (session.user as any)?.isAdmin === true;

    if (!isAdmin) {
      logDiagnostic('AUTH_FAILED', `Authentication failed - not admin`, {
        requestId,
        userId: session.user.id,
        userRole: (session.user as any)?.role,
        isAdmin: (session.user as any)?.isAdmin
      });
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    logDiagnostic('AUTH_SUCCESS', `Authentication successful`, {
      requestId,
      userId: session.user.id,
      isAdmin
    });

    // For now, return a message that pricing data is stored in the database
    // In a real implementation, you would query the model_pricing table here
    logDiagnostic('PRICING_INFO', `Returning model pricing information`, { requestId });

    return NextResponse.json({
      success: true,
      message: 'Model pricing data is stored in the database',
      data: {
        note: 'Use the database to query model pricing information',
        table: 'model_pricing',
      },
    });
  } catch (error) {
    logDiagnostic('REQUEST_ERROR', `Error in model pricing API (GET)`, {
      requestId,
      error: error instanceof Error ? error.message : String(error)
    });
    console.error('[Model Pricing API] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve model pricing' } },
      { status: 500 }
    );
  }
}
