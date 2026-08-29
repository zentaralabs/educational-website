/** True for a URL that is just a bare origin ("https://example.com/") with
 * no path — too generic to cite as the source for a specific fact. */
function isBareDomain(url: string): boolean {
  return /^https?:\/\/[^/]+\/?$/.test(url.trim());
}

/**
 * Best single source URL to show next to a fact group: the first
 * deep-linking entry in the fact-check source list, falling back to any
 * entry, then to the official website. Returns null when nothing usable.
 */
export function pickPrimarySource(
  sources: string[] | null | undefined,
  websiteUrl?: string | null,
): string | null {
  const list = (sources ?? []).filter(Boolean);
  return (
    list.find((u) => !isBareDomain(u)) ??
    list[0] ??
    websiteUrl ??
    null
  );
}
