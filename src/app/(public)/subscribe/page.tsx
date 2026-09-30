import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import { getPublicSettings } from "@/lib/data/student/settings";
import { getCurrentProfile } from "@/lib/data/student/profile";
import { createClient } from "@/lib/supabase/server";
import SubscribeForm from "@/components/student/SubscribeForm";

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
        .eq("status", "pending")
        .limit(1)
        .maybeSingle();
      pending = Boolean(data);
    } catch {
      pending = false;
    }
  }

  const ready =
    settings.subscription_price &&
    settings.bank_name &&
    settings.account_name &&
    settings.account_number;

  return (
    <div>
      <StudentHeader title="Subscribe" userName={profile?.full_name || "Student"} />
      <div className="px-4 sm:px-6 py-5 max-w-lg mx-auto space-y-5">
        {!ready ? (
          <Card className="text-center py-10">
            <p className="text-sm text-text-muted">
              Setup in progress. Payment details will appear once the admin configures bank settings.
            </p>
          </Card>
        ) : pending ? (
          <Card className="text-center py-10 space-y-2">
            <p className="font-heading font-semibold text-text-primary">Payment pending review</p>
            <p className="text-sm text-text-muted">
              Your receipt was submitted. An admin will approve it shortly.
            </p>
          </Card>
        ) : (
          <SubscribeForm
            price={settings.subscription_price}
            bankName={settings.bank_name}
            accountName={settings.account_name}
            accountNumber={settings.account_number}
            defaultName={profile?.full_name || ""}
          />
        )}
      </div>
    </div>
  );
}
