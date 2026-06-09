import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p>
            KIAS CMS er laget for gjenbrukbare organisasjonsnettsteder med
            Supabase som datalag.
          </p>
          <div className="flex gap-4">
            <Link href="/kontakt">Kontakt</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Nettsidesystem levert av{" "}
            <a
              href="https://aiinnovate.no"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-slate-700 transition hover:text-slate-950"
            >
              AI Innovate AS
            </a>
            . Copyright © {year}.
          </p>
          <p>AI Innovate AS © Alle rettigheter forbeholdt.</p>
        </div>
      </div>
    </footer>
  );
}
