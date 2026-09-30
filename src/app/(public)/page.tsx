import Link from "next/link";
import { listPublishedSubjects } from "@/lib/data/student/subjects";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const subjects = await listPublishedSubjects();
  const count = subjects.length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-heading font-bold text-primary text-lg">Exam Bridge</span>
          <div className="flex gap-3">
            <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-primary">
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-xl"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary max-w-xl mx-auto">
          Ace JAMB & WAEC with focused practice
        </h1>
        <p className="mt-4 text-text-secondary max-w-md mx-auto">
          Structured topics, materials, and CBT practice built for SS1–SS3 students.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-primary text-white font-semibold"
          >
            Create free account
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-12 px-6 rounded-2xl border border-gray-200 font-semibold text-text-primary"
          >
            Log in
          </Link>
        </div>
        <p className="mt-10 text-sm text-text-muted">
          {count > 0
            ? `${count} subject${count === 1 ? "" : "s"} available`
            : "Content coming soon — register to get ready."}
        </p>
      </main>
    </div>
  );
}
