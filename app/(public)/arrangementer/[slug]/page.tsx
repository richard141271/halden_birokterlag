import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getEventBySlug } from "@/features/events/server";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getEventBySlug(slug);

  if (!item) {
    notFound();
  }

  return (
    <Card>
      <CardContent className="prose max-w-3xl p-8 text-slate-700">
        <p className="text-sm text-slate-500">{formatDateTime(item.starts_at)}</p>
        <h1>{item.title}</h1>
        <p>{item.location || "Sted kommer"}</p>
        <p>{item.body}</p>
      </CardContent>
    </Card>
  );
}
