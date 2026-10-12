"use client";

import { useEffect } from "react";
import AdminInstallPrompt from "@/components/pwa/AdminInstallPrompt";

/** Swaps student manifest for admin manifest while on /admin routes. */
export default function AdminPwaMeta() {
  useEffect(() => {
    let link = document.querySelector(
      'link[rel="manifest"]'
    ) as HTMLLinkElement | null;
    const prev = link?.href;
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    link.href = "/admin-manifest.json";

    let theme = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement | null;
    const prevTheme = theme?.content;
    if (!theme) {
      theme = document.createElement("meta");
      theme.name = "theme-color";
      document.head.appendChild(theme);
    }
    theme.content = "#14532D";

    let apple = document.querySelector(
      'link[rel="apple-touch-icon"]'
    ) as HTMLLinkElement | null;
    const prevApple = apple?.href;
    if (!apple) {
      apple = document.createElement("link");
      apple.rel = "apple-touch-icon";
      document.head.appendChild(apple);
    }
    apple.href = "/icons/admin-192.png";

    return () => {
      if (link && prev) link.href = prev;
      if (theme && prevTheme) theme.content = prevTheme;
      if (apple && prevApple) apple.href = prevApple;
    };
  }, []);

  return <AdminInstallPrompt />;
}
