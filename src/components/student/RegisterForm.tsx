"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { signUpStudent } from "@/app/actions/auth";
import { NIGERIA_STATES } from "@/lib/constants/nigeria-states";

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
    const state = String(formData.get("stateOfOrigin") || "").trim();
    if (!state) {
      setError("Please select your state of origin");
      setLoading(false);
      return;
    }
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
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          State of Origin <span className="text-error">*</span>
        </label>
        <select
          name="stateOfOrigin"
          required
          defaultValue=""
          className="w-full h-11 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="" disabled>
            Select your state
          </option>
          {NIGERIA_STATES.map((s) => (
            <option key={s} value={s === "FCT" ? "FCT (Abuja)" : s}>
              {s === "FCT" ? "FCT (Abuja)" : s}
            </option>
          ))}
        </select>
      </div>
      <Input name="password" type="password" label="Password" placeholder="Min 6 characters" required />
      <Input name="confirmPassword" type="password" label="Confirm password" required />
      <label className="flex items-start gap-2 text-sm text-text-secondary">
        <input type="checkbox" name="terms" required className="mt-1" />
        I agree to the terms of use
      </label>
      <Button type="submit" fullWidth loading={loading}>
        Create account
      </Button>
    </form>
  );
}
