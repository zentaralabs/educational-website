import Link from "next/link";
import { joinWithAnd } from "@/lib/format";
import { listPublicCountries } from "@/lib/queries/public-countries";

const EXPLORE = [
  { label: "Universities", href: "/compare/universities" },
  { label: "Application deadlines", href: "/deadlines" },
  { label: "Courses by subject", href: "/study" },
  { label: "Cost of living", href: "/cost-of-living" },
  { label: "Scholarships", href: "/scholarships" },
  { label: "Best universities (shortlists)", href: "/best" },
  { label: "Compare universities", href: "/compare" },
  { label: "Find a university (quiz)", href: "/quiz" },
];

const LEARN = [
  { label: "How-to guides", href: "/guides" },
  { label: "Visa subclasses", href: "/visas" },
  { label: "Points calculator (189, 190, 491)", href: "/visas/points-calculator" },
  { label: "SkillSelect invitation rounds", href: "/visas/invitation-rounds" },
  { label: "Blog", href: "/blog" },
];

const SITE = [
  { label: "About", href: "/about" },
  { label: "Editorial policy", href: "/editorial-policy" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
];

const linkCls =
  "font-body text-sm text-slate transition-colors duration-150 hover:text-ink";
const headingCls =
  "font-body text-xs font-semibold tracking-widest text-ink uppercase";

export async function SiteFooter() {
  const countries = await listPublicCountries();

  return (
    <footer className="mt-16 border-t border-line bg-mist">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold text-ink">
            Where To Apply
          </p>
          <p className="mt-2 max-w-xs font-body text-sm text-slate">
            Deadlines, entry requirements, tuition, scholarships, and visa
            pathways for studying at universities in{" "}
            {joinWithAnd(countries.map((c) => c.name))}.
          </p>
          <p className="mt-3 font-body text-sm text-slate">
            Browse by country:{" "}
            {countries.map((c, i) => (
              <span key={c.code}>
                <Link href={`/deadlines?country=${c.code}`} className="underline underline-offset-2 hover:text-ink">
                  {c.name}
                </Link>
                {i < countries.length - 1 && ", "}
              </span>
            ))}
          </p>
        </div>

        <div>
          <p className={headingCls}>Explore</p>
          <ul className="mt-3 flex flex-col gap-2">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkCls}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className={headingCls}>Guides & visas</p>
          <ul className="mt-3 flex flex-col gap-2">
            {LEARN.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkCls}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className={headingCls}>Site</p>
          <ul className="mt-3 flex flex-col gap-2">
            {SITE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkCls}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line px-6 py-4">
        <p className="mx-auto max-w-6xl font-utility text-xs text-slate">
          © {new Date().getFullYear()} Where To Apply. Not affiliated with any
          university. Information is independently researched and verified; see
          each page&rsquo;s &ldquo;last verified&rdquo; date and sources.
        </p>
      </div>
    </footer>
  );
}
