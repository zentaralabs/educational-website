-- Stored generated column mirroring src/lib/queries/public-programs.ts's
-- isProgramIndexable(): a program page carries enough of its own content to be
-- worth indexing when it has a parsed curriculum, OR an "About this program"
-- description of at least 100 words.
--
-- Purpose: let sitemap.ts filter on this in SQL instead of pulling every
-- program's full description + curriculum text (~2MB) just to compute it in
-- JS, which blew past Next's 2MB Data Cache limit.

alter table programs
  add column content_indexable boolean
  generated always as (
    (curriculum is not null and length(btrim(curriculum)) > 0)
    or coalesce(
      array_length(regexp_split_to_array(btrim(description), '\s+'), 1), 0
    ) >= 100
  ) stored;

create index programs_content_indexable_idx
  on programs (content_indexable)
  where status = 'published';
