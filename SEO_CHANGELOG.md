# SEO Changelog

Log every SEO-sensitive change here: anything that can alter a URL, a canonical,
metadata, the sitemap, robots rules, indexation, redirects, or server-rendered
content. SEO regressions often surface weeks after deploy — this is the record
that lets us trace cause.

Format per entry: **Date · Change · Affected routes · SEO impact (LOW/MED/HIGH) ·
Redirects · Canonical/sitemap/metadata changes · Testing done.**

---

## 2026-09-03 · Site-wide audit: title/description budget, sitemap split, OG cards, security headers

Full source-level + live-crawl audit of the deployed site (341 indexable URLs
fetched and parsed). Five real problems found, all fixed in this change.

### 1. Title truncation, site-wide (the big one)

- **Problem:** 324 of 341 indexable pages had a `<title>` over 65 characters;
  301 were over 70; the longest was 134. Google renders roughly 60. The visa
  pages were the worst case: `Skilled Employer Sponsored Regional
  (Provisional) visa (Subclass 494): Eligibility, Requirements & Cost 2026 |
  Where To Apply` pushed "Subclass 494" — the phrase people actually search —
  past character 55, so it never appeared in the snippet. Descriptions were
  the same story: 251 of 341 over 160 characters.
- **Fix:** new `src/lib/page-metadata.ts`. `composeTitle(core, ...fragments)`
  keeps the query-carrying part and appends qualifiers only while they fit,
  accepting arrays of alternatives so one template serves both "Wollongong"
  and "Queensland University of Technology". `titleField` drops the 17-char
  ` | Where To Apply` suffix once the page's own title fills the budget.
  `clampDescription` trims to 155 on a sentence or word boundary.
  `pageMetadata()` is now the single builder every route returns.
- **Retargeted title templates:** visas lead with `Subclass NNN Visa`;
  scholarships lead with the scholarship name; `/best` collections gained an
  optional `metaTitle` so the H1 can stay long; per-university deadline pages
  dropped "Application ... (International Students)" to fit the name.
- **Editorial headlines:** migration `0025_add_meta_title.sql` adds a nullable
  `meta_title` to `guides` and `blog_posts` (falls back to `title`), populated
  for the 20 published rows whose headline overran, via
  `scripts/seed_meta_titles.mjs`. On-page H1s are unchanged.
- **Result:** 0 of 341 pages over 60 characters (max exactly 60); 0 over 160
  on description (max 155); 0 duplicate titles.

### 2. Every page that set `openGraph` lost its social card

- **Problem:** 216 of 341 live pages served **no `og:image` at all**. A route
  that declares its own `openGraph` object replaces the one inherited from the
  root layout, and with it the root `opengraph-image.tsx` — so every page that
  set `openGraph: { title, description, url, type }` without an `images` key
  silently shipped no card. Affected `/universities`, both calculators, both
  intake hubs, all 23 country pages, all city pages, all 38 per-university
  deadline pages.
- **Fix:** `pageMetadata()` always sets `images`, defaulting to the site card;
  routes with their own `/og` route pass it explicitly. Now 0 missing.

### 3. Sitemap crawl-budget dilution

- **Problem:** 868 of 1,209 sitemap URLs (72%) were templated program cards,
  on a domain where Google had discovered about 61 URLs in total. The ~30 pages
  that can actually rank were competing for discovery against seven times their
  number in long-tail cards.
- **Fix:** programs moved to their own `/sitemap-programs.xml` route handler.
  `/sitemap.xml` is now 341 URLs; both are declared in `robots.txt`. Also gives
  per-section index coverage in Search Console, which is what answers the open
  GROWTH_PLAN question about the program-page indexability floor.
- **Action required:** submit `sitemap-programs.xml` in GSC + Bing.

### 4. Missing schema on the hub pages

- `/study`, `/best`, `/compare`, `/cost-of-living` and `/international` emitted
  no BreadcrumbList and no ItemList. All five now emit both, and the four
  without a visible breadcrumb trail gained one.

### 5. Homepage H1 carried no entity

