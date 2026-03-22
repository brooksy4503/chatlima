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

export async function POST(request: NextRequest, { params }: Params) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id: projectId } = await params;

  const project = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId), isNull(projects.deletedAt)))
    .limit(1);

  if (project.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const requestedTitle = typeof body?.title === 'string' ? body.title.trim() : '';
  const title = requestedTitle.length > 0 ? requestedTitle.slice(0, 100) : 'New Chat';

  const createdAt = new Date();

  try {
    const created = await db.transaction(async (tx) => {
      const [chat] = await tx
        .insert(chats)
        .values({
          userId,
          title,
          createdAt,
          updatedAt: createdAt,
        })
        .returning();

      await tx
        .insert(chatProjects)
        .values({
          chatId: chat.id,
          projectId,
          attachedAt: createdAt,
        });

      return chat;
    });

    return NextResponse.json({ chat: created }, { status: 201 });
  } catch (error) {
    console.error('Failed to create project chat', error);
    return NextResponse.json({ error: 'Failed to create chat in project' }, { status: 500 });
  }
}
