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
import type { AlbumRecord, ImageRecord } from "@/types/cms";
import {
  deleteFileFromBucket,
  uploadFileToBucket,
} from "@/features/media/server";
import { resolveOrganizationWriteTarget } from "@/features/organizations/server";

const albumSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

const imageSchema = z.object({
  id: z.string().optional(),
  albumId: z.string().min(1),
  altText: z.string().optional(),
  caption: z.string().optional(),
});

const defaultAlbums: AlbumRecord[] = [
  {
    id: "album-1",
    site_key: "default",
    organization_id: null,
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
    organization_id: null,
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
  const organizationId = await getCurrentOrganizationId();

  if (!client) {
    return defaultAlbums;
  }

  const { data } = await client
    .from("albums")
    .select("*")
    .eq("organization_id", organizationId)
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
  const organizationId = await getCurrentOrganizationId();

  if (!client) {
    return defaultImages.filter((image) => image.album_id === albumId);
  }

  if (!isUuid(albumId)) {
    return [];
  }

  const { data } = await client
    .from("images")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("album_id", albumId)
    .order("sort_order", { ascending: true });

  const rows = (data as ImageRecord[] | null) ?? [];
  return rows.map((image) => ({
    ...image,
    public_url: buildStoragePublicUrl(image.bucket, image.storage_path),
  }));
}

export async function getAdminGalleryData() {
  const client = getSupabaseServerClient();
  const session = await getAdminSession();
  const organizationId = await getCurrentOrganizationId();

  if (!client) {
    const albums = await getPublishedAlbums();
    return Promise.all(
      albums.map(async (album) => ({
        album,
        images: await getImagesForAlbum(album.id),
      })),
    );
  }

  let albumQuery = client
    .from("albums")
    .select("*, organization:organizations(name, slug)")
    .order("sort_order", { ascending: true });

  let imageQuery = client
    .from("images")
    .select("*, organization:organizations(name, slug)")
    .order("sort_order", { ascending: true });

  if (session?.role !== "superadmin") {
    albumQuery = albumQuery.eq("organization_id", organizationId);
    imageQuery = imageQuery.eq("organization_id", organizationId);
  }

  const [{ data: albumRows }, { data: imageRows }] = await Promise.all([
    albumQuery,
    imageQuery,
  ]);

  const albums =
    ((albumRows as Array<
      AlbumRecord & { organization?: { name?: string | null; slug?: string | null } | null }
    > | null) ?? []).map((album) => ({
      ...album,
      organization_name: album.organization?.name ?? null,
      organization_slug: album.organization?.slug ?? null,
    }));
  const images =
    ((imageRows as Array<
      ImageRecord & { organization?: { name?: string | null; slug?: string | null } | null }
    > | null) ?? []).map((image) => ({
      ...image,
      public_url: buildStoragePublicUrl(image.bucket, image.storage_path),
      organization_name: image.organization?.name ?? null,
      organization_slug: image.organization?.slug ?? null,
    }));

  return albums.map((album) => ({
    album,
    images: images.filter((image) => image.album_id === album.id),
  }));
}

function revalidateGalleryPaths() {
  revalidatePath("/galleri");
  revalidatePath("/admin/gallery");
}

export async function saveAlbum(formData: FormData) {
  const parsed = albumSchema.parse({
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
  });
  const id = String(formData.get("id") || "");

  const client = getSupabaseServerClientOrThrow();
  const { organizationId, siteKey } = await resolveOrganizationWriteTarget(
    String(formData.get("organization_id") || ""),
  );
  const albumId = isUuid(id) ? id : crypto.randomUUID();
  const { error } = await client.from("albums").upsert({
    id: albumId,
    site_key: siteKey,
    organization_id: organizationId,
    slug: slugify(parsed.title),
    title: parsed.title,
    description: parsed.description || null,
    is_published: true,
    sort_order: 0,
  });

  assertSupabaseWrite(error, "Kunne ikke opprette album");

  revalidateGalleryPaths();
  redirect("/admin/gallery");
}

export async function createAlbum(formData: FormData) {
  return saveAlbum(formData);
}

export async function uploadImage(formData: FormData) {
  const client = getSupabaseServerClientOrThrow();
  const { organizationId, siteKey } = await resolveOrganizationWriteTarget(
    String(formData.get("organization_id") || ""),
  );
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
    .eq("organization_id", organizationId)
    .eq("album_id", albumId);

  let sortOrder = count ?? 0;

  for (const file of files) {
    const uploaded = await uploadFileToBucket({
      bucket: "media",
      folder: "gallery",
      file,
      siteKey,
    });

    if (uploaded) {
      const { error } = await client.from("images").insert({
        id: crypto.randomUUID(),
        site_key: siteKey,
        organization_id: organizationId,
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

  revalidateGalleryPaths();
  redirect("/admin/gallery");
}

export async function saveImage(formData: FormData) {
  const parsed = imageSchema.parse({
    id: String(formData.get("id") || ""),
    albumId: String(formData.get("album_id") || ""),
    altText: String(formData.get("alt_text") || ""),
    caption: String(formData.get("caption") || ""),
  });
  const currentBucket = String(formData.get("current_bucket") || "");
  const currentStoragePath = String(formData.get("current_storage_path") || "");
  const replacementFile = formData.get("file");
  const client = getSupabaseServerClientOrThrow();
  const { organizationId, siteKey } = await resolveOrganizationWriteTarget(
    String(formData.get("organization_id") || ""),
  );

  if (!isUuid(parsed.id || "")) {
    throw new Error("Kunne ikke oppdatere bilde med ugyldig ID.");
  }

  if (!isUuid(parsed.albumId)) {
    throw new Error("Kunne ikke oppdatere bilde med ugyldig album.");
  }

  let fileUpdate = null;
  if (replacementFile instanceof File && replacementFile.size > 0) {
    fileUpdate = await uploadFileToBucket({
      bucket: "media",
      folder: "gallery",
      file: replacementFile,
      siteKey,
    });
  }

  const payload = {
    organization_id: organizationId,
    album_id: parsed.albumId,
    alt_text: parsed.altText || null,
    caption: parsed.caption || null,
    ...(fileUpdate
      ? {
          bucket: fileUpdate.bucket,
          storage_path: fileUpdate.storagePath,
          file_name: fileUpdate.fileName,
          mime_type: fileUpdate.mimeType,
          size_bytes: fileUpdate.sizeBytes,
        }
      : {}),
  };

  const { error } = await client.from("images").update(payload).eq("id", parsed.id);
  assertSupabaseWrite(error, "Kunne ikke oppdatere bilde");

  if (
    fileUpdate &&
    currentBucket &&
    currentStoragePath &&
    (currentBucket !== fileUpdate.bucket || currentStoragePath !== fileUpdate.storagePath)
  ) {
    await deleteFileFromBucket(currentBucket, currentStoragePath);
  }

  revalidateGalleryPaths();
  redirect("/admin/gallery");
}

export async function deleteImage(formData: FormData) {
  const id = String(formData.get("id") || "");
  const bucket = String(formData.get("bucket") || "");
  const storagePath = String(formData.get("storage_path") || "");
  const client = getSupabaseServerClientOrThrow();
  const session = await getAdminSession();
  const organizationId = await getCurrentOrganizationId();

  if (!isUuid(id)) {
    throw new Error("Kunne ikke slette bilde med ugyldig ID.");
  }

  let query = client.from("images").delete().eq("id", id);
  if (session?.role !== "superadmin") {
    query = query.eq("organization_id", organizationId);
  }

  const { error } = await query;
  assertSupabaseWrite(error, "Kunne ikke slette bilde");
  await deleteFileFromBucket(bucket, storagePath);

  revalidateGalleryPaths();
  redirect("/admin/gallery");
}

export async function deleteAlbum(formData: FormData) {
  const id = String(formData.get("id") || "");
  const client = getSupabaseServerClientOrThrow();
  const session = await getAdminSession();
  const organizationId = await getCurrentOrganizationId();

  if (!isUuid(id)) {
    throw new Error("Kunne ikke slette album med ugyldig ID.");
  }

  const { data: images } = await client
    .from("images")
    .select("id, bucket, storage_path")
    .eq("album_id", id);

  const rows =
    (images as Array<{ id: string; bucket: string; storage_path: string | null }> | null) ?? [];

  if (rows.length) {
    let deleteImagesQuery = client.from("images").delete().eq("album_id", id);
    if (session?.role !== "superadmin") {
      deleteImagesQuery = deleteImagesQuery.eq("organization_id", organizationId);
    }

    const { error: deleteImagesError } = await deleteImagesQuery;
    assertSupabaseWrite(deleteImagesError, "Kunne ikke slette bilder i album");

    await Promise.all(
      rows.map((image) => deleteFileFromBucket(image.bucket, image.storage_path)),
    );
  }

  let deleteAlbumQuery = client.from("albums").delete().eq("id", id);
  if (session?.role !== "superadmin") {
    deleteAlbumQuery = deleteAlbumQuery.eq("organization_id", organizationId);
  }

  const { error } = await deleteAlbumQuery;
  assertSupabaseWrite(error, "Kunne ikke slette album");

  revalidateGalleryPaths();
  redirect("/admin/gallery");
}
