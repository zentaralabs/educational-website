import Link from "next/link";
import { joinWithAnd } from "@/lib/format";
import { listPublicCountries } from "@/lib/queries/public-countries";

const LEGAL = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
];

export async function SiteFooter() {
  const countries = await listPublicCountries();

  return (
    <footer className="mt-16 border-t border-ink/10 bg-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-base font-semibold text-ink">
            Where To Apply
          </p>
          <p className="mt-2 max-w-xs font-body text-sm text-slate">
            Deadlines, requirements, and scholarships for applying to
            universities in {joinWithAnd(countries.map((c) => c.name))}.
          </p>
        </div>

        <div>
          <p className="font-body text-sm font-semibold tracking-wide text-ink uppercase">
            Browse by country
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {countries.map((c) => (
              <li key={c.code}>
                <Link
                  href={`/deadlines?country=${c.code}`}
                  className="font-body text-sm text-slate transition-colors duration-150 hover:text-ink"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-body text-sm font-semibold tracking-wide text-ink uppercase">
            Site
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-body text-sm text-slate transition-colors duration-150 hover:text-ink"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/10 px-6 py-4">
        <p className="mx-auto max-w-6xl font-utility text-xs text-slate">
          © {new Date().getFullYear()} Where To Apply. Not affiliated with
          any university. Information is independently researched and
          verified — see each page&rsquo;s &ldquo;last verified&rdquo; date and sources.
        </p>
      </div>
    </footer>
  );
}
