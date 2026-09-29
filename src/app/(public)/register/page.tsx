import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-14 flex items-center px-4 border-b border-gray-100 bg-white">
        <Link href="/" className="text-sm text-primary font-medium">
          ← Back
        </Link>
        <h1 className="flex-1 text-center font-heading font-semibold text-text-primary">
          Create account
        </h1>
        <div className="w-12" />
      </header>
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8">
        <RegisterForm />
      </main>
    </div>
  );
}
