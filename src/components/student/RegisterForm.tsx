"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { signUpStudent } from "@/app/actions/auth";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") || "");
    const confirm = String(formData.get("confirmPassword") || "");
    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    const result = await signUpStudent(formData);
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
      <Input name="fullName" label="Full name" placeholder="Ada Okafor" required />
      <Input name="email" type="email" label="Email" placeholder="you@email.com" required />
      <Input name="phone" type="tel" label="Phone" placeholder="+234 800 000 0000" />
      <Input name="password" type="password" label="Password" placeholder="Min 6 characters" required />
      <Input name="confirmPassword" type="password" label="Confirm password" required />
      <label className="flex items-start gap-2 text-sm text-text-secondary">
        <input type="checkbox" name="terms" required className="mt-1" />
        I agree to the terms of use
      </label>
      <Button type="submit" fullWidth loading={loading}>
        Create account
      </Button>
      <p className="text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
