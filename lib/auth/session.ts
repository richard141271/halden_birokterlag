import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/config/env";

const COOKIE_NAME = "kias_admin_session";
const MAX_AGE = 60 * 60 * 8;

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

export function validateAdminCredentials(username: string, password: string) {
  return (
    safeCompare(username, env.adminUsername) &&
    safeCompare(password, env.adminPassword)
  );
}

export async function setAdminSession(username: string) {
  const payload = `${username}:${Date.now()}`;
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

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;

  if (!value) {
    return false;
  }

  const parts = value.split(":");
  if (parts.length !== 3) {
    return false;
  }

  const payload = `${parts[0]}:${parts[1]}`;
  return safeCompare(parts[2], sign(payload));
}
