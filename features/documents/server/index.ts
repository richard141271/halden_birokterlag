"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/session";
import { getCurrentOrganizationId } from "@/lib/cms/site-context";
import {
  assertSupabaseWrite,
  getSupabaseServerClient,
  getSupabaseServerClientOrThrow,
} from "@/lib/supabase/server";
import { buildStoragePublicUrl } from "@/lib/supabase/storage";
import { isUuid, slugify } from "@/lib/utils";
import type { DocumentRecord } from "@/types/cms";
import { uploadFileToBucket } from "@/features/media/server";
import { resolveOrganizationWriteTarget } from "@/features/organizations/server";

const documentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  folderPath: z.string().optional(),
});

const defaultDocuments: DocumentRecord[] = [
  {
    id: "doc-1",
    site_key: "default",
    organization_id: null,
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
  const organizationId = await getCurrentOrganizationId();

  if (!client) {
    return defaultDocuments;
  }

  const { data } = await client
    .from("documents")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_published", true)
    .order("folder_path", { ascending: true });

  const rows = (data as DocumentRecord[] | null) ?? [];
  return rows;
}

export async function getAdminDocuments() {
  const client = getSupabaseServerClient();
  const session = await getAdminSession();
  const organizationId = await getCurrentOrganizationId();

  if (!client) {
    return defaultDocuments.map((doc) => ({
      ...doc,
      publicUrl: isUuid(doc.id) ? buildStoragePublicUrl(doc.bucket, doc.storage_path) : "",
    }));
  }

  let query = client
    .from("documents")
    .select("*, organization:organizations(name, slug)")
    .order("folder_path", { ascending: true });

  if (session?.role !== "superadmin") {
    query = query.eq("organization_id", organizationId);
  }

  const { data } = await query;
  const docs =
    ((data as Array<
      DocumentRecord & { organization?: { name?: string | null; slug?: string | null } | null }
    > | null) ?? []).map((doc) => ({
      ...doc,
      organization_name: doc.organization?.name ?? null,
      organization_slug: doc.organization?.slug ?? null,
    }));

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
  const { organizationId, siteKey } = await resolveOrganizationWriteTarget(
    String(formData.get("organization_id") || ""),
  );

  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadFileToBucket({
      bucket: "documents",
      folder: "documents",
      file,
      siteKey,
    });

    if (uploaded) {
      const { error } = await client.from("documents").insert({
        id: crypto.randomUUID(),
        site_key: siteKey,
        organization_id: organizationId,
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

export async function deleteDocument(formData: FormData) {
  const id = String(formData.get("id") || "");
  const bucket = String(formData.get("bucket") || "");
  const storagePath = String(formData.get("storage_path") || "");
  const client = getSupabaseServerClientOrThrow();
  const session = await getAdminSession();
  const organizationId = await getCurrentOrganizationId();

  if (!isUuid(id)) {
    throw new Error("Kunne ikke slette dokument med ugyldig ID.");
  }

  if (bucket && storagePath) {
    const { error: storageError } = await client.storage
      .from(bucket)
      .remove([storagePath]);

    assertSupabaseWrite(storageError, "Kunne ikke slette fil fra storage");
  }

  let query = client.from("documents").delete().eq("id", id);
  if (session?.role !== "superadmin") {
    query = query.eq("organization_id", organizationId);
  }

  const { error } = await query;
  assertSupabaseWrite(error, "Kunne ikke slette dokument");

  revalidatePath("/dokumenter");
  revalidatePath("/admin/documents");
  redirect("/admin/documents");
}
