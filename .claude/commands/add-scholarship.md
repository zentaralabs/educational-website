---
description: Add a scholarship (national or university-specific) to Where To Apply
argument-hint: <scholarship name> [+ university]  — e.g. "Deakin Vice-Chancellor's International Scholarship"
---

Add a scholarship to Where To Apply: **$ARGUMENTS**

Read `site-product-state.md` and `em-dash-rule.md` first. Scholarship content is managed by **`scripts/seed_scholarships.mjs`** (idempotent upsert by `slug`, not delete-and-reinsert), and the seed also writes directly to the live DB via `DATABASE_URL`.

## 1. Verify the facts

Check against the **official scholarship page** (university or DFAT/education.gov.au), cross-checked with a reputable aggregator. Capture: exact name, amount/value, who it's for (eligibility), whether it needs a separate application or is automatic, study level, and whether there's a fixed deadline. Amounts and rules change yearly.

## 2. Add the row to `scripts/seed_scholarships.mjs`

- **National scheme** → add an object to the `NATIONAL` array (shape: `name, slug, scope: "national", amount, study_level, separate_application, deadline_date, eligibility, description, external_url, source_url`).
- **University-specific** → add a positional row to the `UNI` array:
  `[name, slug, universitySlug, amount, study_level, separate_application, eligibility, description, externalUrl]`
  `universitySlug` must match an existing `universities.slug` (the seed warns and skips if not) and links the scholarship to that university via `scholarship_universities`.
- `slug`: kebab-case of the name. `study_level` in `Undergraduate | Graduate | Research | Any`. `scope` is `national` or `university-specific`.
- `description`: 2 short paragraphs — what it covers + how you get it (automatic vs separate form), and one line of practical context (e.g. "only first year, budget the standard fee after that").
- **Zero em dashes** in `name` / `description` / `eligibility` — the seed throws on `/—/` and prints an `em-dash check` line; confirm it's clean.
- No invented amounts or deadlines. Hedge anything you can't confirm ("confirm the current figure on the scholarship page") and flag it to me.
- Bump the `TODAY` const to today.

## 3. Run + revalidate

```bash
node scripts/seed_scholarships.mjs      # expect the new slug in the output + "em-dash check clean"
SECRET=$(awk -F= '/^REVALIDATE_WEBHOOK_SECRET=/{print $2}' .env.local)
curl -s -X POST https://www.wheretoapply.xyz/api/revalidate \
  -H "x-revalidate-secret: $SECRET" -H "content-type: application/json" \
  -d '{"type":"UPDATE","table":"scholarships","record":{"slug":"<slug>"}}'
```
That busts `scholarships:list` and pings IndexNow for `/scholarships` + `/scholarships/<slug>`. The prod Supabase webhook also fires on the write. Sitemap auto-includes it. If the scholarship belongs to a `/best/australian-universities-with-automatic-scholarships` type collection, that page picks it up automatically.

## 4. Verify + commit

`curl` `https://www.wheretoapply.xyz/scholarships/<slug>` twice (SWR) and confirm it renders. Show me the rendered text for a fact-check pass, list anything hedged, then commit + push the `seed_scholarships.mjs` change to `main` (the DB write isn't in the diff).
