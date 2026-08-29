---
description: Quarterly re-verification of the Australia university dataset (deadlines first, then fees/selectivity/English/living costs) against official sources
argument-hint: "[deadlines-only | full]  (default: full)"
---

Run the periodic university-data refresh for Where To Apply. Scope: `$ARGUMENTS` (default `full`).

First read the memory file **`refresh-university-data.md`** — it has the full workflow, the seed structure, and the exact source URLs. Also read `site-product-state.md` and `em-dash-rule.md`. Then follow it. Summary of the job:

## Deadlines (always do this part)

`scripts/seed_deadlines.mjs` does a destructive delete + reinsert of all AU deadline rows.

1. Bump `TODAY` and the `INTAKES` anchor dates + `when:` strings to the current admissions cycle.
2. **Re-verify every `PER_UNI` firm date** against its official page (use the browser tool, most uni sites 403 WebFetch):
   - Sydney — https://www.sydney.edu.au/study/applying/application-dates.html
   - ANU — https://study.anu.edu.au/apply/international-applications
   - Melbourne UG — https://study.unimelb.edu.au/how-to-apply/undergraduate-study/international-applications/entry-requirements/important-dates
   - UWA — https://www.uwa.edu.au/study/how-to-apply/international-applicants (click "All other countries" tab; seed uses the earlier of the two country-group dates)
   - UTS — https://www.uts.edu.au/for-students/admissions-entry/application-dates
3. Spot-check ~5 `ROLLING` universities against `ROLLING_SOURCE[slug]` — confirm the stated lead time in the note still matches.
4. `grep -n "—\|–" scripts/seed_deadlines.mjs` must be empty (em-dash rule).
5. `node --check scripts/seed_deadlines.mjs` then `node scripts/seed_deadlines.mjs` (expect ~221 rows / 56 universities).
6. Revalidate prod:
   ```bash
   SECRET=$(awk -F= '/^REVALIDATE_WEBHOOK_SECRET=/{print $2}' .env.local)
   curl -s -X POST https://www.wheretoapply.xyz/api/revalidate \
     -H "x-revalidate-secret: $SECRET" -H "content-type: application/json" \
     -d '{"type":"UPDATE","table":"deadlines","record":null,"old_record":null,"schema":"public"}'
   ```
7. Verify on prod: `curl` Sydney / ANU / Melbourne + two rolling unis **twice each** (first hit serves stale, then regenerates). Confirm the firm dates and rolling notes are live.

## Full pass (skip if `$ARGUMENTS` is `deadlines-only`)

Spot-check against current official sources and re-seed where changed:
- International tuition + IELTS/PTE — `scripts/seed_uni_fees_ielts.mjs`, `scripts/seed_uni_pte.mjs` (fees rise most years; tuition is shown exactly on the site).
- Living costs — `scripts/update_living_costs.mjs` (re-anchor to the current Home Affairs financial-capacity figure).
- Editorial — `scripts/seed_university_editorial.mjs` only for material changes (mergers, renames, new campuses).

Never touch `last_verified_at` on a row whose facts you didn't actually re-check.

## Then

Update the deadline sections in `PROJECT_STATUS.md` with the run date and what changed, then commit + push to `main` (code only — DB writes aren't in the diff).
