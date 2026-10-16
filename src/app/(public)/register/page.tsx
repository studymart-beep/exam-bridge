import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import RegisterForm from "@/components/student/RegisterForm";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Create Account",
  description: "Register free to start preparing for JAMB & WAEC.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-gradient-to-br from-primary-dark via-primary to-accent-dark">
      <div className="w-full max-w-[420px] rounded-2xl bg-surface shadow-elevated border border-border p-6 sm:p-8 space-y-5">
        <div className="flex flex-col items-center text-center gap-2">
          <Logo size={72} />
          <p className="font-heading font-bold text-primary text-lg">Exam Bridge</p>
          <h1 className="font-heading text-xl font-bold text-text-primary mt-1">
            Create your account
          </h1>
          <p className="text-sm text-text-secondary">
            Free to start — subscribe when you are ready
          </p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
