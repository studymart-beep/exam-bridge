"use client";

import { useState, useTransition } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { saveSettings } from "@/lib/actions/admin/settings";

export default function SettingsForm({
  initial,
}: {
  initial: {
    subscription_price: string;
    bank_name: string;
    account_name: string;
    account_number: string;
  };
}) {
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [price, setPrice] = useState(initial.subscription_price);
  const [bank, setBank] = useState(initial.bank_name);
  const [acctName, setAcctName] = useState(initial.account_name);
  const [acctNum, setAcctNum] = useState(initial.account_number);

  return (
    <form
      className="space-y-4"
      action={() => {
        const fd = new FormData();
        fd.set("subscription_price", price);
        fd.set("bank_name", bank);
        fd.set("account_name", acctName);
        fd.set("account_number", acctNum);
        startTransition(async () => {
          const res = await saveSettings(fd);
          if (!res.success) showToast(res.error || "Failed", "error");
          else showToast("Settings saved", "success");
        });
      }}
    >
      <Input label="Subscription price (₦)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
      <Input label="Bank name" value={bank} onChange={(e) => setBank(e.target.value)} />
      <Input label="Account name" value={acctName} onChange={(e) => setAcctName(e.target.value)} />
      <Input label="Account number" value={acctNum} onChange={(e) => setAcctNum(e.target.value)} />
      <Button type="submit" fullWidth loading={pending}>
        Save settings
      </Button>
    </form>
  );
}
