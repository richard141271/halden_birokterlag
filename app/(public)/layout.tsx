import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="mx-auto flex min-h-[calc(100vh-144px)] max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
