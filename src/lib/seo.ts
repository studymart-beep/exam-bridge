import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const SITE = getSiteUrl();
  const url = `${SITE}${opts.path}`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: opts.title,
      description: opts.description,
      url,
      images: [{ url: "/logo-1024.png", width: 1024, height: 1024, alt: "Exam Bridge" }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: ["/logo-1024.png"],
    },
  };
}
