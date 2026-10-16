"use client";

import { useState, useTransition } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { signOut, signOutAdmin } from "@/app/actions/auth";

export default function LogoutButton({
  variant = "student",
}: {
  variant?: "student" | "admin";
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      if (variant === "admin") {
        await signOutAdmin();
      } else {
        await signOut();
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between gap-3 px-4 min-h-[56px] text-error hover:bg-red-50 text-left"
      >
        <div>
          <p className="text-sm font-medium">Log Out</p>
          <p className="text-xs text-error/70">
            {variant === "admin"
              ? "Sign out of admin"
              : "Sign out from your account"}
          </p>
        </div>
        <span>›</span>
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        title="Log out?"
        message="You'll need to sign in again to continue."
        confirmLabel="Log Out"
        danger
        loading={pending}
      />
    </>
  );
}
