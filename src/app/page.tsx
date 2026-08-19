import { StatusBadge } from "@/components/StatusBadge";

const COUNTRIES = [
  { label: "US", href: "/us" },
  { label: "UK", href: "/uk" },
  { label: "Canada", href: "/canada" },
  { label: "Australia", href: "/australia" },
];

// Placeholder data until the Supabase project is provisioned and this is
// wired to a real `deadlines` query. See src/app/api/revalidate/route.ts —
// this list should fetch with `next: { tags: ["deadlines:list"] }`.
const UPCOMING_DEADLINES = [
  { university: "Cambridge", type: "Early Decision", date: "AUG 01", status: "closed" as const },
  { university: "MIT", type: "Early Action", date: "NOV 01", status: "upcoming" as const },
  { university: "Oxford", type: "UCAS", date: "OCT 15", status: "upcoming" as const },
  { university: "Melbourne", type: "Rolling", date: "ROLLING", status: "open" as const },
];

export default function Home() {
  return (
    <main className="flex flex-1 items-center px-6 py-16">
      <div className="mx-auto grid w-full max-w-5xl gap-12 md:grid-cols-2 md:items-center">
        <div
          className="animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          <p className="mb-3 font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
            412 universities · 1,860 deadlines tracked
          </p>

          <h1 className="font-display text-4xl font-semibold text-ink text-balance">
            Where are you applying?
          </h1>

          <button
            type="button"
            className="mt-6 flex w-full items-center gap-3 rounded-md border-[1.5px] border-ink px-4 py-3 text-left text-slate transition-colors duration-200 hover:border-status-open focus-visible:border-status-open"
          >
            <span className="flex-1 text-sm">
              Search universities, guides, and scholarships…
            </span>
            <kbd className="rounded border border-slate/40 px-1.5 py-0.5 font-utility text-xs text-slate">
              ⌘K
            </kbd>
          </button>

          <p className="mt-3 text-sm text-slate">
            Or browse by country:{" "}
            {COUNTRIES.map((c, i) => (
              <span key={c.href}>
                <a
                  href={c.href}
                  className="underline decoration-status-pending/0 decoration-2 underline-offset-4 transition-colors duration-200 hover:decoration-status-pending"
                >
                  {c.label}
                </a>
                {i < COUNTRIES.length - 1 && " · "}
              </span>
            ))}
          </p>
        </div>

        <div
          className="animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="font-body text-xs font-semibold tracking-wide text-slate uppercase">
              Deadlines this week
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate uppercase">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-status-open" />
              Live
            </span>
          </div>

          <div className="overflow-hidden rounded-md border border-ink/15 bg-paper">
            {UPCOMING_DEADLINES.map((d, i) => (
              <div
                key={d.university}
                className="animate-fade-up flex items-center justify-between gap-4 border-l-4 px-4 py-3 text-sm transition-colors duration-200 hover:bg-ink/[0.03]"
                style={{
                  animationDelay: `${180 + i * 70}ms`,
                  borderLeftColor: `var(--color-status-${d.status})`,
                  borderBottomWidth: i < UPCOMING_DEADLINES.length - 1 ? 1 : 0,
                  borderBottomColor: "color-mix(in srgb, var(--color-ink) 10%, transparent)",
                }}
              >
                <span className="font-medium text-ink">
                  {d.university} — {d.type}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-utility text-xs text-slate">
                    {d.date}
                  </span>
                  <StatusBadge status={d.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
