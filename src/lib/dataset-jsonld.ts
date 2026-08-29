import { SITE_URL } from "@/lib/site-config";

/**
 * Dataset JSON-LD describing the structured admissions data behind the site
 * (universities, deadlines, tuition, English requirements, scholarships, visa
 * facts). Used on /methodology and /universities so search engines and
 * answer engines can recognise the site as a maintained data source.
 */
export function datasetJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  keywords?: string[];
  variableMeasured?: string[];
  temporalCoverage?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.url}`,
    license: `${SITE_URL}/terms`,
    isAccessibleForFree: true,
    creator: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(opts.keywords ? { keywords: opts.keywords } : {}),
    ...(opts.temporalCoverage
      ? { temporalCoverage: opts.temporalCoverage }
      : {}),
    ...(opts.variableMeasured
      ? { variableMeasured: opts.variableMeasured }
      : {}),
    spatialCoverage: { "@type": "Country", name: "Australia" },
    creativeWorkStatus: "Published",
  };
}
