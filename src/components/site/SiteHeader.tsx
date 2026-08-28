import Link from "next/link";
import { HeaderNav } from "@/components/site/HeaderNav";

/**
 * Persistent top nav. Stays a server component; the interactive grouped
 * menus live in HeaderNav (client). Faceted filtering lives on listing
 * pages instead of deep menus here. The domestic/international toggle lives
 * on the homepage under the search box, not here.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-ink/10 bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-4 sm:flex-nowrap">
        <Link
          href="/"
          className="whitespace-nowrap font-display text-lg font-semibold tracking-tight text-ink"
        >
          Where To Apply
        </Link>

        <HeaderNav />
      </div>
    </header>
  );
}
