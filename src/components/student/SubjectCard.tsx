import Link from "next/link";
import Image from "next/image";
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
    /** resolved signed URL (or plain/data URL) of the uploaded thumbnail */
    thumbnailUrl?: string | null;
  };
  /** Rotation index for green/gold/blue background tint */
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
  const showThumb = Boolean(subject.thumbnailUrl);

  return (
    <Link
      href={`/subjects/${subject.slug}`}
      className={cn(
        "card-gloss group relative flex flex-col rounded-[20px] border border-white/60 overflow-hidden",
        "shadow-[0_8px_24px_-6px_rgba(11,66,50,0.12)]",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-8px_rgba(11,66,50,0.18)]",
        "active:translate-y-0 active:scale-[0.99]"
      )}
    >
      {/* Thumbnail banner at the top when the admin set one */}
      {showThumb ? (
        <div className="relative w-full aspect-[16/9] bg-primary-light">
          <Image
            src={subject.thumbnailUrl as string}
            alt={subject.name}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          <span className="absolute bottom-2.5 left-3 text-white text-xs font-bold px-2 py-0.5 rounded-full bg-black/35 backdrop-blur">
            {subject.letter}
          </span>
          {typeof count === "number" && (
            <span className="absolute bottom-2.5 right-3 text-white text-xs font-bold px-2 py-0.5 rounded-full bg-black/35 backdrop-blur">
              {count} Topic{count === 1 ? "" : "s"}
            </span>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "relative z-10 flex flex-col p-5",
            "bg-gradient-to-br",
            gradients[i]
          )}
        >
          <div className="flex items-start justify-between gap-2">
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
        </div>
      )}

      {/* Name + description sit below the banner */}
      <div className={cn("p-5 pt-3.5 flex-1 flex flex-col", !showThumb && "-mt-10 relative z-10")}>
        <h3 className="font-heading font-extrabold text-lg sm:text-xl text-text-primary leading-snug">
          {subject.name}
        </h3>
        {subject.description ? (
          <p className="mt-1.5 text-sm text-text-secondary line-clamp-2">
            {subject.description}
          </p>
        ) : null}
        <span
          className="mt-auto pt-3 self-end text-text-muted group-hover:text-primary transition-colors"
          aria-hidden
        >
          →
        </span>
      </div>
    </Link>
  );
}
