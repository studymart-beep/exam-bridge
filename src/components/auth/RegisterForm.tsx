"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      action={(fd) => {
        setError(null);
        startTransition(async () => {
          const res = await signUp(fd);
          if (res?.error) setError(res.error);
        });
      }}
    >
      <Input label="Full name" name="full_name" required placeholder="Ada Okafor" />
      <Input label="Phone" name="phone" type="tel" placeholder="+234…" />
      <Input label="Email" name="email" type="email" required placeholder="you@email.com" />
      <Input label="Password" name="password" type="password" required minLength={6} />
      {error && (
        <p className="text-sm text-error bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
      )}
      <Button type="submit" fullWidth loading={pending}>Create account</Button>
      <p className="text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
