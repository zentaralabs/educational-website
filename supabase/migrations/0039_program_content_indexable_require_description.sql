-- Re-cut the `content_indexable` generated column (last cut by migration 0032)
-- to match the tightened isProgramIndexable() rule in
-- src/lib/queries/public-programs.ts.
--
-- Before: a parsed curriculum alone made a program page indexable, whatever
-- its description. After: every indexable page needs a description of at
-- least 85 words, plus either a curriculum or a filled facts table (fees + a
-- duration or English score). Measured against production on 2026-10-08 this
-- takes 1,455 of the 4,918 sitemap program pages out of the index and the
-- sitemap (30 with no description, 93 at 1-49 words, 1,332 at 50-84). The
-- pages stay live for users and internal links (`noindex, follow`).
-- See SEO_CHANGELOG.md 2026-10-08.
--
-- A generated column's expression cannot be altered in place on this
-- Postgres version, so drop and re-add (the STORED value is recomputed for
-- every row on re-add).
--
-- Rollback: re-run migration 0032.

drop index if exists programs_content_indexable_idx;
alter table programs drop column if exists content_indexable;

alter table programs
  add column content_indexable boolean
  generated always as (
    coalesce(
      array_length(regexp_split_to_array(btrim(description), '\s+'), 1), 0
    ) >= 85
    and (
      (curriculum is not null and length(btrim(curriculum)) > 0)
      or (
        (tuition_international is not null or tuition_domestic is not null)
        and (duration_years is not null or ielts_overall is not null)
      )
    )
  ) stored;

create index programs_content_indexable_idx
  on programs (content_indexable)
  where status = 'published';
