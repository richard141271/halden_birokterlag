"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/session";
import { getCurrentOrganizationId } from "@/lib/cms/site-context";
import { resolveOrganizationWriteTarget } from "@/features/organizations/server";
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
    organization_id: null,
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
  const organizationId = await getCurrentOrganizationId();

  if (!client) {
    return defaultNews;
  }

  const { data } = await client
    .from("news")
    .select("*")
    .eq("organization_id", organizationId)
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
  const session = await getAdminSession();
  const organizationId = await getCurrentOrganizationId();

  if (!client) {
    return defaultNews;
  }

  let query = client
    .from("news")
    .select("*, organization:organizations(name, slug)")
    .order("created_at", { ascending: false });

  if (session?.role !== "superadmin") {
    query = query.eq("organization_id", organizationId);
  }

  const { data } = await query;

  const rows =
    ((data as Array<
      NewsRecord & { organization?: { name?: string | null; slug?: string | null } | null }
    > | null) ?? []).map((item) => ({
      ...item,
      organization_name: item.organization?.name ?? null,
      organization_slug: item.organization?.slug ?? null,
    }));
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
  const { organizationId, siteKey } = await resolveOrganizationWriteTarget(
    String(formData.get("organization_id") || ""),
  );
  const id = isUuid(parsed.id || "") ? parsed.id : crypto.randomUUID();
  const { error } = await client.from("news").upsert({
    id,
    site_key: siteKey,
    organization_id: organizationId,
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
  const session = await getAdminSession();
  const organizationId = await getCurrentOrganizationId();

  if (!isUuid(id)) {
    throw new Error("Kunne ikke slette nyhet med ugyldig ID.");
  }

  let query = client.from("news").delete().eq("id", id);
  if (session?.role !== "superadmin") {
    query = query.eq("organization_id", organizationId);
  }

  const { error } = await query;
  assertSupabaseWrite(error, "Kunne ikke slette nyhet");

  revalidatePath("/nyheter");
  revalidatePath("/admin/news");
  redirect("/admin/news");
}
