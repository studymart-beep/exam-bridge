"use client";

interface VideoPlayerProps {
  title?: string;
  /** Cloudflare Stream video ID or full iframe/watch URL */
  source?: string | null;
}

export default function VideoPlayer({ title, source }: VideoPlayerProps) {
  if (!source) {
    return (
      <div className="relative w-full aspect-video bg-gray-900 rounded-2xl flex items-center justify-center">
        <p className="text-white/60 text-sm">No video source</p>
      </div>
    );
  }

  // Cloudflare Stream ID (alphanumeric) or full URL
  const isUrl = source.startsWith("http://") || source.startsWith("https://");
  const embedSrc = isUrl
    ? source.includes("iframe.videodelivery.net") || source.includes("cloudflarestream.com")
      ? source
      : source
    : `https://iframe.videodelivery.net/${source}`;

  return (
    <div className="space-y-2">
      {title && <p className="text-sm font-medium text-text-primary">{title}</p>}
      <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden">
        <iframe
          src={embedSrc}
          title={title || "Video lesson"}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
