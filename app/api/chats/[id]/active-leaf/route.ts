import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { ConversationPersistenceService } from '@/lib/services/conversationPersistence';
import { convertToUIMessages } from '@/lib/chat-store';
import { buildActivePathMessages } from '@/lib/chat/conversationTree';

interface Params {
  params: Promise<{ id: string }>;
}

async function getRequestUserId(request: NextRequest | Request): Promise<string | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id || null;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: chatId } = await params;
    const body = await request.json();
    const leafMessageId = typeof body?.leafMessageId === 'string' ? body.leafMessageId : null;

    if (!leafMessageId) {
      return NextResponse.json({ error: 'leafMessageId is required' }, { status: 400 });
    }

    const ok = await ConversationPersistenceService.setActiveLeaf({
      chatId,
      userId,
      leafMessageId,
    });

    if (!ok) {
      return NextResponse.json({ error: 'Invalid branch selection' }, { status: 400 });
    }

    const graph = await ConversationPersistenceService.loadChatGraph(chatId, userId);
    if (!graph) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({
      activeLeafMessageId: leafMessageId,
      activePathMessages: graph.activePathMessages,
    });
  } catch (error) {
    console.error('Error selecting active leaf:', error);
    return NextResponse.json({ error: 'Failed to select branch' }, { status: 500 });
  }
}
