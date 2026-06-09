import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaImage } from "@/components/media/media-image";
import { getAlbumBySlug } from "@/features/gallery/server";

export default async function GalleryAlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getAlbumBySlug(slug);

  if (!result) {
    notFound();
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{result.album.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          {result.album.description}
        </CardContent>
      </Card>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {result.images.map((image) => (
          <Card key={image.id}>
            <CardContent className="space-y-3 p-4">
              <MediaImage
                src={image.public_url}
                alt={image.alt_text || image.file_name}
                className="aspect-[4/3] rounded-2xl object-cover"
              />
              <p className="text-sm text-slate-600">{image.caption}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
