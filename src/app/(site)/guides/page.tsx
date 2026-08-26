import Link from "next/link";
import { listPublishedGuides } from "@/lib/queries/public-guides";

export const revalidate = 3600;

export const metadata = {
  title: "Guides",
  description:
    "How-to guides for personal statements, letters of recommendation, transfers, financial aid, and international applications.",
  alternates: { canonical: "/guides" },
};

const CATEGORY_LABELS: Record<string, string> = {
  "how-to": "How-to",
  "country-guide": "Country guide",
  "test-prep": "Test prep",
};

export default async function GuidesIndexPage() {
  const guides = await listPublishedGuides({ excludeCategory: "comparison" });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Guides
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        Personal statements, letters of recommendation, transfers, financial
        aid, test prep, and more — fact-checked and kept current.
      </p>

      {guides.length === 0 ? (
        <p className="mt-8 font-body text-base text-slate">No guides published yet.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {guides.map((g) => (
            <li key={g.slug} className="border-b border-ink/10 pb-4">
              <Link href={`/guides/${g.slug}`} className="group">
                <span className="font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
                  {CATEGORY_LABELS[g.category] ?? g.category}
                  {g.country && ` · ${g.country.name}`}
                </span>
                <h2 className="mt-1 font-display text-lg font-semibold text-ink group-hover:underline">
                  {g.title}
                </h2>
                {g.excerpt && (
                  <p className="mt-1 font-body text-base text-slate">{g.excerpt}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
