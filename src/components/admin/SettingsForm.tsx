"use client";

import { useState, useTransition } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { saveSettings } from "@/lib/actions/admin/settings";
import { cn } from "@/lib/utils";

export type AdminSettingsValues = {
  subscription_price: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  telegram_support_url: string;
  payment_mode: string;
  flutterwave_public_key: string;
  /** write-only: the stored value is never sent to the browser */
  flutterwave_secret_key?: string;
  flutterwave_webhook_secret?: string;
};

/** Payment mode switch — manual bank transfer vs automated Flutterwave. */
export function PaymentModeToggle({
  value,
  onChange,
}: {
  value: "manual" | "flutterwave";
  onChange: (v: "manual" | "flutterwave") => void;
}) {
  const opts: { id: "manual" | "flutterwave"; label: string; sub: string }[] = [
    { id: "manual", label: "Manual (Bank Transfer)", sub: "Receipt upload + admin approval" },
    { id: "flutterwave", label: "Automated (Flutterwave)", sub: "Card / USSD, instant access" },
  ];
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {opts.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            aria-pressed={on}
            className={cn(
              "text-left rounded-2xl border p-3.5 min-h-[68px] transition-all",
              on
                ? "border-primary bg-primary-light shadow-card"
                : "border-border bg-surface hover:border-primary/40"
            )}
          >
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "w-4 h-4 rounded-full border-2 shrink-0",
                  on ? "border-primary bg-primary" : "border-border"
                )}
              />
              <span className="font-heading font-bold text-sm text-text-primary">
                {o.label}
              </span>
            </span>
            <span className="block text-xs text-text-muted mt-1 ml-6">{o.sub}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function SettingsForm({
  initial,
  onSaved,
}: {
  initial: AdminSettingsValues;
  onSaved?: () => void;
}) {
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [v, setV] = useState<AdminSettingsValues>(initial);

  const set = (k: keyof AdminSettingsValues) => (val: string) =>
    setV((p) => ({ ...p, [k]: val }));

  function submit() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("subscription_price", v.subscription_price);
      fd.set("bank_name", v.bank_name);
      fd.set("account_name", v.account_name);
      fd.set("account_number", v.account_number);
      fd.set("telegram_support_url", v.telegram_support_url);
      fd.set("payment_mode", v.payment_mode);
      fd.set("flutterwave_public_key", v.flutterwave_public_key);
      if (v.flutterwave_secret_key) fd.set("flutterwave_secret_key", v.flutterwave_secret_key);
      if (v.flutterwave_webhook_secret)
        fd.set("flutterwave_webhook_secret", v.flutterwave_webhook_secret);

      const res = await saveSettings(fd);
      if (!res.success) showToast(res.error || "Failed", "error");
      else {
        showToast("Settings saved", "success");
        onSaved?.();
      }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-text-primary mb-1.5">
          Payment mode
        </p>
        <PaymentModeToggle
          value={v.payment_mode === "flutterwave" ? "flutterwave" : "manual"}
          onChange={(m) => set("payment_mode")(m)}
        />
        {v.payment_mode === "flutterwave" && !v.flutterwave_public_key && (
          <p className="text-xs text-warning mt-2">
            Add your Flutterwave public key, or students will fall back to bank
            transfer.
          </p>
        )}
      </div>

      <Input
        label="Subscription price (₦)"
        type="number"
        value={v.subscription_price}
        onChange={(e) => set("subscription_price")(e.target.value)}
      />

      <Input
        label="Telegram support link"
        value={v.telegram_support_url}
        onChange={(e) => set("telegram_support_url")(e.target.value)}
        placeholder="https://t.me/exambridge"
        helperText="Opens from the floating support button on the landing page and dashboard."
      />

      {v.payment_mode === "manual" && (
        <>
          <Input
            label="Bank name"
            value={v.bank_name}
            onChange={(e) => set("bank_name")(e.target.value)}
          />
          <Input
            label="Account name"
            value={v.account_name}
            onChange={(e) => set("account_name")(e.target.value)}
          />
          <Input
            label="Account number"
            value={v.account_number}
            onChange={(e) => set("account_number")(e.target.value)}
          />
        </>
      )}

      {v.payment_mode === "flutterwave" && (
        <>
          <Input
            label="Flutterwave public key"
            value={v.flutterwave_public_key}
            onChange={(e) => set("flutterwave_public_key")(e.target.value)}
            placeholder="FLWPUBK_…"
          />
          <Input
            label="Flutterwave secret key"
            type="password"
            value={v.flutterwave_secret_key || ""}
            onChange={(e) => set("flutterwave_secret_key")(e.target.value)}
            placeholder="FLWPISK_… — paste to set or replace"
            helperText="Stored in a service-role-only table and never shown again. Leave blank to keep the current key."
          />
          <Input
            label="Flutterwave webhook secret"
            type="password"
            value={v.flutterwave_webhook_secret || ""}

            onChange={(e) => set("flutterwave_webhook_secret")(e.target.value)}
            placeholder="Verify hash set in Flutterwave dashboard"
          />
        </>
      )}

      <Button loading={pending} onClick={submit} className="w-full sm:w-auto">
        Save settings
      </Button>
    </div>
  );
}
