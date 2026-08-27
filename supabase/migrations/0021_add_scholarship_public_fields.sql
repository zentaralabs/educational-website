-- Public-facing fields for the /scholarships section (2026-08-27 product review
-- asked for a real scholarships area, not just chips on university pages).
--
-- slug: needed for per-scholarship URLs and the sitemap.
-- description: markdown "what this is / how it works / who it's for" body,
--   the added value over just linking to the official page.
-- study_level: a coarse filter facet (Undergraduate / Postgraduate / Research / Any).
-- separate_application: the review's explicit "separate application: yes/no"
--   ask — many Australian scholarships are automatic on admission.

alter table scholarships
  add column slug text unique,
  add column description text,
  add column study_level text,
  add column separate_application boolean;

-- Backfill slugs for the rows that already exist so the not-null-in-practice
-- assumption in the public query holds. New rows set it explicitly.
update scholarships
set slug = regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g')
where slug is null;
