import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { NewsRecord } from "@/types/cms";

export function NewsCard({ item }: { item: NewsRecord }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <p className="text-sm text-slate-500">
          {item.published_at ? formatDate(item.published_at) : "Utkast"}
        </p>
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-col gap-4">
        <p className="text-sm text-slate-600">{item.summary}</p>
        <Link
          href={`/nyheter/${item.slug}`}
          className="mt-auto text-sm font-medium text-slate-900"
        >
          Les mer
        </Link>
      </CardContent>
    </Card>
  );
}
