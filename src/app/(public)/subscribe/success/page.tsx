import Link from "next/link";
import Button from "@/components/ui/Button";

export default function SubscribeSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary-light flex items-center justify-center shadow-card">
          <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-text-primary">
            Subscription active
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            You now have full access to all exams, past questions, and premium study resources.
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
