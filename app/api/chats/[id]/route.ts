import { NextResponse, NextRequest } from "next/server";
import { getChatById, deleteChat } from "@/lib/chat-store"; // Assuming getChatById also checks userId
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

interface Params {
  params: {
    id: string;
  };
}

// Helper to get user ID (prioritizing authenticated session)
async function getRequestUserId(request: NextRequest): Promise<string | null> {
  // Check for authenticated session first
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user?.id) {
    return session.user.id;
  }
  // Fallback to header for anonymous users
  return request.headers.get('x-user-id');
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const userId = await getRequestUserId(request);

    if (!userId) {
      // This should only happen if no session AND no header
      return NextResponse.json({ error: "User ID not found in session or header" }, { status: 401 });
    }

    const { id } = await params;
    const chat = await getChatById(id, userId);

    if (!chat) {
      console.log(`Chat not found for id: ${id} and userId: ${userId}`);
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const userId = await getRequestUserId(request);

    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session or header" }, { status: 401 });
    }

    const { id } = await params;
    await deleteChat(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: Params
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { id: chatId } = await params;
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json({ error: "Invalid request body: Must be valid JSON" }, { status: 400 });
    }

    const { title } = requestBody;

    if (typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ error: "Invalid title: Title must be a non-empty string" }, { status: 400 });
    }

    if (title.length > 255) {
      return NextResponse.json({ error: `Invalid title: Title must be 255 characters or less. Received ${title.length} characters.` }, { status: 400 });
    }

    // First, verify the chat exists and belongs to the user.
    // We can use a direct DB query for this to ensure we get the latest state before update.
    const existingChatArray = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, session.user.id)))
      .limit(1);

    if (existingChatArray.length === 0) {
      // Check if chat exists at all to differentiate between Not Found and Forbidden
      const chatExistsArray = await db.select({ id: chats.id }).from(chats).where(eq(chats.id, chatId)).limit(1);
      if (chatExistsArray.length === 0) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Forbidden: You do not own this chat" }, { status: 403 });
    }

    const existingChat = existingChatArray[0];

    // Update the chat title
    const updatedChatArray = await db
      .update(chats)
      .set({ title: title.trim(), updatedAt: new Date() })
      .where(and(eq(chats.id, chatId), eq(chats.userId, session.user.id)))
      .returning();

    if (updatedChatArray.length === 0) {
      // This case should ideally not be reached if the prior check passed,
      // but as a safeguard:
      console.error(`Failed to update chat title for chat ID: ${chatId} and user ID: ${session.user.id}. Chat might have been deleted or ownership changed concurrently.`);
      return NextResponse.json({ error: "Failed to update chat title. Chat not found or access denied." }, { status: 404 });
    }

    return NextResponse.json(updatedChatArray[0], { status: 200 });

  } catch (error) {
    console.error("Error updating chat title:", error);
    // Generic error for unexpected issues
    if (error instanceof Error && error.message.includes("Invalid request body")) {
      return NextResponse.json({ error: "Invalid request body: Must be valid JSON" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update chat title due to an internal server error" },
      { status: 500 }
    );
  }
}