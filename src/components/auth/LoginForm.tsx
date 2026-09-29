"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      action={(fd) => {
        setError(null);
        startTransition(async () => {
          const res = await signIn(fd);
          if (res?.error) setError(res.error);
        });
      }}
    >
      <Input label="Email" name="email" type="email" required placeholder="you@email.com" />
      <Input label="Password" name="password" type="password" required />
      {error && (
        <p className="text-sm text-error bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
      )}
      <Button type="submit" fullWidth loading={pending}>Sign in</Button>
      <p className="text-center text-sm text-text-muted">
        No account?{" "}
        <Link href="/register" className="text-primary font-medium hover:underline">Register</Link>
      </p>
    </form>
  );
}
