import { PageHero } from "@/components/layout/page-hero";
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
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </section>
    </>
  );
}
