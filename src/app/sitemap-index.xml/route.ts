import { SITE_URL } from "@/lib/site-config";

/**
 * Sitemap index over the site's two sitemaps.
 *
 * Two reasons it exists. The structural one: with the program pages split into
 * their own file, an index is the correct shape, and Search Console reports
 * coverage per child sitemap underneath it rather than making you submit and
 * read each separately.
 *
 * The practical one: Search Console recorded `/sitemap.xml` as "Couldn't
 * fetch" during the window when that route still ran a paginated 868-row
 * program query and could time out on a cold database. The query is gone and
 * the file now answers in ~200ms with a 200 and valid XML to Googlebot, but
 * the failed record persists and re-submitting the same URL does not clear it
 * (Search Console retries a failed sitemap slowly on a new domain). Submitting
 * this index is a fresh URL, so it gets a fresh record and pulls both children
 * in behind it.
 *
 * Next generates no index of its own for `sitemap.ts`, hence the hand-rolled
 * route.
 */
export const revalidate = 21600; // 6h, same cadence as the children

const CHILDREN = ["/sitemap.xml", "/sitemap-programs.xml"];

export async function GET() {
  // The children carry per-URL `lastmod` from their own rows; the index only
  // needs to say when the set itself last changed.
  const lastmod = new Date().toISOString();

  const body = CHILDREN.map(
    (path) =>
      `  <sitemap>\n    <loc>${SITE_URL}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`,
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
    },
  });
}
