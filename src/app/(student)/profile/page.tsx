import StudentHeader from "@/components/student/StudentHeader";
import ProfileHub from "@/components/student/ProfileHub";
import {
  getCurrentProfile,
  isSubscriptionActive,
} from "@/lib/data/student/profile";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const active = isSubscriptionActive(profile);
  const expiresAt = profile.subscription_expires_at;
  const daysLeft =
    expiresAt && active
      ? Math.max(
          0,
          Math.ceil(
            (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        )
      : null;

  let subjects = 0;
  let avgProgress = 0;
  let attempts = 0;

  try {
    const supabase = await createClient();
    const { count: subCount } = await supabase
      .from("subjects")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);
    subjects = subCount || 0;

    const { data: prog } = await supabase
      .from("progress")
      .select("percent")
      .eq("student_id", profile.id);
    if (prog && prog.length) {
      avgProgress = Math.round(
        prog.reduce((s, p) => s + (p.percent || 0), 0) / prog.length
      );
    }

    const { count: attCount } = await supabase
      .from("cbt_attempts")
      .select("id", { count: "exact", head: true })
      .eq("student_id", profile.id);
    attempts = attCount || 0;
  } catch {
    /* empty DB ok */
  }

  return (
    <div>
      <StudentHeader
        title="Profile"
        userName={profile.full_name || "Student"}
      />
      <div className="px-4 sm:px-6 py-5 max-w-lg mx-auto">
        <ProfileHub
          fullName={profile.full_name || ""}
          email={profile.email || ""}
          phone={profile.phone || ""}
          avatarUrl={avatarDisplay}
          stateOfOrigin={(profile as { state_of_origin?: string | null }).state_of_origin || null}
          active={active}
          expiresAt={expiresAt}
          daysLeft={daysLeft}
          stats={{
            subjects,
            avgProgress,
            attempts,
            daysLeftSub: daysLeft,
          }}
        />
      </div>
    </div>
  );
}
