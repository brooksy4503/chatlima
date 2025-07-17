import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { presets } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, model, temperature, maxTokens, systemPrompt } = await req.json();

    const [updatedPreset] = await db.update(presets).set({
        name,
        model,
        temperature,
        maxTokens,
        systemPrompt,
    }).where(and(eq(presets.id, params.id), eq(presets.userId, session.user.id))).returning();

    if (!updatedPreset) {
        return NextResponse.json({ error: 'Preset not found' }, { status: 404 });
    }

    return NextResponse.json(updatedPreset);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [deletedPreset] = await db.delete(presets).where(and(eq(presets.id, params.id), eq(presets.userId, session.user.id))).returning();

    if (!deletedPreset) {
        return NextResponse.json({ error: 'Preset not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}