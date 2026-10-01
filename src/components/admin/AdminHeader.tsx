"use client";

import { useAdminMenu } from "@/app/(admin)/admin/layout";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function AdminHeader({ title, subtitle, actions }: AdminHeaderProps) {
  const openSidebar = useAdminMenu();

  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-border">
      <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={openSidebar}
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-text-secondary hover:bg-primary-light hover:text-primary"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-heading font-semibold text-text-primary truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-text-muted truncate hidden sm:block">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
              SA
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-text-primary leading-tight">Super Admin</p>
              <p className="text-[10px] text-text-muted">Admin panel</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
