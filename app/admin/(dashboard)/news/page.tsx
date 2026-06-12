import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteNews, getAdminNews } from "@/features/news/server";

export default async function AdminNewsPage() {
  const news = await getAdminNews();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Nyheter</h1>
          <p className="mt-2 text-slate-600">Opprett, rediger og slett nyheter.</p>
        </div>
        <Link
          href="/admin/news/new"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Ny nyhet
        </Link>
      </div>

      <div className="grid gap-4">
        {news.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <p>{item.summary}</p>
              <div className="flex gap-2">
                <Link
                  href={`/admin/news/${item.id}`}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Rediger
                </Link>
                <form action={deleteNews}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-red-600 px-3 text-sm font-semibold text-white transition hover:bg-red-500"
                  >
                    Slett
                  </button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
