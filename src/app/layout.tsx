import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/components/ui/Toast";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import "./globals.css";

export const metadata: Metadata = {
  title: "Exam Bridge — Prepare for JAMB & WAEC",
  description:
    "Study, practice, and pass. PDF notes, video lessons, and CBT practice for Nigerian students.",
  applicationName: "Exam Bridge",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Exam Bridge",
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "32x32" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#166534",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ToastProvider>
          {children}
          <ServiceWorkerRegister />
          <InstallPrompt />
        </ToastProvider>
      </body>
    </html>
  );
}
