"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { updatePassword } from "@/app/actions/auth";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await updatePassword(fd);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
    // success redirects via server action
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-gradient-to-br from-primary-dark via-primary to-accent-dark">
      <div className="w-full max-w-[420px] rounded-2xl bg-surface shadow-elevated border border-border p-6 sm:p-8 space-y-5">
        <div className="flex flex-col items-center text-center gap-2">
          <Logo size={64} />
          <h1 className="font-heading text-xl font-bold text-text-primary">
            Set new password
          </h1>
          <p className="text-sm text-text-secondary">
            Choose a new password for your account
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-error text-sm">
              {error}
            </div>
          )}
          <Input
            name="password"
            type="password"
            label="New password"
            required
            minLength={6}
            placeholder="Min 6 characters"
            autoComplete="new-password"
          />
          <Input
            name="confirmPassword"
            type="password"
            label="Confirm password"
            required
            minLength={6}
            autoComplete="new-password"
          />
          <Button type="submit" fullWidth loading={loading}>
            Update password
          </Button>
          <p className="text-center text-sm text-text-muted">
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
