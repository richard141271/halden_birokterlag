import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminDocuments } from "@/features/documents/server";
import { getAdminEvents } from "@/features/events/server";
import { getAdminGalleryData } from "@/features/gallery/server";
import { getAdminNews } from "@/features/news/server";
import { getEditablePages } from "@/features/pages/server";

export default async function AdminDashboardPage() {
  const [news, events, pages, docs, gallery] = await Promise.all([
    getAdminNews(),
    getAdminEvents(),
    getEditablePages(),
    getAdminDocuments(),
    getAdminGalleryData(),
  ]);

  const stats = [
    { label: "Nyheter", value: news.length },
    { label: "Arrangementer", value: events.length },
    { label: "Sider", value: pages.length },
    { label: "Dokumenter", value: docs.length },
    { label: "Album", value: gallery.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Adminoversikt</h1>
        <p className="mt-2 text-slate-600">
          Herfra administrerer du innhold, media og globale innstillinger.
        </p>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-slate-950">
              {stat.value}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
