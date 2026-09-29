"use client";

import { useSubscription } from "@/lib/subscription/context";
import SubscriptionBanner from "@/components/student/SubscriptionBanner";
import LockedContent from "@/components/student/LockedContent";

interface PageLockProps {
  children: React.ReactNode;
  label: string;
  title?: string;
}

export default function PageLock({ children, label }: PageLockProps) {
  const { isSubscribed, ready } = useSubscription();

  if (!ready) {
    return (
      <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto">
        <div className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (isSubscribed) {
    return <>{children}</>;
  }

  return (
    <div>
      <SubscriptionBanner />
      <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto">
        <LockedContent label={label} />
      </div>
    </div>
  );
}
