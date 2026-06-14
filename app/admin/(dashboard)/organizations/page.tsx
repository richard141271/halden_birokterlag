import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getOrganizationsForAdmin,
  saveOrganization,
  toggleOrganizationStatus,
} from "@/features/organizations/server";

const moduleOptions = [
  "news",
  "events",
  "documents",
  "gallery",
  "lek",
  "varroascan",
  "kursportal",
  "medlemsregister",
  "forum",
  "nettbutikk",
];

const subscriptionOptions = ["free", "standard", "premium", "partner"];

export default async function AdminOrganizationsPage() {
  const organizations = await getOrganizationsForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Organisasjoner</h1>
        <p className="mt-2 text-slate-600">
          Opprett og administrer organisasjoner i samme LEK-Systemet-plattform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opprett organisasjon</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveOrganization} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Navn</Label>
              <Input id="name" name="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" placeholder="halden" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domene</Label>
              <Input id="domain" name="domain" placeholder="haldenbi.no" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomene</Label>
              <Input id="subdomain" name="subdomain" placeholder="halden" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo-URL</Label>
              <Input id="logo_url" name="logo_url" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="favicon_url">Favicon-URL</Label>
              <Input id="favicon_url" name="favicon_url" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Kontakt-e-post</Label>
              <Input id="contact_email" name="contact_email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Telefon</Label>
              <Input id="contact_phone" name="contact_phone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Nettside</Label>
              <Input id="website" name="website" placeholder="https://haldenbi.no" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscription_type">Abonnement</Label>
              <select
                id="subscription_type"
                name="subscription_type"
                className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
                defaultValue="standard"
              >
                {subscriptionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" name="address" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Beskrivelse</Label>
              <Textarea id="description" name="description" className="min-h-24" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="header_name">Navn i topptekst</Label>
              <Input id="header_name" name="header_name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_panel_name">Navn i adminpanel</Label>
              <Input id="admin_panel_name" name="admin_panel_name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary_color">Hovedfarge</Label>
              <Input id="primary_color" name="primary_color" type="color" defaultValue="#0f172a" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary_color">Sekundaerfarge</Label>
              <Input id="secondary_color" name="secondary_color" type="color" defaultValue="#e2e8f0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_display_name">Admin-navn</Label>
              <Input id="admin_display_name" name="admin_display_name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_username">Admin-brukernavn</Label>
              <Input id="admin_username" name="admin_username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_password">Admin-passord</Label>
              <Input id="admin_password" name="admin_password" type="password" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Aktiverte moduler</Label>
              <div className="grid gap-2 rounded-xl border border-slate-200 p-4 md:grid-cols-2">
                {moduleOptions.map((module) => (
                  <label key={module} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      name="enabled_modules"
                      value={module}
                      defaultChecked={["news", "events", "documents", "gallery"].includes(module)}
                    />
                    {module}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 self-end text-sm text-slate-700">
              <input type="checkbox" name="active" defaultChecked />
              Aktiv organisasjon
            </label>
            <div className="md:col-span-2">
              <Button type="submit">Lagre organisasjon</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {organizations.map((organization) => (
          <Card key={organization.id}>
            <CardHeader>
              <CardTitle>{organization.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={saveOrganization} className="grid gap-4 md:grid-cols-2">
                <input type="hidden" name="id" value={organization.id} />
                <div className="space-y-2">
                  <Label htmlFor={`name-${organization.id}`}>Navn</Label>
                  <Input
                    id={`name-${organization.id}`}
                    name="name"
                    defaultValue={organization.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`slug-${organization.id}`}>Slug</Label>
                  <Input
                    id={`slug-${organization.id}`}
                    name="slug"
                    defaultValue={organization.slug}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`domain-${organization.id}`}>Domene</Label>
                  <Input
                    id={`domain-${organization.id}`}
                    name="domain"
                    defaultValue={organization.domain || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`subdomain-${organization.id}`}>Subdomene</Label>
                  <Input
                    id={`subdomain-${organization.id}`}
                    name="subdomain"
                    defaultValue={organization.subdomain || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`logo-${organization.id}`}>Logo-URL</Label>
                  <Input
                    id={`logo-${organization.id}`}
                    name="logo_url"
                    defaultValue={organization.logo_url || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`favicon-${organization.id}`}>Favicon-URL</Label>
                  <Input
                    id={`favicon-${organization.id}`}
                    name="favicon_url"
                    defaultValue={organization.favicon_url || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`email-${organization.id}`}>Kontakt-e-post</Label>
                  <Input
                    id={`email-${organization.id}`}
                    name="contact_email"
                    defaultValue={organization.contact_email || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`phone-${organization.id}`}>Telefon</Label>
                  <Input
                    id={`phone-${organization.id}`}
                    name="contact_phone"
                    defaultValue={organization.contact_phone || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`website-${organization.id}`}>Nettside</Label>
                  <Input
                    id={`website-${organization.id}`}
                    name="website"
                    defaultValue={organization.website || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`subscription-${organization.id}`}>Abonnement</Label>
                  <select
                    id={`subscription-${organization.id}`}
                    name="subscription_type"
                    className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
                    defaultValue={organization.subscription_type}
                  >
                    {subscriptionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`address-${organization.id}`}>Adresse</Label>
                  <Input
                    id={`address-${organization.id}`}
                    name="address"
                    defaultValue={organization.address || ""}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`description-${organization.id}`}>Beskrivelse</Label>
                  <Textarea
                    id={`description-${organization.id}`}
                    name="description"
                    className="min-h-24"
                    defaultValue={organization.description || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`header-name-${organization.id}`}>Navn i topptekst</Label>
                  <Input
                    id={`header-name-${organization.id}`}
                    name="header_name"
                    defaultValue={organization.header_name || organization.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`admin-name-${organization.id}`}>Navn i adminpanel</Label>
                  <Input
                    id={`admin-name-${organization.id}`}
                    name="admin_panel_name"
                    defaultValue={
                      organization.admin_panel_name || `${organization.name} CMS`
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`primary-${organization.id}`}>Hovedfarge</Label>
                  <Input
                    id={`primary-${organization.id}`}
                    name="primary_color"
                    type="color"
                    defaultValue={organization.primary_color || "#0f172a"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`secondary-${organization.id}`}>Sekundaerfarge</Label>
                  <Input
                    id={`secondary-${organization.id}`}
                    name="secondary_color"
                    type="color"
                    defaultValue={organization.secondary_color || "#e2e8f0"}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Aktiverte moduler</Label>
                  <div className="grid gap-2 rounded-xl border border-slate-200 p-4 md:grid-cols-2">
                    {moduleOptions.map((module) => (
                      <label
                        key={`${organization.id}-${module}`}
                        className="flex items-center gap-2 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          name="enabled_modules"
                          value={module}
                          defaultChecked={organization.enabled_modules.includes(module)}
                        />
                        {module}
                      </label>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={organization.active}
                  />
                  Aktiv
                </label>
                <div className="grid gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p>Abonnement: {organization.subscription_type}</p>
                  <p>Adminer: {organization.admin_count ?? 0}</p>
                  <p>Nyheter: {organization.news_count ?? 0}</p>
                  <p>Arrangementer: {organization.event_count ?? 0}</p>
                  <p>Dokumenter: {organization.document_count ?? 0}</p>
                  <p>Bilder: {organization.image_count ?? 0}</p>
                  <p>
                    Sist aktivitet:{" "}
                    {organization.last_activity_at
                      ? new Date(organization.last_activity_at).toLocaleString("nb-NO")
                      : "Ingen aktivitet"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 md:col-span-2">
                  <Button type="submit" size="sm">
                    Lagre organisasjon
                  </Button>
                  <input type="hidden" name="active" value={String(organization.active)} />
                  <Button type="submit" formAction={toggleOrganizationStatus} variant="outline" size="sm">
                    {organization.active ? "Deaktiver" : "Aktiver"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
