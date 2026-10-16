import { StudentMenuProvider } from "@/components/student/StudentMenuContext";
import { getCurrentProfileBrief, getCurrentProfile, isSubscriptionActive } from "@/lib/data/profile";

export const dynamic = "force-dynamic";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  // Guest pages (e.g. /subjects preview) — no app shell
  if (!profile) {
    return <>{children}</>;
  }

  const brief = await getCurrentProfileBrief();
  const subscribed = isSubscriptionActive(profile);

  return (
    <StudentMenuProvider
      userName={brief.fullName}
      avatarUrl={brief.avatarUrl}
      isSubscribed={subscribed}
    >
      {children}
    </StudentMenuProvider>
  );
}
