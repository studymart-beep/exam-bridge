"use client";

import { useState, useTransition } from "react";
import { signInAdmin } from "@/lib/actions/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-soft p-6 sm:p-8">
        <h1 className="text-xl font-heading font-bold text-text-primary text-center">Admin Login</h1>
        <p className="text-sm text-text-muted text-center mt-1">Exam Bridge control panel</p>
        <form
          className="mt-6 space-y-4"
          action={(fd) => {
            setError(null);
            startTransition(async () => {
              const res = await signInAdmin(fd);
              if (res?.error) setError(res.error);
            });
          }}
        >
          <Input label="Email" name="email" type="email" required placeholder="admin@example.com" />
          <Input label="Password" name="password" type="password" required />
          {error && (
            <p className="text-sm text-error bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
          )}
          <Button type="submit" fullWidth loading={pending}>Sign in</Button>
        </form>
      </div>
    </div>
  );
}
