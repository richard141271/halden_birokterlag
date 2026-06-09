import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { EventRecord } from "@/types/cms";

export function EventCard({ item }: { item: EventRecord }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <p className="text-sm text-slate-500">{formatDateTime(item.starts_at)}</p>
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-col gap-4">
        <p className="text-sm text-slate-600">{item.summary}</p>
        <p className="text-sm text-slate-500">{item.location || "Sted annonseres"}</p>
        <Link
          href={`/arrangementer/${item.slug}`}
          className="mt-auto text-sm font-medium text-slate-900"
        >
          Se detaljer
        </Link>
      </CardContent>
    </Card>
  );
}
