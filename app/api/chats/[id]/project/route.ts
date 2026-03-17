import { NextRequest, NextResponse } from 'next/server';
import { and, eq, isNull } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { chatProjects, chats, projects } from '@/lib/db/schema';

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

  const { id: chatId } = await params;

  const linked = await db
    .select({
      projectId: projects.id,
      name: projects.name,
      instructions: projects.instructions,
    })
    .from(chatProjects)
    .innerJoin(projects, eq(chatProjects.projectId, projects.id))
    .innerJoin(chats, eq(chatProjects.chatId, chats.id))
    .where(and(eq(chats.id, chatId), eq(chats.userId, userId), isNull(projects.deletedAt)))
    .limit(1);

  return NextResponse.json({ project: linked[0] ?? null });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id: chatId } = await params;
  const body = await request.json().catch(() => null);
  const projectId = typeof body?.projectId === 'string' ? body.projectId : null;

  if (!projectId) return NextResponse.json({ error: 'projectId is required' }, { status: 400 });

  const chat = await db
    .select({ id: chats.id })
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
    .limit(1);

  if (chat.length === 0) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });

  const project = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId), isNull(projects.deletedAt)))
    .limit(1);

  if (project.length === 0) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const upserted = await db
    .insert(chatProjects)
    .values({ chatId, projectId, attachedAt: new Date() })
    .onConflictDoUpdate({
      target: chatProjects.chatId,
      set: { projectId, attachedAt: new Date() },
    })
    .returning();

  return NextResponse.json({ chatProject: upserted[0] });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id: chatId } = await params;

  const chat = await db
    .select({ id: chats.id })
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
    .limit(1);

  if (chat.length === 0) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });

  await db.delete(chatProjects).where(eq(chatProjects.chatId, chatId));
  return NextResponse.json({ success: true });
}
