"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { startAuthentication, browserSupportsWebAuthn } from "@simplewebauthn/browser";
import {
  startPasskeyLogin,
  finishPasskeyLogin,
} from "@/lib/actions/passkeys";

const EMAIL_KEY = "eb_last_email";

type Props = {
  /** Controlled email from the form above — when provided, no separate box */
  email?: string;
  variant?: "student" | "admin";
  /** full-width secondary button vs subtle icon chip */
  subtle?: boolean;
};

/**
 * Discreet passkey login. When the email field is already filled we offer a
 * silent one-tap: a small fingerprint icon that immediately opens the device
 * prompt. No loud "or" banner, no separate email box. Only rendered when the
 * browser supports WebAuthn.
 */
export default function BiometricLoginButton({
  email,
  variant = "student",
  subtle = false,
}: Props) {
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

  const resolvedEmail = (email || emailInput || "").trim().toLowerCase();

  async function onClick() {
    setError(null);
    if (!resolvedEmail) {
      setError("Enter your email above first.");
      return;
    }
    setLoading(true);
    try {
      const start = await startPasskeyLogin(resolvedEmail);
      if (!start.success) {
        // No passkey on file — silently ignore (user can type a password).
        setLoading(false);
        return;
      }
      const authResp = await startAuthentication({ optionsJSON: start.options });
      const finish = await finishPasskeyLogin(resolvedEmail, authResp);
      if (!finish.success) {
        setError("error" in finish ? finish.error : "Login failed");
        setLoading(false);
        return;
      }
      try {
        localStorage.setItem(EMAIL_KEY, resolvedEmail);
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

  // subtle mode: a fingerprint icon, only when the email is already known
  if (subtle && resolvedEmail) {
    return (
      <span className="inline-flex items-center">
        <button
          type="button"
          onClick={() => void onClick()}
          disabled={loading}
          aria-label={`Sign in with ${variant === "admin" ? "your" : "your"} fingerprint`}
          title="Sign in with fingerprint / Face ID"
          className="w-9 h-9 rounded-full border border-border bg-surface text-primary grid place-items-center hover:bg-primary-light transition-colors disabled:opacity-60"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a5 5 0 00-5 5v4" />
              <path d="M12 7a1.5 1.5 0 011.5 1.5v2.5" />
              <path d="M9.5 9.8A2.1 2.1 0 0112 8.5c.9 0 1.7.6 2 1.4" />
              <path d="M7 12h.01M17 12h.01" />
              <path d="M8 19a8.9 8.9 0 0016 0M2 11a8.9 8.9 0 017-8.6" />
            </svg>
          )}
        </button>
        {error && <span className="ml-2 text-xs text-error">{error}</span>}
      </span>
    );
  }

  // quiet link-style fallback when the email isn't available as a controlled prop
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={loading}
        className="text-xs font-semibold text-text-secondary hover:text-primary inline-flex items-center gap-1.5 min-h-[44px]"
        aria-label="Sign in with fingerprint"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a5 5 0 00-5 5v4M7 12h.01M17 12h.01M8 19a8.9 8.9 0 0016 0M2 11a8.9 8.9 0 017-8.6" />
        </svg>
        Sign in with fingerprint
      </button>
      {error && <span className="text-xs text-error">{error}</span>}
    </span>
  );
}
