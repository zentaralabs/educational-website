# SEO Route Inventory

Every public route type, its indexation intent, and how it's controlled. Update
this whenever a route is added, removed, or its indexation changes, and log the
change in `SEO_CHANGELOG.md`.

- **Canonical:** all indexable pages set `alternates.canonical` from `SITE_URL`
  (`https://www.wheretoapply.xyz`), self-referential unless noted.
- **Host:** one hostname, `www`, HTTPS. Apex→www and http→https handled at the
  host (not `next.config.ts`).
- **Rendering:** Next.js App Router, SSG/ISR (`revalidate` on data change via
  Supabase webhook → `/api/revalidate`). Primary content is in server HTML.

| Route | Index? | Canonical | Sitemap | Priority | Notes |
|---|---|---|---|---|---|
| `/` | Yes | Self | Yes | Critical | |
| `/universities` | Yes | Self | Yes | Critical | Faceted filter/sort is client-side only — no indexable query URLs |
| `/universities/[slug]` | Yes | Self | Yes | Critical | ~56 AU unis; non-launched-country slugs 404 |
| `/universities/in/[state]` | Yes | Self | Yes | High | 8 static state pages; noindex TAS/NT if GSC flags thin |
| `/universities/[slug]/deadlines` | Partial | Self | Only indexed set | High | Indexed only for slugs in `DEADLINE_PAGE_INDEXED` (~38); rest `noindex` + out of sitemap |
| `/universities/[slug]/programs/[id]` | Partial | Self | Only `isProgramIndexable` | Medium | Curated programs indexed; templated long-tail cards `noindex`, live for users/links |
| `/deadlines` | Yes | Self | Yes | Critical | Filter calendar; Dataset JSON-LD |
| `/study/[slug]` | Partial | Self | Only `SUBJECT_CONTENT` slugs | High | Curated subject write-ups indexed; templated fallback `noindex` |
| `/study` | Yes | Self | Yes | High | |
| `/visas` | Yes | Self | Yes | High | |
| `/visas/[slug]` | Yes | Self | Yes | High | 12 subclasses; `LastVerified` + "rules change" disclaimer required |
| `/visas/points-calculator` | Yes | Self | Yes | High | Interactive; FAQPage schema |
| `/visas/invitation-rounds` | Yes | Self | Yes | Medium | Tracker, updated per round |
| `/scholarships` | Yes | Self | Yes | High | |
| `/scholarships/[slug]` | Yes | Self | Yes | Medium | National + uni-specific; non-launched-country rows hidden |
| `/best` | Yes | Self | Yes | Medium | "Best for X" decision collections |
| `/best/[slug]` | Yes | Self | Yes | Medium | |
| `/compare` | Yes | Self | Yes | Medium | |
| `/compare/[slug]` | Partial | Self | Curated pairs + comparison guides | Medium | `COMPARISON_PAIRS` + hand-written guides only |
| `/compare/universities` | Yes | Self | Yes | Low | Picker tool; `?u=` params are client-side, not indexable |
| `/international` | Yes | Self | Yes | Medium | Origin-country hub |
| `/international/[country]` | Yes | Self | Yes | High | 7 pages (IN, NP, PK, CN, VN, BD, LK); `LastVerified` + FAQPage |
| `/guides` | Yes | Self | Yes | High | |
| `/guides/[slug]` | Yes | Self | Yes | Medium | Evergreen how-to; real bylines |
| `/blog` | Yes | Self | Yes | Medium | |
| `/blog/[slug]` | Yes | Self | Yes | Low–Med | Dated posts; `feed.xml` at `/blog/feed.xml` |
| `/cost-of-living` | Yes | Self | Yes | Medium | |
| `/cost-of-living/[city]` | Yes | Self | Yes | Medium | `CITY_COSTS` |
| `/cost-calculator` | Yes | Self | Yes | Medium | Interactive |
| `/quiz` | Yes | Self | Yes | Low | "Find the right university" |
| `/quiz/results` | No | — | No | None | Result state, no standalone value |
| `/search` | **No** | — | No | None | `robots: { index: false, follow: true }`; query-driven |
| `/about` `/contact` `/methodology` `/editorial-policy` | Yes | Self | Yes | Low | Trust / E-E-A-T |
| `/privacy` `/terms` `/disclaimer` | Yes | Self | Yes | Lowest | Legal |
| `/login` `/forgot-password` `/reset-password` | No | — | No | None | `Disallow` in robots.txt |
| `/admin/*` | No | — | No | None | `Disallow` in robots.txt + auth (RLS) |
| `/api/*` | No | — | No | None | |

