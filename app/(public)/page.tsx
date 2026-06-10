import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EventCard } from "@/features/events/components/event-card";
import { getPublishedEvents } from "@/features/events/server";
import { NewsCard } from "@/features/news/components/news-card";
import { getPublishedNews } from "@/features/news/server";
import { getHomepage } from "@/features/pages/server";
import { getPublicSettings } from "@/features/settings/server";

export default async function HomePage() {
  const [page, news, events, settings] = await Promise.all([
    getHomepage(),
    getPublishedNews(),
    getPublishedEvents(),
    getPublicSettings(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="MVP"
        title={settings.site_name || page.title}
        description={page.excerpt || page.body}
      />

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          "Modulbasert arkitektur",
          "Supabase for data og media",
          "Multisite-klar struktur",
        ].map((item) => (
          <Card key={item}>
            <CardHeader>
              <CardTitle>{item}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              LEK-Systemet™ CMS er laget for å kunne gjenbrukes på mange
              nettsteder med minimale kodeendringer.
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-950">Nyheter</h2>
            <Button asChild variant="ghost">
              <Link href="/nyheter">Se alle</Link>
            </Button>
          </div>
          <div className="grid gap-4">
            {news.slice(0, 2).map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-950">
              Arrangementer
            </h2>
            <Button asChild variant="ghost">
              <Link href="/arrangementer">Se alle</Link>
            </Button>
          </div>
          <div className="grid gap-4">
            {events.slice(0, 2).map((item) => (
              <EventCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
