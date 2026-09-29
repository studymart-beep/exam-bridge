import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/Toast";
import { SubscriptionProvider } from "@/lib/subscription/context";
import SubscriptionToggle from "@/components/dev/SubscriptionToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Exam Bridge — Prepare for JAMB & WAEC",
  description:
    "Study, practice, and pass. PDF notes, video lessons, and CBT practice for Nigerian students.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <SubscriptionProvider>
          <ToastProvider>
            {children}
            <SubscriptionToggle />
          </ToastProvider>
        </SubscriptionProvider>
      </body>
    </html>
  );
}
