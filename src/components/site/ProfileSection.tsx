export function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 border-t border-ink/10 pt-8 first:mt-0 first:border-t-0 first:pt-0">
      <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-ink">
        <span
          className="inline-block h-5 w-1 rounded-full"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-status-open) 60%, transparent)" }}
        />
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Fact({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  /** Highlights the value in the site's accent green — reserve for the
   * handful of "headline number" facts (money figures), not every fact,
   * so it stays meaningful rather than decorative. */
  accent?: boolean;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="font-body text-xs font-semibold tracking-wide text-slate uppercase">
        {label}
      </dt>
      <dd
        className={`font-utility text-lg font-medium ${accent ? "text-status-open" : "text-ink"}`}
      >
        {value}
      </dd>
    </div>
  );
}

/** Wraps a group of <Fact>s in the tinted "data box" treatment shared by
 * the Admissions/Cost & Aid/Academics sections. */
export function FactBox({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-line bg-mist p-5 sm:grid-cols-3">
      {children}
    </dl>
  );
}
