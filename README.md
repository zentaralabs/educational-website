# University Guidance Platform

## Start here

This repo is being built from a completed planning phase, not from scratch. Before writing any code, read, in order:

1. **`PROJECT_STATUS.md`** — full project brief: monetization strategy, content strategy, GEO/AI-visibility strategy, admin panel scope, design direction, and open decisions. This is the source of truth for *why* things are built the way they are.
2. **`database-schema.md`** — full Postgres/Supabase schema (SQL), with reasoning for each modeling decision. Implement schema exactly as specified unless a listed open decision needs resolving first.

Do not assume defaults that contradict either file — the design direction, monetization sequencing, and data model were deliberately chosen against specific alternatives (see the reasoning in `PROJECT_STATUS.md`).

## Stack

- **Frontend:** Next.js — SSG/ISR (most pages static, revalidated on data change, not full rebuilds)
- **Database:** Supabase (Postgres)
- **Admin:** custom-built panel inside this same Next.js app, behind auth — not the raw Supabase table editor. Screen map is in `PROJECT_STATUS.md` Section 6.
- **Styling:** design tokens (palette, type, spacing) are specified in `PROJECT_STATUS.md` Section 7 — derive all UI from those, don't introduce new colors/fonts ad hoc.
- **Analytics:** GA4 + Google Search Console, consent-gated. No custom analytics tables — do not build a parallel tracking system.

## Build order (recommended)

1. Resolve the one open decision that affects schema before scaffolding: **user accounts scope** (`PROJECT_STATUS.md` Section 10.1). Ask before assuming either way — it changes the schema.
2. Set up Supabase project, apply schema from `database-schema.md`, including RLS policies described there.
3. Scaffold Next.js app: routing structure per `PROJECT_STATUS.md` Section 4, ISR revalidation webhook endpoint.
4. Build shared design tokens (colors, type scale, status badge component — the signature element) before building individual pages.
5. Build admin panel screens per Section 6, in this order: Universities → Deadlines (bulk edit is high priority) → Guides → Scholarships → Review Queue → Dashboard last (it aggregates the others).
6. Build public-facing templates: university profile, deadline calendar, guide page, comparison page. Each fact-bearing page needs schema.org markup and a visible "last verified" + source citation per the GEO strategy in Section 5.
7. Legal pages (Privacy Policy, Terms, About, Contact, Disclaimer) — required before AdSense application, not optional/deferred.

## Constraints to respect

- No hard deletes — soft-delete via `status = 'archived'` only (schema already reflects this).
- No auto-templated "thin" content — narrative fields (`distinctive_summary`, guide bodies) need real human-edited substance, not just a data table with a paragraph wrapper.
- No official university logos hosted directly — text-based branding only (trademark caution, see `PROJECT_STATUS.md` Section 9).
- Respect `prefers-reduced-motion`; keyboard focus states must be visible everywhere.
- Don't build a custom analytics/search-logging system — intentionally out of scope, GA4 + Search Console cover it.

## Status

User accounts scope resolved: **deferred** to a later phase (not modeled in initial schema). Next.js app scaffolded (TypeScript, App Router, Tailwind). Homepage built (search + live deadline card, per Section 7). Full admin panel built per Section 6 — Universities, Deadlines, Guides, Scholarships, Review Queue, and Dashboard.

Supabase project provisioned, three migrations applied (schema, RLS, and a fix to `guide_related_links` — see below), lookup tables seeded. Auth is live — `/admin` is gated (via `src/proxy.ts`), with a working login page and a first admin account. **Universities, Deadlines, Guides, Scholarships, Review Queue, and Dashboard are all fully wired to live Supabase queries** — list/detail views, bulk edits, publish gating, the many-to-many pickers (guide↔university, scholarship↔university), the unified review queue, and the dashboard's stale-content/upcoming-deadlines/recent-activity widgets all read and write real data. Every Save draft / Publish action now writes to `activity_log`, so the Dashboard's activity feed reflects real edits. `src/lib/mock-*.ts` is fully unused and can be deleted. **Authors** and **Settings** are still stub pages (never built).

**Known schema fix applied:** the original `guide_related_links` table had a 3-column composite primary key (`guide_id`, `related_guide_id`, `related_university_id`), which Postgres requires to be jointly `NOT NULL` — making it impossible to store an independent guide-only or university-only link. Migration `0003_fix_guide_related_links.sql` replaced it with two proper join tables, `guide_related_guides` and `guide_related_universities`.

**Public-facing templates are now built and wired to live, published-only Supabase data** (via a cookie-free anon client, `src/lib/supabase/public.ts`, so pages statically prerender and revalidate on a 1h ISR window plus on-demand tags matching the existing revalidate webhook): homepage (now reads real upcoming deadlines and stats instead of placeholder data), university profile (`/universities/[slug]`), deadline calendar (`/deadlines`, filterable by country/degree level/type), guide index + detail (`/guides`, `/guides/[slug]`, markdown rendered via `react-markdown`), and comparison pages (`/compare`, `/compare/[slug]` — guides with `category = 'comparison'`, plus a data-driven side-by-side table sourced from `guide_related_universities`). Each fact-bearing page shows a "last verified" date + source citations, and university profiles / the deadline calendar carry `CollegeOrUniversity`/`Dataset` schema.org JSON-LD; guides get `FAQPage` markup when their content has question-shaped headings. Legal pages (`/about`, `/privacy`, `/terms`, `/disclaimer`, `/contact`) are also built, ahead of an AdSense application.

**Authors** and **Settings** are now built too, completing the admin panel per Section 6. Authors (`/admin/authors`) lists bylines with a live count of each author's published pieces, an edit form (name/bio/credentials/avatar), and an admin-only "New author" flow (creates a byline-only `authors` row — a person still needs a separate Supabase Auth invite before they can log in). Settings (`/admin/settings`, admin-only — editors see a read-only notice) covers role management (toggle Editor/Admin per author, with self-demotion disabled so an admin can't lock themselves out) and the four controlled vocabularies from Section 8 — countries, degree levels, deadline types, application platforms — each with inline add/remove.

**Structured program/course data added** (migration `0004_add_programs.sql`, applied directly against production via a temporary `DATABASE_URL` since this project has no linked Supabase CLI project yet). New `programs` table holds per-university degree offerings (e.g. "Bachelor of Computer Science") — name, degree level, field of study, duration, and an optional per-program tuition override that falls back to the university's `tuition_international` when unset. Managed from the university edit screen's "Academic" tab (`/admin/universities/[id]`); shown publicly on each university profile under "Academics". `field_of_study` is still free text, not a controlled vocabulary — see `PROJECT_STATUS.md` Section 12 for what's still needed for real subject-level filtering.
