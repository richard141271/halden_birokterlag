import type { Metadata } from "next";
import { getCurrentOrganization } from "@/lib/cms/site-context";
import { getPublicSettings } from "@/features/settings/server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const organization = await getCurrentOrganization();
  const settings = await getPublicSettings();

  return {
    title: settings.site_name || organization.header_name || organization.name,
    description:
      organization.description ||
      "Nyheter, arrangementer, dokumenter og informasjon fra nettstedet.",
    icons: organization.favicon_url
      ? {
          icon: organization.favicon_url,
          shortcut: organization.favicon_url,
        }
      : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb">
      <body>{children}</body>
    </html>
  );
}
