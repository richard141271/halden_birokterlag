"use server";

import {
  assertSupabaseWrite,
  getSupabaseServerClient,
  getSupabaseServerClientOrThrow,
} from "@/lib/supabase/server";

type UploadOptions = {
  bucket: string;
  folder: string;
  file: File;
  siteKey?: string;
};

export async function uploadFileToBucket({
  bucket,
  folder,
  file,
  siteKey,
}: UploadOptions) {
  const client = getSupabaseServerClientOrThrow();

  if (!file.size) {
    return null;
  }

  const resolvedSiteKey = siteKey || "default";
  const extension = file.name.split(".").pop() || "bin";
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const storagePath = `${resolvedSiteKey}/${folder}/${fileName}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await client.storage.from(bucket).upload(storagePath, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  assertSupabaseWrite(error, "Kunne ikke laste opp fil til storage");

  return {
    bucket,
    storagePath,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  };
}

export async function deleteFileFromBucket(
  bucket: string,
  storagePath: string | null | undefined,
) {
  const client = getSupabaseServerClient();
  if (!client || !storagePath) {
    return;
  }

  const { error } = await client.storage.from(bucket).remove([storagePath]);
  assertSupabaseWrite(error, "Kunne ikke slette fil fra storage");
}
