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
 * program query and could time out on a cold database. The query was fixed
 * long before this comment was first written, but the failed record on that
 * URL never cleared — repeated resubmission does nothing, and even live
 * URL tests and Googlebot's own crawl history confirmed the file fetched
 * fine while Search Console's Sitemaps report kept reporting failure against
 * that exact URL. This index's own submission (2026-09-03) was a fresh URL
 * and worked immediately, but it turned out that pulling the *content* of
 * `/sitemap.xml` in as a child here did not carry the same immunity — the
 * old URL's poisoned record apparently followed it even when reached
 * indirectly. So on 2026-09-20 that content was moved again, this time to
 * `/sitemap-pages.xml` (a URL with no history at all, same pattern already
 * proven for `/sitemap-programs.xml`), and `/sitemap.xml` itself was retired
 * with a `410 Gone` rather than reused for anything again.
 *
 * Next generates no index of its own for a metadata-route sitemap, hence the
 * hand-rolled route.
 */
export const revalidate = 21600; // 6h, same cadence as the children

const CHILDREN = ["/sitemap-pages.xml", "/sitemap-programs.xml"];

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
