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
import { isUuid } from "@/lib/utils";
import type { PageRecord } from "@/types/cms";

const pageSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().optional(),
  body: z.string().min(1),
  isHomePage: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  showInNav: z.boolean().optional(),
});

const defaultPages: PageRecord[] = [
  {
    id: "page-home",
    site_key: "default",
    slug: "forside",
    title: "Forside",
    page_type: "static",
    body: "Velkommen til Halden Birøkterlag. Her kan vi dele nyheter, arrangementer og nyttig informasjon for medlemmer og besøkende.",
    excerpt: "Et aktivt birøkterlag for nye og erfarne birøktere i Halden og omegn.",
    seo_title: "Halden Birøkterlag",
    seo_description: "Nyheter, arrangementer og informasjon fra Halden Birøkterlag.",
    is_homepage: true,
    is_published: true,
    show_in_nav: true,
    nav_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "page-about",
    site_key: "default",
    slug: "om-oss",
    title: "Om oss",
    page_type: "static",
    body: "Denne siden brukes til å beskrive laget, organisasjonen eller virksomheten bak nettstedet.",
    excerpt: "Hvem dere er og hva dere gjør.",
    seo_title: null,
    seo_description: null,
    is_homepage: false,
    is_published: true,
    show_in_nav: true,
    nav_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "page-contact",
    site_key: "default",
    slug: "kontakt",
    title: "Kontakt",
    page_type: "static",
    body: "Legg inn kontaktinformasjon, møtested, e-post og annen nyttig informasjon her.",
    excerpt: "Kontakt oss.",
    seo_title: null,
    seo_description: null,
    is_homepage: false,
    is_published: true,
    show_in_nav: true,
    nav_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function getDefaultPages(siteKey: string) {
  return defaultPages.map((page) => ({
    ...page,
    site_key: siteKey,
  }));
}

function mergePagesWithDefaults(rows: PageRecord[], siteKey: string) {
  const merged = new Map(
    getDefaultPages(siteKey).map((page) => [page.slug, page] as const),
  );

  for (const row of rows) {
    const fallback = merged.get(row.slug);
    merged.set(row.slug, fallback ? { ...fallback, ...row } : row);
  }

  return [...merged.values()].sort((a, b) => a.nav_order - b.nav_order);
}

export async function getPublicPages() {
  const client = getSupabaseServerClient();
  const siteKey = getCurrentSiteKey();

  if (!client) {
    return getDefaultPages(siteKey);
  }

  const { data } = await client
    .from("pages")
    .select("*")
    .eq("site_key", siteKey)
    .eq("is_published", true)
    .order("nav_order", { ascending: true });

  const rows = (data as PageRecord[] | null) ?? [];
  return mergePagesWithDefaults(rows, siteKey).filter((page) => page.is_published);
}

export async function getHomepage() {
  const pages = await getPublicPages();
  return pages.find((page) => page.is_homepage) ?? defaultPages[0];
}

export async function getPageBySlug(slug: string) {
  const pages = await getPublicPages();
  return pages.find((page) => page.slug === slug) ?? null;
}

export async function getEditablePages() {
  const client = getSupabaseServerClient();
  const siteKey = getCurrentSiteKey();

  if (!client) {
    return getDefaultPages(siteKey);
  }

  const { data } = await client
    .from("pages")
    .select("*")
    .eq("site_key", siteKey)
    .order("nav_order", { ascending: true });

  const rows = (data as PageRecord[] | null) ?? [];
  return mergePagesWithDefaults(rows, siteKey);
}

export async function getPageByIdOrSlug(value: string) {
  const pages = await getEditablePages();
  return pages.find((page) => page.id === value || page.slug === value) ?? null;
}

export async function savePage(formData: FormData) {
  const parsed = pageSchema.parse({
    id: String(formData.get("id") || ""),
    slug: String(formData.get("slug") || ""),
    title: String(formData.get("title") || ""),
    excerpt: String(formData.get("excerpt") || ""),
    body: String(formData.get("body") || ""),
    isHomePage: formData.get("is_homepage") === "on",
    isPublished: formData.get("is_published") === "on",
    showInNav: formData.get("show_in_nav") === "on",
  });

  const client = getSupabaseServerClientOrThrow();
  const siteKey = getCurrentSiteKey();
  const defaultPage = getDefaultPages(siteKey).find(
    (page) => page.slug === parsed.slug,
  );
  let id = isUuid(parsed.id || "") ? parsed.id : "";

  if (!id) {
    const { data } = await client
      .from("pages")
      .select("id")
      .eq("site_key", siteKey)
      .eq("slug", parsed.slug)
      .maybeSingle();

    id = data?.id ?? crypto.randomUUID();
  }

  const { error } = await client.from("pages").upsert({
    id,
    site_key: siteKey,
    slug: parsed.slug,
    title: parsed.title,
    page_type: "static",
    excerpt: parsed.excerpt || null,
    body: parsed.body,
    is_homepage: parsed.isHomePage ?? false,
    is_published: parsed.isPublished ?? false,
    show_in_nav: parsed.showInNav ?? false,
    nav_order: defaultPage?.nav_order ?? 0,
  });

  assertSupabaseWrite(error, "Kunne ikke lagre side");

  revalidatePath("/");
  revalidatePath("/om-oss");
  revalidatePath("/kontakt");
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}
