import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Subscribe",
  description: "Unlock full access to videos, PDFs, and CBT practice.",
  path: "/subscribe",
});

import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { getPublicSettings } from "@/lib/data/student/settings";
import { getCurrentProfile } from "@/lib/data/student/profile";
import { createClient } from "@/lib/supabase/server";
import SubscribeForm from "@/components/student/SubscribeForm";
import FlutterwavePayButton from "@/components/student/FlutterwavePayButton";

export const dynamic = "force-dynamic";

export default async function SubscribePage() {
  const settings = await getPublicSettings();
  const profile = await getCurrentProfile();

  let pending = false;
  if (profile) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("payments")
        .select("id")
        .eq("student_id", profile.id)
        .in("status", ["pending", "processing"])
        .limit(1)
        .maybeSingle();
      pending = Boolean(data);
    } catch {
      pending = false;
    }
  }

  const price = Number(settings.subscription_price || 0) || 0;
  const automated =
    settings.payment_mode === "flutterwave" &&
    Boolean(settings.flutterwave_public_key);
  const manualReady = Boolean(
    settings.bank_name && settings.account_name && settings.account_number
  );

  return (
    <div>
      <StudentHeader title="Subscribe" userName={profile?.full_name || "Student"} />
      <div className="px-4 sm:px-6 py-5 max-w-lg mx-auto space-y-5">
        {/* Price hero */}
        <div className="relative overflow-hidden rounded-3xl bg-hero-emerald text-white p-5 shadow-tile">
          <span
            aria-hidden
            className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-secondary/15"
          />
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#A7F3D0]">
            {settings.app_name || "Exam Bridge"} Premium
          </p>
          <p className="text-4xl font-heading font-extrabold mt-1.5">
            ₦{price.toLocaleString()}{" "}
            <span className="text-base font-semibold text-[#D1FAE5]">/ month</span>
          </p>
          <p className="text-[13px] text-[#D1FAE5] mt-2">
            Videos, PDF notes and unlimited CBT practice — with offline downloads.
          </p>
        </div>

        {pending ? (
          <Card className="text-center py-10 space-y-2" tint="gold">
            <p className="font-heading font-bold text-text-primary">
              Payment pending review
            </p>
            <p className="text-sm text-text-muted">
              Your payment is being confirmed. An admin will approve it shortly.
            </p>
            <Link href="/dashboard">
              <Button size="sm" variant="outline">
                Back to dashboard
              </Button>
            </Link>
          </Card>
        ) : !automated && !manualReady ? (
          <Card className="text-center py-10" tint="green">
            <p className="text-sm text-text-muted">
              Setup in progress. Payment details will appear once the admin
              configures bank settings.
            </p>
          </Card>
        ) : (
          <>
            {automated && (
              <Section title="Pay now" subtitle="Instant access, no waiting." tint="green" goldBar>
                <FlutterwavePayButton amount={price} />
              </Section>
            )}

            {!automated && manualReady && (
              <Section
                title="How to pay"
                subtitle="Bank transfer, then upload your receipt for approval."
                tint="gold"
                goldBar
              >
                <SubscribeForm
                  price={settings.subscription_price}
                  bankName={settings.bank_name}
                  accountName={settings.account_name}
                  accountNumber={settings.account_number}
                  defaultName={profile?.full_name || ""}
                />
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
