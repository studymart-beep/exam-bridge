import Link from "next/link";
import type { Subject } from "@/types";

interface SubjectCardProps {
  subject: Subject;
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
      <p className="mt-1 text-xs text-text-muted flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        {subject.topicCount} topics
      </p>
    </Link>
  );
}
