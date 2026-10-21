"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  startAuthentication,
  browserSupportsWebAuthn,
} from "@simplewebauthn/browser";
import Button from "@/components/ui/Button";
import {
  startPasskeyLogin,
  finishPasskeyLogin,
} from "@/lib/actions/passkeys";

const EMAIL_KEY = "eb_last_email";

type Props = {
  /** Optional controlled email from the form above */
  email?: string;
  /** student | admin — only affects localStorage key prefix messaging */
  variant?: "student" | "admin";
};

export default function BiometricLoginButton({ email, variant = "student" }: Props) {
  const router = useRouter();
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");

  useEffect(() => {
    setSupported(browserSupportsWebAuthn());
    try {
      const saved = localStorage.getItem(EMAIL_KEY);
      if (saved) setEmailInput(saved);
    } catch {
      /* ignore */
    }
  }, []);

  if (!supported) return null;

  async function onClick() {
    setError(null);
    const em = (email || emailInput || "").trim().toLowerCase();
    if (!em) {
      setError("Enter your email above, then try biometric login.");
      return;
    }
    setLoading(true);
    try {
      const start = await startPasskeyLogin(em);
      if (!start.success) {
        setError(start.error);
        setLoading(false);
        return;
      }
      const authResp = await startAuthentication({ optionsJSON: start.options });
      const finish = await finishPasskeyLogin(em, authResp);
      if (!finish.success) {
        setError("error" in finish ? finish.error : "Login failed");
        setLoading(false);
        return;
      }
      try {
        localStorage.setItem(EMAIL_KEY, em);
      } catch {
        /* ignore */
      }
      const dest =
        "redirectTo" in finish && finish.redirectTo
          ? finish.redirectTo
          : variant === "admin"
            ? "/admin/dashboard"
            : "/dashboard";
      router.replace(dest);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Cancelled";
      if (!/cancel|abort/i.test(msg)) setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-muted">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      {!email && (
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="Email for biometric login"
          className="w-full h-11 px-3 rounded-lg border border-border bg-surface text-sm"
          autoComplete="username"
        />
      )}
      {error && (
        <p className="text-xs text-error text-center">{error}</p>
      )}
      <Button
        type="button"
        variant="secondary"
        fullWidth
        loading={loading}
        onClick={onClick}
      >
        Login with Fingerprint / Face ID
      </Button>
    </div>
  );
}
