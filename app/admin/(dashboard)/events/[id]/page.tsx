import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OrganizationField } from "@/components/admin/organization-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getEventById, saveEvent } from "@/features/events/server";

export default async function AdminEditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getEventById(id);

  if (!item) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rediger arrangement</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={saveEvent} className="space-y-4">
          <input type="hidden" name="id" value={item.id} />
          <OrganizationField value={item.organization_id} />
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Sted</Label>
              <Input
                id="location"
                name="location"
                defaultValue={item.location || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="starts_at">Starttid</Label>
              <Input
                id="starts_at"
                name="starts_at"
                type="datetime-local"
                defaultValue={item.starts_at.slice(0, 16)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration_url">Påmeldingslenke</Label>
            <Input
              id="registration_url"
              name="registration_url"
              defaultValue={item.registration_url || ""}
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
          <Button type="submit">Oppdater arrangement</Button>
        </form>
      </CardContent>
    </Card>
  );
}
