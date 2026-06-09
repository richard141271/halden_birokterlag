import { Badge } from "@/components/ui/badge";

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-[2rem] bg-slate-950 px-6 py-14 text-white md:px-10">
      {eyebrow ? (
        <Badge className="mb-4 border-white/20 bg-white/10 text-white">
          {eyebrow}
        </Badge>
      ) : null}
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
        {description}
      </p>
    </section>
  );
}
