# SEO Changelog

Log every SEO-sensitive change here: anything that can alter a URL, a canonical,
metadata, the sitemap, robots rules, indexation, redirects, or server-rendered
content. SEO regressions often surface weeks after deploy — this is the record
that lets us trace cause.

Format per entry: **Date · Change · Affected routes · SEO impact (LOW/MED/HIGH) ·
Redirects · Canonical/sitemap/metadata changes · Testing done.**

---

## 2026-09-03 · Source-country "how to apply" deep pages (Nepal, India, Pakistan)

- **Change:** New route `/international/{country}/how-to-apply` for the three
  priority source countries. Config in `src/lib/apply-guides.ts` (`APPLY_GUIDES`,
  keyed by country slug), route `src/app/(site)/international/[country]/how-to-apply/page.tsx`.
  Each page is the procedural companion to the `/international/{country}`
  overview: 8-9 ordered steps, a grouped documents checklist, a working-back
  timeline for a February intake, country-specific refusal pitfalls, and a
  5-item FAQ. Only countries with a verified guide get a page (route + sitemap
  are gated on `APPLY_GUIDE_SLUGS`). Phase 1 content spike, item 2.
- **Affected routes:** new — `/international/nepal/how-to-apply`,
  `/international/india/how-to-apply`, `/international/pakistan/how-to-apply`.
  The matching `/international/{country}` overview pages gain one internal CTA
  link (conditional on a guide existing); no other existing pages change.
