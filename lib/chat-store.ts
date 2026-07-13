import "server-only";
import { db } from "./db";
import { chats, messages, chatShares, type Chat, type ChatWithShareInfo, type Message, MessageRole, type MessagePart, type DBMessage } from "./db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { generateTitle } from "@/app/actions";
import type { UIMessage } from "ai";
import type { TextUIPart, ToolInvocationUIPart, ImageUIPart, WebSearchCitation } from "./types";
import type { ReasoningUIPart, SourceUIPart, FileUIPart, StepStartUIPart } from "@ai-sdk/ui-utils";
import type { CompareUIMessage } from "@/lib/chat/compareHistory";
import { ConversationPersistenceService } from "@/lib/services/conversationPersistence";
import { buildActivePathMessages, inferParentChainFromLinearOrder } from "@/lib/chat/conversationTree";
import {
  convertToDBMessages,
  convertToDBMessagesWithParents,
  convertToUIMessages,
} from "@/lib/chat/messageConversion";

export {
  convertToDBMessages,
  convertToDBMessagesWithParents,
  convertToUIMessages,
};

type UIMessageWithMeta = {
  id: string;
  role: string;
  content: string;
  parts: Array<TextUIPart | ToolInvocationUIPart | ImageUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
  createdAt?: Date;
  hasWebSearch?: boolean;
  webSearchContextSize?: 'low' | 'medium' | 'high';
};

type SaveChatParams = {
  id?: string;
  userId: string;
  messages?: any[];
  title?: string;
  selectedModel?: string;
  apiKeys?: Record<string, string>;
  isAnonymous?: boolean;
  titleGenerationPromise?: Promise<string>;
};

type ChatWithMessages = Chat & {
  messages: Message[];
  activeLeafMessageId?: string | null;
  activePathMessages?: CompareUIMessage[];
};

