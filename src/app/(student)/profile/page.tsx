import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  getCurrentProfile,
  isSubscriptionActive,
} from "@/lib/data/student/profile";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  const active = isSubscriptionActive(profile);

  return (
    <div>
      <StudentHeader title="Profile" userName={profile?.full_name || "Student"} />
      <div className="px-4 sm:px-6 py-5 max-w-lg mx-auto space-y-4">
        {!profile ? (
          <Card className="text-center py-8">
            <p className="text-sm text-text-muted">Sign in to view your profile.</p>
          </Card>
        ) : (
          <Card className="space-y-3">
            <h2 className="font-heading font-bold text-lg">{profile.full_name || "Student"}</h2>
            <p className="text-sm text-text-secondary">{profile.email}</p>
            <p className="text-sm text-text-secondary">{profile.phone || "No phone"}</p>
            <div className="flex items-center gap-2">
              <Badge variant={active ? "success" : "warning"}>
                {active ? "Active subscription" : "Inactive"}
              </Badge>
            </div>
            {profile.subscription_expires_at && (
              <p className="text-xs text-text-muted">
                Expires {new Date(profile.subscription_expires_at).toLocaleDateString()}
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
