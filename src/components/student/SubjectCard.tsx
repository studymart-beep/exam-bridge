import Link from "next/link";
import { cn } from "@/lib/utils";

interface SubjectCardProps {
  subject: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    letter: string;
    color?: string;
    bgColor?: string;
    topicCount?: number;
  };
  /** Rotation index for green/gold/blue */
  index?: number;
}

const gradients = [
  "from-primary-light via-primary-soft/80 to-cream",
  "from-accent-light via-[#FEF3C7] to-cream",
  "from-calm-light via-[#EFF6FF] to-cream",
];
const emblems = [
  "bg-primary text-white",
  "bg-secondary text-text-primary",
  "bg-calm text-white",
];
const badges = [
  "bg-white/80 text-primary border-border-green",
  "bg-white/80 text-secondary-dark border-border",
  "bg-white/80 text-calm border-border-blue",
];

export default function SubjectCard({ subject, index = 0 }: SubjectCardProps) {
  const i = ((index % 3) + 3) % 3;
  const count = subject.topicCount;

  return (
    <Link
      href={`/subjects/${subject.slug}`}
      className={cn(
        "card-gloss group relative flex flex-col min-h-[160px] p-5 rounded-[20px] border border-white/60",
        "bg-gradient-to-br shadow-[0_8px_24px_-6px_rgba(22,101,52,0.12)]",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-8px_rgba(22,101,52,0.18)]",
        "active:translate-y-0 active:scale-[0.99]",
        gradients[i]
      )}
    >
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-lg font-heading font-extrabold shadow-soft",
            emblems[i]
          )}
        >
          {subject.letter}
        </div>
        {typeof count === "number" && (
          <span
            className={cn(
              "text-[11px] font-semibold px-2.5 py-1 rounded-full border",
              badges[i]
            )}
          >
            {count} Topic{count === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <h3 className="relative z-10 mt-4 font-heading font-extrabold text-lg sm:text-xl text-text-primary leading-snug">
        {subject.name}
      </h3>
      {subject.description ? (
        <p className="relative z-10 mt-1.5 text-sm text-text-secondary line-clamp-2">
          {subject.description}
        </p>
      ) : null}

      <span
        className="relative z-10 mt-auto pt-4 self-end text-text-muted group-hover:text-primary transition-colors"
        aria-hidden
      >
        →
      </span>
    </Link>
  );
}
