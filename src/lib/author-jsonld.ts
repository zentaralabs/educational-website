import { SITE_URL } from "@/lib/site-config";

/** The site publisher's stable @id (defined once, in the root layout). */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/**
 * A schema.org Person for a byline, with a stable @id so the same author is
 * one entity across guides, visas, blog posts and the founder node, instead
 * of a bare name repeated per page. Points at /about, where the author is
 * actually described. No `sameAs` here on purpose: only add profile URLs that
 * are real and verified, never guessed.
 */
export function personJsonLd(person: {
  name: string;
  credentials?: string | null;
}) {
  const slug = person.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/about#${slug}`,
    name: person.name,
    url: `${SITE_URL}/about`,
    description: person.credentials ?? undefined,
    worksFor: { "@id": ORGANIZATION_ID },
  };
}

/** The site's founder/editor, for pages with no per-row author. */
export const FOUNDER_JSON_LD = personJsonLd({ name: "Roman Lama" });
