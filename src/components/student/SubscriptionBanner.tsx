import Link from "next/link";

export default function SubscriptionBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="w-full bg-orange-50 border-b border-orange-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-orange-900">
            Your subscription is inactive. Subscribe to unlock content.
          </p>
        </div>
        <Link
          href="/subscribe"
          className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-orange-600 flex-shrink-0"
        >
          Subscribe Now
        </Link>
      </div>
    </div>
  );
}
