import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/brand/Logo";
import Footer from "@/components/shared/Footer";
import SupportFab from "@/components/shared/SupportFab";
import Button from "@/components/ui/Button";
import { listPublishedSubjects } from "@/lib/data/student/subjects";
import { getSupportUrl } from "@/lib/data/platformSettings";
import SubjectCard from "@/components/student/SubjectCard";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Exam Bridge — Ace JAMB & WAEC with Focused Practice",
  description: "Video lessons, PDF study notes, and CBT practice for JAMB and WAEC. Built for Nigerian students.",
  path: "/",
});

export const dynamic = "force-dynamic";

const features = [
  {
    title: "Watch video lessons",
    body: "Clear topic videos you can replay anytime, at your own pace.",
    icon: "▶",
    iconBg: "bg-coral",
    panel: "ph-coral",
    play: true,
  },
  {
    title: "Read PDF study notes",
    body: "Structured notes for revision — online or downloaded offline.",
    icon: "≡",
    iconBg: "bg-gold-deep",
    panel: "ph-gold",
  },
  {
    title: "Take real CBT practice",
    body: "Timed exams with scoring so you know where you stand.",
    icon: "✓",
    iconBg: "bg-primary",
    panel: "ph-mint",
  },
];

const steps = [
  {
    n: "1",
    t: "Register",
    d: "Create a free student account in minutes.",
    numBg: "bg-primary-dark",
    strip: "bg-primary",
    bg: "from-[#EAFBF2] via-surface to-surface",
  },
  {
    n: "2",
    t: "Subscribe",
    d: "Activate access with a simple bank transfer.",
    numBg: "bg-accent-dark",
    strip: "bg-secondary",
    bg: "from-[#FFF6D8] via-surface to-surface",
  },
  {
    n: "3",
    t: "Learn & Practice",
    d: "Watch, read, and sit CBT exams with confidence.",
    numBg: "bg-coral",
    strip: "bg-coral",
    bg: "from-[#FFE9E6] via-surface to-surface",
  },
];

