import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/shared/AuthShell";
import LoginForm from "@/components/student/LoginForm";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Log In",
  description: "Sign in to your Exam Bridge account.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue learning"
      footer={
        <p className="text-center text-sm text-text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
