import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const migrateSchema = z.object({
    localUserId: z.string().min(1, "Local user ID is required"),
});

export async function POST(req: NextRequest) {
    // 1. Check Authentication using headers
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const authenticatedUserId = session.user.id;

    // 2. Validate Request Body
    let parsedBody;
    try {
        const body = await req.json();
        parsedBody = migrateSchema.parse(body);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 },
        );
    }

    const { localUserId } = parsedBody;

    // 3. Perform Database Update
    try {
        console.log(
            `Migrating chats from local user ${localUserId} to authenticated user ${authenticatedUserId}`,
        );
        const result = await db
            .update(chats)
            .set({ userId: authenticatedUserId })
            .where(eq(chats.userId, localUserId))
            .returning({ updatedId: chats.id }); // Optional: return updated chat IDs

        console.log(`Migrated ${result.length} chats.`);

        return NextResponse.json(
            { success: true, migratedCount: result.length },
            { status: 200 },
        );
    } catch (dbError) {
        console.error("Database error during chat migration:", dbError);
        return NextResponse.json(
            { error: "Failed to migrate chats" },
            { status: 500 },
        );
    }
} 