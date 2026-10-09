# Plan: merge 460 thin program pages into their university's course list

Status: **proposal, nothing changed yet.** Full list: `thin-program-merge-list-2026-10-09.tsv`.

## The problem
Google's spam update (from Sep 24) and the AdSense rejection ("Low value content", Oct 4) both point at thin content. 468 published courses have a description of under 50 words (381 have none at all), but each still has its own full page built from the shared template. These are already hidden from Google Search, but visitors and AdSense reviewers can still click into them.

## Which pages
| Group | Courses | Action |
|---|---|---|
| Description under 50 words, no Google impressions in 3 months | **460** | Merge |
| Description under 50 words, **had** impressions | 8 | Keep their own page; write real descriptions for them in step 2 |

Merges by provider: Adelaide 82, Victoria 75, Wollongong 59, QUT 49, UniSC 48, Tasmania 47, Swinburne 37, Griffith 18, WSU 16, Notre Dame 11, Box Hill 7, JCU 4, and 8 small providers with 1-3 each (21 providers in all).

## What changes for a visitor
- On the university page, the course still appears in the course list with its name, level and subject, plus a link to the course on the **university's own website**. It just no longer opens a thin page of ours.
- Anyone who visits an old course address (bookmark, old link, Google) is sent automatically (permanent redirect) to that university's page, scrolled to the course list.
- Other places that list courses (subject pages, occupation pages, "related programs" on other course pages) stop linking to merged courses.

## What changes for Google and AdSense
- 460 template pages stop existing as separate pages. They were already out of Google's index and sitemap, so the indexed set doesn't change and the late-October Search Console test isn't affected.
- A reviewer browsing the site can no longer land on near-empty course pages.

## How it works (technical, short)
1. A database rule decides whether a course has its own page: a description of **50+ words**, or a manual "keep" flag (used for the 8 above). Nothing is deleted; the data stays in the database.
2. **Automatic comeback:** when someone writes a 50+ word description for a merged course, it gets its own page back with no extra work.
3. Course pages without their own page redirect to the university page; course lists show them as plain rows.

## Undo
One database update brings every page back (set the keep flag on all rows), or the code change can be reverted. No data is lost either way.

## Rollout and checks
1. Code + migration on a branch, pull request, preview check.
2. After merge: verify a sample of merged URLs redirect, the university pages list them, none of the 3,485 indexed pages changed, and the sitemap count is unchanged.
