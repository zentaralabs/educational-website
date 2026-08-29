---
description: Log a new SkillSelect invitation round (tracker row + recap blog post)
argument-hint: "[month] round"  — e.g. "September 2026 round" (or leave blank for the latest)
---

Log a SkillSelect invitation round on Where To Apply: **$ARGUMENTS**

Read the memory file **`add-invitation-round.md`** and follow it exactly. Also read `visa-feature.md` and `em-dash-rule.md`. Summary:

## 1. Real figures

Primary source: `immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/invitation-rounds`. **WebFetch 403s** — use the browser tool (`navigate` + `get_page_text`), or cross-check 2+ reputable AU migration blogs (visaenvoy, themigration, emigratelawyers, easymigrate). Capture: round date, subclass (189 / 491), invitations issued, tie-break / date-of-effect month, occupation-level cut-off spread.

## 2. Tracker row — `scripts/seed_visas.mjs`

Add to the `rounds` array (most-recent-first), one object per subclass per round:
`{ round_date, visa_code: "189"|"491", stream, invitations_issued, min_points: 65, occupation_notes, program_year, notes, is_estimated: false, source_url }`
- If a projected (`is_estimated: true`) row has now happened, replace it with real figures. Keep exactly one forward projection, roll its date forward.
- Bump `TODAY`. Rounds are delete-and-reinsert, so keep the whole history correct.
- Run `node scripts/seed_visas.mjs` (auto-pings IndexNow — expect `indexnow 202`).

## 3. Recap post — `scripts/seed_visa_content.mjs`

Add to `posts`, using `skillselect-round-4-june-2026-subclass-189` as the template:
- slug `skillselect-round-<d>-<month>-<year>-subclass-189`, title `The <D Month YYYY> SkillSelect round: <N> invitations for the 189`
- `published_at` = round date, `tags: ["visas","australia","skilled-migration"]`
- Structure: answer-first intro → `## The numbers` → `## What it means if you are in the pool` → `## The next round`
- Link to `/visas/skilled-independent-189`, `/visas/invitation-rounds`, `/visas/points-calculator`, `/visas/skilled-nominated-190`, `/visas/skilled-work-regional-491`, and the previous recap post.
- **Zero em dashes** — the seed's `LIKE '%—%'` guard must print `em-dash check: clean`.
- Run `node scripts/seed_visa_content.mjs` (auto-pings IndexNow).

## 4. Revalidate + verify

Prod: the Supabase webhook fires on the SQL write, so `/visas/invitation-rounds`, `/blog`, and the new post revalidate automatically. Verify the invitation-rounds hero shows the new round, the volume chart gains a bar, and the post renders. In GSC, URL-inspect `/visas/invitation-rounds` and Request Indexing.

## 5. Commit

Commit both seed-script changes to `main` and push (DB writes aren't in the diff).
