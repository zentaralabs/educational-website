-- Human-readable program slugs, so program URLs stop exposing raw UUIDs.
--   before: /universities/{uni}/programs/{uuid}
--   after:  /universities/{uni}/programs/{program-slug}
--
-- Old UUID URLs keep working forever: the [programSlug] route detects a UUID
-- param, looks the program up by id, and 301-redirects to its slug URL. The
-- UUID stays the immutable primary key, so that redirect is permanent and
-- needs no separate redirect table.
--
-- Slugs are unique per university (the university slug namespaces them), not
-- globally — "Master of Data Science" can exist at several universities.

alter table programs add column slug text;

-- Backfill from the program name, deduping within each university by appending
-- -2, -3, ... to later collisions. Mirrors src/lib/slug.ts's slugify().
with base as (
  select
    id,
    university_id,
    coalesce(
      nullif(
        regexp_replace(
          regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g'),
          '(^-+|-+$)', '', 'g'
        ),
        ''
      ),
      'program'
    ) as base_slug
  from programs
),
numbered as (
  select
    id,
    base_slug,
    row_number() over (partition by university_id, base_slug order by id) as rn
  from base
)
update programs p
set slug = case when n.rn = 1 then n.base_slug else n.base_slug || '-' || n.rn end
from numbered n
where p.id = n.id;

alter table programs alter column slug set not null;
create unique index programs_university_id_slug_key on programs (university_id, slug);
