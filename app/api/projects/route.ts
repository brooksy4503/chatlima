import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';

async function getUserId(request: NextRequest): Promise<string | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id || null;
}

export async function GET(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)))
    .orderBy(desc(projects.updatedAt));

  return NextResponse.json({ projects: rows });
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const instructions = typeof body?.instructions === 'string' ? body.instructions.trim() : '';

  if (!name || name.length > 100) {
    return NextResponse.json({ error: 'Project name must be 1-100 characters.' }, { status: 400 });
  }

  if (instructions.length > 8000) {
    return NextResponse.json({ error: 'Project instructions must be <= 8000 characters.' }, { status: 400 });
  }

  const created = await db
    .insert(projects)
    .values({
      userId,
      name,
      instructions,
      updatedAt: new Date(),
    })
    .returning();

  return NextResponse.json({ project: created[0] }, { status: 201 });
}
