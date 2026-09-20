# UNDA program build-out sprint briefing (shared context for all batch agents)

Worktree: /Users/romanlama/Desktop/nd-buildout (branch nd-program-buildout, already checked out).
cd there before anything. Do NOT touch /Users/romanlama/Desktop/educational-website or any other worktree.
`.env.local` is already present with DATABASE_URL. `pg` and `dotenv` are already installed in node_modules.

## Your job
You are one of five parallel batches in a "Bond-standard program build-out" sprint for University of Notre
Dame Australia (nd.edu.au / notredame.edu.au) on the Where To Apply educational website. You are assigned a
specific list of published `programs` rows (ids + names given in your task prompt). For EACH row in your
list you must reach one of three outcomes:
1. **Bond-standard**: all four of `description`, `curriculum`, `admission_requirements`, `english_requirements`
   are populated with REAL text you sourced from an actual notredame.edu.au page you fetched.
2. **Archived**: you found specific, citable evidence (a URL, a "discontinued"/"not currently offered"
   statement, or a decisive absence across every naming variant you tried) that the row does not correspond
   to any course UNDA currently offers. Cite the evidence in the archive reason string.
3. **Honest-null exception** (rare, last resort): you found and wrote real description/curriculum/admission
   text but a genuine, verifiable absence of any English-requirement figure on the university's own site
   (e.g. a research-only higher degree). Do NOT use this as a way to skip English-requirement research -
   check the global English-requirements page (see below) first, since most programs' figure lives there,
   not on the program's own page.

**NEVER invent content.** Do not write plausible-sounding curriculum unit names, admission ATAR/IELTS figures,
or descriptions from general knowledge of "what a typical Australian degree looks like". This project has
caught real fabrication in SIX prior university sprints (most recently James Cook University) where an
"already Bond-standard" row turned out to have templated, copy-pasted, or invented content. Every fact you
write must trace to text you actually read on a real page.

