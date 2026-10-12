"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import StudentSidebar from "@/components/student/StudentSidebar";
import CacheManager from "@/components/student/CacheManager";

type UserBrief = { fullName: string; avatarUrl: string | null };

const StudentMenuContext = createContext<() => void>(() => {});
const StudentUserContext = createContext<UserBrief>({
  fullName: "Student",
  avatarUrl: null,
});

export function useStudentMenu() {
  return useContext(StudentMenuContext);
}

export function useStudentUser() {
  return useContext(StudentUserContext);
}

export function StudentMenuProvider({
  children,
  userName = "Student",
  avatarUrl = null,
}: {
  children: ReactNode;
  userName?: string;
  avatarUrl?: string | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const brief: UserBrief = { fullName: userName, avatarUrl };

  return (
    <StudentUserContext.Provider value={brief}>
      <StudentMenuContext.Provider value={() => setSidebarOpen(true)}>
        <CacheManager />
        <div className="flex min-h-screen bg-background">
          <StudentSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            userName={userName}
            avatarUrl={avatarUrl}
          />
          <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </StudentMenuContext.Provider>
    </StudentUserContext.Provider>
  );
}
