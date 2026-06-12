import type { MetadataRoute } from "next";
import { getPublicSettings } from "@/features/settings/server";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getPublicSettings();

  return {
    name: settings.site_name || "Halden Birøkterlag",
    short_name: settings.site_name || "Halden",
    description: "Nyheter, arrangementer, dokumenter og informasjon.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7fb",
    theme_color: "#111827",
    icons: [],
  };
}
