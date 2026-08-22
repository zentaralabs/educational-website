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

Last updated: 2026-08-21 (evening pass). Tracks per-program data quality for Australia specifically — 57 AU institutions exist in `universities` (all `currency = 'AUD'`, corrected from an earlier USD-labeling bug), but **programs are opt-in, one at a time, hand-verified** — there is no bulk import. This section is the source of truth for "have we actually fact-checked this school" so work doesn't get silently re-done or skipped.

### Methodology (apply this to every new AU program)

1. Find the program's own official fee page on the university's `.edu.au` domain (not aggregators like Mastersportal/Yocket/Collegedunia/Shiksha — they're useful for *finding* the right page, never as the cited source).
2. Get **international** tuition (annual) and confirm the **admission_url**/apply link.
3. Get **domestic** tuition. Australian postgrad coursework fees are not one flat number — check whether the program offers a **Commonwealth Supported Place (CSP)**:
   - If yes: use the CSP student-contribution rate (government-set per discipline band, published either on the course page or the university's "student contribution amounts" page) and set `tuition_domestic_is_csp = true`. Note the CSP band rate is *nationally standardized* (e.g. Computing/IT/Engineering = A$9,537/yr for 2026) — the same figure is valid across universities if a program-specific page doesn't restate it, as long as you've confirmed CSP eligibility for that specific program.
   - If no CSP, or CSP eligibility can't be confirmed: leave `tuition_domestic` **null** rather than guess. The UI already falls back to showing the international figure with an honest "(international)" label.
4. Get admission requirements (GPA/WAM cutoff, prerequisite subjects) and English test score (IELTS/TOEFL/PTE) **from the program's own entry-requirements page**. If only aggregator sites have a number, leave the field blank — don't populate `admission_requirements`/`english_requirements` from anything you can't trace to an official page.
5. Set `last_verified_at` to today and `source_url` to the specific page the *tuition* figures came from.
6. Enter via the admin panel (`/admin/universities/[id]` → Academic tab) or a one-off script against the Supabase REST API with the service-role key (direct Postgres port is IPv6-only and unreachable from this environment and from at least one home network tested — use the REST API or the Supabase dashboard's SQL Editor for schema changes).

### Done (16 of 57, plus 4 more with international-only data)

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

**Edith Cowan University, James Cook University, University of Newcastle** — `ecu.edu.au`, `jcu.edu.au`, and `newcastle.edu.au` (including its handbook subdomain and a Cloudflare-challenge retry via browser) were all fully blocked to automated access this round. International tuition was kept where 2+ independent aggregators agreed (ECU Master of Computer Science A$43,650; JCU Master of Information Technology A$38,008); Newcastle's Master of Information Technology international figure (A$41,650) is kept but flagged uncertain — sources disagreed significantly (A$41,650 / A$45,670 / A$49,980-total). Domestic tuition, CSP status, admission requirements, and English requirements were left **blank** for all three — only aggregator numbers were found, which doesn't meet the bar in the Methodology section above. Revisit if Cloudflare's block lifts or a human can grab the numbers manually.

QUT note: the program fact-checked is QUT Online's fully-online delivery, which is **domestic-only** (QUT's own page: "QUT online courses are not available to International Students") — so `tuition_international` is genuinely blank, not a data gap. The on-campus QUT Master of IT (which does take international students) is separate and not yet fact-checked; `qut.edu.au` itself is Cloudflare-blocked for automated access, only the `online.qut.edu.au` subdomain was reachable.

Adelaide University merger is fully executed (not just staged): new row created, both predecessor rows (`university-of-adelaide`, `university-of-south-australia`) archived, and both old slugs verified to redirect correctly on the live site — see merger note below for how the redirect mechanism works.

Curtin's toggle widget (Aus&NZ vs International) would not switch state under automated clicks despite several attempts (screenshots confirmed the click landed but the underlying content stayed on International) — its domestic figure is genuinely unconfirmed, not skipped out of laziness. Worth a manual look if it matters.

### Not started (37 of 57)

No program rows at all yet — only the base `universities` row (name, city, acceptance rate, website, international tuition, currency). Alphabetically:

Australian Catholic University, Australian Institute of Business, Australian Institute of Music, Avondale University, Bond University, Box Hill Institute, Charles Sturt University, CQUniversity Australia, Federation University Australia, Greenwich College, Griffith University, Holmes Institute, International College of Management Sydney, Kaplan Business School, Macquarie University, Melbourne Institute of Technology, Melbourne Polytechnic, Murdoch University, National Institute of Dramatic Art (NIDA), South Metropolitan TAFE, Southern Cross University, TAFE NSW, TAFE Queensland, Torrens University Australia, University of Canberra, University of Divinity, University of New England, University of Notre Dame Australia, University of Southern Queensland, University of Tasmania, University of the Sunshine Coast, University of Western Australia, Victoria University, Victoria University Polytechnic, William Angliss Institute.

(University of Adelaide and University of South Australia intentionally excluded — see merger note, replaced by Adelaide University above. Edith Cowan, James Cook, and University of Newcastle are also excluded from this list — they have a program row with international tuition, just no domestic/requirements data yet; see the "Done" table above.)

**Griffith University and Macquarie University were attempted and skipped (twice now)**: both `griffith.edu.au` (including the `www148`/`my` subdomains) and `mq.edu.au` (including `students.mq.edu.au`) are fully Cloudflare-blocked for automated access — no page on either domain was reachable. Third-party aggregators gave conflicting numbers for both (Griffith international: $39,500/$41,500/$43,500 depending on source; no reliable Macquarie figure at all) and weren't used. Revisit these two only if there's a way to get a human to grab the numbers manually, or if Cloudflare's block lifts.

Also note: a growing share of the AU list is TAFEs and vocational/specialist colleges (TAFE NSW, TAFE Queensland, South Metropolitan TAFE, Box Hill Institute, Holmes Institute, Kaplan Business School, William Angliss Institute, NIDA, Australian Institute of Music, University of Divinity, etc.) that likely don't offer a Master of CS/IT at all — the "flagship Master of CS/IT" approach used for the 20 above doesn't apply to them. Worth a short triage pass to sort the remaining 37 into "still a real CS/IT target" vs "needs a different flagship program or doesn't fit this exercise" before continuing head-down.

**Suggested next batch**: Griffith University and Macquarie University are worth a fresh attempt (Cloudflare blocks can lift over time) before moving to the TAFE/vocational tail, which needs the triage pass above first.

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
