# Data quality findings log

Ongoing findings from auditing query logic against the live Supabase schema,
started while building content briefs (2026-09-13). Everything below is
confirmed against the live site or the DB directly — not a hypothesis. Add new
findings as their own numbered section; don't edit old ones except to mark
them fixed.

---

# Finding 1: pathway/diploma pricing leaking into "cheapest degree" rankings

## The bug, in one sentence

Every "cheapest program" / "minimum tuition" calculation in the codebase takes
`Math.min()` across **all** of a university's or subject's published programs
with **no filter on degree level or award type**, so a AUD 8,000 Diploma of
Community Services sits in the same ranked list as a AUD 45,000 Bachelor of
Nursing, unlabeled, and can come out on top.

## Confirmed live example

`/study/nursing-and-health-sciences` renders "the 60 lowest-tuition Nursing &
Health Sciences degrees," sorted ascending. The #1 result is:

> Greenwich College — Diploma of Community Services (Case Management) —
> AUD 8,500 — degree_level: **Foundation/Pathway**

sitting above every real Bachelor of Nursing program (AUD 29,000–50,700 across
38 real degree-granting universities). Greenwich College is `institution_type:
'private'`, and every one of its programs I checked is a Diploma/Advanced
Diploma, not a degree.

A student searching "cheapest nursing degree in Australia" who lands on this
page and takes the #1 result at face value is being shown a hospitality-and-
community-services pathway college's diploma price, not a nursing degree
price. This is a credibility risk, not just a ranking inefficiency.

## Root cause: three independent code locations, same missing filter

### 1. `src/lib/queries/public-subjects.ts` — `getSubjectBySlug()`
Powers every `/study/[slug]` subject page's "compare programs" table.

```ts
const PROG_SELECT =
  "id, slug, name, tuition_international, currency, duration_years, ielts_overall, " +
  "degree_level:degree_levels(name), " +
  "subject:subjects!inner(id, slug, name), " +
  "university:universities!inner(slug, name, city, status, ielts_overall, country:countries!inner(is_launched))";
```
Query filters only on `status`, `university.status`, `university.country.is_launched`,
and `subject.slug`. **No filter on `degree_level`.** `degree_level` is fetched
but never used to exclude anything — it's selected, not applied.

### 2. `src/lib/queries/public-collections.ts` — the `minTuition`/`firstYearBudget` calc
Powers `/best/affordable-*`, `/best/cheapest-universities-in-{city}`, the GO8
collection, and every other collection that shows a "first-year budget" figure.

```ts
const progTuitions = uniProgs
  .map((p) => p.tuition_international)
  .filter((n): n is number => typeof n === "number" && n > 0);
const minTuition =
  u.tuition_international ??
  (progTuitions.length ? Math.min(...progTuitions) : null);
```
`uniProgs` is every published program at that university, again with no
degree-level filter.

### 3. `src/lib/queries/public-universities.ts` — the tuition-backfill fallback
When a university's own `tuition_international` column is null, this function
fills it from the cheapest of that university's own programs:

```ts
if (p.tuition_international != null && (cur.intl === null || p.tuition_international < cur.intl)) {
  cur.intl = p.tuition_international;
}
```
Same pattern, same missing filter. This one is more dangerous than the other
two because its output silently becomes the university's own `tuition_international`
field — anything downstream that trusts that column (not just this one query)
inherits a pathway-college price as if it were the university's headline fee.

### 4. Inherited bug: `src/lib/queries/public-quiz.ts`
The course-match quiz's budget filter calls `listCollectionUniversities()`
(location #2 above) directly, so a student setting a tuition budget in the
quiz is being filtered against the same contaminated `minTuition` figure.
This means the quiz could **exclude a university whose real nursing degree
fits the student's budget**, because its unrelated diploma program (which the
student has no interest in) is the one being compared, or vice versa.

## Why this is worse than a simple "needs curation" note

The 2026-09-07 memory on the deferred subject `/best` pages framed this as
needing "a data-curation pass (which providers count as a university, degree-
level filter)." That undersold it slightly: **the classification data mostly
already exists** — `degree_levels` has a clean `'Foundation/Pathway'` value —
so filtering `degree_level != 'Foundation/Pathway'` in all three locations
above would fix the majority of cases with a one-line change each.

