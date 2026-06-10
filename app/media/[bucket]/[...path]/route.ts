import { getSupabaseServerClientOrThrow } from "@/lib/supabase/server";

const imageExtensions = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);

function buildImageFallback() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="#e2e8f0"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#475569" font-family="Arial, Helvetica, sans-serif" font-size="36">
        Bildet ble ikke funnet
      </text>
    </svg>
  `;
}

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ bucket: string; path: string[] }>;
  },
) {
  const { bucket, path } = await params;
  const storagePath = path.join("/");
  const extension = path[path.length - 1]?.split(".").pop()?.toLowerCase() || "";

  try {
    const client = getSupabaseServerClientOrThrow();
    const { data, error } = await client.storage.from(bucket).download(storagePath);

    if (error || !data) {
      if (imageExtensions.has(extension)) {
        return new Response(buildImageFallback(), {
          status: 200,
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=300",
          },
        });
      }

      return new Response("Filen ble ikke funnet.", { status: 404 });
    }

    const arrayBuffer = await data.arrayBuffer();

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": data.type || "application/octet-stream",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    return new Response("Kunne ikke hente filen.", { status: 500 });
  }
}
