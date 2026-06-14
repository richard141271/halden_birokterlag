"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { getAdminSession, hashAdminPassword } from "@/lib/auth/session";
import {
  getAllOrganizations,
  getCurrentOrganization,
  getCurrentOrganizationId,
} from "@/lib/cms/site-context";
import {
  assertSupabaseWrite,
  getSupabaseServerClient,
  getSupabaseServerClientOrThrow,
} from "@/lib/supabase/server";
import { isUuid, slugify } from "@/lib/utils";
import type { OrganizationRecord } from "@/types/cms";

const defaultEnabledModules = ["news", "events", "documents", "gallery"];
const subscriptionTypes = ["free", "standard", "premium", "partner"] as const;

const organizationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  domain: z.string().optional(),
  subdomain: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  description: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  subscriptionType: z.enum(subscriptionTypes).optional(),
  active: z.boolean().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  headerName: z.string().optional(),
  adminPanelName: z.string().optional(),
  enabledModules: z.array(z.string()).optional(),
  adminUsername: z.string().optional(),
  adminPassword: z.string().optional(),
  adminDisplayName: z.string().optional(),
});

export async function getOrganizationOptions() {
  const organizations = await getAllOrganizations();
  return organizations.filter((organization) => organization.active);
}

function getEnabledModulesFromFormData(formData: FormData) {
  const values = formData
    .getAll("enabled_modules")
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return values.length ? values : defaultEnabledModules;
}

async function getLastActivityAt(client: ReturnType<typeof getSupabaseServerClientOrThrow>, organizationId: string) {
  const recentQueries = [
    client
      .from("news")
      .select("updated_at")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false })
      .limit(1),
    client
      .from("events")
      .select("updated_at")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false })
      .limit(1),
    client
      .from("documents")
      .select("updated_at")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false })
      .limit(1),
    client
      .from("images")
      .select("updated_at")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false })
      .limit(1),
    client
      .from("pages")
      .select("updated_at")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false })
      .limit(1),
    client
      .from("admin_users")
      .select("updated_at")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false })
      .limit(1),
  ];

  const results = await Promise.all(recentQueries);
  const timestamps = results
    .flatMap((result) => (result.data ?? []).map((row) => row.updated_at))
    .filter(Boolean)
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));

  if (!timestamps.length) {
    return null;
  }

  return new Date(Math.max(...timestamps)).toISOString();
}

async function enrichOrganizationsWithStats(
  organizations: OrganizationRecord[],
  client: ReturnType<typeof getSupabaseServerClient> | ReturnType<typeof getSupabaseServerClientOrThrow> | null,
) {
  if (!client) {
    return organizations.map((organization) => ({
      ...organization,
      admin_count: 0,
      news_count: 0,
      event_count: 0,
      document_count: 0,
      image_count: 0,
      last_activity_at: null,
    }));
  }

  return Promise.all(
    organizations.map(async (organization) => {
      const [
        { count: adminCount },
        { count: newsCount },
        { count: eventCount },
        { count: documentCount },
        { count: imageCount },
        lastActivityAt,
      ] = await Promise.all([
        client
          .from("admin_users")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", organization.id),
        client
          .from("news")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", organization.id),
        client
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", organization.id),
        client
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", organization.id),
        client
          .from("images")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", organization.id),
        getLastActivityAt(client as ReturnType<typeof getSupabaseServerClientOrThrow>, organization.id),
      ]);

      return {
        ...organization,
        admin_count: adminCount ?? 0,
        news_count: newsCount ?? 0,
        event_count: eventCount ?? 0,
        document_count: documentCount ?? 0,
        image_count: imageCount ?? 0,
        last_activity_at: lastActivityAt,
      };
    }),
  );
}

export async function getOrganizationsForAdmin() {
  await requireSuperAdmin();

  const client = getSupabaseServerClient();
  const organizations = await getAllOrganizations();
  return enrichOrganizationsWithStats(organizations, client);
}

export async function getOrganizationBranding() {
  const organization = await getCurrentOrganization();
  return {
    name: organization.header_name || organization.name,
    adminName: organization.admin_panel_name || `${organization.name} CMS`,
    logoUrl: organization.logo_url,
    faviconUrl: organization.favicon_url,
    primaryColor: organization.primary_color || "#0f172a",
    secondaryColor: organization.secondary_color || "#e2e8f0",
    subscriptionType: organization.subscription_type,
    enabledModules: organization.enabled_modules,
  };
}

export async function getCurrentOrganizationDashboard() {
  const organization = await getCurrentOrganization();
  const client = getSupabaseServerClient();
  const [dashboard] = await enrichOrganizationsWithStats([organization], client);
  return dashboard;
}