**But it would not fix all of it.** I checked how consistently diploma/
certificate programs are actually tagged:

```
degree_level distribution (published programs):
  Graduate            3,549
  Undergraduate       2,587
  PhD                   217
  Foundation/Pathway     58

Programs named "Diploma...", "Certificate...", or "Advanced Diploma..."
that are NOT tagged Foundation/Pathway: 471
  → all 471 are tagged "Undergraduate"
```

So **471 diploma/certificate-named programs are misclassified as
`Undergraduate`** — the same bucket real bachelor's degrees live in. A fix
that only excludes `degree_level = 'Foundation/Pathway'` would still let 471
mislabeled diploma programs through. (In the Greenwich College case above,
its programs happen to be correctly tagged `Foundation/Pathway`, which is why
that specific example would be fixed by the simple filter — but the same bug
class exists elsewhere in the catalog via these 471 rows, and would keep
producing wrong "cheapest" results for whichever universities/subjects they
belong to.)

## Recommended fix (in order)

1. **Immediate, low-risk:** add `degree_level.name != 'Foundation/Pathway'`
   (or equivalent) as a filter in all three query locations above. This fixes
   the confirmed Greenwich College case and anything else correctly tagged.
2. **Root-cause fix:** re-tag the 471 misclassified diploma/certificate
   programs from `Undergraduate` to `Foundation/Pathway` (or a new dedicated
   value if diplomas shouldn't share a bucket with genuine pathway/foundation
   programs — worth a naming decision). This is very likely a bug in the
   CRICOS import's degree-level assignment logic (probably keying off CRICOS
   course level codes) rather than 471 individual manual mistakes — worth
   checking the importer before doing a one-off SQL correction, or the next
   import will reintroduce the same 471+ mistagged rows.
3. **Defense in depth:** consider a name-pattern check (`name ILIKE 'diploma%'
   OR name ILIKE 'certificate%' OR name ILIKE 'advanced diploma%'`) as a
   second filter independent of `degree_level`, so a future mistagged row
   doesn't silently reintroduce this bug a third time.
4. Re-run/verify the same 4,851 → 29,783 style regression check used after
   the [occupation-links reseed](./PROJECT_STATUS.md) — after fixing the
   query filters, spot-check that `/study/*` minimum tuition figures and
   `/best/*` first-year budgets move in the expected direction (up, since
   diploma-priced floors are being removed) and that no subject/city loses
   its listing entirely because its only "cheap" option was a diploma.

## Pages affected

- `/study/[slug]` — all ~15 subject pages, via `getSubjectBySlug()`
- `/best/affordable-australian-universities-for-international-students`
- `/best/cheapest-universities-in-{sydney,melbourne,perth,brisbane,adelaide,canberra}-for-international-students`
- `/best/group-of-eight-universities-in-australia` (shows first-year budget)
- Any university whose own `tuition_international` was backfilled via #3 above
  — this is silent and would need a query to find which universities currently
  have a null hand-entered `tuition_international` and are relying on the
  buggy fallback
- `/quiz` and `/quiz/results` — budget filter, via the inherited bug in
  `public-quiz.ts`
- Indirectly: the deferred "cheapest for [subject]" `/best` collections this
  finding came out of — confirms the deferral was the right call, and gives
  the actual fix needed before un-deferring them

## Addendum (2026-09-13): this is a real institution-type policy decision, not just a data-tagging fix, for at least IT and Engineering

While scoping the nursing content brief I checked whether the same
"literal Bachelor of X name" filter that made nursing safe (see
`CONTENT-BRIEFS.md`) would also work for the other deferred subjects. It
does not, for a different reason than the degree_level mistagging above:

