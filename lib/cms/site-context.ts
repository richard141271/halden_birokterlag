import { headers } from "next/headers";
import { getAdminSession } from "@/lib/auth/session";
import { env } from "@/lib/config/env";
import { siteRegistry } from "@/lib/config/sites";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { OrganizationRecord } from "@/types/cms";

const defaultEnabledModules = ["news", "events", "documents", "gallery"];

const fallbackOrganizations: Record<
  string,
  Pick<
    OrganizationRecord,
    | "id"
    | "name"
    | "slug"
    | "domain"
    | "subdomain"
    | "logo_url"
    | "favicon_url"
    | "description"
    | "contact_email"
    | "contact_phone"
    | "address"
    | "website"
    | "subscription_type"
    | "active"
    | "primary_color"
    | "secondary_color"
    | "header_name"
    | "admin_panel_name"
    | "enabled_modules"
  >
> = {
  default: {
    id: "org-default",
    name: "LEK-Systemet™ CMS",
    slug: "default",
    domain: null,
    subdomain: "default",
    logo_url: null,
    favicon_url: null,
    description: "Standardorganisasjon for LEK-Systemet™ CMS.",
    contact_email: null,
    contact_phone: null,
    address: null,
    website: null,
    subscription_type: "partner",
    active: true,
    primary_color: "#0f172a",
    secondary_color: "#e2e8f0",
    header_name: "LEK-Systemet™ CMS",
    admin_panel_name: "LEK-Systemet™ CMS",
    enabled_modules: defaultEnabledModules,
  },
  halden: {
    id: "org-halden",
    name: "Halden Birøkterlag",
    slug: "halden",
    domain: "haldenbi.no",
    subdomain: "halden",
    logo_url: null,
    favicon_url: null,
    description: "Halden Birøkterlag",
    contact_email: null,
    contact_phone: null,
    address: null,
    website: "https://haldenbi.no",
    subscription_type: "standard",
    active: true,
    primary_color: "#0f172a",
    secondary_color: "#e2e8f0",
    header_name: "Halden Birøkterlag",
    admin_panel_name: "Halden Birøkterlag CMS",
    enabled_modules: defaultEnabledModules,
  },
  fredrikstad: {
    id: "org-fredrikstad",
    name: "Fredrikstad Birøkterlag",
    slug: "fredrikstad",
    domain: "fredrikstadbirokterlag.no",
    subdomain: "fredrikstad",
    logo_url: null,
    favicon_url: null,
    description: "Fredrikstad Birøkterlag",
    contact_email: null,
    contact_phone: null,
    address: null,
    website: "https://fredrikstadbirokterlag.no",
    subscription_type: "standard",
    active: true,
    primary_color: "#0f172a",
    secondary_color: "#e2e8f0",
    header_name: "Fredrikstad Birøkterlag",
    admin_panel_name: "Fredrikstad Birøkterlag CMS",
    enabled_modules: defaultEnabledModules,
  },
  sarpsborg: {
    id: "org-sarpsborg",
    name: "Sarpsborg Birøkterlag",
    slug: "sarpsborg",
    domain: "sarpsborgbirokterlag.no",
    subdomain: "sarpsborg",
    logo_url: null,
    favicon_url: null,
    description: "Sarpsborg Birøkterlag",
    contact_email: null,
    contact_phone: null,
    address: null,
    website: "https://sarpsborgbirokterlag.no",
    subscription_type: "standard",
    active: true,
    primary_color: "#0f172a",
    secondary_color: "#e2e8f0",
    header_name: "Sarpsborg Birøkterlag",
    admin_panel_name: "Sarpsborg Birøkterlag CMS",
    enabled_modules: defaultEnabledModules,
  },
};

