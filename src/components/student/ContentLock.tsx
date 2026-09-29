import Link from "next/link";
import { getCurrentProfile, isSubscriptionActive } from "@/lib/data/profile";

interface ContentLockProps {
  children: React.ReactNode;
  label?: string;
}

/** Locks inner content (materials, start exam) when subscription inactive */
export default async function ContentLock({
  children,
  label = "Subscribe to unlock this content.",
}: ContentLockProps) {
  const profile = await getCurrentProfile();
  const active = isSubscriptionActive(profile);

  if (active) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-white rounded-2xl border border-gray-100 shadow-soft">
      <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-3">
        <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <p className="text-base font-heading font-semibold text-text-primary">{label}</p>
      <p className="text-sm text-text-muted mt-1">Metadata stays visible. Subscribe to open materials and exams.</p>
      <Link
        href="/subscribe"
        className="mt-4 inline-flex h-11 items-center px-6 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover"
      >
        Subscribe Now
      </Link>
    </div>
  );
}
