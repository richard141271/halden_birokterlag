import Link from "next/link";
import { Button } from "@/components/ui/button";
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
        <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
          <Link href="/admin/events/new">Nytt arrangement</Link>
        </Button>
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
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                >
                  <Link href={`/admin/events/${item.id}`}>Rediger</Link>
                </Button>
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={item.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    Slett
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
