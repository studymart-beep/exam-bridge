"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

type UserBrief = { fullName: string; avatarUrl: string | null };

const AdminMenuContext = createContext<() => void>(() => {});
const AdminUserContext = createContext<UserBrief>({
  fullName: "Admin",
  avatarUrl: null,
});

export function useAdminMenu() {
  return useContext(AdminMenuContext);
}

export function useAdminUser() {
  return useContext(AdminUserContext);
}

export function AdminMenuProvider({
  children,
  userName = "Admin",
  avatarUrl = null,
}: {
  children: ReactNode;
  userName?: string;
  avatarUrl?: string | null;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const brief: UserBrief = { fullName: userName, avatarUrl };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminUserContext.Provider value={brief}>
      <AdminMenuContext.Provider value={() => setSidebarOpen(true)}>
        <div className="flex min-h-screen bg-background">
          <AdminSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            userName={userName}
            avatarUrl={avatarUrl}
          />
          <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
            {children}
          </div>
        </div>
      </AdminMenuContext.Provider>
    </AdminUserContext.Provider>
  );
}
