import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>
          KIAS CMS er laget for gjenbrukbare organisasjonsnettsteder med
          Supabase som datalag.
        </p>
        <div className="flex gap-4">
          <Link href="/kontakt">Kontakt</Link>
          <Link href="/admin">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