- `<h1>Where should you apply?</h1>` was the strongest on-page signal and
  matched no query. Now `Study in Australia` with the original line as a second
  line inside the same H1. Homepage title retargeted to
  `Study in Australia 2026: Deadlines, Costs & Universities`.

### Also in this change

- **Local-currency figures on the source-country pages** (`src/lib/fx.ts`):
  every competitor ranking for "cost to study in Australia from Nepal" leads
  with the number in NPR lakh, because that is how the question is asked. The
  23 country pages now show the first-year band in the reader's own currency
  and counting unit (lakh/crore where that is the local convention), always
  with the rate and the date it was taken, and always labelled indicative.
- **Orphan fixed:** `/blog/485-graduate-visa-age-limit-drops-to-35` had zero
  inbound internal links (link-graph crawl of all 341 URLs; max click depth 3,
  one orphan). Now linked from the 485 visa page and the 485 guide.
- **Privacy policy** rewritten for the Google AdSense advertising disclosures
  (third-party vendor cookies, Ads Settings + aboutads.info opt-out links,
  Google partner-sites link) and to describe the consent mechanism accurately.

### Security (see the security section of this change)

- **CSP, HSTS+subdomains, X-Content-Type-Options, X-Frame-Options,
  Referrer-Policy, Permissions-Policy, COOP** added in `next.config.ts`; there
  were no security headers at all before. `poweredByHeader: false`.
  `/admin`, `/login`, `/forgot-password`, `/reset-password` additionally get
  `no-store`, `X-Robots-Tag: noindex`, `Cross-Origin-Resource-Policy` and an
  explicit `Access-Control-Allow-Origin` override (the platform default was
  `*` on HTML responses).
- **Stored-XSS vector closed:** ~50 JSON-LD blocks were `JSON.stringify`-ed
  straight into `dangerouslySetInnerHTML`, which escapes neither `<` nor `&`,
  so a database string containing a closing script tag could break out. All
  now go through `src/lib/json-ld.tsx`.
- **Open redirect closed:** `/login?next=` was passed unvalidated to
  `router.push`, so `?next=https://evil.example` redirected off-site straight
  after a password entry. Now same-origin paths only.
- **Timing-safe** comparison on the `/api/revalidate` shared secret.
- `public/.well-known/security.txt` added.

- **Affected routes:** every route (headers, metadata), `/sitemap.xml`
  (1,209 -> 341 URLs), new `/sitemap-programs.xml`, new
  `/.well-known/security.txt`.
- **SEO impact:** HIGH. No URL changes, no redirects, no canonical changes —
  every canonical is byte-identical. Titles, descriptions, OG images, the
  sitemap split and the hub schema all change.
- **Testing:** `tsc` and `eslint` clean (3 pre-existing warnings in `scripts/`).
  Production build, then all 341 sitemap URLs crawled off the local production
  server: 0 non-200, 0 missing/duplicate titles, 0 titles over 60, 0
  descriptions over 160, 0 missing canonical, 0 missing `og:image`, 0 noindex
  pages in the sitemap, 0 pages without exactly one `<h1>`, 0 pages with fewer
  than 2 JSON-LD blocks. Headers verified on the running server; homepage,
  points calculator, cost calculator and login loaded in a browser with zero
  console errors, so nothing in the CSP breaks the app.
- **Post-deploy:** submit `/sitemap-programs.xml` to GSC + Bing; re-submit
  `/sitemap.xml`; spot-check a visa and a scholarship page in the URL
  Inspection tool for the new title.

---

## 2026-09-03 · "Documents checklist for an Australian student visa" guide (GROWTH_PLAN "C")

- **Change:** New guide `documents-checklist-for-an-australian-student-visa`
  (category `country-guide`, AU). The last non-overlapping guide topic: a
  category-by-category common-core document list for the subclass 500, framed
  around the fact that there is no universal list (the Home Affairs Document
  Checklist Tool builds it from passport country + provider + evidence level).
  1,347 words, GFM sub-sections for identity / enrolment / Genuine Student /
  financial / English / health / character / under-18 / family, plus a
  plain-text FAQ (6 question headings). Ties together the proving-funds, GS,
  OSHC, and qualifications-recognition guides.
