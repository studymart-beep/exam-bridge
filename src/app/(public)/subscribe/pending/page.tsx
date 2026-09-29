import Link from "next/link";
import Button from "@/components/ui/Button";

export default function SubscribePendingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 flex items-center justify-center">
          <svg className="w-10 h-10 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-heading font-bold text-text-primary">
            Payment received
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Waiting for admin verification. This usually takes less than 30 minutes.
          </p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-soft text-left space-y-2">
          <p className="text-xs text-text-muted">Estimated time</p>
          <p className="text-sm font-medium text-text-primary">Up to 30 minutes</p>
          <p className="text-xs text-text-secondary">
            You&apos;ll receive a notification once your subscription is activated.
          </p>
        </div>
        <Link href="/dashboard">
          <Button fullWidth size="lg">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
