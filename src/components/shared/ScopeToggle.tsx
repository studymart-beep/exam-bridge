import Link from "next/link";

export type Scope = "mine" | "all";

/**
 * Server-side scope switch used by CBT / Progress / Results:
 * defaults to "My Subjects", with a toggle link to "All Subjects".
 */
export default function ScopeToggle({
  scope,
  basePath,
  counts,
  extraParams,
}: {
  scope: Scope;
  basePath: string;
  counts?: { mine?: number; all?: number };
  /** other query params to preserve when switching */
  extraParams?: Record<string, string>;
}) {
  const href = (s: Scope) => {
    const params = new URLSearchParams(extraParams || {});
    if (s === "all") params.set("scope", "all");
    else params.delete("scope");
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const item = (s: Scope, label: string, count?: number) => (
    <Link
      href={href(s)}
      className={
        scope === s
          ? "px-4 py-2 rounded-full text-sm font-bold bg-primary text-white shadow-soft"
          : "px-4 py-2 rounded-full text-sm font-semibold text-text-secondary hover:text-primary"
      }
    >
      {label}
      {typeof count === "number" && (
        <span className="ml-1.5 text-[11px] opacity-75">{count}</span>
      )}
    </Link>
  );

  return (
    <div className="segmented">
      {item("mine", "My Subjects", counts?.mine)}
      {item("all", "All Subjects", counts?.all)}
    </div>
  );
}
