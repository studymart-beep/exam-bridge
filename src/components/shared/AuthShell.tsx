import Logo from "@/components/brand/Logo";

/**
 * Auth screen shell from the reference design: forest gradient page, warm-white
 * rounded card, raw circular logo sitting flat on it (no tile, no shadow).
 */
export default function AuthShell({
  title,
  subtitle,
  brand = "Exam Bridge",
  children,
  footer,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  brand?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-hero-emerald relative overflow-hidden">
      {/* low-contrast decorative shapes */}
      <span
        aria-hidden
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/5"
      />
      <span
        aria-hidden
        className="absolute bottom-[-90px] right-[-60px] w-80 h-80 rounded-[45%] bg-secondary/10"
      />

      <div
        className={`relative w-full ${
          wide ? "max-w-[460px]" : "max-w-[420px]"
        } rounded-[26px] bg-surface shadow-elevated border border-white/60 p-6 sm:p-8 space-y-5`}
      >
        <div className="flex flex-col items-center text-center gap-2">
          <Logo size={72} />
          <p className="font-heading font-extrabold text-primary text-lg">
            {brand}
          </p>
          <h1 className="font-heading text-xl font-extrabold text-text-primary mt-1">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>
        {children}
        {footer}
      </div>
    </div>
  );
}