```
Literal "Bachelor of ... Information Technology/Computer Science" programs,
cheapest first:
  melbourne-polytechnic          $19,000
  tafe-nsw                       $19,500
  box-hill-institute             $21,000
  kaplan-business-school         $25,000
  ...then real universities from $26,000 up

Literal "Bachelor of ... Engineering" programs, cheapest first:
  la-trobe-university            $11,200  (Bachelor of AI Engineering — outlier,
                                            worth a standalone accuracy check,
                                            e.g. possible per-unit vs per-year mixup)
  tafe-nsw                       $19,500
  melbourne-polytechnic          $22,000
  melbourne-institute-of-technology  $24,000
  ...then real universities from $26,000 up
```

Unlike nursing, TAFEs and dual-sector providers (Melbourne Polytechnic, Box
Hill Institute, TAFE NSW/QLD) **do legitimately grant real Bachelor's
degrees** in IT and Engineering under Australia's dual-sector system — this
isn't a tagging error to fix, it's a genuine editorial question: should a
"cheapest universities for IT/Engineering" page include dual-sector/TAFE
degree-granting institutions at all, and if so, does it need to say so
explicitly (the way the nursing page will separate Diploma from Bachelor)?
This needs a decision from Roman, not a code fix — flagging it here rather
than guessing, since it blocks the IT and Engineering versions of the
deferred `/best` subject pages even after Finding 1's degree_level fix
lands. Also worth a quick one-off check on the La Trobe $11,200 AI
Engineering figure specifically — it's far enough below every comparable row
to warrant verifying it's not a per-unit or per-subject price stored as if
it were the full annual/course tuition.

## What's NOT affected

- The 38 real Bachelor of Nursing programs I checked directly are clean —
  no discontinued flags, no mistagged rows in that specific set. Nursing's
  registration requirements mean pathway colleges don't offer the bachelor's
  degree itself, which is why a *new* nursing-specific page can ship safely
  once scoped to literal "Bachelor of Nursing"-named programs, even before
  the systemic fix above lands.
- Program pages themselves (`/universities/[slug]/programs/[slug]`) show each
  program's own real tuition — this bug is specific to *aggregation* logic
  (min/cheapest calculations), not individual program data.

---

# Finding 2: unpaginated queries silently truncate at PostgREST's 1000-row cap

## The bug