- **SEO impact:** LOW-MED (3 new indexable pages targeting "how to apply to
  australian university from {country}"; no existing URL changes).
- **Redirects:** none.
- **Canonical / sitemap / metadata:** each page self-canonical; sitemap adds
  the 3 via `APPLY_GUIDE_SLUGS` (priority 0.7); Article + BreadcrumbList +
  FAQPage JSON-LD. `CONFIG_LAST_MODIFIED` already 2026-09-03.
- **Files:** `src/lib/apply-guides.ts` (new),
  `src/app/(site)/international/[country]/how-to-apply/page.tsx` (new),
  `src/app/sitemap.ts`, `src/app/(site)/international/[country]/page.tsx`.
- **Testing:** `next build` passes (3 pages prerender as SSG); `tsc --noEmit`
  + `eslint` clean; zero em/en dashes; all 3 render locally with correct
  steps/checklist/timeline/FAQ, breadcrumb, and 4 JSON-LD blocks;
  `/international/vietnam/how-to-apply` correctly 404s; CTA link shows on the
  Nepal/Pakistan overview pages and not Vietnam; sitemap total 1202 -> 1206.
- **Post-deploy:** POST `/api/revalidate`, then submit the 3 URLs to GSC URL
  Inspection + Bing and resubmit the sitemap.

---

## 2026-09-03 · Per-intake deadline hub: `/deadlines/february-2027-intake`

- **Change:** New editorial landing page wrapping the live per-university
  deadline table for one intake. Config in `src/lib/intakes.ts` (`INTAKE_HUBS`,
  currently one entry), route `src/app/(site)/deadlines/[intake]/page.tsx`,
  new query `listIntakeDeadlines(intakeTypes)` in `public-deadlines.ts`
  (unpaginated, selects `notes` / `last_verified_at` / `source_url`). Renders
  a 107-row table grouped by university with per-row source + last-checked
  date, a when-to-apply timeline, a Feb-vs-July decision section, a dated
  "what changed" log, and a 7-item FAQ. First of the Phase-1 content spike in
  `GROWTH_PLAN.md`; skeleton is built to clone for July / future intakes.
- **Affected routes:** new — `/deadlines/february-2027-intake`. Existing
  `/deadlines` gains one internal CTA link. `/visas/student-500`, the guide
  `genuine-student-requirement-how-to-write-your-statement`, the blog post
  `adelaide-university-merger-what-it-means`, and every `/international/{country}`
  page gain a "February 2027 intake deadlines" related link (the country pages
  swap their generic `/deadlines` link for it).
- **SEO impact:** LOW-MED (one new indexable page, no existing URL changes;
  internal-link graph now feeds the hub from ~30 pages).
- **Redirects:** none.
- **Canonical / sitemap / metadata:** self-canonical `/deadlines/february-2027-intake`;
  sitemap adds it via `INTAKE_HUB_SLUGS` (priority 0.8); Article + Dataset +
  BreadcrumbList + FAQPage JSON-LD. `CONFIG_LAST_MODIFIED` already 2026-09-03.
- **Files:** `src/lib/intakes.ts` (new), `src/app/(site)/deadlines/[intake]/page.tsx`
  (new), `src/lib/queries/public-deadlines.ts`, `src/app/sitemap.ts`,
  `src/app/(site)/deadlines/page.tsx`, `src/lib/related-content.ts`,
  `src/app/(site)/international/[country]/page.tsx`.
- **Testing:** `tsc --noEmit` + `eslint` clean; zero em/en dashes; page renders
  locally with 107 table rows across 54 universities, all sections, 5 JSON-LD
  blocks, related links resolving; console clean; CTA link present on `/deadlines`.
- **Post-deploy:** POST `/api/revalidate` so ISR picks up the new route + sitemap
  + the edited pages, then submit `/deadlines/february-2027-intake` to GSC URL
  Inspection and Bing, and resubmit the sitemap.

---

## 2026-09-03 · Add 4 source-country pages: South Korea, Japan, Taiwan, Hong Kong

- **Change:** 4 new entries in `src/lib/origin-countries.ts` (`south-korea`,
  `japan`, `taiwan`, `hong-kong`). English pages targeting the English-searching
  slice of those East Asian markets. Localised/translated pages were considered
  and **rejected** (cuts against the English-research wedge; unrankable in-language
  for a new domain; no i18n infra; maintenance multiplier). Revisit only if GSC
  shows real non-English query demand in ~2–3 months.
- **Affected routes:** new — `/international/south-korea`, `/international/japan`,
  `/international/taiwan`, `/international/hong-kong`. Hub `/international` gains 4
  list items. Nothing existing changed. (Sri Lanka was already covered.)
- **SEO impact:** LOW-MED (new indexable pages, no change to existing URLs).
- **Redirects:** none.
- **Canonical / sitemap / metadata:** each page self-canonical via the shared
  `[country]` route; sitemap auto-derives from `ORIGIN_COUNTRY_SLUGS` (now 23);
  `CONFIG_LAST_MODIFIED` in `sitemap.ts` bumped to 2026-09-03. FAQ + Breadcrumb
  JSON-LD render per the existing template.
- **Files:** `src/lib/origin-countries.ts`, `src/app/sitemap.ts`.
- **Testing:** `tsc --noEmit` + `eslint` clean; zero em/en dashes; all 4 pages
  render locally with correct title/flag/sections and no console errors; all 4
  appear in `/sitemap.xml`; hub lists 23.
- **Post-deploy:** POST `/api/revalidate` (or full revalidate) so ISR picks up
  the new routes + hub + sitemap, then resubmit the sitemap in GSC / Bing / Yandex.

---

## 2026-08-30 · URL architecture decision: flat, Australia-only, no `/australia/` prefix

- **Change:** Formalised the URL structure. Public routes stay **flat and
  un-prefixed** (`/universities/...`, `/visas/...`, not `/australia/universities/...`).
  The site is treated as the Australia site in full. A future second country, if
  it ever launches, gets its own path prefix (`/uk/...`) and none of the current
  URLs move. Considered and **rejected**: migrating every URL to `/australia/...`
  now while traffic is near-zero — cost (301s on every URL, internal-link rewrite,
  minor equity bleed) outweighed the option value on a speculative expansion.
- **Affected routes:** none changed. Decision is documentation only.
- **SEO impact:** LOW (no code/URL change). Prevents a future HIGH-impact migration.
- **Redirects:** none.
- **Canonical / sitemap / metadata:** unchanged. `SITE_URL` stays
  `https://www.wheretoapply.xyz`; canonicals already self-referential per page.
- **Files:** `PROJECT_STATUS.md` (Section 1, Section 4), `src/lib/site-config.ts`
  (comment), new `SEO_ROUTES.md`, this file.
- **Testing:** reviewed `sitemap.ts`, `robots.ts`, `next.config.ts`, per-page
  `alternates.canonical` usage (present on all 39 public page files),
  `/search` `robots: { index: false }`. No regressions — all pre-existing.

## 2026-08-30 · Admin toggle for `countries.is_launched`

- **Change:** Added a "Launched" checkbox per country in Admin → Settings →
  Countries (`setCountryLaunched` in `src/lib/queries/vocab.ts`, UI in
  `SettingsView.tsx`). Previously the flag was DB-only with no UI — now the
  launch state of each country is visible and toggleable in the panel where
  countries are managed. Turning it **on** shows a confirm dialog spelling out
  that all published content for that country goes public + into the sitemap.
- **Affected routes:** none today (AU stays the only launched country). Changes
  how a future country launch is performed.
- **SEO impact:** LOW now. The toggle is a HIGH-impact control when used —
  ticking it publishes a whole country. Guarded by a confirm dialog + the launch
  checklist in `SEO_ROUTES.md`.
- **Redirects / canonical / sitemap / metadata:** none.
- **Testing:** `tsc --noEmit` clean. In-browser check needs a logged-in admin
  (panel is auth-gated) — pending.

## 2026-08-30 · /visas hub buildout

- **Change:** `/visas` was a thin index (H1 + 2 cards + a client-side browser,
  ~few hundred words). Rebuilt as a proper hub:
  - Answer-first intro + a freshness line (max `last_verified_at` across the
    12 subclasses, shown as a date).
  - **"The study-to-PR pathway"** — an ordered, linked 500 → 485 → 189
    sequence built from the live dataset (`short_description` per step), with a
    link to the full walkthrough guide.
  - **"The core visas at a glance"** — a comparison table of 500/485/189/190/491
    (stay, points-tested, base charge, leads-to-PR), all values straight from
    DB fields, wrapped in `overflow-x-auto`.
  - Kept the points-calculator + invitation-rounds cards and the grouped
    `VisasBrowser`.
  - **FAQ section + `FAQPage` schema** — 6 hub-level questions (what visa to
    study / student visa cost, pulled verbatim from subclass 500's
    `base_application_charge` / staying after graduation / PR routes /
    points-test / invitation rounds). Orientation-level answers; specifics
    defer to each subclass page.
  - `RelatedLinks` to 6 visa/finance guides + `/international`, plus `WhyTrust`
    and `LastVerified`.
  - `listPublishedVisas` extended to also select `base_application_charge`,
    `processing_time`, `last_verified_at`.
- **Affected routes:** `/visas` only. No URL/canonical/sitemap change.
- **SEO impact:** LOW-risk, upside. Same URL, much deeper content (89KB →
  153KB HTML), targeting "australian visa types / student visa australia /
  study to PR" clusters. No fabricated figures — every number traces to a DB
  field that already carries a source on its subclass page.
- **Testing:** `tsc` + `next build` clean. Rendered HTML: title/H1 correct,
  schema `[Organization, BreadcrumbList, ItemList(12), FAQPage(6)]`, comparison
  table populated with real dated figures, 15 internal `/visas/` links + 5
  `/guides/` links.

## 2026-08-30 · List/hub pages: titles, H1s, breadcrumbs, ItemList schema

- **Change:** Filled the schema + heading gaps on the six listing/hub pages
  that previously had only `Organization` schema and (some) generic titles.
  New `src/lib/itemlist-jsonld.ts` helper.

  | Page | Title | H1 | Schema added |
  |---|---|---|---|
  | `/blog` | "Blog" → "Study in Australia Blog: Visa, Fee & Admissions News" | "The blog" → "Study in Australia: news and analysis" | BreadcrumbList + ItemList (page 1, unfiltered only) |
  | `/guides` | unchanged | "Guides" → "Application guides for studying in Australia" | BreadcrumbList + ItemList |
  | `/scholarships` | unchanged | unchanged | BreadcrumbList + ItemList (unfiltered only) |
  | `/visas` | unchanged | "Australian visa subclasses" → "Australian student and skilled visa subclasses" | BreadcrumbList + ItemList of the 12 subclasses |
  | `/about` | "About" → "About Where To Apply" (absolute, no template) | "About" → "About Where To Apply" | BreadcrumbList |
  | `/quiz` | unchanged | unchanged | BreadcrumbList |

  All six now also render a visible `<Breadcrumbs>` trail (they had none).
- **Affected routes:** the six above. No URL, canonical, or sitemap change.
- **SEO impact:** LOW-risk, upside-only. Titles/H1s are content changes on
  already-indexed pages (Google re-reads on next crawl); ItemList/Breadcrumb
  give answer engines a machine-readable index of each hub.
- **Testing:** `tsc --noEmit` + `next build` clean. Rendered-HTML check
  confirms new titles/H1s and `BreadcrumbList` + `ItemList(n)` on each
  (blog 9, guides 17, scholarships 28, visas 12).

## 2026-08-30 · Program-page quality audit + sitemap query fix

### Audit findings (no indexation change needed)

Distribution of 1,020 published AU program pages:
- **868 indexed** (in sitemap), **152 noindex** — the 152 are all 50–99 word
  descriptions with no curriculum. Correctly held back.
- Of the 868 indexed: **596 have a parsed curriculum** (description + course
  structure + admissions + source), **272 are description-only** (100–159
  words, no curriculum).
- **All 868** have a `source_url`, a `last_verified_at`, and (863) admissions
  text; every page also renders a structured sidebar + FAQ section + `FAQPage`
  + `EducationalOccupationalProgram` schema + breadcrumb.
- Spot-checked 6 of the 272 description-only pages: prose is specific and
  differentiated (unit counts, named accreditation bodies, named campuses and
  internship partners, ATAR/IELTS, exit points) — not AI boilerplate.

**Verdict:** the `isProgramIndexable` bar (curriculum OR ≥100-word description)
is working. Keep all 868 indexed. The 272 description-only pages are modest but
genuinely useful data pages, not doorway/thin content. Revisit only if GSC
later flags a subset as low-value. The 152 noindexed remain a deferred
enrichment wave (Bond/Canberra/Murdoch/Adelaide short cards).

### Sitemap query fix

- **Change:** Migration `0023_add_program_content_indexable.sql` adds a stored
  generated column `programs.content_indexable` mirroring `isProgramIndexable`.
  `listPublishedProgramsForSitemap` now filters on it in SQL and stops
  selecting the full `description`/`curriculum` text.
- **Why:** that query's response was ~2.1MB, over Next's 2MB Data Cache limit,
  so every sitemap regen re-hit Supabase (`Failed to set Next.js data cache …
  items over 2MB` on build).
- **SEO impact:** NONE — identical URL set. Verified: sitemap still lists 868
  program URLs (all slugs, 0 UUIDs), 1,145 total. Build no longer logs the 2MB
  warning. Column cross-checked against the JS logic over all 1,020 rows:
  868 true / 152 false, exact match.

## 2026-08-30 · Program URLs: UUID → human-readable slug

- **Change:** Program pages moved from
  `/universities/{uni}/programs/{uuid}` to
  `/universities/{uni}/programs/{program-slug}`. Migration
  `0022_add_program_slug.sql` adds `programs.slug` (unique per
  `university_id`), backfilled from the program name with `-2`/`-3` dedupe.
  Route dir renamed `[programId]` → `[programSlug]`.
- **Affected routes:** all ~868 indexed program URLs + ~150 noindexed ones.
- **SEO impact:** HIGH — this changes indexed URLs.
  - **Protection:** the `[programSlug]` route detects a UUID param, looks the
    program up by id, and issues a **308 permanent redirect** to the slug URL.
    The UUID is the immutable PK, so every old link keeps resolving forever.
    Verified: legacy UUID → 308 → slug URL; slug URL → 200; bad slug → 404;
    UUID under the wrong university → 404.
  - **Canonical:** now the slug URL (self-referential). Verified.
  - **Sitemap:** now emits slug URLs; `grep` confirms 0 UUID program URLs
    remain in `sitemap.xml`.
  - **Internal links:** university profile, `/study/[subject]` table, and the
    subject comparison table all emit slug URLs. Verified.
- **Redirects:** UUID→slug handled in-route (no redirect table). Slug can also
  change if an admin renames a program — the UUID redirect still resolves to
  the current slug; a previously-indexed *slug* URL would 404, acceptable
  given these pages are freshly indexed.
- **Data model:** `programs.json` (version-controlled source of truth)
  regenerated with `slug`; `seed_programs.mjs` / `export_programs.mjs` updated.
  `createProgram` auto-generates a unique slug; `updateProgram` keeps it in
  step with the name.
- **Testing:** `tsc --noEmit` clean, `next build` compiles. In-browser curl
  checks above all pass.
- **Known follow-up (not a regression):** `sitemap.ts`'s program query is
  >2MB (it pulls `description`/`curriculum` only to compute indexability), so
  Next's Data Cache skips it. Sitemap still regenerates hourly via route
  `revalidate`; just re-queries Supabase each time. Optimize by pushing the
  indexability check into SQL later.

## 2026-08-30 · Non-AU content moved to `draft` (safety layer)

- **Change:** Ran `scripts/set_unlaunched_countries_draft.mjs --commit`. All
  published universities and scholarships belonging to non-launched countries
  moved from `status = 'published'` to `status = 'draft'`:
  CA 64, NZ 18, UK 80, US 88 universities (250 total) + 1 US scholarship (MIT).
  Now blocked by BOTH the `is_launched` query filter AND Supabase RLS
  (anon reads published rows only) — a forgotten `is_launched` join can no
  longer leak them.
- **Affected routes:** none visibly. These URLs already 404'd / were excluded
  from sitemap & search via `is_launched`. No change to what the public sees.
- **AU untouched:** 56 published + 2 archived (Adelaide merger) — verified.
- **SEO impact:** LOW (net-positive hardening, no public change).
- **Redirects / canonical / sitemap / metadata:** none. Sitemap URL count
  unchanged (these were never in it).
- **Rollback:** `scripts/data/unlaunched-countries-draft-2026-08-30T03-29-49-501Z.json`
  holds every row's prior status. At a country launch, that country's rows go
  `draft → published` as step of the `SEO_ROUTES.md` checklist.
- **Testing:** post-run DB query confirms 0 published non-AU universities,
  all 250 now `draft`, AU counts unchanged.

### Open verification items (owner: Roman, not code)

- [ ] Confirm apex → `www` 301 redirect is configured at the domain/host level
      (Vercel domains). `next.config.ts` has no redirect for this; it must be
      handled by the platform. All internal links/canonicals already use `www`.
- [ ] Confirm `http` → `https` enforced (Vercel default, verify once on live).
- [ ] Google Search Console + Bing sitemap resubmit (still outstanding from the
      prior push — see PROJECT_STATUS.md Section 27).
