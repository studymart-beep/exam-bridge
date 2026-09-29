import Link from "next/link";
import StudentHeader from "@/components/student/StudentHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import { currentUser, continueLearning, recentActivity } from "@/lib/mock/user";
import { notifications } from "@/lib/mock/notifications";

const quickTiles = [
  {
    href: "/subjects",
    label: "Subjects",
    sub: "12 Subjects",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: "/cbt",
    label: "CBT Practice",
    sub: "New Practice",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/results",
    label: "Results",
    sub: "View Results",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/progress",
    label: "Progress",
    sub: "Track Performance",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

const activityIcons: Record<string, React.ReactNode> = {
  document: (
    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  trophy: (
    <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  book: (
    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
};

export default function DashboardPage() {
  const firstName = currentUser.fullName.split(" ")[0];
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <StudentHeader title="Home" />

      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-xl font-heading font-bold text-text-primary">
            Welcome back, {firstName} 👋
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="success">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Active
            </Badge>
            <span className="text-xs text-text-muted">
              Subscription · expires in {currentUser.subscription.daysRemaining} days
            </span>
          </div>
        </div>

        {/* Continue Learning */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-text-primary flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Continue Learning
            </h3>
            <Link href="/subjects" className="text-sm text-primary font-medium hover:underline">
              View all →
            </Link>
          </div>
          <Link
            href={`/courses/${continueLearning.courseId}/topics/${continueLearning.topicId}`}
            className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div
              className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: continueLearning.imageColor }}
            >
              <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-text-muted">Last Topic</p>
              <h4 className="font-heading font-semibold text-text-primary truncate">
                {continueLearning.title}
              </h4>
              <p className="text-xs text-text-secondary">
                {continueLearning.subjectName} · {continueLearning.level}
              </p>
              <div className="mt-2">
                <ProgressBar value={continueLearning.progress} size="sm" />
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Continue from where you left off.
              </p>
            </div>
          </Link>
        </Card>

        {/* Quick tiles */}
        <div className="grid grid-cols-2 gap-3">
          {quickTiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="flex flex-col items-start p-4 bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-card hover:border-gray-200 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mb-3">
                {tile.icon}
              </div>
              <h3 className="font-heading font-semibold text-text-primary text-sm">
                {tile.label}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">{tile.sub}</p>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-text-primary">
              Recent Activity
            </h3>
            <Link href="/results" className="text-sm text-primary font-medium hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-soft"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                  {activityIcons[item.icon]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-text-muted">{item.subtitle}</p>
                </div>
                <p className="text-xs text-text-muted flex-shrink-0">{item.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications preview */}
        {unread > 0 && (
          <Link
            href="/notifications"
            className="flex items-center gap-3 p-4 bg-primary-light/50 rounded-2xl border border-primary/10"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm">
              {unread}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                You have {unread} unread notification{unread > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-text-secondary">Tap to view</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
