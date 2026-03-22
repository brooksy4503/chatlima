import { NextRequest, NextResponse } from 'next/server';
import { and, eq, isNull } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projectFiles, projects } from '@/lib/db/schema';

interface Params {
  params: Promise<{ id: string; fileId: string }>;
}

async function getUserId(request: NextRequest): Promise<string | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id || null;
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id, fileId } = await params;

  const ownerCheck = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId), isNull(projects.deletedAt)))
    .limit(1);

  if (ownerCheck.length === 0) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const deleted = await db
    .delete(projectFiles)
    .where(and(eq(projectFiles.id, fileId), eq(projectFiles.projectId, id)))
    .returning({ id: projectFiles.id });

  if (deleted.length === 0) return NextResponse.json({ error: 'File not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
