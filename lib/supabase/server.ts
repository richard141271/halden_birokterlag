import { createClient } from "@supabase/supabase-js";
import { env, isSupabaseServiceConfigured } from "@/lib/config/env";

export function getSupabaseServerClient() {
  if (!isSupabaseServiceConfigured()) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabaseServerClientOrThrow() {
  const client = getSupabaseServerClient();

  if (!client) {
    throw new Error(
      "Supabase server mangler oppsett. Kontroller at NEXT_PUBLIC_SUPABASE_URL og SUPABASE_SERVICE_ROLE_KEY er satt i aktivt miljo.",
    );
  }

  return client;
}

export function assertSupabaseWrite(
  error: { message: string } | null,
  action: string,
) {
  if (error) {
    throw new Error(`${action}: ${error.message}`);
  }
}
