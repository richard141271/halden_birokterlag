import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildStoragePublicUrl } from "@/lib/supabase/storage";
import { isUuid } from "@/lib/utils";
import { getPublishedDocuments } from "@/features/documents/server";

export default async function DocumentsPage() {
  const documents = await getPublishedDocuments();

  return (
    <>
      <PageHero
        title="Dokumentarkiv"
        description="Del PDF-er, referater, vedtekter og andre nyttige dokumenter."
      />
      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <CardTitle>{doc.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <div>
                <p>{doc.description}</p>
                <p>Mappe: {doc.folder_path}</p>
              </div>
              {isUuid(doc.id) ? (
                <Link
                  href={buildStoragePublicUrl(doc.bucket, doc.storage_path) || "#"}
                  className="font-medium text-slate-900"
                  target="_blank"
                >
                  Åpne dokument
                </Link>
              ) : (
                <span className="font-medium text-slate-400">
                  Eksempeldokument
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
