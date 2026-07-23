import { db } from '@/lib/db';
import { chats, messages, chatProjects, type DBMessage, type Message } from '@/lib/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import {
  buildActivePathMessages,
  buildMessageGraph,
  buildPathToLeaf,
  inferParentChainFromLinearOrder,
  remapForkPath,
  resolveDefaultLeafId,
  resolvePersistedActiveLeafId,
  type TreeMessageNode,
} from '@/lib/chat/conversationTree';
import {
  convertToDBMessages,
  convertToUIMessages,
} from '@/lib/chat/messageConversion';
import type { CompareUIMessage } from '@/lib/chat/compareHistory';

export type ConversationPersistResult = {
  activeLeafMessageId: string | null;
};

export class ConversationPersistenceService {
  static async upsertMessages(
    dbMessages: DBMessage[],
    activeLeafMessageId?: string | null
  ): Promise<ConversationPersistResult> {
    if (dbMessages.length === 0) {
      return { activeLeafMessageId: activeLeafMessageId ?? null };
    }

    const chatId = dbMessages[0].chatId;
    const leafId = resolvePersistedActiveLeafId(dbMessages, activeLeafMessageId);

    await db.transaction(async (tx) => {
      for (const message of dbMessages) {
        await tx
          .insert(messages)
          .values({
            id: message.id,
            chatId: message.chatId,
            role: message.role,
            parts: message.parts,
            hasWebSearch: message.hasWebSearch ?? false,
            webSearchContextSize: message.webSearchContextSize ?? 'medium',
            modelId: message.modelId ?? null,
            modelProvider: message.modelProvider ?? null,
            modelDisplayName: message.modelDisplayName ?? null,
            comparisonTurnId: message.comparisonTurnId ?? null,
            parentMessageId: message.parentMessageId ?? null,
            createdAt: message.createdAt,
          })
          .onConflictDoUpdate({
            target: messages.id,
            set: {
              role: message.role,
              parts: message.parts,
              hasWebSearch: message.hasWebSearch ?? false,
              webSearchContextSize: message.webSearchContextSize ?? 'medium',
              modelId: message.modelId ?? null,
              modelProvider: message.modelProvider ?? null,
              modelDisplayName: message.modelDisplayName ?? null,
              comparisonTurnId: message.comparisonTurnId ?? null,
              parentMessageId: message.parentMessageId ?? null,
              createdAt: message.createdAt,
            },
          });
      }

      if (leafId) {
        await tx
          .update(chats)
          .set({ activeLeafMessageId: leafId, updatedAt: new Date() })
          .where(eq(chats.id, chatId));
      }
    });

    return { activeLeafMessageId: leafId };
  }

  static async setActiveLeaf(params: {
    chatId: string;
    userId: string;
    leafMessageId: string;
  }): Promise<boolean> {
    const { chatId, userId, leafMessageId } = params;

    const chat = await db.query.chats.findFirst({
      where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
    });
    if (!chat) return false;

    const leafMessage = await db.query.messages.findFirst({
      where: and(eq(messages.id, leafMessageId), eq(messages.chatId, chatId)),
    });
    if (!leafMessage) return false;

    await db
      .update(chats)
      .set({ activeLeafMessageId: leafMessageId, updatedAt: new Date() })
      .where(eq(chats.id, chatId));

    return true;
  }

  static async ensureParentChainBackfilled(chatId: string): Promise<void> {
    const chatMessages = await db.query.messages.findMany({
      where: eq(messages.chatId, chatId),
      orderBy: [messages.createdAt],
    });

    const needsBackfill =
      chatMessages.length > 1 &&
      chatMessages.some((message, index) => index > 0 && !message.parentMessageId);

    if (needsBackfill) {
      await this.backfillParentChainForChat(chatId);
    }
  }

  static async loadChatGraph(chatId: string, userId: string): Promise<{
    chat: typeof chats.$inferSelect;
    dbMessages: Message[];
    allMessages: CompareUIMessage[];
    activeLeafMessageId: string | null;
    activePathMessages: CompareUIMessage[];
  } | null> {
    const chat = await db.query.chats.findFirst({
      where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
    });
    if (!chat) return null;

    await this.ensureParentChainBackfilled(chatId);

    const refreshedChat = await db.query.chats.findFirst({
      where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
    });
    if (!refreshedChat) return null;

    const chatMessages = await db.query.messages.findMany({
      where: eq(messages.chatId, chatId),
      orderBy: [messages.createdAt],
    });

    const allMessages = convertToUIMessages(chatMessages);
    const activeLeafMessageId =
      refreshedChat.activeLeafMessageId ?? resolveDefaultLeafId(chatMessages);
    const activePathMessages = buildActivePathMessages(allMessages, activeLeafMessageId);

    return {
      chat: refreshedChat,
      dbMessages: chatMessages,
      allMessages,
      activeLeafMessageId,
      activePathMessages,
    };
  }