## Indexation control mechanisms in use

- **Per-page `robots: { index: false }`** — `/search`, templated `/study` and
  program fallback pages, non-indexed `/universities/[slug]/deadlines`.
- **`countries.is_launched` gating** — non-Australia universities / programs /
  country-scoped guides & scholarships 404 or are excluded from results,
  `generateStaticParams`, and the sitemap.
- **Sitemap = allowlist** — `sitemap.ts` explicitly lists only canonical
  indexable URLs; noindex sets are filtered out at source.
- **`university_redirects` table** — `[slug]/page.tsx` checks it before
  `notFound()` (used for the Adelaide merger: old slugs 301 to the new one).
- **robots.txt `Disallow`** — `/admin`, `/login`, password-reset only.

## Known thin-content watch list (revisit with GSC data)

- `/universities/in/tasmania`, `/universities/in/northern-territory` — one
  university each; carried by state context. Noindex if GSC reports low value.
- One-line templated program cards — already `noindex`, keep monitoring that
  none leak into the sitemap.

## Planned countries — current state & launch checklist

**Live to the public: Australia only.** Every other country is present in the
data model but gated off. This is deliberate and is the SEO-correct state — thin,
half-populated country pages leaking to Google would be doorway/thin content and
would drag down sitewide quality signals.

### What exists in the DB but is NOT served

| Country | Data present | Data missing |
|---|---|---|
| UK (80), US (88), Canada (64), NZ (18) | **250 university profiles** all `status = 'published'` but gated; 1 US scholarship (MIT). No non-AU guides. | Program catalogs, real deadlines, scholarship depth, per-country visa content, fact-check pass, em-dash cleanup (~25 `distinctive_summary` fields) |

### How the gate works (defence in depth, all already live)

1. **`countries.is_launched`** — `false` for every country except Australia
   (migration `0018`). Toggle in **Admin → Settings → Countries** ("Launched"
   checkbox; `setCountryLaunched` in `vocab.ts`). Checked in every public query:
   `public-stats`,
   `public-search`, `public-quiz`, `public-countries`, `public-scholarships`,
   `public-guides`, `public-collections`, `public-deadlines`, plus
   `generateStaticParams` and `sitemap.ts`.
2. **Supabase RLS** — anon role can only read `status = 'published'` rows.
3. **Result:** `/universities/mit` → 404, `/search?q=stanford` → 0 results,
   non-AU rows absent from sitemap / stats / quiz / compare picker.

### Optional hardening (see decision note below)

**Recommended — do this.** Flip the **250** non-AU university rows (+ 1 US
scholarship) from `status = 'published'` to `draft`. Right now those 250 rows
pass RLS (they *are* published) and are held back by exactly one thing: the
`is_launched` filter being present in every current public query. Setting them to
`draft` adds a second independent layer — RLS blocks non-published rows for the
anon role outright, so even a future query that forgets the `is_launched` join
can't leak them. Reversible (`draft` → `published` per country at launch),
low effort, and admin editing still works on `draft` rows. Script:
`scripts/set_unlaunched_countries_draft.mjs` (dry-run by default, `--commit` to
apply, writes the prior state to `scripts/data/` for rollback).

### Launch checklist for country #2 (do NOT flip `is_launched` before all of this)

- [ ] Full fact-check pass on every university profile against official sources
- [ ] Program catalog with real sourced content (not templated stubs)
- [ ] Real per-intake application deadlines, sourced
- [ ] Country-specific scholarships (national + institutional)
- [ ] Visa / post-study-work content for that country (own data model — see
      PROJECT_STATUS visa section; AU visa tables are not country-generic)
- [ ] Em-dash sweep (`scripts/check_em_dashes.mjs`) on all new rows
- [ ] Route prefix decided and built: `/uk/universities/...` etc. — **Australia's
      flat URLs do not move**; the new country is added alongside, never on top
- [ ] `SITE_DESCRIPTION` in `site-config.ts` + `/deadlines` metadata + `llms.txt`
      updated to name both countries
- [ ] New country's routes added to `sitemap.ts` and `SEO_ROUTES.md`
- [ ] Then, and only then: tick **Launched** for that country in
      Admin → Settings → Countries
- [ ] `POST /api/revalidate` (full) so the sitemap + static pages pick up the
      new country's URLs
- [ ] Log the launch in `SEO_CHANGELOG.md`
