"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { cookieConsentStore, setStoredConsent } from "@/lib/cookie-consent";

/**
 * Shown on first visit until a choice is made — matches the claim already
 * made on /privacy ("shown on your first visit... before any non-essential
 * cookie is set"). Accept/decline are equal-weight buttons, no dark
 * pattern — declining is exactly as easy as accepting.
 */
export function CookieConsentBanner() {
  const consent = useSyncExternalStore(
    cookieConsentStore.subscribe,
    cookieConsentStore.getSnapshot,
    cookieConsentStore.getServerSnapshot,
  );

  if (consent !== null) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-paper px-6 py-4 shadow-[0_-4px_16px_rgba(27,42,74,0.08)]"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <p className="font-body text-sm text-slate">
          We use essential cookies to run this site, and analytics cookies
          only if you accept them.{" "}
          <Link href="/privacy" className="text-status-open underline underline-offset-2">
            Privacy policy
          </Link>
        </p>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setStoredConsent("declined")}
            className="rounded-lg border border-ink/15 px-4 py-2 font-body text-sm font-medium text-ink transition-colors duration-150 hover:border-ink/30"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => setStoredConsent("accepted")}
            className="rounded-lg bg-ink px-4 py-2 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
