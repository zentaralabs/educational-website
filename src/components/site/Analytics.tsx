"use client";

import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";
import { cookieConsentStore } from "@/lib/cookie-consent";
import { SITE_URL } from "@/lib/site-config";

/**
 * Loads GA4 whenever NEXT_PUBLIC_GA_MEASUREMENT_ID is set, using Google
 * Consent Mode v2: storage defaults to "denied", so until the visitor
 * accepts the cookie banner GA4 sets no cookies and sends only cookieless
 * pings (aggregate page views). Accepting flips analytics_storage to
 * "granted" and full measurement begins. This matches /privacy: no
 * analytics cookie is set before consent.
 *
 * Both the script and event beacons are served first-party (see the
 * rewrites in next.config.ts) rather than from googletagmanager.com /
 * google-analytics.com directly, so tracker blockers that block those
 * domains (Brave Shields, uBlock, etc.) don't see anything to block.
 */
export function Analytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const consent = useSyncExternalStore(
    cookieConsentStore.subscribe,
    cookieConsentStore.getSnapshot,
    cookieConsentStore.getServerSnapshot,
  );

  useEffect(() => {
    const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    if (typeof gtag !== "function") return;
    gtag("consent", "update", {
      analytics_storage: consent === "accepted" ? "granted" : "denied",
    });
  }, [consent]);

  if (!measurementId) return null;

  return (
    <>
      <Script src={`/js/site.js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          var accepted = false;
          try { accepted = window.localStorage.getItem('cookie-consent') === 'accepted'; } catch (e) {}
          gtag('consent', 'default', {
            analytics_storage: accepted ? 'granted' : 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          });
          gtag('js', new Date());
          gtag('config', '${measurementId}', { transport_url: '${SITE_URL}/api/hit' });
        `}
      </Script>
    </>
  );
}
