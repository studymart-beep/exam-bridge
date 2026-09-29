"use client";

import Link from "next/link";

export default function SubscriptionBanner() {
  return (
    <div className="w-full bg-orange-50 border-b border-orange-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-orange-900">
              Your subscription is inactive. Subscribe to unlock full access.
            </p>
            <p className="text-xs text-orange-700 mt-0.5">
              Subjects, CBT, progress and results stay locked until you subscribe.
            </p>
          </div>
        </div>
        <Link
          href="/subscribe"
          className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-orange-600 transition-colors flex-shrink-0"
        >
          Subscribe Now
        </Link>
      </div>
    </div>
  );
}
