# Content briefs queue

Research-backed briefs for pages worth writing or rewriting, generated via
SERP/competitor analysis against the site's actual data and structure. Each
brief is self-contained — hand the relevant section to whoever (or whichever
agent) is writing the page.

---

## Brief: Best Business Schools in Australia

Target: improve the existing page at
`/best/best-australian-universities-for-business` (currently ~950 words,
position 59 for its target query despite the business/MBA cluster being the
single biggest impression theme on the site per GSC — see
`memory/gsc-analysis-2026-09-07.md`).

### Search Intent
Commercial investigation. Searchers are prospective postgrad/MBA applicants
comparing Australian business schools before shortlisting. Google rewards
ranked-list/comparison format — every real competitor is a top-N listicle,
several with per-school fee tables.

### Competitor Analysis

| # | URL | Key H2 Sections | Est. Words | Score | Main Gap |
|---|-----|-----------------|------------|-------|----------|
| 1 | amberstudent.com/blog/post/best-business-schools-in-australia | 10 schools, FAQ, TOC | ~2,900 | 24/40 | Fee data dated to 2023; narrative-only, no comparison table |
| 2 | mbagradschools.com (best-business-schools-australia) | 5 schools + degree types, costs, scholarships, applying | ~2,800 | 27/40 | No FAQ, no table; strong breadth but no per-school entry requirements |
| 3 | timeshighereducation.com (best-universities-business-degrees) | THE ranking table (36 unis, 6 metrics) | ~1,200 | 22/40 | No fees, no entry requirements, no career outcomes, no accreditation |
| 4 | gostudyin.com/best-business-schools-australia | (blocked from fetch — unscored placeholder) | ~2,000 (est.) | — | Education-agency competitor, likely lead-gen focused |
| 5 | **wheretoapply.xyz/best/best-australian-universities-for-business** (current) | 6 schools, "how this list was built" | ~950 | 14/40 | Half the depth of any real competitor; no FAQ, no entry requirements, no deadlines, no PR/career angle |

### Content Gaps and Opportunities

**Topic gaps:**
- Post-study work visa / PR pathway tied to business & management occupations specifically — nobody ties it to actual ANZSCO codes the way this site's `program_occupations` data can.
- Real application deadlines per MBA intake — none of the competitors show this at all.
- A single at-a-glance comparison table (tuition + duration + accreditation + GMAT/work-experience + intake dates) — nobody has all of these in one table.

**Depth gaps:**
- Entry requirements covered once at page level by mbagradschools, never per-school.
- MBA vs. Master of Business vs. Bachelor of Business blended together by every competitor despite GSC showing both query types ("deakin mba" vs. "best australian universities for business").

**Quality gaps:**
- Amberstudent's fee figures are stamped "(2023)" — 3 years stale.
- The current page's "accreditation over league-table rank" editorial stance is good and worth keeping.

### Winning Outline

