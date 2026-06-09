import Image from "next/image";

export function MediaImage({
  src,
  alt,
  className = "",
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`flex aspect-[16/10] items-center justify-center rounded-2xl bg-slate-200 text-sm text-slate-500 ${className}`}
      >
        Ingen bildefil
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={900}
      unoptimized
      className={className}
    />
  );
}
