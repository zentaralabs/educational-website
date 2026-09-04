import { SectionHeading } from "@/components/site/SectionHeading";

export function ProfileSection({
  title,
  children,
  /** Constrain the body to a comfortable reading measure. Use for
   * prose-heavy sections on wide (max-w-4xl) pages; leave off for
   * sections whose content is a full-width table or fact grid. */
  narrow = false,
}: {
  title: string;
  children: React.ReactNode;
  narrow?: boolean;
}) {
  return (
    <section className="mt-8 border-t border-ink/10 pt-8 first:mt-0 first:border-t-0 first:pt-0">
      <SectionHeading>{title}</SectionHeading>
      {narrow ? <div className="max-w-2xl">{children}</div> : children}
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
