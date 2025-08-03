import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TokenTrackingService } from '@/lib/tokenTracking';
import { db } from '@/lib/db';
import { modelPricing, users } from '@/lib/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
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

    // Query the database to get the user's admin status
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (userResult.length === 0) {
      logDiagnostic('AUTH_FAILED', `User not found in database`, {
        requestId,
        userId: session.user.id
      });
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'User not found' } },
        { status: 403 }
      );
    }

    const user = userResult[0];
    const isAdmin = user.role === "admin" || user.isAdmin === true;

    if (!isAdmin) {
      logDiagnostic('AUTH_FAILED', `Authentication failed - not admin`, {
        requestId,
        userId: session.user.id,
        userRole: user.role,
        isAdmin: user.isAdmin
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

    // Parse query parameters for filtering and pagination
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider');
    const modelId = searchParams.get('modelId');
    const isActiveParam = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200); // Max 200 records per page
    const offset = (page - 1) * limit;

    logDiagnostic('PRICING_QUERY_START', `Querying model pricing data from database`, {
      requestId,
      filters: { provider, modelId, isActive: isActiveParam },
      pagination: { page, limit, offset }
    });

    // Build filters
    const conditions = [];
    if (provider) {
      conditions.push(eq(modelPricing.provider, provider));
    }
    if (modelId) {
      conditions.push(eq(modelPricing.modelId, modelId));
    }
    if (isActiveParam !== null) {
      conditions.push(eq(modelPricing.isActive, isActiveParam === 'true'));
    }

    // Build the query with optional filters
    const baseQuery = db.select().from(modelPricing);
    const query = conditions.length > 0
      ? baseQuery.where(conditions.length === 1 ? conditions[0] : and(...conditions))
      : baseQuery;

    // Get total count for pagination
    const baseCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(modelPricing);
    const countQuery = conditions.length > 0
      ? baseCountQuery.where(conditions.length === 1 ? conditions[0] : and(...conditions))
      : baseCountQuery;

    const [pricingData, totalResult] = await Promise.all([
      query
        .orderBy(desc(modelPricing.createdAt))
        .limit(limit)
        .offset(offset),
      countQuery
    ]);

    const total = totalResult[0]?.count || 0;

    logDiagnostic('PRICING_QUERY_SUCCESS', `Retrieved pricing data from database`, {
      requestId,
      count: pricingData.length,
      total,
      page,
      limit
    });

    return NextResponse.json({
      success: true,
      message: 'Model pricing data retrieved successfully',
      data: {
        pricing: pricingData,
        count: pricingData.length,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        table: 'model_pricing',
      },
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        },
        filters: {
          provider,
          modelId,
          isActive: isActiveParam
        }
      }
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
