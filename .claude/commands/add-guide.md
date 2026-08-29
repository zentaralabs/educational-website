---
description: Write and publish a new evergreen how-to / reference guide to Where To Apply
argument-hint: <topic>  — e.g. "how to get a student visa for Australia"
---

Add a guide to Where To Apply. Topic: **$ARGUMENTS**

Read the memory file **`add-content-prompt.md`** and follow it. Also read `site-product-state.md` and `em-dash-rule.md`. Key points:

- **Content lives in Supabase, not the repo.** Connect with `DATABASE_URL` from `.env.local` via a one-off `pg` script placed in the project root (so `pg` resolves), then delete it.
- Table: `guides`. Cols: slug, title, category, country_id, content, excerpt, word_count, author_id, status, last_verified_at, source_urls, qa_facts_verified, qa_sentence_variation_checked, qa_firsthand_detail_added. Author is Roman Lama: `author_id = '6e1c0e5b-ed26-497c-a09c-e9539c6761e8'`. Set `status='published'`, `word_count` = `content.trim().split(/\s+/).length`.
- `category` in `how-to` | `country-guide` | `test-prep` | `comparison`. For `country-guide`, set `country_id = (select id from countries where code='AU')`. Note: `comparison`-category guides route to `/compare`, not `/guides`.
- **>= 450 words, but no padding** — real substance (worked examples, dollar/points math, GFM tables, checklists, named universities/cities/subjects from site data) or make it tighter. No invented stats, sources, quotes, credentials, or personal experience; hedge what you can't source and flag it.
- **Zero em dashes** anywhere. Run `node scripts/check_em_dashes.mjs` after — must be clean.
- Plain and specific. Avoid "comprehensive guide", "ultimate guide", "in today's world", "let's dive in", "in conclusion".
- Link generously into database pages: `/universities/<slug>`, `/best/<slug>`, `/compare/...`, `/deadlines`, `/visas/<slug>`, `/scholarships/<slug>`, `/study/<subject>`, `/cost-of-living/<city>`, `/visas/points-calculator`, `/visas/invitation-rounds`, other `/guides/<slug>`. Verify each slug exists first. FAQ subheads as questions (`## Can I ...?`) auto-generate FAQPage schema.
- `source_urls`: 1–3 official pages (gov / university / regulator) you verified every date, dollar amount, points value, age limit and threshold against. `immi.homeaffairs.gov.au` 403s WebFetch — use the browser tool. Only set `last_verified_at` to today after you've actually checked.

## Publish
1. Write the row to the DB.
2. If the topic is visa / migration / Australian-policy: also append the entry to the `guides` array in `scripts/seed_visa_content.mjs` and bump its `TODAY`. Other guide topics have no seed script — tell me the DB is the only copy.
3. Revalidate: `POST https://www.wheretoapply.xyz/api/revalidate` with `x-revalidate-secret: <REVALIDATE_WEBHOOK_SECRET>` and body `{"table":"guides","record":{"slug":"<slug>"}}` (prod webhook also fires automatically). Sitemap auto-includes published guides.

## Then
Show me the rendered guide text for a fact-check pass, list anything hedged, then commit + push any code changes to `main` (DB writes aren't in the diff).
