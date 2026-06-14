import { redirect } from "next/navigation";
import { getAdminSession, isAdminAuthenticated } from "@/lib/auth/session";

export async function requireAdminSession() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }
}

export async function requireSuperAdmin() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (session.role !== "superadmin") {
    redirect("/admin");
  }

  return session;
}
