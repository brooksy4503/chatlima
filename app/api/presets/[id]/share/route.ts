import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { presets } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, isNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Helper to create error responses
const createErrorResponse = (message: string, status: number) => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

// Helper to generate secure share ID
function generateShareId(): string {
  return nanoid(32); // Generate a 32-character random string
}

// POST /api/presets/[id]/share - Generate or retrieve shareable link
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return createErrorResponse('Authentication required', 401);
    }

    const userId = session.user.id;
    const presetId = params.id;

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

    const preset = existingPreset[0];

    // If already has a share ID, return it
    if (preset.shareId) {
      return new Response(JSON.stringify({
        shareId: preset.shareId,
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com'}/presets/shared/${preset.shareId}`
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate new share ID and update preset
    const shareId = generateShareId();
    await db
      .update(presets)
      .set({ 
        shareId,
        visibility: 'shared',
        updatedAt: new Date()
      })
      .where(eq(presets.id, presetId));

    return new Response(JSON.stringify({
      shareId,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com'}/presets/shared/${shareId}`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error sharing preset:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/presets/[id]/share - Remove share link (make private)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return createErrorResponse('Authentication required', 401);
    }

    const userId = session.user.id;
    const presetId = params.id;

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

    // Remove share ID and make private
    await db
      .update(presets)
      .set({ 
        shareId: null,
        visibility: 'private',
        updatedAt: new Date()
      })
      .where(eq(presets.id, presetId));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error unsharing preset:', error);
    return createErrorResponse('Internal server error', 500);
  }
}