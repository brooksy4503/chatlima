import { NextRequest } from 'next/server';
import { validatePresetParameters, validateModelAccess, getModelParameterConstraints } from '@/lib/parameter-validation';
import { getModelDetails } from '@/lib/models/fetch-models';
import { auth } from '@/lib/auth';

// Helper to create error responses
const createErrorResponse = (message: string, status: number) => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

// Helper to check if user has access to premium models
async function userCanAccessPremium(userId: string): Promise<boolean> {
  return true; // For now, assume all authenticated users can access premium models
}

// POST /api/presets/validate - Validate preset parameters for model
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return createErrorResponse('Authentication required', 401);
    }

    const userId = session.user.id;
    const data = await req.json();

    const {
      modelId,
      temperature,
      maxTokens,
      systemInstruction
    } = data;

    // Validate required field
    if (!modelId) {
      return createErrorResponse('Missing required field: modelId', 400);
    }

    // Get model info first for validation
    const modelInfo = await getModelDetails(modelId);

    // Get model constraints
    const constraints = getModelParameterConstraints(modelInfo);

    // Validate model access
    const canAccessPremium = await userCanAccessPremium(userId);
    const modelAccessValidation = validateModelAccess(modelInfo, canAccessPremium);
    if (!modelAccessValidation.valid) {
      return new Response(JSON.stringify({
        valid: false,
        errors: modelAccessValidation.errors,
        constraints
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate parameters
    const validation = validatePresetParameters(modelInfo, temperature, maxTokens, systemInstruction);

    return new Response(JSON.stringify({
      valid: validation.valid,
      errors: validation.errors,
      constraints
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error validating preset parameters:', error);
    return createErrorResponse('Internal server error', 500);
  }
}