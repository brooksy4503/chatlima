import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { ConversationPersistenceService } from '@/lib/services/conversationPersistence';

interface Params {
  params: Promise<{ id: string }>;
}

async function getRequestUserId(request: NextRequest | Request): Promise<string | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id || null;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: sourceChatId } = await params;
    const body = await request.json();
    const forkThroughMessageId =
      typeof body?.forkThroughMessageId === 'string' ? body.forkThroughMessageId : null;

    if (!forkThroughMessageId) {
      return NextResponse.json({ error: 'forkThroughMessageId is required' }, { status: 400 });
    }

    const result = await ConversationPersistenceService.forkChat({
      sourceChatId,
      userId,
      forkThroughMessageId,
    });

    if (!result) {
      return NextResponse.json({ error: 'Unable to fork chat' }, { status: 400 });
    }

    return NextResponse.json({ newChatId: result.newChatId });
  } catch (error) {
    console.error('Error forking chat:', error);
    return NextResponse.json({ error: 'Failed to fork chat' }, { status: 500 });
  }
}
