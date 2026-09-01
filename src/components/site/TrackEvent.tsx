"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Fires a single GA4 event once on mount. Drop into a server-rendered page
 * that represents a completed action (quiz results, a confirmation view) to
 * record it as a conversion.
 */
export function TrackEvent({
  event,
  eventParams,
}: {
  event: string;
  eventParams?: Record<string, string | number | boolean | undefined>;
}) {
  useEffect(() => {
    trackEvent(event, eventParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
