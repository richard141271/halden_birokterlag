import { PageHero } from "@/components/layout/page-hero";
import { NewsCard } from "@/features/news/components/news-card";
import { getPublishedNews } from "@/features/news/server";

export default async function NewsPage() {
  const news = await getPublishedNews();

  return (
    <>
      <PageHero
        title="Nyheter"
        description="Publiser nyheter, artikler og oppdateringer for organisasjonen."
      />
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {news.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </section>
    </>
  );
}
