import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/config/env";
import type { AdminRole, AdminUserRecord } from "@/types/cms";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const COOKIE_NAME = "kias_admin_session";
const MAX_AGE = 60 * 60 * 8;

export type AdminSessionData = {
  username: string;
  role: AdminRole;
  organizationId: string | null;
  organizationSlug: string | null;
  displayName: string | null;
};

function sign(payload: string) {
  return createHmac("sha256", env.adminSessionSecret)
    .update(payload)
    .digest("hex");
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function hashPasswordWithSalt(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

export function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${hashPasswordWithSalt(password, salt)}`;
}

export function verifyAdminPassword(password: string, hashedPassword: string) {
  const [salt, hash] = hashedPassword.split(":");

  if (!salt || !hash) {
    return false;
  }

  return safeCompare(hashPasswordWithSalt(password, salt), hash);
}

export function validateEnvAdminCredentials(username: string, password: string) {
  return (
    safeCompare(username, env.adminUsername) &&
    safeCompare(password, env.adminPassword)
  );
}

function encodeSession(session: AdminSessionData) {
  return Buffer.from(JSON.stringify(session)).toString("base64url");
}

function decodeSession(value: string) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as AdminSessionData;
}

export async function setAdminSession(session: AdminSessionData) {
  const encoded = encodeSession(session);
  const payload = `${encoded}:${Date.now()}`;
  const value = `${payload}:${sign(payload)}`;
  const store = await cookies();

  store.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getAdminSession(): Promise<AdminSessionData | null> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;

  if (!value) {
    return null;
  }

  const parts = value.split(":");
  if (parts.length !== 3) {
    return null;
  }

  const payload = `${parts[0]}:${parts[1]}`;
  if (!safeCompare(parts[2], sign(payload))) {
    return null;
  }

  try {
    return decodeSession(parts[0]);
  } catch {
    return null;
  }
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  return Boolean(await getAdminSession());
}

export async function authenticateAdminCredentials(
  username: string,
  password: string,
): Promise<AdminSessionData | null> {
  if (validateEnvAdminCredentials(username, password)) {
    return {
      username,
      role: "superadmin",
      organizationId: null,
      organizationSlug: null,
      displayName: "Superadmin",
    };
  }

  const client = getSupabaseServerClient();
  if (!client) {
    return null;
  }

  const { data } = await client
    .from("admin_users")
    .select("id, organization_id, username, display_name, password_hash, role, is_active, created_at, updated_at, organization:organizations(slug)")
    .eq("username", username)
    .eq("is_active", true)
    .maybeSingle();

  const user = (data as (AdminUserRecord & {
    organization?: { slug?: string | null } | null;
  }) | null) ?? null;

  if (!user || !verifyAdminPassword(password, user.password_hash)) {
    return null;
  }

  return {
    username: user.username,
    role: user.role,
    organizationId: user.organization_id,
    organizationSlug: user.organization?.slug ?? null,
    displayName: user.display_name,
  };
}
