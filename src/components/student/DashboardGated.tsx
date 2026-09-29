"use client";

import Link from "next/link";
import { useSubscription } from "@/lib/subscription/context";
import SubscriptionBanner from "@/components/student/SubscriptionBanner";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface Tile {
  href: string;
  label: string;
  sub: string;
}

interface DashboardGatedProps {
  children: React.ReactNode;
  /** Quick tile hrefs that are considered locked content */
  lockedHrefs?: string[];
}

export default function DashboardGated({
  children,
  lockedHrefs = ["/subjects", "/cbt", "/results", "/progress"],
}: DashboardGatedProps) {
  const { isSubscribed, ready } = useSubscription();

  if (!ready) {
    return <div className="h-24 bg-gray-50 animate-pulse rounded-2xl mx-4 mt-4" />;
  }

  return (
    <>
      {!isSubscribed && <SubscriptionBanner />}
      <div className={cn(!isSubscribed && "[&_[data-gated]]:opacity-60")}>
        {/* Marker attribute applied via CSS parent — children stay clickable */}
        <div data-gated={!isSubscribed ? "true" : undefined}>
          {children}
        </div>
      </div>
      {!isSubscribed && (
        <div className="px-4 sm:px-6 max-w-3xl mx-auto pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
            <Badge variant="warning">Locked</Badge>
            <span>Subjects, CBT, Progress & Results require a subscription.</span>
            <Link href="/subscribe" className="text-primary font-semibold hover:underline">
              Subscribe Now
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

/** Dimmed locked tile chip for dashboard quick links */
export function LockedChip({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-700">
      Locked
    </span>
  );
}
