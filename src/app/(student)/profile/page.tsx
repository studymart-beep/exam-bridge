"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import StudentHeader from "@/components/student/StudentHeader";
import ProfileCard from "@/components/student/ProfileCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { currentUser } from "@/lib/mock/user";
import { useToast } from "@/components/ui/Toast";

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogout = () => {
    showToast("Logged out successfully", "info");
    router.push("/login");
  };

  return (
    <div>
      <StudentHeader title="Profile" />

      <div className="px-4 sm:px-6 py-5 max-w-lg mx-auto space-y-6">
        <ProfileCard user={currentUser} />

        {/* Subscription */}
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-soft">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide">
              Subscription Status
            </p>
            <p className="text-sm font-semibold text-primary">
              Active — expires in {currentUser.subscription.daysRemaining} days
            </p>
          </div>
          <Badge variant="success">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </Badge>
        </div>

        {/* Menu items */}
        <div className="space-y-2">
          <Link
            href="/settings"
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-card transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="flex-1 text-sm font-medium text-text-primary">
              Edit Profile
            </span>
            <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-card transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="flex-1 text-sm font-medium text-text-primary">
              Change Password
            </span>
            <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-card transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span className="flex-1 text-sm font-medium text-error text-left">
              Logout
            </span>
            <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
