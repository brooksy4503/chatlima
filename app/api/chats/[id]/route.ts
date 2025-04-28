import { NextResponse } from "next/server";
import { getChatById, deleteChat } from "@/lib/chat-store";
import { auth } from "@/lib/auth";

interface Params {
  params: {
    id: string;
  };
}

// Helper to get user ID (prioritizing authenticated session)
async function getRequestUserId(request: Request): Promise<string | null> {
  // Check for authenticated session first
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user?.id) {
    return session.user.id;
  }
  // Fallback to header for anonymous users
  return request.headers.get('x-user-id');
}

export async function GET(request: Request, { params }: Params) {
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

export async function DELETE(request: Request, { params }: Params) {
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