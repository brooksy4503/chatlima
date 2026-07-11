import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/lib/middleware/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const adminResult = await AuthMiddleware.requireAdmin(request);
        if (adminResult.response) {
            return adminResult.response;
        }

        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        const result = await db
            .update(users)
            .set({
                role: 'admin',
                isAdmin: true
            })
            .where(eq(users.email, email))
            .returning();

        if (result.length === 0) {
            return NextResponse.json(
                { success: false, error: `No user found with email: ${email}` },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Successfully set user ${email} as admin`,
            user: result[0]
        });

    } catch (error) {
        console.error('Error setting user as admin:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
