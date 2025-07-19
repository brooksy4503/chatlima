import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { presets } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userPresets = await db.select().from(presets).where(eq(presets.userId, session.user.id));
  return NextResponse.json(userPresets);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

    const { name, model, temperature, maxTokens, systemPrompt } = await req.json();

    const [newPreset] = await db.insert(presets).values({
        userId: session.user.id,
        name,
        model,
        temperature,
        maxTokens,
        systemPrompt,
    }).returning();

    return NextResponse.json(newPreset);
}