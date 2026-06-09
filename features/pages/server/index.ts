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
    body: "Velkommen til KIAS CMS. Dette er et fleksibelt og modulært utgangspunkt for innholdsstyring.",
    excerpt: "Modulært CMS bygget med Next.js og Supabase.",
    seo_title: "KIAS CMS",
    seo_description: "Gjenbrukbart CMS for organisasjoner og nettsteder.",
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

export async function getPublicPages() {
  const client = getSupabaseServerClient();
  const siteKey = getCurrentSiteKey();

  if (!client) {
    return defaultPages;
  }

  const { data } = await client
    .from("pages")
    .select("*")
    .eq("site_key", siteKey)
    .eq("is_published", true)
    .order("nav_order", { ascending: true });

  return (data as PageRecord[] | null) ?? defaultPages;
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
    return defaultPages;
  }

  const { data } = await client
    .from("pages")
    .select("*")
    .eq("site_key", siteKey)
    .order("nav_order", { ascending: true });

  return (data as PageRecord[] | null) ?? defaultPages;
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
  const { error } = await client.from("pages").upsert({
    id: parsed.id || crypto.randomUUID(),
    site_key: siteKey,
    slug: parsed.slug,
    title: parsed.title,
    page_type: "static",
    excerpt: parsed.excerpt || null,
    body: parsed.body,
    is_homepage: parsed.isHomePage ?? false,
    is_published: parsed.isPublished ?? false,
    show_in_nav: parsed.showInNav ?? false,
    nav_order: 0,
  });

  assertSupabaseWrite(error, "Kunne ikke lagre side");

  revalidatePath("/");
  revalidatePath("/om-oss");
  revalidatePath("/kontakt");
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}
