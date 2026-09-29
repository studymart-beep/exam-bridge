import Link from "next/link";
import LoginForm from "@/components/student/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between h-14 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L2 8l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-heading font-bold text-lg text-text-primary">
            Exam Bridge
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-heading font-bold text-text-primary">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Login to continue your exam prep
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 sm:p-8">
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}
