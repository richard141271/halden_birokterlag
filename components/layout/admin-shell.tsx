import Link from "next/link";
import { redirect } from "next/navigation";
import { clearAdminSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/admin", label: "Oversikt" },
  { href: "/admin/news", label: "Nyheter" },
  { href: "/admin/events", label: "Arrangementer" },
  { href: "/admin/pages", label: "Sider" },
  { href: "/admin/documents", label: "Dokumenter" },
  { href: "/admin/gallery", label: "Galleri" },
  { href: "/admin/settings", label: "Innstillinger" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  async function logout() {
    "use server";

    await clearAdminSession();
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="rounded-3xl bg-slate-950 p-5 text-white">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              LEK-Systemet™ CMS
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Admin</h2>
          </div>
          <nav className="space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logout} className="mt-8">
            <Button
              type="submit"
              variant="outline"
              className="force-white-text w-full border-white/20 bg-transparent hover:bg-white/10 hover:text-white"
              style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
            >
              Logg ut
            </Button>
          </form>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
