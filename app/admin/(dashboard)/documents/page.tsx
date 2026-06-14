import { Button } from "@/components/ui/button";
import { OrganizationField } from "@/components/admin/organization-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteDocument,
  getAdminDocuments,
  uploadDocument,
} from "@/features/documents/server";

export default async function AdminDocumentsPage() {
  const documents = await getAdminDocuments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Dokumentarkiv</h1>
        <p className="mt-2 text-slate-600">
          Last opp PDF-er og organiser dem i mapper.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Bucketen som brukes for dokumenter er <span className="font-medium">documents</span>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Last opp dokument</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={uploadDocument} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <OrganizationField />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Tittel</Label>
              <Input id="title" name="title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="folder_path">Mappe</Label>
              <Input id="folder_path" name="folder_path" defaultValue="/" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Beskrivelse</Label>
              <Textarea id="description" name="description" className="min-h-24" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="file">PDF-fil</Label>
              <Input id="file" name="file" type="file" accept="application/pdf" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Last opp dokument</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <CardTitle>{doc.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <p>
                {doc.folder_path} · {doc.file_name}
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={doc.publicUrl || "#"}
                  target="_blank"
                  className="font-medium text-slate-900"
                >
                  Åpne
                </a>
                <form action={deleteDocument}>
                  <input type="hidden" name="id" value={doc.id} />
                  <input type="hidden" name="bucket" value={doc.bucket} />
                  <input
                    type="hidden"
                    name="storage_path"
                    value={doc.storage_path}
                  />
                  <Button type="submit" variant="destructive" size="sm">
                    Slett
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
