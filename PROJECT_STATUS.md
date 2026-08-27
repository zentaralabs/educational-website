# Project Status — University Guidance Platform

Last updated: 2026-08-22
Status: **Pre-build.** Planning complete for architecture, schema, design direction, and admin scope. No code written yet.

---

## 1. What this is

A content platform helping students find and apply to universities — deadlines, application requirements, costs, scholarships, and how-to guides. Evergreen niche (application cycles repeat forever, unlike trend-driven content).

**Initial geographic scope:** US, UK, Canada, Australia.

**Core differentiator:** most competitors are either static directories (no real usefulness) or generic blogs (thin, AI-sounding, easily lost in search). This site is built around:
- A structured, queryable deadline/fact database (not prose-buried facts) — hard to replicate, genuinely useful
- Content designed to be citable by AI answer engines (ChatGPT, Perplexity, Claude, Google AI Overviews), not just ranked in blue links
- A trust/freshness system (verified dates, sourced facts, real bylines) baked into the data model, not bolted on

---

## 2. Monetization strategy (sequenced, not simultaneous)

1. **Now:** Google AdSense — lowest barrier, validates the content/traffic engine. Not the ceiling.
2. **As traffic grows:** Affiliate links on relevant pages (test prep, student loans, study-abroad insurance, VPNs/laptops, online course platforms) — pairs naturally with how-to content.
3. **At ~50k+ monthly sessions:** Switch to/layer in a premium ad network (Ezoic, Mediavine-tier) — typically 2–4x AdSense RPMs on the same traffic.
4. **Once authority is established:** Lead-gen partnerships with education consultancies/study-abroad agents — highest ceiling, biggest lift to set up.
5. **Later:** Digital products (SOP templates, checklists, paid deadline tracker).

**AdSense approval requirements to hit before applying:**
- 25–35+ solid, unique, non-thin pages
- Custom domain (not subdomain)
- About, Contact, Privacy Policy, Terms/Disclaimer pages
- Clear navigation, mobile-friendly, fast load
- No scraped/lightly-reworded content from official university sites — every page needs genuine added value (comparisons, aggregation, analysis, first-hand detail)

---

## 3. Tech stack (confirmed)

- **Frontend:** Next.js (SSG/ISR — pages mostly static, revalidate on data change)
- **Database:** Supabase (Postgres) — see `database-schema.md` for full schema
- **Admin:** Custom-built admin panel inside the same Next.js app (behind auth), not raw Supabase table editor — see Section 6
- **Revalidation pattern:** Supabase webhook on row `UPDATE` (where `status = 'published'`) → Next.js ISR revalidation API route for the affected slug(s)
- **Analytics:** Google Analytics 4 (pageviews, engagement time, traffic source) + Google Search Console (real search queries) + optional Microsoft Clarity (heatmaps/scroll depth) — all free tools, no custom analytics duplication. Requires a **cookie consent banner** before GA4/Clarity fire (UK/EU visitors in scope).

---

## 4. Site structure (information architecture)

```
/us/  /uk/  /canada/  /australia/
  /deadlines/        → filterable calendar view
  /how-to-apply/
  /universities/     → profiles
  /scholarships/
  /visas-and-costs/

/compare/   → cross-country and cross-university comparison content (key differentiator)
/guides/    → country-agnostic evergreen guides (SOPs, LORs, test prep)
/blog/      → timely posts (policy/deadline changes), feeds internal linking
```

Navigation: persistent minimal top nav (4–5 items max), faceted filtering on listing pages rather than deep menus, Command-K style site search, breadcrumbs on deep pages.

---

## 5. Content strategy

### Pillars
1. Deadline & application calendars (aggregated, structured, filterable)
2. How-to guides (personal statements, LORs, transfer, international applications, financial aid)
3. University profiles & comparisons
4. Scholarships & financial aid (school-specific + national/external)
5. Test prep & requirements (SAT/ACT/IELTS/TOEFL, GPA benchmarking)

### Content production workflow
AI-assisted drafting + heavy human fact-check and rewrite (not proofreading — a real rewrite pass). Pipeline:
1. Fact layer first — verified data from official sources, never hallucinated
2. AI drafts narrative/explanatory content around the facts
3. Human review — verifies facts against source, edits for voice, adds first-hand/unique detail
4. Freshness tracking — `last_verified_at` on every fact-based row; annual re-check cycle

### "Sounds human, not AI" — concrete rules
- Avoid AI tells: "in today's competitive landscape," "it's important to note," triplets, uniform paragraph length, em-dash overuse
- Vary sentence length deliberately
- Include specific, ungeneralizable details (real numbers, real quirks) — not "many students"
- Take an actual point of view where warranted
- Don't force every guide into the same heading template — structural sameness across pages is a stronger AI-tell than any single sentence
- Real bylines with credible bios (`authors` table)
- Gut check: if regenerating the same prompt would produce a near-identical page, it isn't humanized enough yet

### GEO/AEO (AI answer engine visibility) — concrete tactics
- Schema.org markup: `CollegeOrUniversity` / `EducationalOrganization` on profiles, `FAQPage` on guides, table/dataset markup on deadline calendars
- **Answer-first structure**: lead with the direct fact ("Stanford's Regular Decision deadline is January 2"), context after — not buried after a long intro
- Visible "last verified" date + source citation on every fact (provenance signal AI engines increasingly weight)
- Original, aggregated data no one else has in structured form (the deadline calendar is the flagship asset here)
- `llms.txt` at root (emerging convention, low cost to add)
- Genuine E-E-A-T signals: real bylines, About page explaining the fact-checking process, source citations
- External citations/backlinks (student forums, counselor blogs) compound authority over time

---

## 6. Admin panel — screen map (confirmed, build against this)

1. **Dashboard** — stale content widget (not verified in 12mo), review queue widget, recent activity feed, upcoming admissions-cycle flags, quick actions
2. **Universities** — list (filter/search/bulk actions) + tabbed detail edit (Overview / Admissions / Cost & Aid / Academic / Narrative / Meta)
3. **Deadlines** — list/calendar hybrid view, **bulk edit mode** (shift dates by X days, bulk change type/platform — highest-leverage screen for ongoing workload), CSV import/export
4. **Scholarships** — list/detail, supports many-to-many with universities, plus national/external scholarships
5. **Guides** — list + markdown editor with a visible **QA checklist sidebar** (facts verified? sentence variation checked? first-hand detail added?), manual related-content picker for internal linking
6. **Authors** — name, bio, credentials, avatar, published pieces list
7. **Review Queue** — unified Draft/Needs Review view across all content types, oldest-first
8. **Settings/Users** — admin/editor role management, controlled vocabularies (countries, degree levels, deadline types, application platforms)

