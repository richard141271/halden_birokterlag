import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
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

  const homepageCards = [
    {
      title: settings.homepage_card_1_title,
      body: settings.homepage_card_1_body,
    },
    {
      title: settings.homepage_card_2_title,
      body: settings.homepage_card_2_body,
    },
    {
      title: settings.homepage_card_3_title,
      body: settings.homepage_card_3_body,
    },
  ].filter((item) => item.title || item.body);

  return (
    <>
      <PageHero
        title={settings.site_name || page.title}
        description={page.excerpt || page.body}
      />

      {homepageCards.length ? (
        <section className="grid gap-6 lg:grid-cols-3">
          {homepageCards.map((item) => (
            <Card key={item.title || item.body}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                {item.body}
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      <section className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-950">Nyheter</h2>
            <Link
              href="/nyheter"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              Se alle
            </Link>
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
            <Link
              href="/arrangementer"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              Se alle
            </Link>
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
