import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ConversationPersistenceService } from '@/lib/services/conversationPersistence';

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const chatId = typeof body?.chatId === 'string' ? body.chatId : '';
    const comparisonTurnId =
      typeof body?.comparisonTurnId === 'string' ? body.comparisonTurnId : '';
    const modelId = typeof body?.modelId === 'string' ? body.modelId : '';

    if (!chatId || !comparisonTurnId || !modelId) {
      return NextResponse.json(
        { error: 'chatId, comparisonTurnId, and modelId are required' },
        { status: 400 }
      );
    }

    const result = await ConversationPersistenceService.promoteCompareTurn({
      chatId,
      userId,
      comparisonTurnId,
      modelId,
    });

    if (!result) {
      return NextResponse.json({ error: 'Compare turn not found' }, { status: 404 });
    }

    return NextResponse.json({
      activeLeafMessageId: result.assistantMessageId,
    });
  } catch (error) {
    console.error('[Compare Promote API] Unhandled error:', error);
    return NextResponse.json({ error: 'Failed to promote compare model' }, { status: 500 });
  }
}
