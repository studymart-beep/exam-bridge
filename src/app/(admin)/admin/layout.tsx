import { AdminMenuProvider } from "@/components/admin/AdminMenuContext";
import AdminPwaMeta from "@/components/pwa/AdminPwaMeta";
import { getCurrentProfileBrief } from "@/lib/data/profile";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brief = await getCurrentProfileBrief();

  return (
    <AdminMenuProvider userName={brief.fullName} avatarUrl={brief.avatarUrl}>
      {children}
      <AdminPwaMeta />
    </AdminMenuProvider>
  );
}
