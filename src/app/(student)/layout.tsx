import StudentSidebar from "@/components/student/StudentSidebar";
import MobileTabBar from "@/components/student/MobileTabBar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
        <MobileTabBar />
      </div>
    </div>
  );
}
