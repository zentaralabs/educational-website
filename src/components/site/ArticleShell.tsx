import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/site/Breadcrumbs";
import { TableOfContents } from "@/components/site/TableOfContents";
import type { TocItem } from "@/lib/toc";

/**
 * Shared reading layout for guide and blog articles: breadcrumbs, a header
 * band (eyebrow chip, title, byline), then the body in a column with a
 * sticky "On this page" rail on lg+. `footer` (last-verified, FAQ, related)
 * sits under the body, aligned to the text column.
 */
export function ArticleShell({
  breadcrumbs,
  eyebrow,
  title,
  meta,
  toc,
  children,
  footer,
}: {
  breadcrumbs: Crumb[];
  eyebrow: ReactNode;
  title: string;
  meta?: ReactNode;
  toc: TocItem[];
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16 lg:max-w-5xl">
      <Breadcrumbs items={breadcrumbs} />

      <header className="border-b border-line pb-8 lg:max-w-[46rem]">
        <div className="flex items-center gap-2 font-utility text-[0.8rem] font-semibold tracking-wide text-slate uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
          {eyebrow}
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
          {title}
        </h1>
        {meta}
      </header>

      <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-14">
        <div className="min-w-0 lg:max-w-[46rem]">
          <TableOfContents items={toc} variant="panel" />
          {children}
          {footer}
        </div>
        <div>
          <TableOfContents items={toc} variant="rail" />
        </div>
      </div>
    </main>
  );
}
