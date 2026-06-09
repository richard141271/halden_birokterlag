import Link from "next/link";
import { getCurrentSite } from "@/lib/cms/site-context";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Forside" },
  { href: "/om-oss", label: "Om oss" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/nyheter", label: "Nyheter" },
  { href: "/arrangementer", label: "Arrangementer" },
  { href: "/dokumenter", label: "Dokumenter" },
  { href: "/galleri", label: "Galleri" },
];

export function SiteHeader() {
  const site = getCurrentSite();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <Link href="/" className="text-lg font-semibold text-slate-950">
            {site.name}
          </Link>
          <p className="text-sm text-slate-500">KIAS CMS</p>
        </div>
        <nav className="hidden items-center gap-5 text-sm text-slate-600 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-slate-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button asChild size="sm">
          <Link href="/admin">Admin</Link>
        </Button>
      </div>
    </header>
  );
}
