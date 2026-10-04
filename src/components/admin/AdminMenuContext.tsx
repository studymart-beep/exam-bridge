"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

const AdminMenuContext = createContext<() => void>(() => {});

export function useAdminMenu() {
  return useContext(AdminMenuContext);
}

export function AdminMenuProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminMenuContext.Provider value={() => setSidebarOpen(true)}>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">{children}</div>
      </div>
    </AdminMenuContext.Provider>
  );
}
