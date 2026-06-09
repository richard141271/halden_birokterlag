import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth/session";

export async function requireAdminSession() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }
}
