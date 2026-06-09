import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPageByIdOrSlug, savePage } from "@/features/pages/server";

export default async function AdminEditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await getPageByIdOrSlug(id);

  if (!page) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rediger side</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={savePage} className="space-y-4">
          <input type="hidden" name="id" value={page.id} />
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={page.slug} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Tittel</Label>
            <Input id="title" name="title" defaultValue={page.title} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Ingress</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              className="min-h-24"
              defaultValue={page.excerpt || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Innhold</Label>
            <Textarea id="body" name="body" defaultValue={page.body} />
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-700">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_homepage"
                defaultChecked={page.is_homepage}
              />
              Dette er forsiden
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_published"
                defaultChecked={page.is_published}
              />
              Publisert
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="show_in_nav"
                defaultChecked={page.show_in_nav}
              />
              Vis i meny
            </label>
          </div>
          <Button type="submit">Lagre side</Button>
        </form>
      </CardContent>
    </Card>
  );
}
