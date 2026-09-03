import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

// Paths that never belong in any index (auth + admin, and the first-party
// GA4 proxy paths from next.config.ts — no content, no reason to spend
// crawl budget on them).
const DISALLOW = [
  "/admin",
  "/admin/",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/js/site.js",
  "/api/hit",
];

// AI answer engines, assistants, and dataset crawlers. Named explicitly and
// allowed on purpose: Google-Extended, Applebot-Extended and CCBot govern
// whether a site's content may be used for AI, and are treated as opt-in by
// many publishers, so the wildcard rule below is not enough to signal intent.
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_AGENTS, allow: "/", disallow: DISALLOW },
      // Google ad crawlers: AdSense content matching (Mediapartners-Google)
      // and Ads landing-page quality checks (AdsBot-Google, which ignores
      // the "*" group and must be named). Full access, no ad-serving impact.
      {
        userAgent: ["Mediapartners-Google", "AdsBot-Google", "AdsBot-Google-Mobile"],
        allow: "/",
      },
    ],
    // Index first, then both children explicitly. `/sitemap.xml` is the ~340
    // URLs worth crawl budget; `/sitemap-programs.xml` is the ~870 templated
    // program cards, split out so they neither dilute the main file's
    // discovery signal nor hide which section is actually getting indexed.
    // Listing all three is redundant but harmless, and means a crawler that
    // ignores index files still finds both.
    sitemap: [
      `${SITE_URL}/sitemap-index.xml`,
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/sitemap-programs.xml`,
    ],
  };
}
