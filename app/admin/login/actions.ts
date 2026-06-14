"use server";

import { redirect } from "next/navigation";
import {
  authenticateAdminCredentials,
  setAdminSession,
} from "@/lib/auth/session";

export async function loginAdmin(formData: FormData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const session = await authenticateAdminCredentials(username, password);

  if (!session) {
    redirect("/admin/login?error=1");
  }

  await setAdminSession(session);
  redirect("/admin");
}
