import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Reset Password",
  description: "Reset your Exam Bridge password.",
  path: "/forgot-password",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
