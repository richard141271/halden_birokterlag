import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LEK-Systemet™ CMS",
  description:
    "Modulært og gjenbrukbart CMS bygget med Next.js, Supabase og Vercel.",
};

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
