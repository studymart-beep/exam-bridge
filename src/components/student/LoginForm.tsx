"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import BiometricLoginButton from "@/components/shared/BiometricLoginButton";
import { signInStudent } from "@/app/actions/auth";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await signInStudent(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-2xl bg-coral-light text-coral-dark text-sm border border-coral/25">
          {error}
        </div>
      )}
      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="you@email.com"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div>
        <PasswordInput
          name="password"
          label="Password"
          placeholder="Your password"
          required
          autoComplete="current-password"
        />
        <div className="mt-1.5 flex items-center justify-between">
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
          {/* subtle one-tap fingerprint — sits quietly beside the forgot link */}
          <span className="sm:hidden inline-flex items-center gap- col justify-center mt-0.5">
            <BiometricLoginButton email={email} subtle />
          </span>
        </div>
      </div>
      <Button type="submit" fullWidth loading={loading}>
        Log in
      </Button>
      {/* fingerprint link below the button for returning users */}
      <div className="text-center">
        <BiometricLoginButton email={email} />
      </div>
    </form>
  );
}
