import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function setUserAsAdmin(email: string) {
    try {
        // Update the user to have admin role
        const result = await db
            .update(users)
            .set({
                role: 'admin',
                isAdmin: true
            })
            .where(eq(users.email, email))
            .returning();

        if (result.length === 0) {
            console.log(`❌ No user found with email: ${email}`);
            return;
        }

        console.log(`✅ Successfully set user ${email} as admin`);
        console.log('Updated user:', result[0]);
    } catch (error) {
        console.error('❌ Error setting user as admin:', error);
    }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
    console.log('Usage: pnpm tsx scripts/set-admin.ts <email>');
    console.log('Example: pnpm tsx scripts/set-admin.ts your-email@gmail.com');
    process.exit(1);
}

setUserAsAdmin(email); 