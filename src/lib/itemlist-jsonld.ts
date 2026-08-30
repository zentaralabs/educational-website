import { SITE_URL } from "@/lib/site-config";

/**
 * ItemList JSON-LD for a listing/hub page — the ordered set of detail pages it
 * links to. Per PROJECT_STATUS.md Section 5's GEO/AEO tactics: gives answer
 * engines an explicit, machine-readable index of what the page collects.
 */
export function itemListJsonLd({
  name,
  items,
}: {
  name: string;
  items: { path: string; name: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}${item.path}`,
      name: item.name,
    })),
  };
}
