"use client";

import { useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../layout";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { defaultPlatformSettings } from "@/lib/mock/adminSettings";
import { useToast } from "@/components/ui/Toast";

export default function AdminSettingsPage() {
  const openMenu = useAdminMenu();
  const { showToast } = useToast();
  const [price, setPrice] = useState(String(defaultPlatformSettings.subscriptionPrice));
  const [duration, setDuration] = useState(String(defaultPlatformSettings.defaultExamDuration));
  const [passMark, setPassMark] = useState(String(defaultPlatformSettings.defaultPassMark));
  const [appName, setAppName] = useState(defaultPlatformSettings.appName);
  const [bankName, setBankName] = useState(defaultPlatformSettings.bankName);
  const [accountName, setAccountName] = useState(defaultPlatformSettings.accountName);
  const [accountNumber, setAccountNumber] = useState(defaultPlatformSettings.accountNumber);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // TODO: persist to backend
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    showToast("Settings saved (mock)", "success");
  };

  return (
    <div>
      <AdminHeader title="Settings" subtitle="Platform configuration" onMenuClick={openMenu} />
      <div className="px-4 sm:px-6 py-5 max-w-lg mx-auto space-y-6">
        <Card className="space-y-4">
          <h3 className="font-heading font-semibold text-text-primary">Subscription</h3>
          {/* TODO: persist to backend */}
          <Input label="Monthly price (₦)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        </Card>

        <Card className="space-y-4">
          <h3 className="font-heading font-semibold text-text-primary">Payment bank details</h3>
          {/* TODO: persist to backend */}
          <Input label="Bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
          <Input label="Account name" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
          <Input label="Account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
        </Card>

        <Card className="space-y-4">
          <h3 className="font-heading font-semibold text-text-primary">Exam defaults</h3>
          {/* TODO: persist to backend */}
          <Input label="Default duration (minutes)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
          <Input label="Default pass mark (%)" type="number" value={passMark} onChange={(e) => setPassMark(e.target.value)} />
        </Card>

        <Card className="space-y-4">
          <h3 className="font-heading font-semibold text-text-primary">Branding</h3>
          {/* TODO: persist to backend */}
          <Input label="App name" value={appName} onChange={(e) => setAppName(e.target.value)} />
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-text-muted">
            Logo upload placeholder
          </div>
        </Card>

        <Button onClick={handleSave} loading={loading} fullWidth size="lg">
          Save settings
        </Button>
      </div>
    </div>
  );
}
