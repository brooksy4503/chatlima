import { NextResponse } from "next/server";
import { getChats } from "@/lib/chat-store";
import { auth } from "@/lib/auth";

// Helper to get user ID from authenticated session only
async function getRequestUserId(request: Request): Promise<string | null> {
  // Only use authenticated session for user ID
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id || null;
}

export async function GET(request: Request) {
  try {
    const userId = await getRequestUserId(request);

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const chats = await getChats(userId);
    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
} 