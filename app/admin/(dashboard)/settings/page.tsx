import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminSettings, saveSettings } from "@/features/settings/server";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Globale innstillinger</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={saveSettings} className="grid gap-4 md:grid-cols-2">
          {[
            ["site_name", "Nettsidens navn"],
            ["logo", "Logo-URL"],
            ["contact_email", "Kontakt-e-post"],
            ["phone", "Telefon"],
            ["address", "Adresse"],
            ["facebook_url", "Facebook-URL"],
            ["instagram_url", "Instagram-URL"],
          ].map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                name={key}
                defaultValue={settings[key as keyof typeof settings] || ""}
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <Button type="submit">Lagre innstillinger</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