- **DB row written + revalidated live**; seed backup added to
  `seed_visa_content.mjs`.
- **Internal links:** added to `related-content.ts` (`GUIDE_LABEL` +
  `GUIDE_RELATED` entry, plus slotted into the student-500, proving-funds,
  GS-examples, and without-an-agent related blocks) and into the
  `/international/{country}/how-to-apply` page's related array.
- **Affected routes:** new — `/guides/documents-checklist-for-an-australian-student-visa`.
  student-500 + 3 guides + 3 how-to-apply pages change one related link.
- **SEO impact:** LOW-MED (one new indexable page targeting "documents
  required for australia student visa" / "student visa checklist australia").
- **Files:** `scripts/seed_visa_content.mjs` (new entry),
  `src/lib/related-content.ts`, `src/app/(site)/international/[country]/how-to-apply/page.tsx`.
- **Testing:** `tsc` + `eslint` clean; zero em dashes (`check_em_dashes.mjs`);
  no FAQ markdown-link leak; every referenced slug validated vs DB; live page
  renders all sections + FAQPage schema + 200.
- **Fact-check:** verified against the Home Affairs subclass 500 "Step by step"
  and Genuine Student pages on 2026-09-03 — the Document Checklist Tool and its
  twice-yearly (31 Mar / 30 Sep) update cadence, the "decision-ready"
  expectation, the 150-word GS response cap, the AUD 2,500 charge (non-refunded
  on refusal), the AUD 29,710 living-cost figure, CoE-valid-at-decision.
- **Post-deploy:** POST `/api/revalidate` (done); submit URL to GSC + Bing.

---

## 2026-09-03 · Strengthen subject pages + subject-aware internal links (GROWTH_PLAN "B")

- **Why:** GSC shows `/study/law` drawing impressions for "law degree australia"
  (10/28d) and `/study/information-technology` for "study information technology
  in australia" (5/28d), both at ~position 30 with 0 clicks. The pages were
  curated but shallow, and every `/study/[slug]` page rendered the *same*
  6-link "Related" list and the *same* generic entry-requirements paragraph.
- **Change:**
  - `SubjectContent` (`src/lib/subjects.ts`) gained `requirements?: string[]`,
    `costNote?: string`, `fromCountry?: string`, `related?: RelatedLink[]`.
  - **Law** and **information-technology**: rewrote/expanded the intro, added a
    subject-specific entry-requirements block (law English bar 7.0, no LSAT;
    IT credit average + no GRE/GMAT), a cost note, a source-country line
    (linking `/international/*`), 2 more FAQ items each, one more `strongAt`
    university each, and a subject-aware `related` list.
  - Added subject-aware `related` lists to computer-science, data-science,
    business, nursing, engineering (route to points test / skills assessment /
    485 / the India or Nepal page / the regional collection).
  - `/study/[slug]` page: renders `requirements` (else the generic paragraph),
    `costNote`, `fromCountry`, and `related` (else the old static fallback).
  - **Cannibalisation, regional + cost clusters:** `Collection` gained
    `relatedGuide?`. `/best/regional-...` now shows a callout to
    `/guides/choosing-a-regional-area-to-study-in-australia`, and
    `/best/affordable-...` to `/guides/real-cost-of-studying-in-australia`, so
    the "see the universities" and "understand it" pages point at each other.
- **Affected routes:** no URLs change. `/study/law`,
  `/study/information-technology`, and 5 other curated subject pages render
  more content + different internal links. `/best/regional-...` and
  `/best/affordable-...` gain one internal link each.
- **SEO impact:** MED (deeper content matching intent on the two subject
  pages GSC already ranks; subject-aware internal links; closes the regional
  and cost cannibalisation loops).
- **Files:** `src/lib/subjects.ts`, `src/lib/collections.ts`,
  `src/app/(site)/study/[slug]/page.tsx`, `src/app/(site)/best/[slug]/page.tsx`.
- **Testing:** `next build` passes (377 static pages); `tsc` + `eslint` clean;
  zero em dashes; verified `/study/law` + `/study/information-technology` render
  the new sections + subject-aware related, `/study/psychology` still falls
  back correctly, both `/best` callouts resolve; console clean.
- **Post-deploy:** POST `/api/revalidate` (guides tag is unaffected; subject
  and collection copy is config-in-repo so a redeploy is enough).

---

## 2026-09-03 · Internal-linking pass + cannibalisation routing

- **Change:** Rewrote `src/lib/related-content.ts`. Before: 17 of 34 published
  guides had no `GUIDE_RELATED` entry, so half the guide library rendered no
  "Keep reading" block and was an internal-link dead end. Now every guide,
  every visa subclass, and every blog post has a 3-6 link related block with
  descriptive anchors. Added `GUIDE_LABEL` entries for all 34 guides, new
  constants (`JULY_INTAKE`, `DEADLINES`, `COST_CALC`, `REGIONAL_UNIS`,
  `AFFORDABLE_UNIS`, per-country `applyFrom`), and fixed 3 stale blog slugs
  in `BLOG_RELATED`.
- **Cannibalisation routing** (documented in the file header + GROWTH_PLAN):
  - Intake timing: `/deadlines/{feb,july}-2027-intake` are canonical. The
    `february-vs-july-intake-in-australia` guide now links both hubs + the
    calendar first (it is the decision page, the hubs hold the data).
  - Regional study: `choosing-a-regional-area-to-study-in-australia` is
    canonical for the concept; it and the 491/494 visa pages now link the
    `/best/regional-...` collection as the "see the universities" companion.
  - How to apply: `applying-to-australian-universities-without-an-agent` is
    canonical for the generic process and now links the country hub + the
    Nepal/India `how-to-apply` deep pages.
- **Homepage `POPULAR` row:** dropped the two noindexed `/compare/{a}-vs-{b}`
  links and two lower-priority `/best` collections; added the two intake
  hubs, the regional collection, and the Nepal/India source-country pages.
- **Affected routes:** no URLs change. Every guide/visa/blog detail page and
  the homepage change which internal links they render.
- **SEO impact:** MED (concentrates internal PageRank on the ~20 pages that
  can rank; removes 17 dead-end pages; reduces signal-splitting on the intake
  and regional clusters).
- **Files:** `src/lib/related-content.ts`, `src/app/(site)/page.tsx`.
- **Testing:** `next build` passes; `tsc` + `eslint` clean; zero em dashes;
  every referenced guide/visa/blog slug validated against the DB; verified a
  previously-dead-end guide (`february-vs-july-intake-in-australia`) now
  renders a 6-link block routing to both intake hubs.
- **Post-deploy:** POST `/api/revalidate` for the guide/blog/homepage tags.

---

## 2026-09-03 · July 2027 intake deadline hub

- **Change:** Second entry (`JULY_2027`) in `src/lib/intakes.ts`, cloned from
  the February hub: Semester 2 deadline table (~105 rows), July-timed
  when-to-apply timeline, July-vs-February decision, "what changed" log, FAQ.
  The intake-page component gained an alt-intake cross-link (renders when
  `hub.altIntake.slug` is set); `/deadlines` now links both hubs.
- **Affected routes:** new — `/deadlines/july-2027-intake`. `/deadlines` and
  `/deadlines/february-2027-intake` each gain one internal link to it.
- **SEO impact:** LOW-MED (one new indexable page; no existing URL changes).
- **Redirects:** none.
- **Canonical / sitemap / metadata:** self-canonical; sitemap adds it via
  `INTAKE_HUB_SLUGS` (now 2); Article + Dataset + BreadcrumbList + FAQPage.
- **Files:** `src/lib/intakes.ts`, `src/app/(site)/deadlines/[intake]/page.tsx`,
  `src/app/(site)/deadlines/page.tsx`.
- **Testing:** `next build` passes (prerenders as SSG); `tsc` + `eslint` clean;
  zero em dashes; renders locally with 105 rows / 53 universities, all
  sections, 5 JSON-LD blocks, working cross-links; sitemap 1206 -> 1207.
- **Post-deploy:** POST `/api/revalidate`, submit the URL to GSC + Bing.

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
