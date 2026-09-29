"use client";

import Link from "next/link";

interface LockedContentProps {
  label?: string;
}

export default function LockedContent({
  label = "Subscribe to unlock this content.",
}: LockedContentProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white rounded-2xl border border-gray-100 shadow-soft">
      <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <p className="text-base font-heading font-semibold text-text-primary max-w-xs">
        {label}
      </p>
      <p className="text-sm text-text-muted mt-2 max-w-sm">
        Get full access to subjects, materials, CBT practice and your results.
      </p>
      <Link
        href="/subscribe"
        className="mt-5 inline-flex items-center justify-center h-11 px-6 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
      >
        Subscribe Now
      </Link>
    </div>
  );
}