  static async forkChat(params: {
    sourceChatId: string;
    userId: string;
    forkThroughMessageId: string;
  }): Promise<{ newChatId: string } | null> {
    const graphData = await this.loadChatGraph(params.sourceChatId, params.userId);
    if (!graphData) return null;

    const { allMessages, activeLeafMessageId } = graphData;
    const graph = buildMessageGraph(allMessages);
    const leafForFork = activeLeafMessageId ?? resolveDefaultLeafId(allMessages);
    if (!leafForFork) return null;

    const activePath = buildPathToLeaf(leafForFork, graph);
    const forkIndex = activePath.findIndex((msg) => msg.id === params.forkThroughMessageId);
    if (forkIndex < 0) return null;

    const pathToCopy = activePath.slice(0, forkIndex + 1);
    const newChatId = nanoid();

    const remapped = remapForkPath(
      pathToCopy.map((msg) => ({
        ...msg,
        chatId: params.sourceChatId,
        parts: (msg as CompareUIMessage & { parts?: unknown }).parts,
      })),
      newChatId,
      nanoid
    );

    const dbMessages = convertToDBMessages(
      remapped.messages as CompareUIMessage[],
      newChatId
    ).map((msg, index) => ({
      ...msg,
      parentMessageId: remapped.messages[index]?.parentMessageId ?? null,
    }));

    const sourceProject = await db.query.chatProjects.findFirst({
      where: eq(chatProjects.chatId, params.sourceChatId),
    });

    await db.transaction(async (tx) => {
      await tx.insert(chats).values({
        id: newChatId,
        userId: params.userId,
        title: `${graphData.chat.title} (fork)`,
        activeLeafMessageId: remapped.newActiveLeafId,
      });

      if (dbMessages.length > 0) {
        await tx.insert(messages).values(
          dbMessages.map((message) => ({
            id: message.id,
            chatId: message.chatId,
            role: message.role,
            parts: message.parts,
            hasWebSearch: message.hasWebSearch ?? false,
            webSearchContextSize: message.webSearchContextSize ?? 'medium',
            modelId: message.modelId ?? null,
            modelProvider: message.modelProvider ?? null,
            modelDisplayName: message.modelDisplayName ?? null,
            comparisonTurnId: message.comparisonTurnId ?? null,
            parentMessageId: message.parentMessageId ?? null,
            createdAt: message.createdAt,
          }))
        );
      }

      if (sourceProject) {
        await tx.insert(chatProjects).values({
          chatId: newChatId,
          projectId: sourceProject.projectId,
        });
      }
    });

    return { newChatId };
  }

  static async backfillParentChainForChat(chatId: string): Promise<void> {
    const chatMessages = await db.query.messages.findMany({
      where: eq(messages.chatId, chatId),
      orderBy: [messages.createdAt],
    });

    if (chatMessages.length === 0) return;

    const uiMessages = convertToUIMessages(chatMessages);
    const withParents = inferParentChainFromLinearOrder(uiMessages);

    await db.transaction(async (tx) => {
      for (const message of withParents) {
        // Never overwrite explicit branch edges — only fill legacy null parents.
        const existing = chatMessages.find((row) => row.id === message.id);
        if (existing?.parentMessageId != null) {
          continue;
        }

        await tx
          .update(messages)
          .set({ parentMessageId: message.parentMessageId ?? null })
          .where(eq(messages.id, message.id));
      }

      const chat = await tx.query.chats.findFirst({
        where: eq(chats.id, chatId),
      });

      if (!chat?.activeLeafMessageId) {
        const leafId = resolveDefaultLeafId(withParents as TreeMessageNode[]);
        if (leafId) {
          await tx
            .update(chats)
            .set({ activeLeafMessageId: leafId })
            .where(eq(chats.id, chatId));
        }
      }
    });
  }

  static async promoteCompareTurn(params: {
    chatId: string;
    userId: string;
    comparisonTurnId: string;
    modelId: string;
  }): Promise<{ assistantMessageId: string } | null> {
    const { chatId, userId, comparisonTurnId, modelId } = params;

    const chat = await db.query.chats.findFirst({
      where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
    });
    if (!chat) return null;

    const turnMessages = await db.query.messages.findMany({
      where: and(eq(messages.chatId, chatId), eq(messages.comparisonTurnId, comparisonTurnId)),
    });

    const compareUser = turnMessages.find((message) => message.role === 'user');
    const promotedAssistant = turnMessages.find(
      (message) => message.role === 'assistant' && message.modelId === modelId
    );

    if (!compareUser || !promotedAssistant) {
      return null;
    }

    await db.transaction(async (tx) => {
      // Clear comparison metadata on the whole turn (user + every model response).
      // Leaving non-promoted assistants with a comparisonTurnId re-enters compare UI
      // when the branch pager selects them, which drops edit/resubmit/fork actions.
      await tx
        .update(messages)
        .set({ comparisonTurnId: null })
        .where(
          and(eq(messages.chatId, chatId), eq(messages.comparisonTurnId, comparisonTurnId))
        );

      await tx
        .update(chats)
        .set({ activeLeafMessageId: promotedAssistant.id, updatedAt: new Date() })
        .where(eq(chats.id, chatId));
    });

    return { assistantMessageId: promotedAssistant.id };
  }

  static async backfillAllChatsParentChains(): Promise<number> {
    const allChats = await db.query.chats.findMany({
      columns: { id: true },
    });

    for (const chat of allChats) {
      await this.backfillParentChainForChat(chat.id);
    }

    return allChats.length;
  }
}
