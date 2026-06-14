import type { MetadataRoute } from "next";
import { getCurrentOrganization } from "@/lib/cms/site-context";
import { getPublicSettings } from "@/features/settings/server";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const organization = await getCurrentOrganization();
  const settings = await getPublicSettings();

  return {
    name: settings.site_name || organization.header_name || organization.name,
    short_name: settings.site_name || organization.slug,
    description:
      organization.description || "Nyheter, arrangementer, dokumenter og informasjon.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7fb",
    theme_color: organization.primary_color || "#111827",
    icons: organization.favicon_url
      ? [
          {
            src: organization.favicon_url,
            sizes: "192x192",
            type: "image/png",
          },
        ]
      : [],
  };
}
