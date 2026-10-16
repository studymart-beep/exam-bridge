import type { Metadata } from "next";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://exam-bridge-one.vercel.app";

export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
}): Metadata {
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
      images: [{ url: "/logo.png", alt: "Exam Bridge" }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: ["/logo.png"],
    },
  };
}
