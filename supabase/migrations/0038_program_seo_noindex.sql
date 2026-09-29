-- Manual per-row noindex override for program pages.
--
-- `content_indexable` (migration 0032) is a generated column, so it cannot be
-- switched off for individual rows. This adds a plain boolean that can:
-- true = the program page renders `robots: noindex, follow` and is left out of
-- /sitemap-programs.xml, whatever its content. The page stays live for users
-- and internal links.
--
-- Backwards compatible: the column defaults to false, so no row changes state
-- when this migration runs, and the currently deployed code ignores it.
-- RUN THIS BEFORE deploying the code that reads it, otherwise the program page
-- and sitemap queries will error on a missing column.

alter table programs
  add column if not exists seo_noindex boolean not null default false;
