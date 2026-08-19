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

User accounts scope resolved: **deferred** to a later phase (not modeled in initial schema). Next.js app scaffolded (TypeScript, App Router, Tailwind). Homepage built (search + live deadline card, per Section 7). Full admin panel built per Section 6 — Universities, Deadlines, Guides, Scholarships, Review Queue, and Dashboard — all currently running on mock data in `src/lib/mock-*.ts`, with no auth gate yet.

Supabase project not yet provisioned — schema exists as migration files under `supabase/migrations/`, ready to apply once a project is created. That's the next real dependency: swapping the mock data for live queries, and adding the Supabase-auth gate on `/admin`.

Public-facing templates (university profile, deadline calendar, guide page, comparison page) and legal pages are not yet built.
# educational-website
# educational-website
# educational-website
