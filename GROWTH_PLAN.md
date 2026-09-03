# Growth plan — wheretoapply.xyz

Created 2026-09-03. A phased plan synthesised from three external assessments
(ChatGPT, Lumo, Claude) plus a source-level review of the repo and the
2026-09-02 GSC/GA4 baseline. Tracked here so progress is visible alongside
`PROJECT_STATUS.md`, `BACKLINKS.md`, and `SEO_CHANGELOG.md`.

## The one-paragraph truth

The build quality and trust infrastructure are already strong — that is not
what is holding the site back. The site is a ~6-week-old `.xyz` domain with
almost no inbound links: 33 pages indexed, ~982 impressions/day, average
position ~38, ~0 clicks. Nothing about product scope, features, or content
polish changes that. What determines whether this earns money is 3–6 months of
unglamorous work: indexing hygiene (mostly done), ~20 genuinely best-in-class
long-tail pages on the Nepal/India → Australia → PR arc, backlinks via
directories and journalist requests, and an affiliate layer (OSHC, remittance,
test prep) so revenue does not depend on sub-$4 display-ad RPMs.

## Cross-assessment consensus (the reliable signal)

1. Build/trust quality is good — not the bottleneck.
2. Distribution / domain authority is the entire problem.
3. AdSense is the wrong *primary* monetisation for this audience geo
   (Nepal/India/Pakistan/Vietnam → low display RPM). Affiliate is the engine;
   ads are the floor.
4. Play long-tail on the source-country + visa wedge. No new destinations.
5. Fix crawl/indexing hygiene before scaling content.
6. Keep ads off YMYL decision pages and data tables — blog/news only.

## What the AI assessments got wrong or missed

- **Scale of the URL set.** 1,200 sitemap URLs, ~970 under `/universities/`.
  Already curated: thin program cards are `noindex` + out of the sitemap via
  the `content_indexable` generated column (migration 0023), thin subject and
  deadline pages likewise. Not the "thousands of thin pages" risk the
  assessments assumed — but the 100-word indexability floor for program pages
  is worth revisiting once GSC shows whether those pages get impressions.
- **`/posts/` 404 (Lumo).** Non-issue. No such route exists and nothing links
  to it; the blog lives at `/blog/`. Lumo guessed a URL.
- **"No structured data / no Person schema" (Lumo).** Wrong. Article /
  BlogPosting / Person / BreadcrumbList / FAQPage / Dataset JSON-LD are all
  already emitted. Real gap is narrower: no *public* author bio page, and the
  author `bio` field is not rendered on articles.
- **Timeline realism.** All three imply "build it and traffic comes this
  quarter." A new `.xyz` in a YMYL niche sits in an effective sandbox for
  3–6+ months regardless of quality. The Feb-2027 deadline hub will not rank
  in time for the Feb-2027 season — build it as a 2028-maturing asset.
- **Community distribution (Lumo).** Reddit/Quora was already tried and
  failed — comments removed, answers collapsed, account not warmed
  (see memory `reddit-outreach-plan` — ABANDONED). Do not repeat without a
  warmed account. Authority path is `BACKLINKS.md` (directories + journalist
  requests).
- **AdSense "apply at 25–30 pages."** Page count is not the gate; the thin-page
  ratio and traffic are. Apply after the wedge-content spike, treat as
  validation not income.

---

## Phase 0 — crawl / index hygiene  ·  STATUS: DONE (GSC reviewed 2026-09-03)

GSC account review completed this session (via Claude-in-Chrome):

- [x] **GSC sitemap "Couldn't fetch"** — file confirmed 100% healthy: URL
      Inspection → Live Test returns "URL is available to Google" (Sep 3).
      The Sitemaps-report error is pipeline lag / stale state on a new domain
      property, not a real fetch failure. Re-submitted to force a fresh
      processing pass. Monitor; escalate only if still erroring after ~Sep 10.
- [x] **12 visa pages** — ALL 12 confirmed "URL is on Google — Page is
      indexed" via natural crawl. No Request Indexing needed. Aug-30 TODO
      closed.
