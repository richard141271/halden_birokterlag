import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getNewsById, saveNews } from "@/features/news/server";

export default async function AdminEditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getNewsById(id);

  if (!item) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rediger nyhet</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={saveNews} className="space-y-4">
          <input type="hidden" name="id" value={item.id} />
          <div className="space-y-2">
            <Label htmlFor="title">Tittel</Label>
            <Input id="title" name="title" defaultValue={item.title} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Kort ingress</Label>
            <Textarea
              id="summary"
              name="summary"
              className="min-h-24"
              defaultValue={item.summary || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Innhold</Label>
            <Textarea id="body" name="body" defaultValue={item.body} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author_name">Forfatter</Label>
            <Input
              id="author_name"
              name="author_name"
              defaultValue={item.author_name}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={item.is_published}
            />
            Publisert
          </label>
          <Button type="submit">Oppdater nyhet</Button>
        </form>
      </CardContent>
    </Card>
  );
}
