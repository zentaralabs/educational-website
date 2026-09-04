import Link from "next/link";
import { SearchBar } from "@/components/site/SearchBar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/deadlines", label: "Application deadline calendar" },
  { href: "/study", label: "Courses by subject" },
  { href: "/best", label: "Best universities, by category" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/visas", label: "Visa subclasses" },
  { href: "/guides", label: "How-to guides" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <p className="font-utility text-xs font-semibold tracking-wide text-slate uppercase">
          404
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance">
          We couldn&rsquo;t find that page
        </h1>
        <p className="mt-4 font-body text-base leading-relaxed text-slate">
          The page may have moved or the link may be wrong. If you followed a
          link from another page on this site, tell us at{" "}
          <a
            href="mailto:admin@wheretoapply.xyz"
            className="text-status-open underline underline-offset-2"
          >
            admin@wheretoapply.xyz
          </a>{" "}
          so we can fix it.
        </p>

        <div className="mt-6">
          <SearchBar />
        </div>

        <h2 className="mt-10 mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Popular sections
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block rounded-xl border border-line bg-mist px-4 py-3 font-body text-sm font-medium text-ink transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:underline"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 font-body text-sm text-slate">
          Or{" "}
          <Link
            href="/"
            className="text-status-open underline underline-offset-2"
          >
            go back to the homepage
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