PostgREST caps any query at 1000 rows by default and returns **HTTP 200 with
no error** when it truncates — just a `Content-Range: 0-999/*` header that
nothing in this codebase checks. The team has already been bitten by this
once: `public-occupations.ts` has a code comment documenting a prior incident
("a first cut of this query silently returned only the first ~1000 rows and
dropped most occupations from the sitemap without erroring") and fixed it
with a paginated loop. That fix was never applied to a second, nearly
identical query in a different file.

## Confirmed instance: `listPublishedSubjects()` in `public-subjects.ts`

```ts
export async function listPublishedSubjects(): Promise<SubjectSummary[]> {
  const supabase = createPublicClient(["programs:list"]);
  const { data, error } = await supabase
    .from("programs")
    .select(PROG_SELECT)
    .eq("status", "published")
    .eq("university.status", "published")
    .eq("university.country.is_launched", true);
  // no .range() — single unpaginated call
```

This queries the entire `programs` table with no pagination. I confirmed
directly against the REST endpoint:

```
GET /rest/v1/programs?select=id&status=eq.published
Content-Range: 0-999/*
rows returned: 1000
```

There are **7,113 published programs**. This function sees only the first
1000 (~14%) of them, with no `.order()` clause either, so which 1000 come
back is whatever Postgres's default (unspecified) scan order happens to be —
not evenly distributed across subjects.

**Impact:** every subject's `programCount`, `universityCount`, and
`minTuition` shown on the `/study` index is computed from a ~14% sample, not
the real data. The `.filter((s) => s.programCount >= 6)` cutoff that decides
whether a subject gets its own page/sitemap entry is being evaluated against
these wrong counts. I checked the true per-subject counts directly — every
current subject is comfortably above 6 (13–1,141 real programs each), so no
subject is being wrongly hidden *today*, but that's incidental, not
structural: this function would silently starve a real subject below the
threshold the moment the data shifts, with no error to catch it.

## Confirmed instance: `getSubjectBySlug()`, specifically for `business`

Same file, same missing pagination, but scoped to one subject via
`.eq("subject.slug", slug)`. Every subject is under the 1000-row cap **except
one**:

```
business: 1,141 published programs   ← over the 1000-row cap
nursing-and-health-sciences: 954     (safe, for now)
(all others under 500)
```

So `/study/business` specifically — the page for the subject you already
have an MBA content brief queued for in `CONTENT-BRIEFS.md` — is silently
dropping roughly **141 real business programs** from its comparison table,
and its min/max/median tuition figures are computed from an incomplete,
arbitrarily-ordered 1000-row subset rather than the true catalog. This is
worth fixing before or alongside executing that MBA brief, since the brief
assumes `/study/business` is a trustworthy internal-link target.

## Confirmed instance (same missing `.order()`, not the row cap): `listOccupationSlugsWithPrograms()` in `public-occupations.ts`

This one already paginates (avoiding the 1000-row truncation), but makes the
*other* mistake found and fixed in `public-programs.ts`'s sitemap query
(see the commit that added `.order("id")` there): no `.order()` clause on the
paginated `.range()` loop.

```ts
for (let from = 0; ; from += pageSize) {
  const { data, error } = await supabase
    .from("program_occupations")
    .select(...)
    .eq("occupation.status", "published")
    .eq("program.status", "published")
    .eq("program.university.status", "published")
    .eq("program.university.country.is_launched", true)
    .range(from, from + pageSize - 1);
```

`program_occupations` has "thousands of rows" per this file's own comment,
and per memory (`rotation-seo-audit-2026-09-12.md`) it was recently reseeded
from 4,851 to 29,783 rows — exactly the kind of concurrent-write event that
can shift row order mid-pagination. Here the failure mode is the mirror image
of the programs-sitemap bug: instead of a duplicate `<loc>`, a row that
shifts pages during pagination can be **skipped entirely**, silently dropping
an occupation from the sitemap (or making it look unlinked-from-programs when
it isn't) with no error. Same fix as the programs sitemap: add `.order("id")`
(or another immutable unique column) to the `.range()` call.

## Two more confirmed instances (same root cause, table row counts checked directly)

Checked every table these queries touch for its true row count:
`deadlines` 473, `scholarship_universities` 44, `universities` 308,
`scholarships` 47 — all safely under 1000. Only **`programs` (7,113)** and
**`program_occupations` (29,783)** exceed the cap, so I grepped every
`.from("programs")` / `.from("program_occupations")` call across
`src/lib/queries/` for missing pagination. Two more turned up:

### `listCollectionUniversities()` in `public-collections.ts` (the `progs` query)

```ts
supabase
  .from("programs")
  .select(
    "tuition_international, intake_dates, university:universities!inner(slug, status, country:countries!inner(is_launched))",
  )
  .eq("status", "published")
  .eq("university.status", "published")
  .eq("university.country.is_launched", true),
  // no .range() — unpaginated against all 7,113 published programs
```

This is the **same function already documented in Finding 1** as missing a
degree-level filter (the `minTuition`/`firstYearBudget` calc powering
`/best/affordable-*`, `/best/cheapest-universities-in-{city}`, the GO8
collection, and the `/quiz` budget filter). It turns out this function has
**both bugs stacked**: it doesn't exclude diploma/pathway programs from the
tuition minimum, *and* it only ever sees the first 1000 of 7,113 programs, in
unspecified order, when computing that minimum for every university on the
site simultaneously. A university's real cheapest program can be silently
invisible to this calculation even before the degree-level question comes
up. Fixing Finding 1's filter without also paginating this query would still
leave the "first-year budget" figures on every affordable/cheapest/GO8
collection page computed from an incomplete, arbitrarily-ordered sample.

### `universitySlugsForSubject()` in `public-quiz.ts`

```ts
const { data, error } = await supabase
  .from("programs")
  .select(
    "university:universities!inner(slug, status, country:countries!inner(is_launched)), subject:subjects!inner(slug)",
  )
  .eq("status", "published")
  .eq("subject.slug", subjectSlug)
  .eq("university.status", "published")
  .eq("university.country.is_launched", true);
  // no .range()
```

Same missing pagination, scoped to one subject — exceeds the cap only for
`business` (1,141 programs). Lower severity than the other three instances
because the result is deduped into a `Set` of university slugs for the
course-match quiz's subject filter, and with only 308 universities total it's
likely (not certain) that every university teaching business has at least
one of its business programs land inside the first 1000 rows even though 141
rows are dropped. Still worth the same fix for correctness and because "likely
fine" isn't something to leave unverified in a quiz result.

### `getProgramsForOccupation()` in `public-occupations.ts` — confirmed actively truncating today, not just at risk

```ts
export async function getProgramsForOccupation(
  occupationSlug: string,
): Promise<OccupationProgram[]> {
  const supabase = createPublicClient([`occupation-programs:${occupationSlug}`]);
  const { data, error } = await supabase
    .from("program_occupations")
    .select(...)
    .eq("occupation.slug", occupationSlug)
    .eq("occupation.status", "published")
    .eq("program.status", "published")
    .eq("program.university.status", "published")
    .eq("program.university.country.is_launched", true);
    // no .range() — single unpaginated call, scoped to one occupation
```

This is the reverse lookup that powers "every program leading to this
occupation" on each `/occupations/[slug]` page — explicitly called out in
this function's own comment as "the one thing a migration-agent SOL page
can't copy without our program database," i.e. the site's actual competitive
edge for these pages. I checked per-occupation link counts directly:

```
management-accountant-221112:    1,149 linked programs
taxation-accountant-221113:      1,149
external-auditor-221213:         1,149
accountant-general-221111:       1,149
company-secretary-221211:        1,149
internal-auditor-221214:         1,149
registered-nurse-community-health-254414:  963  (safe, for now)
dietitian-251111:                          963  (safe, for now)
```

**Six occupation pages are over the 1000-row cap right now**, each silently
missing ~149 real university/program listings. This isn't a future risk like
some of the instances above — it's live today, and it very likely explains
at least part of the "occupation page lengths wildly uneven (647–6,089
words)" finding from the earlier SEO audit, though that audit attributed it
to "degree-table bloat" rather than truncation — both can be true
simultaneously (some pages bloated with real long lists, six specific ones
truncated below their real length).

## Recommended fix

1. Add `.range()` pagination to all five affected functions —
   `listPublishedSubjects()`, `getSubjectBySlug()`, `listCollectionUniversities()`
   (the `progs` query), and `universitySlugsForSubject()` — following the
   existing pattern already used in `listPublishedProgramsForSitemap()` and
   `listOccupationSlugsWithPrograms()`. Do this **before or together with**
   Finding 1's degree-level filter fix for `listCollectionUniversities()`,
   since both bugs live in the same query.
2. Add `.order("id")` to `listOccupationSlugsWithPrograms()`'s existing
   `.range()` loop — same one-line fix already applied to the programs
   sitemap query.
3. Worth a quick repo-wide check for any other `.select()` against a table
   that can exceed 1000 rows (`programs`, `program_occupations`, and watch
   `deadlines` too as it grows past 1000) without either an explicit
   `.limit()` under 1000, `count: 'exact', head: true` (safe — see below), or
   full `.range()` pagination.
4. Note: `getHomepageStats()` in `public-stats.ts` uses
   `{ count: "exact", head: true }` for its program/university/deadline
   counts — this is the *correct* pattern (PostgREST returns the true total
   via the response header without returning row data, so it isn't subject
   to the 1000-row cap at all). The homepage's headline numbers are accurate;
   flagging this only so the fix to the four broken functions above follows
   the same safe pattern where a plain count is all that's needed, and full
   `.range()` pagination where actual row data is needed.

## Pages affected

- `/study` index — subject counts/tuition figures wrong for every subject
- `/study/business` specifically — ~141 real programs silently missing from
  the comparison table and tuition stats (the only subject over the cap)
- `/best/affordable-australian-universities-for-international-students`,
  `/best/cheapest-universities-in-{city}` (all 6), and
  `/best/group-of-eight-universities-in-australia` — "first-year budget"
  figures computed from an incomplete, arbitrarily-ordered ~14% sample of
  programs, on top of Finding 1's degree-level issue
- `/quiz` and `/quiz/results` — budget filter (via the same
  `listCollectionUniversities()` bug) and, to a lesser extent, the subject
  filter for business specifically
- `/sitemap.xml` occupation entries — small, growing risk of a real occupation
  page being dropped or miscounted after any future large `program_occupations`
  reseed, same failure class as the already-fixed programs-sitemap bug
- `/occupations/management-accountant-221112`, `/occupations/taxation-accountant-221113`,
  `/occupations/external-auditor-221213`, `/occupations/accountant-general-221111`,
  `/occupations/company-secretary-221211`, `/occupations/internal-auditor-221214`
  — each currently missing ~149 real linked programs from their page today,
  not just at theoretical risk

## Scope check performed

Checked every `.from("programs")` and `.from("program_occupations")` call
across `src/lib/queries/` (17 call sites total). The ones not listed above
(program-detail single-row lookups, admin slug-uniqueness checks, one
per-university programs list capped at 327 rows for the largest university)
are scoped narrowly enough to never approach the 1000-row cap and don't need
a fix. This list is exhaustive for those two tables as of 2026-09-13 — a
future table crossing 1000 rows (`deadlines` is at 473 and growing) should
get the same check before it becomes the next surprise.

---

# Finding 3: every published scholarship is missing `deadline_date` — a data gap, not a code bug

## The finding

The external SEO audit that kicked off this whole investigation claimed
"scholarship pages omit the deadline and value fields." I checked the
`/scholarships/[slug]` template earlier and that claim was **wrong as
stated** — the template already renders both `s.deadline_date` and `s.amount`
correctly, conditionally, exactly as it should.

But I checked the underlying data directly, and the audit's underlying
*instinct* was right for the wrong reason:

```sql
select count(*) from scholarships where status='published';        -- 46
select count(*) from scholarships
  where status='published' and deadline_date is null;              -- 46
```

**Every single published scholarship (46 of 46) has `deadline_date = NULL`.**
`amount` is well-populated across all 46 — this is not a general data-quality
problem with the scholarships table, it's a total, 100% gap in exactly one
field, on a site whose stated differentiator is verified dates and values.

## The efficient way to close it

I checked whether this needs 46 rounds of fresh research, and it doesn't —
the 46 scholarships split cleanly into two groups with very different fix
costs:

```sql
select separate_application, count(*) from scholarships
  where status='published' group by 1;
-- separate_application = false: 30
-- separate_application = true:  16
```

- **`separate_application = false` (30 of 46, ~65%):** these are automatic
  scholarships applied on the strength of your admission application — no
  separate form. Their real "deadline" **is the university's own admission
  deadline**, which this site already sources and verifies in the `deadlines`
  table (`scholarship_universities` already joins each of these to its
  university). This is a **join, not new research**: either populate
  `deadline_date` from the matching university/degree-level deadline row, or
  — probably better for pages where a scholarship spans multiple degree
  levels — change the page to say "Apply by your program's application
  deadline" and link directly to that university's `/deadlines` page instead
  of forcing a single date into a field that doesn't cleanly fit.
- **`separate_application = true` (16 of 46):** these genuinely have their
  own external deadline (a separate form, sometimes a different body
  entirely — e.g. Australia Awards, Destination Australia). These 16 need
  real per-scholarship verification, the same rigor as any other "add
  content" task (see [[add-content-prompt]]).

## Recommended fix

1. For the 30 `separate_application = false` rows: a data-join fix, not a
   research task — either backfill `deadline_date` from each scholarship's
   linked university's deadline data, or (likely cleaner) change the
   template to show "Ties to your program's application deadline" with a
   link, for scholarships where a single date doesn't make sense across
   multiple degree levels.
2. For the 16 `separate_application = true` rows: genuine research needed,
   one at a time, verified against each scholarship's own official page.
3. Either way, this is worth doing before or alongside any content-brief
   work on scholarship pages, since it's higher-leverage than rewriting copy
   around a field that's currently empty on every single row.

## Pages affected
- All 46 `/scholarships/[slug]` pages
- `/scholarships` index (likely also expects/shows deadline data)
