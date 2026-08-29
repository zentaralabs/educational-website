import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/site/icons";
import {
  listPublishedScholarships,
  listScholarshipStudyLevels,
} from "@/lib/queries/public-scholarships";
import {
  SCHOLARSHIP_SCOPE_LABELS,
  SCHOLARSHIP_SCOPE_ORDER,
} from "@/lib/scholarship-scopes";

export const revalidate = 3600;

export const metadata = {
  title: "Scholarships for International Students in Australia",
  description:
    "Government, university, and external scholarships for international students in Australia. What each one is worth, who qualifies, and whether you need a separate application.",
  alternates: { canonical: "/scholarships" },
};

export default async function ScholarshipsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = await searchParams;
  const [scholarships, levels] = await Promise.all([
    listPublishedScholarships({ studyLevel: level }),
    listScholarshipStudyLevels(),
  ]);

  const byScope = new Map<string, typeof scholarships>();
  for (const s of scholarships) {
    const list = byScope.get(s.scope) ?? [];
    list.push(s);
    byScope.set(s.scope, list);
  }
  const scopes = SCHOLARSHIP_SCOPE_ORDER.filter((s) => byScope.has(s));

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Scholarships for studying in Australia
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        Government schemes, university awards, and external funding for
        international students. Each entry says what it is worth, who it is for,
        and whether it needs a separate application or is automatic on admission.
      </p>

      {levels.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/scholarships"
            className={`rounded-full border px-3 py-1 font-utility text-xs transition-colors ${
              !level
                ? "border-status-open bg-status-open/10 text-ink"
                : "border-ink/15 text-slate hover:border-status-open/40"
            }`}
          >
            All levels
          </Link>
          {levels.map((l) => (
            <Link
              key={l}
              href={`/scholarships?level=${encodeURIComponent(l)}`}
              className={`rounded-full border px-3 py-1 font-utility text-xs transition-colors ${
                level === l
                  ? "border-status-open bg-status-open/10 text-ink"
                  : "border-ink/15 text-slate hover:border-status-open/40"
              }`}
            >
              {l}
            </Link>
          ))}
        </div>
      )}

      {scholarships.length === 0 ? (
        <p className="mt-8 font-body text-base text-slate">
          No scholarships match that filter.
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-10">
          {scopes.map((scope) => (
            <section key={scope}>
              <h2 className="mb-4 font-body text-xs font-semibold tracking-widest text-slate uppercase">
                {SCHOLARSHIP_SCOPE_LABELS[scope] ?? scope}
              </h2>
              <ul className="flex flex-col gap-4">
                {byScope.get(scope)!.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/scholarships/${s.slug}`}
                      className="group flex flex-col gap-1.5 rounded-2xl border border-line bg-mist p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)] sm:p-6"
                    >
                      <span className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-lg font-semibold text-ink text-balance group-hover:underline">
                          {s.name}
                        </h3>
                        <ArrowUpRightIcon className="mt-1 h-4 w-4 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
                      </span>
                      {s.amount && (
                        <span className="font-utility text-sm font-medium text-status-open">
                          {s.amount}
                        </span>
                      )}
                      <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-utility text-xs text-slate">
                        {s.study_level && <span>{s.study_level}</span>}
                        <span>
                          {s.separate_application === true
                            ? "Separate application"
                            : s.separate_application === false
                              ? "Automatic on admission"
                              : null}
                        </span>
                        {s.universities.length > 0 && (
                          <span>{s.universities[0].name}</span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="mt-10 font-body text-xs text-slate">
        Scholarship amounts, criteria, and deadlines change every year. Each page
        links its official source and shows when we last checked it. Always
        confirm the current terms on the provider&rsquo;s website before relying
        on them.
      </p>
    </main>
  );
}