export async function resolveOrganizationIdForWrite(requestedOrganizationId?: string) {
  const session = await getAdminSession();

  if (session?.role === "superadmin") {
    if (isUuid(requestedOrganizationId || "")) {
      return requestedOrganizationId as string;
    }

    return getCurrentOrganizationId();
  }

  if (isUuid(session?.organizationId || "")) {
    return session?.organizationId as string;
  }

  return getCurrentOrganizationId();
}

export async function resolveOrganizationWriteTarget(requestedOrganizationId?: string) {
  const organizationId = await resolveOrganizationIdForWrite(requestedOrganizationId);
  const organization = await getOrganizationById(organizationId);

  if (!organization) {
    throw new Error("Kunne ikke finne valgt organisasjon.");
  }

  return {
    organizationId: organization.id,
    siteKey: organization.slug,
    organization,
  };
}

export async function saveOrganization(formData: FormData) {
  await requireSuperAdmin();

  const parsed = organizationSchema.parse({
    id: String(formData.get("id") || ""),
    name: String(formData.get("name") || ""),
    slug: String(formData.get("slug") || ""),
    domain: String(formData.get("domain") || ""),
    subdomain: String(formData.get("subdomain") || ""),
    logoUrl: String(formData.get("logo_url") || ""),
    faviconUrl: String(formData.get("favicon_url") || ""),
    description: String(formData.get("description") || ""),
    contactEmail: String(formData.get("contact_email") || ""),
    contactPhone: String(formData.get("contact_phone") || ""),
    address: String(formData.get("address") || ""),
    website: String(formData.get("website") || ""),
    subscriptionType:
      (String(formData.get("subscription_type") || "standard") as
        | (typeof subscriptionTypes)[number]
        | "") || "standard",
    active: formData.get("active") === "on",
    primaryColor: String(formData.get("primary_color") || ""),
    secondaryColor: String(formData.get("secondary_color") || ""),
    headerName: String(formData.get("header_name") || ""),
    adminPanelName: String(formData.get("admin_panel_name") || ""),
    enabledModules: getEnabledModulesFromFormData(formData),
    adminUsername: String(formData.get("admin_username") || ""),
    adminPassword: String(formData.get("admin_password") || ""),
    adminDisplayName: String(formData.get("admin_display_name") || ""),
  });

  const client = getSupabaseServerClientOrThrow();
  const organizationId = isUuid(parsed.id || "") ? parsed.id : crypto.randomUUID();
  const slug = slugify(parsed.slug || parsed.name);

  const { error } = await client.from("organizations").upsert({
    id: organizationId,
    name: parsed.name,
    slug,
    domain: parsed.domain || null,
    subdomain: parsed.subdomain ? slugify(parsed.subdomain) : slug,
    logo_url: parsed.logoUrl || null,
    favicon_url: parsed.faviconUrl || null,
    description: parsed.description || null,
    contact_email: parsed.contactEmail || null,
    contact_phone: parsed.contactPhone || null,
    address: parsed.address || null,
    website: parsed.website || null,
    subscription_type: parsed.subscriptionType || "standard",
    active: parsed.active ?? false,
    primary_color: parsed.primaryColor || "#0f172a",
    secondary_color: parsed.secondaryColor || "#e2e8f0",
    header_name: parsed.headerName || parsed.name,
    admin_panel_name: parsed.adminPanelName || `${parsed.name} CMS`,
    enabled_modules: parsed.enabledModules || defaultEnabledModules,
  });

  assertSupabaseWrite(error, "Kunne ikke lagre organisasjon");

  if (parsed.adminUsername && parsed.adminPassword) {
    const passwordHash = hashAdminPassword(parsed.adminPassword);
    const { error: adminError } = await client.from("admin_users").upsert(
      {
        organization_id: organizationId,
        username: parsed.adminUsername,
        display_name: parsed.adminDisplayName || parsed.name,
        password_hash: passwordHash,
        role: "organization_admin",
        is_active: true,
      },
      { onConflict: "username" },
    );

    assertSupabaseWrite(adminError, "Kunne ikke lagre organisasjonsadministrator");
  }

  revalidatePath("/admin/organizations");
  redirect("/admin/organizations");
}

export async function toggleOrganizationStatus(formData: FormData) {
  await requireSuperAdmin();

  const id = String(formData.get("id") || "");
  const active = formData.get("active") === "true";

  if (!isUuid(id)) {
    throw new Error("Ugyldig organisasjons-ID.");
  }

  const client = getSupabaseServerClientOrThrow();
  const { error } = await client
    .from("organizations")
    .update({ active: !active })
    .eq("id", id);

  assertSupabaseWrite(error, "Kunne ikke oppdatere organisasjon");

  revalidatePath("/admin/organizations");
  redirect("/admin/organizations");
}

export async function getOrganizationById(id: string) {
  const organizations = await getAllOrganizations();
  return organizations.find((organization) => organization.id === id) ?? null;
}
