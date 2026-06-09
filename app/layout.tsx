import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KIAS CMS",
  description: "Modulært og gjenbrukbart CMS bygget med Next.js og Supabase.",
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
