import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { presets, users } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, isNull } from 'drizzle-orm';

// Helper to create error responses
const createErrorResponse = (message: string, status: number) => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

// POST /api/presets/[id]/set-default - Set preset as default
export async function POST(
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

    // If already default, return success
    if (existingPreset[0].isDefault) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Preset is already the default'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Start transaction: unset other defaults and set this one as default
    try {
      // First, unset all other defaults for this user
      await db
        .update(presets)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(and(
          eq(presets.userId, userId),
          eq(presets.isDefault, true),
          isNull(presets.deletedAt)
        ));

      // Set this preset as default
      await db
        .update(presets)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(eq(presets.id, presetId));

      // Update user's default_preset_id (for quick lookup)
      await db
        .update(users)
        .set({
          defaultPresetId: presetId,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      return new Response(JSON.stringify({
        success: true,
        message: 'Preset set as default successfully'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error in default preset transaction:', error);
      return createErrorResponse('Failed to set default preset', 500);
    }
  } catch (error) {
    console.error('Error setting default preset:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/presets/[id]/set-default - Unset as default
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

    // If not default, return success
    if (!existingPreset[0].isDefault) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Preset is not the default'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Unset as default
    await db
      .update(presets)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(presets.id, presetId));

    // Clear user's default_preset_id
    await db
      .update(users)
      .set({
        defaultPresetId: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return new Response(JSON.stringify({
      success: true,
      message: 'Default preset unset successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error unsetting default preset:', error);
    return createErrorResponse('Internal server error', 500);
  }
}