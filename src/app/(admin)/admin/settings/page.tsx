import AdminHeader from "@/components/admin/AdminHeader";
import Card from "@/components/ui/Card";
import { adminGetSettings } from "@/lib/data/admin/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await adminGetSettings();

  return (
    <div>
      <AdminHeader title="Settings" subtitle="Platform configuration" />
      <div className="px-4 sm:px-6 py-5 max-w-lg mx-auto">
        <Card>
          <SettingsForm
            initial={{
              subscription_price: settings.subscription_price || "5000",
              bank_name: settings.bank_name || "",
              account_name: settings.account_name || "",
              account_number: settings.account_number || "",
            }}
          />
        </Card>
      </div>
    </div>
  );
}
