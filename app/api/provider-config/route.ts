import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CostCalculationService } from '@/lib/services/costCalculation';
import { nanoid } from 'nanoid';

// Helper function for diagnostic logging
function logDiagnostic(event: string, message: string, data?: any) {
  console.log(`[PROVIDER_CONFIG_DIAGNOSTIC] ${event}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

export async function GET(req: NextRequest) {
  const requestId = nanoid(); // Unique ID for this request
  logDiagnostic('REQUEST_START', `Starting provider config API request (GET)`, {
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
        isAdmin
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

    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider');

    logDiagnostic('PARAMS_PARSED', `Request parameters parsed`, {
      requestId,
      provider: provider || 'all'
    });

    if (provider) {
      // Get specific provider configuration
      logDiagnostic('GET_PROVIDER_CONFIG_START', `Getting specific provider configuration`, {
        requestId,
        provider
      });

      const config = CostCalculationService.getProviderConfig(provider);

      if (!config) {
        logDiagnostic('CONFIG_NOT_FOUND', `Provider configuration not found`, {
          requestId,
          provider
        });
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: `Provider configuration not found for: ${provider}` } },
          { status: 404 }
        );
      }

      logDiagnostic('CONFIG_RETRIEVED', `Provider configuration retrieved successfully`, {
        requestId,
        provider,
        configKeys: Object.keys(config)
      });

      return NextResponse.json({
        success: true,
        data: config,
        meta: {
          provider,
        },
      });
    } else {
      // Get all provider configurations
      logDiagnostic('GET_ALL_CONFIGS_START', `Getting all provider configurations`, { requestId });

      const configs = CostCalculationService.getAllProviderConfigs();

      logDiagnostic('ALL_CONFIGS_RETRIEVED', `All provider configurations retrieved successfully`, {
        requestId,
        count: configs.length,
        providers: configs.map(c => c.provider)
      });

      return NextResponse.json({
        success: true,
        data: configs,
        meta: {
          count: configs.length,
        },
      });
    }
  } catch (error) {
    logDiagnostic('ERROR', `Error in provider config API (GET)`, {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error('[Provider Config API] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve provider configuration' } },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const requestId = nanoid(); // Unique ID for this request
  logDiagnostic('REQUEST_START', `Starting provider config API request (PUT)`, {
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
        isAdmin
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

    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider');

    if (!provider) {
      logDiagnostic('VALIDATION_FAILED', `Provider parameter is required but missing`, { requestId });
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMETER', message: 'provider parameter is required' } },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { currency, volumeDiscountTiers, specialModels } = body;

    logDiagnostic('REQUEST_PARSED', `Request body parsed`, {
      requestId,
      provider,
      bodyKeys: Object.keys(body),
      hasCurrency: !!currency,
      hasVolumeDiscountTiers: !!volumeDiscountTiers,
      hasSpecialModels: !!specialModels
    });

    // Validate currency if provided
    if (currency && typeof currency !== 'string') {
      logDiagnostic('VALIDATION_FAILED', `Currency validation failed`, {
        requestId,
        currency,
        type: typeof currency
      });
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMETER', message: 'currency must be a string' } },
        { status: 400 }
      );
    }

    // Validate volume discount tiers if provided
    if (volumeDiscountTiers) {
      if (!Array.isArray(volumeDiscountTiers)) {
        logDiagnostic('VALIDATION_FAILED', `Volume discount tiers must be an array`, {
          requestId,
          volumeDiscountTiers,
          type: typeof volumeDiscountTiers
        });
        return NextResponse.json(
          { error: { code: 'INVALID_PARAMETER', message: 'volumeDiscountTiers must be an array' } },
          { status: 400 }
        );
      }

      for (const tier of volumeDiscountTiers) {
        if (typeof tier.minTokens !== 'number' || tier.minTokens < 0) {
          logDiagnostic('VALIDATION_FAILED', `Invalid minTokens in volume discount tier`, {
            requestId,
            tier
          });
          return NextResponse.json(
            { error: { code: 'INVALID_PARAMETER', message: 'Each volume discount tier must have a non-negative minTokens number' } },
            { status: 400 }
          );
        }

        if (tier.maxTokens !== undefined && (typeof tier.maxTokens !== 'number' || tier.maxTokens < 0)) {
          logDiagnostic('VALIDATION_FAILED', `Invalid maxTokens in volume discount tier`, {
            requestId,
            tier
          });
          return NextResponse.json(
            { error: { code: 'INVALID_PARAMETER', message: 'Each volume discount tier maxTokens must be a non-negative number if provided' } },
            { status: 400 }
          );
        }

        if (typeof tier.discountPercentage !== 'number' || tier.discountPercentage < 0 || tier.discountPercentage > 100) {
          logDiagnostic('VALIDATION_FAILED', `Invalid discountPercentage in volume discount tier`, {
            requestId,
            tier
          });
          return NextResponse.json(
            { error: { code: 'INVALID_PARAMETER', message: 'Each volume discount tier must have a discountPercentage between 0 and 100' } },
            { status: 400 }
          );
        }
      }
    }

    logDiagnostic('VALIDATION_SUCCESS', `Parameter validation successful`, { requestId });

    // Update provider configuration
    logDiagnostic('CONFIG_UPDATE_START', `Starting provider configuration update`, {
      requestId,
      provider,
      updateFields: {
        hasCurrency: !!currency,
        hasVolumeDiscountTiers: !!volumeDiscountTiers,
        hasSpecialModels: !!specialModels
      }
    });

    CostCalculationService.updateProviderConfig(provider, {
      currency,
      volumeDiscountTiers,
      specialModels,
    });

    // Get the updated configuration
    const updatedConfig = CostCalculationService.getProviderConfig(provider);

    logDiagnostic('CONFIG_UPDATE_SUCCESS', `Provider configuration updated successfully`, {
      requestId,
      provider,
      configKeys: updatedConfig ? Object.keys(updatedConfig) : []
    });

    return NextResponse.json({
      success: true,
      message: `Provider configuration updated for ${provider}`,
      data: updatedConfig,
      meta: {
        provider,
      },
    });
  } catch (error) {
    logDiagnostic('ERROR', `Error in provider config API (PUT)`, {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error('[Provider Config API] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update provider configuration' } },
      { status: 500 }
    );
  }
}
