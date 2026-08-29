import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import {
  UniversityDirectory,
  type DirectoryUniversity,
} from "@/components/site/UniversityDirectory";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { AU_STATES, GO8_SLUGS, isRegionalCity, statesFromCity } from "@/lib/australia";
import { SITE_URL, SITE_YEAR } from "@/lib/site-config";
import { listCollectionUniversities } from "@/lib/queries/public-collections";

export const revalidate = 3600;

const title = `Australian Universities for International Students (${SITE_YEAR})`;
const description =
  "Every university and college in Australia that takes international students, in one filterable list: tuition, English requirements, intakes, state, and whether it counts as regional for migration points.";

export const metadata = {
  title,
  description,
  alternates: { canonical: "/universities" },
  openGraph: { title, description, url: "/universities", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

const RELATED = [
  { label: "Group of Eight universities", href: "/best/group-of-eight-universities-in-australia" },
  { label: "Most affordable universities", href: "/best/affordable-australian-universities-for-international-students" },
  { label: "Regional universities (migration points)", href: "/best/regional-australian-universities-for-skilled-migration" },
  { label: "Universities with no application fee", href: "/best/australian-universities-with-no-application-fee" },
  { label: "Universities accepting IELTS 6.0", href: "/best/australian-universities-accepting-ielts-6-0-for-international-students" },
  { label: "Universities with multiple intakes", href: "/best/australian-universities-with-multiple-intakes-per-year" },
];

export default async function UniversitiesIndexPage() {
  const raw = await listCollectionUniversities();

  const universities: DirectoryUniversity[] = raw.map((u) => ({
    slug: u.slug,
    name: u.name,
    city: u.city,
    states: statesFromCity(u.city),
    type: u.institution_type,
    isGo8: GO8_SLUGS.has(u.slug),
    isRegional: isRegionalCity(u.city),
    minTuition: u.minTuition,
    ielts: u.ieltsOverall,
    hasJulyIntake: u.intakes.includes("July"),
    intakeCount: u.intakes.length,
  }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Universities" },
  ];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Universities in Australia for international students",
    numberOfItems: universities.length,
    itemListElement: universities.map((u, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/universities/${u.slug}`,
      name: u.name,
    })),
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <Breadcrumbs items={breadcrumbs} />

      <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        Australian universities for international students
      </h1>

      <div className="mt-4 flex flex-col gap-3 font-body text-base leading-relaxed text-ink">
        <p>
          All {universities.length} universities and colleges in Australia that
          enrol international students, with the numbers that actually decide
          where you apply: the lowest international tuition on record, the
          English score the institution accepts, which intakes it runs, and
          whether its campus counts as regional for skilled-migration points.
        </p>
        <p>
          Filter the list below, or open any university for its full profile:
          deadlines, first-year budget, scholarships, entry requirements, and how
          to apply. To weigh two side by side, use the{" "}
          <Link
            href="/compare/universities"
            className="font-medium text-status-open underline underline-offset-2"
          >
            comparison tool
          </Link>
          ; to get a shortlist from your budget and preferences, try the{" "}
          <Link
            href="/quiz"
            className="font-medium text-status-open underline underline-offset-2"
          >
            quiz
          </Link>
          .
        </p>
      </div>

      <UniversityDirectory universities={universities} />

      <div className="mt-10 border-t border-ink/10 pt-6">
        <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Browse by state
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {AU_STATES.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/universities/in/${s.slug}`}
                className="block rounded-xl border border-line bg-mist px-4 py-3 font-body text-sm font-medium text-ink transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:underline"
              >
                Universities in {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 border-t border-ink/10 pt-6">
        <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Ready-made shortlists
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {RELATED.map((r) => (
            <li key={r.href}>
              <Link
                href={r.href}
                className="block rounded-xl border border-line bg-mist px-4 py-3 font-body text-sm font-medium text-ink transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:underline"
              >
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-8 font-body text-xs text-slate">
        Tuition figures are the lowest on record and vary widely by course.
        English scores are the institution-wide minimum; individual courses set
        their own. Confirm every figure on the university&rsquo;s official site
        before applying.
      </p>
    </main>
  );
}
