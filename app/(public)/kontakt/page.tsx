import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPageBySlug } from "@/features/pages/server";
import { getPublicSettings } from "@/features/settings/server";

export default async function ContactPage() {
  const [page, settings] = await Promise.all([
    getPageBySlug("kontakt"),
    getPublicSettings(),
  ]);

  if (!page) {
    notFound();
  }

  return (
    <>
      <PageHero title={page.title} description={page.excerpt || ""} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="prose max-w-none p-8 text-slate-700">
            <p>{page.body}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Kontaktinformasjon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>E-post: {settings.contact_email}</p>
            <p>Telefon: {settings.phone}</p>
            <p>Adresse: {settings.address}</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
