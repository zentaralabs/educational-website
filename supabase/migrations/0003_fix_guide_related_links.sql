-- Fix guide_related_links: its composite primary key
-- (guide_id, related_guide_id, related_university_id) forces all three
-- columns NOT NULL in Postgres, so a row could only ever exist if a guide
-- was linked to a specific OTHER guide AND a specific university at the
-- same time — it could never store an independent guide-only or
-- university-only link, which is what "manual related-content picker" (
-- PROJECT_STATUS.md Section 6.5) actually needs. No rows were ever written
-- to this table, so it's safe to replace outright.

drop table if exists guide_related_links;

create table guide_related_guides (
  guide_id uuid references guides(id) on delete cascade,
  related_guide_id uuid references guides(id) on delete cascade,
  primary key (guide_id, related_guide_id)
);

create table guide_related_universities (
  guide_id uuid references guides(id) on delete cascade,
  related_university_id uuid references universities(id) on delete cascade,
  primary key (guide_id, related_university_id)
);

alter table guide_related_guides enable row level security;
alter table guide_related_universities enable row level security;

create policy "public read" on guide_related_guides for select using (true);
create policy "staff write" on guide_related_guides for all
  using (is_staff()) with check (is_staff());

create policy "public read" on guide_related_universities for select using (true);
create policy "staff write" on guide_related_universities for all
  using (is_staff()) with check (is_staff());