- [x] **Overall indexing state** — 33 indexed / 28 not indexed. The 28
      break down as: 9 `noindex` (intentional thin cards / `/search`),
      1 "page with redirect" = the apex `wheretoapply.xyz/` → `www` 301
      (correct, and this also confirms the open SEO_CHANGELOG apex→www item),
      18 "crawled – currently not indexed" (normal new-domain lag, resolves
      with authority). Nothing broken. Google has discovered ~61 of ~1,200
      URLs → the bottleneck is crawl rate / domain authority, full stop.
- [x] **Public author pages** — DECIDED: keep operator-name-only byline, no
      `/authors/[slug]` route, no `sameAs`, no bio block. Revisit only if YMYL
      ranking proves to be the specific blocker.
- [ ] **Revisit program-page indexability floor** — data-gated; revisit ~Oct
      once GSC shows whether program pages draw impressions. (owner: code, later)

Already done (no action): robots.ts, sitemap.ts with `safe()` + `maxDuration`,
canonical tags, per-page OG, breadcrumb/FAQ/Dataset schema, `content_indexable`
pruning, GA4 + first-party proxy + key events, GSC/Bing/Yandex properties,
IndexNow, apex→www (verify on host), contact email fixed.

## Phase 1 — narrow content spike on the wedge  ·  weeks 2–10

Goal: ~15–20 pages that are unambiguously the best page on the internet for a
specific Nepal/India → Australia → work/PR query. Depth over breadth.

- [x] **Source-country "how to apply" deep pages — BUILT 2026-09-03.**
      `/international/{country}/how-to-apply` for Nepal, India, Pakistan
      (`src/lib/apply-guides.ts` config + `[country]/how-to-apply/page.tsx`
      route). Each: 8-9 ordered steps, a grouped documents checklist, a
      working-back-from-February timeline, country-specific refusal pitfalls,
      5-item FAQ. Country-specific detail (NOC, LRS/TCS, HEC/IBCC attestation,
      agent rules, Evidence Level 3). Schema: Article + BreadcrumbList +
      FAQPage. Country overview pages conditionally link in; added to sitemap.
      Cost-from-{country} deep pages (item 7 below) deferred: the overview
      pages already carry a cost section and `/cost-calculator` exists.
