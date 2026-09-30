export const dynamic = "force-dynamic";

// NOTE: enforcement activates after backend integration / admin approval

import Link from "next/link";
import SubscribeForm from "@/components/student/SubscribeForm";
import { getSettings } from "@/lib/data/settings";

export default async function SubscribePage() {
  const settings = await getSettings();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 max-w-lg mx-auto">
          <Link href="/dashboard" className="p-1.5 -ml-1.5 rounded-lg text-text-secondary hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-heading font-semibold text-text-primary">
            Subscription &amp; Payment
          </h1>
          <div className="w-8" />
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6 pb-12">
        <SubscribeForm
          price={settings.subscription_price}
          bankName={settings.bank_name}
          accountName={settings.account_name}
          accountNumber={settings.account_number}
        />
      </main>
    </div>
  );
}
