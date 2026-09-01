"use client";

import type { ComponentPropsWithoutRef } from "react";
import { trackEvent } from "@/lib/analytics";

type Props = ComponentPropsWithoutRef<"a"> & {
  event: string;
  eventParams?: Record<string, string | number | boolean | undefined>;
};

/**
 * Anchor that reports a GA4 event when clicked. Use for outbound links whose
 * click is a meaningful action worth counting as a conversion — application
 * CTAs, official-site handoffs. Falls back to a plain link when analytics is
 * not loaded.
 */
export function OutboundLink({ event, eventParams, onClick, children, ...rest }: Props) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        trackEvent(event, eventParams);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
