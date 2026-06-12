import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AlbumRecord } from "@/types/cms";

export function AlbumCard({ album }: { album: AlbumRecord }) {
  return (
    <Link href={`/galleri/${album.slug}`} className="block h-full">
      <Card className="h-full transition hover:border-slate-300 hover:shadow-md">
        <CardHeader>
          <CardTitle>{album.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-full flex-col gap-4">
          <p className="text-sm text-slate-600">{album.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
