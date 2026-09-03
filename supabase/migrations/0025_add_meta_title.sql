-- Separates the SERP title from the on-page headline for guides and blog posts.
--
-- Until now `title` served as both, and Google renders roughly 60 characters
-- of a result title. A live audit found 20 published headlines above that,
-- topping out at 90 characters ("What the Genuine Student Test Actually Asks
-- (and How It's Different From the Old GTE Rule)"), so the part of the
-- headline that carried the query was being cut out of the snippet.
--
-- Editorial headlines should stay as long as they need to be. `meta_title` is
-- the short version used only in <title>/og:title, and falls back to `title`
-- when null, so nothing changes for the rows that already fit.

alter table guides add column if not exists meta_title text;
alter table blog_posts add column if not exists meta_title text;

comment on column guides.meta_title is
  'Optional short <title> for search results (<= 60 chars). Falls back to title.';
comment on column blog_posts.meta_title is
  'Optional short <title> for search results (<= 60 chars). Falls back to title.';
