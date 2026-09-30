import Link from "next/link";
import {
  getCurrentProfile,
  isSubscriptionActive,
} from "@/lib/data/student/profile";

interface ContentLockProps {
  children: React.ReactNode;
  label?: string;
}

export default async function ContentLock({
  children,
  label = "Subscribe to unlock this content.",
}: ContentLockProps) {
  const profile = await getCurrentProfile();
  if (isSubscriptionActive(profile)) {
    return <>{children}</>;
  }

  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <div className="blur-sm opacity-40 pointer-events-none select-none p-6 min-h-[140px]">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px] p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-text-primary mb-3 max-w-xs">{label}</p>
        <Link
          href="/subscribe"
          className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-orange-600"
        >
          Subscribe Now
        </Link>
      </div>
    </div>
  );
}
