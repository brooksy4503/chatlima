import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { presets, users, presetUsage } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { validatePresetParameters, validateModelAccess } from '@/lib/parameter-validation';
import { getModelDetails } from '@/lib/models/fetch-models';
import { nanoid } from 'nanoid';

// Helper to create error responses
const createErrorResponse = (message: string, status: number) => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

// Helper to check if user has access to premium models
async function userCanAccessPremium(userId: string, isAnonymous: boolean): Promise<boolean> {
  // Anonymous users cannot access premium models
  if (isAnonymous) return false;
  // Authenticated users: existing behavior (could wire to credits here if desired)
  return true;
}

// GET /api/presets - List user's presets
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return createErrorResponse('Authentication required', 401);
    }

    const userId = session.user.id;
    const isAnonymous = (session.user as any)?.isAnonymous === true;

    // Get user's presets (excluding soft deleted)
    const userPresets = await db
      .select()
      .from(presets)
      .where(and(
        eq(presets.userId, userId),
        isNull(presets.deletedAt)
      ))
      .orderBy(desc(presets.createdAt));

    // Convert temperature back from integer to float
    const formattedPresets = userPresets.map(preset => ({
      ...preset,
      temperature: preset.temperature / 1000
    }));

    return new Response(JSON.stringify(formattedPresets), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching presets:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/presets - Create new preset
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return createErrorResponse('Authentication required', 401);
    }

    const userId = session.user.id;
    const isAnonymous = (session.user as any)?.isAnonymous === true;
    const data = await req.json();

    const {
      name,
      modelId,
      systemInstruction,
      temperature,
      maxTokens,
      webSearchEnabled = false,
      webSearchContextSize = 'medium',
      apiKeyPreferences = {},
      isDefault = false
    } = data;

    // Validate required fields
    if (!name || !modelId || !systemInstruction) {
      return createErrorResponse('Missing required fields: name, modelId, systemInstruction', 400);
    }

    if (temperature === undefined || maxTokens === undefined) {
      return createErrorResponse('Missing required fields: temperature, maxTokens', 400);
    }

    // Get model info first for validation
    const modelInfo = await getModelDetails(modelId);

    // Validate preset parameters
    const validation = validatePresetParameters(modelInfo, temperature, maxTokens, systemInstruction);
    if (!validation.valid) {
      return createErrorResponse(`Invalid parameters: ${validation.errors.join(', ')}`, 400);
    }

    // Validate model access
    const canAccessPremium = await userCanAccessPremium(userId, isAnonymous);

    // Additional anonymous enforcement: only allow openrouter :free models
    if (isAnonymous && !(modelId.startsWith('openrouter/') && modelId.endsWith(':free'))) {
      return createErrorResponse('Anonymous users can only use free models', 403);
    }
    const modelAccessValidation = validateModelAccess(modelInfo, canAccessPremium);
    if (!modelAccessValidation.valid) {
      return createErrorResponse(`Model access denied: ${modelAccessValidation.errors.join(', ')}`, 403);
    }

    // Check for name conflicts
    const existingPreset = await db
      .select()
      .from(presets)
      .where(and(
        eq(presets.userId, userId),
        eq(presets.name, name),
        isNull(presets.deletedAt)
      ))
      .limit(1);

    if (existingPreset.length > 0) {
      return createErrorResponse('A preset with this name already exists', 409);
    }

    // Handle default preset logic - now without database constraints
    // If setting as default, unset other defaults first
    if (isDefault) {
      await db
        .update(presets)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(and(
          eq(presets.userId, userId),
          eq(presets.isDefault, true),
          isNull(presets.deletedAt)
        ));
    }

    try {
      // Create new preset
      const newPreset = await db
        .insert(presets)
        .values({
          id: nanoid(),
          userId,
          name,
          modelId,
          systemInstruction,
          temperature: Math.round(temperature * 1000), // Convert to integer
          maxTokens,
          webSearchEnabled,
          webSearchContextSize,
          apiKeyPreferences,
          isDefault,
          visibility: 'private'
        })
        .returning();

      // Format response
      const formattedPreset = {
        ...newPreset[0],
        temperature: newPreset[0].temperature / 1000
      };

      return new Response(JSON.stringify(formattedPreset), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error: any) {
      // Handle constraint violations
      if (error?.code === '23505') { // Unique constraint violation
        if (error?.constraint === 'unique_name_per_user') {
          return createErrorResponse('A preset with this name already exists', 409);
        }
      }
      throw error; // Re-throw if not a handled constraint violation
    }
  } catch (error) {
    console.error('Error creating preset:', error);
    return createErrorResponse('Internal server error', 500);
  }
}