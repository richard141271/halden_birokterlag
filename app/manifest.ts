import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LEK-Systemet™ CMS",
    short_name: "LEK",
    description: "Modulært CMS med Next.js, Supabase og Vercel.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7fb",
    theme_color: "#111827",
    icons: [],
  };
}
