import { SectionLabel } from "@/components/ui/SectionLabel";

export function PageHeading({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <SectionLabel>{kicker}</SectionLabel>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#eef2ff]">
        {title}
      </h2>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#8892b0]">
        {description}
      </p>
    </div>
  );
}
