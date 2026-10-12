"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import {
  updateProfile,
  changePassword,
} from "@/lib/actions/student/profile";
import { signOut } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import AvatarUpload from "@/components/shared/AvatarUpload";
import { NIGERIA_STATES } from "@/lib/constants/nigeria-states";

export type ProfileHubProps = {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  stateOfOrigin: string | null;
  active: boolean;
  expiresAt: string | null;
  daysLeft: number | null;
  stats: {
    subjects: number;
    avgProgress: number;
    attempts: number;
    daysLeftSub: number | null;
  };
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileHub({
  fullName,
  email,
  phone,
  avatarUrl,
  stateOfOrigin,
  active,
  expiresAt,
  daysLeft,
  stats,
}: ProfileHubProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [name, setName] = useState(fullName);
  const [phoneVal, setPhoneVal] = useState(phone);
  const [stateVal, setStateVal] = useState(stateOfOrigin || "");
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pending, startTransition] = useTransition();

  function saveProfile() {
    startTransition(async () => {
      const res = await updateProfile({ fullName: name, phone: phoneVal, stateOfOrigin: stateVal });
      if (!res.success) showToast(res.error, "error");
      else {
        showToast("Profile updated", "success");
        setEditOpen(false);
        router.refresh();
      }
    });
  }

  function savePassword() {
    if (newPw !== confirmPw) {
      showToast("Passwords do not match", "error");
      return;
    }
    startTransition(async () => {
      const res = await changePassword({
        currentPassword: curPw,
        newPassword: newPw,
      });
      if (!res.success) showToast(res.error, "error");
      else {
        showToast("Password updated", "success");
        setPwOpen(false);
        setCurPw("");
        setNewPw("");
        setConfirmPw("");
      }
    });
  }

  const tiles = [
    {
      href: "/subjects",
      label: "My Subjects",
      sub: "Continue learning",
      color: "text-primary bg-primary-light",
    },
    {
      href: "/cbt",
      label: "CBT Practice",
      sub: "Test your knowledge",
      color: "text-accent-dark bg-accent-light",
    },
    {
      href: "/progress",
      label: "Progress",
      sub: "Track your study",
      color: "text-primary bg-primary-light",
    },
    {
      href: "/results",
      label: "Results",
      sub: "Past attempts",
      color: "text-accent-dark bg-accent-light",
    },
  ];

  const rows: {
    label: string;
    sub: string;
    href?: string;
    onClick?: () => void;
    danger?: boolean;
  }[] = [
    {
      label: "Personal Information",
      sub: "Edit name and phone",
      onClick: () => setEditOpen(true),
    },
    {
      label: "Subscription & Plans",
      sub: "View or upgrade your plan",
      href: "/subscribe",
    },
    {
      label: "Account Security",
      sub: "Change password",
      onClick: () => setPwOpen(true),
    },
    {
      label: "Notifications",
      sub: "Alerts and messages",
      href: "/notifications",
    },
    {
      label: "Help & Support",
      sub: "FAQs, contact us",
      href: "mailto:support@exambridge.app",
    },
  ];

  return (
    <div className="space-y-5 pb-10">
      {/* Identity */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-dark via-primary to-primary-dark text-white p-5 shadow-md">
        <div className="flex items-start gap-4">
          <AvatarUpload name={fullName || email || "S"} avatarUrl={avatarUrl} size={80} />
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg sm:text-xl font-bold truncate">
              {fullName || "Student"}
            </h2>
            <p className="text-sm text-white/80 truncate">{email}</p>
            {stateOfOrigin && (
              <p className="text-xs text-white/70 mt-0.5">{stateOfOrigin}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15">
                Student
              </span>
              <span
                className={cn(
                  "inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full",
                  active ? "bg-secondary text-primary-dark" : "bg-white/20"
                )}
              >
                {active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-xs text-white/70 mt-2">
              Better preparation. A brighter future.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-4 gap-2 rounded-xl bg-black/20 p-3">
          {[
            { n: stats.subjects, l: "Subjects" },
            { n: `${stats.avgProgress}%`, l: "Progress" },
            { n: stats.attempts, l: "CBT" },
            {
              n:
                stats.daysLeftSub !== null && stats.daysLeftSub >= 0
                  ? stats.daysLeftSub
                  : "—",
              l: "Days left",
            },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="font-heading font-bold text-base sm:text-lg">{s.n}</p>
              <p className="text-[10px] sm:text-xs text-white/70 leading-tight">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription card */}
      <div
        className={cn(
          "rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3",
          active
            ? "border-primary/20 bg-primary-light/50"
            : "border-accent/40 bg-accent-light"
        )}
      >
        <div className="flex-1 min-w-0">
          {active ? (
            <>
              <p className="font-semibold text-primary text-sm">
                Subscription active
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Expires{" "}
                {expiresAt
                  ? new Date(expiresAt).toLocaleDateString()
                  : "—"}
                {daysLeft !== null ? ` · ${daysLeft} days left` : ""}
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-text-primary text-sm">
                Subscribe to unlock content
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Access videos, PDFs, and CBT practice
              </p>
            </>
          )}
        </div>
        <Link href="/subscribe">
          <Button size="sm" variant={active ? "outline" : "primary"}>
            {active ? "Manage" : "Subscribe Now"}
          </Button>
        </Link>
      </div>

      {/* Quick tiles */}
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="rounded-2xl border border-border bg-surface p-4 hover:border-primary/30 transition-colors min-h-[88px]"
          >
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold mb-2",
                t.color
              )}
            >
              →
            </div>
            <p className="text-sm font-semibold text-text-primary">{t.label}</p>
            <p className="text-xs text-text-muted mt-0.5">{t.sub}</p>
          </Link>
        ))}
      </div>

      {/* Settings list */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden divide-y divide-border">
        {rows.map((r) => {
          const inner = (
            <>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">{r.label}</p>
                <p className="text-xs text-text-muted">{r.sub}</p>
              </div>
              <span className="text-text-muted shrink-0">›</span>
            </>
          );
          if (r.href) {
            return (
              <Link
                key={r.label}
                href={r.href}
                className="flex items-center justify-between gap-3 px-4 min-h-[56px] hover:bg-primary-light/40"
              >
                {inner}
              </Link>
            );
          }
          return (
            <button
              key={r.label}
              type="button"
              onClick={r.onClick}
              className="w-full flex items-center justify-between gap-3 px-4 min-h-[56px] hover:bg-primary-light/40 text-left"
            >
              {inner}
            </button>
          );
        })}
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center justify-between gap-3 px-4 min-h-[56px] text-error hover:bg-red-50 text-left"
          >
            <div>
              <p className="text-sm font-medium">Log Out</p>
              <p className="text-xs text-error/70">Sign out from your account</p>
            </div>
            <span>›</span>
          </button>
        </form>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile">
        <div className="space-y-4">
          <Input
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Phone"
            value={phoneVal}
            onChange={(e) => setPhoneVal(e.target.value)}
            placeholder="Optional"
          />
          <label className="block text-sm font-medium text-text-primary mb-1">
            State of Origin
          </label>
          <select
            className="w-full h-11 rounded-lg border border-border bg-surface px-3 text-sm"
            value={stateVal}
            onChange={(e) => setStateVal(e.target.value)}
          >
            <option value="">Not set</option>
            {NIGERIA_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <p className="text-xs text-text-muted">Email cannot be changed here.</p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button loading={pending} onClick={saveProfile}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="Change password">
        <div className="space-y-4">
          <Input
            label="Current password"
            type="password"
            value={curPw}
            onChange={(e) => setCurPw(e.target.value)}
          />
          <Input
            label="New password"
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setPwOpen(false)}>
              Cancel
            </Button>
            <Button loading={pending} onClick={savePassword}>
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
