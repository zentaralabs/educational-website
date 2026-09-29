-- Step A: take description-only program pages out of the index.
-- NOT a migration. Run by hand in the Supabase SQL editor, after migration
-- 0038 has been applied AND the code that reads `seo_noindex` is deployed.
--
-- "Description-only" = indexable (content_indexable) but with no curriculum,
-- i.e. the pages that rely on a short description alone. Measured 2026-09-29:
-- 520 of 5,438 indexable programs, 495 of them at seven universities
-- (Sydney 259, Melbourne 132, Griffith 38, UTS 26, Victoria 14, Monash 13,
-- Western Sydney 13).
--
-- Pages with real Google impressions should stay indexed. Put each one in the
-- KEEP list below as (university slug, program slug), taken from the Search
-- Console 3-month Pages export. Leave it empty to flag all of them.

-- 1) PREVIEW (read-only). Check the per-university counts before applying.
select u.name, count(*) as will_be_noindex
from programs p
join universities u on u.id = p.university_id
where p.status = 'published'
  and p.content_indexable
  and (p.curriculum is null or btrim(p.curriculum) = '')
  and not p.seo_noindex
group by u.name
order by will_be_noindex desc;

-- 2) APPLY. Uncomment the block once the preview looks right.
--
-- begin;
--
-- create temp table keep (university_slug text, program_slug text) on commit drop;
-- -- insert into keep values ('university-of-sydney', 'some-program-slug');
--
-- update programs p
-- set seo_noindex = true
-- from universities u
-- where u.id = p.university_id
--   and p.status = 'published'
--   and p.content_indexable
--   and (p.curriculum is null or btrim(p.curriculum) = '')
--   and not p.seo_noindex
--   and not exists (
--     select 1 from keep k
--     where k.university_slug = u.slug and k.program_slug = p.slug
--   );
--
-- commit;

-- 3) UNDO (reverse everything this script did):
-- update programs set seo_noindex = false where seo_noindex;
