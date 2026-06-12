"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentSiteKey } from "@/lib/cms/site-context";
import {
  assertSupabaseWrite,
  getSupabaseServerClient,
  getSupabaseServerClientOrThrow,
} from "@/lib/supabase/server";
import { buildStoragePublicUrl } from "@/lib/supabase/storage";
import { isUuid, slugify } from "@/lib/utils";
import type { DocumentRecord } from "@/types/cms";
import { uploadFileToBucket } from "@/features/media/server";

const documentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  folderPath: z.string().optional(),
});

const defaultDocuments: DocumentRecord[] = [
  {
    id: "doc-1",
    site_key: "default",
    title: "Vedtekter",
    slug: "vedtekter",
    description: "Eksempeldokument i dokumentarkivet.",
    folder_path: "/arsmote",
    bucket: "documents",
    storage_path: "default/documents/example.pdf",
    file_name: "vedtekter.pdf",
    mime_type: "application/pdf",
    size_bytes: 0,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getPublishedDocuments() {
  const client = getSupabaseServerClient();
  const siteKey = getCurrentSiteKey();

  if (!client) {
    return defaultDocuments;
  }

  const { data } = await client
    .from("documents")
    .select("*")
    .eq("site_key", siteKey)
    .eq("is_published", true)
    .order("folder_path", { ascending: true });

  const rows = (data as DocumentRecord[] | null) ?? [];
  return rows;
}

export async function getAdminDocuments() {
  const docs = await getPublishedDocuments();

  return docs.map((doc) => ({
    ...doc,
    publicUrl: isUuid(doc.id)
      ? buildStoragePublicUrl(doc.bucket, doc.storage_path)
      : "",
  }));
}

export async function uploadDocument(formData: FormData) {
  const parsed = documentSchema.parse({
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    folderPath: String(formData.get("folder_path") || "/"),
  });

  const file = formData.get("file");
  const client = getSupabaseServerClientOrThrow();

  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadFileToBucket({
      bucket: "documents",
      folder: "documents",
      file,
    });

    if (uploaded) {
      const { error } = await client.from("documents").insert({
        id: crypto.randomUUID(),
        site_key: getCurrentSiteKey(),
        title: parsed.title,
        slug: slugify(parsed.title),
        description: parsed.description || null,
        folder_path: parsed.folderPath || "/",
        bucket: uploaded.bucket,
        storage_path: uploaded.storagePath,
        file_name: uploaded.fileName,
        mime_type: uploaded.mimeType,
        size_bytes: uploaded.sizeBytes,
        is_published: true,
      });

      assertSupabaseWrite(error, "Kunne ikke lagre dokument");
    }
  }

  revalidatePath("/dokumenter");
  revalidatePath("/admin/documents");
  redirect("/admin/documents");
}
