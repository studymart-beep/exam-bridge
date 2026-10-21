"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { signInStudent } from "@/app/actions/auth";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        <div className="p-3 rounded-xl bg-red-50 text-error text-sm">{error}</div>
      )}
      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="you@email.com"
        required
        autoComplete="email"
      />
      <div>
        <PasswordInput
          name="password"
          label="Password"
          placeholder="Your password"
          required
          autoComplete="current-password"
        />
        <div className="mt-1.5 text-right">
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
      <Button type="submit" fullWidth loading={loading}>
        Log in
      </Button>
    </form>
  );
}
