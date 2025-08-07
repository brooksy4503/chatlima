import { db } from "./db";
import { chats, messages, chatShares, type Chat, type ChatWithShareInfo, type Message, MessageRole, type MessagePart, type DBMessage } from "./db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { generateTitle } from "@/app/actions";
import type { TextUIPart, ToolInvocationUIPart, ImageUIPart, WebSearchCitation } from "./types";
import type { ReasoningUIPart, SourceUIPart, FileUIPart, StepStartUIPart } from "@ai-sdk/ui-utils";

type AIMessage = {
  role: string;
  content: string | any[];
  id?: string;
  parts?: Array<TextUIPart | ToolInvocationUIPart | ImageUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
  hasWebSearch?: boolean;
  webSearchContextSize?: 'low' | 'medium' | 'high';
};

type UIMessage = {
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
};

type ChatWithMessages = Chat & {
  messages: Message[];
};

export async function saveMessages({
  messages: dbMessages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    if (dbMessages.length > 0) {
      const chatId = dbMessages[0].chatId;

      // First delete any existing messages for this chat
      await db
        .delete(messages)
        .where(eq(messages.chatId, chatId));

      // Then insert the new messages
      return await db.insert(messages).values(dbMessages);
    }
    return null;
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

// Function to convert AI messages to DB format
export function convertToDBMessages(aiMessages: AIMessage[], chatId: string): DBMessage[] {
  return aiMessages.map(msg => {
    // Use existing id or generate a new one
    const messageId = msg.id || nanoid();

    // If msg has parts, use them directly
    if (msg.parts) {
      return {
        id: messageId,
        chatId,
        role: msg.role,
        parts: msg.parts,
        hasWebSearch: msg.hasWebSearch || false,
        webSearchContextSize: msg.webSearchContextSize || 'medium',
        createdAt: new Date()
      };
    }

    // Otherwise, convert content to parts
    let parts: Array<TextUIPart | ToolInvocationUIPart | ImageUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;

    if (typeof msg.content === 'string') {
      parts = [{ type: 'text', text: msg.content } as TextUIPart];
    } else if (Array.isArray(msg.content)) {
      if (msg.content.every(item => typeof item === 'object' && item !== null)) {
        // Content is already in parts-like format
        parts = msg.content as Array<TextUIPart | ToolInvocationUIPart | ImageUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
      } else {
        // Content is an array but not in parts format
        parts = [{ type: 'text', text: JSON.stringify(msg.content) } as TextUIPart];
      }
    } else {
      // Default case
      parts = [{ type: 'text', text: String(msg.content) } as TextUIPart];
    }

    return {
      id: messageId,
      chatId,
      role: msg.role,
      parts,
      hasWebSearch: msg.hasWebSearch || false,
      webSearchContextSize: msg.webSearchContextSize || 'medium',
      createdAt: new Date()
    };
  });
}

// Convert DB messages to UI format
export function convertToUIMessages(dbMessages: Array<Message>): Array<UIMessage> {
  return dbMessages.map((message) => ({
    id: message.id,
    parts: message.parts as Array<TextUIPart | ToolInvocationUIPart | ImageUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>,
    role: message.role as string,
    content: getTextContent(message), // For backward compatibility
    createdAt: message.createdAt,
    hasWebSearch: message.hasWebSearch || false,
    webSearchContextSize: (message.webSearchContextSize || 'medium') as 'low' | 'medium' | 'high'
  }));
}

export async function saveChat({ id, userId, messages: aiMessages, title, selectedModel, apiKeys, isAnonymous }: SaveChatParams) {
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
        if (hasEnoughMessages) {
          try {
            // Use AI to generate a meaningful title based on conversation
            chatTitle = await generateTitle(aiMessages, selectedModel, apiKeys, userId, isAnonymous);
          } catch (error) {
            console.error('Error generating title:', error);
            // Fallback to basic title extraction if AI title generation fails
            const firstUserMessage = aiMessages.find(m => m.role === 'user');
            if (firstUserMessage) {
              // Check for parts first (new format)
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
              }
              // Fallback to content (old format)
              else if (typeof firstUserMessage.content === 'string') {
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
        } else {
          // Not enough messages for AI title, use first message
          const firstUserMessage = aiMessages.find(m => m.role === 'user');
          if (firstUserMessage) {
            // Check for parts first (new format)
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
            }
            // Fallback to content (old format)
            else if (typeof firstUserMessage.content === 'string') {
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

  const chatMessages = await db.query.messages.findMany({
    where: eq(messages.chatId, id),
    orderBy: [messages.createdAt]
  });

  return {
    ...chat,
    messages: chatMessages
  };
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
    message.parts?.some(part => part.type === "image_url")
  );
} 