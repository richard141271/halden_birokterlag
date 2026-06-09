import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEditablePages } from "@/features/pages/server";

export default async function AdminPagesPage() {
  const pages = await getEditablePages();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Statiske sider</h1>
        <p className="mt-2 text-slate-600">
          Rediger forside, om oss, kontakt og andre faste sider.
        </p>
      </div>
      <div className="grid gap-4">
        {pages.map((page) => (
          <Card key={page.id}>
            <CardHeader>
              <CardTitle>{page.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm text-slate-600">
              <p>Slug: /{page.slug === "forside" ? "" : page.slug}</p>
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/pages/${page.id}`}>Rediger</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
