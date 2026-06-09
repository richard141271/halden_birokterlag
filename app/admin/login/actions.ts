"use server";

import { redirect } from "next/navigation";
import { setAdminSession, validateAdminCredentials } from "@/lib/auth/session";

export async function loginAdmin(formData: FormData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");

  if (!validateAdminCredentials(username, password)) {
    redirect("/admin/login?error=1");
  }

  await setAdminSession(username);
  redirect("/admin");
}
