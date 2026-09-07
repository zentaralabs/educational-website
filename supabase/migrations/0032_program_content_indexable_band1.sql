-- Re-cut the `content_indexable` generated column (originally migration 0023)
-- to match the loosened isProgramIndexable() rule in
-- src/lib/queries/public-programs.ts.
--
-- Band 1 of a staged roll-down of the description word threshold (100 -> 85
-- -> 70 -> 60), each band deployed once GSC confirms the previously-indexed
-- pages rank without dragging site-wide quality. The rule now also requires a
-- filled facts table (fees + a duration or English score), so a real
-- description on an otherwise-empty program shell is not indexed.
--
-- A generated column's expression cannot be altered in place on this
-- Postgres version, so drop and re-add (the STORED value is recomputed for
-- every row on re-add).

drop index if exists programs_content_indexable_idx;
alter table programs drop column if exists content_indexable;

alter table programs
  add column content_indexable boolean
  generated always as (
    (curriculum is not null and length(btrim(curriculum)) > 0)
    or (
      coalesce(
        array_length(regexp_split_to_array(btrim(description), '\s+'), 1), 0
      ) >= 85
      and (tuition_international is not null or tuition_domestic is not null)
      and (duration_years is not null or ielts_overall is not null)
    )
  ) stored;

create index programs_content_indexable_idx
  on programs (content_indexable)
  where status = 'published';
