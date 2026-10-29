import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/shared/AuthShell";
import RegisterForm from "@/components/student/RegisterForm";
import { listSubjectsForPicker } from "@/lib/data/student/mySubjects";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Create Account",
  description: "Register free to start preparing for JAMB & WAEC.",
  path: "/register",
});

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const subjects = await listSubjectsForPicker();

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free to start — subscribe when you are ready"
      wide
      footer={
        <p className="text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            Log in
          </Link>
        </p>
      }
    >
      <RegisterForm subjects={subjects} />
    </AuthShell>
  );
}
