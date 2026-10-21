"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/brand/Logo";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { updatePassword } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "link_expired") {
      setError("This reset link is invalid or has expired. Request a new one.");
    }

    async function absorbHashSession() {
      if (typeof window === "undefined") return;
      const hash = window.location.hash?.replace(/^#/, "");
      if (!hash) {
        setReady(true);
        return;
      }
      const params = new URLSearchParams(hash);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (access_token && refresh_token) {
        try {
          const supabase = createClient();
          await supabase.auth.setSession({ access_token, refresh_token });
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search
          );
        } catch {
          setError("Could not open reset session. Request a new link.");
        }
      }
      setReady(true);
    }
    void absorbHashSession();
  }, [searchParams]);

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
          <PasswordInput
            name="password"
            label="New password"
            required
            minLength={6}
            placeholder="Min 6 characters"
            autoComplete="new-password"
          />
          <PasswordInput
            name="confirmPassword"
            label="Confirm password"
            required
            minLength={6}
            autoComplete="new-password"
          />
          <Button type="submit" fullWidth loading={loading || !ready}>
            Update password
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
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-primary-dark text-white">
          Loading…
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
