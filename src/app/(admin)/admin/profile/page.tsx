import AdminHeader from "@/components/admin/AdminHeader";
import AdminProfileHub from "@/components/admin/AdminProfileHub";
import { createClient } from "@/lib/supabase/server";
import { adminGetDashboardStats } from "@/lib/data/admin/reports";
import { adminGetSettings } from "@/lib/data/admin/settings";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/admin/login");

  const [stats, settings] = await Promise.all([
    adminGetDashboardStats(),
    adminGetSettings(),
  ]);

  return (
    <div>
      <AdminHeader title="Profile" subtitle="Account & platform settings" />
      <div className="px-4 sm:px-6 py-5">
        <AdminProfileHub
          fullName={profile.full_name || ""}
          email={profile.email || user.email || ""}
          phone={profile.phone || ""}
          stats={{
            students: stats.students,
            activeSubs: stats.activeSubs ?? 0,
            pendingPayments: stats.pendingPayments ?? 0,
            subjects: stats.subjects,
          }}
          settings={{
            subscription_price: settings.subscription_price || "5000",
            bank_name: settings.bank_name || "",
            account_name: settings.account_name || "",
            account_number: settings.account_number || "",
          }}
        />
      </div>
    </div>
  );
}
