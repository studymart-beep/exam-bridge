import StudentHeader from "@/components/student/StudentHeader";
import DownloadsClient from "@/components/student/DownloadsClient";
import { getCurrentProfile } from "@/lib/data/student/profile";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DownloadsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div>
      <StudentHeader
        title="Downloads"
        userName={profile.full_name || "Student"}
      />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto">
        <DownloadsClient />
      </div>
    </div>
  );
}
