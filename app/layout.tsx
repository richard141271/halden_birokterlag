import type { Metadata } from "next";
import { getPublicSettings } from "@/features/settings/server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: settings.site_name || "Halden Birøkterlag",
    description:
      "Nyheter, arrangementer, dokumenter og informasjon fra nettstedet.",
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
