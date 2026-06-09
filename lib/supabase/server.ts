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
