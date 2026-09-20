/**
 * `/sitemap.xml` is retired. Its content now lives at `/sitemap-pages.xml`
 * (see that file for the full explanation): Search Console recorded this
 * exact URL as "Couldn't fetch" once, and a failed sitemap's record does not
 * clear on resubmission — confirmed repeatedly, since live fetches, Googlebot's
 * own crawl history, and Search Console's own live-URL test all showed this
 * file fetching cleanly, while the Sitemaps report kept the old failure
 * against this URL regardless. `410 Gone` (rather than a redirect, which a
 * sitemap fetcher is not guaranteed to follow, or a silent 404) is the
 * clearest signal to stop retrying this specific URL.
 */
export async function GET() {
  return new Response("Gone. See /sitemap-pages.xml.", { status: 410 });
}
