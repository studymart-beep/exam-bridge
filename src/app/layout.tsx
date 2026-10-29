import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/components/ui/Toast";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import "./globals.css";
import { getSiteUrl } from "@/lib/site";

const SITE = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Exam Bridge — Ace JAMB & WAEC with Focused Practice",
    template: "%s | Exam Bridge",
  },
  description:
    "Video lessons, PDF study notes, and CBT practice for JAMB and WAEC. Built for Nigerian students.",
  applicationName: "Exam Bridge",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Exam Bridge",
  },
  openGraph: {
    type: "website",
    siteName: "Exam Bridge",
    title: "Exam Bridge — Ace JAMB & WAEC with Focused Practice",
    description:
      "Video lessons, PDF study notes, and CBT practice for JAMB and WAEC.",
    url: SITE,
    images: [{ url: "/logo-1024.png", width: 1024, height: 1024, alt: "Exam Bridge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Exam Bridge — Ace JAMB & WAEC with Focused Practice",
    description:
      "Video lessons, PDF study notes, and CBT practice for JAMB and WAEC.",
    images: ["/logo-1024.png"],
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
  themeColor: "#0B4232",
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
