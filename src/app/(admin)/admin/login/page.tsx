"use client";

import AuthShell from "@/components/shared/AuthShell";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { signInAdmin } from "@/app/actions/auth";
import type { AuthResult } from "@/app/actions/auth";
import { useActionState, useState } from "react";
import BiometricLoginButton from "@/components/shared/BiometricLoginButton";

async function signInAdminAction(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  return signInAdmin(formData);
}

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(signInAdminAction, null);
  const [email, setEmail] = useState("");
  return (
    <AuthShell
      title="Admin Sign In"
      subtitle="Authorized staff only"
      brand="Exam Bridge"
    >
      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="p-3 rounded-2xl bg-coral-light text-coral-dark text-sm border border-coral/25">
            {state.error}
          </div>
        )}
        <Input
          label="Email"
          name="email"
          type="email"
          required
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <PasswordInput
            label="Password"
            name="password"
            required
            autoComplete="current-password"
          />
          <div className="mt-1.5 flex items-center justify-between">
            <a
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </a>
            <span className="inline-flex">
              <BiometricLoginButton email={email} variant="admin" subtle />
            </span>
          </div>
        </div>
        <Button type="submit" fullWidth loading={pending}>
          Sign in
        </Button>
        <div className="text-center">
          <BiometricLoginButton email={email} variant="admin" />
        </div>
      </form>
    </AuthShell>
  );
}
