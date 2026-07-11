import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export type AdminPageAccess = 'allowed' | 'sign-in' | 'forbidden';

export async function getAdminPageAccess(): Promise<AdminPageAccess> {
  const headersList = await headers();
  const requestHeaders = new Headers();
  headersList.forEach((value, key) => requestHeaders.set(key, value));

  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session?.user?.id) {
    return 'sign-in';
  }

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (userResult.length === 0) {
    return 'forbidden';
  }

  const user = userResult[0];
  const isAdmin = user.role === 'admin' || user.isAdmin === true;
  return isAdmin ? 'allowed' : 'forbidden';
}

export async function getAdminSession(): Promise<{ userId: string } | null> {
  const access = await getAdminPageAccess();
  if (access !== 'allowed') {
    return null;
  }

  const headersList = await headers();
  const requestHeaders = new Headers();
  headersList.forEach((value, key) => requestHeaders.set(key, value));
  const session = await auth.api.getSession({ headers: requestHeaders });
  return session?.user?.id ? { userId: session.user.id } : null;
}
