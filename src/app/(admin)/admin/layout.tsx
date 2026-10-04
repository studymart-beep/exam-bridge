import { AdminMenuProvider } from "@/components/admin/AdminMenuContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminMenuProvider>{children}</AdminMenuProvider>;
}
