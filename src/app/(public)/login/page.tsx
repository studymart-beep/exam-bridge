import Link from "next/link";
import Logo from "@/components/brand/Logo";
import Card from "@/components/ui/Card";
import LoginForm from "@/components/student/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Logo size={40} showWordmark />
      </Link>
      <Card className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-xl font-bold text-text-primary">
            Welcome back
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Log in to continue learning
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-text-muted">
          No account?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}
