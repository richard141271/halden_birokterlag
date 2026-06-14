import { Button } from "@/components/ui/button";
import { OrganizationField } from "@/components/admin/organization-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAdminSettings, saveSettings } from "@/features/settings/server";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();

  return (
    <form action={saveSettings} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organisasjon</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganizationField />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Globale innstillinger</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
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
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="footer_tagline">Tekst i footer</Label>
            <Input
              id="footer_tagline"
              name="footer_tagline"
              defaultValue={settings.footer_tagline || ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Toppbokser</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="hero_bg_color">Bakgrunnsfarge</Label>
            <Input
              id="hero_bg_color"
              name="hero_bg_color"
              type="color"
              defaultValue={settings.hero_bg_color || "#0f172a"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_text_color">Tekstfarge</Label>
            <Input
              id="hero_text_color"
              name="hero_text_color"
              type="color"
              defaultValue={settings.hero_text_color || "#ffffff"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_muted_text_color">Ingressfarge</Label>
            <Input
              id="hero_muted_text_color"
              name="hero_muted_text_color"
              type="color"
              defaultValue={settings.hero_muted_text_color || "#cbd5e1"}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Forsidebokser</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          {[1, 2, 3].map((number) => (
            <div key={number} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`homepage_card_${number}_title`}>
                  Boks {number} tittel
                </Label>
                <Input
                  id={`homepage_card_${number}_title`}
                  name={`homepage_card_${number}_title`}
                  defaultValue={
                    settings[
                      `homepage_card_${number}_title` as keyof typeof settings
                    ] || ""
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`homepage_card_${number}_body`}>
                  Boks {number} tekst
                </Label>
                <Textarea
                  id={`homepage_card_${number}_body`}
                  name={`homepage_card_${number}_body`}
                  className="min-h-24"
                  defaultValue={
                    settings[
                      `homepage_card_${number}_body` as keyof typeof settings
                    ] || ""
                  }
                />
              </div>
            </div>
          ))}
          <div>
            <Button type="submit">Lagre innstillinger</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
