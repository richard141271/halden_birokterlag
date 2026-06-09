import { createClient } from "@supabase/supabase-js";
import { env, isSupabaseClientConfigured } from "@/lib/config/env";

export function getSupabaseBrowserClient() {
  if (!isSupabaseClientConfigured()) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false },
  });
}
