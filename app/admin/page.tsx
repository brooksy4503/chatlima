import * as React from "react";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdminPageAccess } from "@/lib/admin/requireAdmin";

export default async function AdminPage() {
  const access = await getAdminPageAccess();

  if (access === 'sign-in') {
    redirect("/auth/sign-in?next=/admin");
  }

  if (access === 'forbidden') {
    redirect("/");
  }

  return (
    <div className="w-full h-full overflow-auto">
      <AdminDashboard />
    </div>
  );
}
