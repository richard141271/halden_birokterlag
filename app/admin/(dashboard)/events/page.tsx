import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteEvent, getAdminEvents } from "@/features/events/server";

export default async function AdminEventsPage() {
  const events = await getAdminEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">
            Arrangementer
          </h1>
          <p className="mt-2 text-slate-600">
            Opprett, rediger og slett arrangementer.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="force-white-text inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold shadow-sm transition hover:bg-slate-800"
          style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
        >
          Nytt arrangement
        </Link>
      </div>

      <div className="grid gap-4">
        {events.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <p>{item.location}</p>
              <div className="flex gap-2">
                <Link
                  href={`/admin/events/${item.id}`}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Rediger
                </Link>
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="force-white-text inline-flex h-9 items-center justify-center rounded-lg bg-red-600 px-3 text-sm font-semibold transition hover:bg-red-500"
                    style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
                  >
                    Slett
                  </button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
