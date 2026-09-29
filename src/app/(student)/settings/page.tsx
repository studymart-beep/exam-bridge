"use client";

import { useState } from "react";
import StudentHeader from "@/components/student/StudentHeader";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState({
    examResults: true,
    studyReminders: true,
    promotions: false,
  });
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!passwordForm.current) err.current = "Current password is required";
    if (!passwordForm.newPass) err.newPass = "New password is required";
    else if (passwordForm.newPass.length < 6)
      err.newPass = "Must be at least 6 characters";
    if (passwordForm.newPass !== passwordForm.confirm)
      err.confirm = "Passwords do not match";
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    showToast("Password updated successfully", "success");
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    showToast("Account deletion requested", "info");
    router.push("/");
  };

  return (
    <div>
      <StudentHeader title="Settings" showBack backHref="/profile" />

      <div className="px-4 sm:px-6 py-5 max-w-lg mx-auto space-y-8">
        {/* Change password */}
        <section>
          <h3 className="font-heading font-semibold text-text-primary mb-4">
            Change Password
          </h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <Input
              label="Current Password"
              type="password"
              value={passwordForm.current}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, current: e.target.value }))
              }
              error={errors.current}
            />
            <Input
              label="New Password"
              type="password"
              value={passwordForm.newPass}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, newPass: e.target.value }))
              }
              error={errors.newPass}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirm}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, confirm: e.target.value }))
              }
              error={errors.confirm}
            />
            <Button type="submit" loading={loading}>
              Update Password
            </Button>
          </form>
        </section>

        {/* Notification preferences */}
        <section>
          <h3 className="font-heading font-semibold text-text-primary mb-4">
            Notification Preferences
          </h3>
          <div className="space-y-3">
            {(
              [
                { key: "examResults" as const, label: "Exam results", desc: "Get notified when CBT results are ready" },
                { key: "studyReminders" as const, label: "Study reminders", desc: "Daily reminders to keep your streak" },
                { key: "promotions" as const, label: "Promotions", desc: "News about offers and new features" },
              ] as const
            ).map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-soft cursor-pointer"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {item.label}
                  </p>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prefs[item.key]}
                  onClick={() =>
                    setPrefs((p) => ({ ...p, [item.key]: !p[item.key] }))
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    prefs[item.key] ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      prefs[item.key] ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <h3 className="font-heading font-semibold text-error mb-4">
            Danger Zone
          </h3>
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
            <p className="text-sm text-text-primary font-medium">
              Delete Account
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Permanently delete your account and all data. This cannot be undone.
            </p>
            <Button
              variant="danger"
              size="sm"
              className="mt-3"
              onClick={() => setDeleteOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </section>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Account?"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Forever
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to permanently delete your account? All your
          progress, results, and subscription will be lost.
        </p>
      </Modal>
    </div>
  );
}
