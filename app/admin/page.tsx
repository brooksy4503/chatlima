import * as React from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  // Get headers from the request
  const headersList = await headers();
  
  // Convert ReadonlyHeaders to Headers
  const requestHeaders = new Headers();
  headersList.forEach((value, key) => {
    requestHeaders.set(key, value);
  });
  
  // Try to get session with proper headers
  const session = await auth.api.getSession({ headers: requestHeaders });

  console.log('Admin page - Session:', session);
  console.log('Admin page - User ID:', session?.user?.id);

  // Check if user is authenticated
  if (!session?.user?.id) {
    console.log('Admin page - No session or user ID, redirecting to sign-in');
    redirect("/auth/sign-in");
  }

  // Query the database to get the user's admin status
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  console.log('Admin page - User result from DB:', userResult);

  if (userResult.length === 0) {
    console.log('Admin page - No user found in DB, redirecting to home');
    redirect("/");
  }

  const user = userResult[0];
  const isAdmin = user.role === "admin" || user.isAdmin === true;
  
  console.log('Admin page - User role:', user.role);
  console.log('Admin page - User isAdmin:', user.isAdmin);
  console.log('Admin page - Final isAdmin check:', isAdmin);
  
  if (!isAdmin) {
    console.log('Admin page - User is not admin, redirecting to home');
    redirect("/");
  }

  console.log('Admin page - User is admin, rendering dashboard');
  return (
    <div className="w-full h-full overflow-auto">
      <AdminDashboard />
    </div>
  );
}