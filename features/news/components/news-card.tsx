import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { NewsRecord } from "@/types/cms";

export function NewsCard({ item }: { item: NewsRecord }) {
  return (
    <Link href={`/nyheter/${item.slug}`} className="block h-full">
      <Card className="h-full transition hover:border-slate-300 hover:shadow-md">
        <CardHeader>
          <p className="text-sm text-slate-500">
            {item.published_at ? formatDate(item.published_at) : "Utkast"}
          </p>
          <CardTitle>{item.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-full flex-col gap-4">
          <p className="text-sm text-slate-600">{item.summary}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
