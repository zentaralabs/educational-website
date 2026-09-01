type EventParams = Record<string, string | number | boolean | undefined>;

type Gtag = (...args: unknown[]) => void;

/**
 * Fire a GA4 event. No-ops on the server, and no-ops on the client until GA4
 * has actually loaded (measurement id unset, or the visitor has not accepted
 * the cookie consent banner — see {@link Analytics}). Callers never need to
 * guard for either case.
 */
export function trackEvent(name: string, params?: EventParams) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  gtag("event", name, params);
}
