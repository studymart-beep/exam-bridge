"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { startFlutterwavePayment } from "@/lib/actions/payments";

/**
 * Automated payment (Flutterwave). The server action creates the transaction
 * and returns the hosted checkout URL; we navigate the current tab there so the
 * PWA never leaves the app shell for an external browser.
 */
export default function FlutterwavePayButton({
  amount,
  label = "Pay with Card / USSD",
}: {
  amount: number;
  label?: string;
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    const res = await startFlutterwavePayment();
    if (!res.ok) {
      showToast(res.error || "Could not start payment", "error");
      setLoading(false);
      return;
    }
    window.location.href = res.redirectUrl;
  }

  return (
    <div className="space-y-3">
      <Button fullWidth loading={loading} onClick={() => void pay()}>
        {loading ? "Opening secure checkout…" : `${label} · ₦${amount.toLocaleString()}`}
      </Button>
      <p className="text-[11px] text-text-muted text-center">
        Secured by Flutterwave · card, bank transfer or USSD. Access unlocks
        automatically once payment succeeds.
      </p>
    </div>
  );
}
