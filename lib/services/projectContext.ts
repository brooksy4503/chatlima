import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { chatProjects, projectFiles, projects } from '@/lib/db/schema';

const MAX_PROJECT_FILES_IN_CONTEXT = 20;
const MAX_PROJECT_INSTRUCTIONS_LENGTH = 8000;

export interface ProjectContext {
  projectId: string;
  projectName: string;
  instructions: string;
  files: Array<{
    filepath: string | null;
    url: string | null;
    filename: string;
  }>;
}

export async function buildProjectContext(params: {
  chatId: string;
  userId: string;
}): Promise<ProjectContext | null> {
  const { chatId, userId } = params;

  const linked = await db
    .select({
      projectId: projects.id,
      name: projects.name,
      instructions: projects.instructions,
    })
    .from(chatProjects)
    .innerJoin(projects, eq(chatProjects.projectId, projects.id))
    .where(and(eq(chatProjects.chatId, chatId), eq(projects.userId, userId)))
    .limit(1);

  if (linked.length === 0) return null;

  const project = linked[0];

  const files = await db
    .select({
      filepath: projectFiles.filepath,
      url: projectFiles.url,
      filename: projectFiles.filename,
    })
    .from(projectFiles)
    .where(eq(projectFiles.projectId, project.projectId))
    .limit(MAX_PROJECT_FILES_IN_CONTEXT);

  return {
    projectId: project.projectId,
    projectName: project.name,
    instructions: (project.instructions || '').slice(0, MAX_PROJECT_INSTRUCTIONS_LENGTH),
    files,
  };
}

export function formatProjectContextForSystemPrompt(context: ProjectContext): string {
  const fileLines = context.files.length
    ? context.files
        .map((f) => `- ${f.filename} | filepath: ${f.filepath ?? 'n/a'} | url: ${f.url ?? 'n/a'}`)
        .join('\n')
    : '- No project files attached';

  return [
    '## Active Project Context',
    `Project: ${context.projectName}`,
    '',
    '### Project Instructions',
    context.instructions || 'No project instructions provided.',
    '',
    '### Project Files',
    fileLines,
    '',
    'When relevant, prioritize project instructions and use read_file with filepath/url before answering file-specific questions.',
  ].join('\n');
}
