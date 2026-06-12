import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { EventRecord } from "@/types/cms";

export function EventCard({ item }: { item: EventRecord }) {
  return (
    <Link href={`/arrangementer/${item.slug}`} className="block h-full">
      <Card className="h-full transition hover:border-slate-300 hover:shadow-md">
        <CardHeader>
          <p className="text-sm text-slate-500">{formatDateTime(item.starts_at)}</p>
          <CardTitle>{item.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-full flex-col gap-4">
          <p className="text-sm text-slate-600">{item.summary}</p>
          <p className="text-sm text-slate-500">
            {item.location || "Sted annonseres"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