export async function saveMessages({
  messages: dbMessages,
  activeLeafMessageId,
}: {
  messages: Array<DBMessage>;
  activeLeafMessageId?: string | null;
}) {
  try {
    if (dbMessages.length === 0) {
      return null;
    }

    return await ConversationPersistenceService.upsertMessages(
      dbMessages,
      activeLeafMessageId
    );
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function saveChat({ id, userId, messages: aiMessages, title, selectedModel, apiKeys, isAnonymous, titleGenerationPromise }: SaveChatParams) {
  // Generate a new ID if one wasn't provided
  const chatId = id || nanoid();

  // Check if chat already exists first
  const existingChat = await db.query.chats.findFirst({
    where: and(
      eq(chats.id, chatId),
      eq(chats.userId, userId)
    ),
  });

  // Check if title is provided, if not generate one
  let chatTitle = title;

  // If chat exists and already has a meaningful title, keep it (unless explicitly overriding with title param)
  if (existingChat && existingChat.title && existingChat.title !== 'New Chat' && !title) {
    chatTitle = existingChat.title; // Keep the existing title
  } else {
    // Generate title if messages are provided and no title is specified
    if (aiMessages && aiMessages.length > 0) {
      const hasEnoughMessages = aiMessages.length >= 2 &&
        aiMessages.some(m => m.role === 'user') &&
        aiMessages.some(m => m.role === 'assistant');

      if (!chatTitle || chatTitle === 'New Chat' || chatTitle === undefined) {
        if (titleGenerationPromise) {
          try {
            chatTitle = await titleGenerationPromise;
          } catch (error) {
            console.error('Error generating title from pre-started promise:', error);
          }
        } else if (hasEnoughMessages) {
          try {
            chatTitle = await generateTitle(aiMessages, selectedModel, apiKeys, userId, isAnonymous);
          } catch (error) {
            console.error('Error generating title:', error);
          }
        }

        if (!chatTitle || chatTitle === 'New Chat') {
          const firstUserMessage = aiMessages.find(m => m.role === 'user');
          if (firstUserMessage) {
            if (firstUserMessage.parts && Array.isArray(firstUserMessage.parts)) {
              const textParts = firstUserMessage.parts.filter((p: MessagePart) => p.type === 'text' && p.text);
              if (textParts.length > 0) {
                chatTitle = textParts[0].text?.slice(0, 50) || 'New Chat';
                if ((textParts[0].text?.length || 0) > 50) {
                  chatTitle += '...';
                }
              } else {
                chatTitle = 'New Chat';
              }
            } else if (typeof firstUserMessage.content === 'string') {
              chatTitle = firstUserMessage.content.slice(0, 50);
              if (firstUserMessage.content.length > 50) {
                chatTitle += '...';
              }
            } else {
              chatTitle = 'New Chat';
            }
          } else {
            chatTitle = 'New Chat';
          }
        }
      }
    } else {
      chatTitle = chatTitle || 'New Chat';
    }
  }

  if (existingChat) {
    // Update existing chat
    await db
      .update(chats)
      .set({
        title: chatTitle,
        updatedAt: new Date()
      })
      .where(and(
        eq(chats.id, chatId),
        eq(chats.userId, userId)
      ));
  } else {
    // Create new chat
    await db.insert(chats).values({
      id: chatId,
      userId,
      title: chatTitle,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  return { id: chatId };
}

// Helper to get just the text content for display
export function getTextContent(message: Message): string {
  try {
    const parts = message.parts as MessagePart[];
    return parts
      .filter(part => part.type === 'text' && part.text)
      .map(part => part.text)
      .join('\n');
  } catch (e) {
    // If parsing fails, return empty string
    return '';
  }
}

export async function getChats(userId: string, limit = 50): Promise<ChatWithShareInfo[]> {
  // Join with chatShares to get share information
  const chatsWithShares = await db
    .select({
      id: chats.id,
      userId: chats.userId,
      title: chats.title,
      activeLeafMessageId: chats.activeLeafMessageId,
      createdAt: chats.createdAt,
      updatedAt: chats.updatedAt,
      shareId: chatShares.shareId,
      sharePath: sql<string | null>`
        CASE 
          WHEN ${chatShares.status} = 'active' 
          THEN '/chats/shared/' || ${chatShares.shareId}
          ELSE NULL 
        END
      `.as('sharePath')
    })
    .from(chats)
    .leftJoin(chatShares, and(
      eq(chats.id, chatShares.chatId),
      eq(chatShares.status, 'active')
    ))
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.updatedAt))
    .limit(limit);

  return chatsWithShares;
}

export async function getChatById(id: string, userId: string): Promise<ChatWithMessages | null> {
  const chat = await db.query.chats.findFirst({
    where: and(
      eq(chats.id, id),
      eq(chats.userId, userId)
    ),
  });

  if (!chat) return null;

  await ConversationPersistenceService.ensureParentChainBackfilled(id);

  const chatMessages = await db.query.messages.findMany({
    where: eq(messages.chatId, id),
    orderBy: [messages.createdAt]
  });

  const refreshedChat = await db.query.chats.findFirst({
    where: and(eq(chats.id, id), eq(chats.userId, userId)),
  });

  const uiMessages = convertToUIMessages(chatMessages);
  const activeLeafMessageId =
    refreshedChat?.activeLeafMessageId ?? resolveDefaultLeafFromDb(chatMessages);
  const activePathMessages = buildActivePathMessages(uiMessages, activeLeafMessageId);

  return {
    ...chat,
    ...refreshedChat,
    messages: chatMessages,
    activeLeafMessageId,
    activePathMessages,
  };
}

function resolveDefaultLeafFromDb(
  chatMessages: Array<{ id: string; parentMessageId?: string | null; createdAt: Date }>
): string | null {
  if (chatMessages.length === 0) return null;
  const withParents = inferParentChainFromLinearOrder(
    convertToUIMessages(chatMessages as Parameters<typeof convertToUIMessages>[0])
  );
  const sorted = [...withParents].sort((a, b) => {
    const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(String(a.createdAt)).getTime();
    const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(String(b.createdAt)).getTime();
    return aTime - bTime || a.id.localeCompare(b.id);
  });
  return sorted[sorted.length - 1]?.id ?? null;
}

export async function deleteChat(id: string, userId: string) {
  await db.delete(chats).where(
    and(
      eq(chats.id, id),
      eq(chats.userId, userId)
    )
  );
}

// Helper functions for image processing
export function processImageParts(parts: Array<TextUIPart | ToolInvocationUIPart | ImageUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>) {
  return parts.map(part => {
    if (part.type === "image_url") {
      // Validate base64 data URLs and add metadata if missing
      if (part.image_url.url.startsWith('data:image/')) {
        return part;
      }
      // Handle external URLs if needed
      return part;
    }
    return part;
  });
}

export function hasImageAttachments(messages: UIMessage[]): boolean {
  return messages.some(message =>
    message.parts?.some(part => (part as { type?: string }).type === "image_url")
  );
} 