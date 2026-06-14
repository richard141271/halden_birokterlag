import { Button } from "@/components/ui/button";
import { OrganizationField } from "@/components/admin/organization-field";
import { EmptyState } from "@/components/feedback/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createAlbum,
  deleteAlbum,
  deleteImage,
  getAdminGalleryData,
  saveAlbum,
  saveImage,
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
              <OrganizationField />
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
                <OrganizationField />
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
            <CardContent className="space-y-6">
              <form action={saveAlbum} className="grid gap-4 rounded-xl border border-slate-200 p-4 md:grid-cols-2">
                <input type="hidden" name="id" value={album.id} />
                <div className="md:col-span-2">
                  <OrganizationField value={album.organization_id} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`album-title-${album.id}`}>Albumtittel</Label>
                  <Input
                    id={`album-title-${album.id}`}
                    name="title"
                    defaultValue={album.title}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`album-description-${album.id}`}>Beskrivelse</Label>
                  <Textarea
                    id={`album-description-${album.id}`}
                    name="description"
                    className="min-h-24"
                    defaultValue={album.description || ""}
                  />
                </div>
                <div className="flex flex-wrap gap-3 md:col-span-2">
                  <Button type="submit" size="sm">
                    Lagre album
                  </Button>
                  <Button type="submit" formAction={deleteAlbum} variant="destructive" size="sm">
                    Slett album og bilder
                  </Button>
                </div>
              </form>
              {images.length ? images.map((image) => (
                <form
                  key={image.id}
                  action={saveImage}
                  className="grid gap-4 rounded-xl border border-slate-200 p-4 text-sm text-slate-600 lg:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <input type="hidden" name="id" value={image.id} />
                    <input
                      type="hidden"
                      name="organization_id"
                      value={image.organization_id || album.organization_id || ""}
                    />
                    <input type="hidden" name="current_bucket" value={image.bucket} />
                    <input
                      type="hidden"
                      name="current_storage_path"
                      value={image.storage_path}
                    />
                    <div className="space-y-2 md:col-span-2">
                      <p className="font-medium text-slate-900">{image.file_name}</p>
                      <a
                        href={image.public_url || "#"}
                        target="_blank"
                        className="font-medium text-slate-900 underline-offset-4 hover:underline"
                      >
                        Åpne bilde
                      </a>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`image-album-${image.id}`}>Album</Label>
                      <select
                        id={`image-album-${image.id}`}
                        name="album_id"
                        className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
                        defaultValue={image.album_id || album.id}
                      >
                        {gallery.map(({ album: targetAlbum }) => (
                          <option key={targetAlbum.id} value={targetAlbum.id}>
                            {targetAlbum.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`image-alt-${image.id}`}>Alt-tekst</Label>
                      <Input
                        id={`image-alt-${image.id}`}
                        name="alt_text"
                        defaultValue={image.alt_text || ""}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`image-caption-${image.id}`}>Bildetekst</Label>
                      <Textarea
                        id={`image-caption-${image.id}`}
                        name="caption"
                        className="min-h-24"
                        defaultValue={image.caption || ""}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`image-file-${image.id}`}>Bytt bildefil</Label>
                      <Input
                        id={`image-file-${image.id}`}
                        name="file"
                        type="file"
                        accept="image/*"
                      />
                      <p className="text-xs text-slate-500">
                        La feltet stå tomt hvis du bare vil endre tekst eller flytte bildet til et annet album.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-start gap-3 lg:flex-col">
                    <Button type="submit" size="sm">
                      Lagre bilde
                    </Button>
                    <button
                      type="submit"
                      formAction={deleteImage}
                      className="force-white-text inline-flex h-9 items-center justify-center rounded-lg bg-red-600 px-3 text-sm font-semibold transition hover:bg-red-500"
                      style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
                    >
                      Slett bilde
                    </button>
                  </div>
                </form>
              )) : (
                <p className="text-sm text-slate-500">Ingen bilder i dette albumet ennå.</p>
              )}
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
