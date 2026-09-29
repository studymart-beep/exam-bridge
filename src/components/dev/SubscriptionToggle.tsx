"use client";

// TODO: hide in production

import { useSubscription } from "@/lib/subscription/context";
import { cn } from "@/lib/utils";

export default function SubscriptionToggle() {
  const { isSubscribed, toggle, ready } = useSubscription();

  if (!ready) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "fixed bottom-20 right-4 z-[100] sm:bottom-6 sm:right-6",
        "px-3 py-2 rounded-full text-xs font-semibold shadow-elevated border",
        "transition-colors duration-150",
        isSubscribed
          ? "bg-green-50 text-success border-green-200 hover:bg-green-100"
          : "bg-gray-100 text-text-secondary border-gray-200 hover:bg-gray-200"
      )}
      title="Dev: toggle mock subscription"
    >
      Subscribed: {isSubscribed ? "ON" : "OFF"}
    </button>
  );
}
