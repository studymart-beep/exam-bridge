import { StudentMenuProvider } from "@/components/student/StudentMenuContext";
import { getCurrentProfileBrief } from "@/lib/data/profile";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brief = await getCurrentProfileBrief();

  return (
    <StudentMenuProvider
      userName={brief.fullName}
      avatarUrl={brief.avatarUrl}
    >
      {children}
    </StudentMenuProvider>
  );
}
