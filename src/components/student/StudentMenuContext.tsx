"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import StudentSidebar from "@/components/student/StudentSidebar";

const StudentMenuContext = createContext<() => void>(() => {});

export function useStudentMenu() {
  return useContext(StudentMenuContext);
}

export function StudentMenuProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <StudentMenuContext.Provider value={() => setSidebarOpen(true)}>
      <div className="flex min-h-screen bg-background">
        <StudentSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </StudentMenuContext.Provider>
  );
}
