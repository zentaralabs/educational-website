-- Second tranche of merged program pages, plus a per-row "merge" override.
--
-- Migration 0040 gave every program its own page only if it had a 50+ word
-- description or an editor kept it (keep_own_page). This adds the opposite
-- override, merge_into_list: an editor can fold a specific row into its
-- university's course list even though its description is long enough.
--
-- First use: 19 Western Sydney University "exit only" awards (a Graduate
-- Certificate, Diploma or Associate Degree you can only receive by leaving a
-- longer degree early; nobody can apply for them). They have 66-82 word
-- descriptions and no curriculum, none had Google impressions, none are in
-- the sitemap. The other 40 "exit only" rows are left as they are: 24 are
-- currently indexed and the rest are complete, so a name-based rule would
-- have changed the index.
--
-- Rollback: update programs set merge_into_list = false;
-- See SEO_CHANGELOG.md 2026-10-09 (second entry).

begin;

alter table programs
  add column if not exists merge_into_list boolean not null default false;

-- A generated column's expression cannot be altered in place: drop and re-add
-- inside this transaction so readers never see the column missing.
alter table programs drop column if exists has_own_page;

alter table programs
  add column has_own_page boolean
  generated always as (
    not merge_into_list
    and (
      keep_own_page
      or coalesce(
        array_length(regexp_split_to_array(btrim(description), '\s+'), 1), 0
      ) >= 50
    )
  ) stored;

update programs set merge_into_list = true
where id in (
    'ee7fe867-ab34-45f8-a40c-c53ba96c9458',
    '98be2c2b-fa2b-41b1-b22e-b564df32eb9f',
    'f4cdf9a4-42d7-4729-8e6e-370a33ee0915',
    'bc2e9a14-1720-4e45-80e4-5c472a51e524',
    '215f0ee4-027e-42d6-bcb2-8de877067d31',
    '7053d070-bb22-4581-8fda-b8760d47cfe0',
    '0a8f8ddd-6b85-462a-bbeb-a352768c766a',
    '3858e2f2-f653-4e0b-8078-62db191e5060',
    'b97d9a44-7489-4034-b7c2-1ee9e19b5b48',
    'd7a03fab-68bb-4f41-9ec1-435f4d0b5305',
    '6d70d5ca-278c-4534-930a-055c5a1d4f29',
    'd161397a-162e-4ce1-9a6b-f9544203ea28',
    '9d21cd1f-a6f4-4f4e-8527-3f9b2d48b5ac',
    '6097f259-8dde-4cde-89f0-0a5e340e6dfb',
    'fc8139e9-6dfc-4d9d-b604-8c00663aca9c',
    '3c31ebfd-d543-4fc3-90cf-0a007f269c6d',
    '172c570a-9f07-4d95-bee8-83fe7381aa40',
    '7df96951-ba43-4e83-92cc-2207d72c22d1',
    '4fef9c96-9d09-4f43-89a7-e0dc47230aa8'
);

commit;
