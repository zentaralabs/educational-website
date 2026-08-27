"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import { cookieConsentStore } from "@/lib/cookie-consent";

/**
 * Loads GA4 only when both (a) NEXT_PUBLIC_GA_MEASUREMENT_ID is actually
 * set — inert until analytics is really configured — and (b) the visitor
 * has accepted the cookie consent banner. Matches the claim on /privacy
 * that "analytics only run after you accept the cookie consent banner."
 */
export function Analytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const consent = useSyncExternalStore(
    cookieConsentStore.subscribe,
    cookieConsentStore.getSnapshot,
    cookieConsentStore.getServerSnapshot,
  );

  if (!measurementId || consent !== "accepted") return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
