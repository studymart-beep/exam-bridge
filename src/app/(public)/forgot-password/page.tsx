"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/shared/AuthShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await requestPasswordReset(fd);
    setSent(Boolean(res?.success));
    if (res?.error) setError(res.error);
    setLoading(false);
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we'll send a reset link"
    >
      {sent ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-primary-light border border-border-green text-sm text-primary-dark">
            Check your inbox. If an account exists for that email, a reset link
            is on its way.
          </div>
          <Link href="/login" className="block">
            <Button variant="outline" fullWidth>
              Back to login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-coral-light text-coral-dark text-sm border border-coral/25">
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
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              Back to login
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
