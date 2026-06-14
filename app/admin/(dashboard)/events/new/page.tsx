import { Button } from "@/components/ui/button";
import { OrganizationField } from "@/components/admin/organization-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveEvent } from "@/features/events/server";

export default function AdminNewEventPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Opprett arrangement</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={saveEvent} className="space-y-4">
          <OrganizationField />
          <div className="space-y-2">
            <Label htmlFor="title">Tittel</Label>
            <Input id="title" name="title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Kort ingress</Label>
            <Textarea id="summary" name="summary" className="min-h-24" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Innhold</Label>
            <Textarea id="body" name="body" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Sted</Label>
              <Input id="location" name="location" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="starts_at">Starttid</Label>
              <Input id="starts_at" name="starts_at" type="datetime-local" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration_url">Påmeldingslenke</Label>
            <Input id="registration_url" name="registration_url" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="is_published" />
            Publiser med en gang
          </label>
          <Button type="submit">Lagre arrangement</Button>
        </form>
      </CardContent>
    </Card>
  );
}
