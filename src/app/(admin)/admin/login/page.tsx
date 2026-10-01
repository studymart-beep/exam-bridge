import Link from "next/link";
import Logo from "@/components/brand/Logo";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { signInAdmin } from "@/app/actions/auth";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-8 flex flex-col items-center gap-2">
        <Logo size={48} />
        <p className="font-heading font-bold text-primary text-lg">Exam Bridge Admin</p>
      </div>
      <Card className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <h1 className="font-heading text-xl font-bold text-text-primary">Admin sign in</h1>
          <p className="text-sm text-text-secondary mt-1">Authorized staff only</p>
        </div>
        <form action={signInAdmin} className="space-y-4">
          <Input label="Email" name="email" type="email" required placeholder="admin@example.com" />
          <Input label="Password" name="password" type="password" required />
          <Button type="submit" fullWidth>
            Sign in
          </Button>
        </form>
        <p className="text-center text-xs text-text-muted">
          <Link href="/" className="text-primary hover:underline">
            ← Back to site
          </Link>
        </p>
      </Card>
    </div>
  );
}
