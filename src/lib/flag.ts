/**
 * Flag emoji for a 2-letter ISO 3166-1 alpha-2 country code, built from the
 * two regional-indicator symbols. Returns "" for anything that isn't a pair
 * of letters so callers can render it unconditionally.
 *
 * Note: Windows Chrome/Edge render these as the letter pair (e.g. "AU"), not
 * a flag, because Segoe UI Emoji has no flag glyphs. That's an acceptable
 * degradation and the reason we don't ship flag images.
 */
export function flagEmoji(code: string | null | undefined): string {
  const cc = (code ?? "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  return String.fromCodePoint(
    ...[...cc].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65),
  );
}
