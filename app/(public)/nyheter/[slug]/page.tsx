import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getNewsBySlug } from "@/features/news/server";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);

  if (!item) {
    notFound();
  }

  return (
    <Card>
      <CardContent className="prose max-w-3xl p-8 text-slate-700">
        <p className="text-sm text-slate-500">
          {item.published_at ? formatDate(item.published_at) : "Utkast"}
        </p>
        <h1>{item.title}</h1>
        <p>{item.body}</p>
      </CardContent>
    </Card>
  );
}
