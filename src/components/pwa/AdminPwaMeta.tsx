"use client";

import { useEffect } from "react";
import AdminInstallPrompt from "@/components/pwa/AdminInstallPrompt";

/**
 * Ensures the browser uses the admin manifest while on /admin/* routes
 * (overrides the root student manifest for install / launch).
 */
export default function AdminPwaMeta() {
  useEffect(() => {
    const origin = window.location.origin;

    let link = document.querySelector(
      'link[rel="manifest"]'
    ) as HTMLLinkElement | null;
    const prevHref = link?.getAttribute("href");
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    link.href = `${origin}/admin-manifest.json`;

    let theme = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement | null;
    const prevTheme = theme?.content;
    if (!theme) {
      theme = document.createElement("meta");
      theme.name = "theme-color";
      document.head.appendChild(theme);
    }
    theme.content = "#166534";

    let apple = document.querySelector(
      'link[rel="apple-touch-icon"]'
    ) as HTMLLinkElement | null;
    const prevApple = apple?.getAttribute("href");
    if (!apple) {
      apple = document.createElement("link");
      apple.rel = "apple-touch-icon";
      document.head.appendChild(apple);
    }
    apple.href = `${origin}/icons/admin-192.png`;

    let appleTitle = document.querySelector(
      'meta[name="apple-mobile-web-app-title"]'
    ) as HTMLMetaElement | null;
    const prevTitle = appleTitle?.content;
    if (!appleTitle) {
      appleTitle = document.createElement("meta");
      appleTitle.name = "apple-mobile-web-app-title";
      document.head.appendChild(appleTitle);
    }
    appleTitle.content = "Exam Bridge Admin";

    return () => {
      if (link && prevHref != null) link.setAttribute("href", prevHref);
      if (theme && prevTheme != null) theme.content = prevTheme;
      if (apple && prevApple != null) apple.setAttribute("href", prevApple);
      if (appleTitle && prevTitle != null) appleTitle.content = prevTitle;
    };
  }, []);

  return <AdminInstallPrompt />;
}
