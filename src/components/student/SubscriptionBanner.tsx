import Link from "next/link";

export default function SubscriptionBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="w-full bg-accent-light border-b border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            Your subscription is inactive. Subscribe to unlock content.
          </p>
        </div>
        <Link
          href="/subscribe"
          className="inline-flex items-center justify-center min-h-11 h-11 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark flex-shrink-0 shadow-soft"
        >
          Subscribe Now
        </Link>
      </div>
    </div>
  );
}
