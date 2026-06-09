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
      "Supabase server mangler oppsett. Sett SUPABASE_SERVICE_ROLE_KEY i .env.local og i Vercel.",
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
