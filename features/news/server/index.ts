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
import { isUuid, slugify } from "@/lib/utils";
import type { NewsRecord } from "@/types/cms";

const newsSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  summary: z.string().optional(),
  body: z.string().min(1),
  authorName: z.string().optional(),
  isPublished: z.boolean().optional(),
});

const defaultNews: NewsRecord[] = [
  {
    id: "news-1",
    site_key: "default",
    slug: "velkommen-til-halden-birokterlag",
    title: "Velkommen til Halden Birøkterlags nye nettside",
    summary:
      "Nettsiden er oppgradert for å gjøre informasjon, arrangementer og dokumenter enklere tilgjengelig for medlemmene.",
    body: "Her finner du nyheter, arrangementer, dokumenter og oppdatert informasjon fra laget.",
    author_name: "Admin",
    published_at: new Date().toISOString(),
    cover_image_url: null,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getPublishedNews() {
  const client = getSupabaseServerClient();
  const siteKey = getCurrentSiteKey();

  if (!client) {
    return defaultNews;
  }

  const { data } = await client
    .from("news")
    .select("*")
    .eq("site_key", siteKey)
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const rows = (data as NewsRecord[] | null) ?? [];
  return rows.length ? rows : defaultNews;
}

export async function getNewsBySlug(slug: string) {
  const news = await getPublishedNews();
  return news.find((item) => item.slug === slug) ?? null;
}

export async function getAdminNews() {
  const client = getSupabaseServerClient();
  const siteKey = getCurrentSiteKey();

  if (!client) {
    return defaultNews;
  }

  const { data } = await client
    .from("news")
    .select("*")
    .eq("site_key", siteKey)
    .order("created_at", { ascending: false });

  const rows = (data as NewsRecord[] | null) ?? [];
  return rows.length ? rows : defaultNews;
}

export async function getNewsById(id: string) {
  const news = await getAdminNews();
  return news.find((item) => item.id === id) ?? null;
}

export async function saveNews(formData: FormData) {
  const parsed = newsSchema.parse({
    id: String(formData.get("id") || ""),
    title: String(formData.get("title") || ""),
    summary: String(formData.get("summary") || ""),
    body: String(formData.get("body") || ""),
    authorName: String(formData.get("author_name") || "Admin"),
    isPublished: formData.get("is_published") === "on",
  });

  const client = getSupabaseServerClientOrThrow();
  const siteKey = getCurrentSiteKey();
  const id = isUuid(parsed.id || "") ? parsed.id : crypto.randomUUID();
  const { error } = await client.from("news").upsert({
    id,
    site_key: siteKey,
    slug: slugify(parsed.title),
    title: parsed.title,
    summary: parsed.summary || null,
    body: parsed.body,
    author_name: parsed.authorName || "Admin",
    is_published: parsed.isPublished ?? false,
    published_at: parsed.isPublished ? new Date().toISOString() : null,
  });

  assertSupabaseWrite(error, "Kunne ikke lagre nyhet");

  revalidatePath("/nyheter");
  revalidatePath("/admin/news");
  redirect("/admin/news");
}

export async function deleteNews(formData: FormData) {
  const id = String(formData.get("id") || "");
  const client = getSupabaseServerClientOrThrow();

  if (id) {
    const { error } = await client.from("news").delete().eq("id", id);
    assertSupabaseWrite(error, "Kunne ikke slette nyhet");
  }

  revalidatePath("/nyheter");
  revalidatePath("/admin/news");
  redirect("/admin/news");
}
