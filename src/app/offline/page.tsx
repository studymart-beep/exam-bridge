export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background">
      <h1 className="font-heading font-bold text-xl text-text-primary mb-2">
        You&apos;re offline
      </h1>
      <p className="text-sm text-text-secondary mb-6 max-w-sm">
        Connect to the internet, or open content you already downloaded.
      </p>
      <a
        href="/downloads"
        className="inline-flex min-h-[44px] items-center px-5 rounded-xl bg-primary text-white font-semibold text-sm"
      >
        Go to Downloads
      </a>
    </div>
  );
}
