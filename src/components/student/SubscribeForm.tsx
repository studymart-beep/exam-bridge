"use client";

import { useState, useTransition } from "react";
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
  defaultName?: string;
}

export default function SubscribeForm({
  price,
  bankName,
  accountName,
  accountNumber,
  defaultName = "",
}: Props) {
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(defaultName);
  const [file, setFile] = useState<File | null>(null);

  const handleCopy = async (text: string, label: string) => {
    try {
      await copyToClipboard(text);
      showToast(`${label} copied!`, "success");
    } catch {
      showToast("Could not copy", "error");
    }
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Full name is required");
      return;
    }
    if (!file) {
      setError("Receipt file is required");
      return;
    }
    const fd = new FormData();
    fd.set("receipt_name", name.trim());
    fd.set("receipt", file);
    startTransition(async () => {
      const res = await submitPayment(fd);
      if (res && !res.success) {
        setError(res.error || "Failed");
        showToast(res.error || "Failed", "error");
      }
    });
  }

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
        <h3 className="font-heading font-semibold text-sm">Bank transfer</h3>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Bank</span>
          <button type="button" className="font-medium" onClick={() => handleCopy(bankName, "Bank")}>
            {bankName}
          </button>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Account name</span>
          <button type="button" className="font-medium" onClick={() => handleCopy(accountName, "Name")}>
            {accountName}
          </button>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Account number</span>
          <button type="button" className="font-medium text-primary" onClick={() => handleCopy(accountNumber, "Account number")}>
            {accountNumber}
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 space-y-4">
        <Input
          label="Full name (as on transfer)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Receipt (image or PDF, max 5 MB) *
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            required
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" fullWidth loading={pending}>
          Submit for approval
        </Button>
      </form>
    </div>
  );
}
