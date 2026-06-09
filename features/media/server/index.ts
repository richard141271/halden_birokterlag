"use server";

import { getCurrentSiteKey } from "@/lib/cms/site-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type UploadOptions = {
  bucket: string;
  folder: string;
  file: File;
};

export async function uploadFileToBucket({
  bucket,
  folder,
  file,
}: UploadOptions) {
  const client = getSupabaseServerClient();
  if (!client || !file.size) {
    return null;
  }

  const siteKey = getCurrentSiteKey();
  const extension = file.name.split(".").pop() || "bin";
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const storagePath = `${siteKey}/${folder}/${fileName}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await client.storage.from(bucket).upload(storagePath, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw error;
  }

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

  await client.storage.from(bucket).remove([storagePath]);
}
