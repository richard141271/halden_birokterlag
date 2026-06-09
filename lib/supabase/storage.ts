import { env } from "@/lib/config/env";

export function buildStoragePublicUrl(bucket: string, storagePath: string) {
  if (!env.supabaseUrl) {
    return "";
  }

  return `${env.supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
}
