"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const KEY = "eb_subscription_popup_shown";

export default function SubscriptionPrompt({
  show,
}: {
  show: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!show) return;
    try {
      if (sessionStorage.getItem(KEY) === "1") return;
      setOpen(true);
      sessionStorage.setItem(KEY, "1");
    } catch {
      setOpen(true);
    }
  }, [show]);

  if (!show) return null;

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="Unlock full access"
    >
      <p className="text-sm text-text-secondary mb-4">
        Subscribe to access all videos, PDFs, and CBT practice exams.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Link href="/subscribe" className="flex-1">
          <Button fullWidth>Subscribe Now</Button>
        </Link>
        <Button
          fullWidth
          variant="outline"
          onClick={() => setOpen(false)}
        >
          Maybe later
        </Button>
      </div>
    </Modal>
  );
}
