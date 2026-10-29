"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import SubjectPicker, {
  type PickerSubject,
} from "@/components/shared/SubjectPicker";
import { signUpStudent } from "@/app/actions/auth";
import { NIGERIA_STATES } from "@/lib/constants/nigeria-states";

export default function RegisterForm({
  subjects = [],
}: {
  subjects?: PickerSubject[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubjectError(null);
    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") || "");
    const confirm = String(formData.get("confirmPassword") || "");
    const state = String(formData.get("stateOfOrigin") || "").trim();

    if (!picked.length) {
      setSubjectError("Choose at least one subject to continue.");
      setError("Choose at least one subject you are studying.");
      setLoading(false);
      return;
    }
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
    // subject ids ride along in the form so the server action can validate them
    formData.set("subjectIds", JSON.stringify(picked));

    const result = await signUpStudent(formData);
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
      <Input name="fullName" label="Full name" placeholder="Ada Okafor" required />
      <Input name="email" type="email" label="Email" placeholder="you@email.com" required />
      <Input name="phone" type="tel" label="Phone" placeholder="+234 800 000 0000" />

      {subjects.length > 0 ? (
        <SubjectPicker
          subjects={subjects}
          value={picked}
          onChange={(ids) => {
            setPicked(ids);
            if (ids.length) setSubjectError(null);
          }}
          error={subjectError}
        />
      ) : (
        <p className="text-xs text-text-muted">
          Subject selection will appear once the admin publishes subjects.
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          State of Origin <span className="text-error">*</span>
        </label>
        <select
          name="stateOfOrigin"
          required
          defaultValue=""
          className="w-full h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
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
      <PasswordInput
        name="password"
        label="Password"
        placeholder="Min 6 characters"
        required
        autoComplete="new-password"
        minLength={6}
      />
      <PasswordInput
        name="confirmPassword"
        label="Confirm password"
        required
        autoComplete="new-password"
        minLength={6}
      />
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
