"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { copyToClipboard } from "@/lib/utils";

const BANK = {
  name: "Zenith Bank Plc",
  accountName: "Exam Bridge Nigeria Limited",
  accountNumber: "1012345678",
  reference: "EB + your phone number",
};

export default function SubscribeForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCopy = async (text: string, label: string) => {
    try {
      await copyToClipboard(text);
      showToast(`${label} copied!`, "success");
    } catch {
      showToast("Could not copy", "error");
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      showToast("Please upload proof of payment", "warning");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    router.push("/subscribe/pending");
  };

  return (
    <div className="space-y-6">
      {/* Status warning */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">
            You do not have an active subscription
          </p>
          <p className="mt-0.5 text-xs text-amber-700">
            Subscribe today to unlock all exams, past questions, and premium study resources.
          </p>
        </div>
      </div>

      {/* Price card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-text-primary">
              Exam Bridge Premium
            </h3>
            <p className="text-xs text-text-muted">Full access to all features</p>
          </div>
        </div>
        <p className="text-3xl font-heading font-bold text-primary">
          ₦5,000 <span className="text-base font-medium text-text-secondary">/ month</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Cancel anytime
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Secure payment
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Instant access
          </span>
        </div>
      </div>

      {/* Bank details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          <h3 className="font-heading font-semibold text-text-primary">
            Bank Transfer Details
          </h3>
        </div>
        <p className="text-xs text-text-muted">
          Make a bank transfer and upload proof of payment.
        </p>

        {[
          { label: "Bank Name", value: BANK.name },
          { label: "Account Name", value: BANK.accountName },
          { label: "Account Number", value: BANK.accountNumber, copy: true },
          { label: "Reference", value: BANK.reference, copy: true },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
          >
            <div>
              <p className="text-xs text-text-muted">{row.label}</p>
              <p className="text-sm font-medium text-text-primary">{row.value}</p>
            </div>
            {row.copy && (
              <button
                type="button"
                onClick={() => handleCopy(row.value, row.label)}
                className="p-2 rounded-lg text-text-muted hover:bg-gray-100 hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}
          </div>
        ))}

        <div className="flex items-start gap-2 p-2.5 bg-primary-light/50 rounded-xl text-xs text-primary">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Use the correct reference to ensure your payment is matched.
        </div>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <h3 className="font-heading font-semibold text-text-primary">
            Upload Proof of Payment
          </h3>
        </div>
        <p className="text-xs text-text-muted mb-3">
          Upload a screenshot or receipt of your bank transfer.
        </p>

        <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-primary/30 rounded-2xl bg-primary-light/30 cursor-pointer hover:bg-primary-light/50 transition-colors">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium text-primary">
            {file ? file.name : "Upload proof of payment"}
          </span>
          <span className="text-xs text-text-muted">PNG, JPG or PDF (max 5MB)</span>
          <input
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      <Button fullWidth size="lg" loading={loading} onClick={handleSubmit}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Submit Payment Proof
      </Button>

      <p className="text-center text-xs text-text-muted flex items-center justify-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Your payment will be verified within 30 minutes
      </p>
    </div>
  );
}
