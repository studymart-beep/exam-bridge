"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { approvePayment, rejectPayment } from "@/lib/actions/admin/payments";

export default function PaymentActions({ paymentId }: { paymentId: string }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"approve" | "reject" | null>(null);

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setMode("approve")}>
          Approve
        </Button>
        <Button size="sm" variant="outline" onClick={() => setMode("reject")}>
          Reject
        </Button>
      </div>
      <ConfirmDialog
        open={mode !== null}
        onClose={() => setMode(null)}
        onConfirm={() => {
          if (!mode) return;
          startTransition(async () => {
            const res =
              mode === "approve"
                ? await approvePayment(paymentId)
                : await rejectPayment(paymentId);
            if (!res.success) showToast(res.error || "Failed", "error");
            else {
              showToast(mode === "approve" ? "Approved (+30 days)" : "Rejected", "success");
              setMode(null);
              router.refresh();
            }
          });
        }}
        title={mode === "approve" ? "Approve payment?" : "Reject payment?"}
        message={
          mode === "approve"
            ? "Student subscription will be set active for 30 days."
            : "Student will remain without access."
        }
        confirmLabel={mode === "approve" ? "Approve" : "Reject"}
        danger={mode === "reject"}
      />
    </>
  );
}