**IMPORTANT: 11 of these 67 rows are already marked "Bond-standard" in the DB from a prior pass.** Spot-checks
already done this sprint found real fabrication in at least 2 of them (Bachelor of Nursing: wrong source_url,
completely invented curriculum unit names that don't match any real NURS-coded unit; four other rows used a
literally broken `/study/find-a-course` URL as source_url, including one, "Juris Doctor", for a program that
doesn't appear to exist at all). If any of your assigned rows are already marked Bond-standard, RE-VERIFY them
against the live site the same as any other row - do not assume they're fine.

## Site technique (already confirmed this sprint, use it directly, don't rediscover)
- The real, working domain is `https://www.notredame.edu.au` (apex `nd.edu.au` and bare `notredame.edu.au`
  are Cloudflare-gated and unreliable). The site IS Cloudflare-gated against plain `curl`, but a real browser
  tab's `fetch()` (same-origin, `credentials:'include'`) passes through fine once the tab has loaded the site
  once. Use the Browser Pane tools (navigate once to warm up, then `javascript_tool` with `fetch()` calls) -
  this is much faster than clicking through pages one at a time.
- `scripts/data/nd_sitemap_programs.json` in this worktree is a pre-built list of ~250 real
  `/programs/...` URLs pulled from `https://www.notredame.edu.au/sitemap.xml`. `scripts/data/nd_url_index.json`
  is a name-to-URL best-guess mapping already built for all 67 rows (some are `null` or "NEEDS_RESEARCH" -
  those are the ones most likely to need archiving or extra digging; verify, don't just trust the ones that
  do have a URL either).
- A `/programs/.../undergraduate/<slug>` or `/programs/.../postgraduate/<slug>` page is mostly server-rendered
  (plain `fetch()` gets the real content, no JS execution needed) and uses a single-page "scrollspy" layout:
  anchors like `id="first-year"`, `id="second-year"`, `id="third-year"`, `id="admission_criteria"` mark
  sections that are ALL already in the raw HTML (not lazy-loaded). Fetch the raw HTML, strip tags, and grab
  text following each anchor id to get real per-year unit lists (real unit codes like `NURS1037 Foundations
  of Nursing`) and the real admission-criteria prose (ATAR/selection rank, non-Year-12 pathways).
- Program pages do NOT publish per-course IELTS/English figures themselves (checked Bachelor of Nursing's raw
  HTML: zero "ielts" hits). The real English-language requirements live on:
  `https://www.notredame.edu.au/study/applications-and-admissions/admission-requirements/english-language-proficiency-requirements`
  This page IS client-rendered (a plain fetch just gets nav-shell text, "Looks like you have JavaScript
  disabled") so you must `navigate` there in the Browser Pane and use `get_page_text` (works, confirmed).
  It sets a general secondary/tertiary-equivalency system (not a single flat IELTS number for most programs)
  plus explicit numbered EXCEPTIONS for named professional-accreditation programs:
  - School of Arts and Sciences exception (Master of Counselling, Master of Social Work (Qualifying)): IELTS
    Academic 7.0 overall, no band below 7.0; OET B all sections; PTE 65/65; TOEFL iBT figures given.
  - School of Education exception (Bachelor of Education Conversion/Early Learning/Primary/Secondary +
    any double degree or Master of Teaching): AITSL standard - IELTS average 7.5 across 4 skills, no skill
    below 7.0, speaking+listening no less than 8; PTE 71 overall (65 reading/77 writing/69 listening/88
    speaking); ISLPR Level 4.
  - The page's intro paragraph explicitly names further exceptions with their OWN separate pages/policies:
    Doctor of Medicine, accredited Nursing and Midwifery programs, Bachelor of Physiotherapy/Occupational
    Therapy/Clinical Exercise Physiology. For Nursing specifically there's a dedicated page,
    `https://www.notredame.edu.au/forms/admissions/nursing-elr` (also client-rendered, navigate+get_page_text),
    which says the ANMAC/NMBA sets the real standard and points to the Nursing and Midwifery Board of
    Australia's own English language skills registration standard - the real, current NMBA standard (used
    correctly at James Cook University's prior sprint) is IELTS 7.0 overall with each of listening/reading/
    speaking at 7.0 and writing at no less than 6.5 (an asymmetric standard, NOT a flat "no band below X").
    Physiotherapy/OT/Medicine likely have their own equivalent professional-body pages or PDFs - search for
    them (try `/forms/admissions/<program>-elr` pattern, or check the program's own page for an "Admission
    criteria" tab link) rather than assuming; if you can't find a program-specific figure after a real search,
    fall back to citing the general table's relevant tier and note in your writeup which you used.
  - For programs with NO named exception (most Business/Arts/Science/Law/Philosophy/Theology bachelor's and
    coursework master's degrees), the general secondary/tertiary-equivalency table applies - there may not be
    a single "IELTS overall X" figure to quote; it is legitimate (not a gap) to write the english_requirements
    field as an accurate paraphrase of the real equivalency system (e.g. "Completion of an Australian Year 12
    with English, OR 2+ years of tertiary study taught in English, OR an accepted English test - IELTS
    Academic 7.0 overall with no band below 7.0, OET B, PTE 65/65, TOEFL iBT 94" - PULL THE ACTUAL FIGURES
    from the page, don't guess) rather than fabricating a program-specific number that doesn't exist.
- Multi-campus note: UNDA runs Fremantle (WA, main), Sydney (NSW, mostly Medicine/Health/Law), and Broome (WA,
  small Indigenous-focused). A course page sometimes shows a campus toggle ("Fremantle / Sydney"); if content
  differs by campus, source from whichever campus is the primary/international-facing one for that course
  (usually Fremantle, except Medicine/some Health/Law which are Sydney-heavy) and don't let campus-restriction
  become an excuse to skip a row.
- Zero em dashes (—) and zero en dashes (–) allowed anywhere in written content (house rule, enforced by
  `apply_fed_content.mjs`'s validator) - use commas or "to" instead.

## How to write your results
1. Build a JSON array of `{ id, description, curriculum, admission_requirements, english_requirements,
   source_url }` (only include fields you're setting; all four content fields required for a row you're
   marking Bond-standard) and save it to `scripts/data/_nd_fix_<yourbatchletter>.json` (e.g. `_nd_fix_a.json`).
2. Dry-run: `node scripts/apply_fed_content.mjs scripts/data/_nd_fix_<letter>.json` (validates no em/en
   dashes, shows what would change). Then commit for real: add `--commit`.
3. For archives: `node scripts/archive_programs.mjs <id> "specific cited reason" [<id2> "reason2" ...] --commit`
   (dry run without `--commit` first). Reasons must cite real evidence (a checked URL that 404s, an explicit
   "no longer offered" statement, or "no course of this name found across N naming variants checked, nearest
   real offering is X which is a distinct row/doesn't exist as a standalone award").
4. Do NOT run `node scripts/export_programs.mjs`, do NOT `git add`/`git commit`/`git push`, and do NOT edit
   `ND_SPRINT_BRIEFING.md` or other batches' files - the coordinating session will do the final export, git
   commit, and PR after all five batches report back. Just get your assigned rows to a real, non-fabricated
   resolution in Postgres.
5. When done, report back: for each assigned row, its name and final outcome (Bond-standard / archived with
   reason / honest-null with reason), plus anything you found that the coordinator should double check
   (e.g. a row that seems like a duplicate of another row in a DIFFERENT batch, or a genuine data conflict
   between two official UNDA pages).

## Known open questions to resolve as part of your batch (if any fall in your assigned list)
- "Master of Primary Teaching" and "Master of Teaching (Primary)" both map to the same real URL
  (`/programs/school-of-education/postgraduate/master-of-primary-teaching`) - likely one is a duplicate
  DB row under a variant name. If both are in the SAME batch, resolve it (build the one whose name matches
  the real page title, archive the other as a duplicate, citing this). If they're split across batches, flag
  it clearly in your report instead of guessing.
- "Bachelor of Education (Primary)" vs "Bachelor of Primary Education" are BOTH separate published rows -
  investigate whether one is a legacy/duplicate name (the real program-code page found this sprint is titled
  "Bachelor of Primary Education", program code 3587).
- Rows with no real URL match found yet during initial research (Bachelor of Behavioural Science, Bachelor
  of Business Administration, Bachelor of Health Promotion, Bachelor of Human Resource Management, Bachelor
  of Marketing and Public Relations, Juris Doctor, Graduate Diploma of Theology, Master of Business (Research))
  are LIKELY genuine archive candidates (no standalone bachelor's page exists; some names only exist as a
  major/minor within Commerce or Arts, not a standalone degree) but you must still independently verify via
  the sitemap list, a few slug variations, and the school's own "Explore programs by study area" page before
  archiving - don't archive on the coordinator's suspicion alone, get your own citable evidence.
