import type { Metadata } from "next";
import { AdminMenuProvider } from "@/components/admin/AdminMenuContext";
import AdminPwaMeta from "@/components/pwa/AdminPwaMeta";
import { getCurrentProfileBrief } from "@/lib/data/profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  applicationName: "Exam Bridge Admin",
  manifest: "/admin-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Exam Bridge Admin",
  },
  icons: {
    icon: [
      { url: "/icons/admin-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/admin-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/admin-192.png", sizes: "192x192" }],
  },
};

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
