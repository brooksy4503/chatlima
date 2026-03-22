import { NextRequest, NextResponse } from 'next/server';
import { and, eq, isNull } from 'drizzle-orm';
import { put } from '@vercel/blob';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projectFiles, projects } from '@/lib/db/schema';
import { validateFile, validateFileType, ALL_SUPPORTED_TYPES, generateUniqueFilename } from '@/lib/file-upload';

interface Params {
  params: Promise<{ id: string }>;
}

async function getUserId(request: NextRequest): Promise<string | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id || null;
}

async function assertProjectOwnership(projectId: string, userId: string) {
  const found = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId), isNull(projects.deletedAt)))
    .limit(1);

  return found.length > 0;
}

export async function GET(request: NextRequest, { params }: Params) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id } = await params;
  const allowed = await assertProjectOwnership(id, userId);
  if (!allowed) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const files = await db.select().from(projectFiles).where(eq(projectFiles.projectId, id));
  return NextResponse.json({ files });
}

export async function POST(request: NextRequest, { params }: Params) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id } = await params;
  const allowed = await assertProjectOwnership(id, userId);
  if (!allowed) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const files = formData.getAll('files').filter((f): f is File => f instanceof File);

    if (files.length === 0) return NextResponse.json({ error: 'No files provided' }, { status: 400 });

    const insertedRows = [] as any[];
    const errors: string[] = [];

    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      const typeValidation = validateFileType(file, ALL_SUPPORTED_TYPES);
      if (!typeValidation.valid) {
        errors.push(`${file.name}: ${typeValidation.error}`);
        continue;
      }

      const uniqueFilename = generateUniqueFilename(file.name);
      const filepath = `uploads/projects/${id}/${uniqueFilename}`;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const blob = await put(filepath, Buffer.from(arrayBuffer), {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
          contentType: file.type || undefined,
        });

        const inserted = await db
          .insert(projectFiles)
          .values({
            projectId: id,
            filepath,
            url: blob.url,
            filename: file.name,
            mimeType: file.type,
            size: file.size,
          })
          .returning();

        insertedRows.push(inserted[0]);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        errors.push(`${file.name}: ${message}`);
      }
    }

    return NextResponse.json({ files: insertedRows, errors });
  }

  const body = await request.json().catch(() => null);
  const files = Array.isArray(body?.files) ? body.files : [];

  if (files.length === 0) {
    return NextResponse.json({ error: 'files[] is required' }, { status: 400 });
  }

  const values = files
    .map((file: any) => ({
      projectId: id,
      filepath: typeof file.filepath === 'string' ? file.filepath : null,
      url: typeof file.url === 'string' ? file.url : null,
      filename: typeof file.filename === 'string' ? file.filename : null,
      mimeType: typeof file.mimeType === 'string' ? file.mimeType : null,
      size: typeof file.size === 'number' ? file.size : null,
    }))
    .filter((f: any) => !!f.filename);

  if (values.length === 0) {
    return NextResponse.json({ error: 'Each file must include filename' }, { status: 400 });
  }

  const inserted = await db.insert(projectFiles).values(values).returning();
  return NextResponse.json({ files: inserted }, { status: 201 });
}
