---
description: Write and publish a new blog post (dated news / analysis) to Where To Apply
argument-hint: <topic>  — e.g. "student visa fee increase July 2026"
---

Add a blog post to Where To Apply. Topic: **$ARGUMENTS**

Read the memory file **`add-content-prompt.md`** and follow it. Also read `site-product-state.md`, `em-dash-rule.md`, and (if the topic is visa/migration/policy) `visa-feature.md`. Key points:

- **Content lives in Supabase, not the repo.** Connect with `DATABASE_URL` from `.env.local` via a one-off `pg` script placed in the project root (so `pg` resolves), then delete it.
- Table: `blog_posts`. Cols: slug, title, content, excerpt, tags (text[]), word_count, author_id, status, published_at, last_verified_at, source_urls. Author is Roman Lama: `author_id = '6e1c0e5b-ed26-497c-a09c-e9539c6761e8'`. Set `status='published'`, `word_count` = `content.trim().split(/\s+/).length`.
- If this is a SkillSelect invitation round, **stop and use `/add-round` instead.**
- **>= 300 words, but no padding** — real substance (dollar/points math, tables, named universities/cities, checklists) or make it shorter and tighter. No invented stats, sources, quotes, or personal experience; hedge anything you can't source and flag it to me.
- **Zero em dashes** anywhere. Run `node scripts/check_em_dashes.mjs` after — must be clean.
- Analysis posts (`tags` includes `what-we-are-watching`) MUST open by stating they're estimates, not reporting, and how confident.
- Link generously into the database pages: `/universities/<slug>`, `/best/<slug>`, `/compare/...`, `/deadlines`, `/visas/<slug>`, `/scholarships/<slug>`, `/guides/<slug>`, `/study/<subject>`, `/visas/points-calculator`, `/visas/invitation-rounds`. Verify each slug exists before linking. FAQ subheads phrased as questions (`## Can I ...?`) auto-generate schema.
- `source_urls`: 1–3 official pages you verified against. `immi.homeaffairs.gov.au` 403s WebFetch — use the browser tool.

## Publish
1. Write the row to the DB.
2. If visa/migration/policy: also append the entry to the `posts` array in `scripts/seed_visa_content.mjs` and bump its `TODAY`, so a re-seed doesn't wipe it. Other topics have no seed script — tell me the DB is the only copy.
3. Revalidate: `POST https://www.wheretoapply.xyz/api/revalidate` with `x-revalidate-secret: <REVALIDATE_WEBHOOK_SECRET>` and body `{"table":"blog_posts","record":{"slug":"<slug>"}}` (prod webhook also fires automatically).

## Then
Show me the rendered post text for a fact-check pass, list anything hedged, then commit + push any code changes to `main` (DB writes aren't in the diff).

## LinkedIn
Draft a short post for the Where To Apply company page (`linkedin.com/company/wheretoapply`) and hand it to me to publish manually (LinkedIn `nofollow`s the link, so this is a credibility signal for journalists who vet the page, not SEO):
- First two lines are a specific, non-obvious fact from the post. Never "check out our new post" or "excited to share".
- One link to the new `/blog/<slug>` page. One line noting figures are sourced and dated.
- 2–3 hashtags from: `#StudyInAustralia` `#InternationalStudents` `#StudentVisa` `#SkilledMigration`.
- Zero em dashes. ~120–180 words. Plain, independent voice — no brochure language.
- Cadence (see `BACKLINKS.md`): only real events warrant a post, roughly one per 1–2 weeks. If the page has already posted in the last several days, say so and hold this draft.
- Analysis posts (`what-we-are-watching`): the LinkedIn post must also say up front that it's an estimate, not reporting.
