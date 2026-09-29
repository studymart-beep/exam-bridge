"use client";

// NOTE: Subscription enforcement uses profiles.subscription_expires_at after admin approval.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { submitPayment } from "@/lib/actions/payments";
import { copyToClipboard } from "@/lib/utils";

interface Props {
  price: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export default function SubscribeForm({
  price,
  bankName,
  accountName,
  accountNumber,
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCopy = async (text: string, label: string) => {
    try {
      await copyToClipboard(text);
      showToast(`${label} copied!`, "success");
    } catch {
      showToast("Could not copy", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
        <h3 className="font-heading font-semibold text-text-primary">Exam Bridge Premium</h3>
        <p className="text-3xl font-heading font-bold text-primary mt-2">
          ₦{Number(price).toLocaleString()}{" "}
          <span className="text-base font-medium text-text-secondary">/ month</span>
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 space-y-3">
        <h3 className="font-heading font-semibold text-text-primary">Bank transfer</h3>
        {[
          { label: "Bank", value: bankName },
          { label: "Account name", value: accountName },
          { label: "Account number", value: accountNumber },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-text-muted">{row.label}</p>
              <p className="text-sm font-medium">{row.value || "—"}</p>
            </div>
            {row.value && (
              <button
                type="button"
                onClick={() => handleCopy(row.value, row.label)}
                className="text-xs text-primary font-medium"
              >
                Copy
              </button>
            )}
          </div>
        ))}
      </div>

      <form
        className="space-y-4"
        action={(fd) => {
          setError(null);
          startTransition(async () => {
            const res = await submitPayment(fd);
            if (res?.error) {
              setError(res.error);
              return;
            }
            showToast("Payment submitted", "success");
            router.push("/subscribe/pending");
          });
        }}
      >
        <input type="hidden" name="amount" value={price} />
        <Input label="Name used for transfer" name="receipt_name" required />
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Receipt (optional)
          </label>
          <input
            type="file"
            name="receipt"
            accept="image/*,.pdf"
            className="w-full text-sm"
          />
        </div>
        {error && (
          <p className="text-sm text-error bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
        <Button type="submit" fullWidth loading={pending}>
          I have paid
        </Button>
      </form>
    </div>
  );
}
