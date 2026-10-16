import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/brand/Logo";
import Button from "@/components/ui/Button";
import { listPublishedSubjects } from "@/lib/data/student/subjects";
import SubjectCard from "@/components/student/SubjectCard";
import Section from "@/components/ui/Section";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Exam Bridge — Ace JAMB & WAEC with Focused Practice",
  description: "Video lessons, PDF study notes, and CBT practice for JAMB and WAEC. Built for Nigerian students.",
  path: "/",
});

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const subjects = (await listPublishedSubjects()).slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Exam Bridge",
    description:
      "Exam preparation platform for JAMB and WAEC students.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://exam-bridge-one.vercel.app",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://exam-bridge-one.vercel.app"}/logo.png`,
    sameAs: [] as string[],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-surface/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={40} />
            <span className="font-heading font-bold text-primary hidden sm:inline">
              Exam Bridge
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button size="sm" variant="ghost">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Start Learning</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero text */}
      <section className="max-w-3xl mx-auto px-4 pt-10 pb-6 text-center">
        <p className="text-sm font-medium text-text-secondary tracking-wide mb-3">
          Learn • Prepare • Succeed
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary leading-tight">
          Ace JAMB &amp; WAEC with focused practice
        </h1>
        <p className="mt-4 text-base sm:text-lg text-text-secondary max-w-xl mx-auto">
          Video lessons, PDF notes, and real CBT practice — built for Nigerian
          students preparing for JAMB and WAEC.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="w-full sm:w-auto">
            <Button fullWidth className="sm:w-auto min-h-[48px] px-8">
              Start Learning
            </Button>
          </Link>
          <Link href="/subjects" className="w-full sm:w-auto">
            <Button variant="outline" fullWidth className="sm:w-auto min-h-[48px] px-8">
              Explore Subjects
            </Button>
          </Link>
        </div>
      </section>

      {/* Full-width hero image */}
      <section className="w-full px-0 sm:px-4 max-w-6xl mx-auto">
        <div className="relative w-full aspect-[16/9] sm:rounded-2xl overflow-hidden bg-primary-dark">
          <Image
            src="/images/landing-hero.png"
            alt="Students preparing with Exam Bridge"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      </section>

      {/* What we do */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="font-heading text-2xl font-bold text-text-primary text-center mb-8">
          What we do
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              title: "Watch video lessons",
              body: "Clear topic videos you can replay anytime, at your own pace.",
            },
            {
              title: "Read PDF study notes",
              body: "Structured notes for revision — online or downloaded offline.",
            },
            {
              title: "Take real CBT practice",
              body: "Timed exams with scoring so you know where you stand.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold mb-3">
                ✓
              </div>
              <h3 className="font-heading font-semibold text-text-primary">
                {c.title}
              </h3>
              <p className="text-sm text-text-secondary mt-1.5">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects */}
      {subjects.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <Section title="Subjects" tint="green" className="max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {subjects.map((s, idx) => (
                <SubjectCard
                  key={s.id}
                  index={idx}
                  subject={{
                    id: s.id,
                    name: s.name,
                    slug: s.slug,
                    letter: s.letter || s.name.charAt(0),
                    color: s.color || "#166534",
                    bgColor: s.bg_color || "#DCFCE7",
                  }}
                />
              ))}
            </div>
          </Section>
        </section>
      )}

      {/* How it works */}
      <section className="bg-primary-light/40 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="font-heading text-2xl font-bold text-text-primary text-center mb-8">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { n: "1", t: "Register", d: "Create a free student account in minutes." },
              { n: "2", t: "Subscribe", d: "Activate access with a simple bank transfer." },
              { n: "3", t: "Learn & Practice", d: "Watch, read, and sit CBT exams with confidence." },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white font-heading font-bold text-lg flex items-center justify-center mx-auto mb-3">
                  {s.n}
                </div>
                <h3 className="font-heading font-semibold text-text-primary">{s.t}</h3>
                <p className="text-sm text-text-secondary mt-1">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="font-heading text-xl sm:text-2xl font-bold text-primary">
          Better students. Brighter futures.
        </p>
      </section>

      <footer className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={36} />
            <div>
              <p className="font-heading font-bold text-primary text-sm">Exam Bridge</p>
              <p className="text-xs text-text-muted">Learn • Prepare • Succeed</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm text-text-secondary">
            <Link href="/login" className="hover:text-primary">
              Login
            </Link>
            <Link href="/register" className="hover:text-primary">
              Register
            </Link>
            <Link href="/subscribe" className="hover:text-primary">
              Subscribe
            </Link>
          </div>
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Exam Bridge
          </p>
        </div>
      </footer>
    </div>
    </>
  );
}
