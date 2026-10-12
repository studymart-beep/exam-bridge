"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  updateAdminProfile,
  changeAdminPassword,
} from "@/lib/actions/admin/profile";
import { saveSettings } from "@/lib/actions/admin/settings";
import { signOutAdmin } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import AvatarUpload from "@/components/shared/AvatarUpload";
import { NIGERIA_STATES } from "@/lib/constants/nigeria-states";

type Props = {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  stateOfOrigin: string | null;
  stats: {
    students: number;
    activeSubs: number;
    pendingPayments: number;
    subjects: number;
  };
  settings: {
    subscription_price: string;
    bank_name: string;
    account_name: string;
    account_number: string;
  };
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "A";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AdminProfileHub({
  fullName,
  email,
  phone,
  avatarUrl,
  stateOfOrigin,
  stats,
  settings,
}: Props) {
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
  const [price, setPrice] = useState(settings.subscription_price);
  const [bank, setBank] = useState(settings.bank_name);
  const [accName, setAccName] = useState(settings.account_name);
  const [accNum, setAccNum] = useState(settings.account_number);
  const [pending, startTransition] = useTransition();

  function saveProfile() {
    startTransition(async () => {
      const res = await updateAdminProfile({ fullName: name, phone: phoneVal, stateOfOrigin: stateVal });
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
      const res = await changeAdminPassword({
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

  function saveAccountSettings() {
    const fd = new FormData();
    fd.set("subscription_price", price);
    fd.set("bank_name", bank);
    fd.set("account_name", accName);
    fd.set("account_number", accNum);
    startTransition(async () => {
      const res = await saveSettings(fd);
      if (!res.success) showToast(res.error || "Failed", "error");
      else {
        showToast("Settings saved", "success");
        router.refresh();
      }
    });
  }

  const tiles = [
    { href: "/admin/users", label: "Students", sub: "Manage accounts" },
    { href: "/admin/payments", label: "Payments", sub: "Approve receipts" },
    { href: "/admin/subjects", label: "Subjects", sub: "Content library" },
    { href: "/admin/reports", label: "Reports", sub: "Platform stats" },
  ];

  return (
    <div className="space-y-5 pb-10 max-w-lg mx-auto">
      <div className="rounded-2xl bg-gradient-to-br from-primary-dark via-primary to-primary-dark text-white p-5 shadow-md">
        <div className="flex items-start gap-4">
<AvatarUpload name={fullName || email || "A"} avatarUrl={avatarUrl} size={80} />
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg font-bold truncate">
              {fullName || "Admin"}
            </h2>
            <p className="text-sm text-white/80 truncate">{email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-primary-dark">
                Admin
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15">
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2 rounded-xl bg-black/20 p-3">
          {[
            { n: stats.students, l: "Students" },
            { n: stats.activeSubs, l: "Active" },
            { n: stats.pendingPayments, l: "Pending" },
            { n: stats.subjects, l: "Subjects" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="font-heading font-bold text-base">{s.n}</p>
              <p className="text-[10px] text-white/70">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Platform settings */}
      <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
        <h3 className="font-heading font-semibold text-text-primary text-sm">
          Account Settings
        </h3>
        <Input
          label="Subscription price (₦)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
        />
        <Input label="Bank name" value={bank} onChange={(e) => setBank(e.target.value)} />
        <Input
          label="Account name"
          value={accName}
          onChange={(e) => setAccName(e.target.value)}
        />
        <Input
          label="Account number"
          value={accNum}
          onChange={(e) => setAccNum(e.target.value)}
        />
        <Button loading={pending} onClick={saveAccountSettings} className="w-full sm:w-auto">
          Save settings
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="rounded-2xl border border-border bg-surface p-4 hover:border-primary/30 min-h-[88px]"
          >
            <p className="text-sm font-semibold text-text-primary">{t.label}</p>
            <p className="text-xs text-text-muted mt-0.5">{t.sub}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden divide-y divide-border">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="w-full flex items-center justify-between px-4 min-h-[56px] text-left hover:bg-primary-light/40"
        >
          <div>
            <p className="text-sm font-medium">Personal Information</p>
            <p className="text-xs text-text-muted">Edit name and phone</p>
          </div>
          <span className="text-text-muted">›</span>
        </button>
        <button
          type="button"
          onClick={() => setPwOpen(true)}
          className="w-full flex items-center justify-between px-4 min-h-[56px] text-left hover:bg-primary-light/40"
        >
          <div>
            <p className="text-sm font-medium">Change Password</p>
            <p className="text-xs text-text-muted">Update account password</p>
          </div>
          <span className="text-text-muted">›</span>
        </button>
        <Link
          href="/admin/notifications"
          className="flex items-center justify-between px-4 min-h-[56px] hover:bg-primary-light/40"
        >
          <div>
            <p className="text-sm font-medium">Notifications</p>
            <p className="text-xs text-text-muted">Broadcast messages</p>
          </div>
          <span className="text-text-muted">›</span>
        </Link>
        <form action={signOutAdmin}>
          <button
            type="submit"
            className="w-full flex items-center justify-between px-4 min-h-[56px] text-error hover:bg-red-50 text-left"
          >
            <div>
              <p className="text-sm font-medium">Log Out</p>
              <p className="text-xs text-error/70">Sign out of admin</p>
            </div>
            <span>›</span>
          </button>
        </form>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile">
        <div className="space-y-4">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Phone"
            value={phoneVal}
            onChange={(e) => setPhoneVal(e.target.value)}
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
