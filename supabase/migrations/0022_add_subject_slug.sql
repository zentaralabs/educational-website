-- Slug on the subjects lookup table, for the /study/[slug] subject landing
-- pages (2026-08-27 SEO pass). One page per field of study, built from the
-- program data, targeting "study X in australia" searches.

alter table subjects add column slug text unique;

update subjects
set slug = regexp_replace(
  regexp_replace(lower(trim(name)), '\s*&\s*', '-and-', 'g'),
  '[^a-z0-9]+', '-', 'g'
);

-- Trim any leading/trailing hyphens the substitution may have left.
update subjects set slug = trim(both '-' from slug);
