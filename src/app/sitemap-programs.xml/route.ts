import { SITE_URL } from "@/lib/site-config";
import { listPublishedProgramsForSitemap } from "@/lib/queries/public-programs";

/**
 * Second sitemap, for program pages only.
 *
 * Why they are not in `/sitemap.xml` any more: of 1,209 URLs there, 868 (72%)
 * were program cards — a templated data layer over one degree each. On a
 * six-week-old domain with almost no inbound links, Google had discovered
 * roughly 61 URLs in total, so the pages that can actually rank (the intake
 * hubs, the source-country guides, the visa pages, the shortlists) were
 * competing for discovery against seven times their number in long-tail
 * cards.
 *
 * Splitting them costs nothing — both files are declared in robots.txt and
 * can be submitted to Search Console separately — and buys two things:
 * a clean crawl signal on the main file, and per-section index coverage in
 * Search Console, which is what finally answers whether program pages earn
 * their keep (GROWTH_PLAN Phase 0, "revisit the indexability floor").
 */
export const revalidate = 21600; // 6h, same cadence as /sitemap.xml
export const maxDuration = 60;

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let rows: Awaited<ReturnType<typeof listPublishedProgramsForSitemap>> = [];
  try {
    rows = await listPublishedProgramsForSitemap();
  } catch (err) {
    // Same rule as /sitemap.xml: serve a valid (if empty) document rather
    // than a 500, which Search Console records as "Couldn't fetch" and then
    // retries only slowly.
    console.error("[sitemap-programs] query failed, serving empty sitemap:", err);
  }

  const urls = rows
    .filter((p) => p.university?.slug && p.university.status === "published")
    .map((p) => {
      const loc = `${SITE_URL}/universities/${p.university!.slug}/programs/${p.slug}`;
      const lastmod = p.updated_at ? new Date(p.updated_at).toISOString() : null;
      return [
        "  <url>",
        `    <loc>${xmlEscape(loc)}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        "    <changefreq>monthly</changefreq>",
        "    <priority>0.4</priority>",
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
    },
  });
}
