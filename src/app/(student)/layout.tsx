import { StudentMenuProvider } from "@/components/student/StudentMenuContext";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentMenuProvider>{children}</StudentMenuProvider>;
}
