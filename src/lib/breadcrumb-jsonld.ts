import { SITE_URL } from "@/lib/site-config";

export type BreadcrumbItem = { label: string; href?: string };

/** BreadcrumbList JSON-LD, per PROJECT_STATUS.md Section 5's GEO/AEO tactics. */
export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };
}