function normalizeOrganizationRecord(
  record: Partial<OrganizationRecord> & { id: string; name: string; slug: string },
): OrganizationRecord {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    domain: record.domain ?? null,
    subdomain: record.subdomain ?? null,
    logo_url: record.logo_url ?? null,
    favicon_url: record.favicon_url ?? null,
    description: record.description ?? null,
    contact_email: record.contact_email ?? null,
    contact_phone: record.contact_phone ?? null,
    address: record.address ?? null,
    website: record.website ?? null,
    subscription_type: record.subscription_type ?? "standard",
    active: record.active ?? true,
    primary_color: record.primary_color ?? "#0f172a",
    secondary_color: record.secondary_color ?? "#e2e8f0",
    header_name: record.header_name ?? record.name,
    admin_panel_name: record.admin_panel_name ?? `${record.name} CMS`,
    enabled_modules:
      record.enabled_modules && record.enabled_modules.length
        ? record.enabled_modules
        : defaultEnabledModules,
    created_at: record.created_at ?? new Date(0).toISOString(),
    updated_at: record.updated_at ?? new Date(0).toISOString(),
    admin_count: record.admin_count,
    news_count: record.news_count,
    event_count: record.event_count,
    document_count: record.document_count,
    image_count: record.image_count,
    last_activity_at: record.last_activity_at ?? null,
    resolved_hostname: record.resolved_hostname ?? null,
  };
}

function createFallbackOrganization(slug: string): OrganizationRecord {
  return normalizeOrganizationRecord(
    fallbackOrganizations[slug] ?? fallbackOrganizations.default,
  );
}

async function getHostCandidates() {
  const headerStore = await headers();
  const host = (headerStore.get("x-forwarded-host") || headerStore.get("host") || "")
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/^www\./, "")
    .split(":")[0];

  return [host, host.replace(/^www\./, "")].filter(Boolean);
}

function getSubdomainFromHost(host: string) {
  const baseDomain = env.platformBaseDomain.toLowerCase();
  if (!host.endsWith(`.${baseDomain}`)) {
    return null;
  }

  const subdomain = host.slice(0, -(baseDomain.length + 1));
  return subdomain || null;
}

async function getOrganizationFromDatabase() {
  const client = getSupabaseServerClient();
  if (!client) {
    return null;
  }

  const session = await getAdminSession();
  if (session?.organizationId) {
    const { data } = await client
      .from("organizations")
      .select("*")
      .eq("id", session.organizationId)
      .eq("active", true)
      .maybeSingle();

    return data
      ? normalizeOrganizationRecord(data as Partial<OrganizationRecord> & {
          id: string;
          name: string;
          slug: string;
        })
      : null;
  }

  const hostCandidates = await getHostCandidates();
  for (const host of hostCandidates) {
    const exactDomainQuery = client
      .from("organizations")
      .select("*")
      .eq("domain", host)
      .eq("active", true)
      .maybeSingle();
    const subdomain = getSubdomainFromHost(host);
    const subdomainQuery = subdomain
      ? client
          .from("organizations")
          .select("*")
          .eq("subdomain", subdomain)
          .eq("active", true)
          .maybeSingle()
      : Promise.resolve({ data: null });

    const [{ data: exactDomain }, { data: subdomainMatch }] = await Promise.all([
      exactDomainQuery,
      subdomainQuery,
    ]);

    const match = exactDomain || subdomainMatch;
    if (match) {
      return normalizeOrganizationRecord({
        ...(match as Partial<OrganizationRecord> & {
          id: string;
          name: string;
          slug: string;
        }),
        resolved_hostname: host,
      });
    }
  }

  const { data } = await client
    .from("organizations")
    .select("*")
    .eq("slug", env.siteKey)
    .eq("active", true)
    .maybeSingle();

  return data
    ? normalizeOrganizationRecord(data as Partial<OrganizationRecord> & {
        id: string;
        name: string;
        slug: string;
      })
    : null;
}

export async function getCurrentOrganization() {
  return (await getOrganizationFromDatabase()) ?? createFallbackOrganization(env.siteKey);
}

export async function getCurrentOrganizationId() {
  return (await getCurrentOrganization()).id;
}

export async function getCurrentSiteKey() {
  return (await getCurrentOrganization()).slug;
}

export async function getCurrentSite() {
  const siteKey = (await getCurrentSiteKey()) as keyof typeof siteRegistry;
  return siteRegistry[siteKey] ?? siteRegistry.default;
}

export async function getAllOrganizations() {
  const client = getSupabaseServerClient();
  if (!client) {
    return Object.keys(fallbackOrganizations).map((slug) =>
      createFallbackOrganization(slug),
    );
  }

  const { data } = await client
    .from("organizations")
    .select("*")
    .order("name", { ascending: true });

  return (
    (data as Array<
      Partial<OrganizationRecord> & { id: string; name: string; slug: string }
    > | null) ?? []
  ).map((organization) => normalizeOrganizationRecord(organization));
}
