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
import type { AlbumRecord, ImageRecord } from "@/types/cms";
import {
  deleteFileFromBucket,
  uploadFileToBucket,
} from "@/features/media/server";

const albumSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

const defaultAlbums: AlbumRecord[] = [
  {
    id: "album-1",
    site_key: "default",
    slug: "sommer-i-bigarden",
    title: "Sommer i bigården",
    description: "Eksempelalbum for bildegalleriet.",
    sort_order: 0,
    cover_image_url: null,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const defaultImages: ImageRecord[] = [
  {
    id: "image-1",
    site_key: "default",
    album_id: "album-1",
    bucket: "media",
    storage_path: "default/gallery/example.jpg",
    file_name: "example.jpg",
    mime_type: "image/jpeg",
    alt_text: "Eksempelbilde",
    caption: "Legg inn bilder her fra adminpanelet.",
    width: null,
    height: null,
    size_bytes: 0,
    sort_order: 0,
    public_url: null,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getPublishedAlbums() {
  const client = getSupabaseServerClient();
  const siteKey = getCurrentSiteKey();

  if (!client) {
    return defaultAlbums;
  }

  const { data } = await client
    .from("albums")
    .select("*")
    .eq("site_key", siteKey)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const rows = (data as AlbumRecord[] | null) ?? [];
  return rows;
}

export async function getAlbumBySlug(slug: string) {
  const albums = await getPublishedAlbums();
  const album = albums.find((item) => item.slug === slug) ?? null;

  if (!album) {
    return null;
  }

  return {
    album,
    images: await getImagesForAlbum(album.id),
  };
}

export async function getImagesForAlbum(albumId: string) {
  const client = getSupabaseServerClient();
  const siteKey = getCurrentSiteKey();

  if (!client) {
    return defaultImages.filter((image) => image.album_id === albumId);
  }

  if (!isUuid(albumId)) {
    return [];
  }

  const { data } = await client
    .from("images")
    .select("*")
    .eq("site_key", siteKey)
    .eq("album_id", albumId)
    .order("sort_order", { ascending: true });

  const rows = (data as ImageRecord[] | null) ?? [];
  return rows.map((image) => ({
    ...image,
    public_url: buildStoragePublicUrl(image.bucket, image.storage_path),
  }));
}

export async function getAdminGalleryData() {
  const albums = await getPublishedAlbums();
  const images = await Promise.all(
    albums.map(async (album) => ({
      album,
      images: await getImagesForAlbum(album.id),
    })),
  );

  return images;
}

export async function createAlbum(formData: FormData) {
  const parsed = albumSchema.parse({
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
  });

  const client = getSupabaseServerClientOrThrow();
  const { error } = await client.from("albums").insert({
    id: crypto.randomUUID(),
    site_key: getCurrentSiteKey(),
    slug: slugify(parsed.title),
    title: parsed.title,
    description: parsed.description || null,
    is_published: true,
    sort_order: 0,
  });

  assertSupabaseWrite(error, "Kunne ikke opprette album");

  revalidatePath("/galleri");
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function uploadImage(formData: FormData) {
  const client = getSupabaseServerClientOrThrow();
  const albumId = String(formData.get("album_id") || "");
  const altText = String(formData.get("alt_text") || "");
  const caption = String(formData.get("caption") || "");
  const files = [
    ...formData
      .getAll("files")
      .filter((value): value is File => value instanceof File && value.size > 0),
    ...formData
      .getAll("file")
      .filter((value): value is File => value instanceof File && value.size > 0),
  ].slice(0, 6);

  if (!isUuid(albumId)) {
    throw new Error("Du må opprette og velge et gyldig album før du laster opp bilder.");
  }

  if (!files.length) {
    throw new Error("Velg minst ett bilde for opplasting.");
  }

  const { count } = await client
    .from("images")
    .select("*", { count: "exact", head: true })
    .eq("site_key", getCurrentSiteKey())
    .eq("album_id", albumId);

  let sortOrder = count ?? 0;

  for (const file of files) {
    const uploaded = await uploadFileToBucket({
      bucket: "media",
      folder: "gallery",
      file,
    });

    if (uploaded) {
      const { error } = await client.from("images").insert({
        id: crypto.randomUUID(),
        site_key: getCurrentSiteKey(),
        album_id: albumId,
        bucket: uploaded.bucket,
        storage_path: uploaded.storagePath,
        file_name: uploaded.fileName,
        mime_type: uploaded.mimeType,
        alt_text: altText || null,
        caption: caption || null,
        size_bytes: uploaded.sizeBytes,
        sort_order: sortOrder,
        is_published: true,
      });

      assertSupabaseWrite(error, "Kunne ikke lagre bilde");
      sortOrder += 1;
    }
  }

  revalidatePath("/galleri");
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function deleteImage(formData: FormData) {
  const id = String(formData.get("id") || "");
  const bucket = String(formData.get("bucket") || "");
  const storagePath = String(formData.get("storage_path") || "");
  const client = getSupabaseServerClientOrThrow();

  if (id) {
    const { error } = await client.from("images").delete().eq("id", id);
    assertSupabaseWrite(error, "Kunne ikke slette bilde");
    await deleteFileFromBucket(bucket, storagePath);
  }

  revalidatePath("/galleri");
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}
