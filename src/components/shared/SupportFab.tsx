import Link from "next/link";

/**
 * Floating support button (bottom-right) — landing page + student dashboard.
 * Opens the Telegram link saved in Admin → Settings. Falls back to the
 * subscribe/notifications-free mailto when the admin has not set one yet.
 */
export default function SupportFab({ url }: { url?: string | null }) {
  const href = url && url.trim() ? url.trim() : "mailto:support@exambridge.app";
  const external = /^https?:\/\//i.test(href);

  return (
    <Link
      href={href}
      className="support-fab animate-fab-pulse"
      aria-label="Chat with support"
      title="Need help? Chat with us"
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 3C7 3 3 6.6 3 11c0 2.4 1.2 4.6 3.1 6.1-.1.9-.5 2.1-1.2 3 0 0 2.3-.3 3.9-1.3 1 .3 2 .5 3.2.5 5 0 9-3.6 9-8.8S17 3 12 3zm-3.2 8.9h6.4c.4 0 .7.3.7.7s-.3.7-.7.7H8.8a.7.7 0 010-1.4zm0-2.6h9c.4 0 .7.3.7.7s-.3.7-.7.7h-9a.7.7 0 010-1.4z" />
      </svg>
    </Link>
  );
}
