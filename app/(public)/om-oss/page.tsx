import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { Card, CardContent } from "@/components/ui/card";
import { getPageBySlug } from "@/features/pages/server";

export default async function AboutPage() {
  const page = await getPageBySlug("om-oss");

  if (!page) {
    notFound();
  }

  return (
    <>
      <PageHero title={page.title} description={page.excerpt || ""} />
      <Card>
        <CardContent className="prose max-w-none p-8 text-slate-700">
          <p>{page.body}</p>
        </CardContent>
      </Card>
    </>
  );
}
