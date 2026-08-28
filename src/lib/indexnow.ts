import { SITE_URL } from "@/lib/site-config";

/**
 * IndexNow — instant crawl notification for Bing, Yandex, Seznam, Naver and
 * anyone else on the protocol (Google and Brave do not participate; they
 * pick changes up from the sitemap's lastmod instead).
 *
 * The key is public by design: it is verified by serving the same string at
 * https://<host>/<key>.txt, which is why it lives in the repo (public/) and
 * as a plain constant here rather than an env secret.
 *
 * The point of wiring this in is the invitation-round tracker: when a new
 * SkillSelect round is published, we want Bing to re-index the page in
 * minutes rather than on its own crawl schedule.
 */
export const INDEXNOW_KEY = "b1d94f7a2c8e4056a3f61e0d5c927b8f";

const ENDPOINT = "https://api.indexnow.org/indexnow";

/** Absolute-ise a path or pass an already-absolute URL through. */
function toAbsolute(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/**
 * Best-effort ping. Never throws — a failed submission must not break a
 * revalidation webhook or a seed run. Returns whether the ping was accepted.
 */
export async function pingIndexNow(paths: string[]): Promise<boolean> {
  const urlList = [...new Set(paths.map(toAbsolute))];
  if (urlList.length === 0) return false;

  const host = new URL(SITE_URL).host;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    });
    // 200 = accepted, 202 = accepted pending validation. Anything else is a
    // no-op we don't care enough about to surface.
    return res.status === 200 || res.status === 202;
  } catch {
    return false;
  }
}
