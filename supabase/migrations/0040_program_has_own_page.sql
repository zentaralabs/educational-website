-- Merge thin program pages into their university's course list.
--
-- A published program keeps its own page at /universities/[slug]/programs/[programSlug]
-- only if it has a description of at least 50 words, or an editor has set
-- `keep_own_page` (used for thin rows that still earned Google impressions).
-- Every other program is listed on the university page as a plain row and its
-- old URL permanently redirects there. Nothing is deleted: once a row gains a
-- 50+ word description, `has_own_page` flips back to true on its own.
--
-- At the time of writing this merges 460 published programs (all already
-- noindex and out of the sitemap, none with Google impressions in the 3
-- months to 2026-10-05) and keeps 8 via `keep_own_page`.
-- List: scripts/data/thin-program-merge-list-2026-10-09.tsv.
-- See SEO_CHANGELOG.md 2026-10-09.
--
-- Rollback (every page back, no code change):
--   update programs set keep_own_page = true;
-- or drop both columns after reverting the code that reads them.

alter table programs
  add column if not exists keep_own_page boolean not null default false;

alter table programs
  add column has_own_page boolean
  generated always as (
    keep_own_page
    or coalesce(
      array_length(regexp_split_to_array(btrim(description), '\s+'), 1), 0
    ) >= 50
  ) stored;

-- The 8 thin rows that had Google impressions keep their page until they get
-- a real description.
update programs p
set keep_own_page = true
from universities u
where u.id = p.university_id
  and (u.slug, p.slug) in (
    ('university-of-the-sunshine-coast', 'master-of-health-promotion'),
    ('university-of-the-sunshine-coast', 'master-of-business-administration'),
    ('university-of-the-sunshine-coast', 'bachelor-of-engineering-honours-civil-engineering'),
    ('university-of-the-sunshine-coast', 'master-of-engineering-professional'),
    ('university-of-the-sunshine-coast', 'bachelor-of-criminology-and-justice'),
    ('university-of-the-sunshine-coast', 'master-of-professional-psychology'),
    ('university-of-notre-dame-australia', 'doctor-of-physiotherapy-research'),
    ('university-of-the-sunshine-coast', 'bachelor-of-business')
  );
