export function buildStoragePublicUrl(bucket: string, storagePath: string) {
  if (!bucket || !storagePath) {
    return "";
  }

  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/media/${encodeURIComponent(bucket)}/${encodedPath}`;
}
