import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { presets } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, isNull } from 'drizzle-orm';
import { validatePresetParameters, validateModelAccess } from '@/lib/parameter-validation';
import { getModelDetails } from '@/lib/models/fetch-models';

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

// GET /api/presets/[id] - Get preset details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: presetId } = await params;

    // Get preset (accessible by owner or if shared)
    const preset = await db
      .select()
      .from(presets)
      .where(and(
        eq(presets.id, presetId),
        isNull(presets.deletedAt)
      ))
      .limit(1);

    if (preset.length === 0) {
      return createErrorResponse('Preset not found', 404);
    }

    const presetData = preset[0];

    // Check access permissions
    const session = await auth.api.getSession({ headers: req.headers });
    const isOwner = session?.user?.id === presetData.userId;
    const isShared = presetData.visibility === 'shared';

    if (!isOwner && !isShared) {
      return createErrorResponse('Access denied', 403);
    }

    // Format response (convert temperature back to float)
    const formattedPreset = {
      ...presetData,
      temperature: presetData.temperature / 1000,
      // Hide sensitive fields for non-owners
      ...(isOwner ? {} : {
        apiKeyPreferences: {},
        userId: undefined
      })
    };

    return new Response(JSON.stringify(formattedPreset), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching preset:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/presets/[id] - Update preset
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return createErrorResponse('Authentication required', 401);
    }

    const userId = session.user.id;
    const { id: presetId } = await params;
    const data = await req.json();

    // Check if preset exists and user owns it
    const existingPreset = await db
      .select()
      .from(presets)
      .where(and(
        eq(presets.id, presetId),
        eq(presets.userId, userId),
        isNull(presets.deletedAt)
      ))
      .limit(1);

    if (existingPreset.length === 0) {
      return createErrorResponse('Preset not found or access denied', 404);
    }

    const {
      name,
      modelId,
      systemInstruction,
      temperature,
      maxTokens,
      webSearchEnabled,
      webSearchContextSize,
      apiKeyPreferences,
      isDefault
    } = data;

    // Validate parameters if provided
    if (modelId && (temperature !== undefined || maxTokens !== undefined || systemInstruction)) {
      const validation = validatePresetParameters(modelId, temperature, maxTokens, systemInstruction);
      if (!validation.valid) {
        return createErrorResponse(`Invalid parameters: ${validation.errors.join(', ')}`, 400);
      }

      // Validate model access
      const canAccessPremium = await userCanAccessPremium(userId);
      const modelInfo = await getModelDetails(modelId);
      const modelAccessValidation = validateModelAccess(modelInfo, canAccessPremium);
      if (!modelAccessValidation.valid) {
        return createErrorResponse(`Model access denied: ${modelAccessValidation.errors.join(', ')}`, 403);
      }
    }

    // Check for name conflicts (if name is being changed)
    if (name && name !== existingPreset[0].name) {
      const nameConflict = await db
        .select()
        .from(presets)
        .where(and(
          eq(presets.userId, userId),
          eq(presets.name, name),
          isNull(presets.deletedAt)
        ))
        .limit(1);

      if (nameConflict.length > 0) {
        return createErrorResponse('A preset with this name already exists', 409);
      }
    }

    // If setting as default, unset other defaults
    if (isDefault && !existingPreset[0].isDefault) {
      await db
        .update(presets)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(and(
          eq(presets.userId, userId),
          eq(presets.isDefault, true),
          isNull(presets.deletedAt)
        ));
    }

    // Build update object (only include provided fields)
    const updateData: any = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (modelId !== undefined) updateData.modelId = modelId;
    if (systemInstruction !== undefined) updateData.systemInstruction = systemInstruction;
    if (temperature !== undefined) updateData.temperature = Math.round(temperature * 1000);
    if (maxTokens !== undefined) updateData.maxTokens = maxTokens;
    if (webSearchEnabled !== undefined) updateData.webSearchEnabled = webSearchEnabled;
    if (webSearchContextSize !== undefined) updateData.webSearchContextSize = webSearchContextSize;
    if (apiKeyPreferences !== undefined) updateData.apiKeyPreferences = apiKeyPreferences;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    // Update preset
    const updatedPreset = await db
      .update(presets)
      .set(updateData)
      .where(eq(presets.id, presetId))
      .returning();

    // Format response
    const formattedPreset = {
      ...updatedPreset[0],
      temperature: updatedPreset[0].temperature / 1000
    };

    return new Response(JSON.stringify(formattedPreset), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating preset:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/presets/[id] - Delete preset (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return createErrorResponse('Authentication required', 401);
    }

    const userId = session.user.id;
    const { id: presetId } = await params;

    // Check if preset exists and user owns it
    const existingPreset = await db
      .select()
      .from(presets)
      .where(and(
        eq(presets.id, presetId),
        eq(presets.userId, userId),
        isNull(presets.deletedAt)
      ))
      .limit(1);

    if (existingPreset.length === 0) {
      return createErrorResponse('Preset not found or access denied', 404);
    }

    // Soft delete preset
    await db
      .update(presets)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
        isDefault: false // Unset default if this was the default preset
      })
      .where(eq(presets.id, presetId));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting preset:', error);
    return createErrorResponse('Internal server error', 500);
  }
}