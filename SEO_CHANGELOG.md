# SEO Changelog

Log every SEO-sensitive change here: anything that can alter a URL, a canonical,
metadata, the sitemap, robots rules, indexation, redirects, or server-rendered
content. SEO regressions often surface weeks after deploy — this is the record
that lets us trace cause.

Format per entry: **Date · Change · Affected routes · SEO impact (LOW/MED/HIGH) ·
Redirects · Canonical/sitemap/metadata changes · Testing done.**

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
