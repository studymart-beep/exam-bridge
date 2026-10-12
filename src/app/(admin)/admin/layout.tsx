import { AdminMenuProvider } from "@/components/admin/AdminMenuContext";
import AdminPwaMeta from "@/components/pwa/AdminPwaMeta";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminMenuProvider>
      {children}
      <AdminPwaMeta />
    </AdminMenuProvider>
  );
}