- [x] **Genuine Student statement examples guide — BUILT + DEPLOYED 2026-09-03.**
      `/guides/genuine-student-statement-examples` (DB row + seed backup in
      `seed_visa_content.mjs`, PR #6). Four illustrative worked GS responses
      (career changer / nursing progression / study gap / step-down move) with
      annotations + plain-text FAQ. Facts verified vs the Home Affairs GS page.
      NOTE: the existing `genuine-student-requirement...` guide has a factual
      error (says 150 words is a minimum; it's a maximum) — flagged, not fixed.
- [ ] Pick the remaining ~12 target queries. Seed from GSC top-impression queries
      ("study in australia from pakistan", "study in regional australia",
      "study information technology in australia") + the source-country wedge
      (`PROJECT_STATUS.md` §29). Candidates: GTE / Genuine Student statement,
      visa refusal grounds + how to lower risk, dependent/partner work rights,
      skills assessment by occupation, proving financial capacity, 485 → PR
      timeline from Nepal/India, cost of studying from <country>.
- [x] **February intake deadline hub — BUILT 2026-09-03.**
      `/deadlines/february-2027-intake` (`src/lib/intakes.ts` config +
      `src/app/(site)/deadlines/[intake]/page.tsx` route +
      `listIntakeDeadlines` query). Live 107-row per-university table (grouped,
      sourced, per-row last-checked date), when-to-apply timeline, Feb-vs-July
      decision, dated "what changed" log, 7-question FAQ. Schema: Article +
      Dataset + BreadcrumbList + FAQPage. Internal links in from `/deadlines`,
      `/visas/student-500`, the GTE guide, the Adelaide-merger blog post, and
      all 23 `/international/{country}` pages. Added to sitemap. DEPLOYED
      (PR #3), submitted to GSC + Bing.
- [x] **July intake deadline hub — BUILT + DEPLOYED 2026-09-03.**
      `/deadlines/july-2027-intake`, cloned from the February `intakes.ts`
      entry (Semester 2, ~105 rows). The two hubs cross-link in the decision
      section; `/deadlines` links both.
- [x] **Internal-linking + cannibalisation pass — 2026-09-03.** Rewrote
      `related-content.ts`: was 17/34 guides with no "Keep reading" block
      (dead ends), now all 34 guides + all visas + all blog posts have a
      3-6 link related block. Canonical page fixed per query cluster (intake
      timing → the two `/deadlines/*-intake` hubs; regional → the regional
      guide + `/best/regional-...` collection; how-to-apply → the without-agent
      guide + country deep pages). Homepage `POPULAR` row re-pointed at the
      intake hubs + regional collection + Nepal/India pages (dropped 2
      noindexed `/compare` links).
- [x] **B: strengthen the pages GSC shows getting impressions — 2026-09-03.**
      `SubjectContent` gained `requirements` / `costNote` / `fromCountry` /
      `related`. Law + IT rewritten deeper (subject-specific entry bar, cost
      note, source-country line, +2 FAQ each, subject-aware related). 5 more
      curated subjects got subject-aware related lists. `/best/regional-...`
      and `/best/affordable-...` now link their explainer guide (regional +
      cost cannibalisation loops closed). SEO_CHANGELOG 2026-09-03.
- [ ] **C: fill the one remaining non-overlapping guide gap** — "documents
      checklist for the student visa". Gradual.
- [ ] Keep Track A news cadence: invitation rounds (`add-round` skill), MD
      changes, fee changes — publish within 24–48h.

### GSC snapshot 2026-09-03 (why the pivot)

28-day: 1.52K impressions (accelerating), 9 clicks, avg position **38.2**,
~350 pages drawing impressions. Top impressions are university-profile pages
on navigational queries the site can never win (Sydney 103 impr / 0 clicks,
Monash 54/0, RMIT 39/0). Winnable queries currently at 0 clicks on page 3-4:
"law degree australia", "study in regional australia", "study information
technology in australia", "study in australia from pakistan / malaysian
students", "top private colleges in australia". Site appears in AI Overviews
for 31 pages (deadline pages, cheapest-uni collections). Conclusion: position
is 90% a domain-authority problem (backlinks), and the 1,000+ URLs are not a
lever — clicks come from ~20-30 pages ranking for specific decision/wedge
queries. Guide surface is saturated (34 guides, remaining topics overlap
existing ones). Shift effort to backlinks + strengthening the ~15 pages that
already show impressions + interlinking, away from new guides.

## Phase 2 — authority  ·  weeks 4–16, parallel

- [ ] Work `BACKLINKS.md`: directories + journalist source requests
      (Qwoted / SourceBottle / Featured). Continue the 2026-09-01 session's
      progress.
- [ ] No comment links, no bought lists, no un-warmed community posting.
- [ ] Linkable assets already exist (cost calculator, points calculator,
      deadline hub). Make sure each has a clean shareable title + OG card and
      is pitched in at least one directory / roundup.

## Phase 3 — monetise  ·  when a traffic baseline forms (~3–6 months)

- [ ] Apply for AdSense once, after the Phase 1 spike. Validation, not income.
- [ ] Affiliate layer, in order:
      1. **OSHC comparison** — legally mandatory purchase, per-policy
         commission. Expand the existing OSHC explainer into a comparison page
         with referral links.
      2. **Remittance** — Wise / Remitly on the "proving funds / moving money"
         page. Comparison table with the verified-dates treatment.
      3. **Test prep** — IELTS/PTE, credential evaluation. Only partners you
         would recommend regardless — a bad referral burns the independence
         positioning.
- [ ] Ad placement rule: blog/news pages only. Decision pages, calculators,
      and verified-data tables stay ad-free.

## Explicit don'ts

- No other study destinations until Australia has real traction.
- No user accounts, saved shortlists, or matching engine (already ruled out).
- No newsletter infrastructure yet — a plain email-capture form on the
  deadline hub is enough.
- No repeating the Reddit/Quora outreach without a warmed account.

## Review cadence

Re-check this plan monthly against the GSC/GA4 numbers. Triggers to change
course: non-English query demand showing in GSC (revisit localisation);
program pages drawing real impressions (revisit the indexability floor);
avg position dropping below ~20 (start Phase 3 earlier).
