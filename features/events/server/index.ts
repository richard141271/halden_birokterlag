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
import { slugify } from "@/lib/utils";
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
    slug: "apent-medlemsmote",
    title: "Åpent medlemsmøte",
    summary: "Eksempelarrangement for å demonstrere modulstrukturen.",
    body: "Bruk denne modulen til kurs, møter, foredrag og sesongaktiviteter.",
    location: "Halden",
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
  const siteKey = getCurrentSiteKey();

  if (!client) {
    return defaultEvents;
  }

  const { data } = await client
    .from("events")
    .select("*")
    .eq("site_key", siteKey)
    .eq("is_published", true)
    .order("starts_at", { ascending: true });

  return (data as EventRecord[] | null) ?? defaultEvents;
}

export async function getEventBySlug(slug: string) {
  const events = await getPublishedEvents();
  return events.find((item) => item.slug === slug) ?? null;
}

export async function getAdminEvents() {
  const client = getSupabaseServerClient();
  const siteKey = getCurrentSiteKey();

  if (!client) {
    return defaultEvents;
  }

  const { data } = await client
    .from("events")
    .select("*")
    .eq("site_key", siteKey)
    .order("starts_at", { ascending: true });

  return (data as EventRecord[] | null) ?? defaultEvents;
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
  const siteKey = getCurrentSiteKey();
  const { error } = await client.from("events").upsert({
    id: parsed.id || crypto.randomUUID(),
    site_key: siteKey,
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

  if (id) {
    const { error } = await client.from("events").delete().eq("id", id);
    assertSupabaseWrite(error, "Kunne ikke slette arrangement");
  }

  revalidatePath("/arrangementer");
  revalidatePath("/admin/events");
  redirect("/admin/events");
}
