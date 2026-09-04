-- Lets a visa subclass override the "Subclass NNN Visa" SERP title lead.
--
-- `/visas/[slug]` composes its <title> as "Subclass {code} Visa: ...", which
-- is correct for the rows people search by number (500, 485, 189) and was the
-- point of the 2026-09-03 title audit: the subclass number is the query, so it
-- has to appear inside the ~60 characters Google renders.
--
-- It breaks for rows whose code is a composite of variants that nobody types.
-- The bridging visa row covers subclasses 010, 020 and 030, and "Subclass
-- 010/020/030 Visa" spends the whole visible title on a string with no search
-- volume, while the actual query ("bridging visa") never appears.
--
-- Same shape as 0025 for guides and blog_posts: nullable, falls back to the
-- composed title when null, so every existing row is unaffected.

alter table visa_subclasses add column if not exists meta_title text;

comment on column visa_subclasses.meta_title is
  'Optional <title> lead for search results, replacing "Subclass {code} Visa". Falls back to the composed title.';
