import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE = getSiteUrl();
  const paths = [
    { path: "/", priority: 1.0 },
    { path: "/login", priority: 0.8 },
    { path: "/register", priority: 0.8 },
    { path: "/forgot-password", priority: 0.8 },
    { path: "/subscribe", priority: 0.8 },
  ];

  return paths.map(({ path, priority }) => ({
    url: `${BASE}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority,
  }));
}
