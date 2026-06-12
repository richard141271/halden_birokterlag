import { PageHero } from "@/components/layout/page-hero";
import { EmptyState } from "@/components/feedback/empty-state";
import { AlbumCard } from "@/features/gallery/components/album-card";
import { getPublishedAlbums } from "@/features/gallery/server";

export default async function GalleryPage() {
  const albums = await getPublishedAlbums();

  return (
    <>
      <PageHero
        title="Bildegalleri"
        description="Samle bilder i album og presenter dem på en enkel og responsiv måte."
      />
      {albums.length ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="Ingen album publisert ennå"
          description="Bildearkivet blir synlig her så snart du har opprettet og fylt et album."
        />
      )}
    </>
  );
}
