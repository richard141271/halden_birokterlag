import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminDocuments } from "@/features/documents/server";
import { getAdminEvents } from "@/features/events/server";
import { getAdminGalleryData } from "@/features/gallery/server";
import { getAdminNews } from "@/features/news/server";
import { getCurrentOrganizationDashboard } from "@/features/organizations/server";
import { getEditablePages } from "@/features/pages/server";

export default async function AdminDashboardPage() {
  const [news, events, pages, docs, gallery, organization] = await Promise.all([
    getAdminNews(),
    getAdminEvents(),
    getEditablePages(),
    getAdminDocuments(),
    getAdminGalleryData(),
    getCurrentOrganizationDashboard(),
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
      <Card>
        <CardHeader>
          <CardTitle>{organization.admin_panel_name || `${organization.name} CMS`}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div>
            <p className="text-sm text-slate-500">Abonnement</p>
            <p className="text-lg font-semibold text-slate-950">
              {organization.subscription_type}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Administratorer</p>
            <p className="text-lg font-semibold text-slate-950">
              {organization.admin_count ?? 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Dokumenter</p>
            <p className="text-lg font-semibold text-slate-950">
              {organization.document_count ?? docs.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Bilder</p>
            <p className="text-lg font-semibold text-slate-950">
              {organization.image_count ?? gallery.flatMap((album) => album.images).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Host</p>
            <p className="text-lg font-semibold text-slate-950">
              {organization.domain || `${organization.subdomain}.biroktercms.no`}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Sist aktivitet</p>
            <p className="text-lg font-semibold text-slate-950">
              {organization.last_activity_at
                ? new Date(organization.last_activity_at).toLocaleDateString("nb-NO")
                : "Ingen aktivitet"}
            </p>
          </div>
        </CardContent>
      </Card>
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
