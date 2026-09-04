import type { FaqItem } from "@/lib/faq";
import { SectionHeading } from "@/components/site/SectionHeading";

/**
 * Visible "common questions" block. Pair it with a FAQPage JSON-LD block
 * (faqJsonLd) in the page so the same content is machine-readable.
 *
 * Defaults to a two-column card grid. Pass `grid={false}` for the stacked
 * single-column list where a page is already in a narrow reading column.
 */
export function FaqSection({
  heading,
  items,
  grid = true,
}: {
  heading: string;
  items: FaqItem[];
  grid?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <SectionHeading>{heading}</SectionHeading>
      {grid ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((f) => (
            <div
              key={f.q}
              className="rounded-xl border border-line bg-paper p-4 shadow-card sm:p-5"
            >
              <h3 className="font-body text-base font-semibold text-ink">
                {f.q}
              </h3>
              <p className="mt-1.5 font-body text-[0.95rem] leading-relaxed text-ink/85">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-line rounded-xl border border-line">
          {items.map((f) => (
            <div key={f.q} className="p-4 sm:p-5">
              <h3 className="font-body text-base font-semibold text-ink">
                {f.q}
              </h3>
              <p className="mt-1.5 font-body text-[0.95rem] leading-relaxed text-ink/85">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
