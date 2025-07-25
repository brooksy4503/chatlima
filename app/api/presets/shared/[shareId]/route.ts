import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { presets } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

// Helper to create error responses
const createErrorResponse = (message: string, status: number) => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

// GET /api/presets/shared/[shareId] - Retrieve shared preset by link
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;

    // Validate share ID format
    if (!shareId || shareId.length < 20) {
      return createErrorResponse('Invalid share ID', 400);
    }

    // Get shared preset
    const sharedPreset = await db
      .select()
      .from(presets)
      .where(and(
        eq(presets.shareId, shareId),
        eq(presets.visibility, 'shared'),
        isNull(presets.deletedAt)
      ))
      .limit(1);

    if (sharedPreset.length === 0) {
      return createErrorResponse('Shared preset not found or no longer available', 404);
    }

    const preset = sharedPreset[0];

    // Format response (remove sensitive data)
    const publicPreset = {
      id: preset.id,
      name: preset.name,
      modelId: preset.modelId,
      systemInstruction: preset.systemInstruction,
      temperature: preset.temperature / 1000, // Convert back to float
      maxTokens: preset.maxTokens,
      webSearchEnabled: preset.webSearchEnabled,
      webSearchContextSize: preset.webSearchContextSize,
      shareId: preset.shareId,
      visibility: preset.visibility,
      createdAt: preset.createdAt,
      // Hide sensitive fields
      userId: undefined,
      apiKeyPreferences: {},
      isDefault: false,
      updatedAt: undefined,
      deletedAt: undefined,
      version: undefined
    };

    return new Response(JSON.stringify(publicPreset), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching shared preset:', error);
    return createErrorResponse('Internal server error', 500);
  }
}