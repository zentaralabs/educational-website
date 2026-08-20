# Project Status — University Guidance Platform

Last updated: 2026-08-20
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

**Needs new data modeling first — not just a UI task:**
- "Popular courses" homepage section, and search/filter by **course/degree** or **subject** — `universities.popular_majors` is a loose text array today, not a structured, filterable catalog. Needs `courses` and/or `subjects` tables plus a `university_courses` join (with its own tuition, intake, and delivery-mode fields) before this is real.
- Filters: **Subject**, **Tuition fee** (per-course, not just the university-level tuition columns that exist now), **Intake**, **Online/on-campus** — all depend on the course-level model above.
- "Popular destinations" — doable at country level today; city-level would benefit from cities being a proper lookup/dimension rather than free text on `universities.city`.

**Its own small feature, not just a homepage section:**
- "Find the right university for me" quiz — needs its own question/scoring logic. Buildable against current data (country, degree level, budget, etc.) without new tables, but scope it separately rather than bundling into homepage work.

**Open question this raises:** the original brief (Section 1) scopes this as a university-level aggregator with deadlines/guides as the flagship differentiator, not a course marketplace. Building out course/subject-level browsing is a meaningful product expansion (StudyPortals-style), not incremental polish — worth a deliberate yes/no before starting, same as the user-accounts decision in Section 10.1.
