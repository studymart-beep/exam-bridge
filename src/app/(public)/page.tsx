import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/brand/Logo";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { listPublishedSubjects } from "@/lib/data/student/subjects";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const supabase = await createClient();
    const [{ count: subjects }, { count: exams }, { count: students }] =
      await Promise.all([
        supabase
          .from("subjects")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("cbt_exams")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "student"),
      ]);
    return {
      subjects: subjects || 0,
      exams: exams || 0,
      students: students || 0,
    };
  } catch {
    return { subjects: 0, exams: 0, students: 0 };
  }
}

export default async function LandingPage() {
  const subjects = await listPublishedSubjects();
  const stats = await getStats();
  const preview = subjects.slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-heading font-bold text-primary text-lg hidden xs:inline sm:inline">
              Exam Bridge
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-text-secondary hover:text-primary px-2 py-2"
            >
              Login
            </Link>
            <Link href="/register">
              <Button size="sm">Start Learning</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-dark bg-accent-light px-3 py-1 rounded-full">
              JAMB · WAEC · SS1–SS3
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-[2.25rem] lg:leading-tight font-extrabold text-text-primary">
              Ace JAMB &amp; WAEC with focused practice
            </h1>
            <p className="text-text-secondary text-base sm:text-lg max-w-lg mx-auto lg:mx-0">
              Structured topics, video lessons, PDF notes, and real CBT exams —
              built for Nigerian secondary students who want to pass with
              confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Explore Subjects
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-accent/40 to-primary/20 blur-sm" />
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-elevated aspect-[4/3] bg-primary-light">
              <Image
                src="https://images.unsplash.com/photo-1456513080080-2f3e24349714?w=800&q=80"
                alt="Student studying with open books"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 28rem"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Subjects", value: stats.subjects },
            { label: "Students", value: stats.students },
            { label: "CBT exams", value: stats.exams },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-primary">
                {s.value}
              </p>
              <p className="text-xs sm:text-sm text-text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-16">
        <h2 className="font-heading text-2xl font-bold text-center mb-2">
          What you get
        </h2>
        <p className="text-center text-text-secondary text-sm mb-10 max-w-md mx-auto">
          Everything you need to prepare — in one calm, focused app.
        </p>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              title: "Video lessons",
              body: "Short, clear lessons you can rewatch anytime — perfect for tough topics.",
              icon: "▶",
            },
            {
              title: "PDF notes",
              body: "Downloadable summaries and diagrams aligned to your syllabus.",
              icon: "📄",
            },
            {
              title: "CBT practice",
              body: "Timed exams with scoring and corrections — just like the real thing.",
              icon: "✓",
            },
          ].map((f) => (
            <Card key={f.title} className="text-center hover:shadow-card transition-shadow">
              <div className="w-12 h-12 mx-auto rounded-xl bg-primary-light text-primary flex items-center justify-center text-xl mb-3">
                {f.icon}
              </div>
              <h3 className="font-heading font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-text-secondary mt-2">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Subjects preview */}
      <section className="bg-surface border-y border-border py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-heading text-2xl font-bold">Subjects</h2>
              <p className="text-sm text-text-secondary mt-1">
                Real content from your school syllabus
              </p>
            </div>
            <Link
              href="/login"
              className="text-sm font-semibold text-primary hover:underline shrink-0"
            >
              View all →
            </Link>
          </div>
          {preview.length === 0 ? (
            <Card className="text-center py-10">
              <p className="text-sm text-text-muted">
                Subjects coming soon. Register to get ready.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {preview.map((s) => (
                <Link key={s.id} href="/login">
                  <Card className="hover:border-accent hover:shadow-card transition-all h-full">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-heading font-bold text-primary bg-primary-light mb-2"
                    >
                      {(s.letter || s.name[0]).toUpperCase()}
                    </div>
                    <p className="font-medium text-sm truncate">{s.name}</p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-16">
        <h2 className="font-heading text-2xl font-bold text-center mb-10">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              n: "1",
              title: "Create your account",
              body: "Sign up free in under a minute.",
            },
            {
              n: "2",
              title: "Subscribe & unlock",
              body: "Pay by bank transfer, upload your receipt, get approved.",
            },
            {
              n: "3",
              title: "Study & practice",
              body: "Watch, read, and take CBTs until you are exam-ready.",
            },
          ].map((step) => (
            <div key={step.n} className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-secondary text-text-primary font-heading font-bold text-lg flex items-center justify-center mb-3 shadow-soft">
                {step.n}
              </div>
              <h3 className="font-heading font-semibold">{step.title}</h3>
              <p className="text-sm text-text-secondary mt-1">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-primary-light/50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="font-heading text-lg font-semibold text-primary">
            “Clear notes and real CBT practice helped me stay calm on exam day.”
          </p>
          <p className="text-sm text-text-muted mt-3">— SS3 student, Lagos</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="rounded-2xl bg-primary text-white px-6 py-10 sm:py-12 text-center shadow-elevated relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent/30 rounded-full blur-2xl" />
          <h2 className="font-heading text-2xl sm:text-3xl font-bold relative">
            Ready to pass? Start now.
          </h2>
          <p className="mt-2 text-white/80 text-sm relative max-w-md mx-auto">
            Join students using Exam Bridge to prepare for JAMB and WAEC.
          </p>
          <div className="mt-6 relative">
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="min-w-[180px]"
              >
                Create free account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col sm:flex-row gap-6 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Logo size={28} />
              <span className="font-heading font-bold text-primary">
                Exam Bridge
              </span>
            </div>
            <p className="text-xs text-text-muted max-w-xs">
              Focused practice for JAMB &amp; WAEC. Study smarter, not harder.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-text-secondary">
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
        </div>
        <div className="border-t border-border/60 text-center py-4 text-xs text-text-muted">
          © {new Date().getFullYear()} Exam Bridge. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
