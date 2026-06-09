import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AlbumRecord } from "@/types/cms";

export function AlbumCard({ album }: { album: AlbumRecord }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{album.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-col gap-4">
        <p className="text-sm text-slate-600">{album.description}</p>
        <Link
          href={`/galleri/${album.slug}`}
          className="mt-auto text-sm font-medium text-slate-900"
        >
          Åpne album
        </Link>
      </CardContent>
    </Card>
  );
}
