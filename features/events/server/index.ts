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
import type { EventRecord } from "@/types/cms";

const eventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  summary: z.string().optional(),
  body: z.string().min(1),
  location: z.string().optional(),
  startsAt: z.string().min(1),
  endsAt: z.string().optional(),
  registrationUrl: z.string().optional(),
  isPublished: z.boolean().optional(),
});

const defaultEvents: EventRecord[] = [
  {
    id: "event-1",
    site_key: "default",
    organization_id: null,
    slug: "biroktkurs-for-nybegynnere",
    title: "Birøktkurs for nybegynnere",
    summary: "Introduksjonskurs for nye birøktere med praktisk og enkel gjennomgang.",
    body: "Kurset passer for deg som vil komme i gang med bier og ønsker en trygg introduksjon til birøkt.",
    location: "Kornsiloen - Halden",
    starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: null,
    all_day: false,
    registration_url: null,
    cover_image_url: null,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getPublishedEvents() {
  const client = getSupabaseServerClient();
  const organizationId = await getCurrentOrganizationId();

  if (!client) {
    return defaultEvents;
  }

  const { data } = await client
    .from("events")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_published", true)
    .order("starts_at", { ascending: true });

  const rows = (data as EventRecord[] | null) ?? [];
  return rows.length ? rows : defaultEvents;
}

export async function getEventBySlug(slug: string) {
  const events = await getPublishedEvents();
  return events.find((item) => item.slug === slug) ?? null;
}

export async function getAdminEvents() {
  const client = getSupabaseServerClient();
  const session = await getAdminSession();
  const organizationId = await getCurrentOrganizationId();

  if (!client) {
    return defaultEvents;
  }

  let query = client
    .from("events")
    .select("*, organization:organizations(name, slug)")
    .order("starts_at", { ascending: true });

  if (session?.role !== "superadmin") {
    query = query.eq("organization_id", organizationId);
  }

  const { data } = await query;

  const rows =
    ((data as Array<
      EventRecord & { organization?: { name?: string | null; slug?: string | null } | null }
    > | null) ?? []).map((item) => ({
      ...item,
      organization_name: item.organization?.name ?? null,
      organization_slug: item.organization?.slug ?? null,
    }));
  return rows.length ? rows : defaultEvents;
}

export async function getEventById(id: string) {
  const events = await getAdminEvents();
  return events.find((item) => item.id === id) ?? null;
}

export async function saveEvent(formData: FormData) {
  const parsed = eventSchema.parse({
    id: String(formData.get("id") || ""),
    title: String(formData.get("title") || ""),
    summary: String(formData.get("summary") || ""),
    body: String(formData.get("body") || ""),
    location: String(formData.get("location") || ""),
    startsAt: String(formData.get("starts_at") || ""),
    endsAt: String(formData.get("ends_at") || ""),
    registrationUrl: String(formData.get("registration_url") || ""),
    isPublished: formData.get("is_published") === "on",
  });

  const client = getSupabaseServerClientOrThrow();
  const { organizationId, siteKey } = await resolveOrganizationWriteTarget(
    String(formData.get("organization_id") || ""),
  );
  const id = isUuid(parsed.id || "") ? parsed.id : crypto.randomUUID();
  const { error } = await client.from("events").upsert({
    id,
    site_key: siteKey,
    organization_id: organizationId,
    slug: slugify(parsed.title),
    title: parsed.title,
    summary: parsed.summary || null,
    body: parsed.body,
    location: parsed.location || null,
    starts_at: parsed.startsAt,
    ends_at: parsed.endsAt || null,
    all_day: false,
    registration_url: parsed.registrationUrl || null,
    is_published: parsed.isPublished ?? false,
  });

  assertSupabaseWrite(error, "Kunne ikke lagre arrangement");

  revalidatePath("/arrangementer");
  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function deleteEvent(formData: FormData) {
  const id = String(formData.get("id") || "");
  const client = getSupabaseServerClientOrThrow();
  const session = await getAdminSession();
  const organizationId = await getCurrentOrganizationId();

  if (!isUuid(id)) {
    throw new Error("Kunne ikke slette arrangement med ugyldig ID.");
  }

  let query = client.from("events").delete().eq("id", id);
  if (session?.role !== "superadmin") {
    query = query.eq("organization_id", organizationId);
  }

  const { error } = await query;
  assertSupabaseWrite(error, "Kunne ikke slette arrangement");

  revalidatePath("/arrangementer");
  revalidatePath("/admin/events");
  redirect("/admin/events");
}
