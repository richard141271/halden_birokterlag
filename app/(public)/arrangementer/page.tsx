import { PageHero } from "@/components/layout/page-hero";
import { EventCard } from "@/features/events/components/event-card";
import { getPublishedEvents } from "@/features/events/server";

export default async function EventsPage() {
  const events = await getPublishedEvents();

  return (
    <>
      <PageHero
        title="Arrangementer"
        description="Publiser møter, kurs, foredrag og andre aktiviteter."
      />
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {events.map((item) => (
          <EventCard key={item.id} item={item} />
        ))}
      </section>
    </>
  );
}