export default async function LandingPage() {
  const [subjectsRaw, supportUrl] = await Promise.all([
    listPublishedSubjects(),
    getSupportUrl(),
  ]);
  const subjects = subjectsRaw.slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Exam Bridge",
    description:
      "Exam preparation platform for JAMB and WAEC students.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://exam-bridge-one.vercel.app",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://exam-bridge-one.vercel.app"}/logo-1024.png`,
    sameAs: [] as string[],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="page-decor min-h-screen">
        {/* Header — white bar, two-tone wordmark, single emerald CTA */}
        <header className="sticky top-0 z-30 border-b border-border/80 bg-surface/90 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size={40} />
              <span className="font-heading font-extrabold text-[19px] tracking-tight hidden sm:inline">
                <span className="text-primary-dark">Exam</span>
                <span className="text-primary">Bridge</span>
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

        {/* Hero copy */}
        <section className="max-w-3xl mx-auto px-4 pt-10 pb-6 text-center">
          <p className="text-[13px] font-semibold text-text-secondary tracking-[0.06em] mb-3">
            Learn • Prepare • Succeed
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary leading-[1.08]">
            Ace JAMB &amp; WAEC with focused practice
          </h1>
          <p className="mt-4 text-base sm:text-lg text-text-secondary max-w-xl mx-auto">
            Video lessons, PDF notes, and real CBT practice — built for Nigerian
            students preparing for JAMB and WAEC.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
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

        {/* Hero image */}
        <section className="w-full px-0 sm:px-4 max-w-6xl mx-auto">
          <div className="relative w-full aspect-[16/9] sm:rounded-3xl overflow-hidden shadow-tile">
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

        {/* What we do — one cream container, three columns, gold separators */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="font-heading text-3xl font-extrabold text-text-primary text-center">
            What we do
          </h2>
          <p className="text-center text-[15px] text-text-secondary mt-1.5">
            Everything you need to prepare, practice and pass your exams.
          </p>
          <div className="mt-8 rounded-[22px] bg-surface border border-white/70 shadow-[0_6px_16px_rgba(23,122,83,0.13)] p-4 sm:p-6">
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-0 sm:divide-x divide-border-gold">
              {features.map((f) => (
                <div key={f.title} className="gold-underline p-3 sm:px-5">
                  {/* mini panel illustration */}
                  <div
                    className={`relative h-[118px] rounded-2xl overflow-hidden mb-4 ${
                      f.panel === "ph-coral"
                        ? "bg-gradient-to-br from-[#FFE9E6] to-[#FFD8D3]"
                        : f.panel === "ph-gold"
                          ? "bg-gradient-to-br from-[#FFF6D8] to-[#FDEEB8]"
                          : "bg-gradient-to-br from-[#D9F8E8] to-[#C3F0D9]"
                    }`}
                  >
                    {f.play && (
                      <>
                        <span className="absolute inset-0 grid place-items-center">
                          <span className="w-10 h-10 rounded-full bg-coral text-white grid place-items-center shadow-lg text-sm">
                            ▶
                          </span>
                        </span>
                        <span className="absolute bottom-2 left-2 right-2 h-1 rounded-full bg-black/40">
                          <span className="block h-full w-1/2 rounded-full bg-coral" />
                        </span>
                      </>
                    )}
                    {f.panel === "ph-gold" && (
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-16 bg-white rounded-lg shadow-md grid place-items-center">
                        <span className="text-[10px] font-extrabold text-coral">PDF</span>
                      </span>
                    )}
                    {f.panel === "ph-mint" && (
                      <>
                        <span className="absolute inset-3 rounded-xl border-2 border-primary bg-white/90" />
                        <span className="absolute left-4 top-4 text-[9px] font-extrabold text-primary-dark">
                          CBT Practice
                        </span>
                        <span className="absolute right-4 bottom-4 w-8 h-8 rounded-full bg-primary text-white text-[9px] font-extrabold grid place-items-center">
                          80%
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-[38px] h-[38px] rounded-full ${f.iconBg} text-white grid place-items-center font-bold shrink-0 shadow-soft`}
                    >
                      {f.icon}
                    </span>
                    <div>
                      <h3 className="font-heading font-extrabold text-[17px] text-text-primary leading-snug">
                        {f.title}
                      </h3>
                      <p className="text-sm text-text-secondary mt-1">{f.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subjects — gold title bar panel */}
        {subjects.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 pb-12">
            <div className="rounded-[22px] bg-primary-light/45 border border-border-green/70 shadow-[0_6px_16px_rgba(23,122,83,0.12)] p-5 sm:p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="title-bar" aria-hidden />
                <div>
                  <h2 className="font-heading text-2xl font-extrabold text-text-primary leading-tight">
                    Subjects
                  </h2>
                  <p className="text-[15px] text-text-secondary mt-0.5">
                    Focus on the right subjects. Build your future.
                  </p>
                </div>
              </div>
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
                      color: s.color || "#0A8B5B",
                      bgColor: s.bg_color || "#DDF8E8",
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* How it works — numbered cards with connectors + base strips */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="font-heading text-3xl font-extrabold text-text-primary text-center">
            How it works
          </h2>
          <p className="text-center text-[15px] text-text-secondary mt-1.5">
            Three simple steps to your success.
          </p>
          <div className="mt-10 grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 sm:gap-0 items-stretch">
            {steps.map((st, i) => (
              <div key={st.n} className="contents">
                <div
                  className={`relative rounded-[20px] bg-gradient-to-br ${st.bg} border border-white/80 shadow-[0_6px_16px_rgba(23,122,83,0.12)] p-5 pt-8 min-h-[190px]`}
                >
                  <span
                    className={`absolute -top-6 left-5 w-12 h-12 rounded-full ${st.numBg} text-white font-heading font-bold text-xl grid place-items-center shadow-tile`}
                  >
                    {st.n}
                  </span>
                  <h3 className="font-heading font-extrabold text-[17px] text-text-primary">
                    {st.t}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1.5">{st.d}</p>
                  <span
                    className={`absolute bottom-3 left-4 right-4 h-[5px] rounded-full ${st.strip}`}
                  />
                </div>
                {i < steps.length - 1 && (
                  <span className="hidden sm:grid place-items-center px-1">
                    <span className="w-9 h-9 rounded-full bg-primary text-white grid place-items-center shadow-tile z-10">
                      →
                    </span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="font-heading text-xl sm:text-2xl font-extrabold text-primary">
            Better students. Brighter futures.
          </p>
        </section>

        <Footer />
        <SupportFab url={supportUrl} />
      </div>
    </>
  );
}