**H1:** Best Business Schools in Australia for International Students (2027 Intake)
**URL Slug:** /best/best-australian-universities-for-business (keep existing — don't 301)
**Target Word Count:** ~2,200 words (competitor avg: ~2,225; current: ~950)

1. **Intro** (120–150 words) — primary keyword in first sentence, lead with the accreditation-over-rankings method.
2. **H2: MBA or business degree — which are you looking for?** (100–150 words, new) — distinguishes MBA (work-experience-gated) from Master/Bachelor of Business (coursework). Secondary keyword "MBA in Australia" here.
3. **H2: At-a-glance comparison table** (FS target) — University | Program | Tuition (2027) | Duration | Accreditation | Entry requirement | Next intake deadline. Highest-leverage addition — no competitor has this.
4. **H2: The best Australian universities for business** (expand 6 → 8–10 schools: add ANU, UTS, QUT, Australian Institute of Business — GSC shows "aib mba cost" as a real unserved query). ~130–160 words per school, one secondary keyword each, link to that school's Bond-standard MBA program page where indexable, else its `/universities/[slug]` profile.
5. **H2: Career outcomes and the PR pathway** (200–250 words, new) — ANZSCO occupation ties via existing occupation-pathway data. Real information-gain section.
6. **H2: Entry requirements at a glance** (150–200 words, bullet/mini-table) — GMAT/GRE waivers, work-experience thresholds, IELTS bands.
7. **H2: How this list was built** (keep verbatim — legitimate trust signal).
8. **H2: FAQ** (3–5 Qs, FS target on Q1) — e.g. "Do I need work experience for an MBA in Australia?", "How much does an MBA cost in Australia for international students?", "Can I get PR after an MBA in Australia?"
9. **H2: Other decision guides** (keep — existing internal-linking section).

### Recommended Meta Tags

**Title:** Best Business Schools in Australia 2027 | Fees & Entry
**Meta Description:** Compare Australia's top business schools by tuition, entry requirements, accreditation, and application deadlines — verified data, updated for 2027 intake.

### Unique Angle and Information Gain
(1) One table joining tuition + accreditation + entry bar + sourced application deadlines — no competitor has this combination. (2) A career-outcomes section tying business/management study to specific skilled-migration occupation codes, from this site's own `program_occupations` data. (3) Fee data current to 2027 against a competitor set where the most detailed rival is citing 2023 figures.

### E-E-A-T Requirements
- "Last verified [date]" stamp on the comparison table
- `Where To Apply editorial team` byline
- Name the accreditation bodies (AACSB/EQUIS/AMBA) with what they mean, not just as a badge list
- Source note on tuition figures (university's published fee schedule + check date)

### Internal Linking Opportunities
- Each university H3 → its MBA program page (where Bond-standard/indexable) or `/universities/[slug]` profile
- "Application deadline" mentions → `/deadlines` and `/universities/[slug]/deadlines`
- PR pathway section → `/occupations` hub and specific occupation pages
- "MBA or business degree" intro → `/study/business`
- FAQ PR question → the relevant post-study work visa page, or `/visas` hub if that page isn't ranking well

---

## Brief: Cheapest Nursing Courses in Australia

Target: new page at `/best/cheapest-nursing-courses-in-australia-for-international-students`.

**Prerequisite before this ships:** confine the ranking to literal Bachelor
of Nursing-titled programs at degree-granting universities. Checked
`programs.json` directly — 38 real Bachelor of Nursing programs exist,
tuition AUD 29,000–50,700, clean data. The subject-bucket data-quality
problem that got the other 3 subject `/best` pages deferred (see
[[DATA-QUALITY-FINDINGS]] Finding 1) does not block this specific page,
because nursing's registration requirements mean TAFEs/pathway colleges
don't grant the bachelor's degree itself — but the *live*
`/study/nursing-and-health-sciences` page currently ranks a Greenwich College
diploma at AUD 8,500 above every real nursing degree in its own "60
lowest-tuition" table. That page should get the Finding-1 fix before or
alongside this new page launching, so the site isn't making the mistake on
one page while avoiding it on another.

### Search Intent
Commercial investigation, high urgency — searchers have already chosen
nursing and are cost-shopping, filtered by RN (Bachelor) vs EN (Diploma)
credential. SERP format rewarded: long-form guide (3,500–4,000 words in
competitors) with a comparison table + FAQ.

### Competitor Analysis

| # | URL | Key Sections | Est. Words | Score | Main Gap |
|---|-----|---------------|------------|-------|----------|
| 1 | terratern.com (cheapest-nursing-courses) | Course types, top institutes, top-5 table, eligibility, scholarships, careers | ~3,800 | 29/40 | India-specific framing; fee table lacks accreditation detail |
| 2 | aeccglobal.com (affordable-nursing-courses) | Pathways table, 7 university breakdowns, eligibility, careers, salary table | ~3,800 | 31/40 | Strongest structure — clear diploma/bachelor split, salary table |
| 3 | **wheretoapply.xyz/study/nursing-and-health-sciences** (adjacent existing page) | Compare programs (flat 60-row table), universities, entry requirements, FAQ | ~1,300 | 18/40 | Table blends diploma and bachelor's tuition unlabeled — the defect competitors avoid; no dedicated "cheapest" page exists |

### Content Gaps and Opportunities

**Topic gaps:** PR/occupation-pathway specificity via ANZSCO codes (this
site's `program_occupations` data — no competitor has this); real sourced
application deadlines per nursing program (no competitor shows this at all).

**Depth gaps:** the exact NMBA English-band requirement (IELTS 7.0
listening/reading/speaking, 6.5 writing) already lives on this site's
`/study/nursing-and-health-sciences` page and is more precise than any
competitor's generic "high IELTS score" language — reuse it.

**Quality gaps:** both real competitors already cleanly separate
Diploma-of-Nursing (Enrolled Nurse) pricing from Bachelor-of-Nursing
(Registered Nurse) pricing — this site's adjacent page currently fails to do
that (see prerequisite above); the new page must not repeat the mistake.

### Winning Outline

**H1:** Cheapest Nursing Courses in Australia for International Students (2027 Intake)
**URL Slug:** /best/cheapest-nursing-courses-in-australia-for-international-students
**Target Word Count:** ~2,600 words (competitor avg: ~3,800 — win on precision/tables, not length)

1. **Intro** (120–150 words) — primary keyword first sentence; state the methodology (real Bachelor of Nursing degrees only, sourced, dated).
2. **H2: Diploma of Nursing vs. Bachelor of Nursing — what you're actually comparing** (150–200 words, new) — EN vs RN, different NMBA registration outcome. Prevents repeating the Greenwich College mistake.
3. **H2: The cheapest Bachelor of Nursing degrees for international students** (table, FS target) — University | Program | Tuition (2027) | Duration | Next intake deadline, from the 38-program dataset.
4. **H2: NMBA English requirements** (100–150 words) — the precise IELTS bands, sourced, reused from the subject page.
5. **H2: Nursing and the permanent residency pathway** (200–250 words) — ANZSCO code + list status via `/occupations` data.
6. **H2: Entry requirements beyond English** (150 words, bullets) — academic prerequisites, clinical-placement checks (police check, vaccination).
7. **H2: How this list was built** (trust-signal convention, matches other `/best` pages).
8. **H2: FAQ** (4–5 Qs, FS target Q1) — reuse the 3 existing FAQ entries from `/study/nursing-and-health-sciences`, add: "Is a Diploma of Nursing cheaper than a Bachelor of Nursing?", "Can I work as a nurse in Australia after an overseas diploma?"

### Recommended Meta Tags
**Title:** Cheapest Nursing Courses in Australia 2027 | Fees
**Meta Description:** Compare the real cost of Bachelor of Nursing degrees in Australia for international students — verified tuition, entry requirements, and PR pathway.

### Unique Angle and Information Gain
(1) A ranking scoped to real Bachelor of Nursing degrees only, avoiding the diploma/degree price-blending neither this site's adjacent page nor any competitor fully solves; (2) the exact NMBA English-band requirement, stated precisely; (3) the ANZSCO-coded PR pathway tied to this site's occupation dataset.

### E-E-A-T Requirements
- "Last verified [date]" on the tuition table
- `Where To Apply editorial team` byline
- Cite NMBA by name for the English-requirement figures
- Source note on tuition (each university's published fee schedule + check date)

### Internal Linking Opportunities
- "Diploma vs. Bachelor" section → `/study/nursing-and-health-sciences` (fix its cost table first/alongside)
- Each university row → its nursing program page or `/universities/[slug]` profile
- PR pathway section → `/occupations` hub and the Registered Nurse occupation page
- "Next intake deadline" column → `/deadlines`

---

## Brief: Study in Australia from Malaysia (Improve)

Target: `/international/malaysia` (existing, ~2,200 words, meta title "Study
in Australia from Malaysia: Cost & Visa 2026"). GSC: "study in australia for
malaysian" pos 28.6, "malaysian study in australia" pos 28 — real, close-ish
demand.

### Search Intent
Informational-to-commercial hybrid — Malaysian students researching Australia
specifically, often already comparing it against a twinning/pathway program
staying partly in Malaysia. Competitors run 3,500–8,500 words with dedicated
visa/cost/scholarship sections.

### Competitor Analysis

| # | URL | Key Sections | Est. Words | Score | Main Gap |
|---|-----|---------------|------------|-------|----------|
| 1 | eduadvisor.my (study-abroad-australia-guide) | System overview, cost, scholarships, applying, post-grad | ~8,500 | 30/40 | Very long but well-targeted; strong on twinning pathways and named Malaysian scholarships |
| 2 | idp.com/malaysia/study-abroad/study-in-australia | 2027 intake update, entry reqs, visa, cost, scholarships, FAQ | ~3,500 | 28/40 | Maps STPM/UEC to entry requirements explicitly; no MYR conversion, no twinning content |
| 3 | **wheretoapply.xyz/international/malaysia** (current) | At a glance, applying, costs, quals/English, visa, after graduation, popular fields, FAQ (9 Qs) | ~2,200 | 26/40 | Strong visa/cost depth + MYR conversion (a real edge), but no twinning-pathway content, no named Malaysian scholarships |

### Content Gaps and Opportunities

**Topic gaps:** twinning/pathway programs (Foundation/Diploma in Malaysia →
credit transfer to Australia via Monash Malaysia, Curtin Malaysia, Swinburne
Sarawak — already namechecked on the page but never explained; the single
highest-value addition, since it's the defining behavior pattern for this
market); named Malaysian scholarships (JPA, Petronas, Khazanah, Bank Negara,
Sime Darby, MAAC) — current page only says scholarships are "available," no
names; STPM/UEC → Australian entry-requirement mapping.

**Quality gap:** the current page's AUD 2,500 visa fee (post-1 July-2026
rise) is more current than at least one figure floating in the general
SERP — verify competitors haven't since updated before claiming this as a
differentiator in final copy.

### Winning Outline (additions only — keep everything else as-is)

**Keep/strengthen:** "At a glance," "What it costs" (MYR figures already a strength), "The student visa" (Evidence Level 1 detail already strong), "After you graduate," existing 9-Q FAQ.

1. **H2: Pathway and twinning programs — studying part of your degree in Malaysia first** (250–300 words, new) — explain the Foundation/Diploma-in-Malaysia → credit-transfer model via the campuses already named on the page.
2. **H2: Matching your Malaysian qualification to Australian entry requirements** (150–200 words, new, table, FS target) — STPM / UEC / A-Level → typical bachelor's entry requirement.
3. **H2: Scholarships for Malaysian students** (150–200 words, expand existing passing mention) — name JPA, Petronas, Khazanah, MAAC specifically; cross-link `/scholarships`.
4. **FAQ additions (2 new):** "Can I transfer credit from a Malaysian diploma to an Australian university?", "What STPM or UEC result do I need for an Australian bachelor's degree?"

### Recommended Meta Tags
**Title:** Study in Australia from Malaysia: Cost, Visa & Pathways 2027
**Meta Description:** Costs in MYR, the subclass 500 visa, twinning pathways via Monash/Curtin/Swinburne Malaysia, and named scholarships — a complete guide for Malaysian students.

### Unique Angle and Information Gain
(1) Twinning/pathway content tied to branch campuses already named but never explained; (2) a direct STPM/UEC-to-Australian-entry table combined with the MYR-cost context this page already has — beats either competitor alone; (3) named Malaysian scholarship bodies rather than a generic mention.

### E-E-A-T Requirements
- "Last verified [date]" on cost/visa figures
- Source note for the STPM/UEC equivalency table
- `Where To Apply editorial team` byline

### Internal Linking Opportunities
- Twinning section → `/universities/monash-university`, `/universities/curtin-university`, Swinburne's profile
- Scholarships section → `/scholarships`
- Entry-requirement table → relevant `/study/[subject]` pages already listed on the page
- Visa section → `/visas/student-500` and `/visas/485`

---

## Brief: University Application Fee (template addition)

**⚠️ Deferred — see memory `application-fee-brief-deferred-2026-09-13`: university
data is still mid-population (Bond-standard build-out rotation). Don't
implement until that settles; Roman asked to be reminded then.**

Target: not a single URL — a template-level addition across all ~47
`/universities/[slug]/deadlines` pages. GSC: "university of sydney
application fee" and "university of melbourne application fee" at position
8–13 with high volume — these pages already rank decently for the adjacent
deadline intent; the fee-specific variant is unserved on the same page. Cheap
brief: the data already exists (`application_fee` column, already used by
`/best/australian-universities-with-no-application-fee`), it just isn't
surfaced on the page that's already ranking for this cluster. Confirmed
directly: the live University of Sydney deadlines page has zero mention of
its AU$150 non-refundable application fee.

### Search Intent
Transactional-adjacent informational — single-fact intent, direct-answer format.

### Competitor Analysis

| # | URL | Format | Score | Main Gap |
|---|-----|--------|-------|----------|
| 1 | sydney.edu.au (official) | Official fee page | 30/40 | Authoritative but buried in site navigation |
| 2 | collegedunia.com / shiksha.com (directory aggregators) | Generic profile, fees+rankings+admissions mashed together | 18/40 | Low editorial quality, easy to beat |
| 3 | **wheretoapply.xyz/universities/university-of-sydney/deadlines** (current) | Deadlines only, no fee | — | Fee entirely absent despite already ranking pos 8-13 |

### Winning Outline (template-level addition)

**H2: [University] application fee** (40–80 words, FS target) — amount, currency, refundability, payment timing. Omit entirely where `application_fee` is unverified for a given university — don't show a placeholder.

**FAQ addition (1 new Q):** "How much does it cost to apply to [University]?"

### Unique Angle and Information Gain
An accurate, sourced application fee on the exact page already ranking for the adjacent deadline query — pairing data neither the university's own site (buried) nor directory aggregators (noisy, low-trust) currently combine with deadline data in one place.

### E-E-A-T Requirements
- Source note/link to the university's own fee page + "last verified" date
- Only publish where the fee is verified — no estimates

### Internal Linking Opportunities
- New fee section → `/best/australian-universities-with-no-application-fee` for universities that waive it

### Implementation note
This is an engineering/data ticket more than a writing task: check how many of the ~47 universities already have `application_fee` populated, add the section conditionally on that field being non-null, backfill only where verifiable. **On hold per the deferral note above.**

---

## Brief: Named country-specific scholarships (template addition to `/international/[country]`)

Target: not a single URL — a recurring gap across the 24 `/international/[country]`
pages, found while checking Vietnam as a candidate for a full rewrite brief
(it turned out not to need one — see note below).

### Why this, not a full Vietnam rewrite
I fetched `/international/vietnam` expecting the same kind of gap Malaysia
had (twinning programs, named scholarships). It's actually already a strong
page — 2,200 words, precise Evidence Level 2 detail, accurate degree-
recognition facts, and a genuinely good "are there visa scams targeting
Vietnamese students" FAQ that a real competitor (duhocrightway.com, ~4,300
words) doesn't have at all. Forcing a full rewrite brief onto an
already-solid page would be lower value than it looks.

But one specific gap repeats identically on both pages I checked: **neither
Malaysia's nor Vietnam's page names a single specific scholarship.** Both say
scholarships are "available" or "referenced" with zero names. This is likely
systemic across most of the 24 country pages, not a one-off, and it's a real
gap — country-specific bilateral scholarship programs are well known and
exist in your own data already:

- Vietnam: Australia Awards has a long-running, well-known Vietnam-specific
  cohort — and `australia-awards-scholarships` already exists as a published
  row in this site's `scholarships` table (confirmed while investigating
  Finding 3 in `DATA-QUALITY-FINDINGS.md`).
- Malaysia: JPA, Petronas, Khazanah, Bank Negara, Sime Darby, MAAC (per the
  Malaysia brief above) — not yet in this site's `scholarships` table, would
  need adding.

### Recommended approach
Rather than one bespoke brief per country, treat this as a template pattern:
for each `/international/[country]` page, add a short **"Scholarships for
[nationality] students"** section (100–150 words) naming 2–4 real,
verifiable programs — prioritizing ones already in this site's `scholarships`
table (like Australia Awards for Vietnam) so the link target already exists,
and only adding new `scholarships` rows for country-specific programs
(like Malaysia's JPA/Petronas/Khazanah set) where they're genuinely
significant and verifiable.

### Winning pattern (per country page)

**H2: Scholarships for [nationality] students** (100–150 words)
- Name 2–4 real programs: government-to-government (Australia Awards, where
  the country has an active cohort), major national scholarship bodies, and
  any australia-side scholarships this site already tracks that are commonly
  used by students from that country.
- Link to `/scholarships/australia-awards-scholarships` (or the relevant
  existing slug) where applicable, and to `/scholarships` generally otherwise.

### Rollout order
Prioritize countries with the highest GSC impressions first (per
[[gsc-analysis-2026-09-07]]: Bhutan, Cambodia, Kenya, Myanmar, Nigeria, South
Korea, Hong Kong, Japan, Taiwan, Thailand are the ones currently on page 1,
pos 6-8 — a scholarship-naming pass there strengthens already-working pages
rather than starting from zero). Do Vietnam and Malaysia as part of this pass
too, using the specific programs already identified in this brief and the
Malaysia brief above.

### Unique Angle and Information Gain
Named, verifiable, country-specific scholarship programs where every competitor checked so far (across both the Malaysia and Vietnam research) only gestures at "scholarships are available" with no names — a small addition, but one every competitor in this niche is apparently skipping.

### E-E-A-T Requirements
- Only name a scholarship if it can be verified as currently active for that nationality — don't list a defunct or generic program
- Link to the official scholarship body's page alongside any internal `/scholarships` link

### Internal Linking Opportunities
- → `/scholarships/[slug]` for any program already in this site's database
- → `/scholarships` hub as a fallback where no specific internal page exists yet

---

*(Add further briefs below as they're generated.)*
