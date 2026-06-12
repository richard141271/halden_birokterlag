import { getPublicSettings } from "@/features/settings/server";
import { Badge } from "@/components/ui/badge";

export async function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  const settings = await getPublicSettings();

  return (
    <section
      className="rounded-[2rem] px-6 py-14 md:px-10"
      style={{
        backgroundColor: settings.hero_bg_color || "#0f172a",
        color: settings.hero_text_color || "#ffffff",
      }}
    >
      {eyebrow ? (
        <Badge
          className="mb-4 border-white/20 bg-white/10"
          style={{ color: settings.hero_text_color || "#ffffff" }}
        >
          {eyebrow}
        </Badge>
      ) : null}
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
        {title}
      </h1>
      <p
        className="mt-4 max-w-2xl text-base md:text-lg"
        style={{ color: settings.hero_muted_text_color || "#cbd5e1" }}
      >
        {description}
      </p>
    </section>
  );
}
