"use client";

interface VideoPlayerProps {
  title?: string;
}

export default function VideoPlayer({ title }: VideoPlayerProps) {
  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
      {/* Placeholder for Cloudflare Stream embed */}
      <div className="text-center space-y-3 p-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <p className="text-white/80 text-sm font-medium">
          {title || "Video Lesson"}
        </p>
        <p className="text-white/50 text-xs">
          Video player placeholder — Cloudflare Stream embed will go here
        </p>
      </div>
    </div>
  );
}
