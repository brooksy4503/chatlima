import { NextRequest, NextResponse } from 'next/server';
import { and, count, eq, isNull } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { chatProjects, projectFiles, projects } from '@/lib/db/schema';

interface Params {
  params: Promise<{ id: string }>;
}

async function getUserId(request: NextRequest): Promise<string | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id || null;
}

export async function GET(request: NextRequest, { params }: Params) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id } = await params;

  const project = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId), isNull(projects.deletedAt)))
    .limit(1);

  if (project.length === 0) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const files = await db.select().from(projectFiles).where(eq(projectFiles.projectId, id));
  const linkedChats = await db
    .select({ value: count() })
    .from(chatProjects)
    .where(eq(chatProjects.projectId, id));

  return NextResponse.json({
    project: project[0],
    files,
    linkedChatsCount: Number(linkedChats[0]?.value || 0),
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const updatePayload: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body?.name === 'string') {
    const name = body.name.trim();
    if (!name || name.length > 100) {
      return NextResponse.json({ error: 'Project name must be 1-100 characters.' }, { status: 400 });
    }
    updatePayload.name = name;
  }

  if (typeof body?.instructions === 'string') {
    const instructions = body.instructions.trim();
    if (instructions.length > 8000) {
      return NextResponse.json({ error: 'Project instructions must be <= 8000 characters.' }, { status: 400 });
    }
    updatePayload.instructions = instructions;
  }

  const updated = await db
    .update(projects)
    .set(updatePayload)
    .where(and(eq(projects.id, id), eq(projects.userId, userId), isNull(projects.deletedAt)))
    .returning();

  if (updated.length === 0) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  return NextResponse.json({ project: updated[0] });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id } = await params;

  const deleted = await db
    .update(projects)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.userId, userId), isNull(projects.deletedAt)))
    .returning({ id: projects.id });

  if (deleted.length === 0) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
