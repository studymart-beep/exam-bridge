import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import { getCurrentProfile } from "@/lib/data/student/profile";
import { signOut } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();

  return (
    <div>
      <StudentHeader title="Settings" userName={profile?.full_name || "Student"} />
      <div className="px-4 sm:px-6 py-5 max-w-lg mx-auto space-y-4">
        <Card>
          <p className="text-sm text-text-secondary">
            Signed in as <strong>{profile?.email || "—"}</strong>
          </p>
        </Card>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full h-11 rounded-xl border border-error text-error text-sm font-semibold hover:bg-red-50"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
