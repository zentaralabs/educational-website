export function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-ink/10 py-8 first:border-t-0 first:pt-0">
      <h2 className="mb-4 font-display text-xl font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

export function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="font-body text-xs font-semibold tracking-wide text-slate uppercase">
        {label}
      </dt>
      <dd className="font-utility text-sm text-ink">{value}</dd>
    </div>
  );
}