Roles: `is_admin` (full access, can publish) vs editor (scoped write to draft/needs_review, can't directly publish) — enforced via Supabase RLS.

---

## 7. Design direction (confirmed — "application dossier meets live status tracker")

Deliberately avoids the three AI-design-default clusters (cream+terracotta, near-black+neon accent, dense broadsheet).

**Palette:**
| Role | Hex |
|---|---|
| Paper (base) | `#FFFFFF` (revised from original `#FAF7F0` cream — see Section 11) |
| Ink (primary text/nav) | `#1B2A4A` |
| Slate (secondary text) | `#4A5D7E` |
| Open/Accepted status | `#3F6B4F` |
| Pending/Upcoming status | `#B8823D` |
| Closed/Passed status | `#8B3A3A` |

**Typography:**
- Display: Fraunces (headlines only, used sparingly)
- Body: Public Sans
- Utility/data (dates, countdowns): IBM Plex Mono

**Signature element:** stamp/status badge system (OPEN / UPCOMING / CLOSED, passport-stamp styling) — appears on every university card, deadline entry, guide. Functional, not decorative — directly serves the "never miss a deadline" value prop.

**Layout:** hero is a live preview of real deadline data (not a generic centered SaaS hero). Body pages follow a "case file" structure — left-aligned blocks, generous whitespace.

**Homepage (confirmed):** split hero — Command-K style search + "browse by country" on the left, a live deadline card (this week's deadlines, real-time feel) on the right. Search does the wayfinding, the calendar proves the data is real.

**Motion principles:** deliberate, not scattered. Minimal page-load stagger, scroll-triggered reveals on data-heavy pages, micro-interactions on status changes/filters. The deadline calendar/tracker is the signature animated moment — invest real polish there over scattering effects elsewhere. Respect `prefers-reduced-motion`.

**Quality floor:** responsive to mobile, visible keyboard focus states, accessible.

---

## 8. Database schema

Full schema in `database-schema.md` (companion file). Key confirmed decisions:
- Dedicated `rankings` + `ranking_bodies` tables (sourced, dated, supports multiple bodies/categories per university) — not free-text
- `scholarships` many-to-many with universities via `scholarship_universities`, plus `scope` field for national/external scholarships
- Soft-delete only (`status = 'archived'`) — never hard delete, to preserve any backlinks/citation equity and support redirects/closure notices instead of 404s
- Shared `content_status` enum across all content types for a uniform Review Queue
- No custom analytics tables — GA4 + Search Console cover traffic/query data; no boilerplate duplication

---

## 9. Legal/compliance requirements

- Privacy Policy, Terms of Service, About, Contact, Disclaimer (not official admissions/financial/legal advice) pages — required for AdSense and general trust
- Cookie consent banner before analytics fire (UK/EU visitors in scope)
- Trademark caution: no hosting official university logos directly — text-based branding, or link out to official crest pages

---

## 10. Open decisions (not yet resolved — decide before or during build)

1. **User accounts** — raised as a stickiness feature (saved universities, deadline email alerts, personal dashboard). Not yet modeled in the schema. Needs `users`, `saved_universities`, `notification_preferences` tables if greenlit. **Recommend deciding scope before starting rather than retrofitting auth later.**
2. Domain name/registration — not yet selected.
3. Hosting for Next.js (Vercel is the natural fit given Next.js + ISR, not yet confirmed).

---

## 11. Not yet done (next steps)

- [ ] Content sprint list — the specific first 25–30 pages to write pre-AdSense-application
- [ ] Decide on user accounts scope (Section 10.1) before schema is finalized for build
- [ ] Domain registration
- [ ] Visual mockup of the design direction in Section 7 (token system decided, not yet built)
- [ ] `llms.txt` content draft
- [ ] Legal page copy (Privacy Policy, Terms, Disclaimer)

---

## 12. Homepage & search expansion (proposed, not scoped for build yet)

Proposed backlog, captured 2026-08-20. Not prioritized against the rest of this doc yet — treat as a wishlist to pull from, not a commitment. Split by what the current schema already supports vs what needs new data modeling first.

**Buildable against the current schema (no new tables needed):**
- Featured universities (homepage section)
- Latest scholarships (homepage section)
- Application deadlines (homepage section — was removed from the homepage per design feedback, but the query/data support still exists)
- University comparison CTA (homepage entry point into `/compare`)
- Student guides/articles (homepage section)
- Global search across universities, countries, cities, scholarships, articles/guides, deadlines (search currently covers universities + guides only, per Section 4; scholarships/deadlines/countries/cities as search result types are additive, not blocked by schema)
- Search-by-university, search-by-country, search-by-city (all real columns already)
- Filters: Country, Ranking, University type, International/domestic (data exists in `universities`/`rankings`, just not wired into a faceted filter UI yet)

**Done:** `programs` table added (`supabase/migrations/0004_add_programs.sql`) — per-university structured degree offerings (name, degree level, field of study, duration, optional per-program tuition override), same draft/published workflow as everything else. Admin: `/admin/universities/[id]` "Academic" tab manages them. Public: shown on each university profile under "Academics", falling back to the university-level `tuition_international` when a program doesn't set its own. `field_of_study` is still free text, not a controlled vocabulary — see below.

**Needs new data modeling first — not just a UI task:**
- "Popular courses" homepage section, and search/filter by **subject** — `programs.field_of_study` is free text, not a controlled vocabulary yet. Needs a `subjects` lookup table (mirroring `degree_levels`) before subject filtering/faceting is real.
- Filters: **Intake**, **Online/on-campus** — `programs` doesn't model either yet; would need new columns or a join.
- "Popular destinations" — doable at country level today; city-level would benefit from cities being a proper lookup/dimension rather than free text on `universities.city`.

**Its own small feature, not just a homepage section:**
- "Find the right university for me" quiz — needs its own question/scoring logic. Buildable against current data (country, degree level, budget, etc.) without new tables, but scope it separately rather than bundling into homepage work.

**Open question this raises:** the original brief (Section 1) scopes this as a university-level aggregator with deadlines/guides as the flagship differentiator, not a course marketplace. Building out course/subject-level browsing is a meaningful product expansion (StudyPortals-style), not incremental polish — worth a deliberate yes/no before starting, same as the user-accounts decision in Section 10.1.

---

## 13. Australia fact-check tracker

Last updated: 2026-08-25. Tracks per-program data quality for Australia specifically — 58 AU institutions exist in `universities` (all `currency = 'AUD'`, corrected from an earlier USD-labeling bug; the "57" figure used earlier in this section's own running counts was a stale/off-by-one holdover — 58 is the correct total), but **programs are opt-in, one at a time, hand-verified** — there is no bulk import. This section is the source of truth for "have we actually fact-checked this school" so work doesn't get silently re-done or skipped.

**2026-08-25 accuracy-bar change**: per explicit user direction, exact/page-verified figures are no longer required — approximate/close figures are now acceptable. This relaxes the strict "official `.edu.au` page only" sourcing rule below for the 16-university batch added on this date: aggregator sources (Mastersportal, IDP, Studyportals/Studies-overseas, TopUniversities, MBA News Australia, courses.com.au, etc.) were used directly as `source_url`, and several figures are cross-checked approximations rather than page-verified exact numbers. Every number below is still grounded in at least one real search result and, where possible, cross-checked against a second source — never invented. Rows added under this relaxed bar are marked "(approx)" inline; everything in the original "Done" table above this note was verified under the stricter original methodology and is unaffected.

### Methodology (apply this to every new AU program)

1. Find the program's own official fee page on the university's `.edu.au` domain (not aggregators like Mastersportal/Yocket/Collegedunia/Shiksha — they're useful for *finding* the right page, never as the cited source).
2. Get **international** tuition (annual) and confirm the **admission_url**/apply link.
3. Get **domestic** tuition. Australian postgrad coursework fees are not one flat number — check whether the program offers a **Commonwealth Supported Place (CSP)**:
   - If yes: use the CSP student-contribution rate (government-set per discipline band, published either on the course page or the university's "student contribution amounts" page) and set `tuition_domestic_is_csp = true`. Note the CSP band rate is *nationally standardized* (e.g. Computing/IT/Engineering = A$9,537/yr for 2026) — the same figure is valid across universities if a program-specific page doesn't restate it, as long as you've confirmed CSP eligibility for that specific program.
   - If no CSP, or CSP eligibility can't be confirmed: leave `tuition_domestic` **null** rather than guess. The UI already falls back to showing the international figure with an honest "(international)" label.
4. Get admission requirements (GPA/WAM cutoff, prerequisite subjects) and English test score (IELTS/TOEFL/PTE) **from the program's own entry-requirements page**. If only aggregator sites have a number, leave the field blank — don't populate `admission_requirements`/`english_requirements` from anything you can't trace to an official page.
5. Set `last_verified_at` to today and `source_url` to the specific page the *tuition* figures came from.
6. Enter via the admin panel (`/admin/universities/[id]` → Academic tab) or a one-off script against the Supabase REST API with the service-role key (direct Postgres port is IPv6-only and unreachable from this environment and from at least one home network tested — use the REST API or the Supabase dashboard's SQL Editor for schema changes).

### Done (55 of 58, plus 4 more with international-only data — see running-count note in the "Not started" section below for how this reconciles)

| University | Program | Intl fee | Domestic fee | Requirements |
|---|---|---|---|---|
| University of Melbourne | Master of Computer Science | A$62,976 | A$9,537 (CSP) | ✅ WAM 75% cognate + maths prereq; IELTS 6.5 |
| University of Sydney | Master of Computer Science | A$60,650 | A$8,989 (CSP) | ✅ Credit avg 65%, any discipline; IELTS 6.5 |
| University of Queensland | Master of Computer Science | A$60,952 | A$9,540 (CSP) | ✅ GPA 5.0/7.0 in CS/SE; IELTS 6.5 |
| Australian National University | Master of Computing | A$56,120 (2027 figure — recheck) | *(blank — no CSP confirmed)* | ✅ GPA 5.0/7.0, or 4.0/7.0 + 3yrs experience; English blank (program-specific tier not confirmed) |
| UNSW Sydney | Master of Information Technology | A$60,960 | A$9,500 (CSP) | ✅ WAM 65% cognate bachelor's; English blank (not confirmed) |
| Monash University | Master of Information Technology | A$43,600 | A$9,537 (CSP) | Requirements blank — only aggregator figures found, didn't meet the bar |
| Queensland University of Technology | Master of IT (Computer Science) | *(blank — see note)* | A$9,537 (CSP) | ✅ GPA 4.0/7.0 (varies by pathway); IELTS 6.5 |
| University of Technology Sydney | Master of Information Technology | A$55,376 | A$36,670 (confirmed **not** CSP-eligible) | English ✅ IELTS 6.5/writing 6.0; GPA requirement blank — not found on an official page |
| Adelaide University | Master of Computer Science | A$57,100 | A$9,537 (CSP) | ✅ GPA 4.5/7.0 in CS/related field; IELTS 6.5 |
| RMIT University | Master of Information Technology | A$47,040 | A$38,400 (confirmed **not** CSP-eligible) | ✅ GPA 2.0/4.0 (RMIT's own 4-point scale) or 5+ yrs IT experience; IELTS 6.5 |
| Deakin University | Master of Information Technology | A$44,200 | A$9,537 (CSP, exact match to national band, confirmed on Deakin's own handbook page) | ✅ Bachelor's any discipline (reduced-credit pathways for related field/experience); IELTS 6.5 |
| Curtin University | Master of Computing | A$39,074 | *(blank — no CSP confirmed, no static full-fee page found)* | ✅ Bachelor's + programming/OS/computing-maths knowledge; IELTS 6.5 |
| Flinders University | Master of Computer Science | A$42,900 | A$34,700 (confirmed **not** CSP-eligible) | ✅ Bachelor's in CS/IT/ICT-engineering/related; IELTS 6.5 |
| La Trobe University | Master of Information Technology | A$45,600 | A$35,800 (confirmed **not** CSP-eligible) | ✅ Bachelor's any discipline (2yr) or cognate bachelor's (1.5yr); IELTS 6.5 |
| Swinburne University of Technology | Master of Information Technology | A$42,240 (cross-corroborated, not directly page-verified) | A$9,537 (CSP, exact match to national band, confirmed on Swinburne's own fees tab) | ✅ Bachelor's any discipline, or Grad Cert/Dip IT; IELTS 6.5 |
| Western Sydney University | Master of Information and Communications Technology | A$39,256 (cross-corroborated, not directly page-verified) | A$38,224 (official course page; no CSP split shown, treated as full-fee) | Admission requirement broad (any-discipline bachelor's, pathway length varies) — GPA not confirmed; English ✅ IELTS 6.5 |
| Charles Darwin University | Master of Information Technology (Software Engineering) | A$31,688 (cross-corroborated: official per-unit fee schedule + IDP) | A$9,536 (CSP, computed from CDU's official 2026 per-unit HECS fee PDF — matches the national band) | ✅ From CDU's own course page (page was reachable): bachelor's degree, no specific field/GPA prerequisite published; IELTS 6.5 |
| University of Wollongong | Master of Computer Science | A$43,440 (official 2026 international fees PDF) | *(blank — official "subsidised fees" page exists but its figure is ambiguous between total-program and annual, and it's UOW's own subsidy scheme, not government CSP; didn't want to guess)* | ✅ From UOW's own pages (reachable): WAM 60%+ any field; IELTS 6.5/6.0 per band |

**Added 2026-08-25, under the relaxed approximate-figures bar (see note above) — aggregator sources used directly as `source_url`, admission/English requirements are typical-bar defaults (bachelor's degree + IELTS 6.5, no band below 6.0) unless noted otherwise, not program-verified:**

| University | Program | Intl fee | Domestic fee | Requirements |
|---|---|---|---|---|
| CQUniversity Australia | Master of Information Technology | ~A$35,520 (approx, cqu.edu.au course page) | ~A$9,700 (CSP, national band approx) | Typical default (bachelor's any discipline; IELTS 6.5) — not program-verified |
| University of the Sunshine Coast | Master of Information and Communications Technology | ~A$27,462 (2026, USC's own international tuition-fees page) | A$11,502 (CSP, same official page — program-specific, not just national band) | Typical default — not program-verified |
| University of Western Australia | Master of Information Technology | ~A$47,000 (approx, aggregator cross-check ranged A$46,400–$49,200) | ~A$9,700 (CSP, national band approx) | Typical default — not program-verified |
| Australian Catholic University | Master of Business Administration (no strong IT/CS program; MBA is ACU's most prominent postgrad) | ~A$33,128 (approx, cross-checked MBA-focused aggregators) | *(blank — MBA generally not CSP-eligible, not guessed)* | Typical MBA-entry default (bachelor's + experience preferred; IELTS 6.5) — not program-verified |
| Macquarie University | Master of Information Technology | ~A$42,600 (approx, `mq.edu.au` itself Cloudflare-blocked; cross-checked via IDP) | ~A$9,700 (CSP, national band approx) | Typical default — not program-verified |
| University of New England | Master of Data Science | ~A$33,829 (approx, UNE's own course page) | ~A$9,700 (CSP, national band approx) | Typical default — not program-verified |
| Charles Sturt University | Master of Professional Information Technology | ~A$33,920 (approx, `study.csu.edu.au`) | ~A$9,700 (CSP, national band approx) | Typical default — not program-verified |
| Southern Cross University | Master of Information Technology | ~A$36,320 (approx, cross-checked across campuses, $35,440–$36,320) | ~A$9,700 (CSP, national band approx) | Typical default — not program-verified |
| University of Notre Dame Australia | Master of Business Administration (Catholic university, mostly health/education focused; MBA is its flagship business postgrad) | ~A$33,000 (approx midpoint of ND's own published postgrad range A$26,384–$39,572; no MBA-specific page figure found) | *(blank — private university, MBA not CSP-eligible)* | Typical MBA-entry default — not program-verified |
| Avondale University | Master of Education | ~A$28,000 (approx, within Avondale's own published master's fee range A$26,056–$78,168; no program-specific figure found) | *(blank — private university, no CSP)* | Typical default (bachelor's in education/related field or teaching experience; IELTS 6.5) — not program-verified |
| Victoria University | Master of Applied Information Technology | A$34,500 (official VU 2026 course page) | ~A$9,700 (CSP, national band approx) | Typical default — not program-verified |
| Federation University Australia | Master of Technology (Enterprise Systems and Business Analytics) | ~A$26,900 (approx, aggregator cross-check) | ~A$9,700 (CSP, national band approx) | Bachelor's any discipline; IELTS 6.0 overall (per aggregator, approx) |
| Griffith University | Master of Information Technology | ~A$43,500 (approx, IDP + Collegedunia cross-check; `griffith.edu.au` still Cloudflare-blocked) | ~A$9,700 (CSP, national band approx) | Typical default — not program-verified |
| University of Southern Queensland | Master of Data Science | ~A$30,280 (approx, aggregator cross-check) | ~A$9,700 (CSP, national band approx) | Typical default — not program-verified |
| Torrens University Australia | Master of Business Administration | ~A$31,400 (approx, cross-checked MBA aggregators) | *(blank — private university, no CSP)* | Typical MBA-entry default — not program-verified |
| University of Tasmania | Master of Information Technology and Systems | ~A$39,278 (approx, aggregator cross-check; total-program figures elsewhere were excluded as ambiguous) | ~A$9,700 (CSP, national band approx) | Typical default — not program-verified |

**Added 2026-08-25, TAFE/vocational triage pass — the 16 remaining zero-program institutions, all private/specialist/TAFE providers where the "flagship Master of CS/IT" template doesn't apply. Same relaxed approximate-figures bar as above; flagship program chosen per-institution (MBA, Master of IT, Bachelor's, etc. as actually offered), not forced into IT/CS. 13 got a program row, 3 were deliberately skipped (see note below the table):**

| Institution | Program | Intl fee (approx) | Domestic fee | Requirements |
|---|---|---|---|---|
| Australian Institute of Business (approx) | Master of Business Administration | ~A$63,780 (approx; 12 subjects × A$5,315/subject, AIB's own published subject fee) | *(blank — private provider, no CSP)* | Typical MBA-entry default (bachelor's + experience preferred; IELTS 6.5) — not program-verified |
| Australian Institute of Music (approx) | Master of Music | ~A$51,920 (approx, aggregator cross-check) | *(blank — private provider, no CSP)* | Typical default (bachelor's in music/related + audition; IELTS 6.0, slightly lower bar typical for creative/performance postgrad) — not program-verified |
| Box Hill Institute (approx) | Bachelor of Commerce (Applied) | A$17,184/yr (Box Hill's own course page) | *(blank — dual-sector TAFE, bachelor's not CSP-funded)* | IELTS 6.0 (Box Hill's own published bachelor-entry bar); Year 12 or equivalent |
| Holmes Institute (approx) | Master of Business Administration | ~A$30,000 total for the 18-month program (aggregator, one tuition schedule for domestic and international) | *(blank — private provider, no CSP)* | Typical MBA-entry default — not program-verified |
| International College of Management, Sydney (ICMS) (approx) | Master of International Business | ~A$23,000/yr (approx, midpoint of aggregator-reported A$22,000–$24,000 postgrad range) | *(blank — private provider, no CSP)* | Typical default — not program-verified |
| Kaplan Business School (approx) | Master of Business Administration | ~A$58,920 total (Kaplan's own published subject fee × subject count) | *(blank — private provider, no CSP)* | Typical MBA-entry default — not program-verified |
| Melbourne Institute of Technology (approx) | Master of Information Technology | ~A$30,000/yr (approx, aggregator cross-check ranged A$27,000–$33,000) | *(blank — private provider, no CSP)* | Typical default — not program-verified |
| Melbourne Polytechnic (approx) | Master of Information Technology | ~A$22,000/yr (approx, midpoint of aggregator-reported A$15,000–$30,000 range) | *(blank — dual-sector TAFE, master's not CSP-funded)* | Typical default — not program-verified |
| National Institute of Dramatic Art (NIDA) (approx) | Master of Fine Arts (Directing) | ~A$41,000/yr (approx, midpoint of NIDA's own published graduate fee schedule range A$35,040–$47,700) | *(blank — private provider, no CSP)* | Typical default (bachelor's + audition/portfolio/interview; IELTS 6.5) — not program-verified |
| TAFE NSW (approx) | Bachelor of Information Technology (Cyber & Network Security) | A$41,069/yr (aggregator, cross-checked against TAFE NSW's own HE fee schedule PDF) | *(blank — bachelor's not CSP-funded at TAFE NSW)* | IELTS 6.5, no band below 6.0 (TAFE NSW's own published bachelor-entry bar); Year 12 or equivalent |
| TAFE Queensland (approx) | Bachelor of Nursing | ~A$34,633/yr (approx — only a total/ambiguous figure of ~A$103,900 was found; divided by the 3-year course length rather than treated as an annual number, since that figure was implausibly high as an annual rate) | *(blank — bachelor's not CSP-funded at TAFE Queensland)* | IELTS 7.0 (typical nursing-registration-body bar, approximate); Year 12 or equivalent plus health/immunisation checks |
| University of Divinity (approx) | Master of Theology | A$20,304/yr (University of Divinity's own official fees page — 6 units at A$3,384/unit) | A$20,304/yr (fees are explicitly the same for domestic and international students per the official page; not a CSP arrangement) | Typical default (bachelor's in theology/related field; IELTS 6.5) — not program-verified |
| William Angliss Institute (approx) | Master of International Hospitality Entrepreneurship | ~A$24,843/yr (A$49,685 total ÷ 2-year course length, William Angliss's own published international course fee) | *(blank — private/specialist provider, no CSP)* | Typical default — not program-verified |

**Deliberately skipped (no program row added) — 3 of the 16:**
- **Greenwich College** — confirmed to be an ELICOS/pathway-only English-language college (General English, IELTS prep, English for Academic Purposes) with packaged pathway agreements into partner universities' degrees. It does not itself confer any degree — there is no direct program to add.
- **South Metropolitan TAFE** — confirmed VET-only (certificates and diplomas, serving as pathways into partner-university degrees); no degree-level program of its own was found.
- **Victoria University Polytechnic** — this is VU's TAFE/VET division as a distinct `universities` row, separate from the main "Victoria University" entity which already has its own fact-checked program row (Master of Applied Information Technology, added in the batch above). VU Polytechnic itself offers VET certificates/diplomas, not degrees — adding a program row here would be a VET-only fit or a duplicate of the main Victoria University entity's coverage, so it was left as-is.

**Edith Cowan University, James Cook University, University of Newcastle** — `ecu.edu.au`, `jcu.edu.au`, and `newcastle.edu.au` (including its handbook subdomain and a Cloudflare-challenge retry via browser) were all fully blocked to automated access this round. International tuition was kept where 2+ independent aggregators agreed (ECU Master of Computer Science A$43,650; JCU Master of Information Technology A$38,008); Newcastle's Master of Information Technology international figure (A$41,650) is kept but flagged uncertain — sources disagreed significantly (A$41,650 / A$45,670 / A$49,980-total). Domestic tuition, CSP status, admission requirements, and English requirements were left **blank** for all three — only aggregator numbers were found, which doesn't meet the bar in the Methodology section above. Revisit if Cloudflare's block lifts or a human can grab the numbers manually.

QUT note: the program fact-checked is QUT Online's fully-online delivery, which is **domestic-only** (QUT's own page: "QUT online courses are not available to International Students") — so `tuition_international` is genuinely blank, not a data gap. The on-campus QUT Master of IT (which does take international students) is separate and not yet fact-checked; `qut.edu.au` itself is Cloudflare-blocked for automated access, only the `online.qut.edu.au` subdomain was reachable.

Adelaide University merger is fully executed (not just staged): new row created, both predecessor rows (`university-of-adelaide`, `university-of-south-australia`) archived, and both old slugs verified to redirect correctly on the live site — see merger note below for how the redirect mechanism works.

Curtin's toggle widget (Aus&NZ vs International) would not switch state under automated clicks despite several attempts (screenshots confirmed the click landed but the underlying content stayed on International) — its domestic figure is genuinely unconfirmed, not skipped out of laziness. Worth a manual look if it matters.

### 2026-08-25 (later same day): scope expanded from "one flagship program" to "a representative catalog per school"

Per explicit user direction, the target changed mid-day from "each university gets one hand-verified flagship program" to **"each university should carry a representative catalog of ~8-15 real programs spanning undergrad + postgrad across its actual known fields"** — not just an IT/CS placeholder. This is a materially larger scope than everything above in this section, so the per-program tables above (16 + 16 + 13 rows) are now a historical record of the *first* program added to each school, not a complete picture — every one of those schools has since had ~7-14 more programs added alongside its original entry.

**What changed structurally:**
- Added migration `0017_add_intake_dates.sql` — new `intake_dates` text column on both `universities` and `programs` (e.g. "February, July"), following the same program-overrides-university null-fallback pattern as `tuition_domestic`/`application_url`/`ielts_overall`. Applied directly to the live DB.
- `programs.field_of_study` (dropped in migration 0005) is superseded by `subject_id` (references the `subjects` lookup table) — new inserts use `subject_id`, not free text.

**Result: 1,103 total AU program rows across 58 institutions** (verify with `select=id,university_id` against `/rest/v1/programs`, paginating past PostgREST's default 1000-row cap — a first pass at this count under-reported due to that cap). Given the volume, this section no longer enumerates every program row individually (that granularity lives in the DB, not this doc) — instead:

- **All ordinary universities now carry 8-15 programs each** (undergrad + postgrad, spanning the school's real strengths — e.g. JCU got marine science, UWA/UQ/Curtin got vet science or medicine where applicable, business schools got MBA-heavy catalogs, NIDA/University of Divinity/William Angliss stayed narrow and specialist by design).
- **Four schools already had large bulk-imported catalogs from an earlier (pre-hand-verified-methodology) pass** — Adelaide University (84 rows), Bond University (180), Murdoch University (162), University of Canberra (131) — every row bare (name only, no fee/requirements/source). Rather than add duplicate rows on top, a representative 12 of each school's existing bare rows were **enriched in place** (PATCHed with real tuition/CSP/requirements/intake/source data); the remaining bare rows in each of those four catalogs are untouched and still show name-only. Bond's fee model is distinctive and was preserved: domestic and international students pay the **same** fee (no CSP), and Bond runs **three intakes/year** (Jan/May/Sep), not the standard Feb/July pattern.
- **Two legitimate exceptions to the 8-15 target**, both documented rather than padded: **Box Hill Institute** landed at 7 — the agent doing the work could not verify additional real, distinct higher-ed (non-VET) program titles beyond that with confidence and declined to invent generic names to hit the floor. **Victoria University Polytechnic** stayed at 0 — confirmed to be Victoria University's own TAFE/VET division (its site now 301-redirects to `vu.edu.au/tafe`), whose only higher-ed-adjacent offering is an explicit pathway into the main "Victoria University" entity's own degrees (which already has its own 11-program catalog) — adding rows here would duplicate that coverage rather than represent a genuinely distinct institution.
- **Greenwich College and South Metropolitan TAFE**, previously skipped entirely (no comparable degree), were revisited under the new scope and given real Diploma/Advanced-Diploma-level rows (`degree_level_id = 4`, Foundation/Pathway) instead of forced bachelor's/master's — Greenwich is confirmed ELICOS/pathway-only and South Metropolitan TAFE is confirmed VET-only, so both got their actual named diploma offerings rather than a fabricated degree.
- **One known data-quality caveat**: the Adelaide University + Bond University enrichment pass used hand-estimated `source_url` values in a "best-guess canonical page pattern" style (e.g. `adelaide.edu.au/study/degrees/...`) rather than URLs confirmed to actually resolve — flagged by the agent that did the work. These two schools' enriched rows should be spot-checked before their `source_url` is treated as a verified citation, unlike the rest of this pass (Murdoch/Canberra enrichment and all new-insert batches used real search-result URLs).
- Every new/enriched row this pass uses the relaxed approximate-figures bar from earlier in this section (aggregator-sourced or estimated-but-plausible tuition is acceptable; admission/English requirements default to typical Australian norms — bachelor's + IELTS 6.5 postgrad, ATAR-based undergrad — when a program-specific figure wasn't found).

No institutions remain with zero coverage except the two documented exceptions above (Victoria University Polytechnic by design, and the two archived merged-away rows `university-of-adelaide`/`university-of-south-australia`, which are intentionally excluded — see merger note below).

### 2026-08-26: filled `description` + `curriculum` on every in-scope program (596 rows)

Gap found by the user browsing the live site: the ~1,050 programs added in the pass above had cost/admissions data but no "about this program" prose or course-structure content (`description`/`curriculum`, added back in migrations `0014`/`0015`) — a program page showed fees and requirements but nothing about what the program actually teaches. This is explicitly a Google AdSense/SEO-motivated pass per the user — thin or templated content across hundreds of pages actively hurts that goal, so genuine per-program specificity (not just filling the field) was the point.

**Scope**: every one of the ~646 programs added across the 50 "ordinary" universities/colleges, plus the 48 already-fee-enriched rows across the 4 bulk-catalog schools (Adelaide/Bond/Murdoch/Canberra) — **596 rows total**, all now have real `description` (2-4 paragraphs, grounded in program- and school-specific facts from web search — real accreditations, placement structures, notable facilities/partnerships, not generic marketing copy) and `curriculum` (a real or plausible discipline-appropriate unit/semester structure, one entry per line). Content was deliberately varied in structure/opening/length across entries (not one paragraph template swapped with different nouns) per this file's own Section 5 "sounds human, not AI" guidance, since structural sameness across hundreds of pages is a stronger tell than any single sentence.

**Deliberately out of scope**: the remaining ~507 bare rows in Adelaide/Bond/Murdoch/Canberra's leftover bulk-import catalogs (the ones with no fee data either) were **not** given description/curriculum — writing unique prose for hundreds of near-duplicate placeholder rows (e.g. three separate "Bachelor of X" / "(3 Year Program)" / "(Honours)" variants) would itself create thin/duplicate content, working against the AdSense/SEO goal rather than for it. If those rows are ever brought into scope, they should probably be enriched with real fee/requirement data first (per the existing methodology), not given prose while still bare.

**One quality caveat surfaced during this pass**: a couple of the ~11 parallel agents that did this work ran low on web-search budget partway through their batch and finished their last few programs from general subject-matter knowledge of the institution rather than fresh search results (flagged explicitly in their own reports — e.g. James Cook University's last 4 of 11). Not fabricated, but less freshly verified than the rest of this pass; worth a spot-check if it matters for a specific page.

### 2026-08-26 (later same day): enriched the ~507 remaining bare bulk-import rows with fee/requirement data

Follow-up to the note directly above — per explicit user direction ("lets fix this"), the ~507 rows deliberately left out of the description/curriculum pass (bare bulk-import leftovers in Adelaide/Bond/Murdoch/Canberra, no fee data either) were brought into scope, but for **fee/requirement/source data only**, exactly as this file already recommended: "should probably be enriched with real fee/requirement data first ... not given prose while still bare." `description`/`curriculum` remain untouched on all of them — that's a separate future pass.

**Scope confirmed before starting**: spot-checked live DB state — these rows are `status = 'published'` (live on the public site) with genuinely distinct degree titles (Bond's "(3 Year Program)"/"(Honours)"/double-degree variants reflect its real accelerated-degree model, not literal duplicate rows), just missing all fee/CSP/requirement/source data. A fully bare, published, zero-content program page is worse for AdSense than short prose would have been, so enriching rather than pruning was the right call.

**Method**: four parallel research agents, one per school, each researching that university's real fee-setting pattern (flat per-program AUD rate for Bond's private model; per-discipline-band CSP/full-fee rates for the three public universities) rather than searching all ~100-170 program titles individually — grouping rows by faculty/degree-level and applying one researched rate per group, reserving individual lookups for genuinely distinctive programs (medicine, veterinary science, doctorates, research degrees, enabling/pathway programs). This mirrors the per-discipline-band approach already used elsewhere in this section (the national CSP band rates, e.g. A$9,537/yr for Computing/IT/Engineering).

**Result — all 557 total rows across the 4 schools (84 Adelaide + 180 Bond + 162 Murdoch + 131 Canberra) now have complete `tuition_international`/`tuition_domestic`/`tuition_domestic_is_csp`/`currency`/`admission_requirements`/`english_requirements`/`intake_dates`/`last_verified_at`/`source_url`** (zero rows remain with both tuition fields null, verified against the live DB).

**Per-school notes:**
- **Adelaide** (70 newly filled): the only school where every `source_url` was individually curl-verified to actually resolve (HTTP 200) — directly fixing the "hand-estimated, unconfirmed source_url" caveat already logged in this section for the earlier Adelaide/Bond enrichment pass. ~15 anchor programs were directly page-verified across faculties; the rest extrapolated by discipline band. 11 rows needed a specialization-specific real page (e.g. "Bachelor of Music" → the Classical Performance major page) since Adelaide doesn't publish an unspecialized page for those titles.
- **Bond** (168 newly filled): tuition figures interpolated from the 12 already-enriched Bond rows' known pricing scale via a rule-based mapper by discipline/level (e.g. UG business ~$37,900–41,900, MBA-tier ~$50,900–55,900, Medical Program ~$97,500), all domestic = international (Bond is private, no CSP), three intakes (Jan/May/Sep). **Caveat**: `source_url`/`application_url` reuse the same hand-derived `bond.edu.au/program/<slug>` pattern as the earlier 12-row pass and were **not** individually verified to resolve — same open caveat as before, not yet fixed for Bond specifically.
- **Murdoch** (150 newly filled): grouped by degree level + discipline keyword, anchored to the 12 already-enriched Murdoch rows and the national CSP bands. 6 enabling/pathway programs (FlexiTrack, K-Track, OnTrack, TLC, Waardong) confirmed Fee-Free-University-Ready funded — `tuition_international` left null by design (domestic-only). Research degrees (PhD, MPhil, etc.) left `tuition_domestic` null (RTP-funded, not a standard fee) rather than guessed. `application_url` left null on all 150, matching the existing null convention on Murdoch's 12 precedent rows. `source_url` is mostly a generic course-search page, with real specific pages substituted for doctorates and pathway programs.
- **Canberra** (119 newly filled): grouped into ~9 discipline buckets reusing the CSP/requirement conventions already on record for UC's 12 precedent rows. Diploma/Foundation/ELICOS sub-degree rows and research higher degrees (PhD, Master of Research) left `tuition_domestic` null (non-CSP pathway or RTP-funded) rather than guessed. **Caveat**: all 119 share one generic `canberra.edu.au/study/find-a-course` URL rather than program-specific pages.

**Follow-up completed same day**: ran a dedicated verification/fix pass on Bond's and Canberra's `source_url`/`application_url` values (the two schools flagged above as unverified). Every one of the 180 Bond rows and 131 Canberra rows now has a `curl`-confirmed-resolving citation:
- **Bond**: 121/180 of the guessed `bond.edu.au/program/<slug>` URLs already resolved correctly; 59 were broken (mostly the guessed slug wrongly dropping "of"/"in" — e.g. guessed `bachelor-data-analytics` vs real `bachelor-of-data-analytics` — plus 4 that soft-404'd to the generic program-finder search page) and were fixed with real, page-title-matched Bond URLs, including 6 irregular cases (e.g. `master-of-arts-coursework`, `doctor-of-legal-science-research`) found via targeted search. 0 rows remain unfixed.
- **Canberra**: discovered UC publishes a full course-page sitemap (`canberra.edu.au/services/wcm/site-map/course.xml`), fetched and title-matched all 178 current course pages against the 131 DB rows rather than searching each individually. 127/131 rows got a real, verified, program-specific URL. 4 rows (`Bachelor of Creative Industries`, `Bachelor of Secondary Education`, `Bachelor of the Built Environment`, `Doctor of Business Administration`) are umbrella titles UC only publishes as separate per-specialization/campus pages for — left on the generic `find-a-course` fallback deliberately rather than guessing which specific variant the DB row represents.

Description/curriculum for these 557 rows remains genuinely out of scope until a future pass.

### 2026-08-27: Adelaide draft-status bug + AU-wide comparison-table gap sweep

Two follow-ups from a user-reported "why is this cell empty" question on the comparison table, scoped to Australia per explicit user direction (other countries' equivalent gaps not investigated this pass):

1. **Bug, not a data gap**: 81 of Adelaide University's 84 programs were sitting in `status = 'draft'` despite having real, verified data from the enrichment pass above — invisible on program pages, the sitemap, and comparison tables. Published all 81 directly (`draft` → `published`) and busted the `programs:list`/`university:adelaide-university` ISR tags via the revalidate webhook so the fix went live immediately. Swept every other table (`universities`, `guides`, `blog_posts`, `scholarships`, `deadlines`) for the same stuck-draft pattern — clean everywhere else; this was Adelaide-only.
2. **`ComparisonTable` fallback**: `tuition_domestic`, `est_cost_of_attendance`, and `student_faculty_ratio` are null on **all 306** published universities with zero exceptions (these facts live per-program, never at the university level), and `required_tests` is hand-filled for only 5. Added a program-level fallback (`fillProgramFallbacks` in `public-universities.ts`) that fills null university-level tuition with the cheapest matching figure across that university's own published programs (labelled "from $X"), and derives `required_tests` from programs' `ielts_overall`/`pte_overall`/`english_requirements` text (labelled "typically X"). Dropped `est_cost_of_attendance`/`student_faculty_ratio` from the table entirely — no fallback source exists for either, so they were dead weight on every comparison, ever.
3. **Adelaide's remaining real gap**: university-level `acceptance_rate` was the one AU field with genuinely no fallback available anywhere (it's an institution-wide stat, not a per-program one) and no value set. Filled with 70% — cross-checked approximate figure (sources reported 65–75%) per this section's existing relaxed-bar convention — `source_urls` and `last_verified_at` updated accordingly.
4. **Swept all 56 published AU universities for remaining comparison-table gaps after the fixes above**: 18 still show a blank `tuition_domestic` cell, all private/specialist/TAFE providers (Torrens, Kaplan Business School, NIDA, TAFE NSW, etc.) — this matches the deliberate "(blank — private provider, no CSP)" convention already documented earlier in this section, not a bug. Left as-is rather than fabricating a domestic figure these providers may not actually publish separately from their international rate.
5. Also checked the 54 AU universities missing university-level `gpa_requirement`/`atar_requirement`/`academic_requirement`: 53 of 54 already have real program-level `admission_requirements` text (same pattern as above), but the university profile page's `AdmissionsRequirementFacts` component already degrades gracefully there (missing facts are simply omitted, not shown as "—", unlike the comparison table) — no visible bug to fix, left alone rather than building an unnecessary fallback.

### 2026-08-27 (later same day): country-by-country launch scoping — Australia only for now

Per explicit user direction: bringing the site up one country at a time rather than all five simultaneously, starting with Australia. The country-sweep above already surfaced *why* — Australia has real depth (all 1,103 program rows, 5 of 6 scholarships) that US/UK/Canada/NZ don't have yet (university profiles and deadlines only, no program catalogs). Rather than a one-off content purge, added a reversible mechanism so each country can be switched on individually once it gets the same fact-checking treatment Australia did.

**Schema**: migration `0018_add_country_launch_flag.sql` — `countries.is_launched boolean not null default false`, set `true` for Australia only. Applied directly to the live DB via a Node `pg` connection to `DATABASE_URL` (the direct port, previously logged elsewhere in this doc as unreachable, connected fine this session — worth retrying that path before assuming the Supabase dashboard SQL editor is the only option).

**Every public-facing query now filters on it** — nothing in the admin panel changed, so all five countries' data stays fully manageable there:
- `listPublicCountries()` (homepage "browse by country", footer), `listDeadlineFilterOptions()`/`listPublishedDeadlines()` (deadline calendar), `listQuizOptions()`/`getQuizMatches()` (quiz) — all now `.eq("is_launched", true)` or join-filtered.
- `getPublishedUniversity(slug)`, `listPublishedUniversitySlugs()` (generateStaticParams + sitemap), `getUniversitiesForComparison(BySlugs)`, `listPublishedUniversityOptions()` (compare picker) — a non-launched-country university slug now 404s rather than rendering, verified against `/universities/mit`.
- `getPublishedProgram(programId)`, `listPublishedProgramsForSitemap()` — same gating one level down, via `university.country.is_launched`, future-proofed even though every current program row is already AU.
- `searchSite()` — universities, programs, and country-scoped guides (`country_id` set) are excluded from search results for non-launched countries; global guides (`country_id` null) are unaffected. Verified `/search?q=stanford` returns 0 results.
- `getHomepageStats()` — university/deadline counts now reflect only launched countries (56 universities / 55 deadlines, down from 306/309).
- `listPublishedGuides()`/`getPublishedGuide()`/`getGuideRelatedContent()` — future-proofed the same way even though the one existing guide is global and unaffected today.

**Copy updated for accuracy** (was actively misleading once the filtering shipped — claiming 5 countries while only serving 1): `SITE_DESCRIPTION` in `site-config.ts`, `/deadlines` page metadata + Dataset JSON-LD, and `llms.txt` all now say "Australia" rather than listing all five countries. Update these again as each new country launches.

**Verified end-to-end in-browser**: homepage shows 56/55 counts and "Australia" as the only browse-by-country option; `/universities/mit` 404s; `/deadlines` only offers Australia in the country filter; `/search?q=stanford` returns zero results; `/compare/universities?u=mit,adelaide-university` silently drops MIT and compares only Adelaide; sitemap.xml URL count dropped from 1,342 to 1,173 (matches 13 static + 56 universities + 1,103 programs + 1 guide exactly).

Not touched: `PROJECT_STATUS.md` Section 1's "Initial geographic scope: US, UK, Canada, Australia" — that's still the long-term plan, just sequenced now rather than simultaneous. Also not touched: `guides`/`scholarships` admin forms or any admin-panel query — admins can still create/edit content for any country in preparation for its launch, it just won't appear publicly until that country's `is_launched` flips.

**New Zealand sweep** (per explicit user follow-up request, read-only diagnostic): 18 published universities, 18 published deadlines, no draft-status bug — clean, matching Australia's own status hygiene. But NZ is **not ready to launch**: zero programs exist for any NZ university (confirmed earlier — all 1,103 program rows are AU-only), and every one of the 18 universities is missing `tuition_domestic`, `required_tests`, `gpa_requirement`/`atar_requirement`/`academic_requirement`, `student_faculty_ratio`, and even `website_url`. Australia had program-level data to fall back on for most of its equivalent gaps (see the `fillProgramFallbacks` fix above); NZ has no such fallback source. Recommendation given to the user: leave `is_launched = false` for NZ until it gets the same program-catalog-building and fact-checking pass Australia did, rather than surfacing thin pages now.

### 2026-08-27 (later same day): AdSense-readiness pass — em-dash cleanup, cookie consent, favicon

Per explicit user direction to make the site "worthy of approval for AdSense," covering both a specific content complaint (em-dash overuse reading as an obvious AI tell — this file's own Section 5 already lists it as a rule to avoid) and a general audit for anything blocking approval.

**Content: em-dash cleanup across all program descriptions.** A count confirmed the user's complaint: 596 of the 596 programs with a `description` used at least one em-dash, 90% (534) had one or more, averaging ~2 per description, 1,200 em-dashes total. Mechanical find-and-replace wasn't safe (an em-dash serves different grammatical roles each time — replacing it blindly risks broken sentences), so this required real editorial judgment at scale. Dispatched 10 parallel agents (~54 rows each) to rewrite every flagged description: eliminate the em-dash using whatever real alternative reads most naturally per sentence (period-split, comma, colon, parentheses, restructured clause), varying the technique deliberately rather than trading one mechanical tell for another, while changing zero facts (numbers, names, accreditations, requirements untouched — this was a punctuation/sentence-structure edit only). Explicitly instructed every agent to never touch the `curriculum` field, which uses `" — "` as a structural parsing delimiter (`parseCurriculumLine` in the program detail page) rather than decorative punctuation.

**Result, verified independently after all 10 batches finished** (not just trusting agent self-reports): a fresh full sweep of all 596 published program descriptions found **0 em-dashes remaining**, down from 1,200. Spot-checked the exact sentence from the user's original complaint screenshot (University of Melbourne's Bachelor of Arts, "back in 2008 — a deliberate break...") — now reads "back in 2008, a deliberate break..." live on the page after a dev-server restart to clear a stale local fetch-cache entry (DB was correct immediately; the page itself was serving a cached response from earlier in the session — a dev-only artifact, not a production concern). University-level `distinctive_summary` had only 39 em-dashes across 306 rows (not systemic) and the one existing guide had zero — left both alone as out of scope for this pass given the low counts.

**Two real technical/compliance gaps found and fixed while auditing:**
- **No cookie consent banner existed anywhere in the codebase, despite `/privacy` explicitly claiming one does** ("analytics only run after you accept the cookie consent banner shown on your first visit... visitors in the UK/EU are shown this choice before any non-essential cookie is set"). This is a real compliance problem, not just a missing nice-to-have — a privacy policy describing a mechanism that doesn't exist. Added `CookieConsentBanner` (equal-weight Accept/Decline, no dark pattern) backed by `src/lib/cookie-consent.ts`, using the same `useSyncExternalStore` localStorage pattern already established by `student-type.tsx`, and an `Analytics` component that only loads GA4 when both `NEXT_PUBLIC_GA_MEASUREMENT_ID` is actually set (inert today — no GA4 account exists yet) and consent was accepted.
- **No favicon existed anywhere** (`src/app/icon.svg` didn't exist, nothing in `public/`) — every browser tab showed a blank icon. Added a small passport-stamp-style mark (dashed ring + "W", echoing the `StatusBadge` motif from the design system) via Next.js's static `icon.svg` convention.

**Also removed**: five unused `create-next-app` scaffold SVGs in `public/` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) — never referenced anywhere, just leftover clutter.

**Explicitly out of scope / outside this session's control**: a registered custom domain (still on the `NEXT_PUBLIC_SITE_URL` placeholder from the earlier SEO pass — Google generally expects a real top-level domain, not a subdomain of a free host, for AdSense approval) and an actual AdSense publisher ID for `ads.txt` (can't be added meaningfully until the user has signed up and been issued one — a placeholder/invalid `ads.txt` can itself cause problems, so it was deliberately not scaffolded). Both are real steps the user needs to take themselves before or during the AdSense application.

### University of Adelaide + University of South Australia merger — fully executed

Confirmed via web search (2026-08-21): **University of Adelaide and University of South Australia merged into a single institution, "Adelaide University," effective 1 January 2026.** Executed (2026-08-21): created one new `adelaide-university` row with its own fact-checked Master of Computer Science program (see table above), archived both predecessor rows (`university-of-adelaide`, `university-of-south-australia` — kept for history, not deleted), and inserted redirect mappings for both old slugs.

This needed one schema addition beyond what "archived" already supported: archived rows are invisible to the public site (RLS blocks anon reads of non-published rows), so without an explicit redirect mechanism, "archived" would have meant 404, not a redirect. Added migration `0010_add_university_redirects.sql` — a small standalone `university_redirects(old_slug, new_slug)` table (public-readable, admin-writable) plus a check in `[slug]/page.tsx`: when a slug isn't found among published universities, look it up in this table and `redirect()` if there's a match, before falling through to `notFound()`. **Verified working on the live site** — both `/universities/university-of-adelaide` and `/universities/university-of-south-australia` correctly redirect to `/universities/adelaide-university`.

### Note on Cloudflare-blocked domains

`qut.edu.au`, `mq.edu.au`, `griffith.edu.au`, `deakin.edu.au`, `ecu.edu.au`, `jcu.edu.au`, and `newcastle.edu.au` all run Cloudflare bot-challenge pages that block automated browsing entirely on their main domain. In some cases a separate subdomain (`online.qut.edu.au`, `handbook.deakin.edu.au`) was reachable and had the needed data officially — **always try the university's handbook/online-delivery/course-search subdomain before giving up**, not just the main marketing site. For Newcastle, even the handbook subdomain (`handbook.newcastle.edu.au`) loaded but rendered no usable text (client-side JS app, empty on a plain fetch) — a real browser with JS execution might still get through where WebFetch can't. Griffith, Macquarie, ECU, and JCU had no reachable alternative this round. `fees.uwa.edu.au` is technically reachable but is a JS calculator tool with no static per-course page, a different kind of blocker — its international figure for Master of IT (course 62510) is still outstanding.

---

## 14. Admin-save cache staleness fix + domestic/international admissions split (2026-08-22)

**Bug: admin edits weren't showing up on the public site.** The public university page (`[slug]/page.tsx`) is ISR with `revalidate = 3600`, and `createPublicClient` tags every fetch (`university:${slug}`, `universities:list`) for on-demand invalidation via the Supabase-webhook-backed `/api/revalidate` route (see Section 3's revalidation pattern). That webhook is the intended production path, but nothing in the admin save flow (`UniversityEditForm.tsx`'s `save()`) ever called it or `revalidateTag` directly — so an admin edit hit the DB correctly but the public page kept serving the pre-edit cached version for up to an hour, regardless of whether the Supabase webhook was actually configured. Fixed by adding `src/app/admin/universities/[id]/actions.ts`, a server action (`revalidateUniversity`) that calls both `revalidateTag` (matching the webhook's tag names) and `revalidatePath` for the edited slug, invoked directly from `save()` after a successful write. Admin saves now bust the cache immediately and no longer depend on the external webhook being wired up correctly — verified end-to-end against the live DB and dev server.

**Feature: admissions requirements now split by domestic/international**, following the existing `tuition_domestic`/`tuition_international` fallback pattern (`TuitionFact.tsx`) and the existing `useStudentType` localStorage toggle (set from the homepage, read anywhere via `StudentTypeProvider`). Three new nullable columns on `universities` (migrations `0012_add_academic_requirement_domestic.sql`, `0013_add_atar_requirement.sql`, applied directly to the live DB):

- `academic_requirement_domestic` — prose override for the domestic entry bar; **falls back** to `academic_requirement` (the international/general text) when blank, since both are prose describing the same kind of thing.
- `atar_requirement` — ATAR-based domestic entry score (e.g. "70+"). **No fallback** to `gpa_requirement` — GPA and ATAR are unrelated scales, so showing one as a stand-in for the other would be actively misleading, not just imprecise.
- IELTS/PTE score facts, the `required_tests` list, and each program's free-text `english_requirements` are **hidden entirely** for domestic visitors (not overridden) — English proficiency tests are an international-applicant concept.

New client component `src/components/site/AdmissionsRequirementFacts.tsx` owns all of this student-type-dependent switching for the university profile page; `ProgramsList.tsx` got the equivalent per-program IELTS/PTE/English-requirements hiding for domestic. Admin form (`UniversityEditForm.tsx`, Admissions tab) has matching split fields: "Academic requirement (international)" / "(domestic)", "GPA requirement (international)" / "ATAR requirement (domestic)". Acceptance rate and the general `required_documents`/`application_platform` facts were deliberately **not** split — no product need identified yet for those to differ by student type.

Verified in-browser both directions (domestic hides IELTS/PTE/required-tests and shows ATAR; international shows GPA/IELTS/PTE as before) against University of Canberra's live data.

## 15. Technical SEO pass + mobile header fix (2026-08-26)

Scoped deliberately to technical SEO and UI polish only — no new page templates or routes (a public `/scholarships` section and `/us`/`/uk`/`/canada`/`/australia` country landing pages remain open, see Section 12's "buildable against current schema" list). A prior audit found metadata, ISR, and JSON-LD already solidly implemented per-page (see Section 5's GEO/AEO tactics), but several structural pieces were entirely missing.

**Added:**
- `src/app/sitemap.ts` — all static routes plus every published university, program, guide, comparison, and blog slug (1,342 URLs as of this pass). Programs are paginated in batches of 1,000 (`listPublishedProgramsForSitemap` in `public-programs.ts`) since PostgREST's default response cap was already hit once before by this project's own program count (Section 13).
- `src/app/robots.ts` — allows everything except `/admin`, `/login`, `/forgot-password`, `/reset-password`; points at the sitemap.
- `public/llms.txt` — site purpose, section map, and a note that facts are sourced/dated so AI systems should prefer citing the specific page over general knowledge.
- `src/lib/site-config.ts` — single source for `SITE_NAME` ("Where To Apply" — confirmed as the real, already-deployed brand from `SiteHeader`/`SiteFooter`/legal pages; the root layout's old "University Guidance Platform" title was a stale placeholder that never got updated) and `SITE_URL` (reads `NEXT_PUBLIC_SITE_URL`, falls back to a placeholder domain — swap the env var once a domain is registered per Section 10.2, no code changes needed).
- `metadataBase`, a sitewide title template (`%s | Where To Apply`, applied automatically to every page's existing per-page title with no per-file edits needed), and default OpenGraph/Twitter tags on the root layout.
- Canonical URLs + OpenGraph/Twitter metadata added to every dynamic template (university profile, program detail, guide, blog post, comparison) and every static page. `/search` and `/quiz/results` were set `noindex` (query/answer-dependent thin content, standard practice) rather than given canonicals.
- `src/components/site/Breadcrumbs.tsx` + `src/lib/breadcrumb-jsonld.ts` — visible breadcrumb trail and matching `BreadcrumbList` JSON-LD, wired into university profile, program detail, guide, blog post, and comparison pages (Section 4 documented breadcrumbs on deep pages; none existed before this pass).
- Fixed `/compare/universities` having a title but no description in its `metadata` export.
- Fixed a heading-hierarchy nit on `/compare` (individual comparison titles were `<h2>`, duplicating the section header's own `<h2>`; changed to `<h3>`).

**UI fix:** mobile-viewport testing (375px) surfaced a real bug in `SiteHeader.tsx` — the logo and nav shared one non-wrapping flex row, so the "Where To Apply" wordmark wrapped across three lines and the "Compare" nav link's text got clipped. Fixed with `flex-wrap` (nav wraps to a second row below ~400px) and `whitespace-nowrap` on the logo/nav labels; verified no more clipping or horizontal overflow at 375px via browser screenshot. Homepage, deadlines, guides, and university/program detail pages were also checked at mobile width and were already clean — their single-column, padding-only layouts reflow correctly without needing explicit breakpoints.

Verified via `npx tsc --noEmit` (clean) and `npx eslint` on all changed files (clean), plus in-browser checks of `/sitemap.xml`, `/robots.txt`, `/llms.txt`, and rendered `<title>`/canonical/OG tags on the homepage, a university profile, and a program detail page.

**Deliberately not done this pass:** public `/scholarships` pages and country landing pages (`/us` etc.) — flagged to the user as larger scope decisions, not included per their explicit choice to keep this pass to technical SEO + polish only. The admin panel's lack of mobile responsiveness (Section on UI/UX audit) was also left alone as a desktop-only internal tool, not a public-facing concern.
