"use client";

import { useActionState } from "react";
import Logo from "@/components/brand/Logo";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { signInAdmin } from "@/app/actions/auth";
import type { AuthResult } from "@/app/actions/auth";

async function signInAdminAction(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  return signInAdmin(formData);
}

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(signInAdminAction, null);

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-gradient-to-br from-primary-dark via-primary to-accent-dark">
      <div className="w-full max-w-[420px] rounded-2xl bg-surface shadow-elevated border border-border p-6 sm:p-8 space-y-5">
        <div className="flex flex-col items-center text-center gap-2">
          <Logo size={72} />
          <p className="font-heading font-bold text-primary text-lg">Exam Bridge</p>
          <h1 className="font-heading text-xl font-bold text-text-primary mt-1">
            Admin Sign In
          </h1>
          <p className="text-sm text-text-secondary">Authorized staff only</p>
        </div>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="p-3 rounded-xl bg-red-50 text-error text-sm">
              {state.error}
            </div>
          )}
          <Input
            label="Email"
            name="email"
            type="email"
            required
            placeholder="admin@example.com"
          />
          <div>
            <Input label="Password" name="password" type="password" required />
            <div className="mt-1.5 text-right">
              <a
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>
          </div>
          <Button type="submit" fullWidth loading={pending}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
