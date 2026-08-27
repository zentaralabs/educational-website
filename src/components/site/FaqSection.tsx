import type { FaqItem } from "@/lib/faq";

/**
 * Visible "common questions" block. Pair it with a FAQPage JSON-LD block
 * (faqJsonLd) in the page so the same content is machine-readable.
 */
export function FaqSection({
  heading,
  items,
}: {
  heading: string;
  items: FaqItem[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-3 font-display text-xl font-semibold text-ink">
        {heading}
      </h2>
      <div className="flex flex-col divide-y divide-line rounded-xl border border-line">
        {items.map((f) => (
          <div key={f.q} className="p-4 sm:p-5">
            <h3 className="font-body text-base font-semibold text-ink">{f.q}</h3>
            <p className="mt-1.5 font-body text-[0.95rem] leading-relaxed text-slate">
              {f.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
