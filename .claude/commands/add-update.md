---
description: Log an Australia student/visa policy change to the /updates feed
argument-hint: "[change]" — e.g. "student visa charge rise July 2026"
---

Log a policy change on Where To Apply: **$ARGUMENTS**

Read `em-dash-rule.md` and `visa-feature.md`. This is the structured-log
sibling of `/add-round`: one row in `policy_updates`, rendered at `/updates`.

Scope check first. This feed is for changes that affect **applying to study
in Australia**: student visa charges and conditions, Ministerial Directions /
processing priorities, post-study work (485), English-test recognition, PR
settings, National Planning Level, university-sector policy. Not general
Australia news, and not SkillSelect round numbers (those are `/add-round`).

## 1. Verify against the official source

Primary sources: `immi.homeaffairs.gov.au` and `education.gov.au` (also
`ministers.education.gov.au`, `minister.homeaffairs.gov.au` for announcement
dates). **WebFetch 403s on immi and the immi news-article pages do not render
for the browser tool** — use `navigate` + `get_page_text` on the visa /
help pages themselves, and WebSearch for announcement dates. Capture: what
changed, the announced date, the effective date, who it affects, and one
working official URL. If a figure is only on migration-practice blogs and not
an official page, either leave it out or set `is_estimated: true` and say so
in the summary.

## 2. Add the row — `scripts/seed_policy_updates.mjs`

Append to the `updates` array (order does not matter; the page sorts by
`announced_date desc`). One object:
`{ slug, title, category, announced_date, effective_date, summary, impact,
affects, detail_url, sources }`
- `slug`: kebab-case, stable, unique — it is the `/updates#<slug>` anchor and
  the upsert key. Editing an existing change? Reuse its slug.
- `category`: one of `student-visa`, `post-study-work`, `fees-and-charges`,
  `english-language`, `pr-pathway`, `university-sector`, `other`.
- `title`: the change as a statement, not a topic ("Student visa charge rises
  to A$2,500", not "Visa charges").
- `summary`: 1-3 plain sentences. `impact`: what an applicant should do (or
  null). `affects`: 1-3 short audience labels. `effective_date`: null if
  already in force with no dated start.
- `detail_url`: null, unless the change warrants a full analysis post — then
  run `/add-blog` first and point `detail_url` at `/blog/<that-slug>`.
- **Zero em dashes.** Bump `TODAY`. Run `node scripts/seed_policy_updates.mjs`
  — expect `upserted N`, `em-dash check: clean`, `indexnow 200`.

## 3. Revalidate + verify

Prod: the Supabase webhook fires on the SQL write and revalidates `/updates`
(and pings IndexNow). Locally or to force it:
`POST /api/revalidate` with the `x-revalidate-secret` header and
`{"table":"policy_updates","record":{"slug":"<slug>"}}`.
Check `/updates`: the entry appears in the right year, the source link works,
the `#<slug>` anchor scrolls to it. If it is within ~8 weeks old, confirm the
homepage strip under the search box now shows it.

## 4. Commit

Commit the seed-script change (and any `/add-blog` companion) to `main` and
push. The DB write is not in the diff.
