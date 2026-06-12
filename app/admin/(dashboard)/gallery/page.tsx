import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createAlbum,
  deleteImage,
  getAdminGalleryData,
  uploadImage,
} from "@/features/gallery/server";

export default async function AdminGalleryPage() {
  const gallery = await getAdminGalleryData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Bildegalleri</h1>
        <p className="mt-2 text-slate-600">
          Opprett album, last opp bilder og fjern media ved behov.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Bucketen som brukes for bilder er <span className="font-medium">media</span>.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Opprett album</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createAlbum} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tittel</Label>
                <Input id="title" name="title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beskrivelse</Label>
                <Textarea id="description" name="description" className="min-h-24" />
              </div>
              <Button type="submit">Lagre album</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last opp bilder</CardTitle>
          </CardHeader>
          <CardContent>
            {gallery.length ? (
              <form action={uploadImage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="album_id">Album</Label>
                  <select
                    id="album_id"
                    name="album_id"
                    className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
                    defaultValue={gallery[0]?.album.id || ""}
                  >
                    {gallery.map(({ album }) => (
                      <option key={album.id} value={album.id}>
                        {album.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alt_text">Alt-tekst</Label>
                  <Input id="alt_text" name="alt_text" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caption">Bildetekst</Label>
                  <Textarea id="caption" name="caption" className="min-h-24" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="files">Bildefiler</Label>
                  <Input
                    id="files"
                    name="files"
                    type="file"
                    accept="image/*"
                    multiple
                  />
                  <p className="text-xs text-slate-500">
                    Du kan laste opp opptil 6 bilder per opplasting.
                  </p>
                </div>
                <Button type="submit">Last opp bilder</Button>
              </form>
            ) : (
              <EmptyState
                title="Opprett album først"
                description="Galleri-opplasting krever minst ett ekte album i databasen."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {gallery.length ? gallery.map(({ album, images }) => (
          <Card key={album.id}>
            <CardHeader>
              <CardTitle>{album.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">{album.description}</p>
              {images.map((image) => (
                <div
                  key={image.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">{image.file_name}</p>
                    <p>{image.caption}</p>
                  </div>
                  <form action={deleteImage}>
                    <input type="hidden" name="id" value={image.id} />
                    <input type="hidden" name="bucket" value={image.bucket} />
                    <input
                      type="hidden"
                      name="storage_path"
                      value={image.storage_path}
                    />
                    <Button type="submit" variant="destructive" size="sm">
                      Slett bilde
                    </Button>
                  </form>
                </div>
              ))}
            </CardContent>
          </Card>
        )) : (
          <EmptyState
            title="Ingen album ennå"
            description="Opprett ditt første album for å bygge opp bildearkivet."
          />
        )}
      </div>
    </div>
  );
}
