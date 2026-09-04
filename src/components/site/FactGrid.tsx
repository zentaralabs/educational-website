import type { ReactNode } from "react";

/**
 * The "at a glance" fact cards shared by the visa and scholarship pages
 * (and anywhere else a short label/value reference grid fits). Null values
 * drop out, so callers can list every possible fact unconditionally.
 */
export function Fact({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="rounded-xl border border-line bg-mist px-4 py-3">
      <dt className="font-utility text-xs font-semibold tracking-wide text-slate uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-body text-[0.95rem] font-medium text-ink">
        {value}
      </dd>
    </div>
  );
}

export function FactGrid({ children }: { children: ReactNode }) {
  return (
    <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</dl>
  );
}
