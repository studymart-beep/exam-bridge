"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

const AdminMenuContext = createContext<() => void>(() => {});

export function useAdminMenu() {
  return useContext(AdminMenuContext);
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminMenuContext.Provider value={() => setSidebarOpen(true)}>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">{children}</div>
      </div>
    </AdminMenuContext.Provider>
  );
}
