import Link from "next/link";

interface SubjectCardProps {
  subject: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    letter: string;
    color: string;
    bgColor: string;
    topicCount?: number;
  };
}

export default function SubjectCard({ subject }: SubjectCardProps) {
  return (
    <Link
      href={`/subjects/${subject.slug}`}
      className="group flex flex-col items-start p-4 bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-card hover:border-gray-200 transition-all duration-200"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-heading font-bold mb-3"
        style={{ backgroundColor: subject.bgColor, color: subject.color }}
      >
        {subject.letter}
      </div>
      <h3 className="font-heading font-semibold text-text-primary group-hover:text-primary transition-colors">
        {subject.name}
      </h3>
      {typeof subject.topicCount === "number" && (
        <p className="mt-1 text-xs text-text-muted">{subject.topicCount} topics</p>
      )}
    </Link>
  );
}
