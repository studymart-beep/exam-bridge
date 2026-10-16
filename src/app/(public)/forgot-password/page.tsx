"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await requestPasswordReset(fd);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-gradient-to-br from-primary-dark via-primary to-accent-dark">
      <div className="w-full max-w-[420px] rounded-2xl bg-surface shadow-elevated border border-border p-6 sm:p-8 space-y-5">
        <div className="flex flex-col items-center text-center gap-2">
          <Logo size={64} />
          <h1 className="font-heading text-xl font-bold text-text-primary">
            Forgot password
          </h1>
          <p className="text-sm text-text-secondary">
            Enter your email and we&apos;ll send a reset link
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary text-center p-3 rounded-xl bg-primary-light border border-border-green">
              If an account exists with that email, a reset link has been sent.
              Check your inbox.
            </p>
            <Link
              href="/login"
              className="block text-center text-sm font-semibold text-primary hover:underline"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-error text-sm">
                {error}
              </div>
            )}
            <Input
              name="email"
              type="email"
              label="Email"
              required
              placeholder="you@email.com"
              autoComplete="email"
            />
            <Button type="submit" fullWidth loading={loading}>
              Send reset link
            </Button>
            <p className="text-center text-sm text-text-muted">
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
