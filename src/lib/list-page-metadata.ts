import type { Metadata } from "next";

/**
 * Canonical + robots rules for a filterable / paginated list page (blog,
 * deadlines, scholarships, the university comparison builder).
 *
 * - Filtered views (any facet param set — tag, level, country, a picked
 *   comparison set, …) are thin, near-duplicate slices of the base list:
 *   the canonical points back to the clean base path and they are kept out
 *   of the index. `follow` stays on so the links still flow.
 * - Unfiltered pagination (`?page=N`, N > 1) self-canonicalizes to its own
 *   URL and stays indexable — since Google dropped `rel=next/prev` each
 *   page is its own document and must not canonicalize to page 1.
 * - The unfiltered first page canonicalizes to the bare base path.
 */
export function listPageCanonical(opts: {
  base: string;
  isFiltered: boolean;
  page?: number;
}): Pick<Metadata, "alternates" | "robots"> {
  const page = opts.page && opts.page > 1 ? opts.page : 1;

  if (opts.isFiltered) {
    return {
      alternates: { canonical: opts.base },
      robots: { index: false, follow: true },
    };
  }

  return {
    alternates: {
      canonical: page > 1 ? `${opts.base}?page=${page}` : opts.base,
    },
  };
}
